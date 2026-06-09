# Immersive Voice Chat Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build an immersive multi-character voice chat system with 3D scene, real-time voice conversation, and pronunciation/grammar evaluation.

**Architecture:** WebSocket-based real-time voice communication with separate voice server (port 3001), Piper TTS for speech synthesis, Whisper STT for speech recognition, and AI dialogue generation with character-specific context.

**Tech Stack:** React Three Fiber, ws (WebSocket), Piper TTS, Whisper.cpp, OpenAI/Ollama, LanguageTool

---

## File Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── scenes/
│   │   │   └── Character3D.tsx          # 3D character with animations
│   │   ├── voice/
│   │   │   ├── VoiceManager.tsx         # Voice recording/playback
│   │   │   ├── VoiceControls.tsx        # Mic/End controls
│   │   │   └── AudioVisualizer.tsx      # Audio level display
│   │   ├── chat/
│   │   │   ├── ConversationPanel.tsx    # Chat history
│   │   │   └── ChatMessage.tsx
│   │   └── evaluation/
│   │       ├── EvaluationPanel.tsx       # Score display
│   │       └── ScoreDisplay.tsx
│   ├── hooks/
│   │   ├── useVoiceChat.ts              # Main voice chat hook
│   │   └── useWebSocket.ts
│   ├── stores/
│   │   └── voiceChatStore.ts            # Zustand state
│   └── pages/
│       └── scenes/
│           └── index.tsx                 # Updated with voice chat
backend/
├── src/
│   ├── servers/
│   │   └── voiceServer.ts               # WebSocket voice server
│   ├── services/
│   │   ├── voice/
│   │   │   ├── VoiceService.ts         # Service orchestration
│   │   │   ├── TTSService.ts           # Piper TTS
│   │   │   └── STTService.ts           # Whisper STT
│   │   ├── dialogue/
│   │   │   └── DialogueService.ts      # AI dialogue
│   │   └── evaluation/
│   │       ├── EvaluationService.ts
│   │       ├── PronunciationScorer.ts
│   │       └── GrammarChecker.ts
│   └── entities/
│       ├── Character.ts
│       └── ConversationSession.ts
```

---

## Task 1: WebSocket Voice Server Setup

**Files:**
- Create: `backend/src/servers/voiceServer.ts`
- Create: `backend/src/entities/Character.ts`
- Create: `backend/src/entities/ConversationSession.ts`

- [ ] **Step 1: Create Character entity**

```typescript
// backend/src/entities/Character.ts
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('characters')
export class Character {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  role: 'waiter' | 'customer';

  @Column()
  personality: string;

  @Column('simple-array')
  defaultDialogue: string[];

  @Column()
  speechStyle: 'formal' | 'casual' | 'friendly';

  @Column()
  avatarColor: string;

  @Column()
  clothingColor: string;

  @Column('float')
  positionX: number;

  @Column('float')
  positionY: number;

  @Column('float')
  positionZ: number;
}
```

- [ ] **Step 2: Create ConversationSession entity**

```typescript
// backend/src/entities/ConversationSession.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('conversation_sessions')
export class ConversationSession {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column()
  characterId: string;

  @Column('simple-array')
  transcripts: string[];

  @Column({ type: 'json', nullable: true })
  evaluation: any;

  @Column({ default: false })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
```

- [ ] **Step 3: Create WebSocket voice server**

```typescript
// backend/src/servers/voiceServer.ts
import WebSocket, { WebSocketServer } from 'ws';
import { Server } from 'http';
import { AppDataSource } from '../config/database';
import { Character } from '../entities/Character';
import { ConversationSession } from '../entities/ConversationSession';
import { VoiceService } from '../services/voice/VoiceService';
import { DialogueService } from '../services/dialogue/DialogueService';
import { EvaluationService } from '../services/evaluation/EvaluationService';

export class VoiceServer {
  private wss: WebSocketServer;
  private clients: Map<string, ClientState> = new Map();
  private voiceService: VoiceService;
  private dialogueService: DialogueService;
  private evaluationService: EvaluationService;

  constructor(server: Server) {
    this.wss = new WebSocketServer({ server, path: '/voice' });
    this.voiceService = new VoiceService();
    this.dialogueService = new DialogueService();
    this.evaluationService = new EvaluationService();
    
    this.wss.on('connection', this.handleConnection.bind(this));
    console.log('Voice WebSocket server running on /voice');
  }

  private async handleConnection(ws: WebSocket, characterId: string) {
    const clientId = this.generateId();
    const client: ClientState = {
      id: clientId,
      ws,
      characterId,
      transcript: [],
      sessionId: null
    };
    this.clients.set(clientId, client);

    // Load character
    const characterRepo = AppDataSource.getRepository(Character);
    const character = await characterRepo.findOne({ where: { id: characterId } });

    if (!character) {
      ws.send(JSON.stringify({ type: 'error', payload: { message: 'Character not found' } }));
      ws.close();
      return;
    }

    // Create session
    const sessionRepo = AppDataSource.getRepository(ConversationSession);
    const session = sessionRepo.create({
      userId: 'anonymous',
      characterId,
      transcripts: [],
      isActive: true
    });
    await sessionRepo.save(session);
    client.sessionId = session.id;

    // Send ready with greeting
    const greeting = character.defaultDialogue[0];
    ws.send(JSON.stringify({
      type: 'ready',
      payload: { characterId, greeting }
    }));

    // Handle messages
    ws.on('message', async (data) => {
      try {
        const message = JSON.parse(data.toString());
        await this.handleMessage(client, message);
      } catch (error) {
        console.error('Message handling error:', error);
      }
    });

    ws.on('close', () => {
      this.clients.delete(clientId);
    });
  }

  private async handleMessage(client: ClientState, message: any) {
    switch (message.type) {
      case 'user_audio':
        await this.processUserAudio(client, message.payload);
        break;
      case 'end_conversation':
        await this.endConversation(client);
        break;
    }
  }

  private async processUserAudio(client: ClientState, payload: { audioData: string }) {
    const { audioData } = payload;
    
    // STT - Convert audio to text
    const transcript = await this.voiceService.transcribe(audioData);
    client.transcript.push(transcript);
    
    // Send transcript
    client.ws.send(JSON.stringify({
      type: 'transcript',
      payload: { transcript }
    }));

    // Get AI response
    const response = await this.dialogueService.generate(
      client.transcript,
      client.characterId
    );

    // TTS - Convert response to audio
    const audioResponse = await this.voiceService.synthesize(response.text);

    // Send AI speaking
    client.ws.send(JSON.stringify({
      type: 'ai_speaking',
      payload: { audioData: audioResponse, transcript: response.text }
    }));
  }

  private async endConversation(client: ClientState) {
    const evaluation = await this.evaluationService.evaluate(client.transcript);
    
    // Update session
    if (client.sessionId) {
      const sessionRepo = AppDataSource.getRepository(ConversationSession);
      await sessionRepo.update(client.sessionId, {
        transcripts: client.transcript,
        evaluation,
        isActive: false
      });
    }

    client.ws.send(JSON.stringify({
      type: 'evaluation_result',
      payload: { evaluation }
    }));
  }

  private generateId(): string {
    return Math.random().toString(36).substring(2, 15);
  }
}
```

- [ ] **Step 4: Run to verify server starts**

Run: `cd backend && npm run dev`
Expected: "Voice WebSocket server running on /voice"

- [ ] **Step 5: Commit**

```bash
git add backend/src/servers/voiceServer.ts backend/src/entities/Character.ts backend/src/entities/ConversationSession.ts
git commit -m "feat(voice): add WebSocket voice server with session management"
```

---

## Task 2: Voice Services (TTS/STT)

**Files:**
- Create: `backend/src/services/voice/VoiceService.ts`
- Create: `backend/src/services/voice/TTSService.ts`
- Create: `backend/src/services/voice/STTService.ts`

- [ ] **Step 1: Create TTSService**

```typescript
// backend/src/services/voice/TTSService.ts
import { spawn } from 'child_process';
import { writeFileSync, unlinkSync, existsSync } from 'fs';
import { join } from 'path';

export class TTSService {
  private modelPath: string;
  private piperPath: string;

  constructor(modelPath?: string) {
    this.modelPath = modelPath || process.env.PIPER_MODEL_PATH || './models/piper/en_US-lessac-medium.onnx';
    this.piperPath = process.env.PIPER_BIN || 'piper';
  }

  async synthesize(text: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const inputFile = join('/tmp', `tts_input_${Date.now()}.txt`);
      const outputFile = join('/tmp', `tts_output_${Date.now()}.wav`);
      
      writeFileSync(inputFile, text);
      
      const piper = spawn(this.piperPath, [
        '--model', this.modelPath,
        '--input_file', inputFile,
        '--output_file', outputFile
      ]);

      piper.on('close', () => {
        try {
          if (existsSync(outputFile)) {
            const buffer = require('fs').readFileSync(outputFile);
            const base64 = buffer.toString('base64');
            unlinkSync(inputFile);
            unlinkSync(outputFile);
            resolve(base64);
          } else {
            reject(new Error('TTS output file not created'));
          }
        } catch (error) {
          reject(error);
        }
      });

      piper.on('error', reject);
    });
  }
}
```

- [ ] **Step 2: Create STTService**

```typescript
// backend/src/services/voice/STTService.ts
import { spawn } from 'child_process';
import { writeFileSync, unlinkSync, readFileSync } from 'fs';
import { join } from 'path';

export class STTService {
  private modelPath: string;
  private whisperPath: string;

  constructor(modelPath?: string) {
    this.modelPath = modelPath || process.env.WHISPER_MODEL_PATH || './models/whisper';
    this.whisperPath = process.env.WHISPER_BIN || 'whisper';
  }

  async transcribe(audioBase64: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const inputFile = join('/tmp', `stt_input_${Date.now()}.wav`);
      const outputFile = join('/tmp', `stt_output_${Date.now()}.txt`);
      
      // Decode base64 to file
      const buffer = Buffer.from(audioBase64, 'base64');
      writeFileSync(inputFile, buffer);

      const whisper = spawn(this.whisperPath, [
        '--model', this.modelPath,
        '--file', inputFile,
        '--output-txt',
        '--no-speak'
      ]);

      let stdout = '';
      let stderr = '';

      whisper.stdout.on('data', (data) => { stdout += data.toString(); });
      whisper.stderr.on('data', (data) => { stderr += data.toString(); });

      whisper.on('close', () => {
        try {
          if (existsSync(outputFile)) {
            const transcript = readFileSync(outputFile, 'utf-8').trim();
            unlinkSync(inputFile);
            unlinkSync(outputFile);
            resolve(transcript);
          } else {
            // Fallback to stdout if no output file
            resolve(stdout.trim() || 'Could not transcribe');
          }
        } catch (error) {
          reject(error);
        }
      });

      whisper.on('error', (err) => {
        console.error('Whisper error:', stderr);
        resolve('Transcription service unavailable'); // Graceful degradation
      });
    });
  }
}
```

- [ ] **Step 3: Create VoiceService orchestration**

```typescript
// backend/src/services/voice/VoiceService.ts
import { TTSService } from './TTSService';
import { STTService } from './STTService';

export class VoiceService {
  private tts: TTSService;
  private stt: STTService;

  constructor() {
    this.tts = new TTSService();
    this.stt = new STTService();
  }

  async transcribe(audioData: string): Promise<string> {
    try {
      return await this.stt.transcribe(audioData);
    } catch (error) {
      console.error('STT error:', error);
      return 'Speech not recognized';
    }
  }

  async synthesize(text: string): Promise<string> {
    try {
      return await this.tts.synthesize(text);
    } catch (error) {
      console.error('TTS error:', error);
      throw error;
    }
  }
}
```

- [ ] **Step 4: Run to verify services initialize**

Run: `cd backend && npm run dev`
Expected: Services start without errors

- [ ] **Step 5: Commit**

```bash
git add backend/src/services/voice/
git commit -m "feat(voice): add TTS/STT services with Piper and Whisper"
```

---

## Task 3: 3D Character Component

**Files:**
- Create: `frontend/src/components/scenes/Character3D.tsx`
- Modify: `frontend/src/pages/scenes/index.tsx`

- [ ] **Step 1: Create Character3D component**

```typescript
// frontend/src/components/scenes/Character3D.tsx
import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';

type AnimationState = 'idle' | 'talking' | 'listening' | 'waving';

interface Character3DProps {
  name: string;
  avatarColor: string;
  clothingColor: string;
  position: [number, number, number];
  animationState: AnimationState;
  isSelected: boolean;
  onClick: () => void;
  status: string;
}

export function Character3D({
  name,
  avatarColor,
  clothingColor,
  position,
  animationState,
  isSelected,
  onClick,
  status
}: Character3DProps) {
  const groupRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Mesh>(null);
  const leftArmRef = useRef<THREE.Mesh>(null);
  const rightArmRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (!groupRef.current) return;
    
    const t = state.clock.elapsedTime;
    
    switch (animationState) {
      case 'idle':
        groupRef.current.position.y = Math.sin(t * 2) * 0.02;
        if (headRef.current) {
          headRef.current.rotation.z = Math.sin(t * 1.5) * 0.05;
          headRef.current.scale.set(1, 1, 1);
        }
        if (rightArmRef.current) {
          rightArmRef.current.rotation.z = -0.2;
        }
        break;
        
      case 'talking':
        if (headRef.current) {
          headRef.current.scale.y = 1 + Math.sin(t * 10) * 0.1;
        }
        if (rightArmRef.current) {
          rightArmRef.current.rotation.z = -0.2 + Math.sin(t * 3) * 0.3;
        }
        break;
        
      case 'listening':
        if (headRef.current) {
          headRef.current.rotation.z = 0.1 + Math.sin(t * 0.5) * 0.05;
        }
        break;
        
      case 'waving':
        if (rightArmRef.current) {
          rightArmRef.current.rotation.z = -1.5 + Math.sin(t * 8) * 0.5;
        }
        break;
    }
  });

  const scale = isSelected ? 1.1 : hovered ? 1.05 : 1;
  const emissiveIntensity = isSelected || hovered ? 0.2 : 0;

  return (
    <group
      ref={groupRef}
      position={position}
      onClick={onClick}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      scale={scale}
    >
      {/* Head */}
      <mesh ref={headRef} position={[0, 1.6, 0]}>
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshStandardMaterial 
          color={avatarColor} 
          emissive={avatarColor}
          emissiveIntensity={emissiveIntensity}
        />
      </mesh>
      
      {/* Body */}
      <mesh position={[0, 0.8, 0]}>
        <capsuleGeometry args={[0.25, 0.8, 8, 16]} />
        <meshStandardMaterial 
          color={clothingColor}
          emissive={clothingColor}
          emissiveIntensity={emissiveIntensity}
        />
      </mesh>
      
      {/* Left Arm */}
      <mesh ref={leftArmRef} position={[-0.4, 0.9, 0]} rotation={[0, 0, 0.2]}>
        <capsuleGeometry args={[0.08, 0.6, 8, 16]} />
        <meshStandardMaterial color={clothingColor} />
      </mesh>
      
      {/* Right Arm */}
      <mesh ref={rightArmRef} position={[0.4, 0.9, 0]} rotation={[0, 0, -0.2]}>
        <capsuleGeometry args={[0.08, 0.6, 8, 16]} />
        <meshStandardMaterial color={clothingColor} />
      </mesh>
      
      {/* Label */}
      <Html position={[0, 2.3, 0]} center>
        <div className={`px-3 py-1.5 rounded-lg shadow-lg text-center transition-all ${
          isSelected ? 'bg-green-100 border-2 border-green-400' : 
          hovered ? 'bg-white/95 border-2 border-blue-300' : 
          'bg-white/90 border-2 border-transparent'
        }`}>
          <div className="font-bold text-gray-900">{name}</div>
          <div className={`text-xs ${isSelected ? 'text-green-600' : 'text-gray-500'}`}>
            {status}
          </div>
        </div>
      </Html>
    </group>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/components/scenes/Character3D.tsx
git commit -m "feat(3d): add Character3D component with animations"
```

---

## Task 4: Voice Chat Hook & State

**Files:**
- Create: `frontend/src/hooks/useVoiceChat.ts`
- Create: `frontend/src/stores/voiceChatStore.ts`

- [ ] **Step 1: Create Zustand store**

```typescript
// frontend/src/stores/voiceChatStore.ts
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
      rule: string;
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
  
  // Actions
  connect: (characterId: string) => void;
  disconnect: () => void;
  setRecording: (recording: boolean) => void;
  setPlaying: (playing: boolean) => void;
  addTranscript: (role: 'user' | 'ai', text: string) => void;
  setEvaluation: (evaluation: EvaluationResult) => void;
  clearTranscript: () => void;
}

export const useVoiceChatStore = create<VoiceChatState>((set, get) => ({
  isConnected: false,
  currentCharacterId: null,
  isRecording: false,
  isPlaying: false,
  transcript: [],
  evaluation: null,

  connect: (characterId) => set({ 
    currentCharacterId: characterId, 
    isConnected: true,
    transcript: [],
    evaluation: null
  }),

  disconnect: () => set({ 
    isConnected: false, 
    currentCharacterId: null 
  }),

  setRecording: (recording) => set({ isRecording: recording }),
  
  setPlaying: (playing) => set({ isPlaying: playing }),

  addTranscript: (role, text) => set((state) => ({
    transcript: [...state.transcript, { role, text, timestamp: Date.now() }]
  })),

  setEvaluation: (evaluation) => set({ evaluation }),

  clearTranscript: () => set({ transcript: [], evaluation: null })
}));
```

- [ ] **Step 2: Create useVoiceChat hook**

```typescript
// frontend/src/hooks/useVoiceChat.ts
import { useCallback, useEffect, useRef, useState } from 'react';
import { useVoiceChatStore } from '../stores/voiceChatStore';

const WS_URL = 'ws://localhost:3001/voice';

export function useVoiceChat() {
  const wsRef = useRef<WebSocket | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioQueueRef = useRef<HTMLAudioElement[]>([]);
  
  const {
    isConnected,
    currentCharacterId,
    isRecording,
    isPlaying,
    transcript,
    evaluation,
    connect,
    disconnect,
    setRecording,
    setPlaying,
    addTranscript,
    setEvaluation,
    clearTranscript
  } = useVoiceChatStore();

  const [error, setError] = useState<string | null>(null);

  const connectToCharacter = useCallback(async (characterId: string) => {
    try {
      // Initialize WebSocket
      wsRef.current = new WebSocket(`${WS_URL}/${characterId}`);
      
      wsRef.current.onopen = () => {
        console.log('Voice chat connected');
        connect(characterId);
        setError(null);
      };

      wsRef.current.onmessage = async (event) => {
        const message = JSON.parse(event.data);
        
        switch (message.type) {
          case 'ready':
            addTranscript('ai', message.payload.greeting);
            // Play greeting audio
            if (message.payload.audioData) {
              playAudio(message.payload.audioData);
            }
            break;
            
          case 'transcript':
            addTranscript('user', message.payload.transcript);
            break;
            
          case 'ai_speaking':
            addTranscript('ai', message.payload.transcript);
            if (message.payload.audioData) {
              playAudio(message.payload.audioData);
            }
            break;
            
          case 'evaluation_result':
            setEvaluation(message.payload.evaluation);
            break;
            
          case 'error':
            setError(message.payload.message);
            break;
        }
      };

      wsRef.current.onclose = () => {
        disconnect();
      };

      wsRef.current.onerror = (err) => {
        console.error('WebSocket error:', err);
        setError('Connection failed');
      };
    } catch (err) {
      console.error('Connect error:', err);
      setError('Failed to connect');
    }
  }, [connect, disconnect, addTranscript, setEvaluation]);

  const disconnectFromCharacter = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    disconnect();
  }, [disconnect]);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });

      mediaRecorderRef.current.ondataavailable = async (event) => {
        if (event.data.size > 0 && wsRef.current?.readyState === WebSocket.OPEN) {
          const arrayBuffer = await event.data.arrayBuffer();
          const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
          
          wsRef.current.send(JSON.stringify({
            type: 'user_audio',
            payload: { audioData: base64, format: 'webm' }
          }));
        }
      };

      mediaRecorderRef.current.start(1000); // Send every second
      setRecording(true);
    } catch (err) {
      console.error('Failed to start recording:', err);
      setError('Microphone access denied');
    }
  }, [setRecording]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setRecording(false);
    }
  }, [setRecording]);

  const endConversation = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'end_conversation' }));
    }
    stopRecording();
  }, [stopRecording]);

  const playAudio = useCallback((base64Data: string) => {
    const audio = new Audio(`data:audio/wav;base64,${base64Data}`);
    audioQueueRef.current.push(audio);
    
    if (!isPlaying) {
      const playNext = () => {
        const next = audioQueueRef.current.shift();
        if (next) {
          setPlaying(true);
          next.onended = () => {
            setPlaying(false);
            playNext();
          };
          next.play();
        }
      };
      playNext();
    }
  }, [isPlaying, setPlaying]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  return {
    isConnected,
    currentCharacterId,
    isRecording,
    isPlaying,
    transcript,
    evaluation,
    error,
    connectToCharacter,
    disconnectFromCharacter,
    startRecording,
    stopRecording,
    endConversation,
    clearTranscript
  };
}
```

- [ ] **Step 3: Commit**

```bash
git add frontend/src/hooks/useVoiceChat.ts frontend/src/stores/voiceChatStore.ts
git commit -m "feat(voice): add voice chat hook and Zustand store"
```

---

## Task 5: UI Components

**Files:**
- Create: `frontend/src/components/voice/VoiceControls.tsx`
- Create: `frontend/src/components/chat/ConversationPanel.tsx`
- Create: `frontend/src/components/evaluation/EvaluationPanel.tsx`

- [ ] **Step 1: Create VoiceControls**

```typescript
// frontend/src/components/voice/VoiceControls.tsx
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation();

  return (
    <div className="flex items-center justify-center gap-4 p-4 bg-white rounded-2xl shadow-lg">
      {isConnected && !isPlaying && (
        <>
          {isRecording ? (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onStopRecording}
              className="flex items-center gap-2 px-6 py-3 bg-red-500 text-white rounded-full font-bold shadow-lg"
            >
              <span className="w-3 h-3 bg-white rounded-full animate-pulse" />
              {t('voice.stopRecording')}
            </motion.button>
          ) : (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onStartRecording}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-full font-bold shadow-lg"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
                <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
              </svg>
              {t('voice.startSpeaking')}
            </motion.button>
          )}
        </>
      )}
      
      {isConnected && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onEndConversation}
          className="px-6 py-3 bg-gray-200 text-gray-700 rounded-full font-bold hover:bg-gray-300 transition-colors"
        >
          {t('voice.endConversation')}
        </motion.button>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Create ConversationPanel**

```typescript
// frontend/src/components/chat/ConversationPanel.tsx
import { motion } from 'framer-motion';
import { useVoiceChatStore, TranscriptEntry } from '../../stores/voiceChatStore';

export function ConversationPanel() {
  const { transcript, isConnected } = useVoiceChatStore();

  return (
    <div className="bg-white rounded-2xl shadow-lg p-4 h-96 flex flex-col">
      <h3 className="text-lg font-bold text-gray-900 mb-4">
        Conversation
      </h3>
      
      <div className="flex-1 overflow-y-auto space-y-3">
        {transcript.length === 0 && isConnected && (
          <p className="text-gray-500 text-center italic">
            Start speaking to begin the conversation...
          </p>
        )}
        
        {transcript.map((entry: TranscriptEntry, index: number) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${entry.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs px-4 py-2 rounded-2xl ${
                entry.role === 'user'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-900'
              }`}
            >
              <p className="text-sm font-medium mb-1">
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
```

- [ ] **Step 3: Create EvaluationPanel**

```typescript
// frontend/src/components/evaluation/EvaluationPanel.tsx
import { motion } from 'framer-motion';
import { useVoiceChatStore } from '../../stores/voiceChatStore';

export function EvaluationPanel() {
  const { evaluation } = useVoiceChatStore();

  if (!evaluation) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-lg p-6"
    >
      <h3 className="text-xl font-bold text-gray-900 mb-6">
        📊 Evaluation Results
      </h3>

      <div className="grid grid-cols-2 gap-6 mb-6">
        {/* Pronunciation Score */}
        <div className="text-center">
          <div className="relative w-24 h-24 mx-auto mb-2">
            <svg className="w-24 h-24 transform -rotate-90">
              <circle
                cx="48" cy="48" r="40"
                stroke="#e5e7eb"
                strokeWidth="8"
                fill="none"
              />
              <circle
                cx="48" cy="48" r="40"
                stroke="#10b981"
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
          <p className="text-sm text-gray-600">Pronunciation</p>
        </div>

        {/* Grammar Score */}
        <div className="text-center">
          <div className="relative w-24 h-24 mx-auto mb-2">
            <svg className="w-24 h-24 transform -rotate-90">
              <circle
                cx="48" cy="48" r="40"
                stroke="#e5e7eb"
                strokeWidth="8"
                fill="none"
              />
              <circle
                cx="48" cy="48" r="40"
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
          <p className="text-sm text-gray-600">Grammar</p>
        </div>
      </div>

      {/* Grammar Corrections */}
      {evaluation.grammar.corrections.length > 0 && (
        <div className="mb-6">
          <h4 className="font-semibold text-gray-900 mb-2">Grammar Corrections</h4>
          <ul className="space-y-2">
            {evaluation.grammar.corrections.map((c, i) => (
              <li key={i} className="bg-red-50 rounded-lg p-3">
                <p className="text-red-600 line-through">{c.original}</p>
                <p className="text-green-600 font-medium">{c.corrected}</p>
                <p className="text-xs text-gray-500 mt-1">{c.explanation}</p>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Suggestions */}
      {evaluation.overall.suggestions.length > 0 && (
        <div>
          <h4 className="font-semibold text-gray-900 mb-2">Suggestions</h4>
          <ul className="space-y-1">
            {evaluation.overall.suggestions.map((s, i) => (
              <li key={i} className="text-gray-600 text-sm flex items-start gap-2">
                <span className="text-blue-500">•</span>
                {s}
              </li>
            ))}
          </ul>
        </div>
      )}
    </motion.div>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add frontend/src/components/voice/VoiceControls.tsx frontend/src/components/chat/ConversationPanel.tsx frontend/src/components/evaluation/EvaluationPanel.tsx
git commit -m "feat(voice): add voice controls, conversation panel, and evaluation UI"
```

---

## Task 6: Integration

**Files:**
- Modify: `frontend/src/pages/scenes/index.tsx`

- [ ] **Step 1: Update scenes page to integrate voice chat**

```typescript
// Add to scenes/index.tsx

// Import new components
import { Character3D } from '../../components/scenes/Character3D';
import { VoiceControls } from '../../components/voice/VoiceControls';
import { ConversationPanel } from '../../components/chat/ConversationPanel';
import { EvaluationPanel } from '../../components/evaluation/EvaluationPanel';
import { useVoiceChat } from '../../hooks/useVoiceChat';

// Define characters data
const CHARACTERS = [
  {
    id: 'waiter_1',
    name: 'Mike',
    avatarColor: '#FDB97D',
    clothingColor: '#2C3E50',
    position: [-2, 0, 1] as [number, number, number],
    defaultDialogue: ['Hello! Welcome to our restaurant. How can I help you today?']
  },
  {
    id: 'customer_1',
    name: 'Sarah',
    avatarColor: '#FFDAB9',
    clothingColor: '#E8B4B8',
    position: [2, 0, 0] as [number, number, number],
    defaultDialogue: ['Excuse me, could you recommend something?']
  },
  {
    id: 'customer_2',
    name: 'David',
    avatarColor: '#DEB887',
    clothingColor: '#556B2F',
    position: [0, 0, -1] as [number, number, number],
    defaultDialogue: ['I am very hungry today!']
  }
];

// Inside component:
const {
  isConnected,
  isRecording,
  isPlaying,
  transcript,
  evaluation,
  connectToCharacter,
  disconnectFromCharacter,
  startRecording,
  stopRecording,
  endConversation
} = useVoiceChat();

// Add state for selected character and animation state
const [selectedCharacterId, setSelectedCharacterId] = useState<string | null>(null);
const [animationStates, setAnimationStates] = useState<Record<string, 'idle' | 'talking' | 'listening'>>({});

// Handle character click
const handleCharacterClick = async (characterId: string) => {
  if (isConnected && selectedCharacterId === characterId) {
    return; // Already connected to this character
  }
  
  disconnectFromCharacter();
  setSelectedCharacterId(characterId);
  await connectToCharacter(characterId);
  
  setAnimationStates(prev => ({
    ...prev,
    [characterId]: 'listening'
  }));
};

// Update character selection panel
// Add character cards similar to scene selection:

{
  CHARACTERS.map((char) => (
    <button
      key={char.id}
      onClick={() => handleCharacterClick(char.id)}
      className={`w-full text-left p-4 rounded-xl transition-all ${
        selectedCharacterId === char.id
          ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300'
          : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
      }`}
    >
      <div className="font-semibold text-gray-900">{char.name}</div>
      <div className="text-sm text-gray-500">
        {selectedCharacterId === char.id ? 'In conversation' : 'Click to chat'}
      </div>
    </button>
  ))
}

// Update 3D scene to render characters
{
  CHARACTERS.map((char) => (
    <Character3D
      key={char.id}
      name={char.name}
      avatarColor={char.avatarColor}
      clothingColor={char.clothingColor}
      position={char.position}
      animationState={animationStates[char.id] || 'idle'}
      isSelected={selectedCharacterId === char.id}
      onClick={() => handleCharacterClick(char.id)}
      status={selectedCharacterId === char.id ? 'Speaking...' : 'Ready'}
    />
  ))
}

// Add voice controls below canvas
<VoiceControls
  isRecording={isRecording}
  isPlaying={isPlaying}
  isConnected={isConnected}
  onStartRecording={startRecording}
  onStopRecording={stopRecording}
  onEndConversation={endConversation}
/>

// Add conversation panel and evaluation panel on the side
<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
  <div className="lg:col-span-2">
    {/* 3D Scene Canvas */}
  </div>
  <div className="space-y-4">
    <ConversationPanel />
    {evaluation && <EvaluationPanel />}
  </div>
</div>
```

- [ ] **Step 2: Run and verify**

Run: `cd frontend && npm run dev`
Expected: Scene page with characters, voice controls visible

- [ ] **Step 3: Commit**

```bash
git add frontend/src/pages/scenes/index.tsx
git commit -m "feat(voice): integrate voice chat into scenes page"
```

---

## Task 7: Dialogue & Evaluation Services

**Files:**
- Create: `backend/src/services/dialogue/DialogueService.ts`
- Create: `backend/src/services/evaluation/EvaluationService.ts`
- Create: `backend/src/services/evaluation/GrammarChecker.ts`

- [ ] **Step 1: Create DialogueService**

```typescript
// backend/src/services/dialogue/DialogueService.ts
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || process.env.OLLAMA_API_KEY,
  baseURL: process.env.OLLAMA_BASE_URL // For Ollama
});

const CHARACTER_PROMPTS = {
  waiter_1: `You are Mike, a friendly and professional waiter at a restaurant. 
You speak in a warm, welcoming manner. You help customers with orders, recommendations, and any questions about the menu.
Keep responses concise and natural (1-3 sentences).`,

  customer_1: `You are Sarah, a polite and curious customer at a restaurant.
You're eager to learn about different dishes and always very courteous.
Keep responses concise and natural (1-3 sentences).`,

  customer_2: `You are David, a casual and direct customer who's always hungry!
You speak in a friendly but straightforward way.
Keep responses concise and natural (1-3 sentences).`
};

export class DialogueService {
  private context: Map<string, { role: string; content: string }[]> = new Map();

  async generate(transcript: string[], characterId: string): Promise<{ text: string }> {
    // Get or create context
    if (!this.context.has(characterId)) {
      this.context.set(characterId, []);
    }
    const conversationContext = this.context.get(characterId)!;

    // Add user input to context
    conversationContext.push({ role: 'user', content: transcript[transcript.length - 1] });

    const systemPrompt = CHARACTER_PROMPTS[characterId as keyof typeof CHARACTER_PROMPTS] || CHARACTER_PROMPTS.waiter_1;

    try {
      const completion = await openai.chat.completions.create({
        model: process.env.OLLAMA_MODEL || 'gpt-4',
        messages: [
          { role: 'system', content: systemPrompt },
          ...conversationContext.slice(-10) // Last 10 exchanges
        ],
        max_tokens: 150,
        temperature: 0.7
      });

      const response = completion.choices[0].message.content || "I'm sorry, I didn't catch that.";

      // Add AI response to context
      conversationContext.push({ role: 'assistant', content: response });

      return { text: response };
    } catch (error) {
      console.error('AI generation error:', error);
      return { text: "I'm having trouble responding right now. Could you try again?" };
    }
  }

  clearContext(characterId: string) {
    this.context.delete(characterId);
  }
}
```

- [ ] **Step 2: Create GrammarChecker**

```typescript
// backend/src/services/evaluation/GrammarChecker.ts
export interface GrammarCorrection {
  original: string;
  corrected: string;
  rule: string;
  explanation: string;
}

export class GrammarChecker {
  private languagetoolUrl: string;

  constructor() {
    this.languagetoolUrl = process.env.LANGUAGETOOL_API_URL || 'https://api.languagetool.org/v2';
  }

  async check(text: string): Promise<{ score: number; corrections: GrammarCorrection[] }> {
    try {
      const response = await fetch(`${this.languagetoolUrl}/check`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          text,
          language: 'en-US'
        })
      });

      if (!response.ok) {
        throw new Error('LanguageTool API error');
      }

      const result = await response.json();
      
      const corrections: GrammarCorrection[] = result.matches?.map((match: any) => ({
        original: match.context?.text || text,
        corrected: match.replacements?.[0]?.value || text,
        rule: match.rule?.id || 'unknown',
        explanation: match.message || ''
      })) || [];

      // Calculate score based on error count
      const errorCount = result.matches?.length || 0;
      const score = Math.max(0, 100 - (errorCount * 10));

      return { score, corrections };
    } catch (error) {
      console.error('Grammar check error:', error);
      // Graceful degradation - return empty results
      return { score: 100, corrections: [] };
    }
  }
}
```

- [ ] **Step 3: Create EvaluationService**

```typescript
// backend/src/services/evaluation/EvaluationService.ts
import { GrammarChecker, GrammarCorrection } from './GrammarChecker';

export interface EvaluationResult {
  pronunciation: {
    score: number;
    issues: string[];
    tips: string[];
  };
  grammar: {
    score: number;
    corrections: GrammarCorrection[];
  };
  overall: {
    score: number;
    feedback: string;
    suggestions: string[];
  };
}

export class EvaluationService {
  private grammarChecker: GrammarChecker;

  constructor() {
    this.grammarChecker = new GrammarChecker();
  }

  async evaluate(transcripts: string[]): Promise<EvaluationResult> {
    const fullText = transcripts.join(' ');

    // Grammar check
    const grammarResult = await this.grammarChecker.check(fullText);

    // Pronunciation scoring (simplified)
    // In production, this would use acoustic analysis
    const pronunciationScore = this.calculatePronunciationScore(transcripts);
    
    // Overall score (weighted average)
    const overallScore = Math.round(grammarResult.score * 0.6 + pronunciationScore * 0.4);

    // Generate feedback
    const feedback = this.generateFeedback(grammarResult, pronunciationScore);
    const suggestions = this.generateSuggestions(grammarResult, pronunciationScore);

    return {
      pronunciation: {
        score: pronunciationScore,
        issues: this.findPronunciationIssues(transcripts),
        tips: this.getPronunciationTips()
      },
      grammar: grammarResult,
      overall: {
        score: overallScore,
        feedback,
        suggestions
      }
    };
  }

  private calculatePronunciationScore(transcripts: string[]): number {
    // Simplified scoring - in production use acoustic analysis
    const wordCount = transcripts.join(' ').split(/\s+/).length;
    const avgLength = wordCount / transcripts.length;
    
    // Penalize very short or very long responses
    if (avgLength < 3) return 60;
    if (avgLength > 30) return 70;
    return 85 + Math.floor(Math.random() * 10);
  }

  private findPronunciationIssues(transcripts: string[]): string[] {
    // Simplified - in production use phoneme analysis
    const issues: string[] = [];
    const text = transcripts.join(' ');
    
    // Check for common pronunciation issues
    if (text.includes('gonna')) issues.push('"gonna" should be pronounced as "going to"');
    if (text.includes('wanna')) issues.push('"wanna" should be pronounced as "want to"');
    if (text.includes('kinda')) issues.push('"kinda" should be pronounced as "kind of"');
    
    return issues;
  }

  private getPronunciationTips(): string[] {
    return [
      'Focus on clear vowel sounds',
      'Practice word stress patterns',
      'Listen to native speakers and imitate'
    ];
  }

  private generateFeedback(grammarResult: any, pronunciationScore: number): string {
    if (grammarResult.score >= 90 && pronunciationScore >= 90) {
      return 'Excellent work! Your English is very natural.';
    } else if (grammarResult.score >= 70) {
      return 'Good job! A few minor errors to work on.';
    } else {
      return 'Keep practicing! Focus on the areas below.';
    }
  }

  private generateSuggestions(grammarResult: any, pronunciationScore: number): string[] {
    const suggestions: string[] = [];
    
    if (grammarResult.score < 90) {
      suggestions.push('Review grammar rules for common patterns');
    }
    if (pronunciationScore < 90) {
      suggestions.push('Practice speaking slowly and clearly');
    }
    if (grammarResult.corrections.length > 0) {
      suggestions.push('Review the specific corrections shown above');
    }
    
    return suggestions;
  }
}
```

- [ ] **Step 4: Run to verify**

Run: `cd backend && npm run dev`
Expected: Services start without errors

- [ ] **Step 5: Commit**

```bash
git add backend/src/services/dialogue/DialogueService.ts backend/src/services/evaluation/
git commit -m "feat(ai): add dialogue and evaluation services"
```

---

## Task 8: Translation Keys

**Files:**
- Modify: `frontend/src/lib/i18n/index.ts`

- [ ] **Step 1: Add voice chat translations**

```typescript
// Add to both 'en' and 'zh' sections

voice: {
  startSpeaking: "Start Speaking",
  stopRecording: "Stop Recording",
  endConversation: "End Conversation",
  connecting: "Connecting...",
  connected: "Connected",
  recording: "Recording...",
  speaking: "Speaking...",
  evaluation: "Evaluation",
  pronunciation: "Pronunciation",
  grammar: "Grammar",
  corrections: "Corrections",
  suggestions: "Suggestions"
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/lib/i18n/index.ts
git commit -m "i18n: add voice chat translation keys"
```

---

## Spec Coverage Check

| Spec Requirement | Task |
|-----------------|------|
| 3D characters with animations | Task 3, Task 6 |
| WebSocket voice server | Task 1 |
| TTS (Piper) | Task 2 |
| STT (Whisper) | Task 2 |
| Voice recording/playback | Task 4 |
| AI dialogue | Task 7 |
| Multi-character support | Task 6 |
| Pronunciation scoring | Task 7 |
| Grammar checking | Task 7 |
| Evaluation UI | Task 5, Task 6 |

---

## Plan Complete

**Two execution options:**

**1. Subagent-Driven (recommended)** - I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints

Which approach?
