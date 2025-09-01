import Flashcard from '../models/Flashcard.js';
import User from '../models/User.js';
import { logger } from '../config/logger.js';

export const getFlashcards = async (req, res, next) => {
  try {
    const { category, difficulty, limit = 50, page = 1 } = req.query;
    console.log(`Fetching flashcards for user ${req.user.id}, category: ${category}`);
    
    const filter = { userId: req.user.id, isActive: true };
    if (category && category !== 'all') filter.category = category;
    if (difficulty) filter.difficulty = difficulty;

    const flashcards = await Flashcard.find(filter)
      .sort({ createdAt: -1, 'studyData.lastStudied': 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Flashcard.countDocuments(filter);

    console.log(`Found ${flashcards.length} flashcards for user`);
    res.status(200).json({
      success: true,
      data: flashcards,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching flashcards:', error);
    next(error);
  }
};

export const createFlashcard = async (req, res, next) => {
  try {
    const { question, answer, category, difficulty, tags } = req.body;
    console.log(`Creating flashcard for user ${req.user.id}`);
    
    // Check user's monthly limit
    let user;
    if (req.user.id === 'demo-user-id') {
      // Handle demo user
      user = {
        subscription: {
          usage: { cardsUsed: 0, cardsLimit: 1000 }
        }
      };
    } else {
      user = await User.findById(req.user.id);
    }
    
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    let monthlyUsage = 0;
    if (req.user.id !== 'demo-user-id') {
      monthlyUsage = await Flashcard.countDocuments({
        userId: req.user.id,
        createdAt: {
          $gte: new Date(currentYear, currentMonth, 1),
          $lt: new Date(currentYear, currentMonth + 1, 1)
        }
      });
    }

    if (user.subscription.usage.cardsLimit !== -1 && monthlyUsage >= user.subscription.usage.cardsLimit) {
      return res.status(403).json({
        success: false,
        message: 'Monthly flashcard limit reached. Please upgrade your plan.'
      });
    }

    const flashcard = await Flashcard.create({
      userId: req.user.id,
      question,
      answer,
      category: category || 'general',
      difficulty: difficulty || 'medium',
      tags: tags || []
    });

    // Update user's monthly usage
    if (req.user.id !== 'demo-user-id') {
      user.subscription.usage.cardsUsed = monthlyUsage + 1;
      await user.save();
    }

    console.log(`Flashcard created successfully: ${flashcard._id}`);
    logger.info(`Flashcard created by user: ${req.user.email}`);

    res.status(201).json({
      success: true,
      data: flashcard
    });
  } catch (error) {
    console.error('Error creating flashcard:', error);
    next(error);
  }
};

export const updateFlashcard = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const flashcard = await Flashcard.findOneAndUpdate(
      { _id: id, userId: req.user.id },
      updates,
      { new: true, runValidators: true }
    );

    if (!flashcard) {
      return res.status(404).json({
        success: false,
        message: 'Flashcard not found'
      });
    }

    res.status(200).json({
      success: true,
      data: flashcard
    });
  } catch (error) {
    next(error);
  }
};

export const deleteFlashcard = async (req, res, next) => {
  try {
    const { id } = req.params;

    const flashcard = await Flashcard.findOneAndUpdate(
      { _id: id, userId: req.user.id },
      { isActive: false },
      { new: true }
    );

    if (!flashcard) {
      return res.status(404).json({
        success: false,
        message: 'Flashcard not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Flashcard deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

export const studyFlashcard = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { correct } = req.body;

    const flashcard = await Flashcard.findOne({ _id: id, userId: req.user.id });
    
    if (!flashcard) {
      return res.status(404).json({
        success: false,
        message: 'Flashcard not found'
      });
    }

    // Update study data
    flashcard.studyData.timesStudied += 1;
    flashcard.studyData.lastStudied = new Date();
    
    if (correct) {
      flashcard.studyData.correctAnswers += 1;
      flashcard.studyData.masteryLevel = Math.min(100, flashcard.studyData.masteryLevel + 10);
    } else {
      flashcard.studyData.masteryLevel = Math.max(0, flashcard.studyData.masteryLevel - 5);
    }

    await flashcard.save();

    // Update user stats
    const user = await User.findById(req.user.id);
    user.stats.cardsStudied += 1;
    user.stats.lastStudyDate = new Date();
    await user.save();

    res.status(200).json({
      success: true,
      data: flashcard
    });
  } catch (error) {
    next(error);
  }
};