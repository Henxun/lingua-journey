import { Router } from 'express';
import {
  createNewAssessment,
  getAssessmentById,
  listAssessments,
  submitAssessmentAnswers,
  getUserAssessmentResults,
  getUserSkills
} from '../controllers/assessmentController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

router.get('/', authenticate, listAssessments);
router.post('/', authenticate, createNewAssessment);
router.get('/results', authenticate, getUserAssessmentResults);
router.get('/skills', authenticate, getUserSkills);
router.get('/:id', authenticate, getAssessmentById);
router.post('/:id/submit', authenticate, submitAssessmentAnswers);

export default router;
