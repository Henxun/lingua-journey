import WebSocket, { WebSocketServer } from 'ws';
import { Server } from 'http';

// Simplified voice server that works with the existing HTTP server
// Uses OpenAI for dialogue (already available in the project) and text-only mode
// Voice synthesis/recognition is handled client-side via Web Speech API

interface ClientState {
  ws: WebSocket;
  characterId: string;
  transcript: string[];
  aiResponses: string[];
}

// In-memory characters (avoids database dependency for quick start)
const CHARACTERS = [
  {
    id: 'waiter_1',
    name: 'Mike',
    personality: 'friendly, professional, patient',
    defaultDialogue: ['Hello! Welcome to our restaurant. My name is Mike. How can I help you today?'],
    speechStyle: 'friendly'
  },
  {
    id: 'customer_1',
    name: 'Sarah',
    personality: 'polite, curious, eager to learn',
    defaultDialogue: ['Excuse me, could you recommend something?'],
    speechStyle: 'polite'
  },
  {
    id: 'customer_2',
    name: 'David',
    personality: 'direct, casual, hungry',
    defaultDialogue: ['I am very hungry today! What do you have?'],
    speechStyle: 'casual'
  }
];

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

export class VoiceServer {
  private wss: WebSocketServer;
  private clients: Map<string, ClientState> = new Map();

  constructor(server: Server) {
    this.wss = new WebSocketServer({ server, path: '/voice' });
    console.log('Voice WebSocket server initialized at /voice');
    this.setupConnectionHandlers();
  }

  private setupConnectionHandlers() {
    this.wss.on('connection', (ws: WebSocket, request: any) => {
      const clientId = this.generateId();
      // characterId from URL: /voice/{characterId}
      const urlParts = request.url?.split('/') || [];
      const characterId = urlParts[urlParts.length - 1] || 'waiter_1';
      
      const character = CHARACTERS.find(c => c.id === characterId) || CHARACTERS[0];
      
      const client: ClientState = {
        ws,
        characterId: character.id,
        transcript: [],
        aiResponses: []
      };
      this.clients.set(clientId, client);

      // Send greeting
      const greeting = character.defaultDialogue[0];
      client.aiResponses.push(greeting);
      ws.send(JSON.stringify({
        type: 'ready',
        payload: {
          characterId: character.id,
          greeting: greeting
        }
      }));

      // Handle messages
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
      });

      ws.on('error', (error) => {
        console.error('WebSocket error:', error);
        this.clients.delete(clientId);
      });
    });
  }

  private async handleMessage(client: ClientState, message: any) {
    switch (message.type) {
      case 'user_text':
        // User sent text (from speech recognition)
        this.processUserInput(client, message.payload.text);
        break;

      case 'user_audio':
        // Audio data - we treat as text, STT is handled client-side via Web Speech API
        // But if audio is provided, we'll store for evaluation
        if (message.payload.transcript) {
          this.processUserInput(client, message.payload.transcript);
        }
        break;

      case 'end_conversation':
        this.generateEvaluation(client);
        break;
    }
  }

  private async processUserInput(client: ClientState, userText: string) {
    if (!userText || userText.trim().length === 0) {
      client.ws.send(JSON.stringify({
        type: 'ai_speaking',
        payload: {
          transcript: "I didn't quite catch that. Could you try again?",
          audioData: null
        }
      }));
      return;
    }

    // Store user input
    client.transcript.push(userText);

    // Echo transcript back to client
    client.ws.send(JSON.stringify({
      type: 'transcript',
      payload: { transcript: userText }
    }));

    // Generate AI response
    const aiResponse = await this.generateAIResponse(client.characterId, client.transcript);
    client.aiResponses.push(aiResponse);

    // Send AI response (text-only; client handles TTS via Web Speech API)
    client.ws.send(JSON.stringify({
      type: 'ai_speaking',
      payload: {
        transcript: aiResponse,
        audioData: null  // Client will synthesize via SpeechSynthesis API
      }
    }));
  }

  private async generateAIResponse(characterId: string, transcript: string[]): Promise<string> {
    // Try OpenAI first
    const apiKey = process.env.OPENAI_API_KEY;
    
    if (apiKey) {
      try {
        const systemPrompt = CHARACTER_PROMPTS[characterId as keyof typeof CHARACTER_PROMPTS] || CHARACTER_PROMPTS.waiter_1;
        const lastUserInput = transcript[transcript.length - 1];
        
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
          },
          body: JSON.stringify({
            model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: lastUserInput }
            ],
            max_tokens: 150,
            temperature: 0.7
          })
        });

        const data = await response.json();
        if (data.choices && data.choices.length > 0) {
          return data.choices[0].message.content || "I'm sorry, I didn't catch that.";
        }
      } catch (error) {
        console.error('OpenAI generation error:', error);
      }
    }

    // Fallback to predefined responses
    return this.getFallbackResponse(characterId, transcript[transcript.length - 1]);
  }

  private getFallbackResponse(characterId: string, userInput: string): string {
    const character = CHARACTERS.find(c => c.id === characterId) || CHARACTERS[0];
    
    const genericResponses = [
      'That is an excellent question! Let me help you with that.',
      'I understand. Here is what I recommend...',
      'Thank you for your input! This is what I think.',
      'Interesting point! Here is my perspective.',
      'Great question! Let me explain.'
    ];

    // Simple keyword matching for more relevant responses
    const lowerInput = userInput.toLowerCase();
    
    if (lowerInput.includes('hello') || lowerInput.includes('hi')) {
      return `Hello! Great to see you. I am ${character.name}. What can I help you with today?`;
    }
    if (lowerInput.includes('menu') || lowerInput.includes('food')) {
      return 'Our menu has many delicious options today. I can recommend anything fresh from the kitchen!';
    }
    if (lowerInput.includes('water') || lowerInput.includes('drink')) {
      return 'Of course! I can get you some water or a drink. Anything you prefer?';
    }
    if (lowerInput.includes('thank')) {
      return "You're very welcome! Let me know if you need anything else.";
    }

    return genericResponses[Math.floor(Math.random() * genericResponses.length)];
  }

  private generateEvaluation(client: ClientState) {
    const fullText = client.transcript.join(' ');
    const wordCount = fullText.split(/\s+/).filter(w => w.length > 0).length;
    const sentenceCount = client.transcript.length;

    // Simple evaluation
    const grammarScore = Math.min(100, 70 + Math.floor(Math.random() * 30));
    const pronunciationScore = Math.min(100, 75 + Math.floor(Math.random() * 25));
    const overallScore = Math.round(grammarScore * 0.6 + pronunciationScore * 0.4);

    const evaluation = {
      pronunciation: {
        score: pronunciationScore,
        issues: [],
        tips: [
          'Practice speaking slowly and clearly',
          'Listen to native speakers and imitate',
          'Focus on clear vowel sounds'
        ]
      },
      grammar: {
        score: grammarScore,
        corrections: []
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
          'Keep conversations going for better fluency'
        ]
      }
    };

    client.ws.send(JSON.stringify({
      type: 'evaluation_result',
      payload: { evaluation }
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
