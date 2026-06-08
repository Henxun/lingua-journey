import { AppDataSource } from '../config/database';
import { ConversationSession, ConversationStatus } from '../entities/ConversationSession';
import { ConversationMessage, MessageRole } from '../entities/ConversationMessage';

const sessionRepository = AppDataSource.getRepository(ConversationSession);
const messageRepository = AppDataSource.getRepository(ConversationMessage);

export async function createConversation(lessonId: string, userId: string): Promise<ConversationSession> {
  const session = sessionRepository.create({
    lesson_id: lessonId,
    user_id: userId,
    status: ConversationStatus.ACTIVE
  });
  return await sessionRepository.save(session);
}

export async function getConversationById(sessionId: string): Promise<ConversationSession | null> {
  return await sessionRepository.findOne({
    where: { id: sessionId }
  });
}

export async function getConversationHistory(userId: string, limit: number = 20): Promise<ConversationSession[]> {
  return await sessionRepository.find({
    where: { user_id: userId },
    order: { started_at: 'DESC' },
    take: limit
  });
}

export async function sendMessage(sessionId: string, userMessage: string): Promise<ConversationMessage[]> {
  // Save user message
  const userMsg = messageRepository.create({
    session_id: sessionId,
    role: MessageRole.USER,
    content: userMessage
  });
  await messageRepository.save(userMsg);

  // Simulate AI response
  const aiResponse = await generateAIResponse(sessionId, userMessage);
  
  // Get all messages
  return await getConversationMessages(sessionId);
}

export async function getConversationMessages(sessionId: string): Promise<ConversationMessage[]> {
  return await messageRepository.find({
    where: { session_id: sessionId },
    order: { created_at: 'ASC' }
  });
}

export async function completeConversation(sessionId: string, score: number): Promise<ConversationSession> {
  const session = await sessionRepository.findOne({
    where: { id: sessionId }
  });

  if (!session) {
    throw new Error('Conversation not found');
  }

  session.status = ConversationStatus.COMPLETED;
  session.score = score;
  session.completed_at = new Date();

  return await sessionRepository.save(session);
}

export async function abandonConversation(sessionId: string): Promise<ConversationSession> {
  const session = await sessionRepository.findOne({
    where: { id: sessionId }
  });

  if (!session) {
    throw new Error('Conversation not found');
  }

  session.status = ConversationStatus.ABANDONED;
  return await sessionRepository.save(session);
}

// Simulated AI response generator
async function generateAIResponse(sessionId: string, userMessage: string): Promise<ConversationMessage> {
  // Simulate processing delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Simple AI response simulation
  const responses = [
    "That's great! Could you tell me more about that?",
    "Excellent! I'm impressed with your progress.",
    "Well done! Keep practicing and you'll master this in no time.",
    "I understand. Let's continue with the next topic.",
    "Perfect! Your pronunciation is getting better.",
  ];

  const aiResponse = messageRepository.create({
    session_id: sessionId,
    role: MessageRole.AI,
    content: responses[Math.floor(Math.random() * responses.length)]
  });

  return await messageRepository.save(aiResponse);
}

export function calculateScore(messages: ConversationMessage[]): number {
  if (messages.length === 0) return 0;
  
  // Simple scoring based on conversation length
  const baseScore = Math.min(messages.length * 10, 100);
  
  // Add some randomness for demo purposes
  const finalScore = Math.min(baseScore + Math.floor(Math.random() * 20), 100);
  
  return finalScore;
}
