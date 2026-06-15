# 数据分析增强设计文档

## 架构概览

```
┌─────────────────────────────────────────────────────────────────┐
│                      数据分析系统架构                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────┐     ┌──────────────┐     ┌──────────────┐    │
│  │   前端展示层  │     │    API层      │     │   服务层      │    │
│  │  Charts/     │◄───│  analytics   │───►│ analytics    │    │
│  │  Dashboard   │     │    Routes    │     │  Service     │    │
│  │  Reminders   │     │              │     │              │    │
│  └──────────────┘     └──────────────┘     └──────────────┘    │
│         │                    │                    │            │
│         ▼                    ▼                    ▼            │
│  ┌──────────────┐     ┌──────────────┐     ┌──────────────┐    │
│  │  Recharts    │     │  Controller  │     │  Prediction  │    │
│  │  图表组件    │     │              │     │    Engine    │    │
│  └──────────────┘     └──────────────┘     └──────────────┘    │
│                              │                    │            │
│                              ▼                    ▼            │
│                       ┌──────────────┐     ┌──────────────┐    │
│                       │ Reminder     │     │  Learning    │    │
│                       │  Service     │     │   Session    │    │
│                       └──────────────┘     └──────────────┘    │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                        数据层                                   │
│  ┌──────────────┐     ┌──────────────┐     ┌──────────────┐    │
│  │LearningSession│    │ UserReminder │     │LearningGoal  │    │
│  │  (新增)      │     │   (新增)     │     │              │    │
│  └──────────────┘     └──────────────┘     └──────────────┘    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## 数据模型设计

### 1. LearningSession 实体（新增）

记录每次学习会话的详细信息：

| 字段名 | 类型 | 说明 |
|--------|------|------|
| id | UUID | 主键 |
| user_id | UUID | 用户ID |
| session_type | string | 会话类型（conversation/assessment/vocabulary/scene） |
| started_at | datetime | 开始时间 |
| ended_at | datetime | 结束时间 |
| duration_minutes | int | 持续时间（分钟） |
| activity_count | int | 活动数量 |
| accuracy_rate | float | 准确率 |
| xp_earned | int | 获得XP |
| metadata | JSON | 其他元数据 |

### 2. UserReminder 实体（新增）

用户提醒设置：

| 字段名 | 类型 | 说明 |
|--------|------|------|
| id | UUID | 主键 |
| user_id | UUID | 用户ID |
| reminder_type | string | 提醒类型（daily/goal/inactivity） |
| preferred_time | time | 偏好时间 |
| enabled | boolean | 是否启用 |
| last_sent | datetime | 上次发送时间 |
| message_template | string | 消息模板 |

### 3. LearningGoal 实体扩展

| 新增字段 | 类型 | 说明 |
|----------|------|------|
| target_date | date | 目标日期 |
| current_progress | float | 当前进度 |
| predicted_completion | date | 预测完成日期 |
| daily_target | float | 每日目标 |

## API 设计

### 1. 学习习惯分析

**GET** `/api/analytics/habits`

**响应**:
```json
{
  "dailyDistribution": [
    { "hour": 8, "sessions": 5, "avgDuration": 15 },
    { "hour": 12, "sessions": 8, "avgDuration": 20 }
  ],
  "weeklyDistribution": [
    { "day": "Monday", "totalMinutes": 45, "sessions": 3 },
    { "day": "Tuesday", "totalMinutes": 60, "sessions": 4 }
  ],
  "bestLearningTime": {
    "hour": 20,
    "efficiencyScore": 92
  },
  "learningFrequency": {
    "avgDaysPerWeek": 4.5,
    "avgSessionsPerDay": 2.3,
    "consistencyScore": 85
  },
  "efficiencyCurve": [
    { "duration": 5, "accuracy": 95 },
    { "duration": 15, "accuracy": 88 },
    { "duration": 30, "accuracy": 75 }
  ]
}
```

### 2. 进度预测

**GET** `/api/analytics/prediction`

**响应**:
```json
{
  "goals": [
    {
      "id": "goal_1",
      "name": "Reach Level 20",
      "currentProgress": 65,
      "targetProgress": 100,
      "predictedCompletion": "2024-03-15",
      "daysRemaining": 45,
      "recommendedDailyXP": 150,
      "riskLevel": "low"
    }
  ],
  "overallPrediction": {
    "nextLevelDate": "2024-02-28",
    "fluencyEstimate": "B2 by June 2024",
    "confidence": 0.85
  },
  "recommendations": [
    "Increase daily practice by 10 minutes to reach goal faster",
    "Focus on speaking exercises to improve fluency"
  ]
}
```

### 3. 智能提醒

**POST** `/api/reminders/configure`

**请求**:
```json
{
  "reminderType": "daily",
  "preferredTime": "20:00",
  "enabled": true,
  "messageTemplate": "Time to practice! You're {{progress}}% towards your goal."
}
```

**GET** `/api/reminders`

**响应**:
```json
{
  "reminders": [
    {
      "id": "reminder_1",
      "type": "daily",
      "time": "20:00",
      "enabled": true,
      "lastSent": "2024-01-15T20:00:00Z"
    }
  ]
}
```

### 4. 综合分析报告

**GET** `/api/analytics/comprehensive`

**响应**:
```json
{
  "summary": {
    "totalLearningTime": 1200,
    "totalSessions": 85,
    "averageAccuracy": 87,
    "currentStreak": 12
  },
  "skills": {
    "listening": { "current": 75, "trend": "improving", "prediction": 85 },
    "speaking": { "current": 60, "trend": "stable", "prediction": 70 },
    "reading": { "current": 82, "trend": "improving", "prediction": 90 },
    "writing": { "current": 55, "trend": "declining", "prediction": 60 }
  },
  "habits": { /* 学习习惯数据 */ },
  "predictions": { /* 进度预测数据 */ },
  "recommendations": [ /* 个性化推荐 */ ]
}
```

## 前端组件设计

### 1. 学习习惯图表组件

```tsx
// DailyDistributionChart - 每日学习时间分布热力图
// WeeklyDistributionChart - 每周学习柱状图
// EfficiencyCurveChart - 学习效率曲线图
// BestTimeIndicator - 最佳学习时段指示器
```

### 2. 进度预测组件

```tsx
// GoalProgressCard - 目标进度卡片（含预测日期）
// PredictionTimeline - 预测时间线
// RecommendedDailyTarget - 推荐每日目标
// RiskIndicator - 风险等级指示器
```

### 3. 技能雷达图

```tsx
// SkillsRadarChart - 四技能雷达图
// SkillTrendLine - 单技能趋势线
```

### 4. 提醒设置组件

```tsx
// ReminderSettings - 提醒设置面板
// ReminderPreview - 提醒预览
// ReminderHistory - 提醒历史
```

## 数据流

```
用户学习活动 → 记录LearningSession → 分析服务处理 → 
  ├─ 计算学习习惯 → 存储分析结果 → 前端展示
  ├─ 更新进度预测 → 推送推荐 → 前端展示
  └─ 触发提醒检查 → 发送提醒 → 用户收到通知

用户设置提醒 → 存储UserReminder → 定时任务检查 → 
  ├─ 时间匹配 → 发送提醒
  └─ 长期未学习 → 发送提醒
```

## 算法设计

### 1. 最佳学习时段算法

```typescript
function calculateBestLearningTime(sessions: LearningSession[]): BestTime {
  // 按小时分组，计算每小时的平均准确率和效率
  const hourlyStats = groupByHour(sessions);
  
  // 综合考虑：
  // 1. 学习频率（该时段学习次数）
  // 2. 学习效率（准确率 × 活动数量）
  // 3. 学习时长（平均持续时间）
  
  return hourlyStats.reduce((best, current) => 
    current.efficiencyScore > best.efficiencyScore ? current : best
  );
}
```

### 2. 进度预测算法

```typescript
function predictGoalCompletion(goal: LearningGoal, history: LearningSession[]): Prediction {
  // 计算历史平均每日进度
  const avgDailyProgress = calculateAverageDailyProgress(history);
  
  // 计算剩余进度
  const remainingProgress = goal.targetProgress - goal.currentProgress;
  
  // 预测天数
  const predictedDays = remainingProgress / avgDailyProgress;
  
  // 考虑学习频率波动，添加置信区间
  const confidence = calculateConfidence(history);
  
  return {
    predictedCompletion: addDays(today, predictedDays),
    confidence,
    riskLevel: assessRisk(predictedDays, goal.targetDate)
  };
}
```

### 3. 学习效率曲线算法

```typescript
function calculateEfficiencyCurve(sessions: LearningSession[]): EfficiencyPoint[] {
  // 按学习时长分组（5分钟、10分钟、15分钟...）
  const durationGroups = groupByDuration(sessions, [5, 10, 15, 20, 30, 45, 60]);
  
  // 计算每个时长段的平均准确率
  return durationGroups.map(group => ({
    duration: group.duration,
    accuracy: averageAccuracy(group.sessions),
    count: group.sessions.length
  }));
}
```

## 技术选型

### 图表库

使用 **Recharts** - React专用图表库：
- 支持多种图表类型（折线图、柱状图、饼图、雷达图、热力图）
- 响应式设计
- 动画效果
- 易于定制

### 定时任务

使用 **node-cron** 处理提醒定时任务：
```typescript
import cron from 'node-cron';

// 每小时检查提醒
cron.schedule('0 * * * *', () => {
  checkAndSendReminders();
});
```

## 安全考虑

1. **数据隐私**：分析数据仅用户本人可访问
2. **提醒频率限制**：每日最多3次提醒，避免打扰
3. **数据聚合**：敏感数据聚合展示，不暴露细节

## 性能考虑

1. **缓存策略**：分析结果缓存1小时
2. **增量计算**：新数据增量更新分析结果，不重新计算全部
3. **异步处理**：复杂分析任务异步执行