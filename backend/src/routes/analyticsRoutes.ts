import { Router } from 'express';
import { getInsightsHandler, getHabitsHandler, getPredictionHandler, getComprehensiveHandler, getTrendHandler } from '../controllers/analyticsController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

router.get('/insights', authenticate, getInsightsHandler);
router.get('/habits', authenticate, getHabitsHandler);
router.get('/prediction', authenticate, getPredictionHandler);
router.get('/comprehensive', authenticate, getComprehensiveHandler);
router.get('/trend', authenticate, getTrendHandler);

export default router;