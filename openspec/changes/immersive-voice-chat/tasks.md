# Immersive Voice Chat - Tasks

## Phase 1: Foundation

### 1.1 WebSocket Server Setup
- [x] Create WebSocket server (`backend/src/servers/voiceServer.ts`)
- [x] Implement connection handler with room management
- [x] Add message routing logic
- [ ] Implement heartbeat/ping-pong for connection health
- [x] Add error handling and reconnection support

### 1.2 3D Character Rendering
- [x] Update `Scene3D` component to support multiple characters
- [x] Create `Character3D` component with procedural geometry
- [x] Implement character label with name and status
- [x] Add character selection highlighting
- [x] Position characters in restaurant scene

### 1.3 Basic TTS Integration
- [x] Set up Piper TTS or Coqui XTTS service
- [x] Create TTS service wrapper (`backend/src/services/voice/TTSService.ts`)
- [x] Implement text-to-speech conversion
- [x] Add audio streaming to client via WebSocket

## Phase 2: Core Voice Features

### 2.1 Voice Recording (Client)
- [x] Create `useVoiceChat` hook
- [x] Implement microphone access with MediaRecorder
- [x] Add audio capture and encoding
- [x] Stream audio data to server via WebSocket

### 2.2 Speech-to-Text (Server)
- [x] Set up Whisper.cpp integration
- [x] Create STT service wrapper (`backend/src/services/voice/STTService.ts`)
- [x] Implement audio-to-transcript conversion
- [x] Return transcript to client

### 2.3 AI Dialogue Generation
- [x] Create `DialogueService` for AI responses
- [x] Implement character-specific prompts
- [x] Add context management for multi-turn conversation
- [x] Integrate with Ollama or OpenAI

### 2.4 Character Animations
- [x] Define animation states (idle, talking, listening, waving)
- [x] Implement procedural animations using useFrame
- [x] Add mouth movement synced with speech
- [x] Add gesture animations during conversation

### 2.5 Multi-Character Support
- [x] Add character selection UI (CharacterSwitcher)
- [x] Implement conversation context per character
- [x] Add ability to switch between characters
- [ ] Handle concurrent conversations

## Phase 3: Evaluation

### 3.1 Pronunciation Scoring
- [x] Create `PronunciationScorer` service
- [x] Implement phoneme comparison algorithm
- [x] Add scoring based on accuracy
- [x] Generate pronunciation tips

### 3.2 Grammar Analysis
- [x] Integrate LanguageTool API
- [x] Create `GrammarChecker` service
- [x] Implement error detection and correction
- [x] Generate grammar feedback

### 3.3 Evaluation UI
- [x] Create `EvaluationPanel` component
- [x] Display pronunciation score with visualization
- [x] Show grammar corrections in user-friendly format
- [x] Add improvement suggestions

## Phase 4: Polish

### 4.1 UI/UX Improvements
- [x] Add conversation history panel
- [x] Implement character status indicators
- [x] Add audio visualizer during speech (AudioVisualizer component)
- [x] Improve loading and error states

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
**Status**: ✅ COMPLETED
**Description**: Set up a WebSocket server that handles voice chat connections

### T2: Create Character3D Component
**File**: `frontend/src/components/scenes/Character3D.tsx`
**Status**: ✅ COMPLETED
**Description**: 3D character with animations (idle, talking, listening, waving) and label

### T3: Implement useVoiceChat Hook
**File**: `frontend/src/hooks/useVoiceChat.ts`
**Status**: ✅ COMPLETED
**Description**: Hook for managing voice recording, WebSocket connection, character switching

### T4: Create TTS Service
**File**: `backend/src/services/voice/TTSService.ts`
**Status**: ✅ COMPLETED
**Description**: Text-to-speech service using OpenAI TTS API

### T5: Create STT Service
**File**: `backend/src/services/voice/STTService.ts`
**Status**: ✅ COMPLETED
**Description**: Speech-to-text service using OpenAI Whisper API

### T6: Create DialogueService
**File**: `backend/src/services/dialogue/DialogueService.ts`
**Status**: ✅ COMPLETED
**Description**: AI dialogue generation with 4 characters (Mike, Emma, Marcus, Lisa)

### T7: Implement Pronunciation Scorer
**File**: `backend/src/services/evaluation/PronunciationScorer.ts`
**Status**: ✅ COMPLETED
**Description**: Score pronunciation accuracy with phoneme analysis

### T8: Create Grammar Checker
**File**: `backend/src/services/evaluation/GrammarChecker.ts`
**Status**: ✅ COMPLETED
**Description**: Grammar analysis with 20+ common error patterns

### T9: Build Conversation Panel UI
**File**: `frontend/src/components/chat/ConversationPanel.tsx`
**Status**: ✅ COMPLETED
**Description**: UI for displaying conversation with framer-motion animations

### T10: Build Evaluation Panel UI
**File**: `frontend/src/components/evaluation/EvaluationPanel.tsx`
**Status**: ✅ COMPLETED
**Description**: UI for displaying pronunciation and grammar feedback with circular progress
