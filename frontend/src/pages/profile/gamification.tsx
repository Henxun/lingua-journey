'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { motion } from 'framer-motion';
import { Navbar } from '../../components/Navbar';
import { gamificationAPI, GamificationProfile, Achievement, DailyQuest, LeaderboardEntry, CheckInResult } from '../../lib/api';

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

function AchievementsList({ achievements, loading }: { achievements: Achievement[]; loading: boolean }) {
  if (loading) {
    return <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">加载中...</div>;
  }

  const unlocked = achievements.filter(a => a.unlocked);
  const locked = achievements.filter(a => !a.unlocked);

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <h3 className="text-lg font-semibold mb-4">成就 ({unlocked.length}/{achievements.length})</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {unlocked.map((achievement) => (
          <motion.div
            key={achievement.id}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl p-4 text-white text-center"
          >
            <span className="text-3xl">{achievement.icon}</span>
            <p className="font-bold mt-2">{achievement.name}</p>
            <p className="text-xs opacity-80">{achievement.description}</p>
          </motion.div>
        ))}
        {locked.map((achievement) => (
          <div
            key={achievement.id}
            className="bg-gray-100 rounded-xl p-4 text-center opacity-50"
          >
            <span className="text-3xl">🔒</span>
            <p className="font-bold mt-2 text-gray-500">{achievement.name}</p>
            <p className="text-xs text-gray-400">{achievement.description}</p>
          </div>
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
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [quests, setQuests] = useState<DailyQuest[]>([]);
  const [weeklyLeaderboard, setWeeklyLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [monthlyLeaderboard, setMonthlyLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkInResult, setCheckInResult] = useState<CheckInResult | null>(null);

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
      setAchievements(achievementsData);
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
      <div className="max-w-6xl mx-auto px-4 py-8">
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

          <AchievementsList achievements={achievements} loading={loading} />

          <div className="grid md:grid-cols-2 gap-6">
            <LeaderboardTable entries={weeklyLeaderboard} type="weekly" />
            <LeaderboardTable entries={monthlyLeaderboard} type="monthly" />
          </div>
        </div>
      </div>
    </div>
  );
}
