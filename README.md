# Panchnity

> A mental health-focused social platform designed to foster meaningful connections without the pressure of metrics.

![Project Status](https://img.shields.io/badge/status-active-success.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Workspaces](https://img.shields.io/badge/monorepo-turborepo-ef4444.svg)

---

**Panchnity** (formerly We belong) is a production-ready monorepo workspace built for scalability and performance. It leverages modern web technologies to deliver a secure, responsive, and intuitive user experience.

## 🛠️ Tech Stack

- **Frameworks**: [Next.js 16](https://nextjs.org/), [Node.js](https://nodejs.org/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **State Management**: React Context / Hooks
- **Database**: MongoDB (via Mongoose)
- **Monorepo Tools**: [PNPM Workspaces](https://pnpm.io/workspaces), [Turborepo](https://turbo.build/)
- **Infrastructure**: Docker

> [!NOTE]
> **Sanctuary Module (v0)**
> The Sanctuary module is currently in v0 and disabled by default. Setup `SANCTUARY_ENABLED=true` to enable experimental features.

## 🏗️ Project Structure

The project is organized as a monorepo:

### 📱 Applications (`apps/`)

- **[frontend](./apps/frontend)**: The main Next.js web application for users.
- **[backend](./apps/backend)**: Core API Gateway and microservices orchestrator.

### 🔧 Services (`services/`)

- **[auth-service](./services/auth-service)**: Handles user authentication, registration, and session management.
- **[chat-service](./services/chat-service)**: Real-time chat functionality and message history.

### 📦 Packages (`packages/`)

- **[@panchnity/ui](./packages/ui)**: Shared, reusable UI components.
- **[@panchnity/utils](./packages/utils)**: Common helper functions and logic.
- **[@panchnity/types](./packages/types)**: Shared TypeScript definitions and Zod schemas.

### ⚙️ Infrastructure (`infra/`)

- Docker configurations
- Terraform scripts
- Environment management

---

## 🚀 Getting Started

Follow these steps to set up the project locally.

### Prerequisites

- **Node.js**: v18+
- **PNPM**: v8+ (`npm install -g pnpm`)
- **Docker**: (Optional, for running services via container)

### Installation

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/HemantJadhav8825/panchnity-mono.git
    cd panchnity-mono
    ```

2.  **Install dependencies:**

    ```bash
    pnpm install
    ```

3.  **Environment Setup:**
    - Copy `.env.example` to `.env` in `apps/frontend`, `services/auth-service`, etc.
    - Configure your database URIs and API keys.

4.  **Start Development Server:**
    ```bash
    pnpm dev
    ```
    This command starts all applications and services in parallel.

### Helpful Commands

| Command                  | Description                               |
| :----------------------- | :---------------------------------------- |
| `pnpm dev`               | Start the entire development stack.       |
| `pnpm dev:apps`          | Run only frontend and backend apps.       |
| `pnpm dev:services`      | Run backend services only.                |
| `pnpm build`             | Build all projects for production.        |
| `pnpm lint`              | Run ESLint across the workspace.          |
| `pnpm clean`             | detailed clean up of `node_modules`.      |
| `pnpm check:consistency` | Ensure package versions are synchronized. |

### Service Ports

| Service       | Port |
| :------------ | :--- |
| Frontend      | 4002 |
| Backend       | 4000 |
| Auth Service  | 4100 |
| Chat Service  | 4200 |

## 🛡️ Best Practices

- **Strict Port Strategy**: All services run on assigned ports defined in `.env`.
- **Branching Strategy**: Use `feat/`, `fix/`, `chore/` prefixes for all branches. PRs are required for `main`.
- **Commit Messages**: Follow consistent commit message conventions (Conventional Commits).

## 🤝 Contributing

1.  Fork the repository.
2.  Create a feature branch (`git checkout -b feat/amazing-feature`).
3.  Commit your changes (`git commit -m 'feat: Add amazing feature'`).
4.  Push to the branch (`git push origin feat/amazing-feature`).
5.  Open a Pull Request.

## 📄 License

This project is licensed under the MIT License.
