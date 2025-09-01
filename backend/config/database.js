import mongoose from 'mongoose';
import { logger } from './logger.js';

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    logger.info(`📊 MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    logger.error('❌ Database connection failed:', error.message);
    process.exit(1);
  }
};

// Handle connection events
mongoose.connection.on('disconnected', () => {
  logger.warn('📊 MongoDB disconnected');
});

mongoose.connection.on('reconnected', () => {
  logger.info('📊 MongoDB reconnected');
});

process.on('SIGINT', async () => {
  await mongoose.connection.close();
  logger.info('📊 MongoDB connection closed through app termination');
  process.exit(0);
});