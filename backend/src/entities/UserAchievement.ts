import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { User } from './User';
import { Achievement } from './Achievement';

@Entity('user_achievements')
export class UserAchievement {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  user_id: string;

  @Column()
  achievement_id: string;

  @CreateDateColumn()
  unlocked_at: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Achievement)
  @JoinColumn({ name: 'achievement_id' })
  achievement: Achievement;
}
