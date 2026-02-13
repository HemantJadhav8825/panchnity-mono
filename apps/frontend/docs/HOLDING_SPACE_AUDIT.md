# Holding Space Frontend Integration Audit

This document provides a structured overview of the current `apps/frontend` implementation (Next.js App Router) to ensure a safe and seamless integration of **Holding Space**.

---

## 1. Current Frontend Architecture Overview

The frontend is a modern **Next.js 16** application using the **App Router**. It follows a hybrid rendering approach:

- **Server Components**: Used for static/public surfaces (Homepage, SEO).
- **Client Components**: Used for high-interactivity areas (Dashboard, Auth, Chat, Sanctuary).
- **Auth Pattern**: Custom implementation using Axios interceptors and React Context.
- **State Management**: Distributed across specialized React Contexts (`Auth`, `Users`, `Conversations`).

## 2. Routing Tree

```
/ (Homepage)
├── layout.tsx (Root Layout + Context Providers)
├── page.tsx (Public Arrival Surface)
├── (auth)/
│   ├── login/
│   └── signup/
├── dashboard/ (PROTECTED)
│   ├── layout.tsx (AuthGuard + DashShell)
│   ├── page.tsx (Current Feed - TO BE REPLACED)
│   └── profile/
├── sanctuary/
│   ├── layout.tsx
│   ├── page.tsx (Static Entry)
│   ├── feed/
│   └── setup/
├── messages/
└── onboarding/
```

### Key Route Findings:

- **Homepage (`/`)**: Currently a public marketing-style page.
- **Dashboard (`/dashboard`)**: The main authenticated surface. It uses `useAuth` for local protection and renders the `Feed` component.
- **Middleware**: No project-level `middleware.ts` found; protection is enforced at the layout/component level via `AuthGuard`.

## 3. Layout Architecture

- **Root Layout (`src/app/layout.tsx`)**: Wraps the entire app in `AuthProvider`, `UsersProvider`, and `ConversationsProvider`. This is where global state hydrants live.
- **Dashboard Layout (`src/app/dashboard/layout.tsx`)**: Uses `AuthGuard` and `DashShell`.
- **Navigation (`SidebarNav.tsx`)**: Defines the desktop navigation. Sanctuary has been removed from persistent navigation (Milestone 1 requirement).

## 4. Auth Strategy

- **Session Management**: Handled in `AuthContext.tsx`.
- **Tokens**:
  - `accessToken`: Stored in-memory in `client.ts` (volatile).
  - `refresh_token`: Stored in `localStorage`.
- **Guards**: `AuthGuard` component performs a client-side check. If `isLoading` is false and `user` is null, it redirects to `/login`.
- **Safety Concern**: Auth restoration triggers `authService.refresh()` on mount.

## 5. State Management

- **Primary**: React Context.
  - `AuthProvider`: User session and profile.
  - `UsersProvider`: Likely manages user discovery/feeds.
  - `ConversationsProvider`: Real-time chat state.
- **Third-party**: None (No Zustand, Redux, or TanStack Query detected in `package.json`).
- **Data Fetching**: Traditional `useEffect` + service calls pattern.

## 6. API Client Pattern

- **Library**: `axios`.
- **Base URL**: Managed via `env.NEXT_PUBLIC_API_URL`.
- **Interceptors**:
  - **Request**: Automatically attaches `Bearer {accessToken}` if available.
  - **Response**: Robust 401 handling. If a request fails with 401, it attempts a refresh via `axios.post('/auth/refresh')`. If refresh succeeds, it retries the original request.
- **Real-time**: `socket.io-client` managed via `socket.service.ts`, initialized upon successful auth.

## 7. UI System

- **Styling**: Tailwind CSS.
- **Components**: Custom library in `src/components/ui`.
- **Design Language**: Focuses on calm aesthetics (Aura, EmptyQuiet illustrations).
- **Reusable Components for Holding Space**:
  - `Card`: Standard container.
  - `Text / Heading`: Typography system.
  - `ProfileAvatar`: User visuals.
  - `Aura`: Ambient background effects.
  - `Button / Textarea`: Interaction primitives.

## 8. Dashboard Replaceability Assessment

The current dashboard resides at `src/app/dashboard/page.tsx`.

- **Status**: It is a client component that renders `<Feed />`.
- **Dependencies**: The `Feed` component depends on `useUsers`.
- **Assessment**: Safe to replace. Since **Holding Space** is intended to be the root route, the strategy should involve moving `/dashboard` logic to `/` or redirecting authenticated users from `/` to the new Holding Space surface.

## 9. Integration Risks

- **Engagement Metrics**: The current `FeedCard` renders randomized "likes". Additionally, the `TopBar` (mobile) uses a `Heart` icon for dashboard navigation. **Holding Space** must explicitly strip these to maintain "belonging-first" principles.
- **Auth Guard Timing**: Since auth restoration is async (refresh flow), there is a "Coming home..." loading state. Holding Space entry must handle this gracefully.
- **Layout Coupling**: `DashShell` has a fixed sidebar. If Holding Space requires a full-screen or unconventional layout, `DashShell` may need a `fullWidth` prop or a variant.
- **Real-time Collisions**: Socket connection is tied to `AuthContext`. Ensure Holding Space doesn't re-initialize sockets unnecessarily.

## 10. Recommended Integration Plan

1. **Route Migration**:
   - Promote `HoldingSpace` to `src/app/page.tsx`.
   - Implement an "Authenticated Redirect" in `src/app/page.tsx` that renders Holding Space for logged-in users and `ArrivalHeader` for guests.
2. **Component Reuse**:
   - Reuse `DashShell` but consider a `reduced` mode to minimize distraction.
   - Leverage `Aura` and `EmptyQuiet` components to maintain the emotional aesthetic.

3. **Metric Cleanup**:
   - Audit all components for "Like" counts or Engagement "Badges" and remove them before Holding Space goes live.

4. **Auth Hardening**:
   - Move `AuthGuard` logic to a higher level or implement a root `middleware.ts` to prevent layout flashes during token refresh.
