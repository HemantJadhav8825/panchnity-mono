# The Sanctuary

> [!WARNING]
> **Experimental Feature (v0)**
> The Sanctuary is currently a v0 feature and is disabled by default.
> To enable it, set `SANCTUARY_ENABLED=true` (Backend) and `NEXT_PUBLIC_SANCTUARY_ENABLED=true` (Frontend) in your environment variables.

"The Sanctuary" is a dedicated space within the Panchnity platform designed for safe, anonymous, and ephemeral community interaction. It aims to provide users with a judgment-free zone to share their thoughts and feelings.

## Core Features

### 1. Anonymous Identity System

- **Purpose**: To allow users to interact without revealing their real-world identity, fostering openness and vulnerability.
- **Implementation**:
  - Users are assigned a unique, nature-inspired pseudonym (e.g., "Quiet River", "Brave Oak") and an abstract avatar color.
  - This identity is separate from their main account profile but linked via the `anonymousProfile` field in the user database.
  - **Endpoint**: `POST /v1/users/anonymous` (Auth Service) generates and assigns this profile.

> [!IMPORTANT]
> **Circles & Grouping**: Circles (communities) are explicitly NOT part of Sanctuary v0. Any future grouping logic belongs outside the Sanctuary module to maintain its "quiet moment" philosophy.

### 3. The Vent (Ephemeral Content)

- **Purpose**: A "fire-and-forget" mechanism for releasing emotions. Content is temporary to reduce the pressure of permanence.
- **Implementation**:
  - **Ephemeral Nature**: All posts ("Vents") automatically expire and are deleted after **24 hours**.
  - **Interaction**: Users can react to vents with emojis (Support, Hug, Same, Listen) but cannot leave text comments, minimizing conflict and toxicity.
  - **Feed**: A global feed "The Void" aggregates all vents.
  - **Endpoints**:
    - `GET /v1/vents` (Feed)
    - `POST /v1/vents` (Create Vent)
    - `POST /v1/vents/:id/react` (React)

## Architecture & Data Flow

The Sanctuary follows a microservices architecture to ensure scalability and separation of concerns.

### Frontend (`apps/frontend`)

- **Framework**: Next.js (App Router)
- **Styling**: Tailwind CSS + Shadcn UI
- **API Client**: A unified `client` instance (`src/api/client.ts`) handles:
  - Base URL configuration (`NEXT_PUBLIC_API_URL` -> Gateway)
  - JWT Authentication header injection
  - Automatic token refreshing on 401 errors
- **Environment**:
  - `NEXT_PUBLIC_API_URL`: Points to the Backend Gateway (Port 3000) for general API calls.
  - `NEXT_PUBLIC_CHAT_API_URL`: Points to the Chat Service (Port 3200) for real-time and chat-specific features.

### Backend Gateway (`apps/backend`)

- **Port**: 3000
- **Role**: Sits between the frontend and microservices. It routes requests to the appropriate service based on the URL path.
- **Routes**:
  - `/v1/users/*` -> Proxied to **Auth Service** (Port 3100)
  - `/v1/vents/*` -> Proxied to **Chat Service** (Port 3200)

### Services

#### Auth Service (`services/auth-service`)

- **Port**: 3100
- **Responsibility**: User management, authentication, and profile data.
- **Key Models**: `User` (stores `anonymousProfile`).

#### Chat Service (`services/chat-service`)

- **Port**: 3200
- **Responsibility**: Real-time messaging, Circles, Vents, and Interactions.
- **Key Models**: `Vent`, `Reaction`.
- **Database**: MongoDB (stores ephemeral Vents with TTL indexes for auto-deletion).

## Design Decisions

- **Gateway Pattern**: We use a central gateway (Port 3000) to simplify frontend configuration. The frontend primarily talks to the gateway, which handles routing to the correct microservice.
- **Ephemeral Storage**: Vents are stored with a Time-To-Live (TTL) index in MongoDB, ensuring they are automatically purged from the database after 24 hours without requiring a background cron job.
- **Privacy First**: The anonymous profile is designed to be untraceable to the public eye, though linked internally for moderation purposes.

## Setup & Configuration

To run the Sanctuary locally:

1. **Start Services**:
   - `pnpm dev` in root (starts all services via Turbo).
   - Ensure specific ports are active:
     - Gateway: 3000
     - Auth Service: 3100
     - Chat Service: 3200
     - Frontend: 3002

2. **Environment Variables**:
   - Frontend (`.env.local`):
     ```
     NEXT_PUBLIC_API_URL=http://localhost:3000
     NEXT_PUBLIC_CHAT_API_URL=http://localhost:3200 (Direct connection for socket/chat optimization)
     ```
   - Gateway (`.env`):
     ```
     AUTH_SERVICE_BASE_URL=http://localhost:3100
     CHAT_SERVICE_URL=http://localhost:3200
     ```
