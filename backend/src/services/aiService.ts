import OpenAI from 'openai';
import { ChatCompletionMessageParam } from 'openai/resources/chat';
import dotenv from 'dotenv';

dotenv.config();

let openai: OpenAI | null = null;
if (process.env.OPENAI_API_KEY) {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });
}

export async function generateResponse(
  messages: { role: string; content: string }[],
  scenario: string,
  targetLanguage: string
): Promise<string> {
  if (!openai) {
    // Mock response for development without API key
    const responses = {
      en: "Hello! How can I help you practice English today?",
      zh: "你好！我可以怎样帮你练习中文呢？",
      ja: "こんにちは！今日は日本語の練習でどんなことをしましょうか？",
      ko: "안녕하세요! 오늘 한국어 연습은 어떻게 도와드릴까요?",
    };
    return responses[targetLanguage as keyof typeof responses] || "Hello! Let's practice together!";
  }

  const systemPrompt = `
    You are a language learning assistant.
    Current scenario: ${scenario}
    Target language: ${targetLanguage}
    
    Rules:
    1. Respond in ${targetLanguage}
    2. Keep responses natural and conversational
    3. Correct grammar and vocabulary gently
    4. Ask follow-up questions to keep the conversation going
    5. Provide helpful feedback when appropriate
  `.trim();

  const formattedMessages: ChatCompletionMessageParam[] = [
    { role: 'system', content: systemPrompt },
    ...messages.map(m => ({ role: m.role as 'user' | 'assistant', content: m.content }))
  ];

  const response = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: formattedMessages,
    temperature: 0.7,
    max_tokens: 500
  });

  return response.choices[0].message.content || '';
}

export async function analyzeConversation(
  messages: { role: string; content: string }[],
  targetLanguage: string
): Promise<{ score: number; correction: string; suggestion: string }> {
  if (!openai) {
    // Mock analysis for development without API key
    return {
      score: 0.7,
      correction: 'Great job! Keep practicing.',
      suggestion: 'Try using more complex sentences.'
    };
  }

  const analysisPrompt = `
    Analyze this conversation for language learning purposes.
    Target language: ${targetLanguage}
    
    Conversation:
    ${messages.map(m => `${m.role}: ${m.content}`).join('\n')}
    
    Provide:
    1. A score (0-1) for overall proficiency
    2. Grammar/vocabulary corrections
    3. Suggestions for improvement
    
    Format as JSON with score, correction, and suggestion fields.
  `.trim();

  const response = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [{ role: 'user', content: analysisPrompt }],
    temperature: 0.3
  });

  try {
    return JSON.parse(response.choices[0].message.content || '{}');
  } catch {
    return { score: 0.5, correction: '', suggestion: '' };
  }
}
