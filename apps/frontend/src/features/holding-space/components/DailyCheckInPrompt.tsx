'use client';

import React from 'react';
import { Button } from '@/components/ui/Button';
import { useDailyCheckIn } from '../hooks/useDailyCheckIn';

export const DailyCheckInPrompt = ({ onShareClick }: { onShareClick?: () => void }) => {
  const { shouldShowPrompt, dismissCheckIn } = useDailyCheckIn();

  if (!shouldShowPrompt) return null;

  return (
    <div className="w-full max-w-2xl mx-auto mb-6 p-6 bg-secondary/20 rounded-lg border border-secondary text-center space-y-4">
      <h3 className="text-lg font-medium">How are you holding up today?</h3>
      <p className="text-sm text-muted-foreground max-w-md mx-auto">
        Taking a moment to check in with yourself can help. Would you like to share what&apos;s on your mind?
      </p>
      <div className="flex items-center justify-center gap-4">
        <Button variant="outline" onClick={dismissCheckIn}>
          Not today
        </Button>
        <Button onClick={() => {
          onShareClick?.();
          // Ideally, we don't dismiss immediately on click, but maybe after successful post.
          // For now, let the user manually dismiss or post.
        }}>
          Share something
        </Button>
      </div>
    </div>
  );
};
