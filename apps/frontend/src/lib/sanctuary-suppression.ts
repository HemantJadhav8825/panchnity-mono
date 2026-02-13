/**
 * Sanctuary Suppression Utility
 * 
 * Manages client-side state for suppressing Sanctuary entry points and prompts.
 * Rule 1: Sanctuary is a release valve, not a routine.
 * Rule 2: Suppress for 24 hours after a vent or exit.
 * Rule 3: Suppress for the remainder of the session if opened but not posted.
 */

const STORAGE_KEY_24H = 'sanctuary_last_interaction';
const SESSION_KEY = 'sanctuary_session_active';
const COOLDOWN_24H = 24 * 60 * 60 * 1000;

/**
 * Mark that the user has interacted with Sanctuary in a way that requires 
 * a 24-hour cool-down (e.g., posting a vent or explicitly exiting).
 */
export const markSanctuaryInteraction = () => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY_24H, Date.now().toString());
};

/**
 * Check if the user has recently interacted (posted or exited) 
 * in a way that requires a 24-hour cooldown.
 */
export const hasRecentlyInteracted = (): boolean => {
  if (typeof window === 'undefined') return true;

  const lastInteraction = localStorage.getItem(STORAGE_KEY_24H);
  if (lastInteraction) {
    const elapsed = Date.now() - parseInt(lastInteraction, 10);
    if (elapsed < COOLDOWN_24H) return true;
  }

  return false;
};

/**
 * Get the remaining time in milliseconds until the 24-hour cooldown expires.
 * Returns 0 if no cooldown is active.
 */
export const getTimeUntilNextRelease = (): number => {
  if (typeof window === 'undefined') return 0;

  const lastInteraction = localStorage.getItem(STORAGE_KEY_24H);
  if (lastInteraction) {
    const elapsed = Date.now() - parseInt(lastInteraction, 10);
    if (elapsed < COOLDOWN_24H) {
      return COOLDOWN_24H - elapsed;
    }
  }
  return 0;
};

/**
 * Mark that the user has entered Sanctuary in the current session.
 * This is used to prevent re-prompting during the same session.
 */
export const markSanctuarySessionActive = () => {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem(SESSION_KEY, 'true');
};

/**
 * Check if Sanctuary entry points should be suppressed.
 */
export const isSanctuarySuppressed = (): boolean => {
  if (typeof window === 'undefined') return true;

  // Rule 1: 24-hour suppression after interaction
  if (hasRecentlyInteracted()) return true;

  // Rule 2: Session-level suppression if entered
  const isSessionActive = sessionStorage.getItem(SESSION_KEY);
  if (isSessionActive === 'true') return true;

  return false;
};

/**
 * Reset all suppression (mainly for internal testing or explicit overrides if ever needed)
 */
export const clearSanctuarySuppression = () => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY_24H);
  sessionStorage.removeItem(SESSION_KEY);
};
