import { Request, Response } from 'express';
import { VentService } from './vent.service';
import { FeatureFlagsService } from '../feature-flags/feature-flags.service';

export class VentController {
  private ventService: VentService;

  constructor() {
    this.ventService = new VentService();
  }

  private checkSanctuaryEnabled(res: Response): boolean {
    if (!FeatureFlagsService.isEnabled('SANCTUARY_ENABLED')) {
      res.status(404).json({ error: 'Sanctuary is not enabled' });
      return false;
    }
    return true;
  }

  async createVent(req: Request, res: Response) {
    if (!this.checkSanctuaryEnabled(res)) return;

    try {
      const user = (req as any).user;
      
      if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      if (!user.anonymousProfile || !user.anonymousProfile.pseudonym || !user.anonymousProfile.color) {
        return res.status(403).json({ 
          error: 'Forbidden: Complete anonymous profile required',
          details: 'Your session may be stale. Please try re-entering Sanctuary.' 
        });
      }

      const { content } = req.body;
      if (!content || typeof content !== 'string') {
        return res.status(400).json({ error: 'Content is required' });
      }

      // Enforce 280 char limit and text-only (very basic sanitization for v0)
      const sanitizedContent = content.replace(/<[^>]*>?/gm, '').trim().substring(0, 280);

      const vent = await this.ventService.create({
        content: sanitizedContent,
        author: {
          id: user.sub,
          pseudonym: user.anonymousProfile.pseudonym,
          color: user.anonymousProfile.color
        },
      });

      // Don't leak internal id in response
      const response = vent.toJSON();
      if (response.author) {
        delete response.author.id;
      }
      
      
      res.status(201).json(response);
    } catch (error: any) {
      if (error.message.includes('Limit reached')) {
        return res.status(429).json({ error: error.message });
      }
      res.status(500).json({ error: error.message });
    }
  }

  async getRecentFeed(_req: Request, res: Response) {
    if (!this.checkSanctuaryEnabled(res)) return;

    try {
      const limit = 20; // Hardcoded v0 limit
      const vents = await this.ventService.getRecentFeed(limit);
      res.json(vents);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async addReaction(req: Request, res: Response) {
    if (!this.checkSanctuaryEnabled(res)) return;

    try {
      const userId = (req as any).user?.sub;
      if (!userId) return res.status(401).json({ error: 'Unauthorized' });

      const { type } = req.body;
      const vent = await this.ventService.addReaction(req.params.id, userId, type);
      
      if (!vent) {
        return res.status(404).json({ error: 'Vent not found' });
      }

      res.json(vent);
    } catch (error: any) {
      if (error.message.includes('already reacted')) {
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: error.message });
    }
  }
}
