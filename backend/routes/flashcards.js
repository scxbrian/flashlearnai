import express from 'express';
import { 
  getFlashcards, 
  createFlashcard, 
  updateFlashcard, 
  deleteFlashcard, 
  studyFlashcard 
} from '../controllers/flashcardController.js';
import { authMiddleware } from '../middleware/auth.js';
import { validateRequest, flashcardSchemas } from '../middleware/validation.js';

const router = express.Router();

router.get('/', authMiddleware, getFlashcards);
router.post('/', authMiddleware, validateRequest(flashcardSchemas.create), createFlashcard);
router.put('/:id', authMiddleware, updateFlashcard);
router.delete('/:id', authMiddleware, deleteFlashcard);
router.post('/:id/study', authMiddleware, studyFlashcard);

export default router;