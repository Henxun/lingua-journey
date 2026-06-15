# 数据分析增强任务列表

## 后端任务

### 1. 新增实体
- [x] 创建 `LearningSession` 实体
- [x] 创建 `UserReminder` 实体
- [ ] 扩展 `LearningGoal` 实体添加预测字段

### 2. 扩展 analyticsService
- [x] 添加 `getLearningHabits()` 方法 - 学习习惯分析
- [x] 添加 `getProgressPrediction()` 方法 - 进度预测
- [x] 添加 `getComprehensiveReport()` 方法 - 综合报告
- [x] 添加 `calculateBestLearningTime()` 方法 - 最佳时段计算（集成在getLearningHabits中）
- [x] 添加 `calculateEfficiencyCurve()` 方法 - 效率曲线计算（集成在getLearningHabits中）

### 3. 创建 reminderService
- [ ] 创建提醒服务
- [ ] 添加 `configureReminder()` 方法
- [ ] 添加 `getReminders()` 方法
- [ ] 添加 `sendReminder()` 方法
- [ ] 添加定时任务检查逻辑

### 4. 更新控制器和路由
- [x] 添加 `/api/analytics/habits` 端点
- [x] 添加 `/api/analytics/prediction` 端点
- [x] 添加 `/api/analytics/comprehensive` 端点
- [x] 添加 `/api/analytics/trend` 端点
- [ ] 添加 `/api/reminders` 相关端点

### 5. 数据库迁移
- [x] 自动迁移（SQLite自动创建表）

## 前端任务

### 6. 安装图表库
- [x] 安装 recharts 库
- [x] 配置图表样式主题

### 7. 创建学习习惯组件
- [x] 创建每日分布热力图（集成在analytics页面）
- [x] 创建每周分布柱状图（集成在analytics页面）
- [x] 创建效率曲线图（集成在analytics页面）
- [x] 创建最佳时段指示器（集成在analytics页面）

### 8. 创建进度预测组件
- [x] 创建目标进度卡片（集成在analytics页面）
- [x] 创建预测时间线（集成在analytics页面）
- [x] 创建风险指示器（集成在analytics页面）

### 9. 创建技能雷达图
- [x] 创建技能雷达图组件（集成在analytics页面）

### 10. 创建提醒设置组件
- [ ] 创建 `ReminderSettings` 设置面板
- [ ] 创建 `ReminderPreview` 预览组件
- [ ] 创建 `ReminderHistory` 历史组件

### 11. 更新 API 类型定义
- [x] 添加 `LearningHabits` 类型（在analyticsService中）
- [x] 添加 `ProgressPrediction` 类型（在analyticsService中）
- [x] 添加 `ComprehensiveReport` 类型（在analyticsService中）
- [ ] 添加 `Reminder` 相关类型

### 12. 更新分析页面
- [ ] 更新 `/progress` 页面添加新图表
- [ ] 更新 `/profile/stats` 页面添加习惯分析
- [x] 创建 `/analytics` 综合分析页面

## 集成任务

### 13. 记录学习会话
- [ ] 在对话练习中记录会话
- [ ] 在评估中记录会话
- [ ] 在词汇学习中记录会话
- [ ] 在3D场景中记录会话

### 14. 提醒系统集成
- [ ] 添加浏览器通知支持
- [ ] 添加邮件提醒支持（可选）
- [ ] 添加推送提醒支持（可选）

## 测试任务

### 15. 单元测试
- [ ] 测试学习习惯计算算法
- [ ] 测试进度预测算法
- [ ] 测试提醒服务

### 16. 集成测试
- [ ] 测试完整分析流程
- [ ] 测试提醒发送流程
- [ ] 测试前端图表渲染

## 验收标准

- [x] 用户可查看详细的学习习惯分析
- [x] 系统可预测目标达成时间
- [ ] 智能提醒系统正常工作（部分完成）
- [x] 至少4种新的数据可视化图表
- [x] 分析页面响应时间 < 2秒