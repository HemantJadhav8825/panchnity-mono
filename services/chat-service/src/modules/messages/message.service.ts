import { MessageModel } from '../../models/message.model';
import { ConversationModel } from '../../models/conversation.model';
import { UserSettingsModel } from '../../models/user-settings.model';
import { socketService } from '../../socket';
import { GuardrailService } from '../../security/guardrails';
import { structuredLog } from '@panchnity/utils';
import { ModerationService } from '../moderation/moderation.service';
import { featureFlagService } from '../../config/feature-flags';

export class MessageService {
  static async listMessages(conversationId: string, limit: number = 50, beforeDate?: Date) {
    const query: any = { conversationId };
    
    // Pagination support
    if (beforeDate) {
      query.createdAt = { $lt: beforeDate };
    }

    return MessageModel.find(query)
      .sort({ createdAt: -1 })
      .limit(limit);
  }

  static async markAsDelivered(messageId: string, userId: string) {
    // Check feature flag
    if (!featureFlagService.isEnabled('ENABLE_READ_RECEIPTS')) return;

    const message = await MessageModel.findById(messageId);
    if (!message) return;

    if (message.senderId === userId) return; // Sender doesn't mark own as delivered

    if (!message.deliveredAt) {
      message.deliveredAt = new Date();
      await message.save();

      // Notify sender
      socketService.emitToUser(message.senderId, 'message:delivered', {
        messageId: message._id,
        conversationId: message.conversationId,
        deliveredAt: message.deliveredAt,
      });
    }
  }

  static async markAsDeliveredBatch(messageIds: string[], userId: string) {
    // Check feature flag
    if (!featureFlagService.isEnabled('ENABLE_READ_RECEIPTS')) return;

    const now = new Date();
    
    // Find messages that need to be marked as delivered
    const messages = await MessageModel.find({
      _id: { $in: messageIds },
      senderId: { $ne: userId }, // Don't mark own messages
      deliveredAt: { $exists: false }
    });

    if (messages.length === 0) return;

    // Batch update
    await MessageModel.updateMany(
      { _id: { $in: messages.map(m => m._id) } },
      { $set: { deliveredAt: now } }
    );

    // Notify senders
    messages.forEach(message => {
      socketService.emitToUser(message.senderId, 'message:delivered', {
        messageId: message._id,
        conversationId: message.conversationId,
        deliveredAt: now,
      });
    });
  }

  static async markAsRead(conversationId: string, userId: string) {
    // Check feature flag
    if (!featureFlagService.isEnabled('ENABLE_READ_RECEIPTS')) return;

    const now = new Date();
    
    // Check if the reader has read receipts enabled first
    const userSettings = await UserSettingsModel.findOne({ userId });
    const showReceipts = userSettings?.showReadReceipts ?? true;

    // Atomic update: mark all unread messages as read in one operation
    const result = await MessageModel.updateMany(
      {
        conversationId,
        senderId: { $ne: userId },
        readAt: { $exists: false }
      },
      { 
        $set: { readAt: now },
        $setOnInsert: { deliveredAt: now } // Only set deliveredAt if not already set
      }
    );

    // If no messages were updated, nothing to notify
    if (result.modifiedCount === 0) return;

    // Only notify if receipts are enabled
    if (showReceipts) {
      // Fetch the messages that were just updated to get sender IDs
      const updatedMessages = await MessageModel.find({
        conversationId,
        senderId: { $ne: userId },
        readAt: now
      }).select('senderId');

      const senderIds = Array.from(new Set(updatedMessages.map(m => m.senderId)));
      senderIds.forEach(senderId => {
        socketService.emitToUser(senderId, 'message:read', {
          conversationId,
          readAt: now,
          readerId: userId
        });
      });
    }
  }

  static async sendMessage(conversationId: string, senderId: string, content: string, clientMessageId?: string) {
    if (!content.trim()) {
      structuredLog('warn', 'message:send_failure', 'Empty message content', { userId: senderId, conversationId });
      throw new Error('Message content cannot be empty.');
    }

    // Guardrail: Length Check
    if (!GuardrailService.isLengthValid(content)) {
      structuredLog('warn', 'message:send_failure', 'Message exceeds max length', { 
        userId: senderId, 
        conversationId, 
        contentLength: content.length 
      });
      throw new Error(`Message is too long (max ${2000} characters).`);
    }

    // Guardrail: Rate Limiting
    if (!GuardrailService.checkRateLimit(senderId, conversationId)) {
      structuredLog('warn', 'message:send_failure', 'Rate limit exceeded', { userId: senderId, conversationId });
      throw new Error('Too many messages. Please slow down.');
    }

    // Guardrail: Sanitization
    const sanitizedContent = GuardrailService.sanitizeContent(content.trim());

    // Get conversation to check participants
    const conversation = await ConversationModel.findById(conversationId);
    if (!conversation) {
      throw new Error('Conversation not found');
    }

    // Get recipient ID
    const recipientId = conversation.participants.find((p: string) => p !== senderId);
    if (!recipientId) {
      throw new Error('Invalid conversation');
    }

    // Guardrail: Block Check
    const isBlocked = await ModerationService.isBlocked(senderId, recipientId as string);
    if (isBlocked) {
      structuredLog('warn', 'message:send_failure', 'Blocked user attempted to send message', {
        userId: senderId,
        conversationId,
        recipientId,
      });
      throw new Error('Cannot send message to this user');
    }

    // Idempotency check
    if (clientMessageId) {
      const existingMessage = await MessageModel.findOne({ clientMessageId });
      if (existingMessage) {
        return existingMessage;
      }
    }

    // Create message
    const message = await MessageModel.create({
      conversationId,
      clientMessageId,
      senderId,
      content: sanitizedContent,
    });

    structuredLog('info', 'message:sent', 'Message sent successfully', {
      userId: senderId,
      conversationId,
      messageId: message._id.toString(),
      clientMessageId,
    });

    // Update conversation lastMessageAt (reuse conversation from block check)
    await ConversationModel.findByIdAndUpdate(conversationId, {
      lastMessageAt: message.createdAt,
    });

    // Emit real-time event to participants
    if (conversation && conversation.participants) {
      conversation.participants.forEach((participant: any) => {
        // Handle both populated and unpopulated/string IDs
        const participantId = participant.id || participant.toString(); // assuming Mongoose populated or string
        // Actually participants in ConversationModel are usually ObjectId refs.
        // If unpopulated, they are ObjectIds. toString() works.
        // If populated, they are objects with _id on them.
        
        socketService.emitToUser(participantId.toString(), 'message:new', {
          ...message.toObject(),
          id: message._id.toString() // Ensure ID is string for frontend
        });
      });
    }

    return message;
  }
}
