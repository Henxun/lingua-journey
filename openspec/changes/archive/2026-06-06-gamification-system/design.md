## Context

游戏化系统旨在提升用户学习动力和参与度。当前平台缺乏激励机制，用户完成课程后没有持续学习的动力。需要通过每日任务、成就系统、排行榜等功能，将学习过程游戏化。

## Goals / Non-Goals

**Goals:**
- 建立每日签到和连续签到奖励机制
- 设计可扩展的成就系统，支持多种成就类型
- 实现用户积分/XP成长体系
- 提供周/月排行榜功能
- 创建等级系统，用户可查看当前等级和进度

**Non-Goals:**
- 不实现复杂的社交功能（如好友系统、私信）
- 不实现付费虚拟物品或内购系统
- 不实现PVP对战或竞争机制

## Decisions

### 1. 数据模型设计

**方案选择：** 独立表 + User表扩展

```
User (扩展字段)
├── xp: number (总经验值)
├── level: number (当前等级)
├── streak_days: number (连续签到天数)
├── last_check_in: Date (上次签到时间)

Achievement (成就表)
├── id, name, description, icon
├── condition_type (完成课程数/练习次数/学习时长等)
├── condition_value (阈值)
├── xp_reward (奖励XP)

UserAchievement (用户成就表)
├── user_id, achievement_id, unlocked_at

DailyQuest (每日任务表)
├── id, name, description, type
├── target_value, xp_reward

UserQuestProgress (用户任务进度)
├── user_id, quest_id, date, progress, completed
```

**替代方案考虑：**
- NoSQL/文档存储：灵活性高但不利于关系查询
- 单一JSON字段存储：简单但不利于统计查询

### 2. XP与等级计算

采用指数增长曲线：
- 等级公式: `level = floor(sqrt(totalXp / 100))`
- 各级所需XP可通过公式计算
- 每级解锁不同称号和特权

### 3. 排行榜实现

**方案选择：** 数据库聚合查询 + 缓存

- 周榜：每周一重置，按周XP排序
- 月榜：每月1日重置，按月XP排序
- 使用内存缓存（如Redis）存储排名，避免频繁DB查询
- 备选：SQLite使用物化视图或定时任务更新

### 4. 每日任务刷新

- 每日00:00 UTC检查并重置任务进度
- 使用用户上次登录时间判断是否需要补签
- 连续签到中断则 streak_days 归零

## Risks / Trade-offs

| 风险 | 缓解措施 |
|------|----------|
| 用户刷榜/作弊 | 后端验证行为合法性，设置操作频率限制 |
| 数据库压力 | 使用缓存层，排行榜查询限制频率 |
| 任务完成进度不同步 | 使用事务确保数据一致性 |
| 时区问题导致任务刷新异常 | 统一使用UTC时间，客户端转换显示 |
