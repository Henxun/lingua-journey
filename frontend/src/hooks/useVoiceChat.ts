import { useCallback, useEffect, useRef, useState } from 'react';
import { useVoiceChatStore, EvaluationResult } from '../stores/voiceChatStore';

export function useVoiceChat() {
  const wsRef = useRef<WebSocket | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recognitionRef = useRef<any>(null);
  const manualInputRef = useRef<string>('');

  const {
    isConnected,
    currentCharacterId,
    isRecording,
    isPlaying,
    transcript,
    evaluation,
    error,
    connect,
    disconnect,
    setRecording,
    setPlaying,
    addTranscript,
    setEvaluation,
    setError,
    clearTranscript
  } = useVoiceChatStore();

  const [localError, setLocalError] = useState<string | null>(null);

  const speakText = useCallback((text: string) => {
    if (!('speechSynthesis' in window)) {
      console.warn('Speech synthesis not available');
      return;
    }

    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;
      utterance.onstart = () => setPlaying(true);
      utterance.onend = () => setPlaying(false);
      utterance.onerror = () => setPlaying(false);
      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.warn('TTS error:', err);
      setPlaying(false);
    }
  }, [setPlaying]);

  const connectToCharacter = useCallback(async (characterId: string) => {
    try {
      // Determine WebSocket URL - use current host for production, localhost:3001 for dev
      const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = process.env.NODE_ENV === 'production'
        ? `${wsProtocol}//${window.location.host}/voice/${characterId}`
        : `ws://localhost:3001/voice/${characterId}`;

      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        console.log('Voice chat connected');
        connect(characterId);
        setError(null);
        setLocalError(null);
      };

      wsRef.current.onmessage = (event) => {
        const message = JSON.parse(event.data);

        switch (message.type) {
          case 'ready':
            addTranscript('ai', message.payload.greeting);
            speakText(message.payload.greeting);
            break;

          case 'transcript':
            addTranscript('user', message.payload.transcript);
            break;

          case 'ai_speaking':
            addTranscript('ai', message.payload.transcript);
            if (message.payload.audioData) {
              speakText(message.payload.transcript);
            } else {
              // Text-only - synthesize via browser SpeechSynthesis API
              speakText(message.payload.transcript);
            }
            break;

          case 'evaluation_result':
            setEvaluation(message.payload.evaluation as EvaluationResult);
            break;

          case 'error':
            setError(message.payload.message);
            setLocalError(message.payload.message);
            break;
        }
      };

      wsRef.current.onclose = () => {
        disconnect();
      };

      wsRef.current.onerror = (err) => {
        console.error('WebSocket error:', err);
        setError('Connection failed - please ensure backend is running on port 3001');
        setLocalError('Connection failed - please ensure backend is running on port 3001');
      };
    } catch (err) {
      console.error('Connect error:', err);
      setError('Failed to connect');
      setLocalError('Failed to connect');
    }
  }, [connect, disconnect, addTranscript, setEvaluation, setError, speakText]);

  const disconnectFromCharacter = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        // ignore
      }
      recognitionRef.current = null;
    }
    disconnect();
  }, [disconnect]);

  // Speech recognition for voice input
  const startRecording = useCallback(async () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      try {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = false;
        recognitionRef.current.lang = 'en-US';

        recognitionRef.current.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          sendUserMessage(transcript);
        };

        recognitionRef.current.onerror = (event: any) => {
          if (event.error === 'no-speech') {
            // This is recoverable - user just didn't speak
            setLocalError(null);
          } else {
            console.error('Speech recognition error:', event.error);
            setLocalError('Voice recognition failed. Try typing instead.');
          }
          setRecording(false);
        };

        recognitionRef.current.onend = () => {
          setRecording(false);
        };

        recognitionRef.current.start();
        setRecording(true);
        setLocalError(null);
        return;
      } catch (err) {
        console.error('Speech recognition init error:', err);
        // Fall through to MediaRecorder fallback
      }
    }

    // Fallback to manual text input (no speech support - we still allow text-based chat)
    console.warn('Web Speech API not available - falling back to text-based input');
    setLocalError('Voice recognition unavailable - use text input below');
    setRecording(false);
  }, [setRecording, setLocalError]);

  const stopRecording = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        // ignore
      }
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    setRecording(false);
  }, [setRecording]);

  const sendUserMessage = useCallback((text: string) => {
    if (!text || !text.trim()) return;
    
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'user_text',
        payload: { text: text.trim() }
      }));
    } else {
      setLocalError('Not connected to voice server');
    }
  }, [setLocalError]);

  const endConversation = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'end_conversation' }));
    }
    stopRecording();
    window.speechSynthesis.cancel();
  }, [stopRecording]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          // ignore
        }
      }
      window.speechSynthesis.cancel();
    };
  }, []);

  return {
    isConnected,
    currentCharacterId,
    isRecording,
    isPlaying,
    transcript,
    evaluation,
    error: localError || error,
    connectToCharacter,
    disconnectFromCharacter,
    startRecording,
    stopRecording,
    endConversation,
    sendUserMessage,
    clearTranscript
  };
}
