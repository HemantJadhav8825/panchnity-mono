import { Router } from 'express';
import { AuthProxy } from '../auth/auth.proxy';

const router = Router();

router.post('/login', async (req, res) => {
  try {
    const result = await AuthProxy.login(req.body);
    res.json(result);
  } catch (err: any) {
    res.status(err.response?.status || 500).json(err.response?.data || { error: 'Auth Service unavailable' });
  }
});

router.post('/register', async (req, res) => {
  try {
    const result = await AuthProxy.register(req.body);
    res.json(result);
  } catch (err: any) {
    res.status(err.response?.status || 500).json(err.response?.data || { error: 'Auth Service unavailable' });
  }
});

router.post('/refresh', async (req, res) => {
  try {
    const result = await AuthProxy.refresh(req.body);
    res.json(result);
  } catch (err: any) {
    res.status(err.response?.status || 500).json(err.response?.data || { error: 'Auth Service unavailable' });
  }
});

router.post('/google', async (req, res) => {
  try {
    const result = await AuthProxy.google(req.body);
    res.json(result);
  } catch (err: any) {
    res.status(err.response?.status || 500).json(err.response?.data || { error: 'Auth Service unavailable' });
  }
});

router.post('/logout', (req, res) => {
  // In a stateless JWT system, logout is mostly handled by the client (deleting token)
  // Optionally, blacklisting could happen in auth-service
  res.json({ message: 'Logged out successfully' });
});

export default router;
