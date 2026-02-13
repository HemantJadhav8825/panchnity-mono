import rateLimit from 'express-rate-limit';

export const messageRateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30, // Limit each IP to 30 messages per minute
  message: {
    error: 'Too many messages sent. Please slow down and try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
