# 词汇卡片系统 - 任务清单

## 1. 后端数据模型

- [ ] 1.1 创建 VocabularyCard entity (词汇卡片表)
- [ ] 1.2 创建 VocabularyDeck entity (词汇卡组表)
- [ ] 1.3 创建 ReviewLog entity (复习记录表)
- [ ] 1.4 更新 database.ts 注册新实体

## 2. 后端服务层

- [ ] 2.1 创建 vocabularyCardService
- [ ] 2.2 实现 SM-2 spaced repetition 算法
- [ ] 2.3 实现 review scheduling 调度逻辑
- [ ] 2.4 创建 vocabularyDeckService (卡组管理)
- [ ] 2.5 创建 reviewLogService (复习记录)
- [ ] 2.6 实现 auto-vocabulary extraction from lessons

## 3. 后端 API

- [ ] 3.1 POST `/api/vocabulary/cards` - 创建词汇卡片
- [ ] 3.2 GET `/api/vocabulary/cards` - 获取用户词汇库
- [ ] 3.3 PUT `/api/vocabulary/cards/:id` - 更新词汇卡片
- [ ] 3.4 DELETE `/api/vocabulary/cards/:id` - 删除词汇卡片
- [ ] 3.5 POST `/api/vocabulary/cards/:id/review` - 提交复习结果
- [ ] 3.6 GET `/api/vocabulary/review/due` - 获取今日应复习卡片
- [ ] 3.7 GET `/api/vocabulary/decks` - 获取所有卡组
- [ ] 3.8 POST `/api/vocabulary/decks` - 创建新卡组
- [ ] 3.9 POST `/api/vocabulary/decks/:id/cards` - 向卡组添加卡片
- [ ] 3.10 集成到 server.ts

## 4. 前端 API

- [ ] 4.1 在 api.ts 添加 vocabulary 相关方法
- [ ] 4.2 createCard, getCards, updateCard, deleteCard
- [ ] 4.3 getDueCards, submitReview
- [ ] 4.4 getDecks, createDeck, addCardToDeck

## 5. 前端页面

- [ ] 5.1 创建 `/vocabulary` 词汇主页面
- [ ] 5.2 创建 `/vocabulary/review` 复习页面
- [ ] 5.3 实现 flashcard 卡片翻转交互
- [ ] 5.4 实现 deck 卡组管理组件
- [ ] 5.5 实现 vocabulary library 词汇库浏览
- [ ] 5.6 在个人中心添加词汇入口

## 6. 集成

- [ ] 6.1 与 gamification 集成 (词汇复习 XP 奖励)
- [ ] 6.2 与 course 集成 (自动从课程提取词汇)
- [ ] 6.3 与 achievement 集成 (词汇相关成就)

## 7. 构建验证

- [ ] 7.1 后端构建通过
- [ ] 7.2 前端构建通过
- [ ] 7.3 功能验收测试
