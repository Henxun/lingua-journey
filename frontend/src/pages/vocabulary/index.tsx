import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/router';
import { Navbar } from '../../components/Navbar';

interface VocabularyCard {
  id: string;
  front: string;
  back: string;
  example?: string;
  mastery_level: 'new' | 'learning' | 'familiar' | 'known' | 'mastered';
  next_review?: string;
  review_count: number;
  correct_count: number;
}

interface VocabularyDeck {
  id: string;
  name: string;
  description?: string;
  card_count: number;
  is_auto: boolean;
}

const masteryColors: Record<string, string> = {
  new: 'bg-gray-100 text-gray-600',
  learning: 'bg-yellow-100 text-yellow-700',
  familiar: 'bg-blue-100 text-blue-700',
  known: 'bg-green-100 text-green-700',
  mastered: 'bg-purple-100 text-purple-700'
};

const masteryLabels: Record<string, string> = {
  new: '新词',
  learning: '学习中',
  familiar: '熟悉',
  known: '已掌握',
  mastered: '精通'
};

export default function VocabularyPage() {
  const router = useRouter();
  const [cards, setCards] = useState<VocabularyCard[]>([]);
  const [decks, setDecks] = useState<VocabularyDeck[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'cards' | 'decks'>('cards');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCard, setNewCard] = useState({ front: '', back: '', example: '' });

  useEffect(() => {
    fetchVocabulary();
  }, []);

  const fetchVocabulary = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      const [cardsRes, decksRes] = await Promise.all([
        fetch('/api/vocabulary/cards', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('/api/vocabulary/decks', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      if (cardsRes.ok) {
        const cardsData = await cardsRes.json();
        setCards(cardsData.cards || []);
      }

      if (decksRes.ok) {
        const decksData = await decksRes.json();
        setDecks(decksData.decks || []);
      }
    } catch (error) {
      console.error('Failed to fetch vocabulary:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCard = async () => {
    if (!newCard.front || !newCard.back) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/vocabulary/cards', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newCard)
      });

      if (response.ok) {
        setNewCard({ front: '', back: '', example: '' });
        setShowAddModal(false);
        fetchVocabulary();
      }
    } catch (error) {
      console.error('Failed to add card:', error);
    }
  };

  const handleDeleteCard = async (cardId: string) => {
    if (!confirm('确定要删除这张卡片吗？')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/vocabulary/cards/${cardId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        fetchVocabulary();
      }
    } catch (error) {
      console.error('Failed to delete card:', error);
    }
  };

  const filteredCards = cards.filter(card =>
    card.front.toLowerCase().includes(searchTerm.toLowerCase()) ||
    card.back.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const dueCards = cards.filter(card => {
    if (!card.next_review) return card.mastery_level === 'new';
    return new Date(card.next_review) <= new Date();
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">词汇卡片</h1>
          <p className="text-gray-600">使用间隔重复算法高效记忆词汇</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-sm p-4"
          >
            <div className="text-2xl font-bold text-blue-600">{cards.length}</div>
            <div className="text-sm text-gray-600">总词汇</div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow-sm p-4"
          >
            <div className="text-2xl font-bold text-orange-600">{dueCards.length}</div>
            <div className="text-sm text-gray-600">待复习</div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-sm p-4"
          >
            <div className="text-2xl font-bold text-green-600">
              {cards.filter(c => c.mastery_level === 'mastered' || c.mastery_level === 'known').length}
            </div>
            <div className="text-sm text-gray-600">已掌握</div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl shadow-sm p-4"
          >
            <div className="text-2xl font-bold text-purple-600">{decks.length}</div>
            <div className="text-sm text-gray-600">卡组</div>
          </motion.div>
        </div>

        {/* Review Button */}
        {dueCards.length > 0 && (
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => router.push('/vocabulary/review')}
            className="w-full mb-8 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-bold text-lg shadow-lg"
          >
            开始复习 ({dueCards.length} 张卡片待复习)
          </motion.button>
        )}

        {/* Tabs */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setActiveTab('cards')}
            className={`px-6 py-2 rounded-lg font-medium transition-all ${
              activeTab === 'cards'
                ? 'bg-blue-500 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            词汇库
          </button>
          <button
            onClick={() => setActiveTab('decks')}
            className={`px-6 py-2 rounded-lg font-medium transition-all ${
              activeTab === 'decks'
                ? 'bg-blue-500 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            卡组
          </button>
        </div>

        {activeTab === 'cards' && (
          <>
            {/* Search and Add */}
            <div className="flex gap-4 mb-6">
              <input
                type="text"
                placeholder="搜索词汇..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowAddModal(true)}
                className="px-6 py-2 bg-green-500 text-white rounded-lg font-medium"
              >
                添加词汇
              </motion.button>
            </div>

            {/* Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCards.map((card, index) => (
                <motion.div
                  key={card.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white rounded-xl shadow-sm p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${masteryColors[card.mastery_level]}`}>
                      {masteryLabels[card.mastery_level]}
                    </span>
                    <button
                      onClick={() => handleDeleteCard(card.id)}
                      className="text-gray-400 hover:text-red-500"
                    >
                      ✕
                    </button>
                  </div>
                  <div className="text-lg font-bold text-gray-900 mb-1">{card.front}</div>
                  <div className="text-gray-600 mb-2">{card.back}</div>
                  {card.example && (
                    <div className="text-sm text-gray-500 italic">"{card.example}"</div>
                  )}
                  <div className="mt-3 flex justify-between text-xs text-gray-400">
                    <span>复习 {card.review_count} 次</span>
                    <span>
                      正确率 {card.review_count > 0 
                        ? Math.round((card.correct_count / card.review_count) * 100) 
                        : 0}%
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>

            {filteredCards.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                {searchTerm ? '没有找到匹配的词汇' : '还没有词汇卡片，点击上方按钮添加'}
              </div>
            )}
          </>
        )}

        {activeTab === 'decks' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {decks.map((deck, index) => (
              <motion.div
                key={deck.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-xl shadow-sm p-4 hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-bold text-gray-900">{deck.name}</h3>
                  {deck.is_auto && (
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-600 text-xs rounded">
                      自动
                    </span>
                  )}
                </div>
                {deck.description && (
                  <p className="text-sm text-gray-600 mb-2">{deck.description}</p>
                )}
                <div className="text-sm text-gray-500">{deck.card_count} 张卡片</div>
              </motion.div>
            ))}

            {decks.length === 0 && (
              <div className="col-span-full text-center py-12 text-gray-500">
                还没有卡组
              </div>
            )}
          </div>
        )}
      </main>

      {/* Add Card Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl p-6 w-full max-w-md"
          >
            <h2 className="text-xl font-bold mb-4">添加新词汇</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">正面 (词汇)</label>
                <input
                  type="text"
                  value={newCard.front}
                  onChange={(e) => setNewCard({ ...newCard, front: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500"
                  placeholder="例如: hello"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">背面 (释义)</label>
                <input
                  type="text"
                  value={newCard.back}
                  onChange={(e) => setNewCard({ ...newCard, back: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500"
                  placeholder="例如: 你好"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">例句 (可选)</label>
                <textarea
                  value={newCard.example}
                  onChange={(e) => setNewCard({ ...newCard, example: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500"
                  rows={2}
                  placeholder="例如: Hello, how are you?"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium"
              >
                取消
              </button>
              <button
                onClick={handleAddCard}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg font-medium"
              >
                添加
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
