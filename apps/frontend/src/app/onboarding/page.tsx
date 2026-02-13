'use client';

import React from 'react';
import { OnboardingGuard } from '@/components/onboarding/OnboardingGuard';
import { OnboardingOrchestrator } from '@/components/onboarding/OnboardingOrchestrator';

export default function OnboardingPage() {
  return (
    <OnboardingGuard>
      <OnboardingOrchestrator />
    </OnboardingGuard>
  );
}
