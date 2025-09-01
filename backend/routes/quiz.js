import express from 'express';
import { getQuizzes, getQuizQuestions, submitQuiz } from '../controllers/quizController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authMiddleware, getQuizzes);
router.get('/questions', authMiddleware, getQuizQuestions);
router.post('/submit', authMiddleware, submitQuiz);

export default router;