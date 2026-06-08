import { Request, Response } from 'express';
import {
  createCard,
  getCardsByUser,
  getCardById,
  updateCard,
  deleteCard,
  getDueCards,
  reviewCard,
  getCardsByDeck,
  getMasteryStats,
  CreateCardInput
} from '../services/vocabularyCardService';
import { ReviewQuality } from '../entities/VocabularyCard';

export async function createVocabularyCard(req: Request, res: Response) {
  try {
    const userId = (req as any).user.id;
    const input: CreateCardInput = req.body;
    const card = await createCard(userId, input);
    res.status(201).json(card);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
}

export async function listVocabularyCards(req: Request, res: Response) {
  try {
    const userId = (req as any).user.id;
    const cards = await getCardsByUser(userId);
    res.status(200).json(cards);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
}

export async function getVocabularyCard(req: Request, res: Response) {
  try {
    const userId = (req as any).user.id;
    const { id } = req.params;
    const card = await getCardById(id, userId);
    if (!card) {
      return res.status(404).json({ error: 'Card not found' });
    }
    res.status(200).json(card);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
}

export async function updateVocabularyCard(req: Request, res: Response) {
  try {
    const userId = (req as any).user.id;
    const { id } = req.params;
    const updates = req.body;
    const card = await updateCard(id, userId, updates);
    if (!card) {
      return res.status(404).json({ error: 'Card not found' });
    }
    res.status(200).json(card);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
}

export async function deleteVocabularyCard(req: Request, res: Response) {
  try {
    const userId = (req as any).user.id;
    const { id } = req.params;
    const success = await deleteCard(id, userId);
    if (!success) {
      return res.status(404).json({ error: 'Card not found' });
    }
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
}

export async function getDueVocabularyCards(req: Request, res: Response) {
  try {
    const userId = (req as any).user.id;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 100;
    const cards = await getDueCards(userId, limit);
    res.status(200).json(cards);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
}

export async function reviewVocabularyCard(req: Request, res: Response) {
  try {
    const userId = (req as any).user.id;
    const { id } = req.params;
    const { quality } = req.body;
    const card = await reviewCard(id, userId, quality as ReviewQuality);
    res.status(200).json(card);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
}

export async function getVocabularyCardsByDeck(req: Request, res: Response) {
  try {
    const userId = (req as any).user.id;
    const { deckId } = req.params;
    const cards = await getCardsByDeck(deckId, userId);
    res.status(200).json(cards);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
}

export async function getVocabularyMasteryStats(req: Request, res: Response) {
  try {
    const userId = (req as any).user.id;
    const stats = await getMasteryStats(userId);
    res.status(200).json(stats);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
}
