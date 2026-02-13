# Environment Validation - Quick Reference

## ✅ Implementation Complete

Strict build-time environment validation is now enforced for all required variables.

## Required Variables (8 total)

```bash
PORT
NEXT_PUBLIC_API_URL
NEXT_PUBLIC_SITE_URL
NEXT_PUBLIC_GOOGLE_CLIENT_ID
NEXT_PUBLIC_GOOGLE_REDIRECT_URI
NEXT_PUBLIC_CHAT_SERVICE_URL
NEXT_PUBLIC_CHAT_API_URL
ALLOWED_DEV_ORIGINS
```

## Files Modified

1. **`src/config/env.ts`** - Strict validation module
2. **`next.config.js`** - Imports validation at build time

## Usage in Code

```typescript
import { env } from "@/config/env";

// ✅ Type-safe, validated
const apiUrl = env.NEXT_PUBLIC_API_URL;

// ❌ Avoid
const apiUrl = process.env.NEXT_PUBLIC_API_URL;
```

## Adding New Variables

1. Add to `REQUIRED_ENV_VARS` array in `src/config/env.ts`
2. Add to exported `env` object
3. Set in `.env.local`, CI, and deployment platform

## Behavior

| Command      | Behavior                               |
| ------------ | -------------------------------------- |
| `next dev`   | Fails at startup if variables missing  |
| `next build` | Fails immediately if variables missing |
| CI/CD        | Pipeline fails if variables missing    |
| Docker       | Build fails if variables missing       |
| Vercel       | Deployment fails if variables missing  |

## Testing

```bash
# Test validation (should fail without .env.local)
npx tsx src/config/env.ts

# Verify dev server (should succeed with .env.local)
pnpm dev

# Verify build (should succeed with .env.local)
pnpm build
```

## No Defaults Policy

**CRITICAL**: This implementation has ZERO defaults. Missing or empty variables ALWAYS cause build failure.
