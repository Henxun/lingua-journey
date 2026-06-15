'use client';

import { useState, useEffect } from 'react';
import Head from 'next/head';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  AreaChart, Area, Legend
} from 'recharts';
import { Navbar } from '../../components/Navbar';

interface LearningHabits {
  dailyDistribution: { hour: number; sessions: number; avgDuration: number; avgAccuracy: number }[];
  weeklyDistribution: { day: string; totalMinutes: number; sessions: number }[];
  bestLearningTime: { hour: number; efficiencyScore: number };
  learningFrequency: { avgDaysPerWeek: number; avgSessionsPerDay: number; consistencyScore: number };
  efficiencyCurve: { durationRange: string; avgAccuracy: number; count: number }[];
}

interface ProgressPrediction {
  goals: { id: string; name: string; currentProgress: number; predictedCompletion: string; daysRemaining: number; riskLevel: string }[];
  overallPrediction: { nextLevelDate: string; fluencyEstimate: string; confidence: number };
  recommendations: string[];
}

interface ComprehensiveReport {
  summary: { totalLearningTime: number; totalSessions: number; averageAccuracy: number; currentStreak: number };
  skills: Record<string, { current: number; trend: string; prediction: number }>;
  habits: LearningHabits;
  predictions: ProgressPrediction;
  recommendations: string[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];
const SKILL_COLORS = {
  listening: '#0088FE',
  reading: '#00C49F',
  speaking: '#FFBB28',
  writing: '#FF8042'
};

const RISK_COLORS = {
  low: '#00C49F',
  medium: '#FFBB28',
  high: '#FF8042'
};

export default function AnalyticsPage() {
  const [report, setReport] = useState<ComprehensiveReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadReport();
  }, []);

  const loadReport = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/api/analytics/comprehensive', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('Failed to load analytics');
      const data = await response.json();
      setReport(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (minutes: number): string => {
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  const formatHour = (hour: number): string => {
    if (hour === 0) return '12 AM';
    if (hour < 12) return `${hour} AM`;
    if (hour === 12) return '12 PM';
    return `${hour - 12} PM`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <Navbar />
        <div className="flex items-center justify-center pt-32">
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity }} className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <Navbar />
        <div className="flex items-center justify-center pt-32">
          <div className="text-center">
            <div className="text-6xl mb-4">❌</div>
            <p className="text-xl text-red-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <Navbar />
        <div className="flex items-center justify-center pt-32">
          <div className="text-center">
            <div className="text-6xl mb-4">📊</div>
            <p className="text-xl text-gray-600">No data available yet. Start learning to see your analytics!</p>
          </div>
        </div>
      </div>
    );
  }

  // Prepare skills data for radar chart
  const skillsRadarData = Object.entries(report.skills).map(([skill, data]) => ({
    skill: skill.charAt(0).toUpperCase() + skill.slice(1),
    current: data.current,
    prediction: data.prediction,
    fullMark: 100
  }));

  // Prepare weekly distribution data
  const weeklyData = report.habits.weeklyDistribution.map(d => ({
    ...d,
    label: d.day.slice(0, 3)
  }));

  // Prepare efficiency curve data
  const efficiencyData = report.habits.efficiencyCurve.filter(d => d.count > 0);

  // Prepare daily distribution heatmap data
  const dailyHeatmapData = report.habits.dailyDistribution.map(d => ({
    hour: formatHour(d.hour),
    sessions: d.sessions,
    efficiency: d.avgAccuracy
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Head>
        <title>📊 Learning Analytics - Lingua Journey</title>
      </Head>
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">📊 Learning Analytics</h1>
          <p className="text-xl text-gray-600">Deep insights into your learning habits and progress</p>
        </motion.div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white rounded-2xl shadow-xl p-6">
            <div className="text-4xl mb-2">⏱️</div>
            <div className="text-sm text-gray-600">Total Learning Time</div>
            <div className="text-3xl font-bold text-blue-600">{formatTime(report.summary.totalLearningTime)}</div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white rounded-2xl shadow-xl p-6">
            <div className="text-4xl mb-2">🎯</div>
            <div className="text-sm text-gray-600">Total Sessions</div>
            <div className="text-3xl font-bold text-green-600">{report.summary.totalSessions}</div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white rounded-2xl shadow-xl p-6">
            <div className="text-4xl mb-2">📈</div>
            <div className="text-sm text-gray-600">Average Accuracy</div>
            <div className="text-3xl font-bold text-purple-600">{report.summary.averageAccuracy}%</div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-white rounded-2xl shadow-xl p-6">
            <div className="text-4xl mb-2">🔥</div>
            <div className="text-sm text-gray-600">Current Streak</div>
            <div className="text-3xl font-bold text-orange-600">{report.summary.currentStreak} days</div>
          </motion.div>
        </div>

        {/* Skills Radar Chart */}
        {skillsRadarData.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="bg-white rounded-2xl shadow-xl p-6 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">🎯 Skills Overview</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="80%" data={skillsRadarData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="skill" />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} />
                    <Radar name="Current" dataKey="current" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                    <Radar name="Predicted" dataKey="prediction" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.3} />
                    <Legend />
                    <Tooltip />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-4">
                {Object.entries(report.skills).map(([skill, data]) => (
                  <div key={skill} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">
                        {skill === 'listening' && '👂'}
                        {skill === 'reading' && '📖'}
                        {skill === 'speaking' && '🗣️'}
                        {skill === 'writing' && '✍️'}
                      </span>
                      <span className="font-semibold capitalize">{skill}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-gray-500">Trend:</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${data.trend === 'improving' ? 'bg-green-100 text-green-700' : data.trend === 'declining' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'}`}>
                        {data.trend === 'improving' ? '📈' : data.trend === 'declining' ? '📉' : '➡️'} {data.trend}
                      </span>
                      <span className="font-bold">{data.current}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Weekly Distribution */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="bg-white rounded-2xl shadow-xl p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">📅 Weekly Learning Distribution</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" />
                <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                <Tooltip />
                <Legend />
                <Bar yAxisId="left" dataKey="totalMinutes" name="Minutes" fill="#8884d8" radius={[4, 4, 0, 0]} />
                <Bar yAxisId="right" dataKey="sessions" name="Sessions" fill="#82ca9d" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Learning Habits */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Daily Distribution Heatmap */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }} className="bg-white rounded-2xl shadow-xl p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">⏰ Best Learning Time</h2>
            <div className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
              <div className="text-lg font-semibold text-blue-800">
                Your peak efficiency is at {formatHour(report.habits.bestLearningTime.hour)}
              </div>
              <div className="text-sm text-blue-600">
                Efficiency Score: {report.habits.bestLearningTime.efficiencyScore}%
              </div>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dailyHeatmapData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="sessions" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Efficiency Curve */}
          {efficiencyData.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }} className="bg-white rounded-2xl shadow-xl p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">📊 Efficiency by Duration</h2>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={efficiencyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="durationRange" label={{ value: 'Duration (min)', position: 'bottom', offset: -5 }} />
                    <YAxis label={{ value: 'Accuracy (%)', angle: -90, position: 'insideLeft' }} />
                    <Tooltip />
                    <Line type="monotone" dataKey="avgAccuracy" stroke="#82ca9d" strokeWidth={2} dot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          )}
        </div>

        {/* Learning Frequency */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 }} className="bg-white rounded-2xl shadow-xl p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">🔄 Learning Frequency</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl">
              <div className="text-4xl mb-2">📅</div>
              <div className="text-3xl font-bold text-blue-600">{report.habits.learningFrequency.avgDaysPerWeek}</div>
              <div className="text-sm text-gray-600">Days per week</div>
            </div>
            <div className="text-center p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl">
              <div className="text-4xl mb-2">🎯</div>
              <div className="text-3xl font-bold text-green-600">{report.habits.learningFrequency.avgSessionsPerDay}</div>
              <div className="text-sm text-gray-600">Sessions per day</div>
            </div>
            <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl">
              <div className="text-4xl mb-2">⭐</div>
              <div className="text-3xl font-bold text-purple-600">{report.habits.learningFrequency.consistencyScore}%</div>
              <div className="text-sm text-gray-600">Consistency Score</div>
            </div>
          </div>
        </motion.div>

        {/* Progress Prediction */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1 }} className="bg-white rounded-2xl shadow-xl p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">🔮 Progress Prediction</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <div className="mb-6 p-6 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl">
                <div className="text-lg font-semibold text-indigo-800 mb-2">
                  🎯 Fluency Estimate
                </div>
                <div className="text-2xl font-bold text-purple-600">
                  {report.predictions.overallPrediction.fluencyEstimate}
                </div>
                <div className="text-sm text-indigo-600 mt-2">
                  Confidence: {Math.round(report.predictions.overallPrediction.confidence * 100)}%
                </div>
              </div>
              <div className="space-y-4">
                {report.predictions.goals.map((goal) => (
                  <div key={goal.id} className="p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold">{goal.name}</span>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${RISK_COLORS[goal.riskLevel as keyof typeof RISK_COLORS]} bg-opacity-20`} style={{ backgroundColor: `${RISK_COLORS[goal.riskLevel as keyof typeof RISK_COLORS]}20`, color: RISK_COLORS[goal.riskLevel as keyof typeof RISK_COLORS] }}>
                        {goal.riskLevel.toUpperCase()} RISK
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                      <div className="h-3 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600" style={{ width: `${goal.currentProgress}%` }} />
                    </div>
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Progress: {goal.currentProgress}%</span>
                      <span>ETA: {goal.predictedCompletion}</span>
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      ~{goal.daysRemaining} days remaining
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-gray-800">💡 Recommendations</h3>
              {report.predictions.recommendations.map((rec, i) => (
                <div key={i} className="flex items-start gap-3 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl">
                  <span className="text-green-500 text-xl">•</span>
                  <span className="text-gray-700">{rec}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Overall Recommendations */}
        {report.recommendations.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.1 }} className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl shadow-xl p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">🌟 Personalized Recommendations</h2>
            <ul className="space-y-3">
              {report.recommendations.map((rec, index) => (
                <li key={index} className="flex items-start gap-3">
                  <span className="text-blue-500 text-xl">✨</span>
                  <span className="text-gray-700">{rec}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </div>
    </div>
  );
}