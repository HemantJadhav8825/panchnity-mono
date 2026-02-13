import dotenv from 'dotenv';
dotenv.config();

export const APP_CONFIG = {
  SANCTUARY_ENABLED: process.env.SANCTUARY_ENABLED === 'true',
};
