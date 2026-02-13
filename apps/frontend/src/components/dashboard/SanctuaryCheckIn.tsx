'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { env } from '@/config/env';
import { Text } from '@/components/ui/Text';
import { isSanctuarySuppressed, markSanctuaryInteraction } from '@/lib/sanctuary-suppression';

export const SanctuaryCheckIn: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    setMounted(true);
    // Check feature flag first
    if (env.NEXT_PUBLIC_SANCTUARY_ENABLED !== 'true') return;

    // Use centralized suppression logic
    if (!isSanctuarySuppressed()) {
      setIsVisible(true);
    }
  }, []);

  const handleCTA = () => {
    // Navigate to sanctuary
    router.push('/sanctuary');
    // Suppression will be handled by the Sanctuary layout/exit triggers
    setIsVisible(false);
  };

  const dismiss = () => {
    setIsVisible(false);
    // Silent suppression for 24h as per Rule 1: "exits Sanctuary after viewing"
    // even if it's just the check-in card
    markSanctuaryInteraction();
  };

  // Prevent flash on server-side or before hydration check
  if (!mounted || !isVisible) return null;

  return (
    <div className="px-4 py-3 mb-4 bg-background/50 border border-border/40 rounded-xl max-w-md transition-all duration-300 animate-in fade-in slide-in-from-top-2">
      <div className="flex flex-col gap-3">
        <Text size="sm" className="text-foreground/80">
          How are you feeling right now?
        </Text>
        <div className="flex items-center gap-4">
          <button
            onClick={handleCTA}
            className="text-xs font-medium text-primary hover:text-primary/80 transition-colors"
          >
            Release a thought
          </button>
          <span className="text-border/40 h-3 w-[1px] bg-border/40" />
          <button
            onClick={dismiss}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Skip
          </button>
        </div>
      </div>
    </div>
  );
};
