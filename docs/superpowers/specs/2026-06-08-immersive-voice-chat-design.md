---
comet_change: immersive-voice-chat
role: technical-design
canonical_spec: openspec
---

# Immersive Voice Chat - Technical Design

## 1. Overview

This document describes the technical design for implementing an immersive multi-character voice chat system in the Lingua Journey language learning platform. The system enables users to practice real conversations with AI-powered characters in a 3D restaurant scene.

## 2. Architecture

### 2.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              CLIENT (Browser)                             │
├─────────────────────────────────────────────────────────────────────────┤
│  ┌───────────────────┐  ┌───────────────────┐  ┌───────────────────┐  │
│  │   Scene3D         │  │   VoiceManager    │  │   UI Components  │  │
│  │                   │  │                   │  │                   │  │
│  │  • Characters     │  │  • MediaRecorder  │  │  • ChatPanel     │  │
│  │  • Animations     │  │  • WebSocket     │  │  • VoiceControls │  │
│  │  • Labels         │  │  • Audio Playback │  │  • Evaluation    │  │
│  └───────────────────┘  └───────────────────┘  └───────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
                    │ WebSocket (ws://localhost:3001)
                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                     SERVER (Node.js - Port 3001)                         │
├─────────────────────────────────────────────────────────────────────────┤
│  ┌───────────────────┐  ┌───────────────────┐  ┌───────────────────┐  │
│  │  VoiceServer     │  │  VoiceServices    │  │  DialogueService  │  │
│  │  • Connection   │  │  • TTS (Piper)   │  │  • AI Response   │  │
│  │  • Room Mgmt    │  │  • STT (Whisper) │  │  • Character Ctx│  │
│  └───────────────────┘  └───────────────────┘  └───────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
```

### 2.2 Technology Stack

| Component | Technology | Version | Rationale |
|-----------|------------|---------|-----------|
| 3D Engine | React Three Fiber | latest | Already in use |
| Animation | Procedural (useFrame) | - | Lightweight, no external models |
| WebSocket | ws | latest | Lightweight Node.js WS |
| TTS | Piper | 1.0.0 | Open source, fast, lightweight (~100MB) |
| STT | Whisper.cpp | 1.5.0 | Open source, accurate |
| AI Dialogue | OpenAI GPT-4 / Ollama | - | Flexible |
| Grammar Check | LanguageTool | API | Open source grammar API |
| Pronunciation | Speech Scoring API | - | Professional scoring |

## 3. Component Design

### 3.1 Frontend Components

#### VoiceManager

Manages voice recording, playback, and WebSocket communication.

```typescript
interface VoiceManager {
  // State
  isRecording: boolean;
  isPlaying: boolean;
  currentCharacter: Character | null;
  transcript: TranscriptEntry[];
  evaluation: EvaluationResult | null;
  
  // Methods
  connect(characterId: string): void;
  disconnect(): void;
  startRecording(): void;
  stopRecording(): void;
  playAudio(base64: string): void;
}
```

#### Character3D

3D character with procedural animations.

```typescript
interface Character3DProps {
  character: Character;
  animationState: AnimationState;
  onClick: () => void;
  isSelected: boolean;
}

type AnimationState = 'idle' | 'talking' | 'listening' | 'waving';
```

**Animation Specifications:**

| State | Head | Body | Arms |
|-------|------|------|------|
| idle | slight breathing (±0.02y) | breathing | arms down |
| talking | mouth movement (scale) | slight bounce | gestures |
| listening | head tilt | still | arms down |
| waving | facing forward | still | wave animation |

### 3.2 Backend Components

#### VoiceServer

WebSocket server handling real-time voice communication.

```typescript
class VoiceServer {
  constructor(port: number);
  
  // Events
  onConnection(client: WSClient): void;
  onMessage(client: WSClient, message: ClientMessage): void;
  onDisconnect(client: WSClient): void;
  
  // Message Types
  // Client → Server: start_conversation, user_audio, end_conversation
  // Server → Client: ready, ai_speaking, transcript, evaluation_result
}

interface WSClient {
  id: string;
  ws: WebSocket;
  characterId: string;
  transcript: string[];
  context: DialogueContext;
}
```

#### TTSService (Piper)

```typescript
class TTSService {
  constructor(modelPath: string);
  
  synthesize(text: string): Promise<Buffer>;
  synthesizeStream(text: string): ReadableStream;
}
```

#### STTService (Whisper)

```typescript
class STTService {
  constructor(modelPath: string);
  
  transcribe(audioBuffer: Buffer): Promise<TranscriptionResult>;
  transcribeStream(audioStream: ReadableStream): AsyncGenerator<TranscriptionResult>;
}
```

#### EvaluationService

```typescript
interface EvaluationResult {
  pronunciation: {
    score: number;        // 0-100
    issues: string[];
    tips: string[];
  };
  grammar: {
    score: number;        // 0-100
    corrections: GrammarCorrection[];
  };
  overall: {
    score: number;
    feedback: string;
    suggestions: string[];
  };
}

interface GrammarCorrection {
  original: string;
  corrected: string;
  rule: string;
  explanation: string;
}
```

## 4. Data Flow

### 4.1 Conversation Flow

```
1. User clicks character
   Client → Server: { type: 'start_conversation', characterId: 'waiter_1' }
   Server → Client: { type: 'ready' }

2. AI greets (TTS)
   Server → Client: { type: 'ai_speaking', audioData: '<base64>' }
   Client plays audio

3. User speaks (STT)
   Client → Server: { type: 'user_audio', audioData: '<base64>' }
   Server → Client: { type: 'transcript', transcript: 'I would like...' }

4. AI responds
   Server → Client: { type: 'ai_speaking', audioData: '<base64>' }

5. Repeat 3-4 until end

6. User ends
   Client → Server: { type: 'end_conversation' }
   Server → Client: { type: 'evaluation_result', evaluation: {...} }
```

### 4.2 Audio Processing Pipeline

```
User Speech                    AI Response
     │                              │
     ▼                              ▼
┌─────────┐                  ┌─────────┐
│ Media   │                  │ LLM     │
│Recorder │                  │ Output  │
└────┬────┘                  └────┬────┘
     │                            │
     │ base64                     │ text
     ▼                            ▼
┌─────────┐                  ┌─────────┐
│ Whisper │                  │ Piper   │
│ (STT)   │                  │ (TTS)   │
└────┬────┘                  └────┬────┘
     │                            │
     │ transcript                 │ audio
     ▼                            ▼
┌─────────┐                  ┌─────────┐
│Evaluation│                  │WebSocket│
│ Engine  │                  │ to Client│
└────┬────┘                  └─────────┘
     │
     │ evaluation
     ▼
```

## 5. Character Specification

### 5.1 Characters

| ID | Name | Role | Speech Style | Position |
|----|------|------|--------------|----------|
| waiter_1 | Mike | Waiter | Friendly, Professional | (-2, 0, 1) |
| customer_1 | Sarah | Customer | Polite, Curious | (2, 0, 0) |
| customer_2 | David | Customer | Casual, Direct | (0, 0, -1) |

### 5.2 Visual Design

**Character Structure:**
- Head: Sphere (radius 0.3)
- Body: Capsule (height 0.8, radius 0.25)
- Arms: Capsule (height 0.6, radius 0.08)

**Colors:**
| Character | Clothing Color | Avatar Color |
|-----------|--------------|-------------|
| Mike | #2C3E50 (dark blue) | #FDB97D (skin) |
| Sarah | #E8B4B8 (pink) | #FFDAB9 (skin) |
| David | #556B2F (olive) | #DEB887 (skin) |

### 5.3 Label Design

```
┌─────────────────────────┐
│  [Avatar]  Mike         │
│            Status: Ready │
└─────────────────────────┘
```

## 6. API Design

### 6.1 WebSocket Protocol

**Endpoint:** `ws://localhost:3001/voice/{characterId}`

**Client Messages:**

```typescript
interface StartConversation {
  type: 'start_conversation';
  payload: {
    language: string;  // 'en', 'zh', etc.
    userId: string;
  };
}

interface UserAudio {
  type: 'user_audio';
  payload: {
    audioData: string;  // base64 encoded
    format: 'mp3' | 'webm';
  };
}

interface EndConversation {
  type: 'end_conversation';
}
```

**Server Messages:**

```typescript
interface Ready {
  type: 'ready';
  payload: {
    characterId: string;
    greeting: string;
  };
}

interface AISpeaking {
  type: 'ai_speaking';
  payload: {
    audioData: string;  // base64 encoded
    transcript?: string;
  };
}

interface Transcript {
  type: 'transcript';
  payload: {
    transcript: string;
    confidence: number;
  };
}

interface EvaluationResult {
  type: 'evaluation_result';
  payload: EvaluationResult;
}
```

## 7. Implementation Phases

### Phase 1: Foundation
1. Set up WebSocket server on port 3001
2. Create Character3D component with animations
3. Integrate Piper TTS service
4. Basic audio playback

### Phase 2: Voice Features
5. Implement Whisper STT
6. WebSocket message handling
7. Multi-character support
8. Voice recording controls

### Phase 3: Intelligence
9. AI dialogue generation
10. Character-specific prompts
11. Conversation context management

### Phase 4: Evaluation
12. Grammar checking (LanguageTool)
13. Pronunciation scoring
14. Evaluation UI panel

## 8. File Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── scenes/
│   │   │   ├── Character3D.tsx
│   │   │   └── RestaurantScene.tsx
│   │   ├── voice/
│   │   │   ├── VoiceManager.tsx
│   │   │   ├── VoiceControls.tsx
│   │   │   └── AudioVisualizer.tsx
│   │   ├── chat/
│   │   │   ├── ConversationPanel.tsx
│   │   │   └── ChatMessage.tsx
│   │   └── evaluation/
│   │       ├── EvaluationPanel.tsx
│   │       └── ScoreDisplay.tsx
│   ├── hooks/
│   │   ├── useVoiceChat.ts
│   │   └── useWebSocket.ts
│   ├── stores/
│   │   └── voiceChatStore.ts
│   └── pages/
│       └── scenes/
│           └── index.tsx

backend/
├── src/
│   ├── servers/
│   │   └── voiceServer.ts
│   ├── services/
│   │   ├── voice/
│   │   │   ├── VoiceService.ts
│   │   │   ├── TTSService.ts
│   │   │   └── STTService.ts
│   │   ├── dialogue/
│   │   │   └── DialogueService.ts
│   │   └── evaluation/
│   │       ├── EvaluationService.ts
│   │       ├── PronunciationScorer.ts
│   │       └── GrammarChecker.ts
│   └── entities/
│       ├── Character.ts
│       └── ConversationSession.ts
```

## 9. Configuration

### 9.1 Environment Variables

```env
# Voice Server
VOICE_SERVER_PORT=3001

# TTS (Piper)
PIPER_MODEL_PATH=/models/piper/en_US-lessac-medium.onnx

# STT (Whisper)
WHISPER_MODEL_PATH=/models/whisper/whisper.cpp

# AI
OPENAI_API_KEY=sk-...
# Or
OLLAMA_BASE_URL=http://localhost:11434

# Grammar Check
LANGUAGETOOL_API_URL=https://api.languagetool.org/v2
```

## 10. Testing Strategy

### 10.1 Unit Tests
- TTSService: synthesize() returns valid audio
- STTService: transcribe() returns text
- EvaluationService: evaluate() returns structured result

### 10.2 Integration Tests
- WebSocket connection and message flow
- End-to-end conversation: user audio → transcript → AI response → TTS

### 10.3 E2E Tests
- Complete conversation with evaluation
- Multi-character conversation
- Error handling (disconnection, etc.)
