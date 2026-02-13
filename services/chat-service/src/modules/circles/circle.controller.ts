import { Request, Response } from 'express';
import { CircleService } from './circle.service';

export class CircleController {
  private circleService: CircleService;

  constructor() {
    this.circleService = new CircleService();
  }

  async listCircles(req: Request, res: Response) {
    try {
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = parseInt(req.query.offset as string) || 0;
      const circles = await this.circleService.findAll(limit, offset);
      res.json(circles);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async createCircle(req: Request, res: Response) {
    try {
      // TODO: Add admin check or similar if creation is restricted
      const circle = await this.circleService.create(req.body);
      res.status(201).json(circle);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async getCircle(req: Request, res: Response) {
    try {
      const circle = await this.circleService.findById(req.params.id);
      if (!circle) return res.status(404).json({ error: 'Circle not found' });
      res.json(circle);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async joinCircle(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.sub || req.body.userId; // Fallback for dev
      if (!userId) return res.status(401).json({ error: 'Unauthorized' });

      const circle = await this.circleService.joinCircle(req.params.id, userId);
      res.json(circle);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async leaveCircle(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.sub || req.body.userId;
      if (!userId) return res.status(401).json({ error: 'Unauthorized' });

      const circle = await this.circleService.leaveCircle(req.params.id, userId);
      res.json(circle);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async getMyCircles(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.sub || req.query.userId;
      if (!userId) return res.status(401).json({ error: 'Unauthorized' });

      const circles = await this.circleService.getMyCircles(userId as string);
      res.json(circles);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}
