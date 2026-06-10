import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { AssessmentResult } from './AssessmentResult';

export type CEFRLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

export type QuestionType = 'multiple_choice' | 'fill_in_blank' | 'short_answer';

export interface Question {
  id: string;
  type: QuestionType;
  question: string;
  options?: string[];
  correctAnswer: string | string[];
  explanation: string;
  skill: string;
  difficulty: number;
}

@Entity('assessments')
export class Assessment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'simple-enum', enum: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] })
  level: CEFRLevel;

  @Column('simple-array')
  skills: string[];

  @Column({ type: 'int', default: 30 })
  time_limit: number;

  @Column({ type: 'int', default: 60 })
  passing_score: number;

  @Column({ type: 'int', default: 10 })
  question_count: number;

  @Column({ type: 'json', nullable: true })
  questions: Question[];

  @Column({ type: 'boolean', default: false })
  is_template: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToMany(() => AssessmentResult, result => result.assessment)
  results: AssessmentResult[];
}