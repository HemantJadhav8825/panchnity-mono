# ENV + DB + PORT MATRIX: Panchnity

## 1. Overview

This document provides a low-level, factual mapping of environment configurations, database connections, and runtime ports across the "Panchnity" monorepo. It serves as a source of truth for system synchronization and deployment planning.

---

## 2. Environment Variables by Workspace

| Workspace Name                | Path                    | Environment Variable    | Required | Source                            |
| :---------------------------- | :---------------------- | :---------------------- | :------: | :-------------------------------- |
| `@panchnity/backend`      | `apps/backend`          | `PORT`                  |   Yes    | `validateEnv.ts` / `.env`         |
| `@panchnity/backend`      | `apps/backend`          | `AUTH_SERVICE_BASE_URL` |   Yes    | `validateEnv.ts` / `.env`         |
| `@panchnity/backend`      | `apps/backend`          | `AUTH_PUBLIC_KEY`       |   Yes    | `validateEnv.ts` / `.env`         |
| `@panchnity/backend`      | `apps/backend`          | `AUTH_ISSUER`           |    No    | `.env`                            |
| `@panchnity/auth-service` | `services/auth-service` | `PORT`                  |   Yes    | `validateEnv.ts` / `.env`         |
| `@panchnity/auth-service` | `services/auth-service` | `DATABASE_URL`          |   Yes    | `validateEnv.ts` / `.env`         |
| `@panchnity/auth-service` | `services/auth-service` | `JWT_PRIVATE_KEY`       |   Yes    | `validateEnv.ts` / `.env`         |
| `@panchnity/auth-service` | `services/auth-service` | `JWT_PUBLIC_KEY`        |   Yes    | `validateEnv.ts` / `.env`         |
| `@panchnity/auth-service` | `services/auth-service` | `NODE_ENV`              |    No    | `env.ts` (fallback 'development') |

---

## 3. Database Mapping per Service

| Service Name           | Database Type | Database Name         | Connection Env Var | Status             |
| :--------------------- | :------------ | :-------------------- | :----------------- | :----------------- |
| `auth-service`         | MongoDB       | `panchnity_auth`      | `DATABASE_URL`     | **ACTIVE**         |
| `chat-service`         | MongoDB       | `panchnity_chat`      | `MONGO_URI`        | **ACTIVE**         |
| `payment-service`      | Postgres      | UNKNOWN               | UNKNOWN            | **NOT SET UP YET** |
| `notification-service` | None          | N/A                   | N/A                | **NOT SET UP YET** |
| `user-service`         | MongoDB       | `hold_yourself_users` | `DATABASE_URL`     | **PLANNED**        |
| `backend`              | None          | N/A                   | N/A                | **NO ACCESS**      |
| `admin-panel`          | None          | N/A                   | N/A                | **NO ACCESS**      |
| `frontend`             | None          | N/A                   | N/A                | **NO ACCESS**      |
| `marketing-site`       | None          | N/A                   | N/A                | **NO ACCESS**      |

> [!NOTE]
> `payment-service` is planned to use Postgres but currently exists as a skeleton with no database configuration implemented.
> `backend` (Gateway) and frontend apps are stateless in terms of direct database access.

---

## 4. Runtime Ports & URLs

| Component Name         | Type    | Port Number | Port Source  | Base URL (Local)        |
| :--------------------- | :------ | :---------- | :----------- | :---------------------- |
| `backend`              | Gateway | 3000        | env (`PORT`) | `http://localhost:3000` |
| `admin-panel`          | UI      | 3001        | env (`PORT`) | `http://localhost:3001` |
| `frontend`             | UI      | 3002        | env (`PORT`) | `http://localhost:3002` |
| `marketing-site`       | UI      | 3003        | env (`PORT`) | `http://localhost:3003` |
| `auth-service`         | Service | 3100        | env (`PORT`) | `http://localhost:3100` |
| `user-service`         | Service | 3200        | env (`PORT`) | `http://localhost:3200` |
| `payment-service`      | Service | 3201        | env (`PORT`) | `http://localhost:3201` |
| `notification-service` | Service | 3202        | env (`PORT`) | `http://localhost:3202` |
| `chat-service`         | Service | 3206        | env (`PORT`) | `http://localhost:3206` |

---

## 5. Explicit UNKNOWN / AMBIGUOUS ITEMS

- **.env.example Presence:** `.env.example` files have been created for all active workspaces.
- **Skeleton Ports:** All skeleton services now have assigned ports in their `.env.example` files and `package.json` (where applicable).
- **Postgres Details:** `payment-service` is assigned port 3201; exact database name remains pending implementation.
- **Frontend/Admin Entry Points:** `frontend` is set to port 3002 via `next dev -p 3002`.
- **Remote Risks:** Server `hemant` exposes MongoDB (27017) and uses dev ports (5173/5174) in production. See `infra/PORT_COMPARISON.md`.

---

ENV_DB_PORT_MATRIX_COMPLETE
