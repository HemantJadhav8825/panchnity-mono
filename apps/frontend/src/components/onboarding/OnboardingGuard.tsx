'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { getSafeOnboardingState } from '@/lib/onboarding/state';

const ONBOARDING_KEY = 'webelong_onboarding_state';

// Simple interface matching local storage structure
interface StoredState {
  status: 'completed' | 'skipped' | 'in_progress' | 'not_started';
  completedAt?: number;
}

export const OnboardingGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    if (isLoading) return;

    // 1. Auth Check
    if (!user) {
      router.replace('/login');
      return;
    }


    // 2. Onboarding State Check
    // We check both backend (truth) and local storage (session) using the safety function.
    const status = getSafeOnboardingState(user);

    // 3. Routing Logic
    // If completed or skipped locally OR backend says onboarded -> Dashboard
    if (status === 'completed' || status === 'skipped') {
      router.replace('/');
      return;
    }

    // 4. Refresh Trap Safety
    // The getSafeOnboardingState function handles 'in_progress' -> 'skipped' logic.
    // If we are here, status is 'not_started' or legit 'in_progress' (if logic allowed re-entry, which it doesn't).
    // Actually, getSafeOnboardingState returns 'skipped' for 'in_progress' on init.
    // So 'in_progress' is effectively barred from re-entry on refresh.
    
    // Safe to render
    // eslint-disable-next-line react-hooks/exhaustive-deps
    setIsAuthorized(true);

  }, [user, isLoading, router]);

  if (isLoading || !isAuthorized) {
    // Render nothing or a minimal spinner to avoid flash
    return <div className="min-h-screen bg-background" />;
  }

  return <>{children}</>;
};
