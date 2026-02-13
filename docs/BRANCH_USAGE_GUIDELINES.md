# Branch Usage Guidelines

This document provides practical rules for daily work using the established branching strategy. Follow these steps to ensure consistency and efficiency in the **Panchnity** monorepo.

---

## 1. Pre-Change Checklist

Before you start coding or create a branch, mentally confirm these points:

- [ ] **Type:** Is this a feature, a fix, or a chore?
- [ ] **Primary Scope:** Which main component does it affect? (auth, gateway, frontend, etc.)
- [ ] **Impact:** Is it user-facing, internal logic, or infrastructure?
- [ ] **State Changes:** Does it modify APIs, environment variables, or the DB schema?
- [ ] **Compatibility:** Is this change backward-compatible?

---

## 2. Branch Selection Rules

Follow this table to decide which branch type to use:

| Change Type                      | Branch Type | Example Scenario                                                       |
| :------------------------------- | :---------- | :--------------------------------------------------------------------- |
| New functionality / Enhancements | `feature/*` | Adding a new "User Profile" page or a "Password Reset" flow.           |
| API Additions / Changes          | `feature/*` | Adding a new POST endpoint for user registration.                      |
| UI Refreshes                     | `feature/*` | Updating the global theme to support Dark Mode.                        |
| Bug fixes / Regressions          | `fix/*`     | Fixing a broken login button or correcting a gateway validation error. |
| Critical Security Patch          | `fix/*`     | Patching a vulnerability in a backend dependency.                      |
| UI Layout Glitch                 | `fix/*`     | Fixing a misaligned sidebar on mobile views.                           |
| Maintenance / Tooling / Docs     | `chore/*`   | Updating dependencies, refactoring internal code, or updating READMEs. |
| CI/CD Updates                    | `chore/*`   | Adding a new stage to the GitHub Actions pipeline.                     |
| Config / Env Cleanup             | `chore/*`   | Removing unused environment variable templates.                        |

### Do / Do Not

- **DO** use `feature/` for anything that adds value or changes behavior.
- **DO** use `fix/` for restoring intended behavior.
- **DO NOT** use `feature/` for small refactors (use `chore/`).
- **DO NOT** use `fix/` for adding missing functionality (use `feature/`).

---

## 3. Scope Naming Guidelines

Branches follow the pattern: `type/<scope>-<description>`

### Choosing the `<scope>`

- Pick the **PRIMARY** component touched.
- If multiple services are touched, pick the one where the core logic resides.
- Use one of the approved scopes: `frontend`, `admin`, `gateway`, `auth`, `payment`, `notification`, `infra`, `docs`, `tooling`.

### Examples

- **Auth:** `feature/auth-mfa-support`, `fix/auth-session-leak`, `chore/auth-dep-upgrade`
- **Gateway:** `feature/gateway-rate-limiter`, `fix/gateway-cors-header`, `chore/gateway-log-refactor`
- **Frontend:** `feature/frontend-dashboard-v2`, `fix/frontend-z-index-issue`, `chore/frontend-unused-assets`
- **Payment:** `feature/payment-stripe-webhooks`, `fix/payment-retry-logic`, `chore/payment-secret-rotation`
- **Notification:** `feature/notification-email-templates`, `fix/notification-smtp-timeout`
- **Infra:** `feature/infra-terraform-s3-bucket`, `chore/infra-dockerfile-optimization`
- **Tooling:** `chore/tooling-lint-rules-update`, `chore/tooling-postman-sync-script`

### Strict Prohibitions

- **NO** vague names like `feature/updates` or `fix/bugs`.
- **NO** multiple scopes like `feature/auth-and-gateway-fix`.

---

## 4. Small Change vs. Feature Rules

### Small Changes

_Defined as: Docs-only, internal refactors, config changes, or non-breaking internal tweaks._

- **Grouping:** Multiple small, related chores can be grouped into one `chore/` branch.
- **Branch Requirement:** A new branch is **REQUIRED** for every PR, no matter how small.

### Feature Changes

_Defined as: New endpoints, new flows, new modules, or any breaking changes._

- **Splitting:** If a feature is large, split it into smaller, manageable branches (e.g., `feature/auth-api`, then `feature/auth-ui`).
- **Isolation:** Never mix unrelated features in the same branch.

### Detailed Scenario Examples

| Scenario                           | Branch Name                   | Why?                            |
| :--------------------------------- | :---------------------------- | :------------------------------ |
| Adding "Delete Account" button     | `feature/frontend-delete-btn` | New user-facing functionality.  |
| Fixing typo in "Welcome" email     | `fix/notification-typo`       | Restoring correct content.      |
| Updating `pnpm` version            | `chore/tooling-pnpm-upgrade`  | Purely maintenance/internal.    |
| Adding 10 new API fields           | `feature/gateway-user-fields` | Significant API surface change. |
| Renaming internal private function | `chore/auth-refactor`         | No change in external behavior. |
| Changing DB connection pool size   | `chore/infra-db-pool`         | Internal config tweak.          |

---

## 5. Before Opening a PR (Pre-flight Checklist)

Check these points before submitting your PR to `develop`:

1.  **Naming:** Does the branch name strictly match `type/<scope>-<description>`?
2.  **Scope:** Is the assigned scope accurate for the primary change?
3.  **Isolation:** Are there any unrelated changes or "drift" included?
4.  **Documentation:** Are the docs (README, API specs) updated?
5.  **Critical Changes:** Are ENV, API, or DB changes clearly documented in the PR description?

---

## 6. Merge Flow Reminder

1.  **Development:** `feature|fix|chore/*` → `develop`
2.  **Integration:** `develop` → `main` (via PR only)
3.  **Release:** Tag `main` with `vX.Y.Z` after merging from `develop`.
4.  **Emergency:** `hotfix/*` from `main` → merge to `main` AND `develop` (Only for production outages).

BRANCH_USAGE_GUIDELINES_COMPLETE
