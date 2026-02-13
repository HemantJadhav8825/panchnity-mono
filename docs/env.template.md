# Environment Configuration Guide

This document defines the environment variable requirements for the "Panchnity" monorepo.

## 🛠️ Local Development (`.env.local`)

Each service should have a `.env.local` file. Local development relies on the **Shared Port Matrix** located at [/.infra/environment/.env.ports](file:///Users/hemantjadhav/Desktop/projects/hold%20yourself/infra/environment/.env.ports).

### Shared Principles

- All `NEXT_PUBLIC_` variables are exposed to the browser.
- Service-to-service communication uses internal ports from the Matrix.

---

## 🚀 Production Environment (`.env`)

For production, variables should be set in your CI/CD provider (e.g., GitHub Secrets, Vercel Envs) or a secure `.env` file on the server.

### Frontend (Next.js)

| Variable                          | Description                       | Example                                     |
| :-------------------------------- | :-------------------------------- | :------------------------------------------ |
| `NEXT_PUBLIC_API_URL`             | Base URL for the Backend Gateway  | `https://api.panchnity.com`              |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID`    | Production Google OAuth Client ID | `prod-google-id.apps.googleusercontent.com` |
| `NEXT_PUBLIC_GOOGLE_REDIRECT_URI` | Production Redirect URI           | `https://panchnity.com/login`            |

### Backend Gateway

| Variable                | Description                     | Example                              |
| :---------------------- | :------------------------------ | :----------------------------------- |
| `PORT`                  | Gateway listening port          | `3000`                               |
| `AUTH_SERVICE_BASE_URL` | Internal URI for Auth Service   | `http://localhost:3100` (within VPC) |
| `AUTH_PUBLIC_KEY`       | Public key for JWT verification | `-----BEGIN PUBLIC KEY...`           |

### Auth Service

| Variable               | Description                          | Example                                          |
| :--------------------- | :----------------------------------- | :----------------------------------------------- |
| `PORT`                 | Auth service listening port          | `3100`                                           |
| `DATABASE_URL`         | Production MongoDB Connection String | `mongodb+srv://user:pass@cluster.mongodb.net/db` |
| `JWT_PRIVATE_KEY`      | Private key for signing tokens       | `-----BEGIN PRIVATE KEY...`                      |
| `GOOGLE_CLIENT_ID`     | Production Google OAuth ID           | `...`                                            |
| `GOOGLE_CLIENT_SECRET` | Production Google OAuth Secret       | `...`                                            |

---

## 🔐 Security Best Practices

1.  **Never commit `.env` or `.env.local` files.** They are ignored by `.gitignore`.
2.  **Use `openssl`** to generate keys for JWT:
    ```bash
    ssh-keygen -t rsa -b 4096 -m PEM -f jwt.key
    openssl rsa -in jwt.key -pubout -outform PEM -out jwt.key.pub
    ```
3.  **Strict Validation**: The application will throw an error if required environment variables are missing at startup.
