import express from 'express';
import { 
  initiatePayment, 
  verifyPayment, 
  handleWebhook, 
  getPaymentHistory 
} from '../controllers/paymentController.js';
import { authMiddleware } from '../middleware/auth.js';
import { validateRequest, paymentSchemas } from '../middleware/validation.js';

const router = express.Router();

router.post('/initiate', authMiddleware, validateRequest(paymentSchemas.initiate), initiatePayment);
router.get('/verify/:transactionId', authMiddleware, verifyPayment);
router.post('/webhook', handleWebhook); // No auth middleware for webhooks
router.get('/history', authMiddleware, getPaymentHistory);

export default router;