import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { 
  aiTeacherAPI, 
  AITeacherSession, 
  Message, 
  AIContext,
  LearningData,
  LearningStyleResult
} from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';
import { Navbar } from '../../components/Navbar';

type TabType = 'chat' | 'learningPath' | 'adaptivePractice' | 'learningStyle' | 'contentGenerator';

export default function AITeacherPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('chat');
  const [sessions, setSessions] = useState<AITeacherSession[]>([]);
  const [currentSession, setCurrentSession] = useState<AITeacherSession | null>(null);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [newTopic, setNewTopic] = useState('');
  
  const [learningPathResult, setLearningPathResult] = useState('');
  const [adaptivePracticeResult, setAdaptivePracticeResult] = useState('');
  const [learningStyleResult, setLearningStyleResult] = useState<LearningStyleResult | null>(null);
  const [contentResult, setContentResult] = useState('');
  
  const [practiceTopic, setPracticeTopic] = useState('');
  const [contentTopic, setContentTopic] = useState('');
  const [contentType, setContentType] = useState<'lesson' | 'exercise' | 'story'>('lesson');

  useEffect(() => {
    if (activeTab === 'chat') {
      loadSessions();
    }
  }, [activeTab]);

  const loadSessions = async () => {
    try {
      const data = await aiTeacherAPI.getSessions();
      setSessions(data);
    } catch (error) {
      console.error('Failed to load sessions:', error);
    }
  };

  const createSession = async () => {
    if (!newTopic.trim()) return;
    try {
      setLoading(true);
      const session = await aiTeacherAPI.createSession(newTopic);
      setSessions([session, ...sessions]);
      setCurrentSession(session);
      setNewTopic('');
    } catch (error) {
      console.error('Failed to create session:', error);
    } finally {
      setLoading(false);
    }
  };

  const selectSession = async (session: AITeacherSession) => {
    try {
      const data = await aiTeacherAPI.getSession(session.id);
      setCurrentSession(data);
    } catch (error) {
      console.error('Failed to load session:', error);
    }
  };

  const sendMessage = async () => {
    if (!currentSession || !inputMessage.trim()) return;
    try {
      setLoading(true);
      const aiContext: AIContext = {
        targetLanguage: user?.targetLanguage || 'English',
        nativeLanguage: user?.nativeLanguage || 'English',
        cefrLevel: 'A1',
        topic: currentSession.topic
      };
      const result = await aiTeacherAPI.sendMessage(
        currentSession.id,
        inputMessage,
        aiContext
      );
      if (currentSession) {
        setCurrentSession({
          ...currentSession,
          messages: [
            ...currentSession.messages,
            result.userMessage,
            result.assistantMessage
          ]
        });
      }
      setInputMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateLearningPath = async () => {
    try {
      setLoading(true);
      const aiContext: AIContext = {
        targetLanguage: user?.targetLanguage || 'English',
        nativeLanguage: user?.nativeLanguage || 'English',
        cefrLevel: 'A1',
        learningGoals: 'Master basic conversation skills'
      };
      const learningData: LearningData = {
        completedCourses: ['Basic Greetings', 'Introduction'],
        assessmentScores: [
          { skill: 'listening', score: 75 },
          { skill: 'reading', score: 80 },
          { skill: 'speaking', score: 65 },
          { skill: 'writing', score: 70 }
        ],
        timeSpent: 5,
        preferredTopics: ['Travel', 'Food', 'Business'],
        weakAreas: ['Grammar', 'Pronunciation'],
        learningGoals: 'Become conversational in 3 months'
      };
      const result = await aiTeacherAPI.generateLearningPath(aiContext, learningData);
      setLearningPathResult(result.path);
    } catch (error) {
      console.error('Failed to generate learning path:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateAdaptivePractice = async () => {
    if (!practiceTopic.trim()) return;
    try {
      setLoading(true);
      const aiContext: AIContext = {
        targetLanguage: user?.targetLanguage || 'English',
        nativeLanguage: user?.nativeLanguage || 'English',
        cefrLevel: 'A1'
      };
      const result = await aiTeacherAPI.generateAdaptivePractice(
        practiceTopic,
        aiContext,
        { correct: 8, total: 10, mistakes: ['verb conjugation', 'prepositions'] }
      );
      setAdaptivePracticeResult(result.practice);
    } catch (error) {
      console.error('Failed to generate adaptive practice:', error);
    } finally {
      setLoading(false);
    }
  };

  const analyzeLearningStyle = async () => {
    try {
      setLoading(true);
      const aiContext: AIContext = {
        targetLanguage: user?.targetLanguage || 'English',
        nativeLanguage: user?.nativeLanguage || 'English',
        cefrLevel: 'A1'
      };
      const result = await aiTeacherAPI.analyzeLearningStyle(aiContext, {
        preferredActivities: ['conversation', 'flashcards', 'reading'],
        timeDistribution: { morning: 1.5, afternoon: 2, evening: 1 },
        interactionStyle: 'interactive',
        feedbackPreferences: ['immediate', 'detailed', 'positive'],
        topicEngagement: [
          { topic: 'Travel', engagement: 9 },
          { topic: 'Food', engagement: 8 },
          { topic: 'Business', engagement: 6 }
        ]
      });
      setLearningStyleResult(result);
    } catch (error) {
      console.error('Failed to analyze learning style:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateContent = async () => {
    if (!contentTopic.trim()) return;
    try {
      setLoading(true);
      const aiContext: AIContext = {
        targetLanguage: user?.targetLanguage || 'English',
        nativeLanguage: user?.nativeLanguage || 'English',
        cefrLevel: 'A1'
      };
      const result = await aiTeacherAPI.generateContent(contentTopic, aiContext, contentType);
      setContentResult(result.content);
    } catch (error) {
      console.error('Failed to generate content:', error);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'chat' as TabType, label: t('aiTeacher.tabs.chat'), icon: '💬' },
    { id: 'learningPath' as TabType, label: t('aiTeacher.tabs.learningPath'), icon: '🗺️' },
    { id: 'adaptivePractice' as TabType, label: t('aiTeacher.tabs.adaptivePractice'), icon: '📝' },
    { id: 'learningStyle' as TabType, label: t('aiTeacher.tabs.learningStyle'), icon: '🧠' },
    { id: 'contentGenerator' as TabType, label: t('aiTeacher.tabs.contentGenerator'), icon: '✨' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Head>
        <title>{t('aiTeacher.pageTitle')}</title>
      </Head>
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              🤖 {t('aiTeacher.title')}
            </h1>
            <p className="text-xl text-gray-600">
              {t('aiTeacher.subtitle')}
            </p>
          </div>
        </motion.div>

        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {tabs.map((tab) => (
            <motion.button
              key={tab.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-50 shadow'
              }`}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </motion.button>
          ))}
        </div>

        {activeTab === 'chat' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="lg:col-span-1"
            >
              <div className="bg-white rounded-2xl shadow-xl p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">{t('aiTeacher.sessions')}</h2>

                <div className="flex gap-2 mb-4">
                  <input
                    type="text"
                    value={newTopic}
                    onChange={(e) => setNewTopic(e.target.value)}
                    placeholder={t('aiTeacher.topicPlaceholder')}
                    className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    onKeyPress={(e) => e.key === 'Enter' && createSession()}
                  />
                  <button
                    onClick={createSession}
                    disabled={loading}
                    className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg font-medium disabled:opacity-50"
                  >
                    +
                  </button>
                </div>

                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {sessions.map((session) => (
                    <button
                      key={session.id}
                      onClick={() => selectSession(session)}
                      className={`w-full text-left p-4 rounded-xl transition-all ${
                        currentSession?.id === session.id
                          ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-300'
                          : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                      }`}
                    >
                      <div className="font-semibold text-gray-900">
                        {session.topic}
                      </div>
                      <div className="text-sm text-gray-500">
                        {session.messages.length} {t('aiTeacher.messages')}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-2"
            >
              {currentSession ? (
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                  <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-6 text-white">
                    <h2 className="text-2xl font-bold">{currentSession.topic}</h2>
                  </div>

                  <div className="h-96 overflow-y-auto p-6 space-y-4">
                    {currentSession.messages.map((message) => (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex ${
                          message.role === 'user' ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        <div
                          className={`max-w-md px-4 py-3 rounded-2xl ${
                            message.role === 'user'
                              ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white'
                              : 'bg-gray-100 text-gray-900'
                          }`}
                        >
                          <div className="font-semibold text-xs mb-1">
                            {message.role === 'user' ? t('aiTeacher.you') : t('aiTeacher.aiTeacher')}
                          </div>
                          <div className="whitespace-pre-wrap">{message.content}</div>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  <div className="p-4 border-t">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        placeholder={t('aiTeacher.inputPlaceholder')}
                        className="flex-1 px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500"
                        onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                        disabled={loading}
                      />
                      <button
                        onClick={sendMessage}
                        disabled={loading || !inputMessage.trim()}
                        className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-medium disabled:opacity-50 hover:shadow-lg transition-all"
                      >
                        {loading ? t('aiTeacher.sending') : t('aiTeacher.send')}
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
                  <div className="text-6xl mb-4">🤖</div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    {t('aiTeacher.startLearning')}
                  </h2>
                  <p className="text-gray-600">
                    {t('aiTeacher.startLearningDescription')}
                  </p>
                </div>
              )}
            </motion.div>
          </div>
        )}

        {activeTab === 'learningPath' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-xl p-8"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              🗺️ {t('aiTeacher.learningPath.title')}
            </h2>
            <p className="text-gray-600 mb-6">
              {t('aiTeacher.learningPath.description')}
            </p>
            
            <button
              onClick={generateLearningPath}
              disabled={loading}
              className="px-8 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-bold text-lg disabled:opacity-50 hover:shadow-lg transition-all"
            >
              {loading ? t('aiTeacher.generating') : t('aiTeacher.learningPath.generate')}
            </button>

            {learningPathResult && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-8 p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100"
              >
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  {t('aiTeacher.learningPath.result')}
                </h3>
                <div className="prose prose-lg max-w-none text-gray-700 whitespace-pre-wrap">
                  {learningPathResult}
                </div>
              </motion.div>
            )}
          </motion.div>
        )}

        {activeTab === 'adaptivePractice' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-xl p-8"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              📝 {t('aiTeacher.adaptivePractice.title')}
            </h2>
            <p className="text-gray-600 mb-6">
              {t('aiTeacher.adaptivePractice.description')}
            </p>
            
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {t('aiTeacher.adaptivePractice.topicLabel')}
              </label>
              <input
                type="text"
                value={practiceTopic}
                onChange={(e) => setPracticeTopic(e.target.value)}
                placeholder={t('aiTeacher.adaptivePractice.topicPlaceholder')}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              onClick={generateAdaptivePractice}
              disabled={loading || !practiceTopic.trim()}
              className="px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-bold text-lg disabled:opacity-50 hover:shadow-lg transition-all"
            >
              {loading ? t('aiTeacher.generating') : t('aiTeacher.adaptivePractice.generate')}
            </button>

            {adaptivePracticeResult && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-8 p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-100"
              >
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  {t('aiTeacher.adaptivePractice.result')}
                </h3>
                <div className="prose prose-lg max-w-none text-gray-700 whitespace-pre-wrap">
                  {adaptivePracticeResult}
                </div>
              </motion.div>
            )}
          </motion.div>
        )}

        {activeTab === 'learningStyle' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-xl p-8"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              🧠 {t('aiTeacher.learningStyle.title')}
            </h2>
            <p className="text-gray-600 mb-6">
              {t('aiTeacher.learningStyle.description')}
            </p>
            
            <button
              onClick={analyzeLearningStyle}
              disabled={loading}
              className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl font-bold text-lg disabled:opacity-50 hover:shadow-lg transition-all"
            >
              {loading ? t('aiTeacher.analyzing') : t('aiTeacher.learningStyle.analyze')}
            </button>

            {learningStyleResult && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-8 space-y-6"
              >
                <div className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-100">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">
                    {t('aiTeacher.learningStyle.primaryStyle')}: {learningStyleResult.primaryStyle}
                  </h3>
                  <h4 className="text-lg font-semibold text-gray-700 mb-2">
                    {t('aiTeacher.learningStyle.secondaryStyle')}: {learningStyleResult.secondaryStyle}
                  </h4>
                  <p className="text-gray-700 mb-4">{learningStyleResult.description}</p>
                  
                  <div className="space-y-4">
                    <div>
                      <h5 className="font-semibold text-gray-900 mb-2">{t('aiTeacher.learningStyle.recommendations')}</h5>
                      <ul className="list-disc list-inside space-y-1">
                        {learningStyleResult.recommendations.map((rec, index) => (
                          <li key={index} className="text-gray-700">{rec}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h5 className="font-semibold text-gray-900 mb-2">{t('aiTeacher.learningStyle.optimalActivities')}</h5>
                      <ul className="list-disc list-inside space-y-1">
                        {learningStyleResult.optimalActivities.map((act, index) => (
                          <li key={index} className="text-gray-700">{act}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}

        {activeTab === 'contentGenerator' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-xl p-8"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              ✨ {t('aiTeacher.contentGenerator.title')}
            </h2>
            <p className="text-gray-600 mb-6">
              {t('aiTeacher.contentGenerator.description')}
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {t('aiTeacher.contentGenerator.topicLabel')}
                </label>
                <input
                  type="text"
                  value={contentTopic}
                  onChange={(e) => setContentTopic(e.target.value)}
                  placeholder={t('aiTeacher.contentGenerator.topicPlaceholder')}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {t('aiTeacher.contentGenerator.typeLabel')}
                </label>
                <select
                  value={contentType}
                  onChange={(e) => setContentType(e.target.value as 'lesson' | 'exercise' | 'story')}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                >
                  <option value="lesson">{t('aiTeacher.contentGenerator.types.lesson')}</option>
                  <option value="exercise">{t('aiTeacher.contentGenerator.types.exercise')}</option>
                  <option value="story">{t('aiTeacher.contentGenerator.types.story')}</option>
                </select>
              </div>
            </div>

            <button
              onClick={generateContent}
              disabled={loading || !contentTopic.trim()}
              className="px-8 py-4 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-xl font-bold text-lg disabled:opacity-50 hover:shadow-lg transition-all"
            >
              {loading ? t('aiTeacher.generating') : t('aiTeacher.contentGenerator.generate')}
            </button>

            {contentResult && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-8 p-6 bg-gradient-to-br from-orange-50 to-red-50 rounded-xl border border-orange-100"
              >
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  {t('aiTeacher.contentGenerator.result')}
                </h3>
                <div className="prose prose-lg max-w-none text-gray-700 whitespace-pre-wrap">
                  {contentResult}
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
