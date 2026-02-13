import React from 'react';
import { ProfileAvatar } from '@/components/ui/ProfileAvatar';
import { Text } from '@/components/ui/Text';
import { Heading } from '@/components/ui/Heading';
import { ChevronLeft, Info, User } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MessageRequestDetailProps {
  name: string;
  avatar?: string;
  intro?: string;
  onAccept: () => void;
  onDecline: () => void;
  onBack?: () => void;
}

export const MessageRequestDetail: React.FC<MessageRequestDetailProps> = ({
  name,
  avatar,
  intro,
  onAccept,
  onDecline,
  onBack,
}) => {
  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <header className="h-16 lg:h-20 border-b border-border flex items-center justify-between px-4 lg:px-6 flex-shrink-0">
        <div className="flex items-center gap-3">
          {onBack && (
            <button onClick={onBack} className="lg:hidden p-1 -ml-1">
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}
          <Text weight="semibold" className="text-sm">Message Request</Text>
        </div>
        <button className="p-2 hover:bg-muted rounded-full transition-colors">
          <Info className="w-5 h-5" />
        </button>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto flex flex-col items-center justify-center p-8 text-center space-y-8">
        <div className="flex flex-col items-center space-y-4">
          <ProfileAvatar src={avatar} name={name} size="xl" hasStory storySeen />
          <div>
            <Heading level={4}>{name}</Heading>
            <Text muted size="sm">Community Member</Text>
          </div>
        </div>

        <div className="max-w-xs bg-muted/30 border border-border rounded-2xl p-6 relative">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-background px-2 text-[10px] uppercase font-bold tracking-widest text-primary/60">
            Invitation
          </div>
          <Text className="text-sm italic leading-relaxed text-foreground/80">
            &quot;{intro || "Would like to start a conversation with you."}&quot;
          </Text>
        </div>

        <Text size="xs" muted className="max-w-xs leading-relaxed">
          If you accept, {name} will be able to message you and see when you&apos;ve read messages.
        </Text>
      </div>

      {/* Actions */}
      <div className="p-6 border-t border-border flex flex-col gap-3">
        <button 
          onClick={onAccept}
          className="w-full py-3.5 bg-primary text-primary-foreground rounded-2xl font-bold transition-transform active:scale-95 shadow-lg shadow-primary/20"
        >
          Accept
        </button>
        <button 
          onClick={onDecline}
          className="w-full py-3.5 bg-muted text-foreground/60 rounded-2xl font-medium hover:bg-muted/80 transition-all active:scale-95"
        >
          Decline
        </button>
      </div>
    </div>
  );
};
