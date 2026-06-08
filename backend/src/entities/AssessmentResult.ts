import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';
import { CEFRLevel, SkillType, Question } from './Assessment';

export interface Answer {
  questionId: string;
  answer: string;
  isCorrect?: boolean;
  score?: number;
  feedback?: string;
}

export interface SkillScores {
  listening: number;
  reading: number;
  speaking: number;
  writing: number;
}

@Entity('assessment_results')
export class AssessmentResult {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column()
  assessmentId: string;

  @Column({ type: 'float' })
  score: number;

  @Column({ type: 'json' })
  skillScores: SkillScores;

  @Column({ type: 'json' })
  answers: Answer[];

  @Column({
    type: 'simple-enum',
    enum: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'],
    nullable: true
  })
  recommendedLevel?: CEFRLevel;

  @Column({ type: 'text', nullable: true })
  feedback?: string;

  @Column({ type: 'json', nullable: true })
  recommendations?: string[];

  @Column({ type: 'datetime', nullable: true })
  completedAt: Date;

  @CreateDateColumn()
  createdAt: Date;
}
