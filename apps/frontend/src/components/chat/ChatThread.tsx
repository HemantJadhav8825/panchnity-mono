import React from 'react';
import { ProfileAvatar } from '@/components/ui/ProfileAvatar';
import { Text } from '@/components/ui/Text';
import { MessageBubble } from './MessageBubble';
import { MessageInput } from './MessageInput';
import { BlockUserButton } from './BlockUserButton';
import { ReportConversationModal } from './ReportConversationModal';
import { moderationService } from '@/api/moderation.service';
import { ChevronLeft, Info, Archive, Bell, BellOff, Trash2, Shield, Flag } from 'lucide-react';

interface Message {
  id: string;
  content: string;
  isSelf: boolean;
  timestamp: string;
}

import { useChat } from '@/hooks/useChat';
import { useUsers } from '@/hooks/useUsers';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { socketService } from '@/api/socket.service';

import { chatService, Conversation } from '@/api/chat.service';
import { useConversationsContext } from '@/context/ConversationsContext';

interface ChatThreadProps {
  conversation?: Conversation;
  onBack?: () => void;
}

export const ChatThread: React.FC<ChatThreadProps> = ({
  conversation,
  onBack,
}) => {
  const { 
    messages, 
    sendMessage, 
    isLoading, 
    isSending, 
    typingUsers, 
    onlineStatus, 
    setTyping,
    clearHistory
  } = useChat(conversation?.id || null);
  const { markAsRead } = useConversationsContext();
  const { users } = useUsers(50);
  const { user: currentUser } = useCurrentUser();
  
  const [showSettings, setShowSettings] = React.useState(false);
  const [isMuted, setIsMuted] = React.useState(false);
  const [isArchived, setIsArchived] = React.useState(false);
  const [isBlocked, setIsBlocked] = React.useState(false);
  const [showReportModal, setShowReportModal] = React.useState(false);

  React.useEffect(() => {
    if (conversation && currentUser) {
      const settings = conversation.participantSettings?.find(s => s.userId === currentUser.id);
      setIsMuted(settings?.isMuted || false);
      setIsArchived(settings?.isArchived || false);
    }
  }, [conversation, currentUser]);

  // Mark as read logic
  React.useEffect(() => {
    if (!conversation?.id) return;

    const markRead = () => {
      if (document.visibilityState === 'visible') {
        markAsRead(conversation.id);
      }
    };

    // Mark on mount/id change
    markRead();

    // Mark on window focus
    const onFocus = () => markRead();
    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onFocus);

    return () => {
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onFocus);
    };
  }, [conversation?.id, markAsRead]);

  const handleToggleMute = async () => {
    if (!conversation) return;
    try {
      await chatService.updateConversationSettings(conversation.id, { isMuted: !isMuted });
      setIsMuted(!isMuted);
    } catch (err) {
      console.error('Failed to update mute status', err);
    }
  };

  const handleToggleArchive = async () => {
    if (!conversation) return;
    try {
      await chatService.updateConversationSettings(conversation.id, { isArchived: !isArchived });
      setIsArchived(!isArchived);
      if (!isArchived && onBack) onBack(); // If archiving, go back
    } catch (err) {
      console.error('Failed to update archive status', err);
    }
  };

  // Resolve the other participant's info from the conversation participants list
  const getOtherParticipant = () => {
    if (!conversation || !currentUser) return null;
    const other = conversation.participants.find((p: any) => {
      const pId = typeof p === 'string' ? p : (p.id || p._id);
      const currentId = currentUser.id || (currentUser as any)._id;
      return pId !== currentId;
    });
    
    if (!other) return null;
    if (typeof other !== 'string') return other as any;

    return users.find(u => (u.id || (u as any)._id) === other);
  };

  const otherUser = getOtherParticipant();
  const chatName = otherUser?.displayName || otherUser?.username || 'Chat';
  const chatAvatar = otherUser?.avatar;

  // Check if user is blocked
  React.useEffect(() => {
    const checkBlockStatus = async () => {
      if (!otherUser?.id) return;
      try {
        const blockedUsers = await moderationService.getBlockedUsers();
        setIsBlocked(blockedUsers.includes(otherUser.id));
      } catch (err) {
        console.error('Failed to check block status', err);
      }
    };
    checkBlockStatus();
  }, [otherUser?.id]);

  // Listen for real-time block/unblock events
  React.useEffect(() => {
    if (!otherUser?.id) return;

    const handleUserBlocked = ({ userId }: { userId: string }) => {
      if (userId === otherUser.id) {
        setIsBlocked(true);
        // Optionally close the conversation after a brief delay
        if (onBack) {
          setTimeout(() => onBack(), 1500);
        }
      }
    };

    const handleUserUnblocked = ({ userId }: { userId: string }) => {
      if (userId === otherUser.id) {
        setIsBlocked(false);
      }
    };

    socketService.on('user:blocked', handleUserBlocked);
    socketService.on('user:unblocked', handleUserUnblocked);

    return () => {
      socketService.off('user:blocked', handleUserBlocked);
      socketService.off('user:unblocked', handleUserUnblocked);
    };
  }, [otherUser?.id, onBack]);

  const otherUserPresence = otherUser ? onlineStatus.get(otherUser.id) : null;
  const isOnline = otherUserPresence?.status === 'online';

  // Track initial read time to freeze the "New Messages" line location
  const [initialLastReadAt, setInitialLastReadAt] = React.useState<Date | null>(null);
  React.useEffect(() => {
    if (conversation?.id && currentUser) {
      const settings = conversation.participantSettings?.find(s => s.userId === currentUser.id);
      // Only set once per conversation load to avoid jumping line
      setInitialLastReadAt(prev => {
        // If we switch conversations, reset
        return settings?.lastReadAt ? new Date(settings.lastReadAt) : new Date(0);
      });
    }
  }, [conversation?.id, currentUser, conversation?.participantSettings]);

  // Calm Utility: Group messages by sender and time (5-min threshold)
  const groupedMessages = messages.reduce((acc: any[], msg, i) => {
    const prevMsg = messages[i + 1]; // We are in flex-col-reverse
    const nextMsg = messages[i - 1];
    
    const currDate = new Date(msg.createdAt);
    const prevDate = prevMsg ? new Date(prevMsg.createdAt) : null;
    
    // Day Separator Check
    const isNewDay = !prevDate || currDate.toDateString() !== prevDate.toDateString();
    const isLargeGap = prevDate && (currDate.getTime() - prevDate.getTime() > 30 * 60 * 1000);
    
    // Grouping Check
    const isSameSender = prevMsg && prevMsg.senderId === msg.senderId;
    const isWithinThreshold = prevDate && (currDate.getTime() - prevDate.getTime() < 5 * 60 * 1000);
    const isFirstInGroup = isNewDay || isLargeGap || !isSameSender || !isWithinThreshold;
    
    const isLastInGroup = !nextMsg || nextMsg.senderId !== msg.senderId || 
                         (new Date(nextMsg.createdAt).getTime() - currDate.getTime() > 5 * 60 * 1000) ||
                         (new Date(nextMsg.createdAt).getTime() - currDate.getTime() > 30 * 60 * 1000);

    if (isNewDay) {
      acc.push({ type: 'day', date: currDate.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' }) });
    } else if (isLargeGap) {
      acc.push({ type: 'gap', time: currDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) });
    }

    // New Messages Divider Logic:
    // Insert IF:
    // 1. We have an initialLastReadAt
    // 2. This message is NEWER than initialLastReadAt
    // 3. The PREVIOUS message (which is older in the array index, but chronologically before this one?)
    //    Actually, we are iterating reducing from 0 (newest?)
    //    Wait, messages usually come from useChat sorted? 
    //    "const prevMsg = messages[i + 1]" implies messages[0] is newest (reverse chrono).
    //    So we are building the list from NEWEST to OLDEST? 
    //    If so, acc.push appends to the list.
    //    If the render is flex-col-reverse, then the first item in array is at the BOTTOM.
    //    So array[0] is indeed the newest message and should be at the START of the visual list (bottom).
    
    //    Let's check useChat. Typically it fits standard chat: array is chronological, but UI reverses?
    //    Or array is reverse chronological?
    
    //    If "prevMsg = messages[i+1]" is chronologically BEFORE "msg", then messages[i] is NEWER than messages[i+1].
    //    So messages[0] is the NEWEST.
    //    
    //    So we are traversing from Newest -> Oldest.
    //    
    //    Divider should appear AFTER the last "New" message we encounter?
    //    Or rather, between the Oldest New Message and the Newest Old Message.
    
    //    Let's stick to: "Is this message unread?" -> msg.createdAt > initialLastReadAt.
    //    "Is the NEXT processed message (i.e. prevMsg, older) READ?" -> prevMsg.createdAt <= initialLastReadAt.
    //    If so, insert Divider AFTER pushing this message (which means visually ABOVE it in column-reverse).
    
    const isUnread = initialLastReadAt && currDate > initialLastReadAt && msg.senderId !== currentUser?.id;
    const isPrevRead = !prevMsg || (initialLastReadAt && new Date(prevMsg.createdAt) <= initialLastReadAt) || prevMsg.senderId === currentUser?.id; // count own messages as "read" for divider purposes
    
    // Actually, if I sent the last message, I shouldn't see "New Messages" under my own message.
    // "New Messages" line marks where *other people's* messages started accumulating.

    acc.push({
      ...msg,
      type: 'message',
      isFirstInGroup,
      isLastInGroup
    });

    if (isUnread && isPrevRead && initialLastReadAt && initialLastReadAt.getTime() > 0) {
       acc.push({ type: 'new-messages-divider' });
    }

    return acc;
  }, []);

  return (
    <div className="h-full flex flex-col bg-background min-h-0">
      {/* Header */}
      <header className="h-16 lg:h-20 border-b border-border flex items-center justify-between px-4 lg:px-6 flex-shrink-0 z-10 bg-background">
        <div className="flex items-center gap-3">
          {onBack && (
            <button onClick={onBack} className="lg:hidden p-1 -ml-1">
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}
          <div className="relative">
            <ProfileAvatar src={chatAvatar} name={chatName} size="sm" />
            {isOnline && (
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-primary border-2 border-background rounded-full" />
            )}
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <Text weight="semibold" className="text-sm cursor-pointer">{chatName}</Text>
              {isMuted && <BellOff className="w-3 h-3 text-muted-foreground/40" />}
            </div>
            <Text size="xs" muted className="text-[10px] uppercase tracking-wider opacity-60">
              {isOnline ? (
                <span className="text-primary font-medium">Online now</span>
              ) : otherUserPresence?.lastSeen ? (
                `Last seen ${new Date(otherUserPresence.lastSeen).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
              ) : (
                'Quietly away'
              )}
            </Text>
          </div>
        </div>
        
        <div className="relative">
          <button 
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 hover:bg-muted rounded-full transition-colors"
          >
            <Info className="w-5 h-5 text-muted-foreground/50" />
          </button>

          {showSettings && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-background border border-border rounded-xl shadow-xl z-50 p-1 animate-in fade-in zoom-in-95 duration-200">
              <button 
                onClick={handleToggleMute}
                className="w-full text-left px-3 py-2 hover:bg-muted rounded-lg flex items-center gap-3 transition-colors"
              >
                {isMuted ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
                <Text size="sm">{isMuted ? 'Unmute' : 'Mute'}</Text>
              </button>
              <button 
                onClick={handleToggleArchive}
                className="w-full text-left px-3 py-2 hover:bg-muted rounded-lg flex items-center gap-3 transition-colors"
              >
                <Archive className="w-4 h-4" />
                <Text size="sm">{isArchived ? 'Unarchive' : 'Archive'}</Text>
              </button>
              <div className="h-px bg-border my-1" />
              <button 
                onClick={() => {
                  if (confirm('Clear local history? This only affects this device.')) {
                    clearHistory();
                    setShowSettings(false);
                  }
                }}
                className="w-full text-left px-3 py-2 hover:bg-red-500/10 text-red-500 rounded-lg flex items-center gap-3 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                <Text size="sm" className="text-red-500">Clear local history</Text>
              </button>
              <div className="h-px bg-border my-1" />
              {otherUser && (
                <>
                  <div className="px-3 py-2">
                    <BlockUserButton
                      userId={otherUser.id}
                      userName={chatName}
                      isBlocked={isBlocked}
                      onBlockChange={(blocked) => {
                        setIsBlocked(blocked);
                        setShowSettings(false);
                        if (blocked && onBack) onBack();
                      }}
                    />
                  </div>
                  <button 
                    onClick={() => {
                      setShowReportModal(true);
                      setShowSettings(false);
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-orange-500/10 text-orange-600 dark:text-orange-400 rounded-lg flex items-center gap-3 transition-colors"
                  >
                    <Flag className="w-4 h-4" />
                    <Text size="sm" className="text-orange-600 dark:text-orange-400">Report Conversation</Text>
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 lg:p-6 no-scrollbar flex flex-col-reverse relative min-h-0">
        {/* Typing Indicators */}
        {otherUser && typingUsers.has(otherUser.id) && (
          <div className="absolute bottom-4 left-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
             <div className="bg-muted/30 px-3 py-1.5 rounded-2xl rounded-bl-none flex items-center gap-1.5">
                <div className="flex gap-1">
                  <span className="w-1 h-1 bg-primary/40 rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <span className="w-1 h-1 bg-primary/40 rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <span className="w-1 h-1 bg-primary/40 rounded-full animate-bounce" />
                </div>
                <Text className="text-[10px] text-muted-foreground font-medium italic opacity-60">
                  {chatName} is thinking...
                </Text>
             </div>
          </div>
        )}

        {groupedMessages.length > 0 ? (
          groupedMessages.map((item, idx) => (
            item.type === 'day' ? (
              <div key={`day-${idx}`} className="flex justify-center my-8">
                <div className="px-3 py-1 bg-muted/30 rounded-full">
                  <Text size="xs" muted className="text-[10px] uppercase tracking-widest font-bold opacity-40">
                    {item.date}
                  </Text>
                </div>
              </div>
            ) : item.type === 'gap' ? (
              <div key={`gap-${idx}`} className="flex justify-center my-4">
                <Text size="xs" muted className="text-[10px] uppercase tracking-widest opacity-20 font-medium">
                  {item.time}
                </Text>
              </div>
            ) : item.type === 'new-messages-divider' ? (
              <div key={`divider-${idx}`} className="flex items-center gap-4 my-6 opacity-80 animate-in fade-in zoom-in-50 duration-500">
                <div className="h-px bg-red-500/20 flex-1" />
                <div className="bg-red-500/10 text-red-500 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm border border-red-500/20">
                  New Messages
                </div>
                <div className="h-px bg-red-500/20 flex-1" />
              </div>
            ) : (
              <MessageBubble 
                key={item.id}
                content={item.content}
                isSelf={item.senderId === currentUser?.id}
                status={item.status}
                deliveredAt={item.deliveredAt}
                readAt={item.readAt}
                error={item.error}
                timestamp={new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                isFirstInGroup={item.isFirstInGroup}
                isLastInGroup={item.isLastInGroup}
                onRetry={() => sendMessage(item.content, item.clientMessageId)}
              />
            )
          ))
        ) : isLoading ? (
          <div className="h-full flex items-center justify-center opacity-20">
            <Text>Listening to the silence...</Text>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-4">
            <ProfileAvatar src={chatAvatar} name={chatName} size="xl" />
            <div>
              <Text weight="bold" className="text-xl">{chatName}</Text>
              <Text size="sm" muted className="opacity-40 italic">Nature is always here for you</Text>
            </div>
          </div>
        )}
      </div>

      {/* Input or Blocked Message */}
      <div className="flex-shrink-0">
        {isBlocked ? (
          <div className="p-4 lg:p-6 border-t border-border bg-muted/20">
            <div className="text-center py-4">
              <Text size="sm" muted className="italic">
                You cannot send messages to this user
              </Text>
            </div>
          </div>
        ) : (
          <MessageInput 
            onSend={sendMessage} 
            onTypingChange={setTyping}
          />
        )}
      </div>

      {/* Report Modal */}
      {otherUser && (
        <ReportConversationModal
          conversationId={conversation?.id || ''}
          reportedUserId={otherUser.id}
          reportedUserName={chatName}
          isOpen={showReportModal}
          onClose={() => setShowReportModal(false)}
          onSuccess={() => {
            // TODO: Show success toast notification
            // Example: toast.success('Report submitted successfully');
          }}
        />
      )}
    </div>
  );
};
