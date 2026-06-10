import { Request, Response } from 'express';
import { checkIn, getGamificationProfile, getAllAchievements, getDailyQuests, getLeaderboard, getAchievementsWithProgress, generateShareContent } from '../services/gamificationService';

export async function checkInHandler(req: Request, res: Response): Promise<void> {
  try {
    const userId = (req as any).user?.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const result = await checkIn(userId);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export async function getProfileHandler(req: Request, res: Response): Promise<void> {
  try {
    const userId = (req as any).user?.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const profile = await getGamificationProfile(userId);
    res.json(profile);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export async function getAchievementsHandler(req: Request, res: Response): Promise<void> {
  try {
    const userId = (req as any).user?.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const achievements = await getAchievementsWithProgress(userId);
    res.json(achievements);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export async function getShareContentHandler(req: Request, res: Response): Promise<void> {
  try {
    const userId = (req as any).user?.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const achievementId = req.params.id;
    const shareContent = await generateShareContent(userId, achievementId);
    res.json(shareContent);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export async function getQuestsHandler(req: Request, res: Response): Promise<void> {
  try {
    const userId = (req as any).user?.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const quests = await getDailyQuests(userId);
    res.json(quests);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export async function getWeeklyLeaderboardHandler(req: Request, res: Response): Promise<void> {
  try {
    const leaderboard = await getLeaderboard('weekly');
    res.json(leaderboard);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export async function getMonthlyLeaderboardHandler(req: Request, res: Response): Promise<void> {
  try {
    const leaderboard = await getLeaderboard('monthly');
    res.json(leaderboard);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}