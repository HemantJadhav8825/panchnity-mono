import dotenv from 'dotenv';
dotenv.config();

import app from './app';
import { validateEnv } from './startup/validateEnv';
import { validateDeps } from './startup/validateDeps';

const start = async () => {
  // 1. Validate Environment
  validateEnv();

  // 2. Validate Dependencies
  await validateDeps();

  const PORT = process.env.PORT;

  app.listen(PORT, () => {
    console.log(`Backend Gateway running on port ${PORT}`);
  });
};

start().catch((err) => {
  console.error('❌ Failed to start Backend Gateway:', err);
  process.exit(1);
});
