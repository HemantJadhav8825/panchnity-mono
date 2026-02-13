import dotenv from 'dotenv';
dotenv.config();

export const AUTH_CONFIG = {
  // Pointing to the local auth-service
  SERVICE_URL: process.env.AUTH_SERVICE_BASE_URL!,
  
  // Public Key for RS256 validation
  PUBLIC_KEY: process.env.AUTH_PUBLIC_KEY!,
  
  // Expected issuer from auth-service
  ISSUER: process.env.AUTH_ISSUER!,

  // Chat Service URL
  CHAT_SERVICE_URL: process.env.CHAT_SERVICE_URL!,

  // Holding Space Service URL
  HOLDING_SPACE_SERVICE_URL: process.env.HOLDING_SPACE_SERVICE_URL,
};
