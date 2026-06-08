# 对话练习系统 - 任务清单

## 1. 后端数据模型

- [x] 1.1 创建 ConversationSession entity
- [x] 1.2 创建 ConversationMessage entity
- [x] 1.3 更新 server.ts 注册新实体

## 2. 后端服务层

- [x] 2.1 创建 conversationService
- [x] 2.2 实现创建会话方法
- [x] 2.3 实现发送消息方法（集成AI模拟）
- [x] 2.4 实现获取会话历史方法
- [x] 2.5 实现完成会话并评分方法

## 3. 后端 API

- [x] 3.1 POST `/api/conversations` - 创建新会话
- [x] 3.2 GET `/api/conversations/:id` - 获取会话详情
- [x] 3.3 PUT `/api/conversations/:id/complete` - 完成会话
- [x] 3.4 GET `/api/conversations/history` - 获取历史会话
- [x] 3.5 POST `/api/conversations/:id/messages` - 发送消息
- [x] 3.6 GET `/api/conversations/:id/messages` - 获取消息列表
- [x] 3.7 集成到 server.ts

## 4. 前端 API

- [x] 4.1 在 api.ts 添加对话相关方法
- [x] 4.2 createConversation
- [x] 4.3 sendMessage
- [x] 4.4 getConversationHistory
- [x] 4.5 completeConversation

## 5. 前端页面

- [x] 5.1 创建 `/conversations/[id]` 页面
- [x] 5.2 实现聊天界面布局
- [x] 5.3 实现 ChatMessage 组件
- [x] 5.4 实现 ChatInput 组件
- [x] 5.5 实现消息发送逻辑
- [x] 5.6 实现评分展示
- [x] 5.7 添加到课程详情页的"开始练习"按钮

## 6. 集成

- [ ] 6.1 在课程章节页面添加入口
- [ ] 6.2 学习统计更新集成
- [ ] 6.3 会话超时处理

## 7. 构建验证

- [x] 7.1 后端构建通过
- [x] 7.2 前端构建通过
- [ ] 7.3 功能验收测试
