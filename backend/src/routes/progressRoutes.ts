import { Router } from 'express';
import {
  getInsights,
  getTrend
} from '../controllers/progressController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

router.get('/insights', authenticate, getInsights);
router.get('/trend', authenticate, getTrend);

export default router;
