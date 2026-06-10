import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

export enum AchievementCategory {
  COURSE = 'course',
  PRACTICE = 'practice',
  STREAK = 'streak',
  EXPLORATION = 'exploration',
  CONVERSATION = 'conversation',
  ASSESSMENT = 'assessment',
  VOCABULARY = 'vocabulary',
  AI_TEACHER = 'ai_teacher'
}

export enum AchievementRarity {
  COMMON = 'common',
  RARE = 'rare',
  EPIC = 'epic',
  LEGENDARY = 'legendary'
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
    enum: AchievementCategory,
    default: AchievementCategory.PRACTICE
  })
  category: AchievementCategory;

  @Column({
    type: 'simple-enum',
    enum: AchievementRarity,
    default: AchievementRarity.COMMON
  })
  rarity: AchievementRarity;

  @Column()
  condition_type: string;

  @Column({ type: 'int' })
  condition_value: number;

  @Column({ type: 'int', default: 50 })
  xp_reward: number;
}