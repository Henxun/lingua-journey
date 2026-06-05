# 多语种AI在线教育平台设计文档

## 1. 项目概述

### 1.1 项目背景
本项目旨在构建一款支持多语种学习的AI在线教育平台，核心亮点是真实场景模拟对话交流和AI老师个性化教学。平台采用前后端分离架构，支持Web端和移动端跨平台访问。

### 1.2 目标用户
- **初学者**：零基础或入门级语言学习者
- **进阶学习者**：有一定基础，希望提升听说能力
- **专业人士**：需要商务或专业场景语言能力
- **全年龄段**：覆盖所有层次的学习者

### 1.3 核心价值主张
- **沉浸式学习**：通过3D可互动场景模拟对话提升语言应用能力
- **个性化教学**：AI老师根据学习者水平提供定制化课程
- **多平台支持**：Web端 + React Native移动端全覆盖
- **可扩展架构**：支持未来添加新语言和功能模块

---

## 2. 功能需求

### 2.1 核心功能模块

| 模块 | 功能描述 | 优先级 |
|------|----------|--------|
| **用户管理** | 用户注册、登录、资料管理、订阅管理 | 高 |
| **AI对话练习** | 多场景模拟对话、语音识别、智能纠错、3D场景互动 | 高 |
| **AI老师教学** | 个性化课程推荐、知识点讲解、答疑解惑 | 高 |
| **语言测评** | 水平测试、口语测评、成绩报告 | 高 |
| **词汇记忆** | 单词卡片、间隔重复、词汇量测试 | 中 |
| **文化学习** | 文化知识、习俗讲解、节日介绍 | 中 |
| **社区互动** | 学习小组、讨论区、排行榜 | 中 |

### 2.2 AI对话场景

| 场景类型 | 具体内容 | 3D场景 |
|----------|----------|--------|
| **日常对话** | 购物、点餐、问路、就医 | 超市、餐厅、街道、医院 |
| **商务场景** | 会议、谈判、邮件沟通、面试 | 会议室、办公室、面试间 |
| **旅行场景** | 订酒店、问路、景点介绍、交通 | 酒店前台、机场、火车站 |
| **考试场景** | 模拟语言考试对话练习 | 考试教室 |

### 2.3 3D场景互动功能

| 功能 | 描述 |
|------|------|
| **场景渲染** | 使用Three.js渲染3D场景 |
| **视角控制** | 支持旋转、缩放、平移 |
| **物体交互** | 点击场景中的物体触发对话 |
| **角色动画** | AI角色动画展示 |
| **场景切换** | 根据对话进度切换场景 |

### 2.4 支持语言策略
- 初始支持：英语、汉语、日语、韩语、西班牙语
- 架构设计支持未来扩展添加新语言

---

## 3. 技术架构

### 3.1 整体架构

```
┌─────────────────────────────────────────────────────────────────┐
│                        前端层 (Frontend)                        │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │   Web端     │  │  React      │  │   Admin    │             │
│  │ (Next.js)   │  │  Native     │  │  Panel     │             │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘             │
└─────────┼────────────────┼────────────────┼─────────────────────┘
          │                │                │
          ▼                ▼                ▼
┌─────────────────────────────────────────────────────────────────┐
│                     API 网关层 (API Gateway)                    │
│              ┌───────────────────────────────┐                 │
│              │   Auth · Rate Limit · Logging │                 │
│              └───────────────────────────────┘                 │
└─────────────────────────────────────────────────────────────────┘
          │                │                │
          ▼                ▼                ▼
┌─────────────────────────────────────────────────────────────────┐
│                       后端服务层 (Backend)                      │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │  用户服务   │  │  学习服务   │  │  社区服务   │             │
│  │ (User)      │  │ (Learning)  │  │ (Community) │             │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘             │
│         │                │                │                     │
│         ▼                ▼                ▼                     │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │  AI对话服务 │  │  测评服务   │  │  词汇服务   │             │
│  │ (AI Chat)   │  │ (Assessment)│  │ (Vocabulary)│             │
│  └─────────────┘  └─────────────┘  └─────────────┘             │
└─────────────────────────────────────────────────────────────────┘
          │                │                │
          └────────────────┼────────────────┘
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                        数据层 (Data Layer)                      │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │ PostgreSQL  │  │   Redis     │  │   OpenAI    │             │
│  │ (主数据)    │  │  (缓存)     │  │   API       │             │
│  └─────────────┘  └─────────────┘  └─────────────┘             │
└─────────────────────────────────────────────────────────────────┘
```

### 3.2 技术栈

| 层级 | 技术 | 版本 | 说明 |
|------|------|------|------|
| **前端Web** | React + TypeScript + Next.js | 14.x | SSR支持，SEO友好 |
| **前端移动端** | React Native + TypeScript | 0.72.x | 跨平台iOS/Android |
| **样式** | Tailwind CSS | 3.x | 响应式设计 |
| **后端** | Node.js + Express + TypeScript | 20.x | RESTful API |
| **数据库** | PostgreSQL | 16.x | 关系型数据存储 |
| **缓存** | Redis | 7.x | 会话缓存 |
| **AI集成** | OpenAI API | - | 对话生成与纠错 |
| **语音识别** | Google Speech API | - | 语音转文字 |
| **语音合成** | Google TTS / react-native-tts | - | 文字转语音 |
| **3D渲染** | Three.js | 0.160.x | Web端3D场景渲染 |
| **3D模型** | GLB/GLTF格式 | - | 场景和角色模型 |

### 3.3 代码复用策略

```
┌─────────────────────────────────────────────────────┐
│                     共享代码层 (Shared)            │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐ │
│  │  API Client │  │  Types      │  │  Utils      │ │
│  │  (Axios)    │  │  (TS)       │  │  Functions  │ │
│  └─────────────┘  └─────────────┘  └─────────────┘ │
└───────────────────────────┬─────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        ▼                   ▼                   ▼
┌─────────────┐      ┌─────────────┐      ┌─────────────┐
│   Web       │      │   Mobile    │      │   Admin     │
│  Components │      │  Components │      │  Components │
└─────────────┘      └─────────────┘      └─────────────┘
```

### 3.4 关键设计原则

1. **前后端分离**：API驱动，前端独立开发
2. **微服务架构**：核心功能模块化，独立部署
3. **跨平台复用**：共享类型定义和业务逻辑
4. **安全性优先**：JWT认证、HTTPS、输入验证

---

## 4. 数据库设计

### 4.1 用户表 (users)

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | UUID | PRIMARY KEY | 用户唯一标识 |
| email | VARCHAR(255) | UNIQUE, NOT NULL | 邮箱地址 |
| username | VARCHAR(100) | UNIQUE, NOT NULL | 用户名 |
| password_hash | VARCHAR(255) | NOT NULL | 密码哈希 |
| native_language | VARCHAR(50) | NOT NULL | 母语 |
| target_language | VARCHAR(50) | NOT NULL | 目标语言 |
| level | VARCHAR(20) | DEFAULT 'beginner' | 当前水平 |
| avatar_url | VARCHAR(500) | NULL | 头像URL |
| subscription_type | VARCHAR(20) | DEFAULT 'free' | 订阅类型 |
| created_at | TIMESTAMP | DEFAULT NOW() | 创建时间 |
| updated_at | TIMESTAMP | DEFAULT NOW() | 更新时间 |

### 4.2 学习进度表 (learning_progress)

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | UUID | PRIMARY KEY | 主键 |
| user_id | UUID | FOREIGN KEY | 用户ID |
| course_id | UUID | FOREIGN KEY | 课程ID |
| progress | FLOAT | DEFAULT 0 | 进度(0-100) |
| completed_at | TIMESTAMP | NULL | 完成时间 |
| created_at | TIMESTAMP | DEFAULT NOW() | 创建时间 |

### 4.3 对话记录表 (conversation_logs)

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | UUID | PRIMARY KEY | 主键 |
| user_id | UUID | FOREIGN KEY | 用户ID |
| scenario | VARCHAR(50) | NOT NULL | 场景类型 |
| messages | JSON | NOT NULL | 对话内容 |
| score | FLOAT | NULL | 评分 |
| feedback | TEXT | NULL | 反馈内容 |
| created_at | TIMESTAMP | DEFAULT NOW() | 创建时间 |

### 4.4 词汇表 (vocabulary)

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | UUID | PRIMARY KEY | 主键 |
| word | VARCHAR(200) | NOT NULL | 单词 |
| translation | VARCHAR(500) | NOT NULL | 翻译 |
| pronunciation | VARCHAR(200) | NULL | 发音 |
| example | TEXT | NULL | 例句 |
| category | VARCHAR(50) | NULL | 分类 |
| difficulty | INT | DEFAULT 1 | 难度等级 |

### 4.5 用户词汇学习表 (user_vocabulary)

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | UUID | PRIMARY KEY | 主键 |
| user_id | UUID | FOREIGN KEY | 用户ID |
| word_id | UUID | FOREIGN KEY | 词汇ID |
| status | VARCHAR(20) | DEFAULT 'new' | 学习状态 |
| last_review_at | TIMESTAMP | NULL | 最后复习时间 |
| next_review_at | TIMESTAMP | NULL | 下次复习时间 |
| review_count | INT | DEFAULT 0 | 复习次数 |
| created_at | TIMESTAMP | DEFAULT NOW() | 创建时间 |

### 4.6 场景表 (scenes)

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | UUID | PRIMARY KEY | 主键 |
| name | VARCHAR(100) | NOT NULL | 场景名称 |
| type | VARCHAR(50) | NOT NULL | 场景类型 |
| description | TEXT | NULL | 场景描述 |
| model_url | VARCHAR(500) | NOT NULL | 3D模型URL |
| thumbnail_url | VARCHAR(500) | NULL | 缩略图URL |
| is_active | BOOLEAN | DEFAULT true | 是否启用 |
| created_at | TIMESTAMP | DEFAULT NOW() | 创建时间 |

### 4.7 场景物体表 (scene_objects)

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | UUID | PRIMARY KEY | 主键 |
| scene_id | UUID | FOREIGN KEY | 场景ID |
| name | VARCHAR(100) | NOT NULL | 物体名称 |
| position_x | FLOAT | DEFAULT 0 | X坐标 |
| position_y | FLOAT | DEFAULT 0 | Y坐标 |
| position_z | FLOAT | DEFAULT 0 | Z坐标 |
| interactive | BOOLEAN | DEFAULT false | 是否可交互 |
| trigger_action | VARCHAR(200) | NULL | 触发动作 |

---

## 5. API 接口设计

### 5.1 用户模块

| 方法 | 路径 | 描述 | 认证 |
|------|------|------|------|
| POST | /api/users/register | 用户注册 | 否 |
| POST | /api/users/login | 用户登录 | 否 |
| GET | /api/users/profile | 获取用户信息 | 是 |
| PUT | /api/users/profile | 更新用户信息 | 是 |
| POST | /api/users/logout | 用户登出 | 是 |

**POST /api/users/register**

请求体：
```json
{
  "email": "string",
  "username": "string",
  "password": "string",
  "native_language": "string",
  "target_language": "string"
}
```

响应：
```json
{
  "id": "uuid",
  "email": "string",
  "username": "string",
  "native_language": "string",
  "target_language": "string",
  "level": "string",
  "created_at": "timestamp"
}
```

### 5.2 AI对话模块

| 方法 | 路径 | 描述 | 认证 |
|------|------|------|------|
| GET | /api/conversations/scenarios | 获取场景列表 | 是 |
| POST | /api/conversations/start | 开始新对话 | 是 |
| POST | /api/conversations/message | 发送消息 | 是 |
| GET | /api/conversations/history | 获取对话历史 | 是 |
| GET | /api/conversations/:id | 获取单个对话 | 是 |

**POST /api/conversations/message**

请求体：
```json
{
  "conversation_id": "uuid",
  "message": "string",
  "is_voice": false
}
```

响应：
```json
{
  "id": "uuid",
  "user_message": "string",
  "ai_message": "string",
  "feedback": {
    "correction": "string",
    "suggestion": "string",
    "score": 0.85
  },
  "timestamp": "timestamp"
}
```

### 5.3 AI老师模块

| 方法 | 路径 | 描述 | 认证 |
|------|------|------|------|
| GET | /api/teacher/courses | 获取推荐课程 | 是 |
| POST | /api/teacher/question | 向AI老师提问 | 是 |
| GET | /api/teacher/lessons/:id | 获取课程详情 | 是 |

### 5.4 语言测评模块

| 方法 | 路径 | 描述 | 认证 |
|------|------|------|------|
| GET | /api/assessment/types | 获取测评类型 | 是 |
| POST | /api/assessment/start | 开始测评 | 是 |
| POST | /api/assessment/submit | 提交答案 | 是 |
| GET | /api/assessment/result/:id | 获取测评结果 | 是 |
| GET | /api/assessment/history | 获取测评历史 | 是 |

### 5.5 词汇学习模块

| 方法 | 路径 | 描述 | 认证 |
|------|------|------|------|
| GET | /api/vocabulary/list | 获取单词列表 | 是 |
| GET | /api/vocabulary/review | 获取待复习单词 | 是 |
| POST | /api/vocabulary/learn | 标记学习 | 是 |
| POST | /api/vocabulary/test | 词汇测试 | 是 |
| GET | /api/vocabulary/stats | 获取学习统计 | 是 |

### 5.6 3D场景模块

| 方法 | 路径 | 描述 | 认证 |
|------|------|------|------|
| GET | /api/scenes/list | 获取场景列表 | 是 |
| GET | /api/scenes/:id | 获取场景详情 | 是 |
| GET | /api/scenes/:id/objects | 获取场景物体列表 | 是 |
| POST | /api/scenes/:id/interact | 场景交互 | 是 |

**GET /api/scenes/:id**

响应：
```json
{
  "id": "uuid",
  "name": "string",
  "type": "string",
  "description": "string",
  "model_url": "string",
  "thumbnail_url": "string",
  "objects": [
    {
      "id": "uuid",
      "name": "string",
      "position": { "x": 0, "y": 0, "z": 0 },
      "interactive": true
    }
  ]
}
```

---

## 6. 安全性设计

### 6.1 认证机制

- **JWT Token**：无状态认证，有效期24小时
- **Refresh Token**：存储在HttpOnly Cookie中
- **OAuth2.0**：支持第三方登录（Google、Facebook）

### 6.2 数据加密

- **密码存储**：使用bcrypt加密（10轮）
- **数据传输**：全站HTTPS
- **敏感数据**：API密钥存储在环境变量中

### 6.3 输入验证

- **前端验证**：使用Zod/Schema验证
- **后端验证**：双重验证，防止绕过前端
- **SQL注入防护**：使用TypeORM参数化查询

### 6.4 API安全

- **Rate Limiting**：每分钟最多100次请求
- **CORS配置**：限制允许的域名
- **日志记录**：记录所有API请求和异常

---

## 7. 部署架构

```
┌─────────────────────────────────────────────────────┐
│                        CDN                         │
│                    (Cloudflare)                    │
└───────────────────────────┬─────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        ▼                   ▼                   ▼
┌─────────────┐      ┌─────────────┐      ┌─────────────┐
│   Frontend  │      │  API Gateway│      │   Admin     │
│  (Vercel)   │      │  (Nginx)    │      │  Panel      │
└─────────────┘      └───────┬───────┘      └─────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        ▼                   ▼                   ▼
┌─────────────┐      ┌─────────────┐      ┌─────────────┐
│  Backend    │      │   AI Service│      │  Database   │
│  (Node.js)  │      │  (Python)   │      │ (PostgreSQL)│
└─────────────┘      └─────────────┘      └─────────────┘
```

### 7.1 环境配置

| 环境 | 描述 | 部署方式 |
|------|------|----------|
| **开发环境** | 本地开发 | Docker Compose |
| **测试环境** | CI/CD测试 | Kubernetes |
| **生产环境** | 线上服务 | Kubernetes + Cloudflare |

---

## 8. 移动端特殊设计

### 8.1 React Native 功能支持

| 功能 | 实现方式 | 依赖库 |
|------|----------|--------|
| **语音识别** | 原生模块 + Google Speech API | react-native-voice |
| **语音合成** | 原生TTS引擎 | react-native-tts |
| **推送通知** | FCM | @react-native-firebase/messaging |
| **离线缓存** | AsyncStorage + Realm | realm |
| **手势识别** | 原生手势系统 | react-native-gesture-handler |
| **动画** | 原生动画驱动 | react-native-reanimated |

### 8.2 移动端架构

```
┌─────────────────────────────────────────────────────────────┐
│                    React Native App                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │  UI层      │  │ 业务逻辑层  │  │  API层      │         │
│  │ Components │  │  Hooks      │  │  Axios      │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
│                         │                                  │
│                         ▼                                  │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              原生模块层 (Native Modules)            │   │
│  │  Voice · TTS · Camera · Notifications · Storage    │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## 9. 开发计划

### 9.1 里程碑

| 阶段 | 时间 | 目标 |
|------|------|------|
| **Phase 1** | 第1-2周 | 基础架构搭建、用户模块 |
| **Phase 2** | 第3-4周 | AI对话模块、语音功能 |
| **Phase 3** | 第5-6周 | AI老师模块、语言测评 |
| **Phase 4** | 第7-8周 | 词汇学习、文化学习 |
| **Phase 5** | 第9-10周 | 社区互动、Admin面板 |
| **Phase 6** | 第11-12周 | 移动端开发、测试上线 |

### 9.2 技术债务

- [ ] 代码覆盖率达到80%
- [ ] API文档自动生成
- [ ] 性能监控集成
- [ ] 错误追踪系统

---

## 10. 附录

### 10.1 状态码定义

| 状态码 | 含义 |
|--------|------|
| 200 | 成功 |
| 201 | 创建成功 |
| 400 | 请求参数错误 |
| 401 | 未认证 |
| 403 | 无权限 |
| 404 | 资源不存在 |
| 500 | 服务器错误 |

### 10.2 错误响应格式

```json
{
  "error": {
    "code": "string",
    "message": "string",
    "details": "string"
  }
}
```

---

**版本**: 1.0  
**创建日期**: 2026-06-04  
**作者**: Comet AI  
**状态**: 待审核