import { useState, useEffect, useCallback, useRef } from 'react';
import { chatService, Message } from '@/api/chat.service';
import { useCurrentUser } from './useCurrentUser';
import { socketService } from '@/api/socket.service';

export function useChat(conversationId: string | null) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const [onlineStatus, setOnlineStatus] = useState<Map<string, { status: 'online' | 'offline', lastSeen?: string }>>(new Map());
  const { user: currentUser } = useCurrentUser();
  
  // Ref for pagination
  const offsetRef = useRef(0);
  const [hasMore, setHasMore] = useState(true);

  const [clearedAt, setClearedAt] = useState<number | null>(() => {
    if (!conversationId) return null;
    const val = localStorage.getItem(`chat_cleared_${conversationId}`);
    return val ? parseInt(val, 10) : null;
  });

  // Typing expiry timer ref
  const typingTimersRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

  const fetchMessages = useCallback(async (isLoadMore = false) => {
    if (!conversationId) return;

    try {
      if (!isLoadMore) setIsLoading(true);
      
      const limit = 50;
      const currentOffset = isLoadMore ? offsetRef.current : 0;
      
      const data = await chatService.listMessages(conversationId, limit, currentOffset);
      
      // Filter by clearedAt if exists
      const filteredData = clearedAt 
        ? data.filter(msg => new Date(msg.createdAt).getTime() > clearedAt)
        : data;

      if (isLoadMore) {
        setMessages(prev => [...prev, ...filteredData]);
        offsetRef.current += data.length;
      } else {
        setMessages(filteredData);
        offsetRef.current = data.length;
      }
      
      setHasMore(data.length === limit && filteredData.length > 0);
      setError(null);

      // Post-fetch: Mark as read and delivered
      if (document.visibilityState === 'visible' && !isLoadMore) {
        chatService.markConversationRead(conversationId);
      }
      
      // Batch mark delivered for any newly fetched messages not sent by self
      const undeliveredIds = filteredData
        .filter(msg => msg.senderId !== currentUser?.id && !msg.deliveredAt)
        .map(msg => msg.id);
      
      if (undeliveredIds.length > 0) {
        chatService.markMessagesDelivered(undeliveredIds);
      }

    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load messages');
    } finally {
      if (!isLoadMore) setIsLoading(false);
    }
  }, [conversationId, clearedAt, currentUser?.id]);

  useEffect(() => {
    setMessages([]);
    offsetRef.current = 0;
    setHasMore(true);
    
    // Clear typing timers when conversation changes
    typingTimersRef.current.forEach(timer => clearTimeout(timer));
    typingTimersRef.current.clear();
    setTypingUsers(new Set());
    
    const storedClearedAt = conversationId ? localStorage.getItem(`chat_cleared_${conversationId}`) : null;
    setClearedAt(storedClearedAt ? parseInt(storedClearedAt, 10) : null);

    if (conversationId) {
      fetchMessages();
    }
  }, [conversationId, fetchMessages]);

  useEffect(() => {
    if (!conversationId || document.visibilityState === 'hidden') return;
    
    const handleFocus = () => {
      chatService.markConversationRead(conversationId);
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [conversationId]);

  // SOCKET LOGIC
  const resyncMessages = useCallback(async () => {
    if (!conversationId || !messages.length) return;
    
    try {
      // Fetch latest messages to see if we missed any during disconnection
      const latestMessages = await chatService.listMessages(conversationId, 20, 0);
      const filtered = clearedAt 
        ? latestMessages.filter(msg => new Date(msg.createdAt).getTime() > clearedAt)
        : latestMessages;
      setMessages(prev => deduplicateMessages(prev, filtered));
    } catch (err) {
      console.warn('Resync failed', err);
    }
  }, [conversationId, messages.length, clearedAt]);

  useEffect(() => {
    socketService.on('reconnected', resyncMessages);
    return () => {
      socketService.off('reconnected', resyncMessages);
    };
  }, [resyncMessages]);

  useEffect(() => {
    const handlePresenceUpdate = ({ userId, status, lastSeen }: { userId: string, status: 'online' | 'offline', lastSeen?: string }) => {
      setOnlineStatus(prev => {
        const next = new Map(prev);
        next.set(userId, { status, lastSeen });
        return next;
      });
    };

    const handleTypingStart = ({ userId, conversationId: typingConvId }: { userId: string, conversationId: string }) => {
      if (typingConvId !== conversationId) return;
      
      setTypingUsers(prev => {
        const next = new Set(prev);
        next.add(userId);
        return next;
      });

      // Auto-expire typing indicator after 7 seconds if no stop event follows
      if (typingTimersRef.current.has(userId)) {
        clearTimeout(typingTimersRef.current.get(userId));
      }
      const timeout = setTimeout(() => {
        setTypingUsers(prev => {
          const next = new Set(prev);
          next.delete(userId);
          return next;
        });
        typingTimersRef.current.delete(userId);
      }, 7000);
      typingTimersRef.current.set(userId, timeout);
    };

    const handleTypingStop = ({ userId, conversationId: typingConvId }: { userId: string, conversationId: string }) => {
      if (typingConvId !== conversationId) return;
      
      setTypingUsers(prev => {
        const next = new Set(prev);
        next.delete(userId);
        return next;
      });

      if (typingTimersRef.current.has(userId)) {
        clearTimeout(typingTimersRef.current.get(userId));
        typingTimersRef.current.delete(userId);
      }
    };

    const handleMessageDelivered = ({ messageId, deliveredAt: time }: { messageId: string, deliveredAt: string }) => {
      setMessages(prev => prev.map(msg => 
        msg.id === messageId ? { ...msg, deliveredAt: time } : msg
      ));
    };

    const handleMessageRead = ({ conversationId: readConvId, readAt: time }: { conversationId: string, readAt: string }) => {
      if (readConvId !== conversationId) return;
      setMessages(prev => prev.map(msg => 
        !msg.readAt && msg.senderId === currentUser?.id ? { ...msg, readAt: time, deliveredAt: msg.deliveredAt || time } : msg
      ));
    };

    const handlePresenceInitial = (userIds: string[]) => {
      setOnlineStatus(prev => {
        const next = new Map(prev);
        userIds.forEach(uid => {
          if (!next.has(uid) || next.get(uid)?.status !== 'online') {
            next.set(uid, { status: 'online' });
          }
        });
        return next;
      });
    };

    const syncPresence = () => {
      socketService.emit('presence:sync', {});
    };

    socketService.on('presence:initial', handlePresenceInitial);
    socketService.on('presence:update', handlePresenceUpdate);
    socketService.on('typing:start', handleTypingStart);
    socketService.on('typing:stop', handleTypingStop);
    socketService.on('message:delivered', handleMessageDelivered);
    socketService.on('message:read', handleMessageRead);
    socketService.on('reconnected', syncPresence);

    // Initial sync attempt
    syncPresence();

    return () => {
      socketService.off('presence:initial', handlePresenceInitial);
      socketService.off('presence:update', handlePresenceUpdate);
      socketService.off('typing:start', handleTypingStart);
      socketService.off('typing:stop', handleTypingStop);
      socketService.off('message:delivered', handleMessageDelivered);
      socketService.off('message:read', handleMessageRead);
      socketService.off('reconnected', syncPresence);
      // Clear all typing timers on unmount
      typingTimersRef.current.forEach(timer => clearTimeout(timer));
      typingTimersRef.current.clear();
    };
  }, [conversationId, currentUser?.id]);
  
// Helper to deduplicate messages by ID and handle optimistic replacements
  const deduplicateMessages = (current: Message[], incoming: Message[]): Message[] => {
    const messageMap = new Map<string, Message>();
    
    // Add current messages first
    current.forEach(msg => messageMap.set(msg.id, msg));
    
    // Process incoming messages
    incoming.forEach(msg => {
      // If we have an optimistic message with this clientMessageId, replace it
      if (msg.clientMessageId) {
        const optimisticId = Array.from(messageMap.keys()).find(id => id === msg.clientMessageId);
        if (optimisticId) {
          messageMap.delete(optimisticId);
        }
      }

      // If matches existing ID, overwrite
      if (messageMap.has(msg.id)) {
         messageMap.set(msg.id, msg); 
         return;
      }

      // Standard add
      messageMap.set(msg.id, msg);
    });

    // Sort logic: Decending by createdAt
    return Array.from(messageMap.values()).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  };

  useEffect(() => {
    const handleNewMessage = (newMessage: Message) => {
      if (newMessage.conversationId !== conversationId) return;
      
      // Filter by clearedAt
      if (clearedAt && new Date(newMessage.createdAt).getTime() <= clearedAt) return;

      // Stop typing on new message
      setTypingUsers(prev => {
        const next = new Set(prev);
        next.delete(newMessage.senderId);
        return next;
      });

      setMessages(prev => deduplicateMessages(prev, [newMessage]));

      // If visible, mark as read
      if (document.visibilityState === 'visible') {
        chatService.markConversationRead(conversationId);
      } else {
        // If not visible, at least mark as delivered
        chatService.markMessageDelivered(newMessage.id);
      }
    };

    socketService.on('message:new', handleNewMessage);
    return () => {
      socketService.off('message:new', handleNewMessage);
    };
  }, [conversationId, currentUser?.id, clearedAt]);

  // SMART POLLING LOGIC - SAFETY BACKUP
  useEffect(() => {
    if (!conversationId) return;

    const POLL_INTERVAL_MS = 30_000; // 30 seconds - backup when socket disconnected
    const intervalId = setInterval(async () => {
      // Skip polling if socket is connected
      if (socketService.isConnected()) return;
      
      if (document.visibilityState === 'hidden') return;

      try {
        const latestMessages = await chatService.listMessages(conversationId, 20, 0);
        const filtered = clearedAt 
          ? latestMessages.filter(msg => new Date(msg.createdAt).getTime() > clearedAt)
          : latestMessages;
        setMessages(prev => deduplicateMessages(prev, filtered));
      } catch (err) {
        console.warn('Polling skipped due to error', err);
      }
    }, POLL_INTERVAL_MS);

    return () => clearInterval(intervalId);
  }, [conversationId, currentUser?.id, clearedAt]);

  const sendMessage = async (content: string, retryClientMessageId?: string) => {
    if (!conversationId || !content.trim() || !currentUser) return;

    const clientMessageId = retryClientMessageId || crypto.randomUUID();
    
    if (retryClientMessageId) {
      // If retrying, update existing message to 'sending' and clear previous error
      setMessages(prev => prev.map(msg => 
        msg.clientMessageId === retryClientMessageId 
          ? { ...msg, status: 'sending', error: undefined } 
          : msg
      ));
    } else {
      const optimisticMessage: Message = {
        id: clientMessageId,
        clientMessageId,
        conversationId,
        senderId: currentUser.id,
        content,
        status: 'sending',
        createdAt: new Date().toISOString(),
      };
      // Optimistic update
      setMessages(prev => [optimisticMessage, ...prev]);
    }

    try {
      setIsSending(true);
      const realMessage = await chatService.sendMessage(conversationId, content, clientMessageId);
      
      // Update with real message and 'sent' status
      setMessages(prev => prev.map(msg => 
        (msg.id === clientMessageId || msg.clientMessageId === clientMessageId)
          ? { ...realMessage, status: 'sent' } 
          : msg
      ));
      return realMessage;
    } catch (err: any) {
      const rawError = err.response?.data?.error || err.message || 'Failed to send';
      
      // Make error messages user-friendly
      let userFriendlyError = rawError;
      if (rawError.includes('blocked') || rawError.includes('Cannot send message')) {
        userFriendlyError = 'Cannot send message - user may be blocked';
      } else if (rawError.includes('Too many') || rawError.includes('slow down')) {
        userFriendlyError = 'Sending too fast - please wait';
      } else if (rawError.includes('too long')) {
        userFriendlyError = 'Message is too long';
      }
      
      // Mark as failed instead of removing
      setMessages(prev => prev.map(msg => 
        (msg.id === clientMessageId || msg.clientMessageId === clientMessageId)
          ? { ...msg, status: 'failed', error: userFriendlyError } 
          : msg
      ));
      throw err;
    } finally {
      setIsSending(false);
    }
  };

  const setTyping = useCallback((isTyping: boolean) => {
    if (!conversationId) return;
    socketService.emit(isTyping ? 'typing:start' : 'typing:stop', { conversationId });
  }, [conversationId]);

  const clearHistory = useCallback(() => {
    if (!conversationId) return;
    const now = Date.now();
    localStorage.setItem(`chat_cleared_${conversationId}`, now.toString());
    setClearedAt(now);
    setMessages([]);
  }, [conversationId]);

  return {
    messages,
    isLoading,
    isSending,
    error,
    hasMore,
    typingUsers,
    onlineStatus,
    loadMore: () => fetchMessages(true),
    sendMessage,
    setTyping,
    clearHistory
  };
}

