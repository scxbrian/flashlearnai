import mongoose from 'mongoose';

const quizSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: ['biology', 'chemistry', 'physics', 'mathematics', 'history', 'general']
  },
  questions: [{
    question: {
      type: String,
      required: true
    },
    options: [{
      type: String,
      required: true
    }],
    correctAnswer: {
      type: Number,
      required: true,
      min: 0,
      max: 3
    },
    explanation: {
      type: String,
      required: true
    }
  }],
  results: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    score: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    },
    answers: [Number],
    timeSpent: Number,
    completedAt: {
      type: Date,
      default: Date.now
    }
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

quizSchema.index({ userId: 1, category: 1 });
quizSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model('Quiz', quizSchema);