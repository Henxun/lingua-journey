import { Router } from 'express';
import { createGoalHandler, getGoalsHandler, updateGoalHandler, deleteGoalHandler } from '../controllers/learningGoalController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

router.post('/', authenticate, createGoalHandler);
router.get('/', authenticate, getGoalsHandler);
router.put('/:id', authenticate, updateGoalHandler);
router.delete('/:id', authenticate, deleteGoalHandler);

export default router;
