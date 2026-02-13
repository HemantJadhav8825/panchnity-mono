'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Step1_Arrival } from '@/components/onboarding/steps/Step1_Arrival';
import { Step2_Intent, OnboardingIntent } from '@/components/onboarding/steps/Step2_Intent';
import { Step3_Visibility, VisibilitySetting } from '@/components/onboarding/steps/Step3_Visibility';
import { Step4_Action } from '@/components/onboarding/steps/Step4_Action';
import { Step5_Completion } from '@/components/onboarding/steps/Step5_Completion';

import { useAuth } from '@/context/AuthContext';
import { setOnboardingState } from '@/lib/onboarding/state';
import { userService } from '@/api/user.service';

const STEPS = [
  Step1_Arrival,
  Step2_Intent,
  Step3_Visibility,
  Step4_Action,
  Step5_Completion
];

export const OnboardingOrchestrator: React.FC = () => {
  const router = useRouter();
  const { user } = useAuth(); // Get user for ID
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  // Temporary In-Memory State (Not persisted until completion)
  const [intent, setIntent] = useState<OnboardingIntent | undefined>(undefined);
  const [visibility, setVisibility] = useState<VisibilitySetting | undefined>(undefined);

  const handleNext = async (data?: any) => {
    // 1. Capture Data (if any) based on current step index
    // Note: This relies on index stability. 
    if (currentStepIndex === 1) { // Step 2: Intent
      setIntent(data as OnboardingIntent);
    }
    if (currentStepIndex === 2) { // Step 3: Visibility
      setVisibility(data as VisibilitySetting);
    }

    // 2. Check if we are done
    if (currentStepIndex < STEPS.length - 1) {
      // Advance
      setCurrentStepIndex(prev => prev + 1);
    } else {
      // 3. Final Step Completed -> Finish
      await handleCompletion();
    }
  };

  const handleCompletion = async () => {
    try {
      if (!user?.id) throw new Error('No user ID found during completion');

      // A. Apply Defaults (CRITICAL: Visibility defaults to 'ghost' if undefined)
      const finalVisibility = visibility || 'ghost';
      const finalIntent = intent; // remains undefined if skipped

      // B. Persist State Locally
      const finalState = {
        status: 'completed' as const,
        completedAt: Date.now(),
        intent: finalIntent,
        visibility: finalVisibility,
      };
      
      setOnboardingState(user.id, finalState);

      // C. Fire-and-Forget Backend Sync
      console.log('Syncing onboarding completion to backend:', finalState);
      
      // We don't await this to block navigation, but we trigger it.
      // Actually, for critical state, maybe we should await loosely or catch errors?
      // "Fire and forget" usually means we don't block.
      userService.updateProfile({
        hasOnboarded: true,
        // @ts-ignore - Enums match string but TS might be strict
        onboardingIntent: finalIntent,
        visibility: finalVisibility
      }).catch(err => {
        console.error('Background onboarding sync failed:', err);
        // We relied on local state (fail-open), so this is acceptable for now.
      });

      // D. Navigate
      router.replace('/');

    } catch (error) {
      console.error('Onboarding completion failed, forcing skip:', error);
      
      // FAIL-OPEN SAFETY: If anything breaks, mark skipped to unblock user.
      if (user?.id) {
        setOnboardingState(user.id, {
          status: 'skipped',
          completedAt: Date.now()
        });
      }
      router.replace('/');
    }
  };

  const ActiveComponent = STEPS[currentStepIndex];

  return (
    <div className="w-full h-full flex items-center justify-center">
      {/* 
        We pass `onNext` to every component. 
        Each component knows its specific signature, but pure JS allows passing safely.
        The orchestrator handles the data internally in `handleNext`.
      */}
      <ActiveComponent onNext={handleNext} />
    </div>
  );
};
