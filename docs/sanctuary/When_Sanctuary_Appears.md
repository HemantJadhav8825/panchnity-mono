# When Sanctuary Appears in the User Journey

**Product:** We belong  
**Feature:** Sanctuary  
**Audience:** Internal (Product, Design, Engineering)

---

## Purpose

This document defines **when and where Sanctuary should appear** in the We belong user journey.

Sanctuary is intentionally **not a destination**.  
It must appear only at moments of emotional friction and disappear once its purpose is served.

---

## Core Rule

> **Sanctuary should appear only when a user may need emotional release — never as a place to browse.**

If Sanctuary becomes easy to discover at all times, it risks becoming habitual, identity-forming, or emotionally sticky.  
That outcome violates its purpose.

---

## Approved Entry Points

### 1. Post-Login Emotional Check-In (Primary Entry)

**Status:** Recommended  
**Priority:** High

**When**

- Immediately after login
- Shown occasionally (not every session)

**UI Pattern**

- Inline prompt or lightweight banner
- Not a modal
- Fully skippable

**Suggested Copy**

> _How are you feeling right now?_  
> → **Vent anonymously**  
> → Skip

**Constraints**

- Show at most:
  - once per day, or
  - once every N sessions
- Do not show again immediately after a vent
- Never block access to the rest of the app

**Rationale**
This captures emotion early, before users enter shared spaces, without assuming distress or interrupting intent.

---

### 2. After an Aborted or Failed Social Action

**Status:** Optional (future enhancement)  
**Priority:** Medium

**Trigger Examples**

- User starts writing a post, then deletes it
- User opens a profile or community, then exits immediately
- User backs out of a social interaction without engaging

**UI Pattern**

- Subtle inline suggestion
- Never interruptive

**Suggested Copy**

> _If you want to say something without being seen…_  
> → **Vent anonymously**

**Rationale**
This addresses hesitation and self-censorship without pushing users into public interaction.

---

### 3. Onboarding Mention (Once Only)

**Status:** Optional  
**Priority:** Low

**When**

- Near the end of onboarding
- Never first
- Never required

**Suggested Copy**

> _Some people like to get things off their chest first._  
> → Try Sanctuary  
> → Continue

**Constraints**

- Show only once per user
- Never re-surface during onboarding retries

**Rationale**
Sets expectation without anchoring identity to Sanctuary.

---

## Explicitly Disallowed Entry Points

Sanctuary must **not** appear in the following places.

### ❌ Primary Navigation

- No bottom navigation icon
- No persistent sidebar emphasis
- No homepage feature card

If Sanctuary is always visible, it becomes a place instead of a tool.

---

### ❌ Notifications

Never send:

- “You haven’t vented today”
- “New vents are available”
- “Someone reacted to your vent”

Notifications create attachment and break ephemerality.

---

### ❌ As a Substitute for Community

Sanctuary must never be framed as:

- “Safer than posting”
- “Better place to share”
- “Anonymous community”

It is a buffer, not an alternative.

---

## Frequency & Cool-Down Rules

To prevent dependency:

- Do not surface Sanctuary:
  - immediately after a vent
  - repeatedly in the same session
- Enforce cool-down windows between prompts
- Sanctuary availability should feel incidental, not persistent

---

## Intended User Mental Model

Users should feel:

- “This is here if I need it.”
- “I don’t need to come back.”
- “This helped me move on.”

Users should **not** feel:

- “This is where I belong.”
- “People expect me here.”
- “This is my anonymous identity.”

---

## Implementation Guidance

- All entry points must respect `SANCTUARY_ENABLED`
- When disabled:
  - No prompts render
  - No dead links exist
- Entry logic should be:
  - data-light
  - privacy-preserving
  - easy to remove

---

## Final Principle

Sanctuary should:

- Appear quietly
- Be used briefly
- Disappear completely

If the team ever asks:

> “How do we get more users into Sanctuary?”

That is a signal to stop and re-evaluate.

---

**Sanctuary exists to protect We belong — not to grow itself.**
