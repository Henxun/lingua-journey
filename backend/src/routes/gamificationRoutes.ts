import { Router } from 'express';
import { checkInHandler, getProfileHandler, getAchievementsHandler, getQuestsHandler, getWeeklyLeaderboardHandler, getMonthlyLeaderboardHandler } from '../controllers/gamificationController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

router.post('/check-in', authenticate, checkInHandler);
router.get('/profile', authenticate, getProfileHandler);
router.get('/achievements', authenticate, getAchievementsHandler);
router.get('/daily-quests', authenticate, getQuestsHandler);
router.get('/leaderboard/weekly', getWeeklyLeaderboardHandler);
router.get('/leaderboard/monthly', getMonthlyLeaderboardHandler);

export default router;
