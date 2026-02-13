import { Request } from 'express';

export interface IdentityContext {
  userId: string;
  role: string;
  scopes: string[];
}

// Extend Express Request to include auth context
declare global {
  namespace Express {
    interface Request {
      auth?: IdentityContext;
    }
  }
}
