import Joi from 'joi';

export const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        details: error.details.map(detail => detail.message)
      });
    }
    
    next();
  };
};

// Validation schemas
export const authSchemas = {
  signup: Joi.object({
    name: Joi.string().min(2).max(50).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required()
  }),
  
  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  })
};

export const userSchemas = {
  updateProfile: Joi.object({
    name: Joi.string().min(2).max(50),
    email: Joi.string().email(),
    preferences: Joi.object({
      emailNotifications: Joi.boolean(),
      voiceNarration: Joi.boolean(),
      autoGenerateQuizzes: Joi.boolean()
    })
  })
};

export const flashcardSchemas = {
  create: Joi.object({
    question: Joi.string().required(),
    answer: Joi.string().required(),
    category: Joi.string().valid('biology', 'chemistry', 'physics', 'mathematics', 'history', 'general'),
    difficulty: Joi.string().valid('easy', 'medium', 'hard'),
    tags: Joi.array().items(Joi.string())
  })
};

export const paymentSchemas = {
  initiate: Joi.object({
    tier: Joi.string().valid('flash-core', 'flash-prime', 'flash-prime-plus', 'flash-titan').required(),
    paymentMethod: Joi.string().valid('card', 'mpesa', 'bank_transfer').required(),
    customerPhone: Joi.string().when('paymentMethod', {
      is: 'mpesa',
      then: Joi.required(),
      otherwise: Joi.optional()
    })
  })
};