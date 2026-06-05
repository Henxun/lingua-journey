import { Router } from 'express';
import { authenticate } from '../middleware/authMiddleware';
import {
  startConversation,
  sendMessage,
  getConversationHistory,
  getConversation,
  getScenarios
} from '../controllers/conversationController';

const router = Router();

router.get('/scenarios', authenticate, getScenarios);
router.post('/start', authenticate, startConversation);
router.post('/message', authenticate, sendMessage);
router.get('/history', authenticate, getConversationHistory);
router.get('/:id', authenticate, getConversation);

export default router;