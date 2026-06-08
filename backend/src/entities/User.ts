import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum UserLevel {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced'
}

export enum SubscriptionType {
  FREE = 'free',
  PREMIUM = 'premium'
}

export enum AuthProvider {
  EMAIL = 'email',
  GOOGLE = 'google',
  GITHUB = 'github'
}

interface OAuthProfile {
  google?: { id: string; email: string; avatar_url?: string };
  github?: { id: string; email: string; avatar_url?: string };
}

interface LearningStats {
  total_time_minutes: number;
  practice_count: number;
  total_score: number;
  last_practice_date: string;
  streak_days: number;
}

interface GamificationData {
  xp: number;
  weekly_xp: number;
  monthly_xp: number;
  last_check_in: string;
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, nullable: false })
  email: string;

  @Column({ unique: true, nullable: false })
  username: string;

  @Column({ nullable: true })
  password_hash: string;

  @Column({ nullable: false })
  native_language: string;

  @Column({ nullable: false })
  target_language: string;

  @Column({
    type: 'text',
    default: UserLevel.BEGINNER
  })
  level: UserLevel;

  @Column({ nullable: true })
  avatar_url: string;

  @Column({
    type: 'text',
    default: SubscriptionType.FREE
  })
  subscription_type: SubscriptionType;

  @Column({
    type: 'text',
    default: AuthProvider.EMAIL
  })
  auth_provider: AuthProvider;

  @Column({ nullable: true })
  provider_id: string;

  @Column({ default: false })
  email_verified: boolean;

  @Column({ type: 'simple-json', nullable: true })
  oauth_profiles: OAuthProfile;

  @Column({ type: 'simple-json', nullable: true })
  learning_stats: LearningStats;

  @Column({ type: 'simple-json', nullable: true })
  gamification: GamificationData;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
