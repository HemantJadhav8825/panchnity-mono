import { Router } from 'express';
import { authenticate } from '../../middleware/auth';
import { SettingsController } from './settings.controller';

const router = Router();

router.get('/', authenticate, SettingsController.get);
router.patch('/', authenticate, SettingsController.update);

export default router;
