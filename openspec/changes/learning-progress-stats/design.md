## Context

用户需要一个学习进度统计页面来追踪学习效果。当前系统：
- 有 AI 对话功能（Conversation entity）
- 有对话评分机制（score 字段）
- 没有练习记录追踪
- 没有学习时长统计

## Goals / Non-Goals

**Goals:**
- 统计总学习时长（基于会话时长计算）
- 统计练习次数（完成的对话数量）
- 统计正确率（基于评分）
- 追踪连续学习天数
- 数字卡片展示关键指标

**Non-Goals:**
- 不实现排行榜
- 不实现成就系统
- 不实现复杂的趋势图表
- 不修改现有对话评分机制

## Decisions

### 1. 数据存储：扩展 User entity 添加统计字段

**选择**：在 User entity 添加学习统计字段
**理由**：
- 统计查询简单直接（无需 JOIN）
- 数据量小（每次学习后更新）
- 适合当前 SQLite 数据库

**替代方案考虑**：
- 独立 LearningStats entity：适合多端同步，但增加复杂度
- 基于 Conversation 实时聚合：查询成本高

**新增字段**：
```typescript
learning_stats: {
  total_time_minutes: number;    // 总学习时长（分钟）
  practice_count: number;          // 练习次数
  total_score: number;            // 累计评分总和
  last_practice_date: string;     // 上次练习日期 (YYYY-MM-DD)
  streak_days: number;            // 连续学习天数
}
```

### 2. 数据来源：AI 对话数据

**数据来源**：Conversation entity
- `score`: 对话评分（1-10）
- `created_at`: 对话创建时间
- 时长：通过消息时间戳计算

**计算规则**：
- 练习次数：用户完成的对话数（score IS NOT NULL）
- 正确率：(total_score / practice_count / 10) * 100%
- 学习时长：按对话时长估算或使用默认值

### 3. 连续天数追踪

**逻辑**：
1. 每次练习后检查 last_practice_date
2. 如果是昨天：streak_days + 1
3. 如果是今天：不更新
4. 如果是昨天之前：streak_days 重置为 1
5. 每天 UTC 0 点重置检查

### 4. 前端展示

**页面路由**：`/profile/stats`
**组件**：数字卡片布局
- 总学习时长卡片
- 练习次数卡片
- 正确率卡片
- 连续天数卡片

**入口**：在 `/profile` 页面增加"学习统计"链接

## Risks / Trade-offs

| 风险 | 影响 | 缓解措施 |
|------|------|----------|
| 学习时长估算不准确 | 用户体验 | 使用消息时间戳计算实际时长 |
| UTC 时区导致日期边界问题 | 连续天数计算错误 | 使用 UTC 日期比较 |
| 统计更新丢失（更新失败） | 数据不一致 | 使用数据库事务 |

## Open Questions

1. 学习时长如何准确计算？目前按固定时长估算
2. 是否需要支持按时间段筛选（本周/本月）？
3. 练习记录是否需要独立 entity？
