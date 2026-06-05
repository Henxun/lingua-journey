import { Request, Response } from 'express';
import { getLearningStats, calculateAccuracyRate } from '../services/statsService';
import { authenticate } from '../middleware/authMiddleware';

export async function getStats(req: Request, res: Response) {
  try {
    const userId = (req as any).user.id;
    const stats = await getLearningStats(userId);
    const accuracyRate = calculateAccuracyRate(stats);
    
    res.status(200).json({
      total_time_minutes: stats.total_time_minutes,
      practice_count: stats.practice_count,
      accuracy_rate: accuracyRate,
      streak_days: stats.streak_days,
      last_practice_date: stats.last_practice_date
    });
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
}
