# Sanctuary — Internal Design Rationale

**Product:** Panchnity
**Status:** Internal / Experimental
**Feature Flag:** SANCTUARY_ENABLED

---

## Overview

Sanctuary is an **internal, feature-flagged module** inside _Panchnity_.

It exists to provide a **temporary, anonymous, and ephemeral release space** for users who are not ready to bring their thoughts or emotions into shared community surfaces.

Sanctuary is intentionally constrained.
It is designed to be **safe, removable, and non-addictive**.

---

## Why Sanctuary Exists

We belong is built around _belonging through presence_.  
That presence breaks down when users carry unprocessed emotional load into shared spaces.

Sanctuary exists to:

- Reduce emotional overflow into community areas
- Allow users to release thoughts without identity or permanence
- Protect the tone and stability of the core product

Sanctuary is not meant to grow engagement.  
It is meant to **reduce friction elsewhere**.

---

## Core Principles

### 1. Anonymity (Without Escape)

- Users are anonymous to other users
- Internally traceable for safety and abuse prevention
- Anonymity protects vulnerability, not harmful behavior

### 2. Ephemerality (Without Drama)

- All content expires automatically after 24 hours
- No archives, history, or resurfacing
- No countdowns or urgency mechanics

Nothing is meant to be revisited.

### 3. Acknowledgment (Without Conversation)

- Emoji reactions exist only to signal “seen”
- No replies, threads, or discussion
- No engagement amplification

Silence is allowed.

### 4. Exit Over Retention

- Sanctuary always provides a clear exit path
- Copy reinforces belonging _outside_ Sanctuary
- The experience discourages lingering

Sanctuary should feel easy to leave.

---

## What Sanctuary Is

- A temporary container for thoughts
- A one-way emotional release
- A tool, not a destination
- Optional and low-prominence

---

## What Sanctuary Is Not

Sanctuary is **not**:

- A community
- A support group
- A chat system
- A social graph
- A growth or retention surface

There are intentionally **no**:

- Profiles
- Histories
- Threads
- Likes or counts
- Streaks or reminders
- Follow mechanics
- Notifications

If a feature increases time spent, it does not belong here.

---

## Feature Flag Policy

Sanctuary is fully gated behind `SANCTUARY_ENABLED`.

When disabled:

- No Sanctuary routes are accessible
- No Sanctuary UI is rendered
- No data is exposed
- No background processes run

Sanctuary can be removed without migrations or side effects.

---

## Success Criteria (Internal)

Sanctuary is considered successful if:

- Some users use it occasionally
- Emotional spillover into shared spaces decreases
- Community tone remains healthier
- Usage does **not** show strong retention patterns

Low engagement is acceptable.  
Dependency is not.

---

## Failure Conditions

Sanctuary should be reconsidered or removed if:

- Users return repeatedly instead of moving on
- It becomes a primary interaction surface
- Requests arise for history, replies, or customization
- Moderation overhead increases
- It competes with core Panchnity flows

---

## Final Note

Sanctuary is a **safety valve**, not a feature bet.

Its purpose is to quietly support emotional regulation so that _Panchnity_ can remain a place of shared humanity — not unfiltered pain.

If Sanctuary disappears one day and no one notices,
it means it worked exactly as intended.
