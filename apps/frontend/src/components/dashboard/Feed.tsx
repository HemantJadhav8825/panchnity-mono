import React from 'react';
import { StoriesRow } from './StoriesRow';
import { FeedCard } from './FeedCard';
import { SanctuaryCheckIn } from './SanctuaryCheckIn';
import { EmptyQuiet } from '@/illustrations/components/EmptyQuiet';
import { Text } from '@/components/ui/Text';
import { useUsers } from '@/hooks/useUsers';

export const Feed: React.FC = () => {
  const { users, isLoading, isEmpty } = useUsers(20);

  if (isLoading) {
    return (
      <div className="pb-10">
        <StoriesRow />
        <div className="flex flex-col space-y-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse bg-background border-b border-border lg:border lg:rounded-xl overflow-hidden">
              <div className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10" />
                <div className="h-4 w-32 bg-primary/10 rounded" />
              </div>
              <div className="aspect-square bg-primary/5" />
              <div className="p-4 space-y-3">
                <div className="h-4 w-24 bg-primary/10 rounded" />
                <div className="h-4 w-full bg-primary/10 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="pb-10">
      <StoriesRow />
      
      <div className="px-4 lg:px-0">
        <SanctuaryCheckIn />
      </div>

      <div className="flex flex-col">
        {!isEmpty ? (
          users.map((user) => (
            <FeedCard 
              key={user.id}
              username={user.displayName || user.username || 'User'}
              avatar={user.avatar}
              caption="Sharing a moment of quiet reflection today. 🌿"
              timeAgo="2h"
            />
          ))
        ) : (
          <div className="py-20 flex flex-col items-center text-center space-y-6 px-6">
            <EmptyQuiet size="200" />
            <div className="space-y-2">
              <Text className="text-foreground/80 font-medium">
                This space stays quiet until it’s needed.
              </Text>
              <Text size="sm" muted>
                Take a breath, look around, and belong.
              </Text>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
