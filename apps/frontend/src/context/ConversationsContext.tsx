"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { chatService, Conversation, Message, UserSettings } from '../api/chat.service';
import { useAuth } from './AuthContext';
import { socketService } from '../api/socket.service';

interface ConversationsContextType {
  conversations: Conversation[];
  includeArchived: boolean;
  setIncludeArchived: (include: boolean) => void;
  isLoading: boolean;
  error: string | null;
  onlineUsers: Set<string>;
  globalSettings: UserSettings | null;
  setGlobalSettings: (settings: UserSettings | null) => void;
  activeConversationId: string | null;
  setActiveConversationId: (id: string | null) => void;
  markAsRead: (conversationId: string) => Promise<void>;
  refresh: () => Promise<void>;
}

const ConversationsContext = createContext<ConversationsContextType | undefined>(undefined);

export const ConversationsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [includeArchived, setIncludeArchived] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const [globalSettings, setGlobalSettings] = useState<UserSettings | null>(null);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();

  const fetchConversations = useCallback(async () => {
    if (!isAuthenticated) return;

    try {
      setIsLoading(true);
      const data = await chatService.listConversations(includeArchived);
      setConversations(data);
      setError(null);
    } catch (err: any) {
      console.error('Failed to fetch conversations', err);
      setError(err.response?.data?.error || 'Failed to load conversations');
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, includeArchived]);

  const markAsRead = useCallback(async (conversationId: string) => {
    if (!isAuthenticated) return;

    // Direct local update for instant UI feedback
    setConversations(prev => prev.map(conv => 
      conv.id === conversationId ? { ...conv, unreadCount: 0 } : conv
    ));

    try {
      await chatService.markConversationRead(conversationId);
    } catch (err) {
      console.error('Failed to mark conversation as read', err);
      // Optional: rollback on error? Usually not needed for read status
    }
  }, [isAuthenticated]);

  // Fetch Global Settings
  useEffect(() => {
    if (authLoading || !isAuthenticated) return;
    
    chatService.getGlobalSettings()
      .then(settings => {
        setGlobalSettings(settings);
      })
      .catch(err => console.error('Failed to fetch global settings', err));
  }, [isAuthenticated, authLoading]);

  // Initial Fetch
  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
        setIsLoading(false);
        setConversations([]);
        return;
    }
    fetchConversations();
  }, [fetchConversations, authLoading, isAuthenticated]);

  // Socket Logic
  useEffect(() => {
    if (!user?.id) return;

    const handlePresenceUpdate = ({ userId, status }: { userId: string, status: 'online' | 'offline' }) => {
      setOnlineUsers(prev => {
        const next = new Set(prev);
        if (status === 'online') next.add(userId);
        else next.delete(userId);
        return next;
      });
    };

    const handlePresenceInitial = (userIds: string[]) => {
      setOnlineUsers(new Set(userIds));
    };

    const syncPresence = () => {
      socketService.emit('presence:sync', {});
    };


    const handleNewMessage = (message: Message) => {
      const { conversationId, senderId, content } = message;
      const currentUserId = user.id;
      
      setConversations(prev => {
        const index = prev.findIndex(c => c.id === conversationId);
        
        if (index === -1) {
          fetchConversations(); // New conversation
          return prev;
        } 
        
        const updated = [...prev];
        const conv = { ...updated[index] };
        
        conv.lastMessageAt = new Date().toISOString(); 
        
        if (content) {
          conv.lastMessageContent = content;
          conv.lastMessageSenderId = senderId;
        }

        // Increment unread count if:
        // 1. Message is not from self
        // 2. This is NOT the active conversation
        if (senderId !== currentUserId && conversationId !== activeConversationId) {
          conv.unreadCount = (conv.unreadCount || 0) + 1;
        }

        updated.splice(index, 1);
        updated.unshift(conv);
        return updated;
      });
    };

    socketService.on('presence:initial', handlePresenceInitial);
    socketService.on('presence:update', handlePresenceUpdate);
    socketService.on('reconnected', syncPresence);
    socketService.on('message:new', handleNewMessage);
    
    syncPresence();

    return () => {
      socketService.off('presence:initial', handlePresenceInitial);
      socketService.off('presence:update', handlePresenceUpdate);
      socketService.off('reconnected', syncPresence);
      socketService.off('message:new', handleNewMessage);
    };
  }, [user?.id, fetchConversations, activeConversationId]);

  return (
    <ConversationsContext.Provider value={{
      conversations,
      includeArchived,
      setIncludeArchived,
      isLoading,
      error,
      onlineUsers,
      globalSettings,
      setGlobalSettings,
      activeConversationId,
      setActiveConversationId,
      markAsRead,
      refresh: fetchConversations
    }}>
      {children}
    </ConversationsContext.Provider>
  );
};

export const useConversationsContext = () => {
  const context = useContext(ConversationsContext);
  if (context === undefined) {
    throw new Error('useConversationsContext must be used within a ConversationsProvider');
  }
  return context;
};
