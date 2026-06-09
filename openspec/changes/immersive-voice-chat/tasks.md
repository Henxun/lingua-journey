# Immersive Voice Chat - Tasks

## Phase 1: Foundation

### 1.1 WebSocket Server Setup
- [ ] Create WebSocket server (`backend/src/servers/voiceServer.ts`)
- [ ] Implement connection handler with room management
- [ ] Add message routing logic
- [ ] Implement heartbeat/ping-pong for connection health
- [ ] Add error handling and reconnection support

### 1.2 3D Character Rendering
- [ ] Update `Scene3D` component to support multiple characters
- [ ] Create `Character3D` component with procedural geometry
- [ ] Implement character label with name and status
- [ ] Add character selection highlighting
- [ ] Position characters in restaurant scene

### 1.3 Basic TTS Integration
- [ ] Set up Piper TTS or Coqui XTTS service
- [ ] Create TTS service wrapper (`backend/src/services/voice/TTSService.ts`)
- [ ] Implement text-to-speech conversion
- [ ] Add audio streaming to client via WebSocket

## Phase 2: Core Voice Features

### 2.1 Voice Recording (Client)
- [ ] Create `useVoiceChat` hook
- [ ] Implement microphone access with MediaRecorder
- [ ] Add audio capture and encoding
- [ ] Stream audio data to server via WebSocket

### 2.2 Speech-to-Text (Server)
- [ ] Set up Whisper.cpp integration
- [ ] Create STT service wrapper (`backend/src/services/voice/STTService.ts`)
- [ ] Implement audio-to-transcript conversion
- [ ] Return transcript to client

### 2.3 AI Dialogue Generation
- [ ] Create `DialogueService` for AI responses
- [ ] Implement character-specific prompts
- [ ] Add context management for multi-turn conversation
- [ ] Integrate with Ollama or OpenAI

### 2.4 Character Animations
- [ ] Define animation states (idle, talking, listening, waving)
- [ ] Implement procedural animations using useFrame
- [ ] Add mouth movement synced with speech
- [ ] Add gesture animations during conversation

### 2.5 Multi-Character Support
- [ ] Add character selection UI
- [ ] Implement conversation context per character
- [ ] Add ability to switch between characters
- [ ] Handle concurrent conversations

## Phase 3: Evaluation

### 3.1 Pronunciation Scoring
- [ ] Create `PronunciationScorer` service
- [ ] Implement phoneme comparison algorithm
- [ ] Add scoring based on accuracy
- [ ] Generate pronunciation tips

### 3.2 Grammar Analysis
- [ ] Integrate LanguageTool API
- [ ] Create `GrammarChecker` service
- [ ] Implement error detection and correction
- [ ] Generate grammar feedback

### 3.3 Evaluation UI
- [ ] Create `EvaluationPanel` component
- [ ] Display pronunciation score with visualization
- [ ] Show grammar corrections in user-friendly format
- [ ] Add improvement suggestions

## Phase 4: Polish

### 4.1 UI/UX Improvements
- [ ] Add conversation history panel
- [ ] Implement character status indicators
- [ ] Add audio visualizer during speech
- [ ] Improve loading and error states

### 4.2 Performance Optimization
- [ ] Optimize 3D scene rendering
- [ ] Add lazy loading for audio resources
- [ ] Implement audio buffering for smooth playback
- [ ] Add caching for TTS responses

### 4.3 Testing
- [ ] Unit tests for voice services
- [ ] Integration tests for WebSocket flow
- [ ] E2E test for complete conversation flow

---

## Task Details

### T1: Create WebSocket Server
**File**: `backend/src/servers/voiceServer.ts`
**Description**: Set up a WebSocket server that handles voice chat connections
**Dependencies**: None
**Estimated complexity**: Medium

### T2: Create Character3D Component
**File**: `frontend/src/components/scenes/Character3D.tsx`
**Description**: 3D character with animations and label
**Dependencies**: None
**Estimated complexity**: Medium

### T3: Implement useVoiceChat Hook
**File**: `frontend/src/hooks/useVoiceChat.ts`
**Description**: Hook for managing voice recording and playback
**Dependencies**: T1
**Estimated complexity**: High

### T4: Create TTS Service
**File**: `backend/src/services/voice/TTSService.ts`
**Description**: Text-to-speech service using open-source TTS
**Dependencies**: None
**Estimated complexity**: High

### T5: Create STT Service
**File**: `backend/src/services/voice/STTService.ts`
**Description**: Speech-to-text service using Whisper
**Dependencies**: None
**Estimated complexity**: High

### T6: Create DialogueService
**File**: `backend/src/services/dialogue/DialogueService.ts`
**Description**: AI dialogue generation with character context
**Dependencies**: T4, T5
**Estimated complexity**: High

### T7: Implement Pronunciation Scorer
**File**: `backend/src/services/evaluation/PronunciationScorer.ts`
**Description**: Score pronunciation accuracy
**Dependencies**: T5
**Estimated complexity**: Medium

### T8: Create Grammar Checker
**File**: `backend/src/services/evaluation/GrammarChecker.ts`
**Description**: Grammar analysis using LanguageTool
**Dependencies**: None
**Estimated complexity**: Medium

### T9: Build Conversation Panel UI
**File**: `frontend/src/components/chat/ConversationPanel.tsx`
**Description**: UI for displaying conversation
**Dependencies**: T3
**Estimated complexity**: Low

### T10: Build Evaluation Panel UI
**File**: `frontend/src/components/evaluation/EvaluationPanel.tsx`
**Description**: UI for displaying pronunciation and grammar feedback
**Dependencies**: T7, T8
**Estimated complexity**: Low
