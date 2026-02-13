# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Panchnity is a mental health-focused social platform monorepo built with TypeScript. It uses pnpm workspaces with Turborepo for build orchestration.

## Common Commands

```bash
pnpm install             # Install all dependencies
pnpm dev                 # Start all apps and services in parallel
pnpm dev:apps            # Start only frontend and backend
pnpm dev:services        # Start only backend services
pnpm dev:gateway         # Start only the API gateway (backend)
pnpm dev:chat            # Start only chat-service
pnpm dev:frontend        # Start only frontend
pnpm build               # Build all projects
pnpm lint                # Run ESLint across workspace
pnpm check:consistency   # Verify package version synchronization
```

## Architecture

### Monorepo Structure

```
apps/
  frontend/      # Next.js 16 web app (port 4002)
  backend/       # API Gateway - proxies to services (port 4000)
  admin-panel/   # Placeholder for admin UI

services/
  auth-service/  # Authentication, users, JWT tokens (port 4100)
  chat-service/  # Real-time chat, messages, vents, moderation (port 4200)

packages/
  types/         # Shared TypeScript interfaces and Zod schemas
  utils/         # Shared utilities (logger)
  events/        # Shared event definitions (e.g., GlobalEvents enum)
  auth-internal/ # Internal auth utilities (WIP)
  internal-clients/ # Internal service-to-service clients (WIP)
  ui/            # Shared UI components
```

### Service Communication Pattern

The `backend` app acts as an API Gateway. Frontend calls the gateway, which:
1. Validates JWT tokens locally using `AUTH_PUBLIC_KEY`
2. Proxies requests to appropriate microservices (auth-service, chat-service)
3. Handles CORS and authentication middleware

All services use MongoDB (Mongoose) for persistence. The gateway is stateless.

### Frontend Architecture

- Next.js 16 App Router with route groups: `(app)`, `(auth)`
- Context providers: `AuthProvider`, `UsersProvider`, `ConversationsProvider`
- API client at `src/api/` with service modules (auth, chat, user, socket)
- Theme provider using `next-themes`

## Service Ports

| Service       | Port |
|---------------|------|
| Frontend      | 4002 |
| Backend       | 4000 |
| Auth Service  | 4100 |
| Chat Service  | 4200 |

## Environment Variables

Each app/service has its own `.env.example`. Key variables:

**Backend (gateway):**
- `PORT`, `AUTH_SERVICE_BASE_URL`, `AUTH_PUBLIC_KEY`, `CORS_ALLOWED_ORIGINS`

**Auth-service:**
- `PORT`, `DATABASE_URL`, `JWT_PRIVATE_KEY`, `JWT_PUBLIC_KEY`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`

**Chat-service:**
- `PORT`, `MONGO_URI`, `JWT_PUBLIC_KEY` (for token verification)

**Frontend:**
- `PORT`, `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_GOOGLE_CLIENT_ID`

## Feature Flags

- `SANCTUARY_ENABLED=true` - Enables experimental Sanctuary module features (vents, circles). Controlled via environment variable in backend and chat-service.

## Git Workflow

- Branch prefixes: `feat/`, `fix/`, `chore/`
- Direct commits to `main` are blocked by CI
- All changes must come via Pull Requests (merge commits only)

## Key Files to Understand

- `apps/backend/src/app.ts` - Gateway Express app setup, CORS, routes
- `apps/backend/src/routes/api.routes.ts` - Service proxy routes
- `apps/backend/src/auth/auth.middleware.ts` - JWT validation middleware
- `services/auth-service/src/modules/auth/` - Auth logic (Google OAuth, local auth)
- `services/chat-service/src/modules/` - Chat, messages, moderation, vents modules
- `packages/types/src/index.ts` - Shared DTOs (ShareDTO, CommentDTO, etc.)

## Database Names

| Service       | Database                |
|---------------|------------------------|
| auth-service  | `panchnity_auth`       |
| chat-service  | `panchnity_chat`       |