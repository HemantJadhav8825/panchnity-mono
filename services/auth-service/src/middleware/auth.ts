import { Request, Response, NextFunction } from 'express';
import { JwtSigner } from '../security/jwt';

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const payload = JwtSigner.verify(token);
    (req as any).user = payload;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

export const optionalAuthenticate = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return next();
  }

  const token = authHeader.split(' ')[1];
  try {
    const payload = JwtSigner.verify(token);
    (req as any).user = payload;
  } catch (error) {
    // Ignore invalid token in optional auth, treat as guest
  }
  next();
};
