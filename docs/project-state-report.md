# PROJECT STATE REPORT: Panchnity

**Date:** 2026-02-01
**Role:** Senior Platform Engineer
**Scope:** Low-Level Project State Snapshot

---

### 1️⃣ REPOSITORY OVERVIEW

- **Repository Name:** `panchnity`
- **Monorepo Toolchain:**
  - **Package Manager:** `pnpm` (fixed version `10.28.2`)
  - **Orchestration:** `Turborepo`
- **Workspace Layout:**
  - `apps/*` (Client-facing applications and gateways)
  - `services/*` (Backend microservices)
  - `packages/*` (Shared internal libraries)
- **Root Scripts:**
  - `build`: Runs turbo build for all
  - `dev`: Runs turbo dev for all
  - `dev:services`: Runs dev for `./services/*`
  - `dev:apps`: Runs dev for `./apps/*`
  - `dev:gateway`: Runs dev for `@panchnity/backend`
  - `lint`: Runs turbo lint
  - `check:consistency`: Runs consistency check script

---

### 2️⃣ WORKSPACE INVENTORY

| Workspace Name                        | Path                            | Scripts                         | Entry Point     | Dev Script | Runnable |
| :------------------------------------ | :------------------------------ | :------------------------------ | :-------------- | :--------: | :------: |
| `@panchnity/admin-panel`          | `apps/admin-panel`              | None                            | UNKNOWN         |     No     |    No    |
| `@panchnity/backend`              | `apps/backend`                  | `dev`, `build`, `start`         | `src/server.ts` |    Yes     |   Yes    |
| `@panchnity/frontend`             | `apps/frontend`                 | None                            | UNKNOWN         |     No     |    No    |
| `@panchnity/auth-service`         | `services/auth-service`         | `dev`, `build`, `start`, `lint` | `src/server.ts` |    Yes     |   Yes    |
| `@panchnity/notification-service` | `services/notification-service` | None                            | UNKNOWN         |     No     |    No    |
| `@panchnity/payment-service`      | `services/payment-service`      | None                            | UNKNOWN         |     No     |    No    |
| `@panchnity/auth-internal`        | `packages/auth-internal`        | None                            | `src/index.ts`  |     No     | No (Lib) |
| `@panchnity/events`               | `packages/events`               | None                            | `src/index.ts`  |     No     | No (Lib) |
| `@panchnity/internal-clients`     | `packages/internal-clients`     | None                            | `src/index.ts`  |     No     | No (Lib) |
| `@panchnity/types`                | `packages/types`                | None                            | `src/index.ts`  |     No     | No (Lib) |
| `@panchnity/ui`                   | `packages/ui`                   | None                            | `src/index.ts`  |     No     | No (Lib) |
| `@panchnity/utils`                | `packages/utils`                | None                            | `src/index.ts`  |     No     | No (Lib) |

---

### 3️⃣ SERVICE RUNTIME DETAILS

#### `backend` (Gateway/BFF)

- **Port:** 3000
- **Configuration:** `process.env.PORT`
- **Required Env Variables:**
  - `PORT`
  - `AUTH_SERVICE_BASE_URL`
  - `AUTH_PUBLIC_KEY`
- **Startup:** Fail-fast (executes `validateEnv()` and `validateDeps()` before listening).
- **Dependencies:**
  - `auth-service` via `AUTH_SERVICE_BASE_URL`.

#### `auth-service`

- **Port:** 3001
- **Configuration:** `ENV.PORT` (from `src/config/env.ts`)
- **Required Env Variables:**
  - `PORT`
  - `DATABASE_URL`
  - `JWT_PRIVATE_KEY`
  - `JWT_PUBLIC_KEY`
- **Startup:** Fail-fast (executes `validateEnv()` and `validateDeps()` inside try-catch, calling `process.exit(1)` on error).
- **Dependencies:**
  - MongoDB (`DATABASE_URL`).

---

### 4️⃣ AUTH & GATEWAY STATE

- **Auth Service Endpoints:** `/v1/auth/*`
- **Token Types Issued:**
  - `Access Token` (Expires in 15m)
  - `Refresh Token` (Expires in 7d)
- **Gateway Auth Proxy Routes:**
  - `/auth/*` is proxied to `auth-service`.
- **JWT Validation Presence:**
  - Gateway uses `jwtValidationMiddleware` for all routes.
  - Validation is local (RS256) using `AUTH_PUBLIC_KEY`.
- **Identity Propagation:** Decoded JWT context is expected to be attached to the request object (implied by middleware usage).

---

### 5️⃣ DATABASE USAGE

| Service                | DB Type | Connection Mechanism                   | Status                            |
| :--------------------- | :------ | :------------------------------------- | :-------------------------------- |
| `auth-service`         | MongoDB | `mongoose` (implied by `DATABASE_URL`) | ACTIVE (DB: `panchnity_auth`) |
| `payment-service`      | None    | N/A                                    | NO DB YET                         |
| `notification-service` | None    | N/A                                    | NO DB YET                         |
| `backend`              | None    | N/A                                    | NO ACCESS (Gateway)               |
| `frontend`             | None    | N/A                                    | NO ACCESS                         |

---

### 6️⃣ ENVIRONMENT CONFIGURATION

- **Presence:**
  - `.env` files found in `apps/backend` and `services/auth-service`.
  - `.env.example` files are UNKNOWN (not detected in current crawl).
- **Fallback Patterns:**
  - Hardcoded fallback for `NODE_ENV` (`'development'`).
  - Use of `!` (non-null assertion) in `src/config/env.ts` for strictly required variables.
- **Hardcoded Config:**
  - `TOKEN_ISSUER` set to `'panchnity-auth'` in `auth-service`.
  - Token expiration times hardcoded in `auth-service` env config.

---

### 7️⃣ POSTMAN & DOCS STATE

- **Postman Folder Structure:** `postman/` root directory exists.
- **Collections Present:**
  - `auth-service.postman_collection.json`
  - `backend-gateway.postman_collection.json`
  - `notification-service.postman_collection.json`
  - `payment-service.postman_collection.json`
- **Environment File:** `panchnity.postman_environment.json` present.
- **Docs Folder Contents:**
  - `GIT_BRANCHING_STRATEGY.md`
  - `architecture.md`
  - `consistency-report.md`
  - `runtime.md` (Matches current report findings)

---

### 8️⃣ STARTUP & ORCHESTRATION

- **Startup Command:** `pnpm dev` (Triggers `turbo run dev`)
- **Turbo Pipeline:**
  - `build`: Depends on `^build`, outputs `dist/**` and `.next/**`.
  - `dev`: `cache: false`, `persistent: true`.
- **Startup Assumptions:**
  - Services are expected to be available before Gateway completes `validateDeps()`.

---

### 9️⃣ GIT & BRANCH CONTEXT

- **Current Branch:** `main`
- **Remote:** `https://github.com/HemantJadhav8825/panchnity.git`
- **CI Configuration:** `.github/workflows` exists but appears to be empty or contains no detectable workflow files.

---

PROJECT_STATE_REPORT_COMPLETE
