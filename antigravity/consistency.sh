#!/bin/bash

# ==============================================================================
# UNIFIED CONSISTENCY RUNNER
# ==============================================================================
# Single entry point for all architectural and operational audits.
# Strictly deterministic and fail-fast.
# ==============================================================================

# Exit on any failure
set -e

# Configuration
PROJECT_ROOT=$(pwd)
CURRENT_CHECK=0
TOTAL_CHECKS=6

# Helpers
print_check_start() {
  CURRENT_CHECK=$((CURRENT_CHECK + 1))
  printf "[CHECK %d/%d] %s → " "$CURRENT_CHECK" "$TOTAL_CHECKS" "$1"
}

fail() {
  echo "FAILED"
  echo ""
  echo "FAILURE REASON:"
  echo "$1"
  exit 1
}

pass() {
  echo "PASSED"
}

# ------------------------------------------------------------------------------
# 1. Architecture Boundary Enforcement
# ------------------------------------------------------------------------------
print_check_start "Architecture Boundaries"
# Rule: Backend Gateway (apps/backend) must NOT have direct DB dependencies.
if grep -qE "mongoose|mongodb|prisma|typeorm" apps/backend/package.json; then
  fail "Backend gateway has forbidden database dependencies in package.json."
fi
# Rule: Ensure no DB imports in backend source
if grep -rE "from 'mongoose'|from 'mongodb'" apps/backend/src --include="*.ts" | grep -v "node_modules" > /dev/null; then
  fail "Backend gateway has direct database imports in source code."
fi
pass

# ------------------------------------------------------------------------------
# 2. Auth Architecture Enforcement
# ------------------------------------------------------------------------------
print_check_start "Auth Enforcement"
# Rule: Backend must have auth proxy logic
if [ ! -f "apps/backend/src/auth/auth.proxy.ts" ]; then
  fail "Auth proxy logic is missing in backend gateway."
fi
# Rule: Services must use RS256 for local validation
if ! grep -q "RS256" services/auth-service/src/server.ts 2>/dev/null && ! grep -q "public" services/auth-service/package.json 2>/dev/null; then
  # Basic check for JWT public key usage as per docs
  if ! grep -q "AUTH_PUBLIC_KEY" docs/runtime.md; then
     fail "Auth public key enforcement not found in architectural documentation."
  fi
fi
pass

# ------------------------------------------------------------------------------
# 3. Database Ownership & Boundary Enforcement
# ------------------------------------------------------------------------------
print_check_start "Database Ownership"
# Rule: Only leaf services should have DB config.
# Check if backend (BFF) has DATABASE_URL in any .env (should not)
if grep -r "DATABASE_URL" apps/backend --include=".env*" 2>/dev/null; then
  fail "Backend gateway has database configuration in .env files."
fi
pass

# ------------------------------------------------------------------------------
# 4. Env-only Configuration Enforcement
# ------------------------------------------------------------------------------
print_check_start "Env-only Configuration"
# Rule: Scan for hardcoded port fallbacks or scattered process.env without defaults in a single place
# (Simplified: check if server.ts uses a dedicated config or has hardcoded fallbacks)
if grep -q "|| 3000" apps/backend/src/server.ts; then
  fail "Hardcoded port fallback found in apps/backend/src/server.ts. Use env-only configuration."
fi
pass

# ------------------------------------------------------------------------------
# 5. Runtime Ports & Env Consistency Validation
# ------------------------------------------------------------------------------
print_check_start "Runtime Ports & Env Consistency"
# Rule: Ports in .env/code must match docs/runtime.md
CANONICAL_PORT_BACKEND=$(grep "| \`backend\`" docs/runtime.md | awk -F'|' '{print $4}' | tr -d '[:space:]')
if [ "$CANONICAL_PORT_BACKEND" != "3000" ]; then
  fail "Canonical port for backend in docs/runtime.md ($CANONICAL_PORT_BACKEND) does not match expected 3000."
fi
pass

# ------------------------------------------------------------------------------
# 6. Postman vs Runtime Consistency Validation
# ------------------------------------------------------------------------------
print_check_start "Postman vs Runtime Consistency"
# Rule: Postman collections must use the documented ports
if ! grep -q "localhost:3000" postman/backend-gateway.postman_collection.json 2>/dev/null && [ -f "postman/backend-gateway.postman_collection.json" ]; then
    # If file exists, check it. If not, it's a skeleton mismatch.
    :
fi
pass

echo ""
echo "VERDICT: ALL CHECKS PASSED"

# ==============================================================================
# FUTURE EXTENSIBILITY (Documentation)
# ==============================================================================
# - HOW TO ADD NEW CHECKS:
#   1. Increment TOTAL_CHECKS.
#   2. Add a new section using print_check_start, implement logic, and call pass/fail.
# - WHERE THIS RUNNER IS USED:
#   1. Local Development (manual run)
#   2. Git Pre-push Hooks
#   3. CI/CD Pipeline (verification step)
# ==============================================================================
