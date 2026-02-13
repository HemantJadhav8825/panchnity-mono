import React from 'react';
import { cn } from '@/lib/utils';
import { User } from 'lucide-react';

interface ProfileAvatarProps {
  src?: string;
  name?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  hasStory?: boolean;
  storySeen?: boolean;
  className?: string;
}

export const ProfileAvatar: React.FC<ProfileAvatarProps> = ({
  src,
  name,
  size = 'md',
  hasStory = false,
  storySeen = false,
  className,
}) => {
  const sizeClasses = {
    xs: 'w-6 h-6',
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-14 h-14',
    xl: 'w-20 h-20',
  };

  const ringSizeClasses = {
    xs: 'p-[1px]',
    sm: 'p-[1.5px]',
    md: 'p-[2px]',
    lg: 'p-[3px]',
    xl: 'p-[4px]',
  };

  return (
    <div className={cn('relative inline-block', className)}>
      {hasStory && (
        <div 
          className={cn(
            'absolute inset-0 rounded-full',
            ringSizeClasses[size],
            storySeen 
              ? 'bg-muted-foreground/20' 
              : 'bg-gradient-to-tr from-primary via-primary/80 to-primary/40'
          )}
        >
          <div className="w-full h-full rounded-full bg-background" />
        </div>
      )}
      
      <div 
        className={cn(
          'relative rounded-full overflow-hidden bg-muted flex items-center justify-center border border-border',
          sizeClasses[size],
          hasStory && 'scale-[0.88]'
        )}
      >
        {src ? (
          <img 
            src={src} 
            alt={name || 'Avatar'} 
            className="w-full h-full object-cover"
          />
        ) : (
          <User className={cn('text-muted-foreground', size === 'xs' ? 'w-3 h-3' : 'w-1/2 h-1/2')} />
        )}
      </div>
    </div>
  );
};
