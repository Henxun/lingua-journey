import { Request, Response } from 'express';
import {
  getLearningInsights,
  getProgressTrend
} from '../services/analyticsService';

export async function getInsights(req: Request, res: Response) {
  try {
    const userId = (req as any).user.id;
    const insights = await getLearningInsights(userId);
    res.status(200).json(insights);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
}

export async function getTrend(req: Request, res: Response) {
  try {
    const userId = (req as any).user.id;
    const { skill } = req.query;
    const trend = await getProgressTrend(userId, skill as string);
    res.status(200).json(trend);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
}
