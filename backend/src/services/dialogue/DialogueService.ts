export interface DialogueContext {
  characterId: string;
  history: {
    role: 'user' | 'assistant';
    content: string;
  }[];
  topic?: string;
}

export interface DialogueOptions {
  maxTokens?: number;
  temperature?: number;
  characterStyle?: 'friendly' | 'professional' | 'casual' | 'polite';
}

export interface DialogueResult {
  success: boolean;
  response: string;
  tokensUsed?: number;
  error?: string;
}

export interface CharacterProfile {
  id: string;
  name: string;
  role: string;
  personality: string;
  speechStyle: 'formal' | 'casual' | 'friendly' | 'polite';
  defaultDialogue: string[];
}

export class DialogueService {
  private characters: Map<string, CharacterProfile> = new Map();
  private conversationHistory: Map<string, DialogueContext> = new Map();

  constructor() {
    this.initializeCharacters();
  }

  private initializeCharacters(): void {
    this.characters.set('waiter_1', {
      id: 'waiter_1',
      name: 'Mike',
      role: 'waiter',
      personality: 'friendly, professional, patient',
      speechStyle: 'friendly',
      defaultDialogue: ['Hello! Welcome to our restaurant. My name is Mike. How can I help you today?']
    });

    this.characters.set('customer_1', {
      id: 'customer_1',
      name: 'Emma',
      role: 'customer',
      personality: 'polite, curious, eager to learn',
      speechStyle: 'polite',
      defaultDialogue: ['Excuse me, could you recommend something nice?']
    });

    this.characters.set('customer_2', {
      id: 'customer_2',
      name: 'Marcus',
      role: 'customer',
      personality: 'direct, casual, hungry',
      speechStyle: 'casual',
      defaultDialogue: ['Hey, I am starving! What do you recommend?']
    });

    this.characters.set('customer_3', {
      id: 'customer_3',
      name: 'Lisa',
      role: 'customer',
      personality: 'friendly, talkative, adventurous',
      speechStyle: 'friendly',
      defaultDialogue: ['Hi there! This is my first time here. Any must-try dishes?']
    });
  }

  getCharacter(characterId: string): CharacterProfile | undefined {
    return this.characters.get(characterId);
  }

  getAllCharacters(): CharacterProfile[] {
    return Array.from(this.characters.values());
  }

  async generateResponse(
    conversationId: string,
    characterId: string,
    userInput: string,
    options: DialogueOptions = {}
  ): Promise<DialogueResult> {
    const { maxTokens = 150, temperature = 0.7 } = options;

    const character = this.characters.get(characterId);
    if (!character) {
      return {
        success: false,
        response: 'Character not found',
        error: 'Unknown character'
      };
    }

    let context = this.conversationHistory.get(conversationId);
    if (!context) {
      context = {
        characterId,
        history: []
      };
    }

    context.history.push({ role: 'user', content: userInput });

    const apiKey = process.env.OPENAI_API_KEY;
    
    if (apiKey) {
      try {
        const result = await this.generateWithOpenAI(context, character, maxTokens, temperature);
        context.history.push({ role: 'assistant', content: result.response });
        this.conversationHistory.set(conversationId, context);
        return result;
      } catch (error) {
        console.error('OpenAI dialogue generation failed:', error);
        return this.generateFallbackResponse(character, userInput);
      }
    }

    const result = this.generateFallbackResponse(character, userInput);
    context.history.push({ role: 'assistant', content: result.response });
    this.conversationHistory.set(conversationId, context);
    return result;
  }

  private async generateWithOpenAI(
    context: DialogueContext,
    character: CharacterProfile,
    maxTokens: number,
    temperature: number
  ): Promise<DialogueResult> {
    const systemPrompt = this.buildSystemPrompt(character);
    
    const messages = [
      { role: 'system', content: systemPrompt },
      ...context.history.slice(-6)
    ];

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
        messages,
        max_tokens: maxTokens,
        temperature,
        presence_penalty: 0.1,
        frequency_penalty: 0.1
      })
    });

    const data = await response.json();

    if (!response.ok || !data.choices || data.choices.length === 0) {
      throw new Error(data.error?.message || 'Failed to generate response');
    }

    return {
      success: true,
      response: data.choices[0].message.content.trim(),
      tokensUsed: data.usage?.total_tokens
    };
  }

  private buildSystemPrompt(character: CharacterProfile): string {
    const roleDescriptions: Record<string, string> = {
      waiter: 'You are a waiter at a restaurant.',
      customer: 'You are a customer dining at a restaurant.'
    };

    return `
You are ${character.name}, ${roleDescriptions[character.role] || 'a person'}.

Personality: ${character.personality}
Speech style: ${character.speechStyle}

- Keep responses natural and conversational
- Respond in 1-3 sentences maximum
- Stay in character at all times
- Use appropriate language for the situation
- If you don't know the answer, respond naturally without saying "I don't know"
    `.trim();
  }

  private generateFallbackResponse(character: CharacterProfile, userInput: string): DialogueResult {
    const responses: Record<string, string[]> = {
      waiter_1: [
        'Welcome to our restaurant! What can I get for you today?',
        'Our special today is delicious. Would you like to try it?',
        'Of course! I will be right back with that.',
        'Is there anything else I can assist you with?',
        'Great choice! That is one of our most popular dishes.'
      ],
      customer_1: [
        'This place looks amazing!',
        'What do you recommend here?',
        'The food smells wonderful.',
        'I am really enjoying my meal!',
        'Could you pass me the water, please?'
      ],
      customer_2: [
        'Man, I am so hungry!',
        'Give me the biggest thing on the menu!',
        'This food is awesome!',
        'Can I get seconds?',
        'How much is this going to cost?'
      ],
      customer_3: [
        'Wow, this place has great ambiance!',
        'Do you have any vegetarian options?',
        'I love trying new foods!',
        'This is better than I expected!',
        'Have you tried the desserts here?'
      ]
    };

    const charResponses = responses[character.id] || responses.waiter_1;
    const randomResponse = charResponses[Math.floor(Math.random() * charResponses.length)];

    return {
      success: true,
      response: randomResponse
    };
  }

  getConversationHistory(conversationId: string): DialogueContext | undefined {
    return this.conversationHistory.get(conversationId);
  }

  clearConversation(conversationId: string): void {
    this.conversationHistory.delete(conversationId);
  }

  createConversation(characterId: string): string {
    const conversationId = `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.conversationHistory.set(conversationId, {
      characterId,
      history: []
    });
    return conversationId;
  }
}