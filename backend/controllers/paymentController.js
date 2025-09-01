import axios from 'axios';
import crypto from 'crypto';
import Payment from '../models/Payment.js';
import User from '../models/User.js';
import { logger } from '../config/logger.js';

const INSTASEND_BASE_URL = 'https://payment.intasend.com/api/v1';

// Debug Instasend configuration
console.log('Instasend Public Key configured:', !!process.env.INSTASEND_PUBLIC_KEY);
console.log('Instasend Secret Key configured:', !!process.env.INSTASEND_SECRET_KEY);

// Pricing configuration
const PRICING_TIERS = {
  'flash-core': { amount: 300, name: 'Flash Core' },
  'flash-prime': { amount: 999, name: 'Flash Prime' },
  'flash-prime-plus': { amount: 1999, name: 'Flash Prime Plus' },
  'flash-titan': { amount: 5000, name: 'Flash Titan' }
};

export const initiatePayment = async (req, res, next) => {
  try {
    const { tier, paymentMethod, customerPhone } = req.body;
    const user = await User.findById(req.user.id);

    if (!PRICING_TIERS[tier]) {
      return res.status(400).json({
        success: false,
        message: 'Invalid subscription tier'
      });
    }

    const tierInfo = PRICING_TIERS[tier];
    const transactionId = `FL_${Date.now()}_${user._id}`;

    // Prepare Instasend payload
    console.log('Initiating Instasend payment for tier:', tier);
    console.log('💳 Payment Details:', {
      amount: tierInfo.amount,
      currency: 'KES',
      email: user.email,
      method: paymentMethod
    });
    
    const payload = {
      amount: tierInfo.amount,
      currency: 'KES',
      api_ref: transactionId,
      email: user.email,
      first_name: user.name.split(' ')[0],
      last_name: user.name.split(' ').slice(1).join(' ') || user.name,
      phone_number: customerPhone || user.email,
      redirect_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard?payment=success`,
      webhook_url: `${process.env.BACKEND_URL || 'http://localhost:3000'}/api/payments/webhook`
    };
    
    // Add payment method specific fields
    if (paymentMethod === 'mpesa') {
      payload.method = 'M-PESA';
      payload.phone_number = customerPhone;
    } else {
      payload.method = 'CARD-PAYMENT';
    }

    // Make request to Instasend
    console.log('📡 Sending request to Instasend API...');
    console.log('🔗 URL:', `${INSTASEND_BASE_URL}/checkout/`);
    console.log('📦 Payload:', JSON.stringify(payload, null, 2));
    
    const response = await axios.post(
      `${INSTASEND_BASE_URL}/checkout/`,
      payload,
      {
        headers: {
          'X-IntaSend-Public-API-Key': process.env.INSTASEND_PUBLIC_KEY,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        timeout: 30000
      }
    );

    console.log('✅ Instasend response received:', response.data);

    // Save payment record
    const payment = new Payment({
      userId: user._id,
      transactionId,
      instasendRef: response.data.id,
      amount: tierInfo.amount,
      currency: 'KES',
      paymentMethod,
      subscriptionTier: tier,
      status: 'pending',
      metadata: {
        customerEmail: user.email,
        customerPhone: customerPhone,
        paymentDescription: `${tierInfo.name} subscription`
      }
    });

    await payment.save();

    logger.info(`Payment initiated for user: ${user.email}, Amount: KES ${tierInfo.amount}`);

    res.status(200).json({
      success: true,
      data: {
        paymentUrl: response.data.url,
        transactionId,
        amount: tierInfo.amount,
        currency: 'KES'
      }
    });
  } catch (error) {
    console.error('Instasend payment error details:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message
    });
    logger.error('Payment initiation error:', error.response?.data || error.message);
    next(error);
  }
};

export const verifyPayment = async (req, res, next) => {
  try {
    const { transactionId } = req.params;
    
    const payment = await Payment.findOne({ transactionId });
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    // Verify with Instasend
    const response = await axios.get(
      `${INSTASEND_BASE_URL}/payments/${payment.instasendRef}/`,
      {
        headers: {
          'X-IntaSend-Public-API-Key': process.env.INSTASEND_PUBLIC_KEY,
          'Authorization': `Bearer ${process.env.INSTASEND_SECRET_KEY}`
        }
      }
    );

    const { state, amount, currency } = response.data;

    if (state === 'COMPLETE' && amount === payment.amount && currency === payment.currency) {
      // Update payment status
      payment.status = 'successful';
      await payment.save();

      // Update user subscription
      const user = await User.findById(payment.userId);
      user.subscription.tier = payment.subscriptionTier;
      user.subscription.status = 'active';
      user.subscription.nextBilling = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
      user.updateSubscriptionLimits();
      await user.save();

      logger.info(`Payment verified and subscription updated for user: ${user.email}`);

      res.status(200).json({
        success: true,
        message: 'Payment verified successfully',
        data: {
          status: 'successful',
          subscription: user.subscription
        }
      });
    } else {
      payment.status = 'failed';
      await payment.save();

      res.status(400).json({
        success: false,
        message: 'Payment verification failed'
      });
    }
  } catch (error) {
    logger.error('Payment verification error:', error.response?.data || error.message);
    next(error);
  }
};

export const handleWebhook = async (req, res, next) => {
  try {
    const payload = req.body;
    
    if (payload.invoice_id && payload.state === 'COMPLETE') {
      const { api_ref, state, net_amount, currency } = payload;
      
      const payment = await Payment.findOne({ transactionId: api_ref });
      if (payment && state === 'COMPLETE') {
        payment.status = 'successful';
        await payment.save();

        // Update user subscription
        const user = await User.findById(payment.userId);
        user.subscription.tier = payment.subscriptionTier;
        user.subscription.status = 'active';
        user.subscription.nextBilling = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
        user.updateSubscriptionLimits();
        await user.save();

        logger.info(`Webhook processed: Payment successful for ${user.email}`);
      }
    }

    res.status(200).json({ success: true });
  } catch (error) {
    logger.error('Webhook processing error:', error);
    next(error);
  }
};

export const getPaymentHistory = async (req, res, next) => {
  try {
    const payments = await Payment.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(20);

    res.status(200).json({
      success: true,
      data: payments
    });
  } catch (error) {
    next(error);
  }
};