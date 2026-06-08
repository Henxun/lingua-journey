import { Request, Response } from 'express';
import { 
  createConversation, 
  getConversationById, 
  getConversationHistory,
  sendMessage,
  getConversationMessages,
  completeConversation,
  abandonConversation,
  calculateScore
} from '../services/conversationService';

export async function createConversationHandler(req: Request, res: Response) {
  try {
    const { lesson_id } = req.body;
    const userId = (req as any).user?.id;

    if (!lesson_id) {
      return res.status(400).json({ error: 'lesson_id is required' });
    }

    const session = await createConversation(lesson_id, userId);
    res.json(session);
  } catch (error) {
    console.error('Error creating conversation:', error);
    res.status(500).json({ error: 'Failed to create conversation' });
  }
}

export async function getConversationHandler(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const session = await getConversationById(id);

    if (!session) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    res.json(session);
  } catch (error) {
    console.error('Error getting conversation:', error);
    res.status(500).json({ error: 'Failed to get conversation' });
  }
}

export async function getConversationHistoryHandler(req: Request, res: Response) {
  try {
    const userId = (req as any).user?.id;
    const limit = parseInt(req.query.limit as string) || 20;

    const sessions = await getConversationHistory(userId, limit);
    res.json(sessions);
  } catch (error) {
    console.error('Error getting conversation history:', error);
    res.status(500).json({ error: 'Failed to get conversation history' });
  }
}

export async function sendMessageHandler(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ error: 'content is required' });
    }

    const session = await getConversationById(id);
    if (!session) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    if (session.status !== 'active') {
      return res.status(400).json({ error: 'Conversation is not active' });
    }

    const messages = await sendMessage(id, content);
    res.json({ messages });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
}

export async function getMessagesHandler(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const messages = await getConversationMessages(id);
    res.json(messages);
  } catch (error) {
    console.error('Error getting messages:', error);
    res.status(500).json({ error: 'Failed to get messages' });
  }
}

export async function completeConversationHandler(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { score } = req.body;

    const session = await getConversationById(id);
    if (!session) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    // Calculate score if not provided
    const finalScore = score ?? (async () => {
      const messages = await getConversationMessages(id);
      return calculateScore(messages);
    })();

    const completedSession = await completeConversation(id, await finalScore);
    res.json(completedSession);
  } catch (error) {
    console.error('Error completing conversation:', error);
    res.status(500).json({ error: 'Failed to complete conversation' });
  }
}

export async function abandonConversationHandler(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const session = await abandonConversation(id);
    res.json(session);
  } catch (error) {
    console.error('Error abandoning conversation:', error);
    res.status(500).json({ error: 'Failed to abandon conversation' });
  }
}
