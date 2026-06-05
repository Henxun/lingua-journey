import { Router } from 'express';
import {
  listCourses,
  getCourse,
  getMyEnrolledCourses,
  getMyCourseProgress,
  enrollCourse,
  markLessonComplete
} from '../controllers/courseController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

router.get('/', listCourses);
router.get('/my', authenticate, getMyEnrolledCourses);
router.get('/:id', getCourse);
router.get('/:id/progress', authenticate, getMyCourseProgress);
router.post('/:id/enroll', authenticate, enrollCourse);
router.put('/:id/lessons/:lessonId/complete', authenticate, markLessonComplete);

export default router;
