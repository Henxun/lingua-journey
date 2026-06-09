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
  createLearningPathPrompt,
  createAdaptivePracticePrompt,
  createLearningStyleAnalysisPrompt,
  createContentGenerationPrompt,
  AIContext,
  LearningData,
  LearningStyleResult
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

export async function generatePersonalizedLearningPath(
  aiContext: AIContext,
  learningData: LearningData
): Promise<string> {
  const prompt = createLearningPathPrompt(aiContext, learningData);

  const completion = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      { role: 'system', content: `You are an expert language learning advisor. Speak in ${aiContext.nativeLanguage}.` },
      { role: 'user', content: prompt }
    ],
    temperature: 0.6,
    max_tokens: 1500
  });

  return completion.choices[0].message.content || "I'm unable to generate a learning path right now.";
}

export async function generateAdaptivePractice(
  topic: string,
  aiContext: AIContext,
  performanceHistory: { correct: number; total: number; mistakes: string[] }
): Promise<string> {
  const prompt = createAdaptivePracticePrompt(topic, aiContext, performanceHistory);

  const completion = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      { role: 'system', content: `You are a language practice generator. Create exercises in ${aiContext.targetLanguage} with explanations in ${aiContext.nativeLanguage}.` },
      { role: 'user', content: prompt }
    ],
    temperature: 0.7,
    max_tokens: 1200
  });

  return completion.choices[0].message.content || "I'm unable to generate practice exercises right now.";
}

export async function analyzeLearningStyle(
  aiContext: AIContext,
  learningPatterns: {
    preferredActivities: string[];
    timeDistribution: { morning: number; afternoon: number; evening: number };
    interactionStyle: string;
    feedbackPreferences: string[];
    topicEngagement: { topic: string; engagement: number }[];
  }
): Promise<LearningStyleResult> {
  const prompt = createLearningStyleAnalysisPrompt(aiContext, learningPatterns);

  const completion = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      { role: 'system', content: `You are an expert educational psychologist specializing in language learning. Respond in ${aiContext.nativeLanguage}.` },
      { role: 'user', content: prompt }
    ],
    temperature: 0.5,
    max_tokens: 1000
  });

  const content = completion.choices[0].message.content || "{}";
  
  try {
    const parsed = JSON.parse(content);
    return {
      primaryStyle: parsed.primaryStyle || 'Visual',
      secondaryStyle: parsed.secondaryStyle || 'Auditory',
      description: parsed.description || 'No description available',
      recommendations: parsed.recommendations || [],
      optimalActivities: parsed.optimalActivities || []
    };
  } catch {
    return {
      primaryStyle: 'Visual',
      secondaryStyle: 'Reading/Writing',
      description: content,
      recommendations: [],
      optimalActivities: []
    };
  }
}

export async function generateContent(
  topic: string,
  aiContext: AIContext,
  contentType: 'lesson' | 'exercise' | 'story'
): Promise<string> {
  const prompt = createContentGenerationPrompt(topic, aiContext, contentType);

  const completion = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      { role: 'system', content: createSystemPrompt(aiContext) },
      { role: 'user', content: prompt }
    ],
    temperature: 0.7,
    max_tokens: 1500
  });

  return completion.choices[0].message.content || "I'm unable to generate content right now.";
}
