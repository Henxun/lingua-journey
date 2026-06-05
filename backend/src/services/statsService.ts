import { AppDataSource } from '../config/database';
import { User } from '../entities/User';

const userRepository = AppDataSource.getRepository(User);

export interface LearningStats {
  total_time_minutes: number;
  practice_count: number;
  total_score: number;
  last_practice_date: string;
  streak_days: number;
}

export function getDefaultLearningStats(): LearningStats {
  return {
    total_time_minutes: 0,
    practice_count: 0,
    total_score: 0,
    last_practice_date: '',
    streak_days: 0
  };
}

export async function getLearningStats(userId: string): Promise<LearningStats> {
  const user = await userRepository.findOne({ where: { id: userId } });
  if (!user) {
    throw new Error('User not found');
  }
  return user.learning_stats || getDefaultLearningStats();
}

export async function updateLearningStats(
  userId: string,
  score: number,
  timeMinutes: number = 5
): Promise<LearningStats> {
  const user = await userRepository.findOne({ where: { id: userId } });
  if (!user) {
    throw new Error('User not found');
  }

  const today = new Date().toISOString().split('T')[0];
  const stats = user.learning_stats || getDefaultLearningStats();

  // Update practice count
  stats.practice_count += 1;
  
  // Update total score
  stats.total_score += score;
  
  // Update total time
  stats.total_time_minutes += timeMinutes;

  // Update streak days
  if (stats.last_practice_date === today) {
    // Same day, no change to streak
  } else if (stats.last_practice_date === getYesterday()) {
    // Consecutive day
    stats.streak_days += 1;
  } else {
    // Gap in practice, reset streak
    stats.streak_days = 1;
  }

  // Update last practice date
  stats.last_practice_date = today;

  user.learning_stats = stats;
  await userRepository.save(user);

  return stats;
}

function getYesterday(): string {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return yesterday.toISOString().split('T')[0];
}

export function calculateAccuracyRate(stats: LearningStats): number {
  if (stats.practice_count === 0) {
    return 0;
  }
  // Score is 1-10, calculate percentage
  const avgScore = stats.total_score / stats.practice_count;
  return Math.round((avgScore / 10) * 100);
}
