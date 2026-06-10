import { AppDataSource } from '../config/database';
import { User } from '../entities/User';
import { Achievement, AchievementCategory, AchievementRarity } from '../entities/Achievement';
import { UserAchievement } from '../entities/UserAchievement';
import { DailyQuest, QuestType } from '../entities/DailyQuest';
import { UserQuestProgress } from '../entities/UserQuestProgress';

const userRepository = AppDataSource.getRepository(User);
const achievementRepository = AppDataSource.getRepository(Achievement);
const userAchievementRepository = AppDataSource.getRepository(UserAchievement);
const dailyQuestRepository = AppDataSource.getRepository(DailyQuest);
const userQuestProgressRepository = AppDataSource.getRepository(UserQuestProgress);

export interface GamificationProfile {
  xp: number;
  level: number;
  title: string;
  streak_days: number;
  weekly_xp: number;
  monthly_xp: number;
  last_check_in: string | null;
  achievements_unlocked: number;
  total_achievements: number;
}

export interface LeaderboardEntry {
  rank: number;
  user_id: string;
  username: string;
  avatar_url: string | null;
  xp: number;
}

export interface AchievementWithProgress {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: AchievementCategory;
  rarity: AchievementRarity;
  xp_reward: number;
  unlocked: boolean;
  unlocked_at: Date | null;
  progress: number;
  current_value: number;
  target_value: number;
}

export interface ShareContent {
  title: string;
  message: string;
  icon: string;
  rarity: AchievementRarity;
  user_stats: {
    level: number;
    xp: number;
    achievements_unlocked: number;
  };
}

export interface AchievementsSummary {
  total: number;
  unlocked: number;
  by_rarity: Record<AchievementRarity, number>;
}

export interface AchievementsResponse {
  achievements: AchievementWithProgress[];
  summary: AchievementsSummary;
}

const LEVEL_TITLES = [
  { minLevel: 0, maxLevel: 4, title: '初学者' },
  { minLevel: 5, maxLevel: 9, title: '学习者' },
  { minLevel: 10, maxLevel: 19, title: '进阶者' },
  { minLevel: 20, maxLevel: 29, title: '熟练者' },
  { minLevel: 30, maxLevel: 100, title: '大师' }
];

export function calculateLevel(xp: number): number {
  if (xp < 0) return 0;
  return Math.floor(Math.sqrt(xp / 100));
}

export function getTitleForLevel(level: number): string {
  for (const range of LEVEL_TITLES) {
    if (level >= range.minLevel && level <= range.maxLevel) {
      return range.title;
    }
  }
  return '大师';
}

export function getXpForNextLevel(level: number): number {
  return Math.pow(level + 1, 2) * 100;
}

export function getRarityColor(rarity: AchievementRarity): string {
  switch (rarity) {
    case AchievementRarity.COMMON:
      return 'gray';
    case AchievementRarity.RARE:
      return 'blue';
    case AchievementRarity.EPIC:
      return 'purple';
    case AchievementRarity.LEGENDARY:
      return 'gold';
    default:
      return 'gray';
  }
}

function getTodayDateString(): string {
  return new Date().toISOString().split('T')[0];
}

function initializeGamification(user: User): void {
  if (!user.gamification) {
    user.gamification = {
      xp: 0,
      weekly_xp: 0,
      monthly_xp: 0,
      last_check_in: ''
    };
  }
}

export async function checkIn(userId: string): Promise<{ success: boolean; xp_earned: number; streak_days: number; message: string }> {
  const user = await userRepository.findOne({ where: { id: userId } });
  if (!user) {
    throw new Error('User not found');
  }

  initializeGamification(user);
  const today = getTodayDateString();
  const lastCheckIn = user.gamification.last_check_in;

  if (lastCheckIn === today) {
    return { success: false, xp_earned: 0, streak_days: user.learning_stats?.streak_days || 0, message: 'Already checked in today' };
  }

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  let newStreak = 1;
  if (lastCheckIn === yesterdayStr) {
    newStreak = (user.learning_stats?.streak_days || 0) + 1;
  }

  const xpEarned = 10 + (newStreak >= 7 ? 50 : 0);

  user.gamification.xp += xpEarned;
  user.gamification.weekly_xp += xpEarned;
  user.gamification.monthly_xp += xpEarned;
  user.gamification.last_check_in = today;

  if (!user.learning_stats) {
    user.learning_stats = {
      total_time_minutes: 0,
      practice_count: 0,
      total_score: 0,
      last_practice_date: '',
      streak_days: newStreak
    };
  }
  user.learning_stats.streak_days = newStreak;

  await userRepository.save(user);

  await updateQuestProgress(userId, QuestType.CHECK_IN, 1);

  await checkAndUnlockAchievements(userId, 'check_in_count', await getCheckInCount(userId));
  await checkAndUnlockAchievements(userId, 'streak_days', newStreak);

  return { success: true, xp_earned: xpEarned, streak_days: newStreak, message: 'Check-in successful' };
}

export async function getCheckInCount(userId: string): Promise<number> {
  const user = await userRepository.findOne({ where: { id: userId } });
  if (!user) return 0;
  
  const achievements = await userAchievementRepository.find({ where: { user_id: userId } });
  return achievements.length;
}

export async function awardXp(userId: string, amount: number): Promise<{ new_xp: number; new_level: number }> {
  const user = await userRepository.findOne({ where: { id: userId } });
  if (!user) {
    throw new Error('User not found');
  }

  initializeGamification(user);

  user.gamification.xp += amount;
  user.gamification.weekly_xp += amount;
  user.gamification.monthly_xp += amount;

  await userRepository.save(user);

  return {
    new_xp: user.gamification.xp,
    new_level: calculateLevel(user.gamification.xp)
  };
}

export async function getGamificationProfile(userId: string): Promise<GamificationProfile> {
  const user = await userRepository.findOne({ where: { id: userId } });
  if (!user) {
    throw new Error('User not found');
  }

  initializeGamification(user);

  const totalAchievements = await achievementRepository.count();
  const unlockedAchievements = await userAchievementRepository.count({ where: { user_id: userId } });

  return {
    xp: user.gamification.xp,
    level: calculateLevel(user.gamification.xp),
    title: getTitleForLevel(calculateLevel(user.gamification.xp)),
    streak_days: user.learning_stats?.streak_days || 0,
    weekly_xp: user.gamification.weekly_xp,
    monthly_xp: user.gamification.monthly_xp,
    last_check_in: user.gamification.last_check_in || null,
    achievements_unlocked: unlockedAchievements,
    total_achievements: totalAchievements
  };
}

export async function getAllAchievements(userId: string): Promise<any[]> {
  const achievements = await achievementRepository.find();
  const userAchievements = await userAchievementRepository.find({ where: { user_id: userId } });
  const unlockedIds = new Set(userAchievements.map(ua => ua.achievement_id));

  return achievements.map(a => ({
    id: a.id,
    name: a.name,
    description: a.description,
    icon: a.icon,
    category: a.category,
    rarity: a.rarity,
    xp_reward: a.xp_reward,
    unlocked: unlockedIds.has(a.id),
    unlocked_at: userAchievements.find(ua => ua.achievement_id === a.id)?.unlocked_at || null
  }));
}

export async function getAchievementsWithProgress(userId: string): Promise<AchievementsResponse> {
  const achievements = await achievementRepository.find();
  const userAchievements = await userAchievementRepository.find({ where: { user_id: userId } });
  const unlockedIds = new Set(userAchievements.map(ua => ua.achievement_id));
  
  const user = await userRepository.findOne({ where: { id: userId } });
  if (!user) {
    throw new Error('User not found');
  }

  const achievementsWithProgress: AchievementWithProgress[] = [];
  
  for (const achievement of achievements) {
    const currentValue = await getCurrentValueForCondition(userId, achievement.condition_type);
    const progress = Math.min((currentValue / achievement.condition_value) * 100, 100);
    
    achievementsWithProgress.push({
      id: achievement.id,
      name: achievement.name,
      description: achievement.description,
      icon: achievement.icon,
      category: achievement.category,
      rarity: achievement.rarity,
      xp_reward: achievement.xp_reward,
      unlocked: unlockedIds.has(achievement.id),
      unlocked_at: userAchievements.find(ua => ua.achievement_id === achievement.id)?.unlocked_at || null,
      progress: Math.round(progress),
      current_value: currentValue,
      target_value: achievement.condition_value
    });
  }

  const unlockedCount = unlockedIds.size;
  const byRarity: Record<AchievementRarity, number> = {
    [AchievementRarity.COMMON]: 0,
    [AchievementRarity.RARE]: 0,
    [AchievementRarity.EPIC]: 0,
    [AchievementRarity.LEGENDARY]: 0
  };

  achievementsWithProgress.forEach(a => {
    if (a.unlocked) {
      byRarity[a.rarity]++;
    }
  });

  return {
    achievements: achievementsWithProgress,
    summary: {
      total: achievements.length,
      unlocked: unlockedCount,
      by_rarity: byRarity
    }
  };
}

async function getCurrentValueForCondition(userId: string, conditionType: string): Promise<number> {
  const user = await userRepository.findOne({ where: { id: userId } });
  if (!user) return 0;

  switch (conditionType) {
    case 'check_in_count':
      const checkIns = await userAchievementRepository.count({ where: { user_id: userId } });
      return checkIns;
    case 'streak_days':
      return user.learning_stats?.streak_days || 0;
    case 'practice_count':
      return user.learning_stats?.practice_count || 0;
    case 'courses_completed':
      return user.learning_stats?.completed_courses?.length || 0;
    case 'scenes_explored':
      return user.learning_stats?.scenes_explored?.length || 0;
    case 'level':
      return calculateLevel(user.gamification?.xp || 0);
    case 'conversation_count':
      return user.learning_stats?.conversation_count || 0;
    case 'assessment_passed':
      return user.learning_stats?.assessments_passed || 0;
    case 'vocabulary_mastered':
      return user.learning_stats?.vocabulary_mastered || 0;
    case 'ai_teacher_interaction':
      return user.learning_stats?.ai_teacher_interactions || 0;
    default:
      return 0;
  }
}

export async function generateShareContent(userId: string, achievementId: string): Promise<ShareContent> {
  const achievement = await achievementRepository.findOne({ where: { id: achievementId } });
  if (!achievement) {
    throw new Error('Achievement not found');
  }

  const profile = await getGamificationProfile(userId);

  return {
    title: '🎉 解锁成就！',
    message: `我在 Lingua Journey 解锁了「${achievement.name}」成就！快来挑战我吧！`,
    icon: achievement.icon,
    rarity: achievement.rarity,
    user_stats: {
      level: profile.level,
      xp: profile.xp,
      achievements_unlocked: profile.achievements_unlocked
    }
  };
}

export async function checkAndUnlockAchievements(userId: string, conditionType: string, currentValue: number): Promise<string[]> {
  const achievements = await achievementRepository.find({
    where: { condition_type: conditionType },
    order: { condition_value: 'ASC' }
  });

  const userAchievements = await userAchievementRepository.find({ where: { user_id: userId } });
  const unlockedIds = new Set(userAchievements.map(ua => ua.achievement_id));

  const newlyUnlocked: string[] = [];

  for (const achievement of achievements) {
    if (!unlockedIds.has(achievement.id) && currentValue >= achievement.condition_value) {
      const userAchievement = new UserAchievement();
      userAchievement.user_id = userId;
      userAchievement.achievement_id = achievement.id;
      await userAchievementRepository.save(userAchievement);

      await awardXp(userId, achievement.xp_reward);
      newlyUnlocked.push(achievement.name);
    }
  }

  return newlyUnlocked;
}

export async function getDailyQuests(userId: string): Promise<any[]> {
  const quests = await dailyQuestRepository.find({ where: { is_active: true } });
  const today = getTodayDateString();

  const progressRecords = await userQuestProgressRepository.find({
    where: { user_id: userId, date: today },
    relations: ['quest']
  });

  const progressMap = new Map(progressRecords.map(p => [p.quest_id, p]));

  return quests.map(quest => {
    const progress = progressMap.get(quest.id);
    return {
      id: quest.id,
      name: quest.name,
      description: quest.description,
      type: quest.type,
      target_value: quest.target_value,
      xp_reward: quest.xp_reward,
      progress: progress?.progress || 0,
      completed: progress?.completed || false
    };
  });
}

export async function updateQuestProgress(userId: string, questType: QuestType, amount: number = 1): Promise<void> {
  const quests = await dailyQuestRepository.find({ where: { type: questType, is_active: true } });
  if (quests.length === 0) return;

  const today = getTodayDateString();

  for (const quest of quests) {
    let progress = await userQuestProgressRepository.findOne({
      where: { user_id: userId, quest_id: quest.id, date: today }
    });

    if (!progress) {
      progress = new UserQuestProgress();
      progress.user_id = userId;
      progress.quest_id = quest.id;
      progress.date = today;
      progress.progress = 0;
      progress.completed = false;
    }

    if (!progress.completed) {
      progress.progress += amount;

      if (progress.progress >= quest.target_value) {
        progress.completed = true;
        await awardXp(userId, quest.xp_reward);
      }

      await userQuestProgressRepository.save(progress);
    }
  }
}

export async function getLeaderboard(type: 'weekly' | 'monthly'): Promise<LeaderboardEntry[]> {
  const users = await userRepository.find();

  const leaderboard: LeaderboardEntry[] = users.map(user => {
    initializeGamification(user);
    return {
      user_id: user.id,
      username: user.username,
      avatar_url: user.avatar_url,
      xp: type === 'weekly' ? user.gamification.weekly_xp : user.gamification.monthly_xp,
      rank: 0
    };
  });

  leaderboard.sort((a, b) => b.xp - a.xp);

  return leaderboard.slice(0, 100).map((entry, index) => ({
    ...entry,
    rank: index + 1
  }));
}

export async function seedAchievements(): Promise<void> {
  const count = await achievementRepository.count();
  if (count > 0) return;

  const defaultAchievements = [
    { name: '首次签到', description: '完成每日签到', category: AchievementCategory.STREAK, rarity: AchievementRarity.COMMON, condition_type: 'check_in_count', condition_value: 1, xp_reward: 20, icon: '📅' },
    { name: '连续7天', description: '连续签到7天', category: AchievementCategory.STREAK, rarity: AchievementRarity.RARE, condition_type: 'streak_days', condition_value: 7, xp_reward: 100, icon: '🔥' },
    { name: '连续30天', description: '连续签到30天', category: AchievementCategory.STREAK, rarity: AchievementRarity.EPIC, condition_type: 'streak_days', condition_value: 30, xp_reward: 500, icon: '⚡' },
    { name: '连续365天', description: '连续签到一整年', category: AchievementCategory.STREAK, rarity: AchievementRarity.LEGENDARY, condition_type: 'streak_days', condition_value: 365, xp_reward: 5000, icon: '👑' },
    { name: '练习新手', description: '完成10次练习', category: AchievementCategory.PRACTICE, rarity: AchievementRarity.COMMON, condition_type: 'practice_count', condition_value: 10, xp_reward: 50, icon: '🎯' },
    { name: '练习达人', description: '完成100次练习', category: AchievementCategory.PRACTICE, rarity: AchievementRarity.RARE, condition_type: 'practice_count', condition_value: 100, xp_reward: 200, icon: '🏆' },
    { name: '练习大师', description: '完成1000次练习', category: AchievementCategory.PRACTICE, rarity: AchievementRarity.EPIC, condition_type: 'practice_count', condition_value: 1000, xp_reward: 1000, icon: '🌟' },
    { name: '课程完成者', description: '完成第一个课程', category: AchievementCategory.COURSE, rarity: AchievementRarity.COMMON, condition_type: 'courses_completed', condition_value: 1, xp_reward: 150, icon: '📚' },
    { name: '课程收藏家', description: '完成10个课程', category: AchievementCategory.COURSE, rarity: AchievementRarity.RARE, condition_type: 'courses_completed', condition_value: 10, xp_reward: 500, icon: '📖' },
    { name: '学习探险家', description: '学习3种不同场景', category: AchievementCategory.EXPLORATION, rarity: AchievementRarity.COMMON, condition_type: 'scenes_explored', condition_value: 3, xp_reward: 75, icon: '🗺️' },
    { name: '场景大师', description: '探索所有场景', category: AchievementCategory.EXPLORATION, rarity: AchievementRarity.EPIC, condition_type: 'scenes_explored', condition_value: 10, xp_reward: 800, icon: '🌍' },
    { name: '语言大师', description: '达到30级', category: AchievementCategory.PRACTICE, rarity: AchievementRarity.LEGENDARY, condition_type: 'level', condition_value: 30, xp_reward: 1000, icon: '👑' },
    { name: '初级学者', description: '达到5级', category: AchievementCategory.PRACTICE, rarity: AchievementRarity.COMMON, condition_type: 'level', condition_value: 5, xp_reward: 100, icon: '📊' },
    { name: '中级学者', description: '达到15级', category: AchievementCategory.PRACTICE, rarity: AchievementRarity.RARE, condition_type: 'level', condition_value: 15, xp_reward: 300, icon: '📈' },
    { name: '高级学者', description: '达到25级', category: AchievementCategory.PRACTICE, rarity: AchievementRarity.EPIC, condition_type: 'level', condition_value: 25, xp_reward: 600, icon: '🎓' },
    { name: '对话新手', description: '完成10次对话练习', category: AchievementCategory.CONVERSATION, rarity: AchievementRarity.COMMON, condition_type: 'conversation_count', condition_value: 10, xp_reward: 60, icon: '💬' },
    { name: '对话达人', description: '完成100次对话练习', category: AchievementCategory.CONVERSATION, rarity: AchievementRarity.RARE, condition_type: 'conversation_count', condition_value: 100, xp_reward: 250, icon: '🎤' },
    { name: '对话大师', description: '完成500次对话练习', category: AchievementCategory.CONVERSATION, rarity: AchievementRarity.EPIC, condition_type: 'conversation_count', condition_value: 500, xp_reward: 800, icon: '🎙️' },
    { name: '评估新手', description: '通过第一次评估', category: AchievementCategory.ASSESSMENT, rarity: AchievementRarity.COMMON, condition_type: 'assessment_passed', condition_value: 1, xp_reward: 100, icon: '✅' },
    { name: '评估达人', description: '通过10次评估', category: AchievementCategory.ASSESSMENT, rarity: AchievementRarity.RARE, condition_type: 'assessment_passed', condition_value: 10, xp_reward: 300, icon: '🏅' },
    { name: '词汇初学者', description: '掌握50个词汇', category: AchievementCategory.VOCABULARY, rarity: AchievementRarity.COMMON, condition_type: 'vocabulary_mastered', condition_value: 50, xp_reward: 80, icon: '📝' },
    { name: '词汇达人', description: '掌握500个词汇', category: AchievementCategory.VOCABULARY, rarity: AchievementRarity.RARE, condition_type: 'vocabulary_mastered', condition_value: 500, xp_reward: 400, icon: '📚' },
    { name: '词汇大师', description: '掌握2000个词汇', category: AchievementCategory.VOCABULARY, rarity: AchievementRarity.LEGENDARY, condition_type: 'vocabulary_mastered', condition_value: 2000, xp_reward: 2000, icon: '📖' },
    { name: 'AI学习者', description: '与AI教师对话10次', category: AchievementCategory.AI_TEACHER, rarity: AchievementRarity.COMMON, condition_type: 'ai_teacher_interaction', condition_value: 10, xp_reward: 70, icon: '🤖' },
    { name: 'AI伙伴', description: '与AI教师对话100次', category: AchievementCategory.AI_TEACHER, rarity: AchievementRarity.RARE, condition_type: 'ai_teacher_interaction', condition_value: 100, xp_reward: 300, icon: '👯' },
    { name: 'AI专家', description: '与AI教师对话500次', category: AchievementCategory.AI_TEACHER, rarity: AchievementRarity.EPIC, condition_type: 'ai_teacher_interaction', condition_value: 500, xp_reward: 1000, icon: '🧠' }
  ];

  for (const data of defaultAchievements) {
    const achievement = new Achievement();
    Object.assign(achievement, data);
    await achievementRepository.save(achievement);
  }
}

export async function seedDailyQuests(): Promise<void> {
  const count = await dailyQuestRepository.count();
  if (count > 0) return;

  const defaultQuests = [
    { name: '每日签到', description: '每天签到获取奖励', type: QuestType.CHECK_IN, target_value: 1, xp_reward: 10 },
    { name: '练习对话', description: '完成3次对话练习', type: QuestType.PRACTICE, target_value: 3, xp_reward: 30 },
    { name: '学习课程', description: '完成1个课程学习', type: QuestType.LESSON, target_value: 1, xp_reward: 25 },
    { name: '学习时长', description: '学习时长达到30分钟', type: QuestType.TIME, target_value: 30, xp_reward: 40 }
  ];

  for (const data of defaultQuests) {
    const quest = new DailyQuest();
    Object.assign(quest, data);
    await dailyQuestRepository.save(quest);
  }
}