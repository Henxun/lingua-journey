import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { useAuth } from '../../contexts/AuthContext';
import { authAPI } from '../../lib/api';
import { motion } from 'framer-motion';
import { Navbar } from '../../components/Navbar';

interface Stats {
  total_time_minutes: number;
  practice_count: number;
  accuracy_rate: number;
  streak_days: number;
  last_practice_date: string;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 }
  }
};

const itemVariants = {
  hidden: { y: 30, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.6 }
  }
};

const statCards = [
  {
    key: 'total_time',
    label: 'Total Learning Time',
    icon: '⏱️',
    color: 'from-blue-500 to-cyan-500',
    bg: 'from-blue-50 to-cyan-50',
    textColor: 'text-blue-700',
    valueFn: (stats: Stats, formatFn: Function) => formatFn(stats.total_time_minutes)
  },
  {
    key: 'practice_count',
    label: 'Practice Sessions',
    icon: '🎯',
    color: 'from-green-500 to-emerald-500',
    bg: 'from-green-50 to-emerald-50',
    textColor: 'text-green-700',
    valueFn: (stats: Stats) => `${stats.practice_count} times`
  },
  {
    key: 'accuracy_rate',
    label: 'Accuracy Rate',
    icon: '📊',
    color: 'from-purple-500 to-indigo-500',
    bg: 'from-purple-50 to-indigo-50',
    textColor: 'text-purple-700',
    valueFn: (stats: Stats) => `${stats.accuracy_rate}%`
  },
  {
    key: 'streak_days',
    label: 'Current Streak',
    icon: '🔥',
    color: 'from-orange-500 to-red-500',
    bg: 'from-orange-50 to-red-50',
    textColor: 'text-orange-700',
    valueFn: (stats: Stats) => `${stats.streak_days} days`
  }
];

export default function LearningStats() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    } else if (user) {
      loadStats();
    }
  }, [user, authLoading]);

  const loadStats = async () => {
    try {
      const data = await authAPI.getLearningStats();
      setStats(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load stats');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (minutes: number): string => {
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  if (loading || authLoading) {
    return (
      <>
        <Head>
          <title>Learning Stats - Lingua Journey</title>
        </Head>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
          <Navbar />
          <div className="flex items-center justify-center pt-16">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity }}
              className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full"
            />
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Learning Stats - Lingua Journey</title>
      </Head>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <Navbar />
        <div className="py-16 px-4 pt-24">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-12"
            >
              <div className="text-center">
                <div className="inline-flex items-center gap-2 px-6 py-3 bg-white/80 backdrop-blur-sm rounded-full text-sm font-bold text-blue-700 mb-6 shadow-lg border border-blue-100">
                  📈 Learning Dashboard
                </div>
                <h1 className="text-5xl font-black text-gray-900 mb-4">Learning Statistics</h1>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto">Track your progress and celebrate your achievements</p>
              </div>
            </motion.div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8 p-6 bg-red-50 border-2 border-red-200 rounded-2xl text-red-700 text-center font-medium"
              >
                ❌ {error}
              </motion.div>
            )}

            {stats ? (
              <motion.div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                {statCards.map((card) => (
                  <motion.div
                    key={card.key}
                    variants={itemVariants}
                    whileHover={{ y: -8, scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                    className={`bg-gradient-to-br ${card.bg} rounded-3xl p-8 shadow-xl border border-white/60 backdrop-blur-sm relative overflow-hidden group`}
                  >
                    {/* Decorative gradient */}
                    <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${card.color} opacity-10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500`} />
                    
                    <div className="relative">
                      <div className="text-4xl mb-4">{card.icon}</div>
                      <div className={`text-sm font-bold ${card.textColor} mb-2 uppercase tracking-wide`}>{card.label}</div>
                      <div className={`text-4xl font-black text-gray-900 bg-gradient-to-r ${card.color} bg-clip-text`}>
                        {card.valueFn(stats, formatTime)}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-24 bg-white/60 backdrop-blur-sm rounded-3xl border border-white/60 shadow-xl"
              >
                <div className="text-8xl mb-6">🚀</div>
                <h2 className="text-3xl font-black text-gray-900 mb-4">Start Your Journey!</h2>
                <p className="text-xl text-gray-600 max-w-md mx-auto">No statistics yet. Start your first practice session to begin tracking your amazing progress!</p>
              </motion.div>
            )}

            {stats && stats.last_practice_date && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="mt-12 text-center"
              >
                <div className="inline-flex items-center gap-2 px-8 py-4 bg-white/80 backdrop-blur-sm rounded-2xl text-gray-600 font-semibold shadow-lg border border-gray-100">
                  📅 Last practice: {new Date(stats.last_practice_date).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric',
                    weekday: 'long'
                  })}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}