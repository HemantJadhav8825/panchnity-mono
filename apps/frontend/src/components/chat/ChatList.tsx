import React from 'react';
import { ChatListItem } from './ChatListItem';
import { Text } from '@/components/ui/Text';
import { ChevronLeft, Search, PlusSquare, Settings2, Archive } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useUsers } from '@/hooks/useUsers';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { UserAvatarWithLabel } from '@/components/ui/UserAvatarWithLabel';
import { ProfileAvatar } from '@/components/ui/ProfileAvatar';
import { EmptyQuiet } from '@/illustrations/components/EmptyQuiet';
import { GlobalChatSettings } from './GlobalChatSettings';

import { useConversations } from '@/hooks/useConversations';

interface ChatListProps {
  activeChatId?: string;
  onChatSelect: (id: string, isUserSelection?: boolean) => void;
}

export const ChatList: React.FC<ChatListProps> = ({ 
  activeChatId,
  onChatSelect 
}) => {
  const { users, isLoading: isLoadingUsers, isEmpty: isUsersEmpty } = useUsers(50);
  const { 
    conversations, 
    isLoading: isLoadingChats, 
    onlineUsers,
    globalSettings,
    includeArchived,
    setIncludeArchived
  } = useConversations();
  const { user: currentUser } = useCurrentUser();
  const [showGlobalSettings, setShowGlobalSettings] = React.useState(false);

  const isLoading = isLoadingUsers || isLoadingChats;

  // ... [Loading skeleton remains the same] ...

  // Filter out current user to show others in the list
  const displayUsers = users.filter(u => u.id !== currentUser?.id);

  // Helper to resolve conversation participant info
  const resolveConversationInfo = (conv: any) => {
    const otherId = conv.participants.find((p: any) => (typeof p === 'string' ? p : p.id) !== currentUser?.id);
    const otherUser = users.find(u => u.id === (typeof otherId === 'string' ? otherId : otherId?.id));
    const participantSettings = conv.participantSettings?.find((s: any) => s.userId === currentUser?.id);
    
    return {
       id: conv.id,
       otherUserId: otherUser?.id,
       name: otherUser?.displayName || otherUser?.username || 'Quiet User',
       avatar: otherUser?.avatar,
       isMuted: participantSettings?.isMuted || false,
       unreadCount: conv.unreadCount || 0,
       lastMessage: conv.lastMessageContent || 'Start the conversation',
       timestamp: new Date(conv.lastMessageAt).toLocaleDateString([], { month: 'short', day: 'numeric' })
    };
  };

  return (
    <div className="h-full flex flex-col bg-background lg:border-r border-border relative">
      {showGlobalSettings && <GlobalChatSettings onClose={() => setShowGlobalSettings(false)} />}
      
      {/* Header section */}
      <div className="p-4 lg:p-6 pb-2 lg:pb-4 flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <Link href="/" className="p-2 -ml-2 hover:bg-muted rounded-full transition-colors outline-none focus-visible:ring-2 focus-visible:ring-primary/20">
            <ChevronLeft className="w-5 h-5 text-muted-foreground/50" />
          </Link>
          <div className="flex-1">
            <Text weight="medium" className="text-lg text-foreground/80">Messages</Text>
          </div>
          <div className="flex items-center gap-1">
            <button 
              onClick={() => setShowGlobalSettings(true)}
              className="p-2 hover:bg-muted rounded-full transition-colors outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
            >
              <Settings2 className="w-5 h-5 text-muted-foreground/30" />
            </button>
            <button className="p-2 hover:bg-muted rounded-full transition-colors outline-none focus-visible:ring-2 focus-visible:ring-primary/20">
              <PlusSquare className="w-5 h-5 text-muted-foreground/30" />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
            <button 
                onClick={() => onChatSelect('requests')}
                className="flex-1 flex items-center justify-between px-3 py-2 hover:bg-muted/50 rounded-xl transition-colors group outline-none focus-visible:ring-2 focus-visible:ring-primary/10 border border-transparent hover:border-border/20"
            >
                <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/30" />
                    <Text size="sm" className="text-muted-foreground/60 group-hover:text-muted-foreground transition-colors">
                        Requests
                    </Text>
                </div>
            </button>

            <button 
                onClick={() => setIncludeArchived(!includeArchived)}
                className={cn(
                    "px-3 py-2 rounded-xl transition-colors flex items-center gap-2 border border-transparent",
                    includeArchived 
                        ? "bg-primary/10 text-primary border-primary/20" 
                        : "hover:bg-muted/50 text-muted-foreground/60 hover:border-border/20"
                )}
            >
                <Archive className="w-4 h-4" />
                <Text size="xs" weight="medium" className={includeArchived ? "text-primary" : ""}>
                    {includeArchived ? 'Archive' : 'Archive'}
                </Text>
            </button>
        </div>
      </div>

      {/* Search & Active Feed */}
      <div className="px-4 space-y-4 mb-4">
        <div className="flex items-center gap-2 bg-muted/10 border border-border/30 rounded-lg px-3 py-1.5 focus-within:ring-1 focus-within:ring-border transition-all">
          <Search className="w-4 h-4 text-muted-foreground/30" />
          <input 
            type="text" 
            placeholder="Search" 
            className="bg-transparent border-none focus:ring-0 text-sm w-full py-0.5 outline-none placeholder:text-muted-foreground/20" 
          />
        </div>

        {/* People to start a chat with */}
        {!isUsersEmpty && displayUsers.length > 0 && !includeArchived && (
          <div className="flex flex-col gap-2">
            <Text size="xs" weight="medium" className="uppercase tracking-[0.2em] px-1 text-muted-foreground/30 text-[9px]">People</Text>
            <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2 -mx-2 px-2 border-b border-border/20">
              {displayUsers.slice(0, 10).map((u) => {
                const isOnline = onlineUsers.has(u.id);
                return (
                  <button 
                    key={`user-${u.id}`} 
                    onClick={() => onChatSelect(u.id, true)}
                    className="flex flex-col items-center gap-1.5 transition-opacity hover:opacity-70 active:scale-95"
                  >
                    <div className="relative">
                      <ProfileAvatar src={u.avatar} name={u.displayName} size="sm" className={cn("transition-all", !isOnline && "grayscale-[0.5] opacity-80")} />
                      {isOnline && (
                        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-primary border-2 border-background rounded-full" />
                      )}
                    </div>
                    <Text size="xs" className={cn("truncate w-12 text-center text-[10px]", isOnline ? "text-primary font-medium" : "text-muted-foreground/60")}>
                      {u.displayName?.split(' ')[0]}
                    </Text>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto px-2 space-y-1 no-scrollbar pb-20 lg:pb-4">
        <div className="flex items-center justify-between px-3 py-2">
            <Text size="xs" weight="medium" className="uppercase tracking-[0.2em] text-muted-foreground/30 text-[9px]">
                {includeArchived ? 'Archived Chats' : 'Recent Chats'}
            </Text>
        </div>
        {conversations.length > 0 ? (
          conversations.map((conv) => {
            const info = resolveConversationInfo(conv);
            return (
              <ChatListItem 
                key={conv.id}
                id={info.id}
                name={info.name}
                avatar={info.avatar}
                lastMessage={info.lastMessage}
                timestamp={info.timestamp}
                isActive={activeChatId === conv.id}
                isOnline={info.otherUserId ? onlineUsers.has(info.otherUserId) : false}
                isMuted={info.isMuted}
                unreadCount={globalSettings?.muteUnreadBadges ? 0 : info.unreadCount}
                onClick={() => onChatSelect(conv.id)}
              />
            );
          })
        ) : (
          <div className="flex flex-col items-center justify-center pt-10 px-6 text-center opacity-40 grayscale space-y-4">
            <EmptyQuiet size="100" />
            <Text size="sm" muted>
                {includeArchived ? 'No archived chats here.' : 'No conversations here yet.'}
            </Text>
          </div>
        )}
      </div>
    </div>
  );
};
