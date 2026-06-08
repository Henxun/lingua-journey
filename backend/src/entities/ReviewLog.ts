import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './User';
import { VocabularyCard } from './VocabularyCard';

@Entity('review_logs')
export class ReviewLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  user_id: string;

  @Column()
  card_id: string;

  @Column({ type: 'int' })
  quality: number;

  @Column({ type: 'float' })
  ease_factor_before: number;

  @Column({ type: 'int' })
  interval_before: number;

  @Column({ type: 'float', nullable: true })
  ease_factor_after: number;

  @Column({ type: 'int', nullable: true })
  interval_after: number;

  @Column({ nullable: true })
  next_review_after: Date;

  @CreateDateColumn()
  reviewed_at: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => VocabularyCard, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'card_id' })
  card: VocabularyCard;
}
