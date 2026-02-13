import dotenv from 'dotenv';
dotenv.config();

export const ENV = {
  PORT: process.env.PORT!,
  NODE_ENV: process.env.NODE_ENV || 'development',
  
  // Security
  JWT_PRIVATE_KEY: process.env.JWT_PRIVATE_KEY!,
  JWT_PUBLIC_KEY: process.env.JWT_PUBLIC_KEY!,
  TOKEN_ISSUER: 'hold-yourself-auth',
  ACCESS_TOKEN_EXPIRES_IN: '15m',
  REFRESH_TOKEN_EXPIRES_IN: '7d',
  
  // Database
  DATABASE_URL: process.env.DATABASE_URL!,

  // Google OAuth
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID!,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET!,
  GOOGLE_REDIRECT_URI: process.env.GOOGLE_REDIRECT_URI!,

  // Feature Flags
  SANCTUARY_ENABLED: process.env.SANCTUARY_ENABLED === 'true',
};
