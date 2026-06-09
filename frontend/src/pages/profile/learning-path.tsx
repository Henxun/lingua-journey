'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { motion } from 'framer-motion';
import { Navbar } from '../../components/Navbar';
import { learningAPI, LearningGoal, LearningPath, CourseRecommendation } from '../../lib/api';

function GoalCard({ goal, onEdit, onDelete }: { goal: LearningGoal; onEdit: () => void; onDelete: () => void }) {
  const goalTypeLabels = {
    short_term: '短期目标',
    medium_term: '中期目标',
    long_term: '长期目标'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
              goal.goal_type === 'short_term' ? 'bg-green-100 text-green-700' :
              goal.goal_type === 'medium_term' ? 'bg-blue-100 text-blue-700' :
              'bg-purple-100 text-purple-700'
            }`}>
              {goalTypeLabels[goal.goal_type]}
            </span>
            {goal.status === 'completed' && (
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
                已完成
              </span>
            )}
          </div>
          <h3 className="text-lg font-bold text-gray-800">{goal.title}</h3>
          {goal.description && (
            <p className="text-gray-600 mt-1">{goal.description}</p>
          )}
          {goal.target_date && (
            <p className="text-sm text-gray-500 mt-2">
              目标日期: {new Date(goal.target_date).toLocaleDateString('zh-CN')}
            </p>
          )}
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-gray-600">进度</span>
              <span className="font-medium">{goal.progress}%</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${goal.progress}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>
        </div>
        <div className="flex gap-2 ml-4">
          <button
            onClick={onEdit}
            className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          >
            ✏️
          </button>
          <button
            onClick={onDelete}
            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            🗑️
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function LearningPathVisual({ path }: { path: LearningPath }) {
  if (!path.courses || path.courses.length === 0) {
    return (
      <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 text-center">
        <p className="text-gray-500">暂无学习路径，请先生成学习路径</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-gray-800">学习路径</h3>
        <span className="text-sm text-gray-500">
          {path.completed_count}/{path.total_count} 已完成
        </span>
      </div>

      <div className="mb-4">
        <div className="flex items-center justify-between text-sm mb-1">
          <span className="text-gray-600">总体进度</span>
          <span className="font-medium">{path.progress_percentage}%</span>
        </div>
        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${path.progress_percentage}%` }}
            transition={{ duration: 0.8 }}
          />
        </div>
      </div>

      <div className="space-y-3 mt-6">
        {path.courses.map((course: any, index: number) => (
          <motion.div
            key={course.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`flex items-center gap-4 p-4 rounded-xl border-2 ${
              course.completed
                ? 'bg-green-50 border-green-200'
                : index === path.current_position
                ? 'bg-blue-50 border-blue-300'
                : 'bg-gray-50 border-gray-200'
            }`}
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
              course.completed
                ? 'bg-green-500 text-white'
                : index === path.current_position
                ? 'bg-blue-500 text-white'
                : 'bg-gray-300 text-gray-600'
            }`}>
              {course.completed ? '✓' : index + 1}
            </div>
            <div className="flex-1">
              <h4 className={`font-medium ${course.completed ? 'text-green-700' : 'text-gray-800'}`}>
                {course.name}
              </h4>
              <p className="text-sm text-gray-500">{course.language} · {course.difficulty}</p>
            </div>
            {index === path.current_position && !course.completed && (
              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                进行中
              </span>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function RecommendationsList({ recommendations }: { recommendations: CourseRecommendation[] }) {
  if (recommendations.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <h3 className="text-lg font-bold text-gray-800 mb-4">为你推荐</h3>
      <div className="grid gap-4">
        {recommendations.slice(0, 5).map((rec, index) => (
          <motion.div
            key={rec.course.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center gap-4 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl"
          >
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center text-white font-bold text-lg">
              {index + 1}
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-gray-800">{rec.course.name}</h4>
              <p className="text-sm text-gray-500">{rec.reason}</p>
            </div>
            <button
              onClick={() => window.location.href = `/courses/${rec.course.id}`}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
            >
              开始学习
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export default function LearningPathPage() {
  const router = useRouter();
  const [goals, setGoals] = useState<LearningGoal[]>([]);
  const [path, setPath] = useState<LearningPath | null>(null);
  const [recommendations, setRecommendations] = useState<CourseRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateGoal, setShowCreateGoal] = useState(false);
  const [newGoal, setNewGoal] = useState({ title: '', description: '', goal_type: 'short_term', target_date: '' });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [goalsData, pathData, recsData] = await Promise.all([
        learningAPI.getGoals(),
        learningAPI.getLearningPath(),
        learningAPI.getRecommendations(10)
      ]);
      setGoals(goalsData);
      setPath(pathData);
      setRecommendations(recsData);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateGoal() {
    try {
      await learningAPI.createGoal(newGoal);
      setShowCreateGoal(false);
      setNewGoal({ title: '', description: '', goal_type: 'short_term', target_date: '' });
      await loadData();
    } catch (error) {
      console.error('Failed to create goal:', error);
    }
  }

  async function handleGeneratePath() {
    try {
      await learningAPI.generatePath();
      await loadData();
    } catch (error) {
      console.error('Failed to generate path:', error);
    }
  }

  async function handleDeleteGoal(id: string) {
    if (!confirm('确定要删除这个目标吗？')) return;
    try {
      await learningAPI.deleteGoal(id);
      await loadData();
    } catch (error) {
      console.error('Failed to delete goal:', error);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-600">加载中...</div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Learning Path - Lingua Journey</title>
      </Head>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-3xl font-bold text-gray-800">学习路径</h1>
            <p className="text-gray-600 mt-2">设定目标，规划学习路径</p>
          </motion.div>

        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800">学习目标</h2>
              <button
                onClick={() => setShowCreateGoal(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                + 创建目标
              </button>
            </div>

            {showCreateGoal && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mb-6 p-4 bg-gray-50 rounded-xl"
              >
                <input
                  type="text"
                  placeholder="目标名称"
                  value={newGoal.title}
                  onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg mb-3 focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                />
                <textarea
                  placeholder="目标描述（可选）"
                  value={newGoal.description}
                  onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg mb-3 focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                />
                <div className="flex gap-3 mb-3">
                  <select
                    value={newGoal.goal_type}
                    onChange={(e) => setNewGoal({ ...newGoal, goal_type: e.target.value })}
                    className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                  >
                    <option value="short_term">短期目标</option>
                    <option value="medium_term">中期目标</option>
                    <option value="long_term">长期目标</option>
                  </select>
                  <input
                    type="date"
                    value={newGoal.target_date}
                    onChange={(e) => setNewGoal({ ...newGoal, target_date: e.target.value })}
                    className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleCreateGoal}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                  >
                    创建
                  </button>
                  <button
                    onClick={() => setShowCreateGoal(false)}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-300 transition-colors"
                  >
                    取消
                  </button>
                </div>
              </motion.div>
            )}

            {goals.length === 0 ? (
              <p className="text-gray-500 text-center py-4">暂无学习目标，请创建第一个目标</p>
            ) : (
              <div className="space-y-4">
                {goals.map((goal) => (
                  <GoalCard
                    key={goal.id}
                    goal={goal}
                    onEdit={() => {}}
                    onDelete={() => handleDeleteGoal(goal.id)}
                  />
                ))}
              </div>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800">我的学习路径</h2>
              <button
                onClick={handleGeneratePath}
                className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
              >
                🔄 生成新路径
              </button>
            </div>
            <LearningPathVisual path={path || { id: '', user_id: '', goal_id: null, course_order: [], current_position: 0, status: 'active' }} />
          </motion.div>

          <RecommendationsList recommendations={recommendations} />
        </div>
        </div>
      </div>
    </>
  );
}
