import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from './User';
import { Course } from './Course';
import { Lesson } from './Lesson';

@Entity('course_progress')
export class CourseProgress {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column()
  user_id: string;

  @ManyToOne(() => Course)
  @JoinColumn({ name: 'course_id' })
  course: Course;

  @Column()
  course_id: string;

  @ManyToOne(() => Lesson, { nullable: true })
  @JoinColumn({ name: 'current_lesson_id' })
  current_lesson: Lesson;

  @Column({ nullable: true })
  current_lesson_id: string;

  @Column({ type: 'simple-json', default: '[]' })
  completed_lessons: string[];

  @CreateDateColumn()
  started_at: Date;

  @Column({ nullable: true })
  completed_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
