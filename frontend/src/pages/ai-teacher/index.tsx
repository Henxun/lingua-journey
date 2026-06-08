import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { aiTeacherAPI, AITeacherSession, Message, AIContext } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';

export default function AITeacherPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [sessions, setSessions] = useState<AITeacherSession[]>([]);
  const [currentSession, setCurrentSession] = useState<AITeacherSession | null>(null);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [newTopic, setNewTopic] = useState('');

  useEffect(() => {
    loadSessions();
  }, []);

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
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                🤖 AI Language Teacher
              </h1>
              <p className="text-xl text-gray-600">
                Your personal language tutor available 24/7
              </p>
            </div>
            <button
              onClick={() => router.push('/')}
              className="px-6 py-3 bg-white rounded-xl shadow-lg text-gray-700 font-medium hover:bg-gray-50"
            >
              ← Back Home
            </button>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-1"
          >
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Sessions</h2>

              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={newTopic}
                  onChange={(e) => setNewTopic(e.target.value)}
                  placeholder="Topic for new session..."
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
                      {session.messages.length} messages
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
                          {message.role === 'user' ? 'You' : 'AI Teacher'}
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
                      placeholder="Ask your AI teacher..."
                      className="flex-1 px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500"
                      onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                      disabled={loading}
                    />
                    <button
                      onClick={sendMessage}
                      disabled={loading || !inputMessage.trim()}
                      className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-medium disabled:opacity-50 hover:shadow-lg transition-all"
                    >
                      {loading ? 'Sending...' : 'Send'}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
                <div className="text-6xl mb-4">🤖</div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Start Learning with AI
                </h2>
                <p className="text-gray-600">
                  Create a new session or select an existing one to start chatting with your personal AI language teacher.
                </p>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
