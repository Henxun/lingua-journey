import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

export enum QuestType {
  CHECK_IN = 'check_in',
  PRACTICE = 'practice',
  LESSON = 'lesson',
  TIME = 'time'
}

@Entity('daily_quests')
export class DailyQuest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  description: string;

  @Column({
    type: 'simple-enum',
    default: QuestType.PRACTICE
  })
  type: QuestType;

  @Column({ type: 'int' })
  target_value: number;

  @Column({ type: 'int', default: 20 })
  xp_reward: number;

  @Column({ default: true })
  is_active: boolean;
}
