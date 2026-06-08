import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum GoalType {
  SHORT_TERM = 'short_term',
  MEDIUM_TERM = 'medium_term',
  LONG_TERM = 'long_term'
}

export enum GoalStatus {
  ACTIVE = 'active',
  COMPLETED = 'completed',
  ABANDONED = 'abandoned'
}

@Entity('learning_goals')
export class LearningGoal {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  user_id: string;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'simple-enum',
    default: GoalType.SHORT_TERM
  })
  goal_type: GoalType;

  @Column({ nullable: true })
  target_date: Date;

  @Column({
    type: 'simple-enum',
    default: GoalStatus.ACTIVE
  })
  status: GoalStatus;

  @Column({ type: 'int', default: 0 })
  progress: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
