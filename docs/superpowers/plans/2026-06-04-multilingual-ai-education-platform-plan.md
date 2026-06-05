# 多语种AI在线教育平台实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 构建支持多语种学习的AI在线教育平台，包含3D场景互动、AI对话练习、AI老师教学等核心功能

**Architecture:** 前后端分离架构，前端使用React + Next.js，后端使用Node.js + Express，数据库PostgreSQL + Redis，3D渲染使用Three.js

**Tech Stack:** React 18 + TypeScript + Next.js 14 + Tailwind CSS 3 + Node.js 20 + Express + PostgreSQL 16 + Redis 7 + Three.js

---

## 项目结构

```
lingua-journey/
├── backend/                    # 后端服务
│   ├── src/
│   │   ├── controllers/        # API控制器
│   │   ├── services/           # 业务逻辑
│   │   ├── models/             # 数据模型
│   │   ├── routes/             # 路由定义
│   │   ├── middleware/         # 中间件
│   │   ├── config/             # 配置文件
│   │   └── utils/              # 工具函数
│   ├── tests/                  # 后端测试
│   ├── package.json
│   └── tsconfig.json
├── frontend/                   # 前端Web应用
│   ├── src/
│   │   ├── components/         # 通用组件
│   │   ├── pages/              # 页面组件
│   │   ├── hooks/              # 自定义hooks
│   │   ├── services/           # API服务
│   │   ├── types/              # 类型定义
│   │   ├── utils/              # 工具函数
│   │   └── threejs/            # 3D场景组件
│   ├── public/                 # 静态资源
│   ├── package.json
│   └── tsconfig.json
├── mobile/                     # React Native移动端
│   ├── src/
│   ├── ios/
│   ├── android/
│   └── package.json
├── shared/                     # 共享代码
│   ├── api/                    # API客户端
│   ├── types/                  # 共享类型
│   └── utils/                  # 共享工具
└── docker-compose.yml          # Docker配置
```

---

## Phase 1: 基础架构搭建 (第1-2周)

### Task 1: 初始化后端项目

**Files:**
- Create: `backend/package.json`
- Create: `backend/tsconfig.json`
- Create: `backend/src/server.ts`
- Create: `backend/.env.example`

- [ ] **Step 1: 创建项目目录和package.json**

```json
{
  "name": "lingua-journey-backend",
  "version": "1.0.0",
  "main": "dist/server.js",
  "scripts": {
    "dev": "ts-node-dev src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js",
    "test": "jest"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "dotenv": "^16.4.1",
    "jsonwebtoken": "^9.0.2",
    "bcrypt": "^5.1.1",
    "pg": "^8.11.3",
    "typeorm": "^0.3.20",
    "redis": "^4.6.12",
    "zod": "^3.22.4",
    "openai": "^4.28.4"
  },
  "devDependencies": {
    "@types/express": "^4.17.21",
    "@types/cors": "^2.8.17",
    "@types/jsonwebtoken": "^9.0.5",
    "@types/bcrypt": "^5.0.2",
    "@types/node": "^20.11.0",
    "ts-node-dev": "^2.0.0",
    "typescript": "^5.3.3",
    "jest": "^29.7.0"
  }
}
```

- [ ] **Step 2: 创建tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

- [ ] **Step 3: 创建基础服务器**

```typescript
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

- [ ] **Step 4: 创建.env.example**

```env
PORT=3001
DATABASE_URL=postgresql://user:password@localhost:5432/lingua_journey
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-secret-key-here
OPENAI_API_KEY=your-openai-api-key
```

- [ ] **Step 5: 安装依赖并启动测试**

```bash
cd backend
npm install
npm run dev
```

### Task 2: 配置数据库连接

**Files:**
- Create: `backend/src/config/database.ts`
- Create: `backend/src/entities/User.ts`

- [ ] **Step 1: 创建数据库配置**

```typescript
import { DataSource } from 'typeorm';
import dotenv from 'dotenv';

dotenv.config();

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: ['dist/entities/*.js'],
  migrations: ['dist/migrations/*.js'],
  synchronize: process.env.NODE_ENV !== 'production',
  logging: process.env.NODE_ENV === 'development'
});
```

- [ ] **Step 2: 创建User实体**

```typescript
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

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, nullable: false })
  email: string;

  @Column({ unique: true, nullable: false })
  username: string;

  @Column({ nullable: false })
  password_hash: string;

  @Column({ nullable: false })
  native_language: string;

  @Column({ nullable: false })
  target_language: string;

  @Column({
    type: 'enum',
    enum: UserLevel,
    default: UserLevel.BEGINNER
  })
  level: UserLevel;

  @Column({ nullable: true })
  avatar_url: string;

  @Column({
    type: 'enum',
    enum: SubscriptionType,
    default: SubscriptionType.FREE
  })
  subscription_type: SubscriptionType;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
```

- [ ] **Step 3: 更新server.ts添加数据库连接**

```typescript
import { AppDataSource } from './config/database';

AppDataSource.initialize()
  .then(() => {
    console.log('Database connected successfully');
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Database connection failed:', error);
    process.exit(1);
  });
```

### Task 3: 用户认证模块

**Files:**
- Create: `backend/src/controllers/authController.ts`
- Create: `backend/src/routes/authRoutes.ts`
- Create: `backend/src/middleware/authMiddleware.ts`
- Create: `backend/src/services/authService.ts`

- [ ] **Step 1: 创建认证服务**

```typescript
import { AppDataSource } from '../config/database';
import { User } from '../entities/User';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const userRepository = AppDataSource.getRepository(User);

export async function registerUser(data: {
  email: string;
  username: string;
  password: string;
  native_language: string;
  target_language: string;
}) {
  const existingUser = await userRepository.findOne({
    where: [{ email: data.email }, { username: data.username }]
  });

  if (existingUser) {
    throw new Error('User already exists');
  }

  const password_hash = await bcrypt.hash(data.password, 10);
  const user = userRepository.create({ ...data, password_hash });
  
  return await userRepository.save(user);
}

export async function loginUser(email: string, password: string) {
  const user = await userRepository.findOne({ where: { email } });
  
  if (!user) {
    throw new Error('Invalid credentials');
  }

  const isValid = await bcrypt.compare(password, user.password_hash);
  
  if (!isValid) {
    throw new Error('Invalid credentials');
  }

  const token = jwt.sign(
    { userId: user.id, email: user.email },
    process.env.JWT_SECRET!,
    { expiresIn: '24h' }
  );

  return { user, token };
}

export function verifyToken(token: string) {
  try {
    return jwt.verify(token, process.env.JWT_SECRET!) as { userId: string; email: string };
  } catch {
    throw new Error('Invalid token');
  }
}
```

- [ ] **Step 2: 创建认证控制器**

```typescript
import { Request, Response } from 'express';
import { registerUser, loginUser } from '../services/authService';
import { z } from 'zod';

const registerSchema = z.object({
  email: z.string().email(),
  username: z.string().min(3).max(50),
  password: z.string().min(6),
  native_language: z.string(),
  target_language: z.string()
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string()
});

export async function register(req: Request, res: Response) {
  try {
    const data = registerSchema.parse(req.body);
    const user = await registerUser(data);
    
    res.status(201).json({
      id: user.id,
      email: user.email,
      username: user.username,
      native_language: user.native_language,
      target_language: user.target_language,
      level: user.level,
      created_at: user.created_at
    });
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
}

export async function login(req: Request, res: Response) {
  try {
    const { email, password } = loginSchema.parse(req.body);
    const { user, token } = await loginUser(email, password);
    
    res.status(200).json({
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        level: user.level
      },
      token
    });
  } catch (error) {
    res.status(401).json({ error: (error as Error).message });
  }
}
```

- [ ] **Step 3: 创建认证路由**

```typescript
import { Router } from 'express';
import { register, login } from '../controllers/authController';

const router = Router();

router.post('/register', register);
router.post('/login', login);

export default router;
```

- [ ] **Step 4: 创建认证中间件**

```typescript
import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../services/authService';
import { AppDataSource } from '../config/database';
import { User } from '../entities/User';

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

export async function authenticate(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);
    
    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({ where: { id: decoded.userId } });
    
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
}
```

- [ ] **Step 5: 更新server.ts添加路由**

```typescript
import authRoutes from './routes/authRoutes';

app.use('/api/auth', authRoutes);
```

---

## Phase 2: AI对话模块与3D场景 (第3-4周)

### Task 4: AI对话服务

**Files:**
- Create: `backend/src/services/aiService.ts`
- Create: `backend/src/controllers/conversationController.ts`
- Create: `backend/src/routes/conversationRoutes.ts`
- Create: `backend/src/entities/Conversation.ts`

- [ ] **Step 1: 创建Conversation实体**

```typescript
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { User } from './User';

export type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
};

@Entity('conversations')
export class Conversation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User)
  user: User;

  @Column()
  user_id: string;

  @Column()
  scenario: string;

  @Column({ type: 'json' })
  messages: Message[];

  @Column({ nullable: true })
  score: number;

  @Column({ type: 'text', nullable: true })
  feedback: string;

  @CreateDateColumn()
  created_at: Date;
}
```

- [ ] **Step 2: 创建AI服务**

```typescript
import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function generateResponse(
  messages: { role: string; content: string }[],
  scenario: string,
  targetLanguage: string
): Promise<string> {
  const systemPrompt = `
    You are a language learning assistant.
    Current scenario: ${scenario}
    Target language: ${targetLanguage}
    
    Rules:
    1. Respond in ${targetLanguage}
    2. Keep responses natural and conversational
    3. Correct grammar and vocabulary gently
    4. Ask follow-up questions to keep the conversation going
    5. Provide helpful feedback when appropriate
  `.trim();

  const response = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      { role: 'system', content: systemPrompt },
      ...messages
    ],
    temperature: 0.7,
    max_tokens: 500
  });

  return response.choices[0].message.content || '';
}

export async function analyzeConversation(
  messages: { role: string; content: string }[],
  targetLanguage: string
): Promise<{ score: number; correction: string; suggestion: string }> {
  const analysisPrompt = `
    Analyze this conversation for language learning purposes.
    Target language: ${targetLanguage}
    
    Conversation:
    ${messages.map(m => `${m.role}: ${m.content}`).join('\n')}
    
    Provide:
    1. A score (0-1) for overall proficiency
    2. Grammar/vocabulary corrections
    3. Suggestions for improvement
    
    Format as JSON with score, correction, and suggestion fields.
  `.trim();

  const response = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [{ role: 'user', content: analysisPrompt }],
    temperature: 0.3
  });

  try {
    return JSON.parse(response.choices[0].message.content || '{}');
  } catch {
    return { score: 0.5, correction: '', suggestion: '' };
  }
}
```

### Task 5: 3D场景管理

**Files:**
- Create: `backend/src/entities/Scene.ts`
- Create: `backend/src/entities/SceneObject.ts`
- Create: `backend/src/controllers/sceneController.ts`
- Create: `backend/src/routes/sceneRoutes.ts`

- [ ] **Step 1: 创建Scene实体**

```typescript
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';
import { SceneObject } from './SceneObject';

@Entity('scenes')
export class Scene {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  name: string;

  @Column({ nullable: false })
  type: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ nullable: false })
  model_url: string;

  @Column({ nullable: true })
  thumbnail_url: string;

  @Column({ default: true })
  is_active: boolean;

  @OneToMany(() => SceneObject, object => object.scene)
  objects: SceneObject[];

  @CreateDateColumn()
  created_at: Date;
}
```

- [ ] **Step 2: 创建SceneObject实体**

```typescript
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Scene } from './Scene';

@Entity('scene_objects')
export class SceneObject {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Scene)
  scene: Scene;

  @Column()
  scene_id: string;

  @Column({ nullable: false })
  name: string;

  @Column({ type: 'float', default: 0 })
  position_x: number;

  @Column({ type: 'float', default: 0 })
  position_y: number;

  @Column({ type: 'float', default: 0 })
  position_z: number;

  @Column({ default: false })
  interactive: boolean;

  @Column({ nullable: true })
  trigger_action: string;
}
```

### Task 6: 前端项目初始化

**Files:**
- Create: `frontend/package.json`
- Create: `frontend/tsconfig.json`
- Create: `frontend/next.config.js`
- Create: `frontend/src/pages/_app.tsx`
- Create: `frontend/src/pages/index.tsx`

- [ ] **Step 1: 创建package.json**

```json
{
  "name": "lingua-journey-frontend",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "next": "^14.1.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "axios": "^1.6.7",
    "three": "^0.160.0",
    "@react-three/fiber": "^8.15.0",
    "@react-three/drei": "^9.92.0",
    "tailwindcss": "^3.4.1"
  },
  "devDependencies": {
    "@types/node": "^20.11.0",
    "@types/react": "^18.2.48",
    "@types/react-dom": "^18.2.18",
    "@types/three": "^0.160.0",
    "typescript": "^5.3.3",
    "postcss": "^8.4.33",
    "autoprefixer": "^10.4.17",
    "eslint": "^8.56.0",
    "eslint-config-next": "^14.1.0"
  }
}
```

- [ ] **Step 2: 创建tailwind配置**

```js
// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

- [ ] **Step 3: 创建CSS文件**

```css
/* src/styles/globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;
```

---

## Phase 3: AI老师模块与语言测评 (第5-6周)

### Task 7: AI老师服务

**Files:**
- Create: `backend/src/services/teacherService.ts`
- Create: `backend/src/controllers/teacherController.ts`
- Create: `backend/src/routes/teacherRoutes.ts`
- Create: `backend/src/entities/Course.ts`

### Task 8: 语言测评模块

**Files:**
- Create: `backend/src/services/assessmentService.ts`
- Create: `backend/src/controllers/assessmentController.ts`
- Create: `backend/src/routes/assessmentRoutes.ts`
- Create: `backend/src/entities/Assessment.ts`

---

## Phase 4: 词汇学习与文化模块 (第7-8周)

### Task 9: 词汇学习模块

**Files:**
- Create: `backend/src/services/vocabularyService.ts`
- Create: `backend/src/controllers/vocabularyController.ts`
- Create: `backend/src/routes/vocabularyRoutes.ts`
- Create: `backend/src/entities/Vocabulary.ts`
- Create: `backend/src/entities/UserVocabulary.ts`

### Task 10: 文化学习模块

**Files:**
- Create: `backend/src/services/cultureService.ts`
- Create: `backend/src/controllers/cultureController.ts`
- Create: `backend/src/routes/cultureRoutes.ts`

---

## Phase 5: 社区互动与Admin面板 (第9-10周)

### Task 11: 社区互动模块

**Files:**
- Create: `backend/src/services/communityService.ts`
- Create: `backend/src/controllers/communityController.ts`
- Create: `backend/src/routes/communityRoutes.ts`

### Task 12: Admin面板

**Files:**
- Create: `frontend/src/pages/admin/*`

---

## Phase 6: 移动端开发 (第11-12周)

### Task 13: React Native项目初始化

**Files:**
- Create: `mobile/package.json`
- Create: `mobile/App.tsx`
- Create: `mobile/ios/`
- Create: `mobile/android/`

---

## 测试计划

### 单元测试

- [ ] 后端服务测试
- [ ] API端点测试
- [ ] 数据库集成测试

### 前端测试

- [ ] 组件测试
- [ ] E2E测试

---

## 部署计划

### 开发环境
```bash
docker-compose up -d
cd backend && npm run dev
cd frontend && npm run dev
```

### 生产环境
```bash
cd backend && npm run build && npm run start
cd frontend && npm run build && npm run start
```

---

**版本**: 1.0  
**创建日期**: 2026-06-04  
**状态**: 待执行