import { ConversationModel } from '../../models/conversation.model';
import { ModerationService } from '../moderation/moderation.service';
import { MessageModel } from '../../models/message.model';

export class ConversationService {
  static async listConversations(userId: string, includeArchived: boolean = false) {
    const query: any = { participants: userId };
    
    if (!includeArchived) {
      query['participantSettings'] = {
        $not: {
          $elemMatch: { userId, isArchived: true }
        }
      };
    }

    const conversations = await ConversationModel.find(query).sort({ lastMessageAt: -1 }).lean();

    const conversationIds = conversations.map(c => c._id);

    // optimize: fetch last messages for all conversations in one go
    const lastMessages = await MessageModel.aggregate([
      { $match: { conversationId: { $in: conversationIds } } },
      { $sort: { createdAt: -1 } },
      { $group: { 
          _id: '$conversationId', 
          lastMessage: { $first: '$$ROOT' } 
      }}
    ]);

    const lastMessageMap = new Map(lastMessages.map(item => [item._id.toString(), item.lastMessage]));

    // Populate unread counts
    const enrichedConversations = await Promise.all(conversations.map(async (conv) => {
      const userSettings = conv.participantSettings?.find((p: any) => p.userId === userId);
      const lastReadAt = userSettings?.lastReadAt || new Date(0);
      
      const lastMessage = lastMessageMap.get(conv._id.toString());
      
      let unreadCount = 0;

      // Optimization: If last message is older than or equal to last read, count is 0.
      // This skips the DB query for the vast majority of conversations (read ones).
      if (conv.lastMessageAt && new Date(conv.lastMessageAt) <= new Date(lastReadAt)) {
        unreadCount = 0;
      } else {
        const count = await MessageModel.countDocuments({
          conversationId: conv._id,
          createdAt: { $gt: lastReadAt },
          senderId: { $ne: userId } // Don't count own messages as unread
        });
        unreadCount = Math.max(0, count); // Safeguard against negative counts
      }

      return {
        ...conv,
        id: conv._id, // Ensure id is present for frontend
        unreadCount,
        lastMessageContent: lastMessage?.content || '',
        lastMessageSenderId: lastMessage?.senderId
      };
    }));

    return enrichedConversations;
  }

  static async markAsRead(conversationId: string, userId: string) {
    const conversation = await ConversationModel.findById(conversationId);
    if (!conversation) throw new Error('Conversation not found');

    const isParticipant = conversation.participants.some(p => p.toString() === userId);
    if (!isParticipant) throw new Error('Unauthorized');

    let userSettings = conversation.participantSettings.find(s => s.userId === userId);
    if (!userSettings) {
      // Should ideally exist, but safe fallback
      userSettings = { userId, isMuted: false, isArchived: false, lastReadAt: new Date() };
      conversation.participantSettings.push(userSettings);
    } else {
      userSettings.lastReadAt = new Date();
    }

    await conversation.save();
    return { success: true, conversationId, lastReadAt: userSettings.lastReadAt };
  }

  static async updateParticipantSettings(conversationId: string, userId: string, settings: { isMuted?: boolean; isArchived?: boolean }) {
    const conversation = await ConversationModel.findById(conversationId);
    if (!conversation) throw new Error('Conversation not found');
    
    // Handle both string and ObjectId participants
    const isParticipant = conversation.participants.some(
      p => p.toString() === userId
    );
    if (!isParticipant) throw new Error('Unauthorized');

    let userSettings = conversation.participantSettings.find(s => s.userId === userId);
    if (!userSettings) {
      userSettings = { userId, isMuted: false, isArchived: false, lastReadAt: new Date(0) };
      conversation.participantSettings.push(userSettings);
    }

    if (settings.isMuted !== undefined) userSettings.isMuted = settings.isMuted;
    if (settings.isArchived !== undefined) userSettings.isArchived = settings.isArchived;

    await conversation.save();
    return conversation;
  }

  static async findOrCreateConversation(user1: string, user2: string) {
    if (user1 === user2) {
      throw new Error('Cannot create a conversation with yourself.');
    }

    // Check if either user has blocked the other
    const isBlocked = await ModerationService.isBlocked(user1, user2);
    if (isBlocked) {
      throw new Error('Cannot create conversation with blocked user');
    }

    const participants = [user1, user2].sort();
    
    // Attempt to find existing
    let conversation = await ConversationModel.findOne({
      participants: { $all: participants },
    });

    if (!conversation) {
      conversation = await ConversationModel.create({
        participants,
      });
    }

    return conversation;
  }

  static async findConversationById(conversationId: string) {
    return ConversationModel.findById(conversationId);
  }

  static async isParticipant(conversationId: string, userId: string) {
    const conversation = await ConversationModel.findById(conversationId);
    return conversation?.participants.includes(userId) || false;
  }
}
