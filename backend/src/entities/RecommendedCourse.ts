import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './User';
import { Course } from './Course';

@Entity('recommended_courses')
export class RecommendedCourse {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  user_id: string;

  @Column()
  course_id: string;

  @Column({ type: 'float', default: 0 })
  score: number;

  @Column({ default: 'recommended' })
  reason: string;

  @Column({ default: false })
  user_completed: boolean;

  @Column({ default: false })
  user_skipped: boolean;

  @CreateDateColumn()
  created_at: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Course)
  @JoinColumn({ name: 'course_id' })
  course: Course;
}
