# ONBOARDING CONTRACT: WEBELONG PLATFORM

> **STATUS:** DRAFT / PROPOSED
> **VERSION:** 1.0.0
> **SCOPE:** New User Experience

---

## 1. PREAMBLE & PHILOSOPHY

Webelong is a "belonging-first" platform. Our onboarding is not a funnel; it is a **foyer**.
It must feel safe, optional, and non-invasive. We do not extract value from the user; we offer them a space.

**This contract is the SINGLE SOURCE OF TRUTH for the onboarding system logic.**
Any implementation that violates this contract is a bug.

---

## 2. EXPLICIT GUARDRAILS (NON-NEGOTIABLE)

The following rules must be enforced at the architectural level.

1.  **No Personal Questions**: We NEVER ask for name, age, gender, location, or occupation during onboarding.
2.  **No Demographic Data**: No race, ethnicity, or socioeconomic data collection.
3.  **No Clinical Data**: No questions about mental health diagnoses or medical history.
4.  **No Gamified Completion**:
    - NO progress bars (e.g., "50% complete").
    - NO "Complete your profile" nudges.
    - NO checklists for setup.
5.  **No Blocking**: The application must be fully usable even if the user skips EVERY step of onboarding.
6.  **Identity Agnostic**: Onboarding focuses on _intent_ (why are you here?), not _identity_ (who are you?).

---

## 3. ONBOARDING SEQUENCE

The onboarding flow consists of exactly **5 steps**.
It begins strictly AFTER account creation/signup (email + password).

### Step 1: The Threshold (Arrival)

- **Purpose**: Acknowledge the user has entered a shared space. Set a tone of calmness.
- **Action**: Display a simple welcome message (e.g., "Welcome to the space").
- **Data Collected**: None.
- **Optional/Skippable**: Yes.
- **If Skipped**: Proceed to Step 2.

### Step 2: Intent (Why are you here?)

- **Purpose**: To tailor the initial feed or experience contextually without distinct "user types".
- **Interaction**: User selects **one** loose intent (e.g., "To Listen", "To Share", "Just to Be").
- **Data Collected**: `onboarding_intent` (String/Enum). Stored in User Profile settings, not identity.
- **Optional/Skippable**: Yes.
- **If Skipped**: Default to "Just to Be" (Neutral state). Proceed to Step 3.

### Step 3: Visibility Preference (Ghost Mode)

- **Purpose**: To give the user immediate control over their perception by others. Safety first.
- **Interaction**: User chooses visibility level (e.g., "Visible", "Ghost/Anonymous").
- **Data Collected**: `visibility_setting` (Boolean/Enum).
- **Optional/Skippable**: Yes.
- **If Skipped**: **DEFAULT TO GHOST/ANONYMOUS** (Safest option). Proceed to Step 4.

### Step 4: First Safe Action (Grounding)

- **Purpose**: To demonstrate interaction is safe and creates no "ripple" or social anxiety.
- **Interaction**: A single, non-social action (e.g., "Light a candle", "Take a breath", "Pick a theme").
- **Data Collected**: Interaction event (e.g., `theme_preference` or ephemeral action log).
- **Optional/Skippable**: Yes.
- **If Skipped**: Proceed to Step 5.

### Step 5: Completion (Entry)

- **Purpose**: To formally transition the user from "arriving" to "being".
- **Action**: A gentle animation or transition into the Main Dashboard/Sanctuary.
- **Data Collected**: Set `onboarding_completed_at` timestamp.
- **Optional/Skippable**: No (this is a state transition, not a UI step).
- **If Skipped**: N/A (System must execute this transition).

---

## 4. DEFINITION OF "ONBOARDING COMPLETE"

Onboarding is considered **COMPLETE** when:

1.  The user has viewed or skipped Step 5.
2.  The system has flagged the user account as `onboarded: true` (or equivalent).
3.  The user lands on the primary Dashboard or Sanctuary view.

**Post-Completion Rules:**

- The onboarding flow must **NEVER** be shown again to this user.
- We must **NEVER** ask "Did you forget to complete X?"
- All features of the app are unlocked; there is no "Level 2" access.

---

## 5. FAILURE & EDGE CASES

The system must handle these interruptions gracefully without trapping the user.

| Scenario                        | System Behavior                                                                                             |
| :------------------------------ | :---------------------------------------------------------------------------------------------------------- |
| **Refresh during Onboarding**   | Check `onboarded` flag. If false, **SKIP remaining steps** and land user on Dashboard. Do NOT restart flow. |
| **Close Tab / Session End**     | Treat as "Skip All". Next login goes straight to Dashboard.                                                 |
| **Network Failure on Step 2/3** | Fail silently. Save no data. Proceed to next step or Dashboard.                                             |
| **User Logs Out Mid-Flow**      | Treat as "Skip All". Next login goes straight to Dashboard.                                                 |
| **"Back" Button Usage**         | Allowed. Users can change previous answers until Step 5 is reached.                                         |
| **Crash / Error**               | Fallback to Dashboard immediately. Log error silently.                                                      |

**Universal Fallback Rule:**

> If ANY part of the onboarding logic throws an exception, the system must immediately abort onboarding and render the Main Dashboard.
> **Better to have no onboarding than broken onboarding.**
