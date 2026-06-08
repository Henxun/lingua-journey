import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';

export enum MessageRole {
  USER = 'user',
  AI = 'ai'
}

@Entity('conversation_messages')
export class ConversationMessage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  session_id: string;

  @Column({
    type: 'simple-enum',
    default: MessageRole.USER
  })
  role: MessageRole;

  @Column({ type: 'text' })
  content: string;

  @CreateDateColumn()
  created_at: Date;
}
