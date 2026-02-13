import express from 'express';
import cors from 'cors';
import authRoutes from './modules/auth/auth.routes';
import userRoutes from './modules/users/user.routes';

const app = express();

app.use(cors());
app.use(express.json());

// Health Check
app.get('/health', (req, res) => res.json({ status: 'ok', service: 'auth-service' }));

// Auth Routes
app.use('/v1/auth', authRoutes);
app.use('/v1/users', userRoutes);

export default app;
