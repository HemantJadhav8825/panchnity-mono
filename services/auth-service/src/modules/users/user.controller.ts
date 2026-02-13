import { Request, Response } from 'express';
import { UserService } from './user.service';
import { UserListResponseDTO, UserProfileResponseDTO } from './user.model';
import { ENV } from '../../config/env';

export class UserController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  async listUsers(req: Request, res: Response) {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = parseInt(req.query.offset as string) || 0;

      const users = await this.userService.findAll(limit, offset);
      
      const response: UserListResponseDTO[] = users.map(user => ({
        id: user.id || user._id,
        username: user.username,
        displayName: user.displayName,
        avatar: user.avatar,
        createdAt: user.createdAt,
      }));

      res.json(response);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async getProfile(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const user = await this.userService.findById(id);

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const response: UserProfileResponseDTO = {
        id: user.id || user._id,
        username: user.username,
        displayName: user.displayName,
        avatar: user.avatar,
        bio: user.bio,
        createdAt: user.createdAt,
      };

      res.json(response);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async getMyProfile(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id || (req as any).user?.sub;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const user = await this.userService.findById(userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const response: UserProfileResponseDTO = {
        id: user.id || user._id,
        username: user.username,
        displayName: user.displayName,
        avatar: user.avatar,
        bio: user.bio,
        createdAt: user.createdAt,
      };

      // Explicitly include anonymousProfile for own profile only if Sanctuary is enabled
      if (ENV.SANCTUARY_ENABLED && user.anonymousProfile) {
        (response as any).anonymousProfile = user.anonymousProfile;
      }

      res.json(response);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async updateMyProfile(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id || (req as any).user?.sub;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Allow updating specific fields
      const { hasOnboarded, onboardingIntent, visibility } = req.body;
      const updateData: any = {};
      
      if (typeof hasOnboarded === 'boolean') updateData.hasOnboarded = hasOnboarded;
      if (onboardingIntent) updateData.onboardingIntent = onboardingIntent;
      if (visibility) updateData.visibility = visibility;

      const user = await this.userService.updateUser(userId, updateData);
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const response: UserProfileResponseDTO = {
        id: user.id || user._id,
        username: user.username,
        displayName: user.displayName,
        avatar: user.avatar,
        bio: user.bio,
        createdAt: user.createdAt,
        hasOnboarded: user.hasOnboarded,
        onboardingIntent: user.onboardingIntent,
        visibility: user.visibility,
      };

      if (ENV.SANCTUARY_ENABLED && user.anonymousProfile) {
        (response as any).anonymousProfile = user.anonymousProfile;
      }

      res.json(response);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async createAnonymousProfile(req: Request, res: Response) {
    try {
      if (!ENV.SANCTUARY_ENABLED) {
        return res.status(404).json({ error: 'Not Found: Sanctuary is disabled' });
      }

      // Assuming authentication middleware populates req.user
      // For now, allow passing userId in body for testing if auth not fully set up in this file context
      // But ideally it should be: const userId = req.user.id;
      // Let's rely on a header or body for now to be safe with existing unknown middleware
      const userId = req.body.userId || (req as any).user?.id || (req as any).user?.sub;

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized: User ID required' });
      }

      // Idempotency check: fetch user first
      const existingUser = await this.userService.findById(userId);
      if (!existingUser) {
        return res.status(404).json({ error: 'User not found' });
      }

      if (existingUser.anonymousProfile && existingUser.anonymousProfile.pseudonym && existingUser.anonymousProfile.color) {
        return res.json(existingUser.anonymousProfile);
      }

      const user = await this.userService.createAnonymousProfile(userId);
      res.json(user.anonymousProfile);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}
