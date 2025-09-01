import express from 'express';
import { getProfile, updateProfile, getProgress, updateSubscription } from '../controllers/userController.js';
import { authMiddleware } from '../middleware/auth.js';
import { validateRequest, userSchemas } from '../middleware/validation.js';

const router = express.Router();

router.get('/profile', authMiddleware, getProfile);
router.put('/profile', authMiddleware, validateRequest(userSchemas.updateProfile), updateProfile);
router.get('/progress', authMiddleware, getProgress);
router.put('/subscription', authMiddleware, updateSubscription);

export default router;