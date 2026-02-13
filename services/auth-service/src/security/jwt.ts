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

export const JwtSigner = {
  sign: (payload: TokenPayload, expiresIn: any): string => {
    // In production, ENV.JWT_PRIVATE_KEY would be loaded from a secret manager
    // RS256 is used for asymmetric signing
    return jwt.sign(payload, ENV.JWT_PRIVATE_KEY, {
      algorithm: 'RS256',
      expiresIn: expiresIn as any,
      issuer: ENV.TOKEN_ISSUER,
    });
  },

  verify: (token: string): TokenPayload => {
    return jwt.verify(token, ENV.JWT_PUBLIC_KEY, {
      algorithms: ['RS256'],
      issuer: ENV.TOKEN_ISSUER,
    }) as TokenPayload;
  }
};
