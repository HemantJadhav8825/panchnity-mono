import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { RegisterSchema, LoginSchema } from './auth.schema';
import { z } from 'zod';

const authService = new AuthService();

export class AuthController {
  async register(req: Request, res: Response) {
    try {
      const validatedData = RegisterSchema.parse(req.body);
      const user = await authService.register(validatedData);
      return res.status(201).json(user);
    } catch (err: any) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ 
          error: 'Validation failed', 
          details: err.errors.map(e => ({ path: e.path, message: e.message })) 
        });
      }
      return res.status(400).json({ error: err.message });
    }
  }

  async login(req: Request, res: Response) {
    try {
      const validatedData = LoginSchema.parse(req.body);
      const result = await authService.login(validatedData.email, validatedData.password);
      return res.json(result);
    } catch (err: any) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ 
          error: 'Validation failed', 
          details: err.errors.map(e => ({ path: e.path, message: e.message })) 
        });
      }
      return res.status(401).json({ error: err.message });
    }
  }

  async refresh(req: Request, res: Response) {
    try {
      const result = await authService.refresh(req.body.refreshToken);
      return res.json(result);
    } catch (err: any) {
      return res.status(401).json({ error: err.message });
    }
  }

  async google(req: Request, res: Response) {
    try {
      const { code, redirectUri } = req.body;
      if (!code) {
        return res.status(400).json({ error: 'Code is required' });
      }
      const result = await authService.googleLogin(code, redirectUri);
      return res.json(result);
    } catch (err: any) {
      return res.status(401).json({ error: err.message });
    }
  }
}
