import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { CEFRLevel, SkillType } from './Assessment';

export type SkillTrend = 'improving' | 'stable' | 'declining';

@Entity('user_skill_profiles')
export class UserSkillProfile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column({
    type: 'simple-enum',
    enum: ['listening', 'reading', 'speaking', 'writing']
  })
  skill: SkillType;

  @Column({
    type: 'simple-enum',
    enum: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'],
    default: 'A1'
  })
  level: CEFRLevel;

  @Column({ type: 'float', default: 0 })
  score: number;

  @Column({ type: 'datetime', nullable: true })
  lastAssessed?: Date;

  @Column({
    type: 'simple-enum',
    enum: ['improving', 'stable', 'declining'],
    default: 'stable'
  })
  trend: SkillTrend;

  @Column({ type: 'simple-json', default: '[]' })
  historicalScores: { date: Date; score: number }[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}