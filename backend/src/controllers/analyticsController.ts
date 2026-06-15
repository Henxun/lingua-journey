import { Request, Response } from 'express';
import { getLearningInsights, getLearningHabits, getProgressPrediction, getComprehensiveReport, getProgressTrend } from '../services/analyticsService';

export async function getInsightsHandler(req: Request, res: Response): Promise<void> {
  try {
    const userId = (req as any).user?.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const insights = await getLearningInsights(userId);
    res.json(insights);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export async function getHabitsHandler(req: Request, res: Response): Promise<void> {
  try {
    const userId = (req as any).user?.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const habits = await getLearningHabits(userId);
    res.json(habits);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export async function getPredictionHandler(req: Request, res: Response): Promise<void> {
  try {
    const userId = (req as any).user?.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const prediction = await getProgressPrediction(userId);
    res.json(prediction);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export async function getComprehensiveHandler(req: Request, res: Response): Promise<void> {
  try {
    const userId = (req as any).user?.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const report = await getComprehensiveReport(userId);
    res.json(report);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export async function getTrendHandler(req: Request, res: Response): Promise<void> {
  try {
    const userId = (req as any).user?.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const skill = req.query.skill as string | undefined;
    const trend = await getProgressTrend(userId, skill);
    res.json(trend);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}