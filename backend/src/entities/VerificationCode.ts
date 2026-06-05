import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

export enum VerificationCodeType {
  REGISTER = 'register',
  LOGIN = 'login',
  RESET_PASSWORD = 'reset_password'
}

@Entity('verification_codes')
export class VerificationCode {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  email: string;

  @Column()
  code: string;

  @Column({
    type: 'text'
  })
  type: VerificationCodeType;

  @Column()
  expires_at: Date;

  @Column({ default: false })
  is_used: boolean;

  @CreateDateColumn()
  created_at: Date;
}
