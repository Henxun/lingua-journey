import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useAuth } from '../../contexts/AuthContext';
import { authAPI } from '../../lib/api';

interface Stats {
  total_time_minutes: number;
  practice_count: number;
  accuracy_rate: number;
  streak_days: number;
  last_practice_date: string;
}

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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-white">Learning Statistics</h1>
              <Link
                href="/profile"
                className="text-white/80 hover:text-white"
              >
                ← Back
              </Link>
            </div>
          </div>

          <div className="px-8 py-6">
            {error && (
              <div className="p-4 rounded-lg mb-6 bg-red-50 text-red-700">
                {error}
              </div>
            )}

            {stats ? (
              <div className="grid grid-cols-2 gap-4">
                {/* Total Time */}
                <div className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
                  <div className="text-sm font-medium text-blue-600 mb-2">Total Learning Time</div>
                  <div className="text-3xl font-bold text-blue-900">
                    {formatTime(stats.total_time_minutes)}
                  </div>
                </div>

                {/* Practice Count */}
                <div className="p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl">
                  <div className="text-sm font-medium text-green-600 mb-2">Practice Count</div>
                  <div className="text-3xl font-bold text-green-900">
                    {stats.practice_count}
                  </div>
                </div>

                {/* Accuracy Rate */}
                <div className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl">
                  <div className="text-sm font-medium text-purple-600 mb-2">Accuracy Rate</div>
                  <div className="text-3xl font-bold text-purple-900">
                    {stats.accuracy_rate}%
                  </div>
                </div>

                {/* Streak Days */}
                <div className="p-6 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl">
                  <div className="text-sm font-medium text-orange-600 mb-2">Streak Days</div>
                  <div className="text-3xl font-bold text-orange-900">
                    {stats.streak_days}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No statistics data yet. Start practicing to see your progress!
              </div>
            )}

            {stats && stats.last_practice_date && (
              <div className="mt-6 text-center text-sm text-gray-500">
                Last practice: {new Date(stats.last_practice_date).toLocaleDateString()}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}