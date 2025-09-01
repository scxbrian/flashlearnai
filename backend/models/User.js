import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  subscription: {
    tier: {
      type: String,
      enum: ['flash-lite', 'flash-core', 'flash-prime', 'flash-prime-plus', 'flash-titan'],
      default: 'flash-lite'
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'cancelled', 'past_due'],
      default: 'active'
    },
    nextBilling: Date,
    usage: {
      cardsUsed: { type: Number, default: 0 },
      cardsLimit: { type: Number, default: 100 }
    }
  },
  stats: {
    cardsStudied: { type: Number, default: 0 },
    quizzesTaken: { type: Number, default: 0 },
    studyStreak: { type: Number, default: 0 },
    avgScore: { type: Number, default: 0 },
    lastStudyDate: Date
  },
  preferences: {
    emailNotifications: { type: Boolean, default: true },
    voiceNarration: { type: Boolean, default: false },
    autoGenerateQuizzes: { type: Boolean, default: true }
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Update subscription limits based on tier
userSchema.methods.updateSubscriptionLimits = function() {
  const limits = {
    'flash-lite': 100,
    'flash-core': 1000,
    'flash-prime': 5000,
    'flash-prime-plus': -1, // unlimited
    'flash-titan': -1 // unlimited
  };
  
  this.subscription.usage.cardsLimit = limits[this.subscription.tier];
};

export default mongoose.model('User', userSchema);