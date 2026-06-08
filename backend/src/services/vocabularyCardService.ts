import { AppDataSource } from '../config/database';
import { VocabularyCard, ReviewQuality, MasteryLevel } from '../entities/VocabularyCard';
import { ReviewLog } from '../entities/ReviewLog';
import { DeckCard } from '../entities/DeckCard';
import { VocabularyDeck } from '../entities/VocabularyDeck';

const cardRepository = AppDataSource.getRepository(VocabularyCard);
const reviewLogRepository = AppDataSource.getRepository(ReviewLog);
const deckCardRepository = AppDataSource.getRepository(DeckCard);

export interface CreateCardInput {
  front: string;
  back: string;
  example?: string;
  deckId?: string;
}

export async function createCard(userId: string, input: CreateCardInput): Promise<VocabularyCard> {
  const card = new VocabularyCard();
  card.user_id = userId;
  card.front = input.front;
  card.back = input.back;
  card.example = input.example || null;
  card.mastery_level = MasteryLevel.NEW;
  card.ease_factor = 2.5;
  card.interval = 0;
  card.repetitions = 0;
  card.next_review = new Date();

  const savedCard = await cardRepository.save(card);

  if (input.deckId) {
    const deckCard = new DeckCard();
    deckCard.deck_id = input.deckId;
    deckCard.card_id = savedCard.id;
    await deckCardRepository.save(deckCard);
    
    await updateDeckCardCount(input.deckId);
  }

  return savedCard;
}

export async function getCardsByUser(userId: string): Promise<VocabularyCard[]> {
  return await cardRepository.find({
    where: { user_id: userId },
    order: { created_at: 'DESC' }
  });
}

export async function getCardById(cardId: string, userId: string): Promise<VocabularyCard | null> {
  return await cardRepository.findOne({
    where: { id: cardId, user_id: userId }
  });
}

export async function updateCard(cardId: string, userId: string, updates: Partial<CreateCardInput>): Promise<VocabularyCard | null> {
  const card = await getCardById(cardId, userId);
  if (!card) return null;

  if (updates.front !== undefined) card.front = updates.front;
  if (updates.back !== undefined) card.back = updates.back;
  if (updates.example !== undefined) card.example = updates.example;

  return await cardRepository.save(card);
}

export async function deleteCard(cardId: string, userId: string): Promise<boolean> {
  const card = await getCardById(cardId, userId);
  if (!card) return false;

  const deckCards = await deckCardRepository.find({ where: { card_id: cardId } });
  for (const dc of deckCards) {
    await updateDeckCardCount(dc.deck_id, -1);
  }

  await cardRepository.remove(card);
  return true;
}

export async function getDueCards(userId: string, limit: number = 100): Promise<VocabularyCard[]> {
  const now = new Date();
  return await cardRepository
    .createQueryBuilder('card')
    .where('card.user_id = :userId', { userId })
    .andWhere('card.next_review <= :now', { now })
    .orderBy('card.next_review', 'ASC')
    .limit(limit)
    .getMany();
}

export async function reviewCard(cardId: string, userId: string, quality: ReviewQuality): Promise<VocabularyCard> {
  const card = await getCardById(cardId, userId);
  if (!card) throw new Error('Card not found');

  const easeBefore = card.ease_factor;
  const intervalBefore = card.interval;

  const { newInterval, newEaseFactor, newRepetitions, nextReviewDate, newMasteryLevel } = calculateReview(
    card.interval,
    card.ease_factor,
    card.repetitions,
    quality
  );

  const reviewLog = new ReviewLog();
  reviewLog.user_id = userId;
  reviewLog.card_id = cardId;
  reviewLog.quality = quality;
  reviewLog.ease_factor_before = easeBefore;
  reviewLog.interval_before = intervalBefore;
  reviewLog.ease_factor_after = newEaseFactor;
  reviewLog.interval_after = newInterval;
  reviewLog.next_review_after = nextReviewDate;
  await reviewLogRepository.save(reviewLog);

  card.interval = newInterval;
  card.ease_factor = newEaseFactor;
  card.repetitions = newRepetitions;
  card.next_review = nextReviewDate;
  card.mastery_level = newMasteryLevel;
  card.review_count += 1;
  if (quality >= ReviewQuality.GOOD) {
    card.correct_count += 1;
  }

  return await cardRepository.save(card);
}

function calculateReview(
  currentInterval: number,
  currentEaseFactor: number,
  currentRepetitions: number,
  quality: ReviewQuality
) {
  let newInterval: number;
  let newEaseFactor = currentEaseFactor;
  let newRepetitions = currentRepetitions;
  let newMasteryLevel: MasteryLevel;

  if (quality < ReviewQuality.GOOD) {
    newRepetitions = 0;
    newInterval = 0;
    newMasteryLevel = MasteryLevel.LEARNING;
  } else {
    if (currentRepetitions === 0) {
      newInterval = 1;
    } else if (currentRepetitions === 1) {
      newInterval = 6;
    } else {
      newInterval = Math.round(currentInterval * currentEaseFactor);
    }
    newRepetitions = currentRepetitions + 1;

    if (newRepetitions === 0) {
      newMasteryLevel = MasteryLevel.NEW;
    } else if (newRepetitions < 3) {
      newMasteryLevel = MasteryLevel.LEARNING;
    } else if (newRepetitions < 5) {
      newMasteryLevel = MasteryLevel.FAMILIAR;
    } else if (newRepetitions < 8) {
      newMasteryLevel = MasteryLevel.KNOWN;
    } else {
      newMasteryLevel = MasteryLevel.MASTERED;
    }
  }

  newEaseFactor = newEaseFactor + (0.1 - (4 - quality) * (0.08 + (4 - quality) * 0.02));
  if (newEaseFactor < 1.3) newEaseFactor = 1.3;

  const nextReviewDate = new Date();
  nextReviewDate.setDate(nextReviewDate.getDate() + newInterval);

  return {
    newInterval,
    newEaseFactor,
    newRepetitions,
    nextReviewDate,
    newMasteryLevel
  };
}

async function updateDeckCardCount(deckId: string, delta: number = 1): Promise<void> {
  const deckRepository = AppDataSource.getRepository(VocabularyDeck);
  const deck = await deckRepository.findOne({ where: { id: deckId } });
  if (deck) {
    deck.card_count = Math.max(0, deck.card_count + delta);
    await deckRepository.save(deck);
  }
}

export async function getCardsByDeck(deckId: string, userId: string): Promise<VocabularyCard[]> {
  const deckCards = await deckCardRepository.find({
    where: { deck_id: deckId },
    relations: ['card']
  });

  return deckCards
    .map(dc => dc.card)
    .filter(card => card.user_id === userId);
}

export async function getMasteryStats(userId: string): Promise<Record<MasteryLevel, number>> {
  const cards = await getCardsByUser(userId);
  const stats: Record<MasteryLevel, number> = {
    [MasteryLevel.NEW]: 0,
    [MasteryLevel.LEARNING]: 0,
    [MasteryLevel.FAMILIAR]: 0,
    [MasteryLevel.KNOWN]: 0,
    [MasteryLevel.MASTERED]: 0
  };

  for (const card of cards) {
    stats[card.mastery_level] = (stats[card.mastery_level] || 0) + 1;
  }

  return stats;
}
