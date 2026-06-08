import { AppDataSource } from '../config/database';
import { AITeacherSession, Message } from '../entities/AITeacherSession';
import OpenAI from 'openai';
import dotenv from 'dotenv';
import {
  createSystemPrompt,
  createGrammarExplanationPrompt,
  createVocabularyExplanationPrompt,
  createErrorCorrectionPrompt,
  createPracticeQuestionPrompt,
  AIContext
} from './aiTeacherPrompts';

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const sessionRepository = AppDataSource.getRepository(AITeacherSession);

export async function createSession(
  userId: string,
  topic: string,
  context?: string
): Promise<AITeacherSession> {
  const session = new AITeacherSession();
  session.userId = userId;
  session.topic = topic;
  session.context = context;
  session.messages = [];
  return await sessionRepository.save(session);
}

export async function getSession(
  sessionId: string,
  userId: string
): Promise<AITeacherSession | null> {
  return await sessionRepository.findOne({
    where: { id: sessionId, userId }
  });
}

export async function getUserSessions(userId: string): Promise<AITeacherSession[]> {
  return await sessionRepository.find({
    where: { userId, isActive: true },
    order: { createdAt: 'DESC' }
  });
}

export async function sendMessage(
  sessionId: string,
  userId: string,
  userContent: string,
  aiContext: AIContext
): Promise<{ userMessage: Message; assistantMessage: Message }> {
  const session = await getSession(sessionId, userId);
  if (!session) {
    throw new Error('Session not found');
  }

  const userMessage: Message = {
    id: Date.now().toString(),
    role: 'user',
    content: userContent,
    timestamp: new Date()
  };

  session.messages.push(userMessage);

  const messagesForOpenAI = [
    { role: 'system' as const, content: createSystemPrompt(aiContext) },
    ...session.messages.map(m => ({
      role: m.role,
      content: m.content
    }))
  ];

  const completion = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: messagesForOpenAI,
    temperature: 0.7,
    max_tokens: 800
  });

  const assistantContent = completion.choices[0].message.content || "I'm sorry, I don't have a response right now.";

  const assistantMessage: Message = {
    id: (Date.now() + 1).toString(),
    role: 'assistant',
    content: assistantContent,
    timestamp: new Date()
  };

  session.messages.push(assistantMessage);
  await sessionRepository.save(session);

  return { userMessage, assistantMessage };
}

export async function generateExplanation(
  topic: string,
  type: 'grammar' | 'vocabulary',
  aiContext: AIContext
): Promise<string> {
  const prompt = type === 'grammar'
    ? createGrammarExplanationPrompt(topic, aiContext)
    : createVocabularyExplanationPrompt(topic, aiContext);

  const completion = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      { role: 'system', content: createSystemPrompt(aiContext) },
      { role: 'user', content: prompt }
    ],
    temperature: 0.7,
    max_tokens: 1000
  });

  return completion.choices[0].message.content || "I'm unable to generate an explanation right now.";
}

export async function correctText(
  text: string,
  aiContext: AIContext
): Promise<string> {
  const prompt = createErrorCorrectionPrompt(text, aiContext);

  const completion = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      { role: 'system', content: createSystemPrompt(aiContext) },
      { role: 'user', content: prompt }
    ],
    temperature: 0.5,
    max_tokens: 600
  });

  return completion.choices[0].message.content || "I'm unable to provide correction right now.";
}

export async function generatePracticeQuestion(
  topic: string,
  aiContext: AIContext
): Promise<string> {
  const prompt = createPracticeQuestionPrompt(topic, aiContext);

  const completion = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      { role: 'system', content: createSystemPrompt(aiContext) },
      { role: 'user', content: prompt }
    ],
    temperature: 0.8,
    max_tokens: 500
  });

  return completion.choices[0].message.content || "I'm unable to generate a practice question right now.";
}
