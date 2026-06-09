# Immersive Voice Chat - Proposal

## 1. Problem Background

The current 3D scene implementation is too simple:
- Only one scene (restaurant) with basic interactive objects
- No animated characters
- No voice interaction
- No pronunciation or grammar evaluation

Users need a more immersive language learning experience where they can practice real conversations with AI-powered characters in 3D scenarios.

## 2. Goals

Build an **immersive multi-character voice chat system** that enables:

### Core Features
1. **3D Multi-Character Scene**
   - Restaurant scene with 2-3 animated characters (1 waiter + 2 customers)
   - Characters have idle animations (standing, waving)
   - Name labels and status indicators above characters

2. **Voice Conversation**
   - Click character → directly enter voice dialogue mode
   - Real-time voice streaming via WebSocket
   - Text-to-Speech (TTS) for AI characters
   - Speech-to-Text (STT) for user input

3. **Multi-Person Conversation**
   - Support simultaneous conversation with multiple characters
   - Each character has distinct personality and dialogue scope

4. **Post-Conversation Evaluation**
   - Pronunciation scoring after each dialogue
   - Grammar analysis and feedback
   - Personalized improvement suggestions

## 3. Scope

### In Scope
- Restaurant 3D scene with 4 characters (1 waiter + 3 customers)
- Character animations (idle, talking, waving)
- Voice conversation with WebSocket architecture
- Open-source TTS/STT integration
- Pronunciation and grammar evaluation

### Out of Scope
- Other 3D scenes (café, hotel, etc.)
- Video capture of conversations
- Mobile-specific optimizations
- Offline mode

## 4. Technical Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    Browser (React + Three.js)                     │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐│
│  │ 3D Scene    │  │ Voice Chat  │  │ Evaluation Panel         ││
│  │ - Characters│  │ - WebSocket │  │ - Pronunciation Score    ││
│  │ - Animations│  │ - TTS (STT) │  │ - Grammar Feedback      ││
│  │ - Labels    │  │ - Controls  │  │ - Suggestions           ││
│  └─────────────┘  └─────────────┘  └─────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼ WebSocket
┌─────────────────────────────────────────────────────────────────┐
│                      AI Server (Node.js)                        │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐│
│  │ WebSocket   │  │ AI Dialogue │  │ Evaluation Engine        ││
│  │ Handler     │  │ (GPT-4 /   │  │ - Whisper (STT)         ││
│  │             │  │  Ollama)    │  │ - TTS Service           ││
│  │             │  │             │  │ - Grammar Check         ││
│  └─────────────┘  └─────────────┘  └─────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
```

## 5. Open Source Stack

| Component | Technology | Rationale |
|-----------|------------|-----------|
| 3D Engine | React Three Fiber + drei | Already in use |
| TTS | Coqui XTTS / Piper | Open source, good quality |
| STT | Whisper.cpp | Open source, accurate |
| AI Dialogue | Ollama (local) / OpenAI | Flexible |
| WebSocket | ws (Node.js) | Lightweight |
| Evaluation | Custom + LanguageTool | Grammar checking |

## 6. Success Metrics

- [ ] User can start voice conversation by clicking any character
- [ ] AI character speaks with TTS within 2 seconds
- [ ] User voice is recognized and transcribed
- [ ] At least 3 characters available in scene
- [ ] Post-conversation evaluation displays pronunciation and grammar feedback
- [ ] Multi-character conversation flow works smoothly
