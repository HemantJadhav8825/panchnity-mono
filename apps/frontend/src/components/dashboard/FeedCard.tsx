import React from 'react';
import { ProfileAvatar } from '@/components/ui/ProfileAvatar';
import { Text } from '@/components/ui/Text';
import { MoreHorizontal } from 'lucide-react';
import { motion } from 'framer-motion';

interface FeedCardProps {
  username: string;
  avatar?: string;
  image?: string;
  caption?: string;
  timeAgo?: string;
}

export const FeedCard: React.FC<FeedCardProps> = ({
  username,
  avatar,
  image,
  caption,
  timeAgo = '2h',
}) => {
  return (
    <article className="bg-background border-b border-border lg:border lg:rounded-xl lg:mb-6 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-3 lg:p-4">
        <div className="flex items-center gap-3">
          <ProfileAvatar src={avatar} name={username} size="sm" hasStory />
          <div className="flex flex-col">
            <Text weight="semibold" className="text-sm hover:text-primary transition-colors cursor-pointer">
              {username}
            </Text>
            <Text size="xs" muted className="lg:hidden">{timeAgo}</Text>
          </div>
        </div>
        <button className="p-1 hover:text-foreground/60">
          <MoreHorizontal className="w-5 h-5" />
        </button>
      </div>

      {/* Content Area */}
      <div className="aspect-square bg-muted relative overflow-hidden flex items-center justify-center">
        {image ? (
          <img src={image} alt="Post content" className="w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-muted-foreground/20">
            <div className="w-24 h-24 border-2 border-current rounded-lg flex items-center justify-center">
               <span className="text-sm font-medium">Space for reflection</span>
            </div>
          </div>
        )}
      </div>

      {/* Caption & Metadata */}
      <div className="p-3 lg:p-4 pt-0 lg:pt-0 space-y-3">

        <div className="space-y-1">
          {caption && (
            <div className="flex gap-1.5">
              <Text weight="semibold" className="text-sm">{username}</Text>
              <Text size="sm" className="flex-1 opacity-90">{caption}</Text>
            </div>
          )}
          <Text size="xs" muted className="hidden lg:block pt-1 uppercase tracking-wider text-[10px]">
            {timeAgo}
          </Text>
        </div>
      </div>
    </article>
  );
};
