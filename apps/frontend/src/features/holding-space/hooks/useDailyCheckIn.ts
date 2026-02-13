import { useState, useEffect, useCallback } from 'react';

const CHECK_IN_DISMISSED_KEY = 'holdingSpaceCheckInDismissedUntil';

export const useDailyCheckIn = () => {
  const [shouldShowPrompt, setShouldShowPrompt] = useState(false);

  useEffect(() => {
    const checkDismissal = () => {
      const dismissedUntil = localStorage.getItem(CHECK_IN_DISMISSED_KEY);
      if (dismissedUntil) {
        const dismissedDate = new Date(parseInt(dismissedUntil, 10));
        const now = new Date();
        
        // If the dismissal time is in the future, don't show prompt
        if (dismissedDate > now) {
          setShouldShowPrompt(false);
          return;
        }
      }
      
      // Also check if user has posted recently (this would require checking the feed or a user profile stats endpoint)
      // For Milestone 1, we rely mainly on the local dismissal state as requested.
      // "Show only if: User has not posted in last 24h OR Never posted"
      // Since we don't have an endpoint to check "last posted time" easily without a full profile fetch, 
      // and checking the feed might miss older posts if not loaded, 
      // we will assume for now that if the prompt isn't dismissed, we show it.
      // A more robust implementation would check `user.lastPostedAt` if available.
      
      setShouldShowPrompt(true);
    };

    checkDismissal();
  }, []);

  const dismissCheckIn = useCallback(() => {
    const tomorrow = new Date();
    tomorrow.setHours(tomorrow.getHours() + 24);
    localStorage.setItem(CHECK_IN_DISMISSED_KEY, tomorrow.getTime().toString());
    setShouldShowPrompt(false);
  }, []);

  return {
    shouldShowPrompt,
    dismissCheckIn,
  };
};
