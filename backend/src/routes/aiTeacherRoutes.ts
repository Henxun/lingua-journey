import { Router } from 'express';
import {
  createAITeacherSession,
  getAITeacherSession,
  getUserAITeacherSessions,
  sendAITeacherMessage,
  getExplanation,
  getTextCorrection,
  getPracticeQuestion,
  getPersonalizedLearningPath,
  getAdaptivePractice,
  getLearningStyleAnalysis,
  generateContentItem
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
router.post('/learning-path', authenticate, getPersonalizedLearningPath);
router.post('/adaptive-practice', authenticate, getAdaptivePractice);
router.post('/learning-style', authenticate, getLearningStyleAnalysis);
router.post('/generate-content', authenticate, generateContentItem);

export default router;
