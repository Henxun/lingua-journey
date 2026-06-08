import { Router } from 'express';
import { authenticate } from '../middleware/authMiddleware';
import {
  createConversationHandler,
  getConversationHandler,
  getConversationHistoryHandler,
  sendMessageHandler,
  getMessagesHandler,
  completeConversationHandler,
  abandonConversationHandler
} from '../controllers/conversationController';

const router = Router();

// Create a new conversation
router.post('/', authenticate, createConversationHandler);

// Get conversation by ID
router.get('/:id', authenticate, getConversationHandler);

// Get user's conversation history
router.get('/history/me', authenticate, getConversationHistoryHandler);

// Send a message in a conversation
router.post('/:id/messages', authenticate, sendMessageHandler);

// Get messages for a conversation
router.get('/:id/messages', authenticate, getMessagesHandler);

// Complete a conversation
router.put('/:id/complete', authenticate, completeConversationHandler);

// Abandon a conversation
router.delete('/:id', authenticate, abandonConversationHandler);

export default router;
