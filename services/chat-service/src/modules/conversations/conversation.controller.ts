import { Response } from 'express';
import { AuthRequest } from '../../middleware/auth';
import { ConversationService } from './conversation.service';
import { socketService } from '../../socket';

export class ConversationController {
  static async list(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.sub;
      const includeArchived = req.query.includeArchived === 'true';
      const conversations = await ConversationService.listConversations(userId, includeArchived);
      res.json(conversations);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  static async updateSettings(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.sub;
      const { id } = req.params;
      const { isMuted, isArchived } = req.body;

      const conversation = await ConversationService.updateParticipantSettings(id, userId, { isMuted, isArchived });
      res.json(conversation);
    } catch (err: any) {
      const status = err.message === 'Unauthorized' ? 403 : (err.message === 'Conversation not found' ? 404 : 400);
      res.status(status).json({ error: err.message });
    }
  }

  static async markAsRead(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.sub;
      const { id } = req.params;
      
      const result = await ConversationService.markAsRead(id, userId);
      
      
      // Emit socket event for real-time update
      socketService.emitToUser(userId, 'conversation:read', { conversationId: id, userId });
      
      res.json(result);
    } catch (err: any) {
      const status = err.message === 'Unauthorized' ? 403 : (err.message === 'Conversation not found' ? 404 : 400);
      res.status(status).json({ error: err.message });
    }
  }

  static async create(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.sub;
      const { recipientId } = req.body;

      if (!recipientId) {
        return res.status(400).json({ error: 'recipientId is required' });
      }

      const conversation = await ConversationService.findOrCreateConversation(userId, recipientId);
      res.status(201).json(conversation);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }
}
