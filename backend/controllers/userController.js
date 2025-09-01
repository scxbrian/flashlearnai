import User from '../models/User.js';
import Flashcard from '../models/Flashcard.js';
import Quiz from '../models/Quiz.js';
import { logger } from '../config/logger.js';

export const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    
    res.status(200).json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        subscription: user.subscription,
        stats: user.stats,
        preferences: user.preferences,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const { name, email, preferences } = req.body;
    
    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (preferences) updateData.preferences = { ...req.user.preferences, ...preferences };

    const user = await User.findByIdAndUpdate(
      req.user.id,
      updateData,
      { new: true, runValidators: true }
    );

    logger.info(`User profile updated: ${user.email}`);

    res.status(200).json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        subscription: user.subscription,
        stats: user.stats,
        preferences: user.preferences
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getProgress = async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    // Get user stats
    const user = await User.findById(userId);
    
    // Get flashcard stats
    const flashcardStats = await Flashcard.aggregate([
      { $match: { userId: userId } },
      {
        $group: {
          _id: null,
          totalCards: { $sum: 1 },
          studiedCards: { $sum: { $cond: [{ $gt: ['$studyData.timesStudied', 0] }, 1, 0] } },
          avgMastery: { $avg: '$studyData.masteryLevel' }
        }
      }
    ]);

    // Get quiz stats
    const quizStats = await Quiz.aggregate([
      { $match: { userId: userId } },
      { $unwind: '$results' },
      { $match: { 'results.userId': userId } },
      {
        $group: {
          _id: null,
          totalQuizzes: { $sum: 1 },
          avgScore: { $avg: '$results.score' },
          totalTimeSpent: { $sum: '$results.timeSpent' }
        }
      }
    ]);

    // Weekly progress (last 7 days)
    const weeklyProgress = await Quiz.aggregate([
      { $match: { userId: userId } },
      { $unwind: '$results' },
      { $match: { 
        'results.userId': userId,
        'results.completedAt': { 
          $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) 
        }
      }},
      {
        $group: {
          _id: { $dayOfWeek: '$results.completedAt' },
          avgScore: { $avg: '$results.score' }
        }
      },
      { $sort: { '_id': 1 } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        user: user.stats,
        flashcards: flashcardStats[0] || { totalCards: 0, studiedCards: 0, avgMastery: 0 },
        quizzes: quizStats[0] || { totalQuizzes: 0, avgScore: 0, totalTimeSpent: 0 },
        weeklyProgress: weeklyProgress || []
      }
    });
  } catch (error) {
    next(error);
  }
};

export const updateSubscription = async (req, res, next) => {
  try {
    const { tier, status } = req.body;
    
    const user = await User.findById(req.user.id);
    user.subscription.tier = tier;
    user.subscription.status = status;
    user.updateSubscriptionLimits();
    
    await user.save();

    logger.info(`Subscription updated for user: ${user.email} to ${tier}`);

    res.status(200).json({
      success: true,
      data: user.subscription
    });
  } catch (error) {
    next(error);
  }
};