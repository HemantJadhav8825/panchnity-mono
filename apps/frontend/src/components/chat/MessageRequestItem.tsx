import React from 'react';
import { ProfileAvatar } from '@/components/ui/ProfileAvatar';
import { Text } from '@/components/ui/Text';
import { cn } from '@/lib/utils';

interface MessageRequestItemProps {
  id: string;
  name: string;
  avatar?: string;
  intro?: string;
  isActive?: boolean;
  onClick?: () => void;
}

export const MessageRequestItem: React.FC<MessageRequestItemProps> = ({
  name,
  avatar,
  intro,
  isActive = false,
  onClick,
}) => {
  return (
    <button 
      onClick={onClick}
      className={cn(
        'w-full flex items-center gap-3 p-3 lg:px-4 rounded-xl transition-all active:scale-[0.98]',
        isActive ? 'bg-primary/5' : 'hover:bg-muted/50'
      )}
    >
      <ProfileAvatar src={avatar} name={name} size="md" hasStory storySeen />
      
      <div className="flex-1 text-left min-w-0">
        <Text weight="semibold" className="text-sm truncate">{name}</Text>
        {intro && (
          <Text size="xs" muted className="truncate max-w-[180px]">
            {intro}
          </Text>
        )}
      </div>
      
      <div className="w-1.5 h-1.5 rounded-full bg-primary/40" />
    </button>
  );
};
