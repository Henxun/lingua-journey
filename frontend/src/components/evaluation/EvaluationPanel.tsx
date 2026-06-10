import { motion } from 'framer-motion';
import { useVoiceChatStore } from '../../stores/voiceChatStore';

export function EvaluationPanel() {
  const { evaluation } = useVoiceChatStore();

  if (!evaluation) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-2xl shadow-lg p-6"
    >
      <h3 className="text-xl font-bold text-gray-900 mb-6">
        📊 Evaluation Results
      </h3>

      <div className="grid grid-cols-2 gap-6 mb-6">
        {/* Pronunciation Score */}
        <div className="text-center">
          <div className="relative w-24 h-24 mx-auto mb-3">
            <svg className="w-24 h-24 transform -rotate-90">
              <circle
                cx="48"
                cy="48"
                r="40"
                stroke="#e5e7eb"
                strokeWidth="8"
                fill="none"
              />
              <circle
                cx="48"
                cy="48"
                r="40"
                stroke="#22c55e"
                strokeWidth="8"
                fill="none"
                strokeDasharray={`${evaluation.pronunciation.score * 2.51} 251`}
                strokeLinecap="round"
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-2xl font-bold text-gray-900">
              {evaluation.pronunciation.score}
            </span>
          </div>
          <p className="text-sm text-gray-600 font-medium">Pronunciation</p>
        </div>

        {/* Grammar Score */}
        <div className="text-center">
          <div className="relative w-24 h-24 mx-auto mb-3">
            <svg className="w-24 h-24 transform -rotate-90">
              <circle
                cx="48"
                cy="48"
                r="40"
                stroke="#e5e7eb"
                strokeWidth="8"
                fill="none"
              />
              <circle
                cx="48"
                cy="48"
                r="40"
                stroke="#3b82f6"
                strokeWidth="8"
                fill="none"
                strokeDasharray={`${evaluation.grammar.score * 2.51} 251`}
                strokeLinecap="round"
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-2xl font-bold text-gray-900">
              {evaluation.grammar.score}
            </span>
          </div>
          <p className="text-sm text-gray-600 font-medium">Grammar</p>
        </div>
      </div>

      {/* Overall Feedback */}
      <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50">
        <h4 className="font-semibold text-gray-900 mb-2">Overall Feedback</h4>
        <p className="text-gray-700">{evaluation.overall.feedback}</p>
      </div>

      {/* Suggestions */}
      {evaluation.overall.suggestions && evaluation.overall.suggestions.length > 0 && (
        <div className="mb-4">
          <h4 className="font-semibold text-gray-900 mb-2">Suggestions</h4>
          <ul className="space-y-2">
            {evaluation.overall.suggestions.map((suggestion, index) => (
              <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                <span className="text-blue-500">•</span>
                {suggestion}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Grammar Corrections */}
      {evaluation.grammar.corrections && evaluation.grammar.corrections.length > 0 && (
        <div className="mb-4">
          <h4 className="font-semibold text-gray-900 mb-2">Grammar Corrections</h4>
          <ul className="space-y-2">
            {evaluation.grammar.corrections.map((c, i) => (
              <li key={i} className="bg-red-50 rounded-xl p-3">
                <p className="text-red-600 line-through text-sm">{c.original}</p>
                <p className="text-green-600 font-medium">{c.corrected}</p>
                <p className="text-xs text-gray-500 mt-1">{c.explanation}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </motion.div>
  );
}
