import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { vocabularyAPI, VocabularyCard } from '../../lib/api';
import { motion, AnimatePresence } from 'framer-motion';

const reviewQualities = [
  { value: 0, label: 'Again', color: 'from-red-500 to-rose-600', description: 'I forgot it' },
  { value: 1, label: 'Hard', color: 'from-orange-500 to-amber-600', description: 'It was difficult' },
  { value: 2, label: 'Good', color: 'from-green-500 to-emerald-600', description: 'I remembered' },
  { value: 3, label: 'Easy', color: 'from-blue-500 to-indigo-600', description: 'Too easy' },
];

const cardVariants = {
  front: { rotateY: 0 },
  back: { rotateY: 180 },
};

export default function VocabularyReview() {
  const router = useRouter();
  const [cards, setCards] = useState<VocabularyCard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [loading, setLoading] = useState(true);
  const [reviewing, setReviewing] = useState(true);
  const [correctCount, setCorrectCount] = useState(0);

  useEffect(() => {
    fetchDueCards();
  }, []);

  const fetchDueCards = async () => {
    try {
      setLoading(true);
      const data = await vocabularyAPI.getDueCards();
      if (data.length === 0) {
        setReviewing(false);
      }
      setCards(data);
    } catch (error) {
      console.error('Failed to load due cards:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (quality: number) => {
    if (currentIndex >= cards.length) return;

    const card = cards[currentIndex];
    try {
      await vocabularyAPI.reviewCard(card.id, quality);
      if (quality >= 2) {
        setCorrectCount(prev => prev + 1);
      }

      if (currentIndex === cards.length - 1) {
        setReviewing(false);
      } else {
        setCurrentIndex(prev => prev + 1);
        setIsFlipped(false);
      }
    } catch (error) {
      console.error('Failed to review card:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full"
        />
      </div>
    );
  }

  if (!reviewing || cards.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50 flex items-center justify-center py-16 px-4">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="max-w-2xl w-full text-center"
        >
          <div className="text-9xl mb-8">🎉</div>
          <h1 className="text-5xl font-black text-gray-900 mb-6">Review Complete!</h1>
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-10 border border-white/50 mb-8">
            <div className="grid grid-cols-2 gap-8">
              <div>
                <div className="text-6xl font-black text-indigo-600 mb-3">{cards.length}</div>
                <div className="text-xl text-gray-600">Cards Reviewed</div>
              </div>
              <div>
                <div className="text-6xl font-black text-green-600 mb-3">{correctCount}</div>
                <div className="text-xl text-gray-600">Correct Answers</div>
              </div>
            </div>
            {cards.length > 0 && (
              <div className="mt-8 pt-8 border-t border-gray-200">
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  {Math.round((correctCount / cards.length) * 100)}% Success Rate
                </div>
                <div className="text-lg text-gray-600">Excellent work!</div>
              </div>
            )}
          </div>
          <div className="flex gap-4 justify-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push('/vocabulary')}
              className="px-8 py-4 bg-gray-100 text-gray-700 rounded-2xl font-bold text-lg hover:bg-gray-200 transition-all shadow-lg"
            >
              ← Back to Cards
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                fetchDueCards();
                setCurrentIndex(0);
                setCorrectCount(0);
                setIsFlipped(false);
              }}
              className="px-8 py-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-2xl font-bold text-lg hover:from-indigo-600 hover:to-purple-700 transition-all shadow-lg"
            >
              Review Again
            </motion.button>
          </div>
        </motion.div>
      </div>
    );
  }

  const currentCard = cards[currentIndex];
  const progress = ((currentIndex + 1) / cards.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-black text-gray-900">🎯 Review Session</h1>
              <p className="text-lg text-gray-600">Card {currentIndex + 1} of {cards.length}</p>
            </div>
            <button
              onClick={() => router.push('/vocabulary')}
              className="px-6 py-3 bg-white/80 backdrop-blur-sm rounded-2xl font-semibold text-gray-700 shadow-lg border border-gray-200 hover:bg-white transition-all"
            >
              ← Exit
            </button>
          </div>
          <div className="w-full h-4 bg-white/50 rounded-full overflow-hidden shadow-inner">
            <motion.div 
              className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="perspective-1000"
        >
          <div className="relative w-full h-[500px] cursor-pointer">
            <motion.div
              className="w-full h-full preserve-3d relative"
              animate={isFlipped ? 'back' : 'front'}
              variants={cardVariants}
              transition={{ duration: 0.6, type: 'spring', stiffness: 260, damping: 20 }}
              onClick={() => setIsFlipped(!isFlipped)}
            >
              <div className="absolute w-full h-full backface-hidden bg-white rounded-3xl shadow-2xl p-12 flex flex-col justify-center items-center border border-gray-100">
                <div className="text-sm font-semibold text-indigo-600 mb-6 uppercase tracking-wider">Front</div>
                <div className="text-4xl font-black text-gray-900 text-center mb-6">{currentCard.front}</div>
                {currentCard.example && !isFlipped && (
                  <div className="text-lg text-gray-500 italic text-center max-w-lg">
                    "{currentCard.example}"
                  </div>
                )}
                <div className="mt-8 text-gray-400 text-sm">Click to flip</div>
              </div>
              <div className="absolute w-full h-full backface-hidden bg-gradient-to-br from-indigo-50 to-purple-50 rounded-3xl shadow-2xl p-12 flex flex-col justify-center items-center border border-indigo-100 rotate-y-180">
                <div className="text-sm font-semibold text-purple-600 mb-6 uppercase tracking-wider">Back</div>
                <div className="text-3xl font-bold text-gray-900 text-center mb-8">{currentCard.back}</div>
                {currentCard.example && (
                  <div className="text-lg text-gray-500 italic text-center max-w-lg">
                    "{currentCard.example}"
                  </div>
                )}
                <div className="mt-8 text-gray-400 text-sm">Click to flip back</div>
              </div>
            </motion.div>
          </div>
        </motion.div>

        <AnimatePresence>
          {isFlipped && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mt-12"
            >
              <h3 className="text-xl font-bold text-gray-900 text-center mb-6">How well did you remember?</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {reviewQualities.map((quality) => (
                  <motion.button
                    key={quality.value}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleReview(quality.value)}
                    className={`p-6 rounded-2xl font-bold text-white shadow-lg bg-gradient-to-r ${quality.color} hover:shadow-xl transition-all`}
                  >
                    <div className="text-2xl mb-2">{quality.label}</div>
                    <div className="text-sm opacity-90">{quality.description}</div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-12 bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/50">
          <div className="grid grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-3xl font-black text-indigo-600">{currentCard.repetitions}</div>
              <div className="text-sm text-gray-600">Repetitions</div>
            </div>
            <div>
              <div className="text-3xl font-black text-green-600">{currentCard.interval}d</div>
              <div className="text-sm text-gray-600">Next Review</div>
            </div>
            <div>
              <div className="text-3xl font-black text-purple-600">{currentCard.ease_factor.toFixed(2)}</div>
              <div className="text-sm text-gray-600">Ease Factor</div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .perspective-1000 {
          perspective: 1000px;
        }
        .preserve-3d {
          transform-style: preserve-3d;
        }
        .backface-hidden {
          backface-visibility: hidden;
        }
        .rotate-y-180 {
          transform: rotateY(180deg);
        }
      `}</style>
    </div>
  );
}
