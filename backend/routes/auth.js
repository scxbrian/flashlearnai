import express from 'express';
import { signup, login, getMe, logout } from '../controllers/authController.js';
import { authMiddleware } from '../middleware/auth.js';
import { validateRequest, authSchemas } from '../middleware/validation.js';

const router = express.Router();

router.post('/signup', validateRequest(authSchemas.signup), signup);
router.post('/login', validateRequest(authSchemas.login), login);
router.get('/me', authMiddleware, getMe);
router.post('/logout', logout);

export default router;