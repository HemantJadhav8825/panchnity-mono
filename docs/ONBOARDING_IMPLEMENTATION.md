# ONBOARDING SHELL & ORCHESTRATION IMPLEMENTATION

> **STATUS:** DRAFT / PROPOSED
> **SCOPE:** Frontend Implementation
> **DEPENDENCIES:** `docs/ONBOARDING_ROUTING.md`, `docs/ONBOARDING_STATE_MACHINE.md` (Contract)

---

## 1. FILE STRUCTURE PROPOSAL

We will adhere to the Next.js App Router structure.

```bash
apps/frontend/src/
├── app/
│   └── onboarding/
│       ├── layout.tsx       # (Shell) The visual container/shell
│       └── page.tsx         # (Route) The entry point / orchestrator host
├── components/
│   └── onboarding/
│       ├── OnboardingGuard.tsx       # Logic: Protects the route
│       ├── OnboardingOrchestrator.tsx # Logic: Manages step flow
│       └── OnboardingShell.tsx       # UI: The visual layout component
└── lib/
    └── onboarding/
        └── state.ts         # Logic: FSM types and storage helpers
```

---

## 2. COMPONENT RESPONSIBILITIES

### A. `lib/onboarding/state.ts`

- **Role:** Pure logic. No React.
- **Exports:**
  - `OnboardingStatus` (Type)
  - `getSafeOnboardingState(user)`: Returns the safe status based on contract.
  - `setOnboardingState(state)`: Persists state to localStorage.
  - `completeOnboarding()`: Handles the final transition + backend sync.

### B. `components/onboarding/OnboardingGuard.tsx`

- **Role:** Traffic Controller.
- **Logic:**
  - Wraps the entire `onboarding/*` route (or potentially the whole app via RootLayout, though per prompt we focus on the route).
  - Checks `getSafeOnboardingState()`.
  - Redirects to `/dashboard` if `completed` or `skipped`.
  - Redirects to `/login` if no user.
  - Renders `children` ONLY if safe.

### C. `app/onboarding/layout.tsx`

- **Role:** Next.js Layout.
- **Content:**
  - No navigation bar.
  - No footer.
  - Full viewport height.
  - Neutral background.

### D. `components/onboarding/OnboardingOrchestrator.tsx` (Client Component)

- **Role:** The "Brain" of the onboarding flow.
- **State:**
  - `currentStepIndex` (number, 0-4). **In-Memory ONLY**.
- **Logic:**
  - Defines the `STEPS` array (Components).
  - `next()`: Advances index.
  - `skip()`: Marks specific step skipped (if allowed), then advances.
  - **On Final Step:** Calls `completeOnboarding()` -> Router redirects.

---

## 3. ORCHESTRATION LOGIC (PSEUDOCODE)

```tsx
// components/onboarding/OnboardingOrchestrator.tsx

const STEPS = [
  Step1_Arrival,
  Step2_Intent,
  Step3_Visibility,
  Step4_Action,
  Step5_Completion,
];

export function OnboardingOrchestrator() {
  const [index, setIndex] = useState(0);
  const router = useRouter();

  // 1. Safe Forward Progression
  const handleNext = (data?: any) => {
    // Save step data if needed (context/api)
    if (index < STEPS.length - 1) {
      setIndex((prev) => prev + 1);
    } else {
      handleComplete();
    }
  };

  // 2. Completion Hook
  const handleComplete = async () => {
    // A. Mark local state
    setOnboardingState({ status: "completed", completedAt: Date.now() });

    // B. Fire-and-forget backend sync
    // api.users.updateOnboarding(...)

    // C. Redirect (Guard will also enforce this on next load)
    router.replace("/dashboard");
  };

  // 3. Render Active Step
  const ActiveComponent = STEPS[index];

  return (
    <OnboardingShell>
      <ActiveComponent
        onNext={handleNext}
        onSkip={handleNext} // Skip just moves next per contract
        isLast={index === STEPS.length - 1}
      />
    </OnboardingShell>
  );
}
```

---

## 4. SEPARATION OF CONCERNS TEST

| Feature                         | Where it lives                                   |
| :------------------------------ | :----------------------------------------------- |
| "Am I allowed to be here?"      | `OnboardingGuard`                                |
| "What step is next?"            | `OnboardingOrchestrator`                         |
| "What does the page look like?" | `OnboardingShell`                                |
| "Did I finish yesterday?"       | `lib/onboarding/state.ts` (Persistence)          |
| "Actual Step UI"                | Individual Step Components (Not implemented yet) |
