import axios from 'axios';
import { AUTH_CONFIG } from '../auth/auth.config';

export const validateDeps = async () => {
  console.log('🔍 Validating external dependencies...');

  const maxRetries = 10;
  const retryDelay = 3000;

  for (let i = 0; i < maxRetries; i++) {
    try {
      // Check if Auth Service is reachable via its health endpoint
      await axios.get(`${AUTH_CONFIG.SERVICE_URL}/health`, { timeout: 2000 });
      console.log(`✅ Dependency check: Auth Service at ${AUTH_CONFIG.SERVICE_URL} is REACHABLE.`);
      return; // Success, exit function
    } catch (err: any) {
      console.warn(`⏳ Waiting for Auth Service... (Attempt ${i + 1}/${maxRetries})`);
      if (i === maxRetries - 1) {
        console.error(`❌ FATAL: Dependency check FAILED. Auth Service at ${AUTH_CONFIG.SERVICE_URL} is UNREACHABLE.`);
        console.error(`   Error: ${err.message}`);
        process.exit(1);
      }
      await new Promise((resolve) => setTimeout(resolve, retryDelay));
    }
  }
};
