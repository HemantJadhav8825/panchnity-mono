import React from 'react';
import { UserAvatarWithLabel } from '@/components/ui/UserAvatarWithLabel';
import { useUsers } from '@/hooks/useUsers';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { EmptyQuiet } from '@/illustrations/components/EmptyQuiet';
import { Text } from '@/components/ui/Text';
import { User } from '@/api/auth.service';

interface StoryItem {
  id: string;
  displayName?: string;
  username?: string;
  avatar?: string;
  hasStory: boolean;
  storySeen?: boolean;
}

export const StoriesRow: React.FC = () => {
  const { users, isLoading, isEmpty } = useUsers(10);
  const { user: currentUser } = useCurrentUser();

  if (isLoading) {
    return (
      <div className="w-full py-4 lg:py-6 overflow-x-auto no-scrollbar border-b lg:border-none border-border">
        <div className="flex px-4 lg:px-0 gap-4 sm:gap-6 animate-pulse">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-1.5 flex-shrink-0">
              <div className="w-16 h-16 rounded-full bg-primary/10" />
              <div className="w-12 h-2 bg-primary/10 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (isEmpty && !currentUser) {
    return (
      <div className="w-full py-8 flex flex-col items-center justify-center text-center opacity-40 grayscale pointer-events-none">
        <EmptyQuiet size="100" />
        <Text size="xs" muted className="mt-2">This space is quiet for now.</Text>
      </div>
    );
  }

  // Combine current user with other users
  const stories: StoryItem[] = [];

  if (currentUser) {
    stories.push({
      id: currentUser.id,
      displayName: currentUser.displayName,
      username: currentUser.username,
      avatar: currentUser.avatar,
      hasStory: true,
      storySeen: false,
    });
  }

  users.forEach((u: User) => {
    if (u.id !== currentUser?.id) {
      stories.push({
        id: u.id,
        displayName: u.displayName,
        username: u.username,
        avatar: u.avatar,
        hasStory: true,
        storySeen: false,
      });
    }
  });

  return (
    <div className="w-full py-4 lg:py-6 overflow-x-auto no-scrollbar border-b lg:border-none border-border">
      <div className="flex px-4 lg:px-0 gap-4 sm:gap-6">
        {stories.map((story) => (
          <UserAvatarWithLabel 
            key={story.id}
            avatarUrl={story.avatar}
            displayName={story.displayName}
            username={story.username}
            hasStory={story.hasStory}
            storySeen={story.storySeen}
            isCurrentUser={story.id === currentUser?.id}
            size="md"
          />
        ))}
      </div>
    </div>
  );
};
