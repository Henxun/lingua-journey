import { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useVoiceChatStore, TranscriptEntry } from '../../stores/voiceChatStore';

export function ConversationPanel() {
  const { transcript, isConnected } = useVoiceChatStore();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [transcript]);

  return (
    <div className="bg-white rounded-2xl shadow-lg p-5 h-96 flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-900">Conversation</h3>
        <div className={`px-3 py-1 rounded-full text-xs font-bold ${
          isConnected
            ? 'bg-green-100 text-green-700'
            : 'bg-gray-100 text-gray-500'
        }`}>
          {isConnected ? '● Connected' : '○ Disconnected'}
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-3">
        {transcript.length === 0 && isConnected && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-gray-500">
              <p className="font-medium">Start speaking to begin the conversation</p>
              <p className="text-sm mt-2">You can also type your message below</p>
            </div>
          </div>
        )}

        {transcript.length === 0 && !isConnected && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-gray-500">
              <p className="font-medium">No active conversation</p>
              <p className="text-sm mt-2">Click a character in the 3D scene to begin</p>
            </div>
          </div>
        )}

        {transcript.map((entry: TranscriptEntry, index: number) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={`flex ${entry.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] px-4 py-3 rounded-2xl shadow-sm ${
                entry.role === 'user'
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-900'
              }`}
            >
              <p className="text-xs font-bold mb-1 opacity-70">
                {entry.role === 'user' ? 'You' : 'AI'}
              </p>
              <p className="whitespace-pre-wrap">{entry.text}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
