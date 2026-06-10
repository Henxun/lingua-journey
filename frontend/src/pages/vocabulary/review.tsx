import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/router';
import { Navbar } from '../../components/Navbar';

interface VocabularyCard {
  id: string;
  front: string;
  back: string;
  example?: string;
  mastery_level: string;
  ease_factor: number;
  interval: number;
  repetitions: number;
}

type ReviewQuality = 'again' | 'hard' | 'good' | 'easy';

const qualityLabels: Record<ReviewQuality, string> = {
  again: '重来',
  hard: '困难',
  good: '良好',
  easy: '简单'
};

const qualityColors: Record<ReviewQuality, string> = {
  again: 'bg-red-500 hover:bg-red-600',
  hard: 'bg-orange-500 hover:bg-orange-600',
  good: 'bg-blue-500 hover:bg-blue-600',
  easy: 'bg-green-500 hover:bg-green-600'
};

export default function VocabularyReviewPage() {
  const router = useRouter();
  const [cards, setCards] = useState<VocabularyCard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [loading, setLoading] = useState(true);
  const [reviewedCount, setReviewedCount] = useState(0);
  const [sessionStats, setSessionStats] = useState({
    again: 0,
    hard: 0,
    good: 0,
    easy: 0
  });

  const currentCard = cards[currentIndex];
  const progress = cards.length > 0 ? ((reviewedCount / cards.length) * 100) : 0;

  useEffect(() => {
    fetchDueCards();
  }, []);

  const fetchDueCards = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch('/api/vocabulary/review/due', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setCards(data.cards || []);
      }
    } catch (error) {
      console.error('Failed to fetch due cards:', error);
    } finally {
      setLoading(false);
    }
  };

  const submitReview = async (quality: ReviewQuality) => {
    if (!currentCard) return;

    try {
      const token = localStorage.getItem('token');
      const qualityMap: Record<ReviewQuality, number> = {
        again: 0,
        hard: 1,
        good: 2,
        easy: 3
      };

      const response = await fetch(`/api/vocabulary/cards/${currentCard.id}/review`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ quality: qualityMap[quality] })
      });

      if (response.ok) {
        setSessionStats(prev => ({ ...prev, [quality]: prev[quality] + 1 }));
        setReviewedCount(prev => prev + 1);
        
        // Move to next card
        if (currentIndex < cards.length - 1) {
          setCurrentIndex(prev => prev + 1);
          setIsFlipped(false);
        } else {
          // Session complete
          router.push('/vocabulary');
        }
      }
    } catch (error) {
      console.error('Failed to submit review:', error);
    }
  };

  const skipCard = () => {
    if (currentIndex < cards.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setIsFlipped(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
      </div>
    );
  }

  if (cards.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🎉</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">太棒了！</h1>
            <p className="text-gray-600 mb-6">现在没有需要复习的词汇</p>
            <button
              onClick={() => router.push('/vocabulary')}
              className="px-6 py-3 bg-blue-500 text-white rounded-lg font-medium"
            >
              返回词汇库
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Progress Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <h1 className="text-2xl font-bold text-gray-900">词汇复习</h1>
            <span className="text-gray-600">
              {reviewedCount + 1} / {cards.length}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              className="bg-blue-500 h-2 rounded-full"
            />
          </div>
        </div>

        {/* Flashcard */}
        <div className="flex justify-center mb-8">
          <motion.div
            className="relative w-full max-w-lg cursor-pointer"
            style={{ perspective: '1000px' }}
            onClick={() => setIsFlipped(!isFlipped)}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={isFlipped ? 'back' : 'front'}
                initial={{ rotateY: isFlipped ? -90 : 90, opacity: 0 }}
                animate={{ rotateY: 0, opacity: 1 }}
                exit={{ rotateY: isFlipped ? 90 : -90, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-2xl shadow-xl p-8 min-h-[300px] flex flex-col items-center justify-center"
              >
                {!isFlipped ? (
                  <>
                    <div className="text-4xl font-bold text-gray-900 text-center mb-4">
                      {currentCard.front}
                    </div>
                    <div className="text-gray-400 text-sm">点击翻转</div>
                  </>
                ) : (
                  <>
                    <div className="text-2xl font-bold text-gray-900 text-center mb-4">
                      {currentCard.back}
                    </div>
                    {currentCard.example && (
                      <div className="text-gray-600 text-center italic">
                        "{currentCard.example}"
                      </div>
                    )}
                    <div className="mt-4 text-sm text-gray-400">
                      复习间隔: {currentCard.interval} 天
                    </div>
                  </>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Flip indicator */}
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2">
              <motion.div
                animate={{ rotate: isFlipped ? 180 : 0 }}
                className="text-gray-400"
              >
                ⇅
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Quality Buttons */}
        {isFlipped && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-4 gap-3 mb-6"
          >
            {(Object.keys(qualityLabels) as ReviewQuality[]).map((quality) => (
              <motion.button
                key={quality}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => submitReview(quality)}
                className={`py-4 text-white rounded-xl font-bold ${qualityColors[quality]}`}
              >
                {qualityLabels[quality]}
              </motion.button>
            ))}
          </motion.div>
        )}

        {/* Skip Button */}
        {!isFlipped && (
          <div className="text-center">
            <button
              onClick={skipCard}
              className="text-gray-500 hover:text-gray-700"
            >
              跳过这张 →
            </button>
          </div>
        )}

        {/* Session Stats */}
        {reviewedCount > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-8 bg-white rounded-xl shadow-sm p-4"
          >
            <h3 className="font-bold text-gray-900 mb-3">本次复习统计</h3>
            <div className="grid grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-red-500">{sessionStats.again}</div>
                <div className="text-xs text-gray-500">重来</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-500">{sessionStats.hard}</div>
                <div className="text-xs text-gray-500">困难</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-500">{sessionStats.good}</div>
                <div className="text-xs text-gray-500">良好</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-500">{sessionStats.easy}</div>
                <div className="text-xs text-gray-500">简单</div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Exit Button */}
        <div className="mt-6 text-center">
          <button
            onClick={() => router.push('/vocabulary')}
            className="text-gray-500 hover:text-gray-700"
          >
            结束复习
          </button>
        </div>
      </main>
    </div>
  );
}
