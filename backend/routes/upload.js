import express from 'express';
import { upload, processFiles, getUploadHistory } from '../controllers/uploadController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.post('/', authMiddleware, upload.array('files', 10), processFiles);
router.get('/history', authMiddleware, getUploadHistory);

export default router;