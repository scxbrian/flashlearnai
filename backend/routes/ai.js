import express from 'express';
import rateLimit from 'express-rate-limit';
import { getContextualResponse } from '../controllers/aiController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Stricter rate limiting for AI endpoints
const aiRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 requests per minute
  message: 'Too many AI requests, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/contextual', authMiddleware, aiRateLimit, getContextualResponse);

export default router;