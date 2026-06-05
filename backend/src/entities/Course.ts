import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';
import { Lesson } from './Lesson';

export enum Difficulty {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced'
}

@Entity('courses')
export class Course {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ nullable: false })
  language: string;

  @Column({
    type: 'text',
    default: Difficulty.BEGINNER
  })
  difficulty: Difficulty;

  @Column({ nullable: true })
  thumbnail_url: string;

  @Column({ default: true })
  is_active: boolean;

  @OneToMany(() => Lesson, lesson => lesson.course, { cascade: true })
  lessons: Lesson[];

  @CreateDateColumn()
  created_at: Date;
}
