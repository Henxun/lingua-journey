# 学习进度统计 - 任务清单

## 1. 后端数据模型

- [ ] 1.1 在 User entity 添加 learning_stats JSON 字段
- [ ] 1.2 创建 statsService 提供统计更新和查询方法
- [ ] 1.3 添加 updateLearningStats 函数（对话完成后调用）

## 2. 后端 API

- [ ] 2.1 创建 GET `/api/stats/learning` 路由获取统计数据
- [ ] 2.2 在 Conversation 保存后自动更新统计数据
- [ ] 2.3 实现连续天数计算逻辑

## 3. 前端 API

- [ ] 3.1 在 api.ts 添加 getLearningStats 函数

## 4. 前端页面

- [ ] 4.1 创建 `/profile/stats` 页面
- [ ] 4.2 实现数字卡片组件（总时长、练习次数、正确率、连续天数）
- [ ] 4.3 在 `/profile` 页面添加"查看学习统计"入口

## 5. 构建验证

- [ ] 5.1 后端构建通过
- [ ] 5.2 前端构建通过
