import { Request, Response } from 'express';
import * as learningGoalService from '../services/learningGoalService';
import { GoalType } from '../entities/LearningGoal';

export async function createGoalHandler(req: Request, res: Response): Promise<void> {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { title, description, goal_type, target_date } = req.body;

    if (!title || !goal_type) {
      res.status(400).json({ error: 'Title and goal_type are required' });
      return;
    }

    const goal = await learningGoalService.createGoal(userId, {
      title,
      description,
      goal_type: goal_type as GoalType,
      target_date: target_date ? new Date(target_date) : undefined
    });

    res.status(201).json(goal);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export async function getGoalsHandler(req: Request, res: Response): Promise<void> {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const goals = await learningGoalService.getUserGoals(userId);
    res.json(goals);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export async function updateGoalHandler(req: Request, res: Response): Promise<void> {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { id } = req.params;
    const { title, description, goal_type, target_date, progress } = req.body;

    if (progress !== undefined) {
      const goal = await learningGoalService.updateGoalProgress(id, userId, progress);
      res.json(goal);
      return;
    }

    const goal = await learningGoalService.updateGoal(id, userId, {
      title,
      description,
      goal_type: goal_type as GoalType,
      target_date: target_date ? new Date(target_date) : undefined
    });

    if (!goal) {
      res.status(404).json({ error: 'Goal not found' });
      return;
    }

    res.json(goal);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export async function deleteGoalHandler(req: Request, res: Response): Promise<void> {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { id } = req.params;
    const success = await learningGoalService.deleteGoal(id, userId);

    if (!success) {
      res.status(404).json({ error: 'Goal not found' });
      return;
    }

    res.status(204).send();
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
