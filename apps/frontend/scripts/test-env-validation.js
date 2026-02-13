#!/usr/bin/env node

/**
 * Test script to verify environment validation works correctly
 *
 * This script tests both success and failure scenarios:
 * 1. Success: All required variables are present
 * 2. Failure: Missing or empty variables cause immediate failure
 */

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

console.log("🧪 Testing Environment Validation\n");
console.log("━".repeat(60));

// Test 1: Verify validation passes with .env.local
console.log("\n📋 Test 1: Validation with .env.local loaded");
console.log("Expected: ✅ Pass\n");

try {
  // Next.js automatically loads .env.local, so we just need to verify the config loads
  const configPath = path.join(__dirname, "..", "next.config.js");

  // This will trigger the validation when the config is loaded
  require(configPath);

  console.log("✅ Test 1 PASSED: Environment validation successful\n");
} catch (error) {
  console.error("❌ Test 1 FAILED:", error.message);
  process.exit(1);
}

// Test 2: Verify validation fails without environment variables
console.log("━".repeat(60));
console.log("\n📋 Test 2: Validation without environment variables");
console.log("Expected: ❌ Fail with clear error message\n");

try {
  // Clear the require cache to force re-evaluation
  const envPath = path.join(__dirname, "..", "src", "config", "env.ts");
  delete require.cache[require.resolve(envPath)];

  // Temporarily clear environment variables
  const originalEnv = { ...process.env };
  const requiredVars = [
    "PORT",
    "NEXT_PUBLIC_API_URL",
    "NEXT_PUBLIC_SITE_URL",
    "NEXT_PUBLIC_GOOGLE_CLIENT_ID",
    "NEXT_PUBLIC_GOOGLE_REDIRECT_URI",
    "NEXT_PUBLIC_CHAT_SERVICE_URL",
    "NEXT_PUBLIC_CHAT_API_URL",
    "ALLOWED_DEV_ORIGINS",
  ];

  requiredVars.forEach((varName) => {
    delete process.env[varName];
  });

  // This should throw an error
  require(envPath);

  // If we get here, the test failed
  console.error("❌ Test 2 FAILED: Validation should have thrown an error");
  process.exit(1);
} catch (error) {
  if (
    error.message.includes(
      "Build aborted: Required environment variables are missing or empty",
    )
  ) {
    console.log(
      "✅ Test 2 PASSED: Validation correctly failed with expected error\n",
    );
  } else {
    console.error("❌ Test 2 FAILED: Unexpected error:", error.message);
    process.exit(1);
  }
}

console.log("━".repeat(60));
console.log("\n🎉 All tests passed!\n");
console.log("The environment validation system is working correctly.");
console.log("\nNext steps:");
console.log("  1. Run `pnpm build` to verify the full build process");
console.log("  2. Ensure CI/CD pipelines have all required variables set");
console.log("  3. Update deployment documentation\n");
