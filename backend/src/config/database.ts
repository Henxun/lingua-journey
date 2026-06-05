import { DataSource } from 'typeorm';
import dotenv from 'dotenv';
import { User } from '../entities/User';
import { VerificationCode } from '../entities/VerificationCode';
import { Conversation } from '../entities/Conversation';

dotenv.config();

export const AppDataSource = new DataSource({
  type: 'better-sqlite3',
  database: './dev.db',
  entities: [User, VerificationCode, Conversation],
  synchronize: true,
  logging: process.env.NODE_ENV === 'development'
});
