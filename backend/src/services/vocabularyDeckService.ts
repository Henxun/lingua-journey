import { AppDataSource } from '../config/database';
import { VocabularyDeck } from '../entities/VocabularyDeck';
import { DeckCard } from '../entities/DeckCard';
import { VocabularyCard } from '../entities/VocabularyCard';

const deckRepository = AppDataSource.getRepository(VocabularyDeck);
const deckCardRepository = AppDataSource.getRepository(DeckCard);

export interface CreateDeckInput {
  name: string;
  description?: string;
  isAuto?: boolean;
  courseId?: string;
}

export async function createDeck(userId: string, input: CreateDeckInput): Promise<VocabularyDeck> {
  const deck = new VocabularyDeck();
  deck.user_id = userId;
  deck.name = input.name;
  deck.description = input.description || null;
  deck.is_auto = input.isAuto || false;
  deck.course_id = input.courseId || null;
  deck.card_count = 0;

  return await deckRepository.save(deck);
}

export async function getDecksByUser(userId: string): Promise<VocabularyDeck[]> {
  return await deckRepository.find({
    where: { user_id: userId },
    order: { created_at: 'DESC' }
  });
}

export async function getDeckById(deckId: string, userId: string): Promise<VocabularyDeck | null> {
  return await deckRepository.findOne({
    where: { id: deckId, user_id: userId }
  });
}

export async function updateDeck(deckId: string, userId: string, updates: Partial<CreateDeckInput>): Promise<VocabularyDeck | null> {
  const deck = await getDeckById(deckId, userId);
  if (!deck) return null;

  if (updates.name !== undefined) deck.name = updates.name;
  if (updates.description !== undefined) deck.description = updates.description;

  return await deckRepository.save(deck);
}

export async function deleteDeck(deckId: string, userId: string): Promise<boolean> {
  const deck = await getDeckById(deckId, userId);
  if (!deck) return false;

  await deckRepository.remove(deck);
  return true;
}

export async function addCardToDeck(deckId: string, cardId: string, userId: string): Promise<boolean> {
  const deck = await getDeckById(deckId, userId);
  if (!deck) return false;

  const existing = await deckCardRepository.findOne({
    where: { deck_id: deckId, card_id: cardId }
  });
  if (existing) return true;

  const deckCard = new DeckCard();
  deckCard.deck_id = deckId;
  deckCard.card_id = cardId;
  await deckCardRepository.save(deckCard);

  deck.card_count += 1;
  await deckRepository.save(deck);

  return true;
}

export async function removeCardFromDeck(deckId: string, cardId: string, userId: string): Promise<boolean> {
  const deck = await getDeckById(deckId, userId);
  if (!deck) return false;

  const deckCard = await deckCardRepository.findOne({
    where: { deck_id: deckId, card_id: cardId }
  });
  if (!deckCard) return true;

  await deckCardRepository.remove(deckCard);

  deck.card_count = Math.max(0, deck.card_count - 1);
  await deckRepository.save(deck);

  return true;
}

export async function getOrCreateAutoDeck(userId: string, courseId: string, courseName: string): Promise<VocabularyDeck> {
  let deck = await deckRepository.findOne({
    where: { user_id: userId, course_id: courseId, is_auto: true }
  });

  if (!deck) {
    deck = await createDeck(userId, {
      name: `${courseName} - 词汇`,
      isAuto: true,
      courseId
    });
  }

  return deck;
}
