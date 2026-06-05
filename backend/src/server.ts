import express from 'express';
import cors from 'cors';
import session from 'express-session';
import dotenv from 'dotenv';
import { AppDataSource } from './config/database';
import authRoutes from './routes/authRoutes';
import conversationRoutes from './routes/conversationRoutes';
import sceneRoutes from './routes/sceneRoutes';
import statsRoutes from './routes/statsRoutes';
import courseRoutes from './routes/courseRoutes';
import { seedCourses } from './seed';

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

AppDataSource.initialize()
  .then(async () => {
    console.log('Database connected successfully');
    await seedCourses();
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Database connection failed:', error);
    process.exit(1);
  });