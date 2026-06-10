---
change: ai-teacher-assessment
design-doc: openspec/changes/ai-teacher-assessment/design.md
base-ref: fb7f7442d92f036d6e0f5a8cb0241fbf1cae6250
---

# AI Teacher & Assessment System Implementation Plan

&gt; **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build an AI-powered language teacher and comprehensive assessment system that provides personalized tutoring, evaluates all four language skills (listening, reading, speaking, writing), and tracks progress against CEFR standards.

**Architecture:** Backend services using Express and TypeORM for data persistence, OpenAI for AI interactions, frontend using React/Next.js for the user interface.

**Tech Stack:** TypeScript, Express, TypeORM, OpenAI API, React, Next.js

---

## File Structure

### Backend Files

**Entities &amp; Database:**
- `backend/src/entities/Assessment.ts` - Assessment template entity
- `backend/src/entities/AssessmentResult.ts` - Individual assessment results
- `backend/src/entities/AITeacherSession.ts` - AI teacher conversation sessions
- `backend/src/entities/UserSkillProfile.ts` - User skill profile tracking
- `backend/src/config/database.ts` - Register new entities

**Services:**
- `backend/src/services/aiTeacherService.ts` - AI teacher core service
- `backend/src/services/aiTeacherPrompts.ts` - AI teaching prompt templates
- `backend/src/services/assessmentService.ts` - Assessment generation and submission
- `backend/src/services/questionGenerator.ts` - Question generation service
- `backend/src/services/gradingService.ts` - Answer grading and scoring
- `backend/src/services/analyticsService.ts` - Progress analytics and insights

**Controllers &amp; Routes:**
- `backend/src/controllers/aiTeacherController.ts` - AI teacher API handlers
- `backend/src/controllers/assessmentController.ts` - Assessment API handlers
- `backend/src/controllers/progressController.ts` - Progress analytics API handlers
- `backend/src/routes/aiTeacherRoutes.ts` - AI teacher routes
- `backend/src/routes/assessmentRoutes.ts` - Assessment routes
- `backend/src/routes/progressRoutes.ts` - Progress analytics routes
- `backend/src/server.ts` - Register new routes

### Frontend Files

**API Integration:**
- `frontend/src/lib/api.ts` - Add vocabulary API functions

**Pages:**
- `frontend/src/pages/ai-teacher/index.tsx` - AI teacher main page
- `frontend/src/pages/assessment/index.tsx` - Assessment dashboard
- `frontend/src/pages/progress/index.tsx` - Progress dashboard

**Navigation:**
- `frontend/src/pages/index.tsx` - Add AI teacher link
- `frontend/src/pages/profile.tsx` - Add progress link

---

## Phase 1: Data Models &amp; Database

### Task 1.1: Create Assessment Entity

**Files:**
- Create: `backend/src/entities/Assessment.ts`

- [ ] **Step 1: Create Assessment entity with CEFR support**

```typescript
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export type CEFRLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
export type SkillType = 'listening' | 'reading' | 'speaking' | 'writing';

export interface Question {
  id: string;
  type: 'multiple-choice' | 'fill-blank' | 'open-ended';
  skill: SkillType;
  prompt: string;
  options?: string[];
  correctAnswer?: string;
  timeLimit?: number;
  points: number;
  level: CEFRLevel;
}

@Entity('assessments')
export class Assessment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({
    type: 'simple-enum',
    enum: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'],
    default: 'A1'
  })
  level: CEFRLevel;

  @Column({
    type: 'simple-array',
    default: ['listening', 'reading', 'speaking', 'writing']
  })
  skills: SkillType[];

  @Column({ default: 30 })
  timeLimit: number;

  @Column({ type: 'float', default: 70 })
  passingScore: number;

  @Column({ type: 'json' })
  questions: Question[];

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

- [ ] **Step 2: Commit**

```bash
cd e:/workspace/lingua-journey
git add backend/src/entities/Assessment.ts
git commit -m "feat: add Assessment entity"
```

### Task 1.2: Create AssessmentResult Entity

**Files:**
- Create: `backend/src/entities/AssessmentResult.ts`

- [ ] **Step 1: Create AssessmentResult entity**

```typescript
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';
import { CEFRLevel, SkillType, Question } from './Assessment';

export interface Answer {
  questionId: string;
  answer: string;
  isCorrect?: boolean;
  score?: number;
  feedback?: string;
}

export interface SkillScores {
  listening: number;
  reading: number;
  speaking: number;
  writing: number;
}

@Entity('assessment_results')
export class AssessmentResult {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column()
  assessmentId: string;

  @Column({ type: 'float' })
  score: number;

  @Column({ type: 'json' })
  skillScores: SkillScores;

  @Column({ type: 'json' })
  answers: Answer[];

  @Column({
    type: 'simple-enum',
    enum: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'],
    nullable: true
  })
  recommendedLevel?: CEFRLevel;

  @Column({ type: 'text', nullable: true })
  feedback?: string;

  @Column({ type: 'json', nullable: true })
  recommendations?: string[];

  @Column({ type: 'datetime', nullable: true })
  completedAt: Date;

  @CreateDateColumn()
  createdAt: Date;
}
```

- [ ] **Step 2: Commit**

```bash
cd e:/workspace/lingua-journey
git add backend/src/entities/AssessmentResult.ts
git commit -m "feat: add AssessmentResult entity"
```

### Task 1.3: Create AITeacherSession Entity

**Files:**
- Create: `backend/src/entities/AITeacherSession.ts`

- [ ] **Step 1: Create AITeacherSession entity**

```typescript
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

@Entity('ai_teacher_sessions')
export class AITeacherSession {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column()
  topic: string;

  @Column({ type: 'text', nullable: true })
  context?: string;

  @Column({ type: 'json', default: () => "'[]'" })
  messages: Message[];

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
```

- [ ] **Step 2: Commit**

```bash
cd e:/workspace/lingua-journey
git add backend/src/entities/AITeacherSession.ts
git commit -m "feat: add AITeacherSession entity"
```

### Task 1.4: Create UserSkillProfile Entity

**Files:**
- Create: `backend/src/entities/UserSkillProfile.ts`

- [ ] **Step 1: Create UserSkillProfile entity**

```typescript
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { CEFRLevel, SkillType } from './Assessment';

export type SkillTrend = 'improving' | 'stable' | 'declining';

@Entity('user_skill_profiles')
export class UserSkillProfile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column({
    type: 'simple-enum',
    enum: ['listening', 'reading', 'speaking', 'writing']
  })
  skill: SkillType;

  @Column({
    type: 'simple-enum',
    enum: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'],
    default: 'A1'
  })
  level: CEFRLevel;

  @Column({ type: 'float', default: 0 })
  score: number;

  @Column({ type: 'datetime', nullable: true })
  lastAssessed?: Date;

  @Column({
    type: 'simple-enum',
    enum: ['improving', 'stable', 'declining'],
    default: 'stable'
  })
  trend: SkillTrend;

  @Column({ type: 'json', default: () => "'[]'" })
  historicalScores: { date: Date; score: number }[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

- [ ] **Step 2: Commit**

```bash
cd e:/workspace/lingua-journey
git add backend/src/entities/UserSkillProfile.ts
git commit -m "feat: add UserSkillProfile entity"
```

### Task 1.5: Update Database Configuration

**Files:**
- Modify: `backend/src/config/database.ts`

- [ ] **Step 1: Add new entities to database config**

```typescript
import { Assessment } from '../entities/Assessment';
import { AssessmentResult } from '../entities/AssessmentResult';
import { AITeacherSession } from '../entities/AITeacherSession';
import { UserSkillProfile } from '../entities/UserSkillProfile';

export const AppDataSource = new DataSource({
  type: 'sqlite',
  database: 'lingua_journey.db',
  entities: [
    // ... existing entities
    Assessment,
    AssessmentResult,
    AITeacherSession,
    UserSkillProfile,
  ],
  synchronize: true,
  logging: process.env.NODE_ENV === 'development',
});
```

- [ ] **Step 2: Commit**

```bash
cd e:/workspace/lingua-journey
git add backend/src/config/database.ts
git commit -m "feat: register AI teacher assessment entities in database"
```

---

## Phase 2: AI Teacher Service

### Task 2.1: Create AI Teacher Prompts

**Files:**
- Create: `backend/src/services/aiTeacherPrompts.ts`

- [ ] **Step 1: Create prompt templates**

```typescript
export interface AIContext {
  targetLanguage: string;
  nativeLanguage: string;
  cefrLevel: string;
  topic?: string;
  recentLesson?: string;
  learningGoals?: string;
}

export function createSystemPrompt(context: AIContext): string {
  return `You are an expert language teacher specializing in ${context.targetLanguage}.
Your student is at ${context.cefrLevel} level, with ${context.nativeLanguage} as their native language.

Teaching Principles:
1. Explain concepts clearly in ${context.nativeLanguage}
2. Provide examples in ${context.targetLanguage}
3. Be encouraging and supportive
4. Adapt explanations to student level
5. Ask follow-up questions to check understanding

${context.topic ? `Current topic: ${context.topic}` : ''}
${context.recentLesson ? `Recent lesson: ${context.recentLesson}` : ''}
${context.learningGoals ? `Student goals: ${context.learningGoals}` : ''}

Remember: You are teaching, not testing. Focus on understanding, not just correct answers.
Keep responses conversational and engaging.`;
}

export function createGrammarExplanationPrompt(topic: string, context: AIContext): string {
  return `Explain the ${topic} grammar concept clearly to a ${context.cefrLevel} level learner.

Please provide:
1. A clear explanation in ${context.nativeLanguage}
2. 3-5 examples in ${context.targetLanguage}
3. Common mistakes to avoid
4. A simple practice question to check understanding

Format your response in a friendly, conversational tone.`;
}

export function createVocabularyExplanationPrompt(word: string, context: AIContext): string {
  return `Explain the word "${word}" to a ${context.cefrLevel} level learner.

Please provide:
1. Clear definition in ${context.nativeLanguage}
2. 2-3 example sentences in ${context.targetLanguage}
3. Synonyms and related words
4. Pronunciation tips (if applicable)

Make it practical and easy to remember!`;
}

export function createErrorCorrectionPrompt(userMessage: string, context: AIContext): string {
  return `A ${context.cefrLevel} level student wrote: "${userMessage}"

Please:
1. Identify any grammar or vocabulary mistakes
2. Provide the corrected version
3. Explain the mistakes gently in ${context.nativeLanguage}
4. Keep encouragement positive and supportive

Focus on helping them improve without discouraging them!`;
}

export function createPracticeQuestionPrompt(topic: string, context: AIContext): string {
  return `Create a practice question for a ${context.cefrLevel} level learner about "${topic}".

Please provide:
1. The question in ${context.targetLanguage}
2. Clear instructions in ${context.nativeLanguage}
3. The correct answer
4. Why that answer is correct

Make it engaging and appropriate for their level!`;
}
```

- [ ] **Step 2: Commit**

```bash
cd e:/workspace/lingua-journey
git add backend/src/services/aiTeacherPrompts.ts
git commit -m "feat: add AI teacher prompt templates"
```

### Task 2.2: Create AI Teacher Service

**Files:**
- Create: `backend/src/services/aiTeacherService.ts`

- [ ] **Step 1: Create AI teacher service**

```typescript
import { AppDataSource } from '../config/database';
import { AITeacherSession, Message } from '../entities/AITeacherSession';
import OpenAI from 'openai';
import dotenv from 'dotenv';
import {
  createSystemPrompt,
  createGrammarExplanationPrompt,
  createVocabularyExplanationPrompt,
  createErrorCorrectionPrompt,
  createPracticeQuestionPrompt,
  AIContext
} from './aiTeacherPrompts';

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const sessionRepository = AppDataSource.getRepository(AITeacherSession);

export async function createSession(
  userId: string,
  topic: string,
  context?: string
): Promise&lt;AITeacherSession&gt; {
  const session = new AITeacherSession();
  session.userId = userId;
  session.topic = topic;
  session.context = context;
  session.messages = [];
  return await sessionRepository.save(session);
}

export async function getSession(
  sessionId: string,
  userId: string
): Promise&lt;AITeacherSession | null&gt; {
  return await sessionRepository.findOne({
    where: { id: sessionId, userId }
  });
}

export async function getUserSessions(userId: string): Promise&lt;AITeacherSession[]&gt; {
  return await sessionRepository.find({
    where: { userId, isActive: true },
    order: { createdAt: 'DESC' }
  });
}

export async function sendMessage(
  sessionId: string,
  userId: string,
  userContent: string,
  aiContext: AIContext
): Promise&lt;{ userMessage: Message; assistantMessage: Message }&gt; {
  const session = await getSession(sessionId, userId);
  if (!session) {
    throw new Error('Session not found');
  }

  const userMessage: Message = {
    id: Date.now().toString(),
    role: 'user',
    content: userContent,
    timestamp: new Date()
  };

  session.messages.push(userMessage);

  const messagesForOpenAI = [
    { role: 'system' as const, content: createSystemPrompt(aiContext) },
    ...session.messages.map(m =&gt; ({
      role: m.role,
      content: m.content
    }))
  ];

  const completion = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: messagesForOpenAI,
    temperature: 0.7,
    max_tokens: 800
  });

  const assistantContent = completion.choices[0].message.content || "I'm sorry, I don't have a response right now.";

  const assistantMessage: Message = {
    id: (Date.now() + 1).toString(),
    role: 'assistant',
    content: assistantContent,
    timestamp: new Date()
  };

  session.messages.push(assistantMessage);
  await sessionRepository.save(session);

  return { userMessage, assistantMessage };
}

export async function generateExplanation(
  topic: string,
  type: 'grammar' | 'vocabulary',
  aiContext: AIContext
): Promise&lt;string&gt; {
  const prompt = type === 'grammar'
    ? createGrammarExplanationPrompt(topic, aiContext)
    : createVocabularyExplanationPrompt(topic, aiContext);

  const completion = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      { role: 'system', content: createSystemPrompt(aiContext) },
      { role: 'user', content: prompt }
    ],
    temperature: 0.7,
    max_tokens: 1000
  });

  return completion.choices[0].message.content || "I'm unable to generate an explanation right now.";
}

export async function correctText(
  text: string,
  aiContext: AIContext
): Promise&lt;string&gt; {
  const prompt = createErrorCorrectionPrompt(text, aiContext);

  const completion = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      { role: 'system', content: createSystemPrompt(aiContext) },
      { role: 'user', content: prompt }
    ],
    temperature: 0.5,
    max_tokens: 600
  });

  return completion.choices[0].message.content || "I'm unable to provide correction right now.";
}

export async function generatePracticeQuestion(
  topic: string,
  aiContext: AIContext
): Promise&lt;string&gt; {
  const prompt = createPracticeQuestionPrompt(topic, aiContext);

  const completion = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      { role: 'system', content: createSystemPrompt(aiContext) },
      { role: 'user', content: prompt }
    ],
    temperature: 0.8,
    max_tokens: 500
  });

  return completion.choices[0].message.content || "I'm unable to generate a practice question right now.";
}
```

- [ ] **Step 2: Commit**

```bash
cd e:/workspace/lingua-journey
git add backend/src/services/aiTeacherService.ts
git commit -m "feat: add AI teacher service"
```

### Task 2.3: Create AI Teacher Controller

**Files:**
- Create: `backend/src/controllers/aiTeacherController.ts`

- [ ] **Step 1: Create AI teacher controller**

```typescript
import { Request, Response } from 'express';
import {
  createSession,
  getSession,
  getUserSessions,
  sendMessage,
  generateExplanation,
  correctText,
  generatePracticeQuestion
} from '../services/aiTeacherService';
import { authAPI } from '../../frontend/src/lib/api';

export async function createAITeacherSession(req: Request, res: Response) {
  try {
    const userId = (req as any).user.id;
    const { topic, context } = req.body;
    const session = await createSession(userId, topic, context);
    res.status(201).json(session);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
}

export async function getAITeacherSession(req: Request, res: Response) {
  try {
    const userId = (req as any).user.id;
    const { id } = req.params;
    const session = await getSession(id, userId);
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }
    res.status(200).json(session);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
}

export async function getUserAITeacherSessions(req: Request, res: Response) {
  try {
    const userId = (req as any).user.id;
    const sessions = await getUserSessions(userId);
    res.status(200).json(sessions);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
}

export async function sendAITeacherMessage(req: Request, res: Response) {
  try {
    const userId = (req as any).user.id;
    const { id } = req.params;
    const { message, aiContext } = req.body;
    const result = await sendMessage(id, userId, message, aiContext);
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
}

export async function getExplanation(req: Request, res: Response) {
  try {
    const { topic, type, aiContext } = req.body;
    const explanation = await generateExplanation(topic, type, aiContext);
    res.status(200).json({ explanation });
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
}

export async function getTextCorrection(req: Request, res: Response) {
  try {
    const { text, aiContext } = req.body;
    const correction = await correctText(text, aiContext);
    res.status(200).json({ correction });
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
}

export async function getPracticeQuestion(req: Request, res: Response) {
  try {
    const { topic, aiContext } = req.body;
    const question = await generatePracticeQuestion(topic, aiContext);
    res.status(200).json({ question });
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
}
```

- [ ] **Step 2: Commit**

```bash
cd e:/workspace/lingua-journey
git add backend/src/controllers/aiTeacherController.ts
git commit -m "feat: add AI teacher controller"
```

### Task 2.4: Create AI Teacher Routes

**Files:**
- Create: `backend/src/routes/aiTeacherRoutes.ts`

- [ ] **Step 1: Create routes**

```typescript
import { Router } from 'express';
import {
  createAITeacherSession,
  getAITeacherSession,
  getUserAITeacherSessions,
  sendAITeacherMessage,
  getExplanation,
  getTextCorrection,
  getPracticeQuestion
} from '../controllers/aiTeacherController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

router.post('/sessions', authenticate, createAITeacherSession);
router.get('/sessions', authenticate, getUserAITeacherSessions);
router.get('/sessions/:id', authenticate, getAITeacherSession);
router.post('/sessions/:id/messages', authenticate, sendAITeacherMessage);
router.post('/explain', authenticate, getExplanation);
router.post('/correct', authenticate, getTextCorrection);
router.post('/practice', authenticate, getPracticeQuestion);

export default router;
```

- [ ] **Step 2: Commit**

```bash
cd e:/workspace/lingua-journey
git add backend/src/routes/aiTeacherRoutes.ts
git commit -m "feat: add AI teacher routes"
```

---

## Phase 3: Assessment Service

### Task 3.1: Create Question Generator

**Files:**
- Create: `backend/src/services/questionGenerator.ts`

- [ ] **Step 1: Create question generation service**

```typescript
import { CEFRLevel, SkillType, Question } from '../entities/Assessment';
import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface QuestionTemplate {
  skill: SkillType;
  type: 'multiple-choice' | 'fill-blank' | 'open-ended';
  level: CEFRLevel;
  topic?: string;
}

const multipleChoiceTemplates = [
  {
    skill: 'reading',
    prompt: (level: string) =&gt; `Create a ${level} level reading comprehension multiple-choice question.
Provide:
- A short passage (3-5 sentences)
- Question about the passage
- 4 options labeled A, B, C, D
- Correct answer with explanation
Format as JSON with fields: passage, question, options (array), correctAnswer, explanation`
  },
  {
    skill: 'listening',
    prompt: (level: string) =&gt; `Create a ${level} level listening comprehension question.
Provide:
- Dialogue/speech transcript
- Multiple-choice question about content
- 4 options
- Correct answer
Format as JSON with fields: transcript, question, options (array), correctAnswer`
  }
];

export async function generateQuestion(template: QuestionTemplate): Promise&lt;Question&gt; {
  const id = Date.now().toString();
  const topic = template.topic || 'general language';

  const baseQuestion: Question = {
    id,
    type: template.type,
    skill: template.skill,
    prompt: '',
    points: 10,
    level: template.level
  };

  if (template.type === 'multiple-choice') {
    return generateMultipleChoice(template, baseQuestion);
  } else if (template.type === 'fill-blank') {
    return generateFillBlank(template, baseQuestion);
  } else {
    return generateOpenEnded(template, baseQuestion);
  }
}

async function generateMultipleChoice(template: QuestionTemplate, base: Question): Promise&lt;Question&gt; {
  try {
    const prompt = `Generate a ${template.level} level ${template.skill} multiple-choice question about ${template.topic || 'general language use'}.

Return ONLY a JSON object with:
- "prompt": The question text
- "options": Array of 4 options
- "correctAnswer": The correct option string

Keep it simple and appropriate for ${template.level} level.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.8,
    });

    const content = completion.choices[0].message.content;
    if (!content) throw new Error('No response');

    const data = JSON.parse(content);
    return {
      ...base,
      prompt: data.prompt,
      options: data.options,
      correctAnswer: data.correctAnswer
    };
  } catch {
    return fallbackMultipleChoice(template, base);
  }
}

function fallbackMultipleChoice(template: QuestionTemplate, base: Question): Question {
  const vocabWords = ['apple', 'book', 'house', 'computer'];
  return {
    ...base,
    prompt: `Choose the correct word: "I have a red ___"`,
    options: vocabWords,
    correctAnswer: vocabWords[0]
  };
}

async function generateFillBlank(template: QuestionTemplate, base: Question): Promise&lt;Question&gt; {
  return {
    ...base,
    prompt: `Complete the sentence: "I ___ to school every day"`,
    correctAnswer: 'go'
  };
}

async function generateOpenEnded(template: QuestionTemplate, base: Question): Promise&lt;Question&gt; {
  return {
    ...base,
    prompt: `Write a short paragraph about your day.`,
    points: 20
  };
}

export async function generateAssessmentQuestions(
  level: CEFRLevel,
  skills: SkillType[],
  questionsPerSkill: number = 5
): Promise&lt;Question[]&gt; {
  const questions: Question[] = [];

  for (const skill of skills) {
    for (let i = 0; i &lt; questionsPerSkill; i++) {
      const type = i % 2 === 0 ? 'multiple-choice' : (i % 3 === 0 ? 'fill-blank' : 'open-ended');
      const question = await generateQuestion({
        skill,
        type,
        level,
        topic: 'general vocabulary and grammar'
      });
      questions.push(question);
    }
  }

  return questions;
}
```

- [ ] **Step 2: Commit**

```bash
cd e:/workspace/lingua-journey
git add backend/src/services/questionGenerator.ts
git commit -m "feat: add question generator service"
```

### Task 3.2: Create Grading Service

**Files:**
- Create: `backend/src/services/gradingService.ts`

- [ ] **Step 1: Create grading service**

```typescript
import { Answer, Question, SkillScores, CEFRLevel, SkillType } from '../entities/Assessment';
import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface GradingResult {
  isCorrect: boolean;
  score: number;
  feedback: string;
}

export function gradeMultipleChoice(
  question: Question,
  userAnswer: string
): GradingResult {
  const isCorrect = userAnswer === question.correctAnswer;
  const score = isCorrect ? question.points : 0;

  return {
    isCorrect,
    score,
    feedback: isCorrect
      ? 'Excellent! You got it right!'
      : `Not quite. The correct answer is ${question.correctAnswer}.`
  };
}

export function gradeFillBlank(
  question: Question,
  userAnswer: string
): GradingResult {
  const normalizedUser = userAnswer.toLowerCase().trim();
  const normalizedCorrect = (question.correctAnswer || '').toLowerCase().trim();
  const isCorrect = normalizedUser === normalizedCorrect;
  const score = isCorrect ? question.points : 0;

  return {
    isCorrect,
    score,
    feedback: isCorrect
      ? 'Perfect!'
      : `Close! The correct answer is "${question.correctAnswer}".`
  };
}

export async function gradeOpenEnded(
  question: Question,
  userAnswer: string,
  level: CEFRLevel
): Promise&lt;GradingResult&gt; {
  try {
    const prompt = `Grade this ${level} level answer to the question: "${question.prompt}"

Student answer: "${userAnswer}"

Please provide:
- A score 0-10 (10 being perfect)
- Detailed feedback
- Is it mostly correct (true/false)

Return JSON with fields: score (number), feedback (string), isCorrect (boolean)`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
    });

    const content = completion.choices[0].message.content;
    if (!content) throw new Error('No response');

    const data = JSON.parse(content);
    return {
      isCorrect: data.isCorrect,
      score: Math.round((data.score / 10) * question.points),
      feedback: data.feedback
    };
  } catch {
    return {
      isCorrect: userAnswer.length &gt; 10,
      score: userAnswer.length &gt; 10 ? Math.round(question.points * 0.7) : 0,
      feedback: 'Thanks for your response!'
    };
  }
}

export async function gradeAnswer(
  question: Question,
  userAnswer: string,
  level: CEFRLevel
): Promise&lt;GradingResult&gt; {
  switch (question.type) {
    case 'multiple-choice':
      return gradeMultipleChoice(question, userAnswer);
    case 'fill-blank':
      return gradeFillBlank(question, userAnswer);
    case 'open-ended':
      return gradeOpenEnded(question, userAnswer, level);
    default:
      return { isCorrect: false, score: 0, feedback: 'Invalid question type' };
  }
}

export function calculateSkillScores(
  questions: Question[],
  answers: Answer[]
): SkillScores {
  const skillScores: Record&lt;SkillType, { total: number; earned: number }&gt; = {
    listening: { total: 0, earned: 0 },
    reading: { total: 0, earned: 0 },
    speaking: { total: 0, earned: 0 },
    writing: { total: 0, earned: 0 }
  };

  for (const question of questions) {
    const answer = answers.find(a =&gt; a.questionId === question.id);
    if (answer) {
      skillScores[question.skill].total += question.points;
      skillScores[question.skill].earned += answer.score || 0;
    }
  }

  return {
    listening: skillScores.listening.total &gt; 0
      ? Math.round((skillScores.listening.earned / skillScores.listening.total) * 100)
      : 0,
    reading: skillScores.reading.total &gt; 0
      ? Math.round((skillScores.reading.earned / skillScores.reading.total) * 100)
      : 0,
    speaking: skillScores.speaking.total &gt; 0
      ? Math.round((skillScores.speaking.earned / skillScores.speaking.total) * 100)
      : 0,
    writing: skillScores.writing.total &gt; 0
      ? Math.round((skillScores.writing.earned / skillScores.writing.total) * 100)
      : 0
  };
}

export function calculateOverallScore(skillScores: SkillScores): number {
  const scores = Object.values(skillScores);
  return Math.round(scores.reduce((a, b) =&gt; a + b, 0) / scores.length);
}

export function determineRecommendedLevel(score: number): CEFRLevel {
  if (score &gt;= 90) return 'C2';
  if (score &gt;= 80) return 'C1';
  if (score &gt;= 70) return 'B2';
  if (score &gt;= 60) return 'B1';
  if (score &gt;= 50) return 'A2';
  return 'A1';
}
```

- [ ] **Step 2: Commit**

```bash
cd e:/workspace/lingua-journey
git add backend/src/services/gradingService.ts
git commit -m "feat: add grading service"
```

### Task 3.3: Create Assessment Service

**Files:**
- Create: `backend/src/services/assessmentService.ts`

- [ ] **Step 1: Create assessment service**

```typescript
import { AppDataSource } from '../config/database';
import { Assessment, Question, CEFRLevel, SkillType } from '../entities/Assessment';
import { AssessmentResult, Answer, SkillScores } from '../entities/AssessmentResult';
import { UserSkillProfile } from '../entities/UserSkillProfile';
import { generateAssessmentQuestions } from './questionGenerator';
import {
  gradeAnswer,
  calculateSkillScores,
  calculateOverallScore,
  determineRecommendedLevel
} from './gradingService';

const assessmentRepository = AppDataSource.getRepository(Assessment);
const resultRepository = AppDataSource.getRepository(AssessmentResult);
const skillProfileRepository = AppDataSource.getRepository(UserSkillProfile);

export async function createAssessment(
  name: string,
  level: CEFRLevel,
  skills: SkillType[],
  timeLimit: number = 30,
  passingScore: number = 70
): Promise&lt;Assessment&gt; {
  const questions = await generateAssessmentQuestions(level, skills);

  const assessment = new Assessment();
  assessment.name = name;
  assessment.level = level;
  assessment.skills = skills;
  assessment.timeLimit = timeLimit;
  assessment.passingScore = passingScore;
  assessment.questions = questions;
  assessment.isActive = true;

  return await assessmentRepository.save(assessment);
}

export async function getAssessment(assessmentId: string): Promise&lt;Assessment | null&gt; {
  return await assessmentRepository.findOne({
    where: { id: assessmentId, isActive: true }
  });
}

export async function getAvailableAssessments(): Promise&lt;Assessment[]&gt; {
  return await assessmentRepository.find({
    where: { isActive: true },
    order: { createdAt: 'DESC' }
  });
}

export async function submitAssessment(
  assessmentId: string,
  userId: string,
  answers: Answer[]
): Promise&lt;AssessmentResult&gt; {
  const assessment = await getAssessment(assessmentId);
  if (!assessment) {
    throw new Error('Assessment not found');
  }

  const gradedAnswers: Answer[] = [];

  for (const question of assessment.questions) {
    const userAnswer = answers.find(a =&gt; a.questionId === question.id);
    if (userAnswer) {
      const gradingResult = await gradeAnswer(
        question,
        userAnswer.answer,
        assessment.level
      );
      gradedAnswers.push({
        ...userAnswer,
        isCorrect: gradingResult.isCorrect,
        score: gradingResult.score,
        feedback: gradingResult.feedback
      });
    }
  }

  const skillScores = calculateSkillScores(assessment.questions, gradedAnswers);
  const overallScore = calculateOverallScore(skillScores);
  const recommendedLevel = determineRecommendedLevel(overallScore);

  const result = new AssessmentResult();
  result.userId = userId;
  result.assessmentId = assessmentId;
  result.score = overallScore;
  result.skillScores = skillScores;
  result.answers = gradedAnswers;
  result.recommendedLevel = recommendedLevel;
  result.feedback = generateOverallFeedback(overallScore, skillScores);
  result.recommendations = generateRecommendations(skillScores);
  result.completedAt = new Date();

  const savedResult = await resultRepository.save(result);
  await updateUserSkillProfiles(userId, skillScores);

  return savedResult;
}

function generateOverallFeedback(score: number, skillScores: SkillScores): string {
  if (score &gt;= 90) return 'Excellent work! You have a strong grasp of the language.';
  if (score &gt;= 80) return 'Great job! Keep practicing to maintain your skills.';
  if (score &gt;= 70) return 'Good progress! Focus on the areas you found challenging.';
  if (score &gt;= 60) return 'You\'re making progress! Keep up the consistent practice.';
  return 'Don\'t give up! Every practice session helps you improve.';
}

function generateRecommendations(skillScores: SkillScores): string[] {
  const recommendations: string[] = [];
  const weakSkills = Object.entries(skillScores)
    .filter(([_, score]) =&gt; score &lt; 70)
    .sort((a, b) =&gt; a[1] - b[1]);

  for (const [skill] of weakSkills) {
    recommendations.push(`Focus on improving your ${skill} skills.`);
  }

  if (recommendations.length === 0) {
    recommendations.push('Keep up the consistent practice to maintain your level.');
  }

  return recommendations;
}

async function updateUserSkillProfiles(
  userId: string,
  skillScores: SkillScores
): Promise&lt;void&gt; {
  for (const [skill, score] of Object.entries(skillScores)) {
    let profile = await skillProfileRepository.findOne({
      where: { userId, skill: skill as SkillType }
    });

    if (!profile) {
      profile = new UserSkillProfile();
      profile.userId = userId;
      profile.skill = skill as SkillType;
      profile.historicalScores = [];
    }

    const now = new Date();
    profile.historicalScores.push({ date: now, score });
    profile.score = score;
    profile.lastAssessed = now;

    if (profile.historicalScores.length &gt;= 3) {
      const last3 = profile.historicalScores.slice(-3);
      const avgPrev = (last3[0].score + last3[1].score) / 2;
      if (score &gt; avgPrev + 5) profile.trend = 'improving';
      else if (score &lt; avgPrev - 5) profile.trend = 'declining';
      else profile.trend = 'stable';
    }

    await skillProfileRepository.save(profile);
  }
}

export async function getUserResults(userId: string): Promise&lt;AssessmentResult[]&gt; {
  return await resultRepository.find({
    where: { userId },
    order: { createdAt: 'DESC' }
  });
}

export async function getUserSkillProfiles(userId: string): Promise&lt;UserSkillProfile[]&gt; {
  return await skillProfileRepository.find({ where: { userId } });
}
```

- [ ] **Step 2: Commit**

```bash
cd e:/workspace/lingua-journey
git add backend/src/services/assessmentService.ts
git commit -m "feat: add assessment service"
```

### Task 3.4: Create Assessment Controller

**Files:**
- Create: `backend/src/controllers/assessmentController.ts`

- [ ] **Step 1: Create controller**

```typescript
import { Request, Response } from 'express';
import {
  createAssessment,
  getAssessment,
  getAvailableAssessments,
  submitAssessment,
  getUserResults,
  getUserSkillProfiles
} from '../services/assessmentService';

export async function createNewAssessment(req: Request, res: Response) {
  try {
    const { name, level, skills, timeLimit, passingScore } = req.body;
    const assessment = await createAssessment(name, level, skills, timeLimit, passingScore);
    res.status(201).json(assessment);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
}

export async function getAssessmentById(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const assessment = await getAssessment(id);
    if (!assessment) {
      return res.status(404).json({ error: 'Assessment not found' });
    }
    res.status(200).json(assessment);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
}

export async function listAssessments(req: Request, res: Response) {
  try {
    const assessments = await getAvailableAssessments();
    res.status(200).json(assessments);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
}

export async function submitAssessmentAnswers(req: Request, res: Response) {
  try {
    const userId = (req as any).user.id;
    const { id } = req.params;
    const { answers } = req.body;
    const result = await submitAssessment(id, userId, answers);
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
}

export async function getUserAssessmentResults(req: Request, res: Response) {
  try {
    const userId = (req as any).user.id;
    const results = await getUserResults(userId);
    res.status(200).json(results);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
}

export async function getUserSkills(req: Request, res: Response) {
  try {
    const userId = (req as any).user.id;
    const profiles = await getUserSkillProfiles(userId);
    res.status(200).json(profiles);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
}
```

- [ ] **Step 2: Commit**

```bash
cd e:/workspace/lingua-journey
git add backend/src/controllers/assessmentController.ts
git commit -m "feat: add assessment controller"
```

### Task 3.5: Create Assessment Routes

**Files:**
- Create: `backend/src/routes/assessmentRoutes.ts`

- [ ] **Step 1: Create routes**

```typescript
import { Router } from 'express';
import {
  createNewAssessment,
  getAssessmentById,
  listAssessments,
  submitAssessmentAnswers,
  getUserAssessmentResults,
  getUserSkills
} from '../controllers/assessmentController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

router.get('/', authenticate, listAssessments);
router.post('/', authenticate, createNewAssessment);
router.get('/results', authenticate, getUserAssessmentResults);
router.get('/skills', authenticate, getUserSkills);
router.get('/:id', authenticate, getAssessmentById);
router.post('/:id/submit', authenticate, submitAssessmentAnswers);

export default router;
```

- [ ] **Step 2: Commit**

```bash
cd e:/workspace/lingua-journey
git add backend/src/routes/assessmentRoutes.ts
git commit -m "feat: add assessment routes"
```

---

## Phase 4: Progress Analytics

### Task 4.1: Create Analytics Service

**Files:**
- Create: `backend/src/services/analyticsService.ts`

- [ ] **Step 1: Create analytics service**

```typescript
import { AppDataSource } from '../config/database';
import { AssessmentResult } from '../entities/AssessmentResult';
import { UserSkillProfile } from '../entities/UserSkillProfile';

const resultRepository = AppDataSource.getRepository(AssessmentResult);
const skillProfileRepository = AppDataSource.getRepository(UserSkillProfile);

export interface LearningInsights {
  averageScore: number;
  totalAssessments: number;
  bestSkill: string;
  needsImprovement: string;
  weeklyProgress: { date: string; score: number }[];
  recommendations: string[];
}

export async function getLearningInsights(userId: string): Promise&lt;LearningInsights&gt; {
  const results = await resultRepository.find({
    where: { userId },
    order: { createdAt: 'DESC' }
  });

  const profiles = await skillProfileRepository.find({ where: { userId } });

  const averageScore = results.length &gt; 0
    ? Math.round(results.reduce((sum, r) =&gt; sum + r.score, 0) / results.length)
    : 0;

  const bestSkill = profiles.length &gt; 0
    ? profiles.reduce((best, p) =&gt; p.score &gt; best.score ? p : best, profiles[0]).skill
    : 'N/A';

  const needsImprovement = profiles.length &gt; 0
    ? profiles.reduce((worst, p) =&gt; p.score &lt; worst.score ? p : worst, profiles[0]).skill
    : 'N/A';

  const weeklyProgress = results.slice(0, 7).map(r =&gt; ({
    date: r.completedAt?.toISOString().split('T')[0] || r.createdAt.toISOString().split('T')[0],
    score: r.score
  })).reverse();

  const recommendations = generateRecommendations(profiles, averageScore);

  return {
    averageScore,
    totalAssessments: results.length,
    bestSkill,
    needsImprovement,
    weeklyProgress,
    recommendations
  };
}

function generateRecommendations(
  profiles: UserSkillProfile[],
  avgScore: number
): string[] {
  const recommendations: string[] = [];

  if (avgScore &lt; 70) {
    recommendations.push('Consider reviewing previous lessons before moving forward.');
  }

  const weakSkills = profiles.filter(p =&gt; p.score &lt; 70);
  for (const skill of weakSkills) {
    recommendations.push(`Practice ${skill.skill} more - it's an area for growth!`);
  }

  const improvingSkills = profiles.filter(p =&gt; p.trend === 'improving');
  if (improvingSkills.length &gt; 0) {
    recommendations.push(`Great progress in ${improvingSkills.map(s =&gt; s.skill).join(', ')}!`);
  }

  if (recommendations.length === 0) {
    recommendations.push('Keep up the consistent practice!');
  }

  return recommendations;
}

export async function getProgressTrend(
  userId: string,
  skill?: string
): Promise&lt;{ date: Date; score: number }[]&gt; {
  const qb = resultRepository
    .createQueryBuilder('result')
    .where('result.userId = :userId', { userId })
    .orderBy('result.createdAt', 'DESC')
    .limit(30);

  const results = await qb.getMany();

  return results.map(r =&gt; ({
    date: r.completedAt || r.createdAt,
    score: skill
      ? (r.skillScores as any)[skill] || 0
      : r.score
  }));
}
```

- [ ] **Step 2: Commit**

```bash
cd e:/workspace/lingua-journey
git add backend/src/services/analyticsService.ts
git commit -m "feat: add analytics service"
```

### Task 4.2: Create Progress Controller

**Files:**
- Create: `backend/src/controllers/progressController.ts`

- [ ] **Step 1: Create controller**

```typescript
import { Request, Response } from 'express';
import {
  getLearningInsights,
  getProgressTrend
} from '../services/analyticsService';

export async function getInsights(req: Request, res: Response) {
  try {
    const userId = (req as any).user.id;
    const insights = await getLearningInsights(userId);
    res.status(200).json(insights);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
}

export async function getTrend(req: Request, res: Response) {
  try {
    const userId = (req as any).user.id;
    const { skill } = req.query;
    const trend = await getProgressTrend(userId, skill as string);
    res.status(200).json(trend);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
}
```

- [ ] **Step 2: Commit**

```bash
cd e:/workspace/lingua-journey
git add backend/src/controllers/progressController.ts
git commit -m "feat: add progress controller"
```

### Task 4.3: Create Progress Routes

**Files:**
- Create: `backend/src/routes/progressRoutes.ts`

- [ ] **Step 1: Create routes**

```typescript
import { Router } from 'express';
import {
  getInsights,
  getTrend
} from '../controllers/progressController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

router.get('/insights', authenticate, getInsights);
router.get('/trend', authenticate, getTrend);

export default router;
```

- [ ] **Step 2: Commit**

```bash
cd e:/workspace/lingua-journey
git add backend/src/routes/progressRoutes.ts
git commit -m "feat: add progress routes"
```

### Task 4.4: Update Server Configuration

**Files:**
- Modify: `backend/src/server.ts`

- [ ] **Step 1: Add new routes to server**

```typescript
import aiTeacherRoutes from './routes/aiTeacherRoutes';
import assessmentRoutes from './routes/assessmentRoutes';
import progressRoutes from './routes/progressRoutes';

// ... existing code ...

app.use('/api/ai-teacher', aiTeacherRoutes);
app.use('/api/assessments', assessmentRoutes);
app.use('/api/progress', progressRoutes);
```

- [ ] **Step 2: Commit**

```bash
cd e:/workspace/lingua-journey
git add backend/src/server.ts
git commit -m "feat: register AI teacher assessment routes"
```

---

## Phase 5: Frontend Integration

### Task 5.1: Add API Functions to Frontend

**Files:**
- Modify: `frontend/src/lib/api.ts`

- [ ] **Step 1: Add AI Teacher API types and functions**

```typescript
export interface AITeacherSession {
  id: string;
  userId: string;
  topic: string;
  context?: string;
  messages: Message[];
  isActive: boolean;
  createdAt: string;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface AIContext {
  targetLanguage: string;
  nativeLanguage: string;
  cefrLevel: string;
  topic?: string;
}

export interface Assessment {
  id: string;
  name: string;
  level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  skills: string[];
  timeLimit: number;
  passingScore: number;
  questions: Question[];
  isActive: boolean;
  createdAt: string;
}

export interface Question {
  id: string;
  type: 'multiple-choice' | 'fill-blank' | 'open-ended';
  skill: string;
  prompt: string;
  options?: string[];
  correctAnswer?: string;
  points: number;
  level: string;
}

export interface AssessmentResult {
  id: string;
  userId: string;
  assessmentId: string;
  score: number;
  skillScores: { [key: string]: number };
  answers: Answer[];
  feedback?: string;
  recommendations?: string[];
  completedAt?: string;
  createdAt: string;
}

export interface Answer {
  questionId: string;
  answer: string;
  isCorrect?: boolean;
  score?: number;
  feedback?: string;
}

export interface UserSkillProfile {
  id: string;
  userId: string;
  skill: string;
  level: string;
  score: number;
  lastAssessed?: string;
  trend: 'improving' | 'stable' | 'declining';
  createdAt: string;
  updatedAt: string;
}

export interface LearningInsights {
  averageScore: number;
  totalAssessments: number;
  bestSkill: string;
  needsImprovement: string;
  weeklyProgress: { date: string; score: number }[];
  recommendations: string[];
}

export const aiTeacherAPI = {
  createSession: (topic: string, context?: string) =&gt;
    fetchAPI('/ai-teacher/sessions', {
      method: 'POST',
      body: JSON.stringify({ topic, context })
    }),

  getSessions: () =&gt;
    fetchAPI('/ai-teacher/sessions'),

  getSession: (id: string) =&gt;
    fetchAPI(`/ai-teacher/sessions/${id}`),

  sendMessage: (id: string, message: string, aiContext: AIContext) =&gt;
    fetchAPI(`/ai-teacher/sessions/${id}/messages`, {
      method: 'POST',
      body: JSON.stringify({ message, aiContext })
    }),

  getExplanation: (topic: string, type: 'grammar' | 'vocabulary', aiContext: AIContext) =&gt;
    fetchAPI('/ai-teacher/explain', {
      method: 'POST',
      body: JSON.stringify({ topic, type, aiContext })
    }),

  getCorrection: (text: string, aiContext: AIContext) =&gt;
    fetchAPI('/ai-teacher/correct', {
      method: 'POST',
      body: JSON.stringify({ text, aiContext })
    }),

  getPracticeQuestion: (topic: string, aiContext: AIContext) =&gt;
    fetchAPI('/ai-teacher/practice', {
      method: 'POST',
      body: JSON.stringify({ topic, aiContext })
    })
};

export const assessmentAPI = {
  createAssessment: (data: any) =&gt;
    fetchAPI('/assessments', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  getAssessments: () =&gt;
    fetchAPI('/assessments'),

  getAssessment: (id: string) =&gt;
    fetchAPI(`/assessments/${id}`),

  submitAssessment: (id: string, answers: Answer[]) =&gt;
    fetchAPI(`/assessments/${id}/submit`, {
      method: 'POST',
      body: JSON.stringify({ answers })
    }),

  getResults: () =&gt;
    fetchAPI('/assessments/results'),

  getSkills: () =&gt;
    fetchAPI('/assessments/skills')
};

export const progressAPI = {
  getInsights: () =&gt;
    fetchAPI('/progress/insights'),

  getTrend: (skill?: string) =&gt; {
    const url = skill
      ? `/progress/trend?skill=${encodeURIComponent(skill)}`
      : '/progress/trend';
    return fetchAPI(url);
  }
};
```

- [ ] **Step 2: Commit**

```bash
cd e:/workspace/lingua-journey
git add frontend/src/lib/api.ts
git commit -m "feat: add AI teacher assessment API to frontend"
```

### Task 5.2: Create AI Teacher Page

**Files:**
- Create: `frontend/src/pages/ai-teacher/index.tsx`

- [ ] **Step 1: Create AI teacher page**

```tsx
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { aiTeacherAPI, AITeacherSession, Message, AIContext } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';

export default function AITeacherPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [sessions, setSessions] = useState&lt;AITeacherSession[]&gt;([]);
  const [currentSession, setCurrentSession] = useState&lt;AITeacherSession | null&gt;(null);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [newTopic, setNewTopic] = useState('');

  useEffect(() =&gt; {
    loadSessions();
  }, []);

  const loadSessions = async () =&gt; {
    try {
      const data = await aiTeacherAPI.getSessions();
      setSessions(data);
    } catch (error) {
      console.error('Failed to load sessions:', error);
    }
  };

  const createSession = async () =&gt; {
    if (!newTopic.trim()) return;
    try {
      setLoading(true);
      const session = await aiTeacherAPI.createSession(newTopic);
      setSessions([session, ...sessions]);
      setCurrentSession(session);
      setNewTopic('');
    } catch (error) {
      console.error('Failed to create session:', error);
    } finally {
      setLoading(false);
    }
  };

  const selectSession = async (session: AITeacherSession) =&gt; {
    try {
      const data = await aiTeacherAPI.getSession(session.id);
      setCurrentSession(data);
    } catch (error) {
      console.error('Failed to load session:', error);
    }
  };

  const sendMessage = async () =&gt; {
    if (!currentSession || !inputMessage.trim()) return;
    try {
      setLoading(true);
      const aiContext: AIContext = {
        targetLanguage: user?.targetLanguage || 'English',
        nativeLanguage: user?.nativeLanguage || 'English',
        cefrLevel: 'A1',
        topic: currentSession.topic
      };
      const result = await aiTeacherAPI.sendMessage(
        currentSession.id,
        inputMessage,
        aiContext
      );
      if (currentSession) {
        setCurrentSession({
          ...currentSession,
          messages: [
            ...currentSession.messages,
            result.userMessage,
            result.assistantMessage
          ]
        });
      }
      setInputMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    &lt;div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-12 px-4"&gt;
      &lt;div className="max-w-6xl mx-auto"&gt;
        &lt;motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        &gt;
          &lt;div className="flex items-center justify-between mb-4"&gt;
            &lt;div&gt;
              &lt;h1 className="text-4xl font-bold text-gray-900 mb-2"&gt;
                🤖 AI Language Teacher
              &lt;/h1&gt;
              &lt;p className="text-xl text-gray-600"&gt;
                Your personal language tutor available 24/7
              &lt;/p&gt;
            &lt;/div&gt;
            &lt;button
              onClick={() =&gt; router.push('/')}
              className="px-6 py-3 bg-white rounded-xl shadow-lg text-gray-700 font-medium hover:bg-gray-50"
            &gt;
              ← Back Home
            &lt;/button&gt;
          &lt;/div&gt;
        &lt;/motion.div&gt;

        &lt;div className="grid grid-cols-1 lg:grid-cols-3 gap-6"&gt;
          &lt;motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-1"
          &gt;
            &lt;div className="bg-white rounded-2xl shadow-xl p-6"&gt;
              &lt;h2 className="text-xl font-bold text-gray-900 mb-4"&gt;Sessions&lt;/h2&gt;

              &lt;div className="flex gap-2 mb-4"&gt;
                &lt;input
                  type="text"
                  value={newTopic}
                  onChange={(e) =&gt; setNewTopic(e.target.value)}
                  placeholder="Topic for new session..."
                  className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  onKeyPress={(e) =&gt; e.key === 'Enter' &amp;&amp; createSession()}
                /&gt;
                &lt;button
                  onClick={createSession}
                  disabled={loading}
                  className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg font-medium disabled:opacity-50"
                &gt;
                  +
                &lt;/button&gt;
              &lt;/div&gt;

              &lt;div className="space-y-2 max-h-96 overflow-y-auto"&gt;
                {sessions.map((session) =&gt; (
                  &lt;button
                    key={session.id}
                    onClick={() =&gt; selectSession(session)}
                    className={`w-full text-left p-4 rounded-xl transition-all ${
                      currentSession?.id === session.id
                        ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-300'
                        : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                    }`}
                  &gt;
                    &lt;div className="font-semibold text-gray-900"&gt;
                      {session.topic}
                    &lt;/div&gt;
                    &lt;div className="text-sm text-gray-500"&gt;
                      {session.messages.length} messages
                    &lt;/div&gt;
                  &lt;/button&gt;
                ))}
              &lt;/div&gt;
            &lt;/div&gt;
          &lt;/motion.div&gt;

          &lt;motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2"
          &gt;
            {currentSession ? (
              &lt;div className="bg-white rounded-2xl shadow-xl overflow-hidden"&gt