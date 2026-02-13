import { Router } from 'express';
import { authenticate } from '../../middleware/auth';
import { messageRateLimiter } from '../../middleware/rate-limit';
import { MessageController } from './message.controller';

const router = Router();

router.get('/:conversationId', authenticate, MessageController.list);
router.post('/', authenticate, messageRateLimiter, MessageController.create);
router.post('/:messageId/delivered', authenticate, MessageController.markDelivered);
router.post('/delivered/batch', authenticate, MessageController.markDeliveredBatch);
router.post('/read/:conversationId', authenticate, MessageController.markRead);

export default router;
