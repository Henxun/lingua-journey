import { Request, Response } from 'express';
import {
  getAllCourses,
  getCourseById,
  getMyCourses,
  getCourseProgress,
  enrollInCourse,
  completeLesson
} from '../services/courseService';

export async function listCourses(req: Request, res: Response) {
  try {
    const { language, difficulty } = req.query;
    const courses = await getAllCourses(
      language as string,
      difficulty as string
    );
    res.status(200).json(courses);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
}

export async function getCourse(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const course = await getCourseById(id);
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }
    res.status(200).json(course);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
}

export async function getMyEnrolledCourses(req: Request, res: Response) {
  try {
    const userId = (req as any).user.id;
    const courses = await getMyCourses(userId);
    res.status(200).json(courses);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
}

export async function getMyCourseProgress(req: Request, res: Response) {
  try {
    const userId = (req as any).user.id;
    const { id } = req.params;
    const progress = await getCourseProgress(userId, id);
    res.status(200).json(progress);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
}

export async function enrollCourse(req: Request, res: Response) {
  try {
    const userId = (req as any).user.id;
    const { id } = req.params;
    const progress = await enrollInCourse(userId, id);
    res.status(200).json(progress);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
}

export async function markLessonComplete(req: Request, res: Response) {
  try {
    const userId = (req as any).user.id;
    const { id, lessonId } = req.params;
    const progress = await completeLesson(userId, id, lessonId);
    res.status(200).json(progress);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
}
