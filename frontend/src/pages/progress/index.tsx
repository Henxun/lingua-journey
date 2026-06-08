import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { progressAPI, LearningInsights, UserSkillProfile } from '../../lib/api';
import { assessmentAPI } from '../../lib/api';

export default function ProgressPage() {
  const router = useRouter();
  const [insights, setInsights] = useState<LearningInsights | null>(null);
  const [skills, setSkills] = useState<UserSkillProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [insightsData, skillsData] = await Promise.all([
        progressAPI.getInsights(),
        assessmentAPI.getSkills(),
      ]);
      setInsights(insightsData);
      setSkills(skillsData);
    } catch (error) {
      console.error('Failed to load progress data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving':
        return '📈';
      case 'declining':
        return '📉';
      default:
        return '➡️';
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'improving':
        return 'text-green-600 bg-green-50';
      case 'declining':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-12 px-4 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">⏳</div>
          <p className="text-xl text-gray-600">Loading your progress...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">📊 Learning Progress</h1>
              <p className="text-xl text-gray-600">Track your language learning journey</p>
            </div>
            <button
              onClick={() => router.push('/')}
              className="px-6 py-3 bg-white rounded-xl shadow-lg text-gray-700 font-medium hover:bg-gray-50"
            >
              ← Back Home
            </button>
          </div>
        </motion.div>

        {insights && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl shadow-xl p-6"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-600">Average Score</span>
                <span className="text-2xl">📊</span>
              </div>
              <div className="text-4xl font-bold text-gray-900">{insights.averageScore}%</div>
              <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full"
                  style={{ width: `${insights.averageScore}%` }}
                />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl shadow-xl p-6"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-600">Assessments Completed</span>
                <span className="text-2xl">✅</span>
              </div>
              <div className="text-4xl font-bold text-gray-900">{insights.totalAssessments}</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-2xl shadow-xl p-6"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-600">Best Skill</span>
                <span className="text-2xl">🏆</span>
              </div>
              <div className="text-2xl font-bold text-gray-900 capitalize">{insights.bestSkill}</div>
              <div className="text-sm text-gray-500 mt-1">
                Needs improvement: <span className="capitalize">{insights.needsImprovement}</span>
              </div>
            </motion.div>
          </div>
        )}

        {skills.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-2xl shadow-xl p-6 mb-8"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">📈 Skill Breakdown</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {skills.map((skill) => (
                <div key={skill.id} className="p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <span className="text-2xl mr-3">
                        {skill.skill === 'listening' && '👂'}
                        {skill.skill === 'reading' && '📖'}
                        {skill.skill === 'speaking' && '🗣'}
                        {skill.skill === 'writing' && '✍️'}
                      </span>
                      <span className="text-lg font-semibold text-gray-900 capitalize">{skill.skill}</span>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getTrendColor(skill.trend)}`}>
                      {getTrendIcon(skill.trend)} {skill.trend}
                    </span>
                  </div>
                  <div className="mb-2">
                    <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                      <span>Level: <span className="font-semibold">{skill.level}</span></span>
                      <span className="font-semibold">{skill.score}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className={`h-3 rounded-full ${
                          skill.score >= 80
                            ? 'bg-gradient-to-r from-green-400 to-green-600'
                            : skill.score >= 60
                            ? 'bg-gradient-to-r from-blue-400 to-blue-600'
                            : 'bg-gradient-to-r from-orange-400 to-orange-600'
                        }`}
                        style={{ width: `${skill.score}%` }}
                      />
                    </div>
                  </div>
                  {skill.lastAssessed && (
                    <div className="text-xs text-gray-500 mt-2">
                      Last assessed: {new Date(skill.lastAssessed).toLocaleDateString()}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {insights && insights.weeklyProgress && insights.weeklyProgress.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-2xl shadow-xl p-6 mb-8"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">📅 Weekly Progress</h2>
            <div className="flex items-end justify-between h-64 space-x-2">
              {insights.weeklyProgress.map((day, index) => (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div className="w-full bg-gray-100 rounded-t-lg relative" style={{ height: `${day.score}%` }}>
                    <div className="absolute inset-0 bg-gradient-to-t from-blue-500 to-indigo-600 rounded-t-lg" />
                  </div>
                  <div className="text-xs text-gray-600 mt-2">{day.date.slice(5)}</div>
                  <div className="text-sm font-semibold text-gray-900">{day.score}%</div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {insights && insights.recommendations && insights.recommendations.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl shadow-xl p-6"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-4">💡 Personalized Recommendations</h2>
            <ul className="space-y-3">
              {insights.recommendations.map((rec, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-blue-500 mr-3 mt-1">•</span>
                  <span className="text-gray-700">{rec}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mt-8 flex gap-4"
        >
          <button
            onClick={() => router.push('/assessment')}
            className="flex-1 px-6 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-medium hover:shadow-lg transition-all"
          >
            Take Assessment
          </button>
          <button
            onClick={() => router.push('/ai-teacher')}
            className="flex-1 px-6 py-4 bg-white text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-all shadow-lg"
          >
            Chat with AI Teacher
          </button>
        </motion.div>
      </div>
    </div>
  );
}
