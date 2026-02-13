import app from './app';
import { ENV } from './config/env';
import { validateEnv } from './startup/validateEnv';
import { validateDeps } from './startup/validateDeps';
import { connectDatabase } from './startup/database';

const start = async () => {
  try {
    // 1. Validate Environment
    validateEnv();

    // 2. Validate Dependencies
    await validateDeps();

    // 3. Connect to Database
    await connectDatabase();

    app.listen(ENV.PORT, () => {
      console.log(`Auth Service running on port ${ENV.PORT}`);
    });
  } catch (err: any) {
    console.error('❌ FATAL: Failed to start Auth Service:');
    console.error(`   - ${err.message || 'Unknown error'}`);
    process.exit(1);
  }
};

start();
