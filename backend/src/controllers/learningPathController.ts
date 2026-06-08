import { Request, Response } from 'express';
import * as learningPathService from '../services/learningPathService';

export async function getPathHandler(req: Request, res: Response): Promise<void> {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const path = await learningPathService.getUserPathWithCourses(userId);
    res.json(path || { course_order: [], courses: [], current_position: 0 });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export async function generatePathHandler(req: Request, res: Response): Promise<void> {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { goal_id } = req.body;
    const path = await learningPathService.generatePath(userId, goal_id);

    if (!path) {
      res.status(500).json({ error: 'Failed to generate path' });
      return;
    }

    const pathWithCourses = await learningPathService.getUserPathWithCourses(userId);
    res.json(pathWithCourses);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export async function updateProgressHandler(req: Request, res: Response): Promise<void> {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { position } = req.body;

    if (position === undefined) {
      res.status(400).json({ error: 'Position is required' });
      return;
    }

    const path = await learningPathService.updatePathProgress(userId, position);

    if (!path) {
      res.status(404).json({ error: 'Path not found' });
      return;
    }

    res.json(path);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export async function skipCourseHandler(req: Request, res: Response): Promise<void> {
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

    const path = await learningPathService.skipCourseInPath(userId, course_id);

    if (!path) {
      res.status(404).json({ error: 'Path not found' });
      return;
    }

    res.json(path);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
