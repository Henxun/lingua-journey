import { Router } from 'express';
import {
  createVocabularyCard,
  listVocabularyCards,
  getVocabularyCard,
  updateVocabularyCard,
  deleteVocabularyCard,
  getDueVocabularyCards,
  reviewVocabularyCard,
  getVocabularyCardsByDeck,
  getVocabularyMasteryStats
} from '../controllers/vocabularyCardController';
import {
  createVocabularyDeck,
  listVocabularyDecks,
  getVocabularyDeck,
  updateVocabularyDeck,
  deleteVocabularyDeck,
  addCardToVocabularyDeck,
  removeCardFromVocabularyDeck,
  getReviewHistory,
  getCardReviewHistory,
  getReviewStatistics
} from '../controllers/vocabularyDeckController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

router.get('/cards/due', authenticate, getDueVocabularyCards);
router.get('/cards/stats/mastery', authenticate, getVocabularyMasteryStats);
router.get('/cards', authenticate, listVocabularyCards);
router.post('/cards', authenticate, createVocabularyCard);
router.get('/cards/:id', authenticate, getVocabularyCard);
router.put('/cards/:id', authenticate, updateVocabularyCard);
router.delete('/cards/:id', authenticate, deleteVocabularyCard);
router.post('/cards/:id/review', authenticate, reviewVocabularyCard);
router.get('/cards/:cardId/reviews', authenticate, getCardReviewHistory);

router.get('/decks', authenticate, listVocabularyDecks);
router.post('/decks', authenticate, createVocabularyDeck);
router.get('/decks/:id', authenticate, getVocabularyDeck);
router.put('/decks/:id', authenticate, updateVocabularyDeck);
router.delete('/decks/:id', authenticate, deleteVocabularyDeck);
router.get('/decks/:deckId/cards', authenticate, getVocabularyCardsByDeck);
router.post('/decks/:deckId/cards/:cardId', authenticate, addCardToVocabularyDeck);
router.delete('/decks/:deckId/cards/:cardId', authenticate, removeCardFromVocabularyDeck);

router.get('/reviews/history', authenticate, getReviewHistory);
router.get('/reviews/stats', authenticate, getReviewStatistics);

export default router;
