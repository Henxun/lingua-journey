import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

export enum AchievementCategory {
  COURSE = 'course',
  PRACTICE = 'practice',
  STREAK = 'streak',
  EXPLORATION = 'exploration'
}

@Entity('achievements')
export class Achievement {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  description: string;

  @Column({ nullable: true })
  icon: string;

  @Column({
    type: 'simple-enum',
    default: AchievementCategory.PRACTICE
  })
  category: AchievementCategory;

  @Column()
  condition_type: string;

  @Column({ type: 'int' })
  condition_value: number;

  @Column({ type: 'int', default: 50 })
  xp_reward: number;
}
