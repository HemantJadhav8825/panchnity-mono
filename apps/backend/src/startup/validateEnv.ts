export const validateEnv = () => {
  const requiredEnvVars = [
    'PORT',
    'AUTH_SERVICE_BASE_URL',
    'AUTH_PUBLIC_KEY',
    'CORS_ALLOWED_ORIGINS',
  ];

  const missing = requiredEnvVars.filter((v) => !process.env[v]);

  if (missing.length > 0) {
    console.error('❌ FATAL: Missing required environment variables:');
    missing.forEach((v) => console.error(`   - ${v}`));
    process.exit(1);
  }

  console.log('✅ Environment validation successful.');
};
