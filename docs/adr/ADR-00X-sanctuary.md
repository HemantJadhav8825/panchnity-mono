# ADR-00X: Introduce Sanctuary as a Feature-Flagged, Ephemeral Release Space

**Status:** Accepted  
**Date:** 2026-02-07  
**Product:** We belong  
**Decision Owner:** Core Platform Team

---

## Context

We belong is designed around belonging through presence and shared humanity.

During product exploration and internal testing, it became clear that users sometimes carry unprocessed emotional load into shared spaces. When this happens, it can:

- Destabilize community tone
- Encourage oversharing before users are ready
- Increase moderation overhead
- Create unhealthy reliance on anonymous spaces

Traditional solutions (comments, DMs, anonymous forums) often increase engagement but worsen these issues by rewarding distress or permanence.

A constrained alternative was needed.

---

## Decision

We will introduce **Sanctuary** as a **feature-flagged, anonymous, and ephemeral module** within We belong.

Sanctuary is intentionally designed as:

- Non-conversational
- Non-retentive
- Fully removable
- Operationally isolated

It exists to support emotional release without becoming a social surface.

---

## Design Principles

### Anonymity Without Escape

- Users are anonymous to each other
- Internally traceable for safety enforcement
- Anonymity protects vulnerability, not abuse

### Ephemerality Without Drama

- All content is automatically deleted after 24 hours
- No archives, history, or resurfacing
- No urgency or countdown framing

### Acknowledgment Without Conversation

- Emoji reactions are limited to acknowledgment
- No replies, threads, or debate
- Silence is a valid outcome

### Exit Over Engagement

- Clear exit paths are always present
- UI discourages lingering or habitual use
- Sanctuary should feel optional and temporary

---

## Scope (v0)

Included:

- Anonymous, text-only vents (≤ 280 characters)
- Emoji-only acknowledgment reactions
- 24-hour automatic expiration via database TTL
- Strict feature flag gating

Explicitly excluded:

- Communities or circles
- Profiles or following
- Chat or direct messages
- History or archives
- Engagement metrics or ranking
- Notifications or reminders

---

## Architecture

- Sanctuary is isolated within the Chat Service
- All routes are gated behind `SANCTUARY_ENABLED`
- Anonymous identity is generated once and stored securely
- Identity data is snapshotted at creation time
- All content is ephemeral and automatically purged

No Sanctuary data is required by core We belong flows.

---

## Consequences

### Positive

- Reduces emotional overflow into shared spaces
- Improves community stability
- Low operational and moderation overhead
- Easy rollback and removal

### Negative

- Not optimized for engagement or retention
- May show low usage metrics
- Requires discipline to prevent scope creep

Low engagement is an acceptable outcome.

---

## Risks & Mitigations

**Risk:** Sanctuary becomes a destination or habit  
**Mitigation:** UX restraint, no retention mechanics, feature flag control

**Risk:** Anonymity abuse  
**Mitigation:** Internal traceability, rate limiting, account-level enforcement

**Risk:** Feature creep  
**Mitigation:** This ADR, strict scope definition, no roadmap commitments

---

## Decision Outcome

Sanctuary will be shipped behind a feature flag and treated as an experimental safety valve.

If Sanctuary increases dependency, engagement loops, or moderation burden, it should be disabled or removed without hesitation.

---

## Final Note

Sanctuary is not a growth initiative.

Its success is measured by what it _prevents_, not what it generates.

If Sanctuary can be removed without users noticing, the decision will be considered correct.
