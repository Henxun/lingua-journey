import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { User } from './User';
import { DailyQuest } from './DailyQuest';

@Entity('user_quest_progress')
export class UserQuestProgress {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  user_id: string;

  @Column()
  quest_id: string;

  @Column({ type: 'int', default: 0 })
  progress: number;

  @Column({ default: false })
  completed: boolean;

  @Column({ type: 'date' })
  date: string;

  @CreateDateColumn()
  updated_at: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => DailyQuest)
  @JoinColumn({ name: 'quest_id' })
  quest: DailyQuest;
}
