import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './User';
import { LearningGoal } from './LearningGoal';

export enum PathStatus {
  ACTIVE = 'active',
  COMPLETED = 'completed',
  ABANDONED = 'abandoned'
}

@Entity('learning_paths')
export class LearningPath {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  user_id: string;

  @Column({ nullable: true })
  goal_id: string;

  @Column({ type: 'simple-json', default: '[]' })
  course_order: string[];

  @Column({ type: 'int', default: 0 })
  current_position: number;

  @Column({
    type: 'simple-enum',
    default: PathStatus.ACTIVE
  })
  status: PathStatus;

  @CreateDateColumn()
  generated_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => LearningGoal)
  @JoinColumn({ name: 'goal_id' })
  goal: LearningGoal;
}
