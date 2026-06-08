import { DataSource } from 'typeorm';
import dotenv from 'dotenv';
import { User } from '../entities/User';
import { VerificationCode } from '../entities/VerificationCode';
import { Conversation } from '../entities/Conversation';
import { Course } from '../entities/Course';
import { Lesson } from '../entities/Lesson';
import { CourseProgress } from '../entities/CourseProgress';
import { Scene } from '../entities/Scene';
import { SceneObject } from '../entities/SceneObject';
import { ConversationSession } from '../entities/ConversationSession';
import { ConversationMessage } from '../entities/ConversationMessage';
import { Achievement } from '../entities/Achievement';
import { UserAchievement } from '../entities/UserAchievement';
import { DailyQuest } from '../entities/DailyQuest';
import { UserQuestProgress } from '../entities/UserQuestProgress';
import { LearningGoal } from '../entities/LearningGoal';
import { LearningPath } from '../entities/LearningPath';
import { RecommendedCourse } from '../entities/RecommendedCourse';
import { VocabularyCard } from '../entities/VocabularyCard';
import { VocabularyDeck } from '../entities/VocabularyDeck';
import { ReviewLog } from '../entities/ReviewLog';
import { DeckCard } from '../entities/DeckCard';

dotenv.config();

export const AppDataSource = new DataSource({
  type: 'better-sqlite3',
  database: './dev.db',
  entities: [User, VerificationCode, Conversation, Course, Lesson, CourseProgress, Scene, SceneObject, ConversationSession, ConversationMessage, Achievement, UserAchievement, DailyQuest, UserQuestProgress, LearningGoal, LearningPath, RecommendedCourse, VocabularyCard, VocabularyDeck, ReviewLog, DeckCard],
  synchronize: true,
  logging: process.env.NODE_ENV === 'development'
});
