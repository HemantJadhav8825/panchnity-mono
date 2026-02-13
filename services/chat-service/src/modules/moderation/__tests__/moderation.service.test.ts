import { ModerationService } from '../moderation.service';
import { BlockedUserModel } from '../../../models/blocked-user.model';
import { ConversationReportModel } from '../../../models/conversation-report.model';

// Mock the models
jest.mock('../../../models/blocked-user.model');
jest.mock('../../../models/conversation-report.model');

describe('ModerationService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('blockUser', () => {
    it('should create single block record', async () => {
      const mockCreate = jest.fn().mockResolvedValue({});
      (BlockedUserModel.create as jest.Mock) = mockCreate;

      await ModerationService.blockUser('user1', 'user2');

      expect(mockCreate).toHaveBeenCalledTimes(1);
      expect(mockCreate).toHaveBeenCalledWith({
        blockerId: 'user1',
        blockedUserId: 'user2',
      });
    });

    it('should throw error when blocking yourself', async () => {
      await expect(
        ModerationService.blockUser('user1', 'user1')
      ).rejects.toThrow('Cannot block yourself');
    });

    it('should handle duplicate block gracefully', async () => {
      const mockCreate = jest.fn().mockRejectedValue({ code: 11000 });
      (BlockedUserModel.create as jest.Mock) = mockCreate;

      // Should not throw
      await expect(
        ModerationService.blockUser('user1', 'user2')
      ).resolves.not.toThrow();
    });
  });

  describe('unblockUser', () => {
    it('should remove block relationship', async () => {
      const mockDeleteOne = jest.fn().mockResolvedValue({});
      (BlockedUserModel.deleteOne as jest.Mock) = mockDeleteOne;

      await ModerationService.unblockUser('user1', 'user2');

      expect(mockDeleteOne).toHaveBeenCalledTimes(1);
      expect(mockDeleteOne).toHaveBeenCalledWith({
        blockerId: 'user1',
        blockedUserId: 'user2',
      });
    });
  });

  describe('isBlocked', () => {
    it('should return true if block exists', async () => {
      (BlockedUserModel.findOne as jest.Mock) = jest
        .fn()
        .mockResolvedValue({ blockerId: 'user1', blockedUserId: 'user2' });

      const result = await ModerationService.isBlocked('user1', 'user2');

      expect(result).toBe(true);
    });

    it('should return false if no block exists', async () => {
      (BlockedUserModel.findOne as jest.Mock) = jest.fn().mockResolvedValue(null);

      const result = await ModerationService.isBlocked('user1', 'user2');

      expect(result).toBe(false);
    });
  });

  describe('getBlockedUsers', () => {
    it('should return list of blocked user IDs', async () => {
      const mockFind = jest.fn().mockReturnValue({
        select: jest.fn().mockResolvedValue([
          { blockedUserId: 'user2' },
          { blockedUserId: 'user3' },
        ]),
      });
      (BlockedUserModel.find as jest.Mock) = mockFind;

      const result = await ModerationService.getBlockedUsers('user1');

      expect(result).toEqual(['user2', 'user3']);
      expect(mockFind).toHaveBeenCalledWith({ blockerId: 'user1' });
    });
  });

  describe('reportConversation', () => {
    it('should create a report with all fields', async () => {
      const mockCreate = jest.fn().mockResolvedValue({});
      (ConversationReportModel.create as jest.Mock) = mockCreate;

      await ModerationService.reportConversation(
        'reporter1',
        'conv123',
        'reported1',
        'harassment',
        'This user is harassing me'
      );

      expect(mockCreate).toHaveBeenCalledWith({
        conversationId: 'conv123',
        reporterId: 'reporter1',
        reportedUserId: 'reported1',
        reason: 'harassment',
        additionalDetails: 'This user is harassing me',
        status: 'pending',
      });
    });

    it('should throw error when reporting yourself', async () => {
      await expect(
        ModerationService.reportConversation(
          'user1',
          'conv123',
          'user1',
          'harassment'
        )
      ).rejects.toThrow('Cannot report yourself');
    });
  });
});
