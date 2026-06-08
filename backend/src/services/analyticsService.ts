import { AppDataSource } from '../config/database';
import { AssessmentResult } from '../entities/AssessmentResult';
import { UserSkillProfile } from '../entities/UserSkillProfile';

const resultRepository = AppDataSource.getRepository(AssessmentResult);
const skillProfileRepository = AppDataSource.getRepository(UserSkillProfile);

export interface LearningInsights {
  averageScore: number;
  totalAssessments: number;
  bestSkill: string;
  needsImprovement: string;
  weeklyProgress: { date: string; score: number }[];
  recommendations: string[];
}

export async function getLearningInsights(userId: string): Promise<LearningInsights> {
  const results = await resultRepository.find({
    where: { userId },
    order: { createdAt: 'DESC' }
  });

  const profiles = await skillProfileRepository.find({ where: { userId } });

  const averageScore = results.length > 0
    ? Math.round(results.reduce((sum, r) => sum + r.score, 0) / results.length)
    : 0;

  const bestSkill = profiles.length > 0
    ? profiles.reduce((best, p) => p.score > best.score ? p : best, profiles[0]).skill
    : 'N/A';

  const needsImprovement = profiles.length > 0
    ? profiles.reduce((worst, p) => p.score < worst.score ? p : worst, profiles[0]).skill
    : 'N/A';

  const weeklyProgress = results.slice(0, 7).map(r => ({
    date: r.completedAt?.toISOString().split('T')[0] || r.createdAt.toISOString().split('T')[0],
    score: r.score
  })).reverse();

  const recommendations = generateRecommendations(profiles, averageScore);

  return {
    averageScore,
    totalAssessments: results.length,
    bestSkill,
    needsImprovement,
    weeklyProgress,
    recommendations
  };
}

function generateRecommendations(
  profiles: UserSkillProfile[],
  avgScore: number
): string[] {
  const recommendations: string[] = [];

  if (avgScore < 70) {
    recommendations.push('Consider reviewing previous lessons before moving forward.');
  }

  const weakSkills = profiles.filter(p => p.score < 70);
  for (const skill of weakSkills) {
    recommendations.push(`Practice ${skill.skill} more - it's an area for growth!`);
  }

  const improvingSkills = profiles.filter(p => p.trend === 'improving');
  if (improvingSkills.length > 0) {
    recommendations.push(`Great progress in ${improvingSkills.map(s => s.skill).join(', ')}!`);
  }

  if (recommendations.length === 0) {
    recommendations.push('Keep up the consistent practice!');
  }

  return recommendations;
}

export async function getProgressTrend(
  userId: string,
  skill?: string
): Promise<{ date: Date; score: number }[]> {
  const qb = resultRepository
    .createQueryBuilder('result')
    .where('result.userId = :userId', { userId })
    .orderBy('result.createdAt', 'DESC')
    .limit(30);

  const results = await qb.getMany();

  return results.map(r => ({
    date: r.completedAt || r.createdAt,
    score: skill
      ? (r.skillScores as any)[skill] || 0
      : r.score
  }));
}
