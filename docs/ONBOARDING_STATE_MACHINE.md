# ONBOARDING STATE MACHINE DESIGN

> **STATUS:** APPROVED
> **SCOPE:** Frontend System Engineering
> **SOURCE OF TRUTH:** `docs/ONBOARDING_CONTRACT.md`

---

## 1. STATE MODEL

The onboarding system is a finite state machine (FSM) that governs the user's passage through the "Foyer".

### Type Definition (TypeScript)

```typescript
// Strict status enum as per requirements
export type OnboardingStatus =
  | "not_started" // User has signed up but not entered the flow
  | "in_progress" // User is currently within the 5-step flow
  | "completed" // User finished Step 5 naturally
  | "skipped"; // User aborted, refreshed, or experienced an error

// Intent options (Step 2)
export type OnboardingIntent = "listen" | "share" | "just_be";

// Visibility options (Step 3) - Defaults to 'ghost' if skipped
export type VisibilitySetting = "visible" | "ghost";

export interface OnboardingState {
  // Current status of the machine
  status: OnboardingStatus;

  // Metadata collected during the flow (optional until set)
  intent?: OnboardingIntent;
  visibility?: VisibilitySetting;

  // Timestamps for audit and expiration
  startedAt?: number; // UNIX timestamp
  completedAt?: number; // UNIX timestamp
}

// Initial State Constant
export const INITIAL_ONBOARDING_STATE: OnboardingState = {
  status: "not_started",
};
```

---

## 2. TRANSITION RULES & TABLE

Transitions are strictly one-way. Once a user reaches `completed` or `skipped`, they can **NEVER** return to `not_started` or `in_progress`.

| From State        | Trigger Event                     | To State          | Side Effects                        |
| :---------------- | :-------------------------------- | :---------------- | :---------------------------------- |
| **`not_started`** | User enters `/onboarding` route   | **`in_progress`** | Set `startedAt = Date.now()`        |
| **`not_started`** | User navigates to ANY other route | **`skipped`**     | -                                   |
| **`in_progress`** | User clicks "Enter" on Step 5     | **`completed`**   | Set `completedAt`, Sync to Backend  |
| **`in_progress`** | **Page Refresh / Reload**         | **`skipped`**     | **CRITICAL SAFETY RULE**            |
| **`in_progress`** | Browser Tab Closed                | **`skipped`**     | (On next session load)              |
| **`in_progress`** | Network Error / Crash             | **`skipped`**     | Fallback UI triggers this           |
| **`in_progress`** | User clicks explicit "Skip"       | **`skipped`**     | -                                   |
| **`completed`**   | Any                               | **`completed`**   | Terminal state. No changes allowed. |
| **`skipped`**     | Any                               | **`skipped`**     | Terminal state. No changes allowed. |

---

## 3. PERSISTENCE STRATEGY

We use a **Dual-Layer Persistence Strategy** with a "Fail-Open" safety mechanism.

### Layer 1: LocalStorage (Primary)

- **Key:** `panchnity_onboarding_state`
- **Role:** Immediate, synchronous state tracking during the active session.
- **Behavior:** updated on every internal step transition.

### Layer 2: Backend User Profile (Truth)

- **Field:** `user.hasOnboarded` (Boolean)
- **Role:** Long-term persistence across devices.
- **Sync:**
  1.  When `status` becomes `completed` or `skipped`, we fire a "fire-and-forget" sync to the backend API.
  2.  On app init, we check `user.hasOnboarded`. If `true`, strict redirect to Dashboard.

### "Fail-Open" Safety Logic

If persistence fails, we **ALWAYS default to `skipped`**.
The user must _never_ be blocked by a broken state machine.

```typescript
function getSafeOnboardingState(): OnboardingStatus {
  try {
    const local = localStorage.getItem("panchnity_onboarding_state");
    const remote = userProfile?.hasOnboarded;

    // 1. If remote says done, we are done.
    if (remote === true) return "completed";

    // 2. If local state is valid, use it.
    if (local) {
      const state = JSON.parse(local);
      // SAFETY: If we were 'in_progress' but this is a new page load (refresh),
      // we must force correct to 'skipped' as per contract.
      if (state.status === "in_progress") return "skipped";
      return state.status;
    }

    // 3. Default for new users
    return "not_started";
  } catch (err) {
    console.error("Onboarding State Safety Failure:", err);
    // CRITICAL: If anything crashes, assume user is skipped to let them in.
    return "skipped";
  }
}
```

---

## 4. EDGE CASE HANDLING

### A. The "Refresh Trap"

- **Scenario:** User gets to Step 3 and hits Refresh.
- **Risk:** They might be stuck in a loop or restart Step 1 (annoying).
- **Resolution:** The logic `if (status === 'in_progress' && isNewSession) return 'skipped'` ensures they are immediately dumped into the Dashboard. Onboarding is a "one-shot" opportunity.

### B. Cross-Device desync

- **Scenario:** User starts onboarding on Mobile, then opens Desktop.
- **Resolution:** Desktop sees `not_started`. They can onboard on Desktop.
- **Conflict:** If they finish on Desktop (`completed`), then go back to Mobile (`in_progress`), the next sync/check on Mobile will see `completed` from backend and redirect them out.

### C. Storage Quota Exceeded

- **Scenario:** `localStorage.setItem` throws an error.
- **Resolution:** Catch block wraps all writes. If write fails, we treat the state as `skipped` in memory and try to sync to backend. We do NOT block the user.
