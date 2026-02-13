import { ENV } from '../config/env';

export const validateDeps = async () => {
  console.log('🔍 Validating external dependencies...');

  // 1. Database Connectivity (Placeholder/Contract check)
  if (!ENV.DATABASE_URL.startsWith('mongodb')) {
    console.error('❌ FATAL: Dependency check FAILED. DATABASE_URL is not a valid MongoDB connection string.');
    process.exit(1);
  }
  
  console.log('✅ Dependency check: MongoDB configuration is VALID.');
  
  // 2. Encryption/Security check
  if (ENV.JWT_PRIVATE_KEY.length < 32 || ENV.JWT_PUBLIC_KEY.length < 32) {
    console.warn('⚠️ WARNING: JWT keys appear to be too short. Ensure production keys are securely generated.');
  }
};
