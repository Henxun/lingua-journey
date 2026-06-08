# 对话练习系统 - 设计文档

## 1. 概述

对话练习系统允许用户在课程章节中进行AI驱动的对话练习，通过模拟真实场景对话来提升语言能力。

## 2. 核心功能

### 2.1 对话会话管理
- 创建对话会话（基于课程章节）
- 保存对话历史
- 实时对话流
- 会话超时处理

### 2.2 AI对话引擎
- 基于用户输入生成AI回复
- 上下文理解
- 多轮对话支持
- 评分和反馈

### 2.3 评分系统
- 基于词汇、语法、流利度评分
- 实时反馈
- 改进建议

## 3. 数据模型

### ConversationSession
```
- id: UUID
- lesson_id: UUID (FK)
- user_id: UUID (FK)
- messages: JSON[]
- score: number (可选)
- status: enum (active, completed, abandoned)
- started_at: timestamp
- completed_at: timestamp (可选)
```

### ConversationMessage
```
- id: UUID
- session_id: UUID (FK)
- role: enum (user, ai)
- content: text
- created_at: timestamp
```

## 4. API设计

### 对话会话
- `POST /api/conversations` - 创建新会话
- `GET /api/conversations/:id` - 获取会话详情
- `PUT /api/conversations/:id/complete` - 完成会话
- `GET /api/conversations/history` - 获取用户历史会话

### 消息
- `POST /api/conversations/:id/messages` - 发送消息并获取AI回复
- `GET /api/conversations/:id/messages` - 获取会话消息列表

## 5. 前端实现

### 页面
- `/conversations/[sessionId]` - 对话练习页面
- 实时聊天界面
- 消息气泡展示
- 评分展示
- 下一题/完成按钮

### 组件
- ChatMessage - 消息气泡
- ChatInput - 输入框
- ScoreDisplay - 评分展示
- ConversationList - 历史会话列表

## 6. 技术栈

- **后端**: Express.js + TypeORM
- **前端**: Next.js + React
- **AI**: 集成 OpenAI API（模拟）
- **存储**: PostgreSQL

## 7. 用户流程

1. 用户选择课程章节
2. 点击"开始练习"
3. 系统创建对话会话
4. 用户与AI进行多轮对话
5. AI根据用户输入给出回复
6. 用户完成对话后获得评分
7. 更新学习统计
