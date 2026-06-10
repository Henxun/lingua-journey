import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('voice_sessions')
export class VoiceSession {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  user_id: string;

  @Column()
  character_id: string;

  @Column('simple-array', { nullable: true })
  transcripts: string[];

  @Column('simple-json', { nullable: true })
  ai_responses: string[];

  @Column({ type: 'json', nullable: true })
  evaluation: any;

  @Column({ default: true })
  is_active: boolean;

  @CreateDateColumn()
  created_at: Date;

  @Column({ nullable: true })
  ended_at: Date;
}
