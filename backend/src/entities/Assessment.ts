import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export type CEFRLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
export type SkillType = 'listening' | 'reading' | 'speaking' | 'writing';

export interface Question {
  id: string;
  type: 'multiple-choice' | 'fill-blank' | 'open-ended';
  skill: SkillType;
  prompt: string;
  options?: string[];
  correctAnswer?: string;
  timeLimit?: number;
  points: number;
  level: CEFRLevel;
}

@Entity('assessments')
export class Assessment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({
    type: 'simple-enum',
    enum: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'],
    default: 'A1'
  })
  level: CEFRLevel;

  @Column({
    type: 'simple-array',
    default: 'listening,reading,speaking,writting'
  })
  skills: SkillType[];

  @Column({ default: 30 })
  timeLimit: number;

  @Column({ type: 'float', default: 70 })
  passingScore: number;

  @Column({ type: 'simple-json' })
  questions: Question[];

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
