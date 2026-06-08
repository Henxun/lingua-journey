import { Router } from 'express';
import {
  createAITeacherSession,
  getAITeacherSession,
  getUserAITeacherSessions,
  sendAITeacherMessage,
  getExplanation,
  getTextCorrection,
  getPracticeQuestion
} from '../controllers/aiTeacherController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

router.post('/sessions', authenticate, createAITeacherSession);
router.get('/sessions', authenticate, getUserAITeacherSessions);
router.get('/sessions/:id', authenticate, getAITeacherSession);
router.post('/sessions/:id/messages', authenticate, sendAITeacherMessage);
router.post('/explain', authenticate, getExplanation);
router.post('/correct', authenticate, getTextCorrection);
router.post('/practice', authenticate, getPracticeQuestion);

export default router;
