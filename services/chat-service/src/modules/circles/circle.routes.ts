import { Router } from 'express';
import { CircleController } from './circle.controller';

const router = Router();
const controller = new CircleController();

router.get('/', (req, res) => controller.listCircles(req, res));
router.post('/', (req, res) => controller.createCircle(req, res));
router.get('/my', (req, res) => controller.getMyCircles(req, res));
router.get('/:id', (req, res) => controller.getCircle(req, res));
router.post('/:id/join', (req, res) => controller.joinCircle(req, res));
router.post('/:id/leave', (req, res) => controller.leaveCircle(req, res));

export default router;
