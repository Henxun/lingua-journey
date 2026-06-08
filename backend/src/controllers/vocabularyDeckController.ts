import { Request, Response } from 'express';
import {
  createDeck,
  getDecksByUser,
  getDeckById,
  updateDeck,
  deleteDeck,
  addCardToDeck,
  removeCardFromDeck,
  CreateDeckInput
} from '../services/vocabularyDeckService';
import {
  getReviewHistoryByCard,
  getReviewHistoryByUser,
  getReviewStats
} from '../services/reviewLogService';

export async function createVocabularyDeck(req: Request, res: Response) {
  try {
    const userId = (req as any).user.id;
    const input: CreateDeckInput = req.body;
    const deck = await createDeck(userId, input);
    res.status(201).json(deck);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
}

export async function listVocabularyDecks(req: Request, res: Response) {
  try {
    const userId = (req as any).user.id;
    const decks = await getDecksByUser(userId);
    res.status(200).json(decks);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
}

export async function getVocabularyDeck(req: Request, res: Response) {
  try {
    const userId = (req as any).user.id;
    const { id } = req.params;
    const deck = await getDeckById(id, userId);
    if (!deck) {
      return res.status(404).json({ error: 'Deck not found' });
    }
    res.status(200).json(deck);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
}

export async function updateVocabularyDeck(req: Request, res: Response) {
  try {
    const userId = (req as any).user.id;
    const { id } = req.params;
    const updates = req.body;
    const deck = await updateDeck(id, userId, updates);
    if (!deck) {
      return res.status(404).json({ error: 'Deck not found' });
    }
    res.status(200).json(deck);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
}

export async function deleteVocabularyDeck(req: Request, res: Response) {
  try {
    const userId = (req as any).user.id;
    const { id } = req.params;
    const success = await deleteDeck(id, userId);
    if (!success) {
      return res.status(404).json({ error: 'Deck not found' });
    }
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
}

export async function addCardToVocabularyDeck(req: Request, res: Response) {
  try {
    const userId = (req as any).user.id;
    const { deckId, cardId } = req.params;
    const success = await addCardToDeck(deckId, cardId, userId);
    if (!success) {
      return res.status(404).json({ error: 'Deck not found' });
    }
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
}

export async function removeCardFromVocabularyDeck(req: Request, res: Response) {
  try {
    const userId = (req as any).user.id;
    const { deckId, cardId } = req.params;
    const success = await removeCardFromDeck(deckId, cardId, userId);
    if (!success) {
      return res.status(404).json({ error: 'Deck not found' });
    }
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
}

export async function getReviewHistory(req: Request, res: Response) {
  try {
    const userId = (req as any).user.id;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 100;
    const history = await getReviewHistoryByUser(userId, limit);
    res.status(200).json(history);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
}

export async function getCardReviewHistory(req: Request, res: Response) {
  try {
    const { cardId } = req.params;
    const history = await getReviewHistoryByCard(cardId);
    res.status(200).json(history);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
}

export async function getReviewStatistics(req: Request, res: Response) {
  try {
    const userId = (req as any).user.id;
    const days = req.query.days ? parseInt(req.query.days as string) : 7;
    const stats = await getReviewStats(userId, days);
    res.status(200).json(stats);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
}
