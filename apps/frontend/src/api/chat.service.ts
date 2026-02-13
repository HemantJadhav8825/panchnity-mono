import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { getAccessToken, setAccessToken } from './client';
import { env } from '../config/env';

const CHAT_API_URL = env.NEXT_PUBLIC_CHAT_API_URL;
const MAIN_API_URL = env.NEXT_PUBLIC_API_URL;

const chatClient: AxiosInstance = axios.create({
  baseURL: CHAT_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Reuse the same token logic as the main client
chatClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add Response Interceptor for 401 handling
chatClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (!refreshToken) throw new Error('No refresh token');

        // We use the main API for refresh
        const { data } = await axios.post(`${MAIN_API_URL}/auth/refresh`, { refreshToken });
        
        // CRITICAL: Update the shared access token state
        setAccessToken(data.accessToken);
        
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        return chatClient(originalRequest);
      } catch (err) {
        return Promise.reject(err);
      }
    }
    return Promise.reject(error);
  }
);

export interface Participant {
  id: string;
  username: string;
  displayName: string;
  avatar?: string;
}

export interface ParticipantSettings {
  userId: string;
  isMuted: boolean;
  isArchived: boolean;
  lastReadAt?: string;
}

export interface Conversation {
  id: string;
  participants: (string | Participant)[];
  participantSettings?: ParticipantSettings[];
  unreadCount?: number;
  lastMessageAt: string;
  createdAt: string;
  updatedAt: string;
  lastMessageContent?: string;
  lastMessageSenderId?: string;
}

export interface Message {
  id: string;
  clientMessageId?: string;
  conversationId: string;
  senderId: string;
  content: string;
  status?: 'sending' | 'sent' | 'failed';
  deliveredAt?: string;
  readAt?: string;
  error?: string;
  createdAt: string;
}

export interface UserSettings {
  userId: string;
  showReadReceipts: boolean;
  muteUnreadBadges: boolean;
}

export const chatService = {
  async listConversations(includeArchived: boolean = false): Promise<Conversation[]> {
    const response = await chatClient.get('/v1/conversations', {
      params: { includeArchived }
    });
    return response.data;
  },

  async createConversation(recipientId: string): Promise<Conversation> {
    const response = await chatClient.post('/v1/conversations', { 
      recipientId 
    });
    return response.data;
  },

  async updateConversationSettings(conversationId: string, settings: { isMuted?: boolean; isArchived?: boolean }): Promise<Conversation> {
    const response = await chatClient.patch(`/v1/conversations/${conversationId}/settings`, settings);
    return response.data;
  },

  async listMessages(conversationId: string, limit: number = 50, offset: number = 0): Promise<Message[]> {
    const response = await chatClient.get(`/v1/messages/${conversationId}`, {
      params: { limit, offset }
    });
    return response.data;
  },

  async sendMessage(conversationId: string, content: string, clientMessageId?: string): Promise<Message> {
    const response = await chatClient.post('/v1/messages', {
      conversationId,
      content,
      clientMessageId
    });
    return response.data;
  },

  async markMessageDelivered(messageId: string): Promise<void> {
    await chatClient.post(`/v1/messages/${messageId}/delivered`);
  },

  async markMessagesDelivered(messageIds: string[]): Promise<void> {
    if (messageIds.length === 0) return;
    await chatClient.post('/v1/messages/delivered/batch', { messageIds });
  },

  async markConversationRead(conversationId: string): Promise<void> {
    await chatClient.put(`/v1/conversations/${conversationId}/read`);
  },

  async getGlobalSettings(): Promise<UserSettings> {
    const response = await chatClient.get('/v1/settings');
    return response.data;
  },

  async updateGlobalSettings(settings: { showReadReceipts?: boolean; muteUnreadBadges?: boolean }): Promise<UserSettings> {
    const response = await chatClient.patch('/v1/settings', settings);
    return response.data;
  }
};

export default chatClient;
