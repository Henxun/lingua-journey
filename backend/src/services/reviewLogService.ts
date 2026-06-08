import { AppDataSource } from '../config/database';
import { ReviewLog } from '../entities/ReviewLog';

const reviewLogRepository = AppDataSource.getRepository(ReviewLog);

export async function getReviewHistoryByCard(cardId: string): Promise<ReviewLog[]> {
  return await reviewLogRepository.find({
    where: { card_id: cardId },
    order: { reviewed_at: 'DESC' }
  });
}

export async function getReviewHistoryByUser(userId: string, limit: number = 100): Promise<ReviewLog[]> {
  return await reviewLogRepository.find({
    where: { user_id: userId },
    relations: ['card'],
    order: { reviewed_at: 'DESC' },
    take: limit
  });
}

export async function getReviewStats(userId: string, days: number = 7): Promise<{
  totalReviews: number;
  correctCount: number;
  streakDays: number;
}> {
  const now = new Date();
  const startDate = new Date();
  startDate.setDate(now.getDate() - days);

  const reviews = await reviewLogRepository
    .createQueryBuilder('log')
    .where('log.user_id = :userId', { userId })
    .andWhere('log.reviewed_at >= :startDate', { startDate })
    .getMany();

  const totalReviews = reviews.length;
  const correctCount = reviews.filter(r => r.quality >= 2).length;

  return { totalReviews, correctCount, streakDays: 1 };
}
