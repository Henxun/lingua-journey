import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { conversationAPI, ConversationMessage, ConversationSession } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';

export default function ConversationPractice() {
  const router = useRouter();
  const { id: sessionId } = router.query;
  const { user } = useAuth();

  const [session, setSession] = useState<ConversationSession | null>(null);
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [completed, setCompleted] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (sessionId && typeof sessionId === 'string') {
      loadConversation();
    }
  }, [sessionId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadConversation = async () => {
    if (typeof sessionId !== 'string') return;

    try {
      setLoading(true);
      const sessionData = await conversationAPI.getConversation(sessionId);
      setSession(sessionData);

      const messagesData = await conversationAPI.getMessages(sessionId);
      setMessages(messagesData);

      if (sessionData.status === 'completed') {
        setCompleted(true);
      }
    } catch (error) {
      console.error('Failed to load conversation:', error);
      router.push('/courses');
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || sending || typeof sessionId !== 'string') return;

    try {
      setSending(true);
      const response = await conversationAPI.sendMessage(sessionId, inputMessage);
      setMessages(response.messages);
      setInputMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setSending(false);
    }
  };

  const handleComplete = async () => {
    if (!session || typeof sessionId !== 'string') return;

    try {
      setLoading(true);
      const completedSession = await conversationAPI.completeConversation(sessionId);
      setSession(completedSession);
      setCompleted(true);

      // Update learning stats
      if (completedSession.score !== undefined && completedSession.score !== null) {
        // Stats are updated automatically on the backend
        console.log('Conversation completed with score:', completedSession.score);
      }
    } catch (error) {
      console.error('Failed to complete conversation:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity }}
          className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-xl shadow-sm border-b border-white/20 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  href={`/courses/${session?.lesson_id || ''}`}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl text-gray-700 font-medium transition-colors"
                >
                  ← Back
                </Link>
              </motion.div>
              <h1 className="text-xl font-bold text-gray-900">AI Conversation Practice</h1>
            </div>
            {!completed && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleComplete}
                className="px-6 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-semibold hover:from-green-600 hover:to-emerald-700 transition-all shadow-lg"
              >
                Complete Practice
              </motion.button>
            )}
          </div>
        </div>
      </div>

      {/* Chat Container */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-white/60"
        >
          {/* Messages Area */}
          <div className="h-[calc(100vh-300px)] overflow-y-auto p-6 space-y-6">
            {messages.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12"
              >
                <div className="text-6xl mb-4">💬</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Ready to Practice!</h3>
                <p className="text-gray-600">Start your conversation with the AI tutor by sending a message.</p>
              </motion.div>
            ) : (
              messages.map((message, index) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[70%] rounded-2xl px-6 py-4 ${
                      message.role === 'user'
                        ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-br-md'
                        : 'bg-gray-100 text-gray-900 rounded-bl-md'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {message.role === 'ai' && (
                        <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                          AI
                        </div>
                      )}
                      <div className="flex-1">
                        <p className="text-base leading-relaxed">{message.content}</p>
                        <p className={`text-xs mt-2 ${
                          message.role === 'user' ? 'text-blue-100' : 'text-gray-500'
                        }`}>
                          {new Date(message.created_at).toLocaleTimeString()}
                        </p>
                      </div>
                      {message.role === 'user' && (
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                          {user?.username?.[0]?.toUpperCase() || 'U'}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          {!completed && (
            <div className="border-t border-gray-200 p-6 bg-gradient-to-r from-gray-50 to-slate-50">
              <div className="flex gap-4">
                <div className="flex-1 relative">
                  <textarea
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your message here..."
                    rows={1}
                    className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all text-lg resize-none"
                    disabled={sending}
                  />
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim() || sending}
                  className="px-8 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-2xl font-bold text-lg hover:from-blue-600 hover:to-indigo-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {sending ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity }}
                      className="w-6 h-6 border-2 border-white border-t-transparent rounded-full"
                    />
                  ) : (
                    'Send'
                  )}
                </motion.button>
              </div>
            </div>
          )}

          {/* Completion Screen */}
          {completed && session && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-12 bg-gradient-to-br from-green-50 to-emerald-50 text-center"
            >
              <div className="text-8xl mb-6">🎉</div>
              <h2 className="text-4xl font-black text-gray-900 mb-4">Practice Complete!</h2>
              <div className="inline-block bg-white rounded-3xl px-12 py-8 shadow-xl border border-green-100 mb-8">
                <div className="text-sm font-bold text-green-600 uppercase tracking-wide mb-2">Your Score</div>
                <div className="text-6xl font-black bg-gradient-to-r from-green-500 to-emerald-600 bg-clip-text text-transparent">
                  {session.score ?? 0}%
                </div>
              </div>
              <p className="text-xl text-gray-600 mb-8 max-w-md mx-auto">
                Great job! Keep practicing to improve your language skills.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => router.push('/profile/stats')}
                  className="px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-2xl font-bold text-lg hover:from-green-600 hover:to-emerald-700 transition-all shadow-xl"
                >
                  📊 View Learning Stats
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => router.push('/courses')}
                  className="px-8 py-4 bg-white text-gray-700 rounded-2xl font-bold text-lg border-2 border-gray-200 hover:border-blue-500 hover:text-blue-600 transition-all shadow-lg"
                >
                  📚 Continue Learning
                </motion.button>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
