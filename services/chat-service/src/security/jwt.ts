import jwt from 'jsonwebtoken';
import { ENV } from '../config/env';

export interface TokenPayload {
  sub: string;
  role: string;
  scopes: string[];
  type: 'access' | 'refresh' | 'service';
  anonymousProfile?: {
    pseudonym: string;
    color: string;
  };
}

export const JwtVerifier = {
  verify: (token: string): TokenPayload => {
    return jwt.verify(token, ENV.JWT_PUBLIC_KEY, {
      algorithms: ['RS256'],
      issuer: 'hold-yourself-auth', // Must match auth-service issuer
    }) as TokenPayload;
  }
};
