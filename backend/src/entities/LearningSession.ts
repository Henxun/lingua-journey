import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

export type SessionType = 'conversation' | 'assessment' | 'vocabulary' | 'scene' | 'ai_teacher';

@Entity('learning_sessions')
export class LearningSession {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  user_id: string;

  @Column({
    type: 'simple-enum',
    enum: ['conversation', 'assessment', 'vocabulary', 'scene', 'ai_teacher']
  })
  session_type: SessionType;

  @Column({ type: 'datetime' })
  started_at: Date;

  @Column({ type: 'datetime', nullable: true })
  ended_at: Date;

  @Column({ type: 'int', default: 0 })
  duration_minutes: number;

  @Column({ type: 'int', default: 0 })
  activity_count: number;

  @Column({ type: 'float', default: 0 })
  accuracy_rate: number;

  @Column({ type: 'int', default: 0 })
  xp_earned: number;

  @Column({ type: 'simple-json', nullable: true })
  metadata: Record<string, any> | null;

  @CreateDateColumn()
  created_at: Date;
}