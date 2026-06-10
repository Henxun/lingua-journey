import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { Assessment } from './Assessment';
import { User } from './User';

@Entity('assessment_results')
export class AssessmentResult {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  user_id: string;

  @Column()
  assessment_id: string;

  @Column({ type: 'int' })
  score: number;

  @Column({ type: 'json', nullable: true })
  skill_scores: Record<string, number>;

  @Column({ type: 'json', nullable: true })
  answers: Record<string, string | string[]>;

  @Column({ type: 'json', nullable: true })
  feedback: Record<string, string>;

  @Column({ type: 'boolean', default: false })
  passed: boolean;

  @Column({ type: 'int', nullable: true })
  time_taken: number;

  @CreateDateColumn()
  completed_at: Date;

  @ManyToOne(() => User, user => user.assessment_results)
  user: User;

  @ManyToOne(() => Assessment, assessment => assessment.results)
  assessment: Assessment;
}