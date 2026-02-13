import { Request, Response } from 'express';
import { ModerationService } from './moderation.service';
import { z } from 'zod';
import { structuredLog } from '@panchnity/utils';
import { getIO } from '../../socket';

const BlockUserSchema = z.object({
  blockedUserId: z.string().min(1),
});

const ReportConversationSchema = z.object({
  conversationId: z.string().min(1),
  reportedUserId: z.string().min(1),
  reason: z.enum(['harassment', 'spam', 'inappropriate', 'other']),
  additionalDetails: z.string().max(1000).optional(),
});

export class ModerationController {
  static async blockUser(req: Request, res: Response) {
    try {
      const userId = (req as any).user.sub;
      const { blockedUserId } = BlockUserSchema.parse(req.body);

      await ModerationService.blockUser(userId, blockedUserId);

      // Emit real-time event to both users
      const io = getIO();
      io.to(userId).emit('user:blocked', { userId: blockedUserId });
      io.to(blockedUserId).emit('user:blocked', { userId });

      res.status(200).json({ message: 'User blocked successfully' });
    } catch (error: any) {
      structuredLog('error', 'moderation:block_error', 'Error blocking user', {
        userId: (req as any).user?.sub,
        error: error.message,
      });
      res.status(400).json({ error: error.message });
    }
  }

  static async unblockUser(req: Request, res: Response) {
    try {
      const userId = (req as any).user.sub;
      const { blockedUserId } = req.params;

      if (!blockedUserId) {
        return res.status(400).json({ error: 'blockedUserId is required' });
      }

      await ModerationService.unblockUser(userId, blockedUserId);

      // Emit real-time event to both users
      const io = getIO();
      io.to(userId).emit('user:unblocked', { userId: blockedUserId });
      io.to(blockedUserId).emit('user:unblocked', { userId });

      res.status(200).json({ message: 'User unblocked successfully' });
    } catch (error: any) {
      structuredLog('error', 'moderation:unblock_error', 'Error unblocking user', {
        userId: (req as any).user?.sub,
        error: error.message,
      });
      res.status(400).json({ error: error.message });
    }
  }

  static async getBlockedUsers(req: Request, res: Response) {
    try {
      const userId = (req as any).user.sub;
      const blockedUsers = await ModerationService.getBlockedUsers(userId);

      res.status(200).json({ blockedUsers });
    } catch (error: any) {
      structuredLog('error', 'moderation:get_blocked_error', 'Error fetching blocked users', {
        userId: (req as any).user?.sub,
        error: error.message,
      });
      res.status(500).json({ error: 'Failed to fetch blocked users' });
    }
  }

  static async reportConversation(req: Request, res: Response) {
    try {
      const userId = (req as any).user.sub;
      const { conversationId, reportedUserId, reason, additionalDetails } =
        ReportConversationSchema.parse(req.body);

      await ModerationService.reportConversation(
        userId,
        conversationId,
        reportedUserId,
        reason,
        additionalDetails
      );

      res.status(201).json({ message: 'Report submitted successfully' });
    } catch (error: any) {
      structuredLog('error', 'moderation:report_error', 'Error reporting conversation', {
        userId: (req as any).user?.sub,
        error: error.message,
      });
      res.status(400).json({ error: error.message });
    }
  }
}


