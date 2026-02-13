/**
 * Strict Environment Variable Validation
 * 
 * This module validates all required environment variables at import time.
 * The build WILL FAIL if any required variable is missing or empty.
 * 
 * NO DEFAULTS. NO FALLBACKS. NO RUNTIME-ONLY CHECKS.
 */

// Define all required environment variables
const REQUIRED_ENV_VARS = [
  'PORT',
  'NEXT_PUBLIC_API_URL',
  'NEXT_PUBLIC_SITE_URL',
  'NEXT_PUBLIC_GOOGLE_CLIENT_ID',
  'NEXT_PUBLIC_GOOGLE_REDIRECT_URI',
  'NEXT_PUBLIC_CHAT_SERVICE_URL',
  'NEXT_PUBLIC_CHAT_API_URL',
  'ALLOWED_DEV_ORIGINS',
  // 'NEXT_PUBLIC_SANCTUARY_ENABLED', // Optional, defaults to false
] as const;

type RequiredEnvVar = typeof REQUIRED_ENV_VARS[number];

/**
 * Validates environment variables at import time.
 * Throws an error and aborts the build if any required variable is missing or empty.
 * 
 * IMPORTANT: Only runs in Node.js environment (server-side), not in the browser.
 */
function validateEnvironment(): void {
  // Skip validation in browser environment
  if (typeof window !== 'undefined') {
    return;
  }

  const missingVars: string[] = [];
  const emptyVars: string[] = [];

  for (const varName of REQUIRED_ENV_VARS) {
    const value = process.env[varName];

    if (value === undefined) {
      missingVars.push(varName);
    } else if (value.trim() === '') {
      emptyVars.push(varName);
    }
  }

  if (missingVars.length > 0 || emptyVars.length > 0) {
    console.error('\n❌ ENVIRONMENT VALIDATION FAILED\n');
    console.error('━'.repeat(60));

    if (missingVars.length > 0) {
      console.error('\n🚨 Missing environment variables:');
      missingVars.forEach(varName => {
        console.error(`   • ${varName}`);
      });
    }

    if (emptyVars.length > 0) {
      console.error('\n🚨 Empty environment variables:');
      emptyVars.forEach(varName => {
        console.error(`   • ${varName}`);
      });
    }

    console.error('\n━'.repeat(60));
    console.error('\n💡 Required environment variables:');
    REQUIRED_ENV_VARS.forEach(varName => {
      console.error(`   • ${varName}`);
    });
    console.error('\n━'.repeat(60));
    console.error('\n📝 Please ensure all required variables are set in:');
    console.error('   • .env.local (local development)');
    console.error('   • .env (CI/Docker)');
    console.error('   • Vercel dashboard (production)\n');

    throw new Error('Build aborted: Required environment variables are missing or empty.');
  }
}

// Execute validation immediately at import time (server-side only)
validateEnvironment();

/**
 * Typed environment object for safe usage across the application.
 * 
 * Server-only variables (PORT, ALLOWED_DEV_ORIGINS):
 *   - Available in Node.js environment (build, dev server, API routes, server components)
 *   - Will be empty string in browser environment
 * 
 * Public variables (NEXT_PUBLIC_*):
 *   - Available in both server and client environments
 *   - All values are guaranteed to be non-empty strings after server-side validation
 */
export const env = {
  // Server-only variables (not available in browser)
  PORT: typeof window === 'undefined' ? process.env.PORT! : '',
  ALLOWED_DEV_ORIGINS: typeof window === 'undefined' ? process.env.ALLOWED_DEV_ORIGINS! : '',
  
  // Public variables (available in both server and client)
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL!,
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL!,
  NEXT_PUBLIC_GOOGLE_CLIENT_ID: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
  NEXT_PUBLIC_GOOGLE_REDIRECT_URI: process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI!,
  NEXT_PUBLIC_CHAT_SERVICE_URL: process.env.NEXT_PUBLIC_CHAT_SERVICE_URL!,
  NEXT_PUBLIC_CHAT_API_URL: process.env.NEXT_PUBLIC_CHAT_API_URL!,
  NEXT_PUBLIC_SANCTUARY_ENABLED: process.env.NEXT_PUBLIC_SANCTUARY_ENABLED || 'false',
} as const;

export type Env = typeof env;
