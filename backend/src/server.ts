import express from 'express';
import cors from 'cors';
import session from 'express-session';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { AppDataSource } from './config/database';
import authRoutes from './routes/authRoutes';
import conversationRoutes from './routes/conversationRoutes';
import sceneRoutes from './routes/sceneRoutes';
import statsRoutes from './routes/statsRoutes';
import courseRoutes from './routes/courseRoutes';
import gamificationRoutes from './routes/gamificationRoutes';
import learningGoalRoutes from './routes/learningGoalRoutes';
import learningPathRoutes from './routes/learningPathRoutes';
import recommendationRoutes from './routes/recommendationRoutes';
import vocabularyCardRoutes from './routes/vocabularyCardRoutes';
import aiTeacherRoutes from './routes/aiTeacherRoutes';
import assessmentRoutes from './routes/assessmentRoutes';
import progressRoutes from './routes/progressRoutes';
import { seedCourses } from './seed';
import { seedAchievements, seedDailyQuests } from './services/gamificationService';
import { VoiceServer } from './servers/voiceServer';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use(session({
  secret: process.env.JWT_SECRET || 'fallback-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: process.env.NODE_ENV === 'production' }
}));

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/conversations', conversationRoutes);
app.use('/api/scenes', sceneRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/gamification', gamificationRoutes);
app.use('/api/learning/goals', learningGoalRoutes);
app.use('/api/learning/path', learningPathRoutes);
app.use('/api/learning/recommendations', recommendationRoutes);
app.use('/api/vocabulary', vocabularyCardRoutes);
app.use('/api/ai-teacher', aiTeacherRoutes);
app.use('/api/assessments', assessmentRoutes);
app.use('/api/progress', progressRoutes);

AppDataSource.initialize()
  .then(async () => {
    console.log('Database connected successfully');
    await seedCourses();
    await seedAchievements();
    await seedDailyQuests();
    
    // Create HTTP server for WebSocket support
    const server = createServer(app);
    
    // Initialize Voice WebSocket Server
    new VoiceServer(server);
    
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log('Voice WebSocket ready at ws://localhost:' + PORT + '/voice');
    });
  })
  .catch((error) => {
    console.error('Database connection failed:', error);
    process.exit(1);
  });
