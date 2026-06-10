import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from './User';

export interface AITeacherMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

@Entity('ai_teacher_sessions')
export class AITeacherSession {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  user_id: string;

  @Column({ type: 'text', nullable: true })
  topic: string;

  @Column({ type: 'text', nullable: true })
  context: string;

  @Column({ type: 'json', nullable: true })
  messages: AITeacherMessage[];

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @Column({ type: 'int', default: 0 })
  message_count: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => User, user => user.ai_teacher_sessions)
  user: User;
}