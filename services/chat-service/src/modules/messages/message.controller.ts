import { Response } from 'express';
import { AuthRequest } from '../../middleware/auth';
import { MessageService } from './message.service';
import { ConversationService } from '../conversations/conversation.service';

export class MessageController {
  static async list(req: AuthRequest, res: Response) {
    try {
      const { conversationId } = req.params;
      const { limit, before } = req.query;
      const userId = req.user!.sub;

      // Access control: Verify participant
      const isPart = await ConversationService.isParticipant(conversationId, userId);
      if (!isPart) {
        return res.status(403).json({ error: 'Access denied: You are not a participant in this conversation.' });
      }

      const beforeDate = before ? new Date(before as string) : undefined;
      const limitCount = limit ? parseInt(limit as string, 10) : 50;

      const messages = await MessageService.listMessages(conversationId, limitCount, beforeDate);
      res.json(messages);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  static async markDelivered(req: AuthRequest, res: Response) {
    try {
      const { messageId } = req.params;
      const userId = req.user!.sub;

      await MessageService.markAsDelivered(messageId, userId);
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  static async markDeliveredBatch(req: AuthRequest, res: Response) {
    try {
      const { messageIds } = req.body;
      const userId = req.user!.sub;

      if (!Array.isArray(messageIds) || messageIds.length === 0) {
        return res.status(400).json({ error: 'messageIds must be a non-empty array' });
      }

      await MessageService.markAsDeliveredBatch(messageIds, userId);
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  static async markRead(req: AuthRequest, res: Response) {
    try {
      const { conversationId } = req.params;
      const userId = req.user!.sub;

      await MessageService.markAsRead(conversationId, userId);
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  static async create(req: AuthRequest, res: Response) {
    try {
      const { conversationId, content, clientMessageId } = req.body;
      const userId = req.user!.sub;

      if (!conversationId || !content) {
        return res.status(400).json({ error: 'conversationId and content are required.' });
      }

      // Access control: Verify participant
      const isPart = await ConversationService.isParticipant(conversationId, userId);
      if (!isPart) {
        return res.status(403).json({ error: 'Access denied: You are not a participant in this conversation.' });
      }

      const message = await MessageService.sendMessage(conversationId, userId, content, clientMessageId);
      res.status(201).json(message);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }
}
