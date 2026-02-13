import chatClient from './chat.service';

export interface ReportData {
  conversationId: string;
  reportedUserId: string;
  reason: 'harassment' | 'spam' | 'inappropriate' | 'other';
  additionalDetails?: string;
}

export const moderationService = {
  async blockUser(blockedUserId: string): Promise<void> {
    await chatClient.post('/v1/moderation/block', { blockedUserId });
  },

  async unblockUser(blockedUserId: string): Promise<void> {
    await chatClient.delete(`/v1/moderation/block/${blockedUserId}`);
  },

  async getBlockedUsers(): Promise<string[]> {
    const response = await chatClient.get<{ blockedUsers: string[] }>('/v1/moderation/blocked');
    return response.data.blockedUsers;
  },

  async reportConversation(data: ReportData): Promise<void> {
    await chatClient.post('/v1/moderation/report', data);
  },
};
