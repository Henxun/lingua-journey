import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export type ReminderType = 'daily' | 'goal' | 'inactivity' | 'achievement';

@Entity('user_reminders')
export class UserReminder {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  user_id: string;

  @Column({
    type: 'simple-enum',
    enum: ['daily', 'goal', 'inactivity', 'achievement']
  })
  reminder_type: ReminderType;

  @Column({ type: 'time', nullable: true })
  preferred_time: string | null;

  @Column({ default: true })
  enabled: boolean;

  @Column({ type: 'datetime', nullable: true })
  last_sent: Date | null;

  @Column({ nullable: true })
  message_template: string | null;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}