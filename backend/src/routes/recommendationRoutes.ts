import { Router } from 'express';
import { getRecommendationsHandler, getNextCourseHandler, recordSkippedHandler, recordCompletedHandler } from '../controllers/recommendationController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

router.get('/', authenticate, getRecommendationsHandler);
router.get('/next', authenticate, getNextCourseHandler);
router.post('/skip', authenticate, recordSkippedHandler);
router.post('/complete', authenticate, recordCompletedHandler);

export default router;
