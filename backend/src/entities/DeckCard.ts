import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { VocabularyCard } from './VocabularyCard';
import { VocabularyDeck } from './VocabularyDeck';

@Entity('deck_cards')
export class DeckCard {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  deck_id: string;

  @Column()
  card_id: string;

  @CreateDateColumn()
  added_at: Date;

  @ManyToOne(() => VocabularyDeck, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'deck_id' })
  deck: VocabularyDeck;

  @ManyToOne(() => VocabularyCard, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'card_id' })
  card: VocabularyCard;
}
