import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  transactionId: {
    type: String,
    required: true,
    unique: true
  },
  instasendRef: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    required: true,
    default: 'KES'
  },
  paymentMethod: {
    type: String,
    enum: ['card', 'mpesa', 'bank_transfer'],
    required: true
  },
  subscriptionTier: {
    type: String,
    enum: ['flash-core', 'flash-prime', 'flash-prime-plus', 'flash-titan'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'successful', 'failed', 'cancelled'],
    default: 'pending'
  },
  metadata: {
    customerEmail: String,
    customerPhone: String,
    paymentDescription: String
  }
}, {
  timestamps: true
});

paymentSchema.index({ userId: 1, status: 1 });
paymentSchema.index({ transactionId: 1 });
paymentSchema.index({ flutterwaveRef: 1 });

export default mongoose.model('Payment', paymentSchema);