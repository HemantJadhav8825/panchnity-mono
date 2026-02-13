import { Router } from 'express';
import { UserController } from './user.controller';
import { authenticate, optionalAuthenticate } from '../../middleware/auth';

const router = Router();
const controller = new UserController();

router.get('/', optionalAuthenticate, (req, res) => controller.listUsers(req, res));
router.get('/profile', authenticate, (req, res) => controller.getMyProfile(req, res)); // Specific route first
router.patch('/profile', authenticate, (req, res) => controller.updateMyProfile(req, res));
router.get('/:id', optionalAuthenticate, (req, res) => controller.getProfile(req, res));
router.post('/anonymous', authenticate, (req, res) => controller.createAnonymousProfile(req, res));

export default router;
