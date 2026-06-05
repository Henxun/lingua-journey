import { DataSource } from 'typeorm';
import dotenv from 'dotenv';
import { User } from '../entities/User';
import { VerificationCode } from '../entities/VerificationCode';
import { Conversation } from '../entities/Conversation';
import { Course } from '../entities/Course';
import { Lesson } from '../entities/Lesson';
import { CourseProgress } from '../entities/CourseProgress';

dotenv.config();

export const AppDataSource = new DataSource({
  type: 'better-sqlite3',
  database: './dev.db',
  entities: [User, VerificationCode, Conversation, Course, Lesson, CourseProgress],
  synchronize: true,
  logging: process.env.NODE_ENV === 'development'
});
