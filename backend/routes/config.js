import express from 'express';
import { saveApiKeys, testInstasendConnection } from '../controllers/configController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.post('/save-keys', authMiddleware, saveApiKeys);
router.post('/test-instasend', authMiddleware, testInstasendConnection);

export default router;