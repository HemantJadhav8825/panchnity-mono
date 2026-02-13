import { Router } from 'express';
import { authenticate } from '../../middleware/auth';
import { ModerationController } from './moderation.controller';

const router = Router();

router.post('/block', authenticate, ModerationController.blockUser);
router.delete('/block/:blockedUserId', authenticate, ModerationController.unblockUser);
router.get('/blocked', authenticate, ModerationController.getBlockedUsers);
router.post('/report', authenticate, ModerationController.reportConversation);
router.get('/reports', authenticate, ModerationController.getReports);

export default router;
