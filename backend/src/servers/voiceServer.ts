import WebSocket, { WebSocketServer } from 'ws';
import { Server } from 'http';
import { TTSService } from '../services/voice/TTSService';
import { STTService } from '../services/voice/STTService';
import { DialogueService } from '../services/dialogue/DialogueService';
import { PronunciationScorer } from '../services/evaluation/PronunciationScorer';
import { GrammarChecker } from '../services/evaluation/GrammarChecker';

interface ClientState {
  ws: WebSocket;
  characterId: string;
  transcript: string[];
  aiResponses: string[];
  conversationId: string;
}

export class VoiceServer {
  private wss: WebSocketServer;
  private clients: Map<string, ClientState> = new Map();
  private ttsService: TTSService;
  private sttService: STTService;
  private dialogueService: DialogueService;
  private pronunciationScorer: PronunciationScorer;
  private grammarChecker: GrammarChecker;

  constructor(server: Server) {
    this.wss = new WebSocketServer({ server, path: '/voice' });
    this.ttsService = new TTSService();
    this.sttService = new STTService();
    this.dialogueService = new DialogueService();
    this.pronunciationScorer = new PronunciationScorer();
    this.grammarChecker = new GrammarChecker();
    console.log('Voice WebSocket server initialized at /voice');
    this.setupConnectionHandlers();
  }

  private setupConnectionHandlers() {
    this.wss.on('connection', (ws: WebSocket, request: any) => {
      const clientId = this.generateId();
      const urlParts = request.url?.split('/') || [];
      const characterId = urlParts[urlParts.length - 1] || 'waiter_1';
      
      const character = this.dialogueService.getCharacter(characterId);
      const conversationId = this.dialogueService.createConversation(characterId);
      
      const client: ClientState = {
        ws,
        characterId: characterId,
        transcript: [],
        aiResponses: [],
        conversationId
      };
      this.clients.set(clientId, client);

      const greeting = character?.defaultDialogue[0] || 'Hello! Welcome to our restaurant.';
      client.aiResponses.push(greeting);
      this.sendReadyMessage(client, greeting);

      ws.on('message', async (data: WebSocket.Data) => {
        try {
          const message = JSON.parse(data.toString());
          await this.handleMessage(client, message);
        } catch (error) {
          console.error('Message handling error:', error);
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({
              type: 'error',
              payload: { message: 'Failed to process message' }
            }));
          }
        }
      });

      ws.on('close', () => {
        this.clients.delete(clientId);
        this.dialogueService.clearConversation(conversationId);
      });

      ws.on('error', (error) => {
        console.error('WebSocket error:', error);
        this.clients.delete(clientId);
        this.dialogueService.clearConversation(conversationId);
      });
    });
  }

  private sendReadyMessage(client: ClientState, greeting: string) {
    client.ws.send(JSON.stringify({
      type: 'ready',
      payload: {
        characterId: client.characterId,
        greeting,
        voices: this.ttsService.getAvailableVoices(),
        languages: this.sttService.getSupportedLanguages()
      }
    }));
  }

  private async handleMessage(client: ClientState, message: any) {
    switch (message.type) {
      case 'user_text':
        await this.processUserInput(client, message.payload.text);
        break;

      case 'user_audio':
        await this.processAudioInput(client, message.payload);
        break;

      case 'end_conversation':
        this.generateEvaluation(client);
        break;

      case 'get_characters':
        this.sendCharactersList(client);
        break;

      case 'switch_character':
        await this.switchCharacter(client, message.payload.characterId);
        break;
    }
  }

  private async processUserInput(client: ClientState, userText: string) {
    if (!userText || userText.trim().length === 0) {
      this.sendAiResponse(client, "I didn't quite catch that. Could you try again?", null);
      return;
    }

    client.transcript.push(userText);

    client.ws.send(JSON.stringify({
      type: 'transcript',
      payload: { transcript: userText }
    }));

    const aiResponse = await this.dialogueService.generateResponse(
      client.conversationId,
      client.characterId,
      userText
    );
    
    if (aiResponse.success) {
      client.aiResponses.push(aiResponse.response);
      await this.sendAiResponseWithTTS(client, aiResponse.response);
    } else {
      const fallback = this.dialogueService.getCharacter(client.characterId)?.defaultDialogue[0] || 
                       'I am sorry, I cannot respond right now.';
      await this.sendAiResponseWithTTS(client, fallback);
    }
  }

  private async processAudioInput(client: ClientState, payload: any) {
    if (payload.transcript) {
      await this.processUserInput(client, payload.transcript);
    } else if (payload.audioData) {
      const sttResult = await this.sttService.recognize(payload.audioData, {
        language: payload.language || 'en'
      });
      
      if (sttResult.success && sttResult.transcript) {
        client.ws.send(JSON.stringify({
          type: 'transcript',
          payload: { transcript: sttResult.transcript }
        }));
        await this.processUserInput(client, sttResult.transcript);
      }
    }
  }

  private async sendAiResponseWithTTS(client: ClientState, text: string) {
    const ttsResult = await this.ttsService.synthesize(text, {
      voice: 'en-US-female'
    });

    client.ws.send(JSON.stringify({
      type: 'ai_speaking',
      payload: {
        transcript: text,
        audioData: ttsResult.audioData || null,
        audioFormat: ttsResult.audioFormat || 'text'
      }
    }));
  }

  private sendAiResponse(client: ClientState, text: string, audioData: string | null) {
    client.ws.send(JSON.stringify({
      type: 'ai_speaking',
      payload: {
        transcript: text,
        audioData
      }
    }));
  }

  private generateEvaluation(client: ClientState) {
    const fullText = client.transcript.join(' ');
    
    const pronunciationScore = this.pronunciationScorer.score(fullText);
    const grammarScore = this.grammarChecker.check(fullText);
    
    const wordCount = fullText.split(/\s+/).filter(w => w.length > 0).length;
    const sentenceCount = client.transcript.length;
    const overallScore = Math.round(pronunciationScore.score * 0.5 + grammarScore.score * 0.5);

    const evaluation = {
      pronunciation: {
        score: pronunciationScore.score,
        issues: pronunciationScore.issues,
        tips: pronunciationScore.tips,
        feedback: pronunciationScore.overallFeedback
      },
      grammar: {
        score: grammarScore.score,
        corrections: grammarScore.corrections,
        suggestions: grammarScore.suggestions,
        feedback: grammarScore.overallFeedback
      },
      overall: {
        score: overallScore,
        feedback: overallScore >= 80 
          ? 'Excellent! Your conversation skills are very strong.'
          : overallScore >= 60
            ? 'Good effort! Keep practicing to improve further.'
            : 'Keep practicing! The more you speak, the better you get.',
        suggestions: [
          `You spoke ${sentenceCount} sentence(s) with ${wordCount} words`,
          'Try longer sentences for more practice',
          'Keep conversations going for better fluency',
          ...pronunciationScore.tips.slice(0, 2),
          ...grammarScore.suggestions.slice(0, 2)
        ].slice(0, 5)
      }
    };

    client.ws.send(JSON.stringify({
      type: 'evaluation_result',
      payload: { evaluation }
    }));
  }

  private sendCharactersList(client: ClientState) {
    const characters = this.dialogueService.getAllCharacters();
    client.ws.send(JSON.stringify({
      type: 'characters_list',
      payload: { characters }
    }));
  }

  private async switchCharacter(client: ClientState, characterId: string) {
    const character = this.dialogueService.getCharacter(characterId);
    if (!character) return;

    client.characterId = characterId;
    client.conversationId = this.dialogueService.createConversation(characterId);
    
    const greeting = character.defaultDialogue[0];
    client.aiResponses.push(greeting);
    
    client.ws.send(JSON.stringify({
      type: 'character_switched',
      payload: {
        characterId,
        character,
        greeting
      }
    }));
  }

  private generateId(): string {
    return Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
  }

  public getClientsCount(): number {
    return this.clients.size;
  }

  public close() {
    this.wss.close();
  }
}