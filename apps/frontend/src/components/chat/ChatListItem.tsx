import React from 'react';
import { ProfileAvatar } from '@/components/ui/ProfileAvatar';
import { Text } from '@/components/ui/Text';
import { BellOff } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChatListItemProps {
  id: string;
  name: string;
  avatar?: string;
  lastMessage?: string;
  timestamp?: string;
  isActive?: boolean;
  isOnline?: boolean;
  isMuted?: boolean;
  unreadCount?: number;
  onClick?: () => void;
}

export const ChatListItem: React.FC<ChatListItemProps> = ({
  name,
  avatar,
  lastMessage,
  timestamp,
  isActive = false,
  isOnline = false,
  isMuted = false,
  unreadCount = 0,
  onClick,
}) => {
  return (
    <button 
      onClick={onClick}
      className={cn(
        'w-full flex items-center gap-3 p-3 lg:px-4 rounded-xl transition-all active:scale-[0.98] relative group',
        isActive ? 'bg-primary/5' : 'hover:bg-muted/50'
      )}
    >
      <div className="relative">
        <ProfileAvatar src={avatar} name={name} size="md" />
        {isOnline && (
          <span className="absolute bottom-0.5 right-0.5 w-2.5 h-2.5 bg-primary border-2 border-background rounded-full" />
        )}
      </div>
      
      <div className="flex-1 text-left min-w-0">
        <div className="flex justify-between items-baseline gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <Text weight={unreadCount > 0 ? "bold" : "semibold"} className={cn("text-sm truncate", unreadCount > 0 ? "text-foreground" : "text-foreground/80")}>{name}</Text>
            {isMuted && <BellOff className="w-3 h-3 text-muted-foreground/30 flex-shrink-0" />}
          </div>
          {timestamp && (
            <div className="flex flex-col items-end gap-1 flex-shrink-0">
              <Text weight={unreadCount > 0 ? "semibold" : "normal"} size="xs" muted={unreadCount === 0} className="whitespace-nowrap">
                {timestamp}
              </Text>
            </div>
          )}
        </div>
        {lastMessage && (
          <Text 
            size="xs" 
            muted={unreadCount === 0} 
            className={cn(
              "truncate max-w-[180px] transition-all duration-300",
              unreadCount > 0 ? "text-foreground/90 font-medium" : "opacity-40"
            )}
          >
            {lastMessage}
          </Text>
        )}
      </div>

      {unreadCount > 0 && (
        <div className="absolute right-4 bottom-3 min-w-[1.25rem] h-5 px-1.5 flex items-center justify-center bg-primary text-primary-foreground text-[10px] font-black rounded-full shadow-lg shadow-primary/20 ring-4 ring-background transform transition-transform group-hover:scale-110">
          {unreadCount > 99 ? '99+' : unreadCount}
        </div>
      )}
      
      {isActive && (
        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
      )}
    </button>
  );
};
