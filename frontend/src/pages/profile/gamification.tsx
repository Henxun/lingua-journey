'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { motion, AnimatePresence } from 'framer-motion';
import { Navbar } from '../../components/Navbar';
import { gamificationAPI, GamificationProfile, Achievement, DailyQuest, LeaderboardEntry, CheckInResult, AchievementsResponse, ShareContent, AchievementRarity } from '../../lib/api';

function LevelProgressBar({ profile }: { profile: GamificationProfile }) {
  const currentLevelXp = Math.pow(profile.level, 2) * 100;
  const nextLevelXp = Math.pow(profile.level + 1, 2) * 100;
  const progress = profile.level >= 100 ? 100 : ((profile.xp - currentLevelXp) / (nextLevelXp - currentLevelXp)) * 100;

  return (
    <div className="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl p-6 text-white">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-3xl font-bold">等级 {profile.level}</h2>
          <p className="text-purple-200">{profile.title}</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold">{profile.xp} XP</p>
          <p className="text-purple-200 text-sm">总经验值</p>
        </div>
      </div>
      <div className="h-4 bg-white/20 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-white rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
      </div>
      <p className="text-sm mt-2 text-purple-200">
        {profile.level >= 100 ? '已达到最高等级' : `${nextLevelXp - profile.xp} XP 到下一级`}
      </p>
    </div>
  );
}

function CheckInButton({ lastCheckIn, onCheckIn }: { lastCheckIn: string | null; onCheckIn: () => void }) {
  const today = new Date().toISOString().split('T')[0];
  const hasCheckedIn = lastCheckIn === today;

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <h3 className="text-lg font-semibold mb-4">每日签到</h3>
      <motion.button
        whileHover={{ scale: hasCheckedIn ? 1 : 1.05 }}
        whileTap={{ scale: hasCheckedIn ? 1 : 0.95 }}
        onClick={onCheckIn}
        disabled={hasCheckedIn}
        className={`w-full py-4 rounded-xl font-bold text-lg ${
          hasCheckedIn
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
            : 'bg-gradient-to-r from-green-400 to-emerald-500 text-white shadow-lg'
        }`}
      >
        {hasCheckedIn ? '已签到 ✓' : '点击签到'}
      </motion.button>
    </div>
  );
}

function StatsCards({ profile }: { profile: GamificationProfile }) {
  const stats = [
    { label: '连续签到', value: `${profile.streak_days}天`, emoji: '🔥' },
    { label: '本周XP', value: `${profile.weekly_xp}`, emoji: '📅' },
    { label: '本月XP', value: `${profile.monthly_xp}`, emoji: '📆' },
    { label: '成就解锁', value: `${profile.achievements_unlocked}/${profile.total_achievements}`, emoji: '🏆' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center"
        >
          <span className="text-2xl">{stat.emoji}</span>
          <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
          <p className="text-gray-500 text-sm">{stat.label}</p>
        </motion.div>
      ))}
    </div>
  );
}

function DailyQuestsList({ quests, loading }: { quests: DailyQuest[]; loading: boolean }) {
  if (loading) {
    return <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">加载中...</div>;
  }

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <h3 className="text-lg font-semibold mb-4">每日任务</h3>
      <div className="space-y-4">
        {quests.map((quest) => (
          <div key={quest.id} className="flex items-center gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-medium">{quest.name}</span>
                {quest.completed && <span className="text-green-500">✓</span>}
              </div>
              <div className="h-2 bg-gray-100 rounded-full mt-2 overflow-hidden">
                <div
                  className={`h-full rounded-full ${quest.completed ? 'bg-green-500' : 'bg-blue-500'}`}
                  style={{ width: `${Math.min((quest.progress / quest.target_value) * 100, 100)}%` }}
                />
              </div>
              <p className="text-sm text-gray-500 mt-1">
                {quest.progress}/{quest.target_value} · +{quest.xp_reward} XP
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function getRarityStyles(rarity: AchievementRarity) {
  const styles: Record<AchievementRarity, { bg: string; border: string; glow: string; text: string }> = {
    common: {
      bg: 'bg-gray-100',
      border: 'border-gray-300',
      glow: '',
      text: 'text-gray-600'
    },
    rare: {
      bg: 'bg-blue-50',
      border: 'border-blue-400',
      glow: 'shadow-[0_0_15px_rgba(59,130,246,0.4)]',
      text: 'text-blue-700'
    },
    epic: {
      bg: 'bg-purple-50',
      border: 'border-purple-400',
      glow: 'shadow-[0_0_15px_rgba(147,51,234,0.4)]',
      text: 'text-purple-700'
    },
    legendary: {
      bg: 'bg-gradient-to-br from-yellow-50 to-orange-50',
      border: 'border-yellow-400',
      glow: 'shadow-[0_0_20px_rgba(234,179,8,0.5)]',
      text: 'text-amber-700'
    }
  };
  return styles[rarity];
}

function getRarityLabel(rarity: AchievementRarity) {
  const labels: Record<AchievementRarity, string> = {
    common: '普通',
    rare: '稀有',
    epic: '史诗',
    legendary: '传说'
  };
  return labels[rarity];
}

function AchievementCard({ achievement, onShare }: { achievement: Achievement; onShare: (id: string) => void }) {
  const styles = getRarityStyles(achievement.rarity);

  return (
    <motion.div
      key={achievement.id}
      initial={{ scale: achievement.unlocked ? 0.8 : 1, opacity: achievement.unlocked ? 0 : 1 }}
      animate={{ scale: 1, opacity: achievement.unlocked ? 1 : 0.6 }}
      whileHover={{ scale: 1.02 }}
      className={`relative rounded-xl p-4 border-2 transition-all duration-300 ${styles.bg} ${styles.border} ${achievement.unlocked ? styles.glow : ''}`}
    >
      <div className="flex flex-col items-center text-center">
        <div className="relative">
          <span className="text-4xl">{achievement.unlocked ? achievement.icon : '🔒'}</span>
          {achievement.unlocked && (
            <span className="absolute -top-1 -right-1 text-xs px-2 py-0.5 rounded-full bg-white/90 text-gray-700 shadow">
              {getRarityLabel(achievement.rarity)}
            </span>
          )}
        </div>
        <h4 className={`font-bold mt-2 ${achievement.unlocked ? styles.text : 'text-gray-400'}`}>
          {achievement.name}
        </h4>
        <p className={`text-xs mt-1 ${achievement.unlocked ? 'text-gray-600' : 'text-gray-400'}`}>
          {achievement.description}
        </p>
        {!achievement.unlocked && (
          <div className="w-full mt-3">
            <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-blue-500 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${achievement.progress}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {achievement.current_value}/{achievement.target_value}
            </p>
          </div>
        )}
        <div className="flex items-center gap-2 mt-3">
          <span className="text-xs text-gray-500">+{achievement.xp_reward} XP</span>
          {achievement.unlocked && (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => onShare(achievement.id)}
              className="p-1.5 rounded-full bg-white/80 shadow-sm hover:bg-white transition-colors"
              title="分享成就"
            >
              <svg className="w-4 h-4 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c-.05-.03-.1-.05-.15-.05h-.1c-.05 0-.1.02-.15.05l-6.98 4.12c-.54.32-1.2.77-1.96.77c-1.1 0-2-.9-2-2v-12c0-1.1.9-2 2-2s2 .9 2 2v7.4l6.29-3.63c.39-.23.84-.35 1.3-.35c.46 0 .91.12 1.3.35l6.29 3.63v-7.4c0-1.1.9-2 2-2s2 .9 2 2v12c0 1.1-.9 2-2 2z"/>
              </svg>
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function ShareModal({ isOpen, onClose, shareContent, achievement }: { isOpen: boolean; onClose: () => void; shareContent: ShareContent | null; achievement: Achievement | null }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (shareContent) {
      await navigator.clipboard.writeText(shareContent.message);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!isOpen || !shareContent || !achievement) return null;

  const styles = getRarityStyles(shareContent.rarity);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-xl font-bold text-gray-800">分享成就</h3>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
              <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className={`rounded-xl p-4 border-2 ${styles.bg} ${styles.border} ${styles.glow} mb-4`}>
            <div className="flex items-center gap-4">
              <span className="text-5xl">{achievement.icon}</span>
              <div>
                <p className="text-sm text-gray-500">解锁成就</p>
                <h4 className={`text-lg font-bold ${styles.text}`}>{achievement.name}</h4>
                <p className="text-sm text-gray-600">{achievement.description}</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl p-4 mb-4">
            <p className="text-gray-800 font-medium">分享文案</p>
            <p className="text-gray-600 mt-1">{shareContent.message}</p>
          </div>

          <div className="flex gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleCopy}
              className={`flex-1 py-3 rounded-xl font-medium ${copied ? 'bg-green-500 text-white' : 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white'}`}
            >
              {copied ? '已复制 ✓' : '复制文案'}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onClose}
              className="px-6 py-3 rounded-xl font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
            >
              关闭
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function AchievementsList({ achievements, loading, onShare }: { achievements: Achievement[]; loading: boolean; onShare: (id: string) => void }) {
  if (loading) {
    return <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">加载中...</div>;
  }

  const unlocked = achievements.filter(a => a.unlocked);
  const locked = achievements.filter(a => !a.unlocked);

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <h3 className="text-lg font-semibold mb-4">成就 ({unlocked.length}/{achievements.length})</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {unlocked.map((achievement) => (
          <AchievementCard key={achievement.id} achievement={achievement} onShare={onShare} />
        ))}
        {locked.map((achievement) => (
          <AchievementCard key={achievement.id} achievement={achievement} onShare={onShare} />
        ))}
      </div>
    </div>
  );
}

function LeaderboardTable({ entries, type }: { entries: LeaderboardEntry[]; type: 'weekly' | 'monthly' }) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <h3 className="text-lg font-semibold mb-4">{type === 'weekly' ? '周榜' : '月榜'}</h3>
      <div className="space-y-2">
        {entries.slice(0, 10).map((entry) => (
          <div
            key={entry.user_id}
            className={`flex items-center gap-4 p-3 rounded-lg ${
              entry.rank <= 3 ? 'bg-gradient-to-r from-yellow-50 to-orange-50' : 'bg-gray-50'
            }`}
          >
            <span className={`w-8 h-8 flex items-center justify-center rounded-full font-bold ${
              entry.rank === 1 ? 'bg-yellow-400 text-white' :
              entry.rank === 2 ? 'bg-gray-400 text-white' :
              entry.rank === 3 ? 'bg-orange-400 text-white' :
              'bg-gray-200 text-gray-600'
            }`}>
              {entry.rank <= 3 ? ['🥇', '🥈', '🥉'][entry.rank - 1] : entry.rank}
            </span>
            <div className="flex-1">
              <p className="font-medium">{entry.username}</p>
            </div>
            <p className="font-bold text-purple-600">{entry.xp} XP</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function GamificationPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<GamificationProfile | null>(null);
  const [achievementsResponse, setAchievementsResponse] = useState<AchievementsResponse | null>(null);
  const [quests, setQuests] = useState<DailyQuest[]>([]);
  const [weeklyLeaderboard, setWeeklyLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [monthlyLeaderboard, setMonthlyLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkInResult, setCheckInResult] = useState<CheckInResult | null>(null);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [shareContent, setShareContent] = useState<ShareContent | null>(null);
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [profileData, achievementsData, questsData, weeklyData, monthlyData] = await Promise.all([
        gamificationAPI.getProfile(),
        gamificationAPI.getAchievements(),
        gamificationAPI.getDailyQuests(),
        gamificationAPI.getWeeklyLeaderboard(),
        gamificationAPI.getMonthlyLeaderboard(),
      ]);
      setProfile(profileData);
      setAchievementsResponse(achievementsData);
      setQuests(questsData);
      setWeeklyLeaderboard(weeklyData);
      setMonthlyLeaderboard(monthlyData);
    } catch (error) {
      console.error('Failed to load gamification data:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleCheckIn() {
    try {
      const result = await gamificationAPI.checkIn();
      setCheckInResult(result);
      if (result.success) {
        await loadData();
      }
    } catch (error) {
      console.error('Check-in failed:', error);
    }
  }

  async function handleShare(achievementId: string) {
    try {
      const content = await gamificationAPI.getShareContent(achievementId);
      const achievement = achievementsResponse?.achievements.find(a => a.id === achievementId);
      setShareContent(content);
      setSelectedAchievement(achievement || null);
      setShareModalOpen(true);
    } catch (error) {
      console.error('Failed to get share content:', error);
    }
  }

  if (loading || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-600">加载中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Head>
        <title>Game Center - Lingua Journey</title>
      </Head>
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-800">游戏中心</h1>
          <p className="text-gray-600 mt-2">完成学习任务，获取成就，提升等级</p>
        </motion.div>

        {checkInResult && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mb-6 p-4 rounded-xl ${
              checkInResult.success
                ? 'bg-green-100 border border-green-200 text-green-800'
                : 'bg-yellow-100 border border-yellow-200 text-yellow-800'
            }`}
          >
            {checkInResult.success
              ? `签到成功！获得 ${checkInResult.xp_earned} XP，连续签到 ${checkInResult.streak_days} 天`
              : checkInResult.message}
          </motion.div>
        )}

        <div className="space-y-6">
          <LevelProgressBar profile={profile} />

          <div className="grid md:grid-cols-2 gap-6">
            <CheckInButton
              lastCheckIn={profile.last_check_in}
              onCheckIn={handleCheckIn}
            />
            <StatsCards profile={profile} />
          </div>

          <DailyQuestsList quests={quests} loading={loading} />

          <AchievementsList 
            achievements={achievementsResponse?.achievements || []} 
            loading={loading}
            onShare={handleShare}
          />

          <div className="grid md:grid-cols-2 gap-6">
            <LeaderboardTable entries={weeklyLeaderboard} type="weekly" />
            <LeaderboardTable entries={monthlyLeaderboard} type="monthly" />
          </div>
        </div>
      </div>

      <ShareModal
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        shareContent={shareContent}
        achievement={selectedAchievement}
      />
    </div>
  );
}