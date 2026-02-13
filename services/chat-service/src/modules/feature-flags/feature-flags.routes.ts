import { Router } from 'express';
import { FeatureFlagsController } from './feature-flags.controller';
import { authenticate, authorize } from '../../middleware/auth';

const router = Router();

// All feature flag routes require authentication and admin access
router.get('/', authenticate, authorize('admin'), FeatureFlagsController.listFlags);
router.put('/:flagName', authenticate, authorize('admin'), FeatureFlagsController.updateFlag);

export default router;
