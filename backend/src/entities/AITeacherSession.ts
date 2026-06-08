import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

export interface Message {
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
  userId: string;

  @Column()
  topic: string;

  @Column({ type: 'text', nullable: true })
  context?: string;

  @Column({ type: 'json', default: () => "'[]'" })
  messages: Message[];

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
