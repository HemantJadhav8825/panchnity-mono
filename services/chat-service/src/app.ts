import express from 'express';
import cors from 'cors';
import conversationRoutes from './modules/conversations/conversation.routes';
import messageRoutes from './modules/messages/message.routes';
import settingsRoutes from './modules/settings/settings.routes';
import moderationRoutes from './modules/moderation/moderation.routes';
import featureFlagRoutes from './modules/feature-flags/feature-flags.routes';
import circleRoutes from './modules/circles/circle.routes';
import ventRoutes from './modules/vents/vent.routes';
import { featureFlagService } from './config/feature-flags';

const app = express();

// Trust the first proxy (e.g. Nginx, Load Balancer) to ensure correct IP resolution
app.set('trust proxy', 1);

app.use(cors({
  origin: [
    'https://panchnity.com',
    'https://chat.panchnity.com',
    'https://api.panchnity.com',
    'http://localhost:4002',
    'http://localhost:4000',
  ],
  credentials: true,
}));
app.use(express.json());

// Health Check
app.get('/health', (req, res) => res.json({ status: 'ok', service: 'chat-service' }));

// Routes
app.use('/v1/conversations', conversationRoutes);
app.use('/v1/messages', messageRoutes);
// Sanctuary Routes (Feature Flagged)
const sanctuaryGuard = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (!featureFlagService.isEnabled('SANCTUARY_ENABLED')) {
    return res.status(404).json({ error: 'Not Found' });
  }
  next();
};

// app.use('/v1/circles', sanctuaryGuard, circleRoutes);
app.use('/v1/vents', sanctuaryGuard, ventRoutes);
app.use('/v1/settings', settingsRoutes);
app.use('/v1/moderation', moderationRoutes);
app.use('/v1/admin/feature-flags', featureFlagRoutes);

export default app;
