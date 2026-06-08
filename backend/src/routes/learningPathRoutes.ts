import { Router } from 'express';
import { getPathHandler, generatePathHandler, updateProgressHandler, skipCourseHandler } from '../controllers/learningPathController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

router.get('/', authenticate, getPathHandler);
router.post('/generate', authenticate, generatePathHandler);
router.put('/progress', authenticate, updateProgressHandler);
router.post('/skip', authenticate, skipCourseHandler);

export default router;
