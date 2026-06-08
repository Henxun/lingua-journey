import { Request, Response } from 'express';
import * as recommendationService from '../services/recommendationService';

export async function getRecommendationsHandler(req: Request, res: Response): Promise<void> {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const limit = parseInt(req.query.limit as string) || 10;
    const recommendations = await recommendationService.getRecommendations(userId, limit);

    res.json(recommendations);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export async function getNextCourseHandler(req: Request, res: Response): Promise<void> {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const course = await recommendationService.getNextCourse(userId);

    if (!course) {
      res.status(404).json({ error: 'No recommendations available' });
      return;
    }

    res.json(course);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export async function recordSkippedHandler(req: Request, res: Response): Promise<void> {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { course_id } = req.body;

    if (!course_id) {
      res.status(400).json({ error: 'course_id is required' });
      return;
    }

    await recommendationService.recordCourseSkipped(userId, course_id);
    res.status(204).send();
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export async function recordCompletedHandler(req: Request, res: Response): Promise<void> {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { course_id } = req.body;

    if (!course_id) {
      res.status(400).json({ error: 'course_id is required' });
      return;
    }

    await recommendationService.recordCourseCompleted(userId, course_id);
    res.status(204).send();
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
