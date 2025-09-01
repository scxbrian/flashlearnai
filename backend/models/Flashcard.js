import mongoose from 'mongoose';

const flashcardSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  question: {
    type: String,
    required: [true, 'Question is required'],
    trim: true
  },
  answer: {
    type: String,
    required: [true, 'Answer is required'],
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: ['biology', 'chemistry', 'physics', 'mathematics', 'history', 'general'],
    default: 'general'
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  tags: [{
    type: String,
    trim: true
  }],
  sourceDocument: {
    filename: String,
    originalName: String,
    uploadDate: Date
  },
  studyData: {
    timesStudied: { type: Number, default: 0 },
    correctAnswers: { type: Number, default: 0 },
    lastStudied: Date,
    masteryLevel: { type: Number, default: 0, min: 0, max: 100 }
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes for better query performance
flashcardSchema.index({ userId: 1, category: 1 });
flashcardSchema.index({ userId: 1, difficulty: 1 });
flashcardSchema.index({ userId: 1, 'studyData.lastStudied': -1 });

export default mongoose.model('Flashcard', flashcardSchema);