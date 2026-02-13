# STITCH USAGE CONTRACT: WEBELONG PLATFORM

> **STATUS:** ACTIVE / ENFORCEABLE
> **VERSION:** 1.0.0
> **SCOPE:** AI-Assisted Design & Implementation (Stitch MCP)

---

## 1. PREAMBLE & AUTHORITY

This contract governs the use of the Google Stitch MCP and related AI tools within the Webelong ecosystem.
Webelong is a **belonging-first** platform. Technology serves this mission, never the inverse.

**This contract is subordinate to `ONBOARDING_CONTRACT.md`.**
Any AI-generated output that conflicts with the Onboarding Contract is automatically invalid and must be rejected.

---

## 2. ALLOWED USE CASES (GREEN LIST)

Stitch may be used for the following tasks without special approval, provided outputs are reviewed:

1.  **UI Layout Scaffolding**: Generating structural HTML/CSS for neutral containers, grids, and responsive wrappers.
2.  **Visual Hierarchy Refinement**: Adjusting spacing, typography scales, and color contrast to improve readability.
3.  **Accessibility Improvements**: Adding ARIA labels, semantic roles, and focus management to existing components.
4.  **Neutral Component Composition**: Assembling basic, non-directive UI elements (buttons, cards, inputs) that do not contain behavioral logic.
5.  **Performance Optimization**: Refactoring CSS or component structures for rendering efficiency.

---

## 3. FORBIDDEN USE CASES (RED LIST)

Stitch is **STRICTLY PROHIBITED** from generating or modifying logic in the following areas:

1.  **Onboarding Logic**:
    - NO generation of steps, flows, or state transitions for the onboarding process.
    - NO modification of `ONBOARDING_CONTRACT.md` rules.
2.  **Progress Indicators & Gamification**:
    - NO progress bars, completion percentages, or "levels".
    - NO "streaks", badges, or rewards for engagement.
3.  **Behavioral Nudges**:
    - NO copy or UI that guilt-trips, pressures, or "encourages" specific user actions (e.g., "Don't miss out!", "Complete your profile").
4.  **User Inference & Categorization**:
    - NO attempts to infer user identity, gender, mood, or intent from data.
    - NO generation of "suggested" content based on behavioral profiling.
5.  **Authentication & Security**:
    - NO modification of auth flows, token handling, or encryption logic.

---

## 4. REQUIRED INPUTS (THE CONTEXT PACT)

Every task delegated to Stitch must include the following context markers in the prompt:

1.  **Explicit Purpose**: define _exactly_ what the screen or component is for (e.g., "A settings panel for audio volume").
2.  **Emotional Tone**: Must be specified as **"Calm, Neutral, Non-Directive"**.
3.  **Data Sensitivity**: explicit statement of what data connects to this UI (e.g., "Public", "Private/Local Only").

> **Example Prompt Template:**
> "Generate a settings card for volume control. Tone: Calm and Neutral. Data: Local storage only. No user tracking."

---

## 5. OUTPUT RULES (THE REVIEW PACT)

1.  **Human Review Mandatory**: Stitch outputs must **NEVER** be auto-merged or deployed without human code review.
2.  **No New Data Collection**: Stitch-generated code must not introduce new logging, tracking, or analytics events unless explicitly requested and audited.
3.  **Sanatized Defaults**: Any default text or placeholder content must be neutral (e.g., "Welcome" instead of "Get Started Now!").
4.  **Code Quality**: Generated code must strictly follow the project's styling (Tailwind/CSS) and component architecture.

---

## 6. ALIGNMENT CLAUSE

> **In the event of a conflict between an AI-generated suggestion and the Belonging-First principles:**
>
> 1.  The Belonging-First principle (Safety, Privacy, Neutrality) **ALWAYS** wins.
> 2.  The AI output is considered a "hallucination of intent" and must be discarded.
> 3.  The user (developer) is responsible for enforcing this boundary.
