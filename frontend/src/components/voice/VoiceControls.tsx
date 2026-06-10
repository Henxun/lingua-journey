import { motion } from 'framer-motion';
import { AudioVisualizer } from './AudioVisualizer';

interface VoiceControlsProps {
  isRecording: boolean;
  isPlaying: boolean;
  isConnected: boolean;
  onStartRecording: () => void;
  onStopRecording: () => void;
  onEndConversation: () => void;
}

export function VoiceControls({
  isRecording,
  isPlaying,
  isConnected,
  onStartRecording,
  onStopRecording,
  onEndConversation
}: VoiceControlsProps) {
  return (
    <div className="flex flex-col items-center gap-4 p-4 bg-white rounded-2xl shadow-lg">
      {/* Audio Visualizer */}
      <AudioVisualizer isRecording={isRecording} isPlaying={isPlaying} />

      {isConnected && (
        <>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {isRecording ? (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onStopRecording}
                className="flex items-center gap-2 px-6 py-3 bg-red-500 text-white rounded-full font-bold shadow-lg"
              >
                <span className="w-3 h-3 bg-white rounded-full animate-pulse" />
                停止录音
              </motion.button>
            ) : (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onStartRecording}
                disabled={isPlaying}
                className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold shadow-lg ${
                  isPlaying
                    ? 'bg-gray-400 text-white cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white'
                }`}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
                  <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
                </svg>
                {isPlaying ? 'AI 说话中...' : '点击说话'}
              </motion.button>
            )}

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onEndConversation}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-full font-bold hover:bg-gray-300 transition-colors"
            >
              结束对话
            </motion.button>
          </div>

          {/* Status message */}
          {isRecording && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-sm text-red-600 font-medium"
            >
              正在录音，请说话...
            </motion.p>
          )}
          {isPlaying && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-sm text-green-600 font-medium"
            >
              AI 正在说话...
            </motion.p>
          )}
        </>
      )}

      {!isConnected && (
        <div className="text-center py-3 text-gray-500">
          <p className="font-medium">在 3D 场景中选择一个角色开始对话</p>
          <p className="text-sm mt-1">点击场景中的任意人物开始对话练习</p>
        </div>
      )}
    </div>
  );
}
