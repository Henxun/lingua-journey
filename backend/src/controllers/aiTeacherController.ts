import { Request, Response } from 'express';
import {
  createSession,
  getSession,
  getUserSessions,
  sendMessage,
  generateExplanation,
  correctText,
  generatePracticeQuestion
} from '../services/aiTeacherService';

export async function createAITeacherSession(req: Request, res: Response) {
  try {
    const userId = (req as any).user.id;
    const { topic, context } = req.body;
    const session = await createSession(userId, topic, context);
    res.status(201).json(session);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
}

export async function getAITeacherSession(req: Request, res: Response) {
  try {
    const userId = (req as any).user.id;
    const { id } = req.params;
    const session = await getSession(id, userId);
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }
    res.status(200).json(session);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
}

export async function getUserAITeacherSessions(req: Request, res: Response) {
  try {
    const userId = (req as any).user.id;
    const sessions = await getUserSessions(userId);
    res.status(200).json(sessions);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
}

export async function sendAITeacherMessage(req: Request, res: Response) {
  try {
    const userId = (req as any).user.id;
    const { id } = req.params;
    const { message, aiContext } = req.body;
    const result = await sendMessage(id, userId, message, aiContext);
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
}

export async function getExplanation(req: Request, res: Response) {
  try {
    const { topic, type, aiContext } = req.body;
    const explanation = await generateExplanation(topic, type, aiContext);
    res.status(200).json({ explanation });
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
}

export async function getTextCorrection(req: Request, res: Response) {
  try {
    const { text, aiContext } = req.body;
    const correction = await correctText(text, aiContext);
    res.status(200).json({ correction });
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
}

export async function getPracticeQuestion(req: Request, res: Response) {
  try {
    const { topic, aiContext } = req.body;
    const question = await generatePracticeQuestion(topic, aiContext);
    res.status(200).json({ question });
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
}
