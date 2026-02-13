import { BlockedUserModel } from '../../models/blocked-user.model';
import { ConversationReportModel, ReportReason } from '../../models/conversation-report.model';
import { structuredLog } from '@panchnity/utils';

export class ModerationService {
  /**
   * Block a user. Creates bidirectional block (both users cannot interact).
   */
  static async blockUser(blockerId: string, blockedUserId: string): Promise<void> {
    if (blockerId === blockedUserId) {
      throw new Error('Cannot block yourself');
    }

    try {
      // Create single block record (Blocker -> Blocked)
      // We no longer create the reverse record to prevent the blocked user from unblocking themselves
      await BlockedUserModel.create({ blockerId, blockedUserId });

      structuredLog('info', 'moderation:block', 'User blocked successfully', {
        blockerId,
        blockedUserId,
      });
    } catch (error: any) {
      // If duplicate key error (11000), block already exists
      if (error.code === 11000) {
        structuredLog('warn', 'moderation:block_duplicate', 'Block already exists', {
          blockerId,
          blockedUserId,
        });
        return; // Idempotent - don't throw error
      }
      throw error;
    }
  }

  /**
   * Unblock a user. Removes bidirectional block.
   */
  static async unblockUser(blockerId: string, blockedUserId: string): Promise<void> {
    // Only remove the block initialized by this user
    await BlockedUserModel.deleteOne({ blockerId, blockedUserId });

    structuredLog('info', 'moderation:unblock', 'User unblocked successfully', {
      blockerId,
      blockedUserId,
    });
  }

  /**
   * Check if userId1 has blocked userId2 (or vice versa due to bidirectional).
   */
  static async isBlocked(userId1: string, userId2: string): Promise<boolean> {
    const block = await BlockedUserModel.findOne({
      $or: [
        { blockerId: userId1, blockedUserId: userId2 },
        { blockerId: userId2, blockedUserId: userId1 },
      ],
    });

    return !!block;
  }

  /**
   * Get list of users blocked by the given user.
   */
  static async getBlockedUsers(userId: string): Promise<string[]> {
    const blocks = await BlockedUserModel.find({ blockerId: userId }).select('blockedUserId');
    return blocks.map((b) => b.blockedUserId);
  }

  /**
   * Report a conversation for moderation review.
   */
  static async reportConversation(
    reporterId: string,
    conversationId: string,
    reportedUserId: string,
    reason: ReportReason,
    additionalDetails?: string
  ): Promise<void> {
    if (reporterId === reportedUserId) {
      throw new Error('Cannot report yourself');
    }

    await ConversationReportModel.create({
      conversationId,
      reporterId,
      reportedUserId,
      reason,
      additionalDetails,
      status: 'pending',
    });

    structuredLog('info', 'moderation:report', 'Conversation reported', {
      reporterId,
      conversationId,
      reportedUserId,
      reason,
    });
  }

  /**
   * Get reports (for admin review - optional for this milestone).
   */
  static async getReports(filters?: {
    conversationId?: string;
    reporterId?: string;
    status?: string;
  }) {
    const query: any = {};
    if (filters?.conversationId) query.conversationId = filters.conversationId;
    if (filters?.reporterId) query.reporterId = filters.reporterId;
    if (filters?.status) query.status = filters.status;

    return ConversationReportModel.find(query).sort({ createdAt: -1 });
  }
}
