import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Course } from './Course';
import { Scene } from './Scene';

export enum LessonType {
  CONVERSATION = 'conversation',
  SCENE = 'scene'
}

@Entity('lessons')
export class Lesson {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Course, course => course.lessons)
  @JoinColumn({ name: 'course_id' })
  course: Course;

  @Column()
  course_id: string;

  @Column({ nullable: false })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ nullable: false })
  order: number;

  @Column({
    type: 'text',
    default: LessonType.CONVERSATION
  })
  type: LessonType;

  @Column({ nullable: true })
  scene_id: string;

  @ManyToOne(() => Scene, { nullable: true })
  @JoinColumn({ name: 'scene_id' })
  scene: Scene;

  @Column({ type: 'json', nullable: true })
  conversation_config: any;
}
