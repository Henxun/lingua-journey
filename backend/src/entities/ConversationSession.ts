import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';

export enum ConversationStatus {
  ACTIVE = 'active',
  COMPLETED = 'completed',
  ABANDONED = 'abandoned'
}

@Entity('conversation_sessions')
export class ConversationSession {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  lesson_id: string;

  @Column()
  user_id: string;

  @Column({ type: 'float', nullable: true })
  score: number;

  @Column({
    type: 'simple-enum',
    default: ConversationStatus.ACTIVE
  })
  status: ConversationStatus;

  @CreateDateColumn()
  started_at: Date;

  @Column({ nullable: true })
  completed_at: Date;
}
