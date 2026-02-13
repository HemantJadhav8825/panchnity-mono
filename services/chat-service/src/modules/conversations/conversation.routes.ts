import { Router } from 'express';
import { authenticate } from '../../middleware/auth';
import { ConversationController } from './conversation.controller';

const router = Router();

router.get('/', authenticate, ConversationController.list);
router.post('/', authenticate, ConversationController.create);
router.patch('/:id/settings', authenticate, ConversationController.updateSettings);
router.put('/:id/read', authenticate, ConversationController.markAsRead);

export default router;
