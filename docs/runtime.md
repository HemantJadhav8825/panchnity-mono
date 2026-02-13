# Runtime Topology – Panchnity

_Generated on: 2026-02-01_

## Overview

Panchnity is a monorepo-based microservices architecture. The **Backend Gateway (BFF)** acts as the primary entry point for all client-side applications (Frontend and Admin Panel). Authentication is centralized in the **Auth Service**, which the Gateway proxies to for login and session management.

## Local Ports

| Component              | Type              | Port        | Base URL                | Source                      |
| :--------------------- | :---------------- | :---------- | :---------------------- | :-------------------------- |
| `backend`              | App (BFF/Gateway) | 3000        | `http://localhost:3000` | `.env`, `server.ts`         |
| `auth-service`         | Service (Auth)    | 3001        | `http://localhost:3001` | `.env`, `server.ts`         |
| `frontend`             | App (UI)          | **MISSING** | **AMBIGUOUS**           | `package.json` (no scripts) |
| `admin-panel`          | App (UI)          | **MISSING** | **AMBIGUOUS**           | `package.json` (no scripts) |
| `notification-service` | Service           | **MISSING** | **AMBIGUOUS**           | `package.json` (no scripts) |
| `payment-service`      | Service           | **MISSING** | **AMBIGUOUS**           | `package.json` (no scripts) |

> [!WARNING]
> Skeleton components (`frontend`, `admin-panel`, etc.) do not yet have ports defined in their respective `package.json` or `.env` files. These will need to be assigned during implementation.

## Communication Rules

1.  **Gateway-First**: All Frontend and Admin Panel requests must flow through the `backend` gateway.
2.  **Auth Delegation**: The `backend` gateway proxies auth requests (`/auth/*`) to the `auth-service`.
3.  **Local Validation**: Downstream services and the gateway validate JWTs locally using the `AUTH_PUBLIC_KEY` (RS256) to avoid unnecessary network calls to the auth-service.
4.  **Zero-DB trust boundary**: The Gateway (`backend`) has no database access. Only leaf services (`auth-service`, `payment-service`, etc.) are permitted to connect to their respective databases.

## Environment Variable Contract

### `backend` (Gateway)

- `PORT`: Port to listen on (default 3000).
- `AUTH_SERVICE_BASE_URL`: URL of the auth service (e.g., `http://localhost:3001`).
- `AUTH_PUBLIC_KEY`: RSA Public Key for JWT validation.
- `AUTH_ISSUER`: Expected JWT issuer (`panchnity-auth`).

### `auth-service`

- `PORT`: Port to listen on (default 3001).
- `JWT_PRIVATE_KEY`: RSA Private Key for signing.
- `JWT_PUBLIC_KEY`: RSA Public Key for validation.
- `DATABASE_URL`: MongoDB connection string.
