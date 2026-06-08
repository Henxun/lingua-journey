import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './User';

export enum MasteryLevel {
  NEW = 'new',
  LEARNING = 'learning',
  FAMILIAR = 'familiar',
  KNOWN = 'known',
  MASTERED = 'mastered'
}

export enum ReviewQuality {
  AGAIN = 0,
  HARD = 1,
  GOOD = 2,
  EASY = 3
}

@Entity('vocabulary_cards')
export class VocabularyCard {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  user_id: string;

  @Column()
  front: string;

  @Column({ type: 'text' })
  back: string;

  @Column({ type: 'text', nullable: true })
  example: string;

  @Column({
    type: 'simple-enum',
    default: MasteryLevel.NEW
  })
  mastery_level: MasteryLevel;

  @Column({ type: 'float', default: 2.5 })
  ease_factor: number;

  @Column({ type: 'int', default: 0 })
  interval: number;

  @Column({ type: 'int', default: 0 })
  repetitions: number;

  @Column({ type: 'datetime', nullable: true })
  next_review: Date;

  @Column({ type: 'int', default: 0 })
  review_count: number;

  @Column({ type: 'int', default: 0 })
  correct_count: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;
}
