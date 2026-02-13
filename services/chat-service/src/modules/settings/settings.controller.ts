import { Response } from 'express';
import { AuthRequest } from '../../middleware/auth';
import { SettingsService } from './settings.service';

export class SettingsController {
  static async get(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.sub;
      const settings = await SettingsService.getSettings(userId);
      res.json(settings);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  static async update(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.sub;
      const { showReadReceipts, muteUnreadBadges } = req.body;
      
      // Validate input type
      if (showReadReceipts !== undefined && typeof showReadReceipts !== 'boolean') {
        return res.status(400).json({ error: 'showReadReceipts must be a boolean' });
      }
      if (muteUnreadBadges !== undefined && typeof muteUnreadBadges !== 'boolean') {
        return res.status(400).json({ error: 'muteUnreadBadges must be a boolean' });
      }
      
      const settings = await SettingsService.updateSettings(userId, { showReadReceipts, muteUnreadBadges });
      res.json(settings);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }
}
