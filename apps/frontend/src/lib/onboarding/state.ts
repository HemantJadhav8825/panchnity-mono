import { User } from '@/api/auth.service';

export type OnboardingStatus = 'not_started' | 'in_progress' | 'completed' | 'skipped';

export interface OnboardingState {
  status: OnboardingStatus;
  completedAt?: number;
}

const getOnboardingKey = (userId: string) => `panchnity_onboarding_state_${userId}`;

/**
 * Resolves the deterministic state of onboarding for the current session.
 * This is the ONLY source of truth for "Am I allowed to onboard?"
 */
export function getSafeOnboardingState(user: User | null): OnboardingStatus {
  try {
    if (!user?.id) return 'skipped'; // No user context = unsafe to route

    // 1. Backend Truth Wins (Absolute Authority)
    if ((user as any).hasOnboarded === true) {
      return 'completed';
    }

    // 2. Local State Check (User-Scoped)
    const key = getOnboardingKey(user.id);
    const stored = localStorage.getItem(key);

    if (stored) {
      const state = JSON.parse(stored) as OnboardingState;

      // REFRESH TRAP / CRASH SAFETY:
      if (state.status === 'in_progress') {
        return 'skipped';
      }

      return state.status;
    }

    // 3. 🚨 NEW USER ENTRY
    // Defines first authenticated session entry into onboarding.
    if (user && !stored && (user as any).hasOnboarded !== true) {
      return 'not_started';
    }

    // Default Fallback
    return 'skipped';

  } catch (error) {
    console.warn('Onboarding state resolution failed, defaulting to skipped:', error);
    return 'skipped';
  }
}

export function setOnboardingState(userId: string, state: OnboardingState) {
  try {
    const key = getOnboardingKey(userId);
    localStorage.setItem(key, JSON.stringify(state));
  } catch (e) {
    console.error('Failed to save onboarding state:', e);
  }
}
