import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { vocabularyAPI, VocabularyCard, VocabularyDeck, MasteryStats } from '../../lib/api';
import { motion } from 'framer-motion';

const masteryColors = {
  new: { bg: 'from-red-400 to-rose-500', text: 'text-red-600', light: 'bg-red-100', label: 'New' },
  learning: { bg: 'from-orange-400 to-amber-500', text: 'text-orange-600', light: 'bg-orange-100', label: 'Learning' },
  familiar: { bg: 'from-yellow-400 to-lime-500', text: 'text-yellow-600', light: 'bg-yellow-100', label: 'Familiar' },
  known: { bg: 'from-green-400 to-emerald-500', text: 'text-green-600', light: 'bg-green-100', label: 'Known' },
  mastered: { bg: 'from-blue-400 to-indigo-500', text: 'text-blue-600', light: 'bg-blue-100', label: 'Mastered' },
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.5 }
  }
};

export default function Vocabulary() {
  const router = useRouter();
  const [cards, setCards] = useState<VocabularyCard[]>([]);
  const [decks, setDecks] = useState<VocabularyDeck[]>([]);
  const [masteryStats, setMasteryStats] = useState<MasteryStats | null>(null);
  const [dueCards, setDueCards] = useState<VocabularyCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateCard, setShowCreateCard] = useState(false);
  const [showCreateDeck, setShowCreateDeck] = useState(false);
  const [selectedDeck, setSelectedDeck] = useState<string | null>(null);
  const [newCard, setNewCard] = useState({ front: '', back: '', example: '' });
  const [newDeck, setNewDeck] = useState({ name: '', description: '' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [cardsData, decksData, statsData, dueCardsData] = await Promise.all([
        vocabularyAPI.getCards(),
        vocabularyAPI.getDecks(),
        vocabularyAPI.getMasteryStats(),
        vocabularyAPI.getDueCards(),
      ]);
      setCards(cardsData);
      setDecks(decksData);
      setMasteryStats(statsData);
      setDueCards(dueCardsData);
    } catch (error) {
      console.error('Failed to load vocabulary data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCard = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await vocabularyAPI.createCard({
        ...newCard,
        deckId: selectedDeck || undefined,
      });
      setNewCard({ front: '', back: '', example: '' });
      setShowCreateCard(false);
      fetchData();
    } catch (error) {
      console.error('Failed to create card:', error);
    }
  };

  const handleCreateDeck = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await vocabularyAPI.createDeck(newDeck);
      setNewDeck({ name: '', description: '' });
      setShowCreateDeck(false);
      fetchData();
    } catch (error) {
      console.error('Failed to create deck:', error);
    }
  };

  const handleDeleteCard = async (cardId: string) => {
    if (confirm('Are you sure you want to delete this card?')) {
      try {
        await vocabularyAPI.deleteCard(cardId);
        fetchData();
      } catch (error) {
        console.error('Failed to delete card:', error);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50 py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-white/80 backdrop-blur-sm rounded-full text-sm font-semibold text-purple-700 mb-6 shadow-lg border border-purple-100">
            📝 Vocabulary Flashcards
          </div>
          <h1 className="text-5xl font-black text-gray-900 mb-4">Vocabulary Practice</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">Master new words with spaced repetition and watch your progress grow</p>
        </motion.div>

        {dueCards.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-r from-purple-500 to-pink-600 rounded-3xl shadow-2xl p-8 mb-12 text-white cursor-pointer"
            onClick={() => router.push('/vocabulary/review')}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold mb-2">🎯 Time to Review!</div>
                <div className="text-lg opacity-90">You have {dueCards.length} {dueCards.length === 1 ? 'card' : 'cards'} ready for review</div>
              </div>
              <div className="text-right">
                <div className="text-6xl font-black">{dueCards.length}</div>
                <div className="text-sm opacity-75">Due Now</div>
              </div>
            </div>
            <div className="mt-6 bg-white/20 rounded-2xl py-4 px-6 text-center font-semibold">
              Start Review Session →
            </div>
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-1"
          >
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/50">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">📚 Decks</h2>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowCreateDeck(true)}
                  className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl shadow-lg"
                >
                  +
                </motion.button>
              </div>
              <div className="space-y-3">
                {decks.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <div className="text-4xl mb-3">📦</div>
                    <p>No decks yet</p>
                  </div>
                ) : (
                  decks.map((deck) => (
                    <motion.div
                      key={deck.id}
                      whileHover={{ scale: 1.02 }}
                      className={`p-4 rounded-2xl cursor-pointer transition-all ${
                        selectedDeck === deck.id 
                          ? 'bg-gradient-to-r from-purple-100 to-pink-100 border-2 border-purple-300' 
                          : 'bg-gray-50 border-2 border-transparent hover:border-purple-200'
                      }`}
                      onClick={() => setSelectedDeck(selectedDeck === deck.id ? null : deck.id)}
                    >
                      <div className="font-bold text-gray-900">{deck.name}</div>
                      {deck.description && (
                        <div className="text-sm text-gray-600 mt-1">{deck.description}</div>
                      )}
                      <div className="text-sm text-gray-500 mt-2">{deck.card_count} cards</div>
                    </motion.div>
                  ))
                )}
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-2"
          >
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/50">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">📊 Progress</h2>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {masteryStats && Object.entries(masteryStats).map(([level, count]) => {
                  const colors = masteryColors[level as keyof typeof masteryColors];
                  return (
                    <motion.div
                      key={level}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      whileHover={{ scale: 1.05 }}
                      className="text-center p-4 rounded-2xl"
                    >
                      <div className={`w-16 h-16 mx-auto mb-3 rounded-2xl bg-gradient-to-br ${colors.bg} flex items-center justify-center text-white text-2xl font-black`}>
                        {count}
                      </div>
                      <div className={`font-bold ${colors.text}`}>{colors.label}</div>
                      <div className="text-sm text-gray-500">cards</div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/50"
        >
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-900">🃏 All Cards</h2>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowCreateCard(true)}
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-2xl font-bold shadow-lg hover:from-purple-600 hover:to-pink-600 transition-all"
            >
              + Add Card
            </motion.button>
          </div>

          {cards.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-8xl mb-6">📝</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">No cards yet</h3>
              <p className="text-xl text-gray-600 mb-8">Create your first vocabulary card to start learning!</p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowCreateCard(true)}
                className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-2xl font-bold text-lg shadow-lg"
              >
                Create Your First Card
              </motion.button>
            </div>
          ) : (
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {cards.map((card) => {
                const colors = masteryColors[card.mastery_level];
                return (
                  <motion.div
                    key={card.id}
                    variants={itemVariants}
                    whileHover={{ y: -8, scale: 1.02 }}
                    className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100"
                  >
                    <div className={`h-3 bg-gradient-to-r ${colors.bg}`} />
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${colors.light} ${colors.text}`}>
                          {colors.label}
                        </span>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleDeleteCard(card.id)}
                            className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                      <div className="text-xl font-bold text-gray-900 mb-3">{card.front}</div>
                      <div className="text-gray-600">{card.back}</div>
                      {card.example && (
                        <div className="mt-3 text-sm text-gray-500 italic border-l-3 border-purple-300 pl-3">
                          "{card.example}"
                        </div>
                      )}
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <div className="text-xs text-gray-400 flex items-center justify-between">
                          <span>Reviewed {card.review_count}x</span>
                          <span>{card.correct_count}/{card.review_count} correct</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </motion.div>
      </div>

      {showCreateCard && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full"
          >
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Add New Card</h3>
            <form onSubmit={handleCreateCard}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Front (Word/Phrase)</label>
                  <input
                    type="text"
                    value={newCard.front}
                    onChange={(e) => setNewCard({ ...newCard, front: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-100 focus:border-purple-500"
                    placeholder="Enter word or phrase..."
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Back (Definition)</label>
                  <input
                    type="text"
                    value={newCard.back}
                    onChange={(e) => setNewCard({ ...newCard, back: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-100 focus:border-purple-500"
                    placeholder="Enter definition..."
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Example Sentence (optional)</label>
                  <textarea
                    value={newCard.example}
                    onChange={(e) => setNewCard({ ...newCard, example: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-100 focus:border-purple-500"
                    placeholder="Enter an example..."
                    rows={3}
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowCreateCard(false)}
                  className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold"
                >
                  Add Card
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {showCreateDeck && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full"
          >
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Create New Deck</h3>
            <form onSubmit={handleCreateDeck}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Deck Name</label>
                  <input
                    type="text"
                    value={newDeck.name}
                    onChange={(e) => setNewDeck({ ...newDeck, name: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-100 focus:border-purple-500"
                    placeholder="Enter deck name..."
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Description (optional)</label>
                  <textarea
                    value={newDeck.description}
                    onChange={(e) => setNewDeck({ ...newDeck, description: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-100 focus:border-purple-500"
                    placeholder="Enter description..."
                    rows={3}
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowCreateDeck(false)}
                  className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold"
                >
                  Create Deck
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
