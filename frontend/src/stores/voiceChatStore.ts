import { create } from 'zustand';

export interface TranscriptEntry {
  role: 'user' | 'ai';
  text: string;
  timestamp: number;
}

export interface EvaluationResult {
  pronunciation: {
    score: number;
    issues: string[];
    tips: string[];
  };
  grammar: {
    score: number;
    corrections: {
      original: string;
      corrected: string;
      rule?: string;
      explanation: string;
    }[];
  };
  overall: {
    score: number;
    feedback: string;
    suggestions: string[];
  };
}

interface VoiceChatState {
  // Connection
  isConnected: boolean;
  currentCharacterId: string | null;
  
  // Recording
  isRecording: boolean;
  isPlaying: boolean;
  
  // Conversation
  transcript: TranscriptEntry[];
  evaluation: EvaluationResult | null;
  error: string | null;
  
  // Actions
  connect: (characterId: string) => void;
  disconnect: () => void;
  setRecording: (recording: boolean) => void;
  setPlaying: (playing: boolean) => void;
  addTranscript: (role: 'user' | 'ai', text: string) => void;
  setEvaluation: (evaluation: EvaluationResult) => void;
  setError: (error: string | null) => void;
  clearTranscript: () => void;
}

export const useVoiceChatStore = create<VoiceChatState>((set) => ({
  isConnected: false,
  currentCharacterId: null,
  isRecording: false,
  isPlaying: false,
  transcript: [],
  evaluation: null,
  error: null,

  connect: (characterId) => set({
    isConnected: true,
    currentCharacterId: characterId,
    transcript: [],
    evaluation: null,
    error: null
  }),

  disconnect: () => set({
    isConnected: false,
    currentCharacterId: null,
    isRecording: false,
    isPlaying: false
  }),

  setRecording: (recording) => set({ isRecording: recording }),

  setPlaying: (playing) => set({ isPlaying: playing }),

  addTranscript: (role, text) => set((state) => ({
    transcript: [...state.transcript, {
      role,
      text,
      timestamp: Date.now()
    }]
  })),

  setEvaluation: (evaluation) => set({ evaluation }),

  setError: (error) => set({ error }),

  clearTranscript: () => set({ transcript: [], evaluation: null })
}));
