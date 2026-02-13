import React from 'react';
import { MessageRequestItem } from './MessageRequestItem';
import { Text } from '@/components/ui/Text';
import { ChevronLeft } from 'lucide-react';
import { useUsers } from '@/hooks/useUsers';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { UserAvatarWithLabel } from '@/components/ui/UserAvatarWithLabel';
import { EmptyQuiet } from '@/illustrations/components/EmptyQuiet';

interface MessageRequestsListProps {
  activeRequestId?: string;
  onSelect: (id: string) => void;
  onBack: () => void;
}

export const MessageRequestsList: React.FC<MessageRequestsListProps> = ({
  activeRequestId,
  onSelect,
  onBack,
}) => {
  const { users, isLoading, isEmpty } = useUsers(20);
  const { user: currentUser } = useCurrentUser();

  if (isLoading) {
    return (
      <div className="h-full flex flex-col bg-background lg:border-r border-border animate-pulse">
        <div className="p-6 space-y-4">
          <div className="h-8 w-32 bg-primary/10 rounded" />
        </div>
        <div className="px-4 space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary/10" />
              <div className="space-y-2 flex-1">
                <div className="h-4 w-24 bg-primary/10 rounded" />
                <div className="h-3 w-full bg-primary/5 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Use a subset of users as "requests" for demonstration
  const displayUsers = users
    .filter(u => u.id !== currentUser?.id)
    .slice(0, 3); // Just show top 3 as "requests"

  return (
    <div className="h-full flex flex-col bg-background lg:border-r border-border">
      <div className="p-4 lg:p-6 pb-2 lg:pb-4 flex items-center gap-4">
        <button onClick={onBack} className="p-2 -ml-2 hover:bg-muted rounded-full transition-colors outline-none focus-visible:ring-2 focus-visible:ring-primary">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <div className="flex-1">
          <Text weight="bold" className="text-xl lg:text-2xl">Requests</Text>
        </div>
      </div>

      <div className="px-4 py-2 border-b border-border/50 space-y-4 pb-4">
        <Text size="xs" muted className="leading-relaxed">
          Invitations from people you don&apos;t follow. They won&apos;t know you&apos;ve seen the message until you accept.
        </Text>

        {/* Suggested/Active people for requests context */}
        {!isEmpty && displayUsers.length > 0 && (
          <div className="space-y-2">
            <Text size="xs" weight="semibold" className="text-primary/60 uppercase tracking-wider">Suggested</Text>
            <div className="flex gap-4 overflow-x-auto no-scrollbar -mx-2 px-2">
              {users.slice(0, 8).map((user) => (
                <UserAvatarWithLabel 
                  key={`suggested-${user.id}`}
                  avatarUrl={user.avatar}
                  displayName={user.displayName}
                  username={user.username}
                  size="sm"
                  className="w-14"
                />
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-2 py-2 space-y-1 no-scrollbar">
        {!isEmpty && displayUsers.length > 0 ? (
          displayUsers.map((user) => (
            <MessageRequestItem 
              key={user.id}
              id={user.id}
              name={user.displayName || user.username || 'Anonymous'}
              avatar={user.avatar}
              intro="Found your recent reflection very resonant."
              isActive={activeRequestId === user.id}
              onClick={() => onSelect(user.id)}
            />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center pt-20 px-6 text-center opacity-40 grayscale space-y-4">
            <EmptyQuiet size="120" />
            <Text size="sm" muted>No message requests.</Text>
          </div>
        )}
      </div>
    </div>
  );
};
