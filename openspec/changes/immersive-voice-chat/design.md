# Immersive Voice Chat - Design

## 1. System Architecture

### 1.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                           CLIENT (Browser)                            │
├─────────────────────────────────────────────────────────────────────┤
│  ┌───────────────┐  ┌───────────────┐  ┌───────────────────────┐    │
│  │ 3D Scene      │  │ Voice Manager │  │ UI Components         │    │
│  │               │  │               │  │                       │    │
│  │ • Characters  │  │ • MediaRecorder│  │ • ChatPanel           │    │
│  │ • Animations  │  │ • WebSocket   │  │ • EvaluationResult    │    │
│  │ • Labels      │  │ • Audio Queue │  │ • CharacterStatus     │    │
│  └───────────────┘  └───────────────┘  └───────────────────────┘    │
│           │                │                      │                 │
│           └────────────────┼──────────────────────┘                 │
│                            ▼                                        │
│                   ┌───────────────┐                                 │
│                   │ State Manager │                                  │
│                   │ (Zustand)     │                                  │
│                   └───────────────┘                                 │
└─────────────────────────────────────────────────────────────────────┘
                             │ WebSocket (ws://)
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                          SERVER (Node.js)                            │
├─────────────────────────────────────────────────────────────────────┤
│  ┌───────────────┐  ┌───────────────┐  ┌───────────────────────┐    │
│  │ WebSocket     │  │ AI Service    │  │ Voice Service         │    │
│  │ Server        │  │               │  │                       │    │
│  │               │  │ • Ollama/     │  │ • TTS (Coqui/Piper)   │    │
│  │ • Connection  │  │   OpenAI      │  │ • STT (Whisper.cpp)   │    │
│  │ • Room Mgmt   │  │ • Dialogue    │  │ • Audio Processing    │    │
│  │ • Message     │  │   Generation  │  │                       │    │
│  │   Routing     │  │               │  │                       │    │
│  └───────────────┘  └───────────────┘  └───────────────────────┘    │
│                             │                                       │
│                             ▼                                       │
│                   ┌───────────────────────┐                         │
│                   │ Evaluation Engine     │                         │
│                   │                       │                         │
│                   │ • Pronunciation Score │                         │
│                   │ • Grammar Analysis   │                         │
│                   │ • Feedback Generator │                         │
│                   └───────────────────────┘                         │
└─────────────────────────────────────────────────────────────────────┘
```

### 1.2 Component Responsibilities

#### Client Components

| Component | Responsibility |
|-----------|---------------|
| `Scene3D` | Render 3D characters with animations |
| `Character` | Individual character with label, animation state |
| `VoiceManager` | Handle microphone, audio playback, WebSocket |
| `ChatPanel` | Display dialogue history and current conversation |
| `EvaluationPanel` | Show pronunciation/grammar feedback |

#### Server Components

| Component | Responsibility |
|-----------|---------------|
| `WebSocketServer` | Handle client connections, message routing |
| `VoiceService` | TTS/STT processing |
| `DialogueService` | AI conversation generation |
| `EvaluationService` | Pronunciation and grammar scoring |

## 2. 3D Character Design

### 2.1 Character Specification

```
┌─────────────────────────────────────────────────────────────────┐
│                    CHARACTER DESIGN                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                    CHARACTER 3D MODEL                     │    │
│  │                                                          │    │
│  │                      ┌─────┐                            │    │
│  │                      │HEAD │  ← Sphere/Box              │    │
│  │                      └─────┘                            │    │
│  │                        │                                │    │
│  │                     ┌───────┐                            │    │
│  │                     │  BODY │  ← Capsule/Cylinder        │    │
│  │                     └───────┘                            │    │
│  │                       │   │                              │    │
│  │                    ┌───┐ ┌───┐                           │    │
│  │                    │ARM│ │ARM│  ← Cylinders (animated)   │    │
│  │                    └───┘ └───┘                           │    │
│  │                       │                                 │    │
│  │                    ┌───┐ ┌───┐                          │    │
│  │                    │LEG│ │LEG│  ← Cylinders (animated)   │    │
│  │                    └───┘ └───┘                          │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                    UI OVERLAY                            │    │
│  │                                                          │    │
│  │   ┌──────────────────────────────────────────────┐     │    │
│  │   │  [Avatar]  waiter_john                       │     │    │
│  │   │            Status: Ready to help              │     │    │
│  │   └──────────────────────────────────────────────┘     │    │
│  │                                                          │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 Animation States

| State | Description | Trigger |
|-------|-------------|---------|
| `idle` | Standing, slight breathing motion | Default |
| `waving` | Arm wave animation | Greeting user |
| `talking` | Mouth movement, arm gestures | During speech |
| `listening` | Slight head tilt | Waiting for user |
| `thinking` | Subtle body movement | Processing response |
| `happy` | Jumping, arm raise | Positive feedback |

### 2.3 Character Data

```typescript
interface Character {
  id: string;
  name: string;
  role: 'waiter' | 'customer';
  personality: string;
  defaultDialogue: string[];
  speechStyle: 'formal' | 'casual' | 'friendly';
  avatar: string; // color or emoji
  position: { x: number; y: number; z: number };
  animationState: AnimationState;
}

const characters: Character[] = [
  {
    id: 'waiter_1',
    name: '服务员 Mike',
    role: 'waiter',
    personality: 'Professional, friendly, patient',
    defaultDialogue: [
      'Welcome to our restaurant! My name is Mike. How can I help you today?',
      'Would you like to see our menu?',
      'Our special today is the grilled salmon.',
      'How would you like your steak cooked?',
    ],
    speechStyle: 'friendly',
    avatar: '🧑‍🍳',
    position: { x: -2, y: 0, z: 1 },
  },
  {
    id: 'customer_1',
    name: '顾客 Sarah',
    role: 'customer',
    personality: 'Curious, polite, eager to learn',
    defaultDialogue: [
      'Excuse me, could you recommend something?',
      'I would like to order the chicken, please.',
      'Could I have the bill?',
    ],
    speechStyle: 'polite',
    avatar: '👩',
    position: { x: 2, y: 0, z: 0 },
  },
  {
    id: 'customer_2',
    name: '顾客 David',
    role: 'customer',
    personality: 'Direct, hungry,Impatient but friendly',
    defaultDialogue: [
      'I am very hungry today!',
      'What is the portion size here?',
      'This food is delicious!',
    ],
    speechStyle: 'casual',
    avatar: '👨',
    position: { x: 0, y: 0, z: -1 },
  },
];
```

## 3. Voice Conversation Flow

### 3.1 Conversation State Machine

```
┌─────────────────────────────────────────────────────────────────────┐
│                    CONVERSATION STATE MACHINE                        │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│    ┌──────────┐     click      ┌──────────────┐                   │
│    │  IDLE    │ ─────────────▶ │ SELECT_CHAR   │                   │
│    └──────────┘                └──────────────┘                   │
│                                       │                             │
│                                       ▼                             │
│                               ┌──────────────┐                     │
│                               │ CONNECTING    │                     │
│                               │ - Open WS     │                     │
│                               │ - Start STT   │                     │
│                               └──────────────┘                     │
│                                       │                             │
│                                       ▼                             │
│    ┌─────────────────────────────────────────────────────────┐      │
│    │                     IN_CONVERSATION                     │      │
│    │                                                          │      │
│    │   ┌─────────┐    user speaks    ┌─────────────┐         │      │
│    │   │ LISTENING│ ──────────────▶ │ PROCESSING  │         │      │
│    │   └─────────┘                  └─────────────┘         │      │
│    │          │                            │                  │      │
│    │          │                            ▼                  │      │
│    │          │                   ┌─────────────┐            │      │
│    │          │                   │ AI RESPONDING│           │      │
│    │          │                   │ - TTS play  │            │      │
│    │          │                   └─────────────┘            │      │
│    │          │                            │                  │      │
│    │          │◀──────────────────────────┘                  │      │
│    │          │                                               │      │
│    │          │              ┌─────────────┐                 │      │
│    │          └─────────────▶│ END_SESSION │                 │      │
│    │                 end     └─────────────┘                 │      │
│    │                                                          │      │
│    └─────────────────────────────────────────────────────────┘      │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### 3.2 WebSocket Message Protocol

```typescript
// Client → Server
interface ClientMessage {
  type: 'start_conversation' | 'user_speech' | 'end_conversation' | 'select_character';
  payload: {
    characterId?: string;
    audioData?: string; // base64
    transcript?: string;
    language?: string;
  };
}

// Server → Client
interface ServerMessage {
  type: 'conversation_started' | 'ai_speaking' | 'ai_thinking' | 'transcript' | 
        'evaluation_result' | 'conversation_ended' | 'error';
  payload: {
    characterId?: string;
    audioData?: string; // base64 TTS audio
    transcript?: string;
    evaluation?: EvaluationResult;
    message?: string;
  };
}

interface EvaluationResult {
  pronunciation: {
    score: number; // 0-100
    issues: string[];
  };
  grammar: {
    score: number; // 0-100
    corrections: {
      original: string;
      corrected: string;
      explanation: string;
    }[];
  };
  overall: {
    score: number;
    feedback: string;
    suggestions: string[];
  };
}
```

## 4. TTS/STT Integration

### 4.1 Open Source Stack

| Service | Technology | Pros | Cons |
|---------|------------|------|------|
| STT | Whisper.cpp | Accurate, offline | CPU intensive |
| TTS | Coqui XTTS | Natural voice | Large model |
| TTS Alt | Piper | Fast, lightweight | Less natural |
| Grammar | LanguageTool | Good accuracy | Online API |

### 4.2 Voice Processing Pipeline

```
User Speech                    AI Response
     │                              │
     ▼                              ▼
┌─────────┐                  ┌─────────┐
│Recorder │                  │ LLM     │
│(MediaRec)│                  │Output   │
└────┬────┘                  └────┬────┘
     │                            │
     │ base64                     │ text
     ▼                            ▼
┌─────────┐                  ┌─────────┐
│Whisper  │                  │ Piper   │
│(Server) │                  │ TTS     │
└────┬────┘                  └────┬────┘
     │                            │
     │ transcript                 │ audio
     ▼                            ▼
┌─────────┐                  ┌─────────┐
│Evaluation│                  │ WebSocket│
│ Engine  │                  │ to Client│
└────┬────┘                  └─────────┘
     │                            │
     │ evaluation                  │ play audio
     ▼                            ▼
```

## 5. Evaluation Engine

### 5.1 Pronunciation Scoring

```typescript
interface PronunciationEvaluation {
  score: number; // 0-100
  phonemeAnalysis: {
    phoneme: string;
    expected: string;
    actual: string;
    confidence: number;
  }[];
  issues: string[];
  tips: string[];
}

// Algorithm
1. Get transcript from Whisper
2. Compare phonemes using phonetic algorithm (Soundex/Metaphone)
3. Check stress patterns
4. Calculate overall score based on accuracy
```

### 5.2 Grammar Analysis

```typescript
interface GrammarEvaluation {
  score: number; // 0-100
  corrections: {
    original: string;
    corrected: string;
    rule: string;
    explanation: string;
  }[];
  feedback: string;
}

// Algorithm
1. Pass transcript to LanguageTool API
2. Parse response for errors
3. Categorize errors (verb tense, articles, prepositions, etc.)
4. Generate helpful feedback
```

## 6. UI Design

### 6.1 Layout

```
┌─────────────────────────────────────────────────────────────────────┐
│  [Logo]  3D场景学习                    [用户] [设置] [退出]            │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌─────────────────────────────────────────────┐  ┌───────────────┐ │
│  │                                             │  │               │ │
│  │              3D SCENE                       │  │  CONVERSATION │ │
│  │                                             │  │    PANEL      │ │
│  │    ┌─────┐                                 │  │               │ │
│  │    │Mike │  👋                             │  │  [Character]  │ │
│  │    │服务员│  ───                            │  │               │ │
│  │    └─────┘                                 │  │  Hello! How   │ │
│  │           👩 Sarah    👨 David             │  │  can I help   │ │
│  │                                             │  │  you today?   │ │
│  │                                             │  │               │ │
│  │  ┌─────────────────────────────────────┐  │  │               │ │
│  │  │ 🟢 Mike: Ready  🔵 You: Speaking    │  │  │               │ │
│  │  └─────────────────────────────────────┘  │  └───────────────┘ │
│  └─────────────────────────────────────────────┘                   │
│                                                                      │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │  [🎤 开始说话]                    [⏹️ 结束对话]  [📊 查看评估]  │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │  📊 评估结果                                                  │  │
│  │  发音: 85/100  ✓ 语法: 78/100                                │  │
│  │  - "I wants" → "I want" (verb agreement)                   │  │
│  │  - "the apple" → "an apple" (article usage)                 │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### 6.2 Component States

| Component | States |
|-----------|--------|
| Character | idle, selected, speaking, listening, thinking |
| Mic Button | ready, recording, disabled |
| Conversation Panel | empty, active, ended |
| Evaluation Panel | hidden, loading, visible |

## 7. API Design

### 7.1 REST Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/voice/start` | POST | Start conversation session |
| `/api/voice/evaluate` | POST | Submit for evaluation |
| `/api/voice/session/:id` | GET | Get session history |

### 7.2 WebSocket Events

```typescript
// Connection
ws://localhost:3001/voice

// Events
- `voice:start` - Start voice session
- `voice:audio` - Stream audio data
- `voice:stop` - End session
- `voice:response` - AI response audio
- `voice:transcript` - Transcription result
- `voice:evaluation` - Evaluation result
```

## 8. File Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── scenes/
│   │   │   ├── Scene3D.tsx
│   │   │   ├── Character3D.tsx
│   │   │   ├── CharacterLabel.tsx
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
│   │   ├── useWebSocket.ts
│   │   └── useEvaluation.ts
│   ├── stores/
│   │   └── voiceChatStore.ts
│   └── pages/
│       └── scenes/
│           └── index.tsx

backend/
├── src/
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
│   ├── websocket/
│   │   └── VoiceChatHandler.ts
│   └── servers/
│       └── voiceServer.ts
```

## 9. Implementation Priority

### Phase 1: Foundation
1. WebSocket server setup
2. Basic character rendering
3. Simple TTS/STT integration

### Phase 2: Core Features
4. Voice conversation flow
5. Character animations
6. Multi-character support

### Phase 3: Evaluation
7. Pronunciation scoring
8. Grammar analysis
9. Feedback UI

## 10. Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| TTS latency too high | Pre-generate common phrases, use lightweight TTS |
| STT accuracy issues | Use Whisper large model, add custom vocabulary |
| WebSocket disconnection | Auto-reconnect with exponential backoff |
| Performance issues | Lazy load 3D, optimize character models |
| Voice evaluation accuracy | Combine multiple signals, allow user feedback |
