import React from 'react';
import { ProfileAvatar } from './ProfileAvatar';
import { Text } from './Text';
import { cn } from '@/lib/utils';

interface UserAvatarWithLabelProps {
  avatarUrl?: string;
  displayName?: string;
  username?: string;
  size?: 'sm' | 'md' | 'lg';
  hasStory?: boolean;
  storySeen?: boolean;
  isCurrentUser?: boolean;
  className?: string;
  highlight?: boolean;
}

export const UserAvatarWithLabel: React.FC<UserAvatarWithLabelProps> = ({
  avatarUrl,
  displayName,
  username,
  size = 'md',
  hasStory = false,
  storySeen = false,
  isCurrentUser = false,
  className,
  highlight = false,
}) => {
  // Logic: displayName || username. NEVER email.
  const label = isCurrentUser ? 'Your story' : (displayName || username || 'User');
  
  const labelSizes = {
    sm: 'text-[10px] max-w-[48px]',
    md: 'text-xs max-w-[64px]',
    lg: 'text-sm max-w-[80px]',
  };

  const avatarSizes = {
    sm: 'md' as const,
    md: 'lg' as const,
    lg: 'xl' as const,
  };

  return (
    <div className={cn('flex flex-col items-center gap-1.5 flex-shrink-0 cursor-pointer group', className)}>
      <ProfileAvatar 
        src={avatarUrl} 
        name={label} 
        size={avatarSizes[size]} 
        hasStory={hasStory}
        storySeen={storySeen}
        className={cn(
          'transition-transform duration-300',
          highlight ? 'scale-105' : 'group-hover:scale-105'
        )}
      />
      <Text 
        size="xs" 
        muted 
        className={cn(
          'truncate text-center transition-colors',
          labelSizes[size],
          highlight || isCurrentUser ? 'text-primary' : 'group-hover:text-primary'
        )}
      >
        {label}
      </Text>
    </div>
  );
};
