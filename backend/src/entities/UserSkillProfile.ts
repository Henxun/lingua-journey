import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from './User';

export type SkillLevel = 'beginner' | 'elementary' | 'intermediate' | 'upper_intermediate' | 'advanced' | 'master';

@Entity('user_skill_profiles')
export class UserSkillProfile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  user_id: string;

  @Column()
  skill: string;

  @Column({ type: 'simple-enum', enum: ['beginner', 'elementary', 'intermediate', 'upper_intermediate', 'advanced', 'master'] })
  level: SkillLevel;

  @Column({ type: 'float', default: 0 })
  score: number;

  @Column({ type: 'int', default: 0 })
  practice_count: number;

  @Column({ type: 'int', default: 0 })
  correct_count: number;

  @Column({ type: 'float', default: 0 })
  trend: number;

  @Column({ type: 'datetime', nullable: true })
  last_assessed: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => User, user => user.skill_profiles)
  user: User;
}