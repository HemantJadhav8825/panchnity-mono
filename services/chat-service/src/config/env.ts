import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

const AUTH_DIR = path.resolve(__dirname, '../../../auth-service');
const PUBLIC_KEY_PATH = path.join(AUTH_DIR, 'public.pem');
export const ENV = {
  PORT: process.env.PORT || '3200',
  NODE_ENV: process.env.NODE_ENV || 'development',

  // Security
  JWT_PUBLIC_KEY: process.env.JWT_PUBLIC_KEY || '',

  // Database
  DATABASE_URL: process.env.DATABASE_URL!,
};
