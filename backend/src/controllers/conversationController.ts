import { Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { Conversation, Message } from '../entities/Conversation';
import { User } from '../entities/User';
import { generateResponse, analyzeConversation } from '../services/aiService';
import { z } from 'zod';

const conversationRepository = AppDataSource.getRepository(Conversation);

const startSchema = z.object({
  scenario: z.string()
});

const messageSchema = z.object({
  conversation_id: z.string().uuid(),
  message: z.string(),
  is_voice: z.boolean().optional().default(false)
});

export async function startConversation(req: Request, res: Response) {
  try {
    const { scenario } = startSchema.parse(req.body);
    const user = (req as any).user!;

    const conversation = conversationRepository.create({
      user_id: user.id,
      scenario,
      messages: []
    });

    const savedConversation = await conversationRepository.save(conversation);

    const initialMessages: { role: string; content: string }[] = [];
    const aiResponse = await generateResponse(initialMessages, scenario, user.target_language);

    const firstMessage: Message = {
      id: crypto.randomUUID(),
      role: 'assistant',
      content: aiResponse,
      timestamp: new Date()
    };

    savedConversation.messages = [firstMessage];
    await conversationRepository.save(savedConversation);

    res.status(201).json({
      id: savedConversation.id,
      scenario: savedConversation.scenario,
      messages: savedConversation.messages,
      created_at: savedConversation.created_at
    });
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
}

export async function sendMessage(req: Request, res: Response) {
  try {
    const { conversation_id, message, is_voice } = messageSchema.parse(req.body);
    const user = (req as any).user!;

    const conversation = await conversationRepository.findOne({
      where: { id: conversation_id, user_id: user.id }
    });

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: message,
      timestamp: new Date()
    };

    conversation.messages.push(userMessage);

    const aiMessages = conversation.messages.map(m => ({
      role: m.role,
      content: m.content
    }));

    const aiResponse = await generateResponse(aiMessages, conversation.scenario, user.target_language);

    const assistantMessage: Message = {
      id: crypto.randomUUID(),
      role: 'assistant',
      content: aiResponse,
      timestamp: new Date()
    };

    conversation.messages.push(assistantMessage);
    await conversationRepository.save(conversation);

    const analysis = await analyzeConversation(aiMessages.concat([{ role: 'assistant', content: aiResponse }]), user.target_language);

    res.status(200).json({
      conversation_id: conversation.id,
      user_message: userMessage,
      ai_message: assistantMessage,
      feedback: {
        correction: analysis.correction,
        suggestion: analysis.suggestion,
        score: analysis.score
      }
    });
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
}

export async function getConversationHistory(req: Request, res: Response) {
  try {
    const user = (req as any).user!;
    const conversations = await conversationRepository.find({
      where: { user_id: user.id },
      order: { created_at: 'DESC' }
    });

    res.status(200).json(conversations);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
}

export async function getConversation(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const user = (req as any).user!;

    const conversation = await conversationRepository.findOne({
      where: { id, user_id: user.id }
    });

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    res.status(200).json(conversation);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
}

export async function getScenarios(req: Request, res: Response) {
  const scenarios = [
    { id: 'daily', name: '日常对话', description: '购物、点餐、问路、就医等日常场景' },
    { id: 'business', name: '商务场景', description: '会议、谈判、邮件沟通、面试' },
    { id: 'travel', name: '旅行场景', description: '订酒店、问路、景点介绍、交通' },
    { id: 'exam', name: '考试场景', description: '模拟语言考试对话练习' }
  ];

  res.status(200).json(scenarios);
}