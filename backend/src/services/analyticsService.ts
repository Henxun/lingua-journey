import { AppDataSource } from '../config/database';
import { AssessmentResult } from '../entities/AssessmentResult';
import { UserSkillProfile } from '../entities/UserSkillProfile';
import { LearningSession } from '../entities/LearningSession';
import { User } from '../entities/User';

const resultRepository = AppDataSource.getRepository(AssessmentResult);
const skillProfileRepository = AppDataSource.getRepository(UserSkillProfile);
const sessionRepository = AppDataSource.getRepository(LearningSession);
const userRepository = AppDataSource.getRepository(User);

export interface LearningInsights {
  averageScore: number;
  totalAssessments: number;
  bestSkill: string;
  needsImprovement: string;
  weeklyProgress: { date: string; score: number }[];
  recommendations: string[];
}

export interface HourlyDistribution {
  hour: number;
  sessions: number;
  avgDuration: number;
  avgAccuracy: number;
}

export interface WeeklyDistribution {
  day: string;
  totalMinutes: number;
  sessions: number;
}

export interface EfficiencyPoint {
  durationRange: string;
  avgAccuracy: number;
  count: number;
}

export interface LearningHabits {
  dailyDistribution: HourlyDistribution[];
  weeklyDistribution: WeeklyDistribution[];
  bestLearningTime: {
    hour: number;
    efficiencyScore: number;
  };
  learningFrequency: {
    avgDaysPerWeek: number;
    avgSessionsPerDay: number;
    consistencyScore: number;
  };
  efficiencyCurve: EfficiencyPoint[];
}

export interface GoalPrediction {
  id: string;
  name: string;
  currentProgress: number;
  targetProgress: number;
  predictedCompletion: string;
  daysRemaining: number;
  recommendedDailyXP: number;
  riskLevel: 'low' | 'medium' | 'high';
}

export interface ProgressPrediction {
  goals: GoalPrediction[];
  overallPrediction: {
    nextLevelDate: string;
    fluencyEstimate: string;
    confidence: number;
  };
  recommendations: string[];
}

export interface ComprehensiveReport {
  summary: {
    totalLearningTime: number;
    totalSessions: number;
    averageAccuracy: number;
    currentStreak: number;
  };
  skills: Record<string, {
    current: number;
    trend: string;
    prediction: number;
  }>;
  habits: LearningHabits;
  predictions: ProgressPrediction;
  recommendations: string[];
}

export async function getLearningInsights(userId: string): Promise<LearningInsights> {
  const results = await resultRepository.find({
    where: { user_id: userId },
    order: { completed_at: 'DESC' }
  });

  const profiles = await skillProfileRepository.find({ where: { user_id: userId } });

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
    date: r.completed_at?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0],
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

export async function getLearningHabits(userId: string): Promise<LearningHabits> {
  const sessions = await sessionRepository.find({
    where: { user_id: userId },
    order: { started_at: 'DESC' },
    take: 100
  });

  // Daily distribution by hour
  const hourlyMap = new Map<number, { sessions: LearningSession[] }>();
  for (const session of sessions) {
    const hour = new Date(session.started_at).getHours();
    if (!hourlyMap.has(hour)) {
      hourlyMap.set(hour, { sessions: [] });
    }
    hourlyMap.get(hour)!.sessions.push(session);
  }

  const dailyDistribution: HourlyDistribution[] = [];
  for (const [hour, data] of hourlyMap) {
    dailyDistribution.push({
      hour,
      sessions: data.sessions.length,
      avgDuration: Math.round(data.sessions.reduce((sum, s) => sum + s.duration_minutes, 0) / data.sessions.length),
      avgAccuracy: Math.round(data.sessions.reduce((sum, s) => sum + s.accuracy_rate, 0) / data.sessions.length)
    });
  }
  dailyDistribution.sort((a, b) => a.hour - b.hour);

  // Weekly distribution
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const weeklyMap = new Map<string, LearningSession[]>();
  for (const session of sessions) {
    const day = dayNames[new Date(session.started_at).getDay()];
    if (!weeklyMap.has(day)) {
      weeklyMap.set(day, []);
    }
    weeklyMap.get(day)!.push(session);
  }

  const weeklyDistribution: WeeklyDistribution[] = dayNames.map(day => {
    const daySessions = weeklyMap.get(day) || [];
    return {
      day,
      totalMinutes: daySessions.reduce((sum, s) => sum + s.duration_minutes, 0),
      sessions: daySessions.length
    };
  });

  // Best learning time
  let bestHour = 0;
  let bestEfficiency = 0;
  for (const dist of dailyDistribution) {
    const efficiency = dist.avgAccuracy * (dist.sessions / sessions.length) * 100;
    if (efficiency > bestEfficiency) {
      bestEfficiency = efficiency;
      bestHour = dist.hour;
    }
  }

  // Learning frequency
  const uniqueDays = new Set(sessions.map(s => new Date(s.started_at).toDateString()));
  const avgDaysPerWeek = sessions.length > 0 ? Math.min(uniqueDays.size / (sessions.length / 7), 7) : 0;
  const avgSessionsPerDay = sessions.length > 0 ? sessions.length / uniqueDays.size : 0;

  // Calculate consistency score (how regular the learning is)
  const consistencyScore = Math.round(Math.min(avgDaysPerWeek / 5 * 100, 100));

  // Efficiency curve by duration
  const durationRanges = ['0-5', '5-10', '10-15', '15-20', '20-30', '30-45', '45-60', '60+'];
  const durationMap = new Map<string, LearningSession[]>();
  for (const session of sessions) {
    const mins = session.duration_minutes;
    let range = '60+';
    if (mins < 5) range = '0-5';
    else if (mins < 10) range = '5-10';
    else if (mins < 15) range = '10-15';
    else if (mins < 20) range = '15-20';
    else if (mins < 30) range = '20-30';
    else if (mins < 45) range = '30-45';
    else if (mins < 60) range = '45-60';

    if (!durationMap.has(range)) {
      durationMap.set(range, []);
    }
    durationMap.get(range)!.push(session);
  }

  const efficiencyCurve: EfficiencyPoint[] = durationRanges.map(range => {
    const rangeSessions = durationMap.get(range) || [];
    return {
      durationRange: range,
      avgAccuracy: rangeSessions.length > 0
        ? Math.round(rangeSessions.reduce((sum, s) => sum + s.accuracy_rate, 0) / rangeSessions.length)
        : 0,
      count: rangeSessions.length
    };
  });

  return {
    dailyDistribution,
    weeklyDistribution,
    bestLearningTime: {
      hour: bestHour,
      efficiencyScore: Math.round(bestEfficiency)
    },
    learningFrequency: {
      avgDaysPerWeek: Math.round(avgDaysPerWeek * 10) / 10,
      avgSessionsPerDay: Math.round(avgSessionsPerDay * 10) / 10,
      consistencyScore
    },
    efficiencyCurve
  };
}

export async function getProgressPrediction(userId: string): Promise<ProgressPrediction> {
  const user = await userRepository.findOne({ where: { id: userId } });
  if (!user) {
    throw new Error('User not found');
  }

  const sessions = await sessionRepository.find({
    where: { user_id: userId },
    order: { started_at: 'DESC' },
    take: 30
  });

  const profiles = await skillProfileRepository.find({ where: { user_id: userId } });

  // Calculate average daily XP gain
  const dailyXPMap = new Map<string, number>();
  for (const session of sessions) {
    const date = new Date(session.started_at).toDateString();
    const current = dailyXPMap.get(date) || 0;
    dailyXPMap.set(date, current + session.xp_earned);
  }

  const avgDailyXP = dailyXPMap.size > 0
    ? Array.from(dailyXPMap.values()).reduce((sum, xp) => sum + xp, 0) / dailyXPMap.size
    : 50;

  // Current level and XP
  const currentXP = user.gamification?.xp || 0;
  const currentLevel = Math.floor(Math.sqrt(currentXP / 100));
  const nextLevelXP = Math.pow(currentLevel + 1, 2) * 100;
  const xpToNextLevel = nextLevelXP - currentXP;

  // Predict next level date
  const daysToNextLevel = avgDailyXP > 0 ? Math.ceil(xpToNextLevel / avgDailyXP) : 30;
  const nextLevelDate = new Date();
  nextLevelDate.setDate(nextLevelDate.getDate() + daysToNextLevel);

  // Fluency estimate based on skill profiles
  const avgSkillScore = profiles.length > 0
    ? profiles.reduce((sum, p) => sum + p.score, 0) / profiles.length
    : 50;

  const fluencyEstimate = getFluencyEstimate(avgSkillScore, currentLevel);

  // Goals prediction (simplified - using level as main goal)
  const goals: GoalPrediction[] = [
    {
      id: 'level_goal',
      name: `Reach Level ${currentLevel + 1}`,
      currentProgress: Math.round((currentXP / nextLevelXP) * 100),
      targetProgress: 100,
      predictedCompletion: nextLevelDate.toISOString().split('T')[0],
      daysRemaining: daysToNextLevel,
      recommendedDailyXP: Math.ceil(xpToNextLevel / 30),
      riskLevel: daysToNextLevel > 60 ? 'high' : daysToNextLevel > 30 ? 'medium' : 'low'
    }
  ];

  // Generate recommendations
  const recommendations: string[] = [];
  if (avgDailyXP < 50) {
    recommendations.push('Increase daily practice to reach goals faster');
  }
  if (avgSkillScore < 70) {
    recommendations.push('Focus on weaker skills to improve overall fluency');
  }
  if (sessions.length < 10) {
    recommendations.push('Build a consistent learning habit by practicing daily');
  }

  return {
    goals,
    overallPrediction: {
      nextLevelDate: nextLevelDate.toISOString().split('T')[0],
      fluencyEstimate,
      confidence: Math.min(sessions.length / 30, 1)
    },
    recommendations
  };
}

function getFluencyEstimate(avgScore: number, level: number): string {
  if (level >= 25 && avgScore >= 85) return 'C1 by end of year';
  if (level >= 20 && avgScore >= 75) return 'B2 within 6 months';
  if (level >= 15 && avgScore >= 65) return 'B1 within 3 months';
  if (level >= 10 && avgScore >= 55) return 'A2 within 2 months';
  return 'A1 - continue building foundation';
}

export async function getComprehensiveReport(userId: string): Promise<ComprehensiveReport> {
  const sessions = await sessionRepository.find({
    where: { user_id: userId },
    order: { started_at: 'DESC' }
  });

  const user = await userRepository.findOne({ where: { id: userId } });
  const profiles = await skillProfileRepository.find({ where: { user_id: userId } });

  const totalLearningTime = sessions.reduce((sum, s) => sum + s.duration_minutes, 0);
  const averageAccuracy = sessions.length > 0
    ? Math.round(sessions.reduce((sum, s) => sum + s.accuracy_rate, 0) / sessions.length)
    : 0;

  const skills: Record<string, { current: number; trend: string; prediction: number }> = {};
  for (const profile of profiles) {
    skills[profile.skill] = {
      current: profile.score,
      trend: profile.trend === 1 ? 'improving' : profile.trend === -1 ? 'declining' : 'stable',
      prediction: Math.min(profile.score + 10, 100)
    };
  }

  const habits = await getLearningHabits(userId);
  const predictions = await getProgressPrediction(userId);

  const recommendations: string[] = [];
  if (habits.learningFrequency.consistencyScore < 50) {
    recommendations.push('Try to practice more consistently - aim for at least 5 days per week');
  }
  if (averageAccuracy < 70) {
    recommendations.push('Focus on accuracy - slow down and review mistakes');
  }
  if (totalLearningTime < 300) {
    recommendations.push('Increase total learning time for better results');
  }

  return {
    summary: {
      totalLearningTime,
      totalSessions: sessions.length,
      averageAccuracy,
      currentStreak: user?.learning_stats?.streak_days || 0
    },
    skills,
    habits,
    predictions,
    recommendations
  };
}

function generateRecommendations(profiles: UserSkillProfile[], avgScore: number): string[] {
  const recommendations: string[] = [];

  if (avgScore < 70) {
    recommendations.push('Consider reviewing previous lessons before moving forward.');
  }

  const weakSkills = profiles.filter(p => p.score < 70);
  for (const skill of weakSkills) {
    recommendations.push(`Practice ${skill.skill} more - it's an area for growth!`);
  }

  const improvingSkills = profiles.filter(p => p.trend === 1);
  if (improvingSkills.length > 0) {
    recommendations.push(`Great progress in ${improvingSkills.map(s => s.skill).join(', ')}!`);
  }

  if (recommendations.length === 0) {
    recommendations.push('Keep up the consistent practice!');
  }

  return recommendations;
}

export async function getProgressTrend(userId: string, skill?: string): Promise<{ date: Date; score: number }[]> {
  const qb = resultRepository
    .createQueryBuilder('result')
    .where('result.user_id = :userId', { userId })
    .orderBy('result.completed_at', 'DESC')
    .limit(30);

  const results = await qb.getMany();

  return results.map(r => ({
    date: r.completed_at,
    score: skill ? (r.skill_scores as any)[skill] || 0 : r.score
  }));
}

// Helper function to record a learning session
export async function recordSession(
  userId: string,
  sessionType: 'conversation' | 'assessment' | 'vocabulary' | 'scene' | 'ai_teacher',
  durationMinutes: number,
  activityCount: number,
  accuracyRate: number,
  xpEarned: number,
  metadata?: Record<string, any>
): Promise<LearningSession> {
  const session = new LearningSession();
  session.user_id = userId;
  session.session_type = sessionType;
  session.started_at = new Date(Date.now() - durationMinutes * 60 * 1000);
  session.ended_at = new Date();
  session.duration_minutes = durationMinutes;
  session.activity_count = activityCount;
  session.accuracy_rate = accuracyRate;
  session.xp_earned = xpEarned;
  session.metadata = metadata || null;

  return await sessionRepository.save(session);
}