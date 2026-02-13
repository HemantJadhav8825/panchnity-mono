import { Router } from 'express';
import { requireAuth, requireRole } from '../middlewares/requireAuth';

import axios from 'axios';
import { AUTH_CONFIG } from '../auth/auth.config';
import { APP_CONFIG } from '../config/app.config';

const router = Router();
const AUTH_SERVICE_URL = AUTH_CONFIG.SERVICE_URL;

// Public health check
router.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'backend-gateway' });
});

// GET /v1/users (list)
router.get('/v1/users', requireAuth, async (req, res) => {
  try {
    const { limit, offset } = req.query;
    const response = await axios.get(`${AUTH_SERVICE_URL}/v1/users`, {
      params: { limit, offset }
    });
    res.json(response.data);
  } catch (error: any) {
    const status = error.response?.status || 500;
    const message = error.response?.data?.error || 'Failed to fetch users';
    res.status(status).json({ error: message });
  }
});

// GET /v1/users/profile (expanded)
router.get('/v1/users/profile', requireAuth, async (req, res) => {
  try {
    // Forward the request to the dedicated profile endpoint in Auth Service
    // We MUST forward the Authorization header so Auth Service can identify the user
    // and return private fields like anonymousProfile
    // Forward the request to the dedicated profile endpoint in Auth Service
    // We MUST forward the Authorization header so Auth Service can identify the user
    // and return private fields like anonymousProfile
    const url = `${AUTH_SERVICE_URL}/v1/users/profile`;
    console.log(`[Proxy] Fetching profile from: ${url}`);
    
    const response = await axios.get(url, {
      headers: {
        Authorization: req.headers.authorization
      }
    });
    res.json(response.data);
  } catch (error: any) {
    const status = error.response?.status || 500;
    const message = error.response?.data?.error || 'Failed to fetch profile';
    res.status(status).json({ error: message });
  }
});

// PATCH /v1/users/profile (update)
router.patch('/v1/users/profile', requireAuth, async (req, res) => {
  try {
    const response = await axios.patch(`${AUTH_SERVICE_URL}/v1/users/profile`, req.body, {
      headers: {
        Authorization: req.headers.authorization
      }
    });
    res.json(response.data);
  } catch (error: any) {
    const status = error.response?.status || 500;
    const message = error.response?.data?.error || 'Failed to update profile';
    res.status(status).json({ error: message });
  }
});

// Admin only route example
router.get('/v1/admin/stats', requireAuth, requireRole('admin'), (req, res) => {
  res.json({
    message: 'Welcome, Admin',
    stats: { users: 42, activeUsers: 7 }
  });
});

// Anonymous User Creation (Auth Service)
router.post('/v1/users/anonymous', requireAuth, async (req, res) => {
  try {
    const response = await axios.post(`${AUTH_SERVICE_URL}/v1/users/anonymous`, req.body, {
      headers: {
        Authorization: req.headers.authorization
      }
    });
    res.json(response.data);
  } catch (error: any) {
    const status = error.response?.status || 500;
    const message = error.response?.data?.error || 'Failed to create anonymous profile';
    res.status(status).json({ error: message });
  }
});

// Chat Service Proxy
const CHAT_SERVICE_URL = AUTH_CONFIG.CHAT_SERVICE_URL;

// Circles (list, create, join, leave)
router.use('/v1/circles', requireAuth, async (req, res, next) => {
  if (!APP_CONFIG.SANCTUARY_ENABLED) {
    return res.status(404).json({ error: 'Not Found' });
  }
  next();
}, async (req, res) => {
  try {
    const url = `${CHAT_SERVICE_URL}/v1/circles${req.url === '/' ? '' : req.url}`;
    const response = await axios({
      method: req.method,
      url: url,
      data: req.method !== 'GET' ? req.body : undefined,
      params: req.query,
      headers: {
        Authorization: req.headers.authorization
      }
    });
    res.json(response.data);
  } catch (error: any) {
    const status = error.response?.status || 500;
    const message = error.response?.data?.error || 'Chat Service Error';
    res.status(status).json({ error: message });
  }
});

// Vents (list, create, react)
router.use('/v1/vents', requireAuth, async (req, res, next) => {
  if (!APP_CONFIG.SANCTUARY_ENABLED) {
    return res.status(404).json({ error: 'Not Found' });
  }
  next();
}, async (req, res) => {
  try {
    const url = `${CHAT_SERVICE_URL}/v1/vents${req.url === '/' ? '' : req.url}`;
    const response = await axios({
      method: req.method,
      url: url,
      data: req.method !== 'GET' ? req.body : undefined,
      params: req.query,
      headers: {
        Authorization: req.headers.authorization
      }
    });
    res.json(response.data);
  } catch (error: any) {
    const realError = {
      message: error.message,
      code: error.code,
      response: error.response?.data,
      status: error.response?.status,
      url: `${CHAT_SERVICE_URL}/v1/vents${req.url === '/' ? '' : req.url}`
    }
    console.error('Chat Service Proxy Error:', realError);
    const status = error.response?.status || 500;
    const message = error.response?.data?.error || 'Chat Service Error';
    res.status(status).json({ error: JSON.stringify(realError, null, 2) });
  }
});

// Holding Space Service Proxy
const HOLDING_SPACE_SERVICE_URL = AUTH_CONFIG.HOLDING_SPACE_SERVICE_URL;

const holdingSpaceRoutes = [
  '/v1/shares',
  '/v1/reports',
  '/v1/block',
  '/v1/preferences',
  '/v1/internal/moderation'
];

// Apply proxy to all Holding Space routes
holdingSpaceRoutes.forEach(route => {
  // Use regex to match the route and any sub-paths
  // e.g., /v1/shares matches /v1/shares, /v1/shares/123, etc.
  router.use(route, requireAuth, async (req, res) => {
    try {
      // Construct the full URL for the microservice
      // We need to append the sub-path from the original request
      // req.originalUrl includes the full path (e.g. /v1/shares/123)
      // We can just use req.originalUrl directly since we are mirroring the path structure
      const url = `${HOLDING_SPACE_SERVICE_URL}${req.originalUrl}`;
      
      console.log(`[Proxy] Forwarding ${req.method} ${req.originalUrl} to ${url}`);

      const response = await axios({
        method: req.method,
        url: url,
        data: req.method !== 'GET' ? req.body : undefined,
        params: req.query,
        headers: {
          // Forward Authorization header
          Authorization: req.headers.authorization,
          // Forward Content-Type if present
          ...(req.headers['content-type'] ? { 'Content-Type': req.headers['content-type'] } : {})
        }
      });

      res.status(response.status).json(response.data);
    } catch (error: any) {
      // Forward the error from the microservice
      const status = error.response?.status || 500;
      const data = error.response?.data || { error: 'Holding Space Service unavailable' };
      
      console.error(`[Proxy Error] ${req.method} ${req.originalUrl} failed: ${status}`);
      res.status(status).json(data);
    }
  });
});

export default router;
