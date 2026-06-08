# 游戏化系统 - 任务清单

## 1. 后端数据模型

- [x] 1.1 扩展 User entity，添加 xp, level, streak_days, last_check_in 字段
- [x] 1.2 创建 Achievement entity (成就表)
- [x] 1.3 创建 UserAchievement entity (用户成就关联表)
- [x] 1.4 创建 DailyQuest entity (每日任务表)
- [x] 1.5 创建 UserQuestProgress entity (用户任务进度表)
- [x] 1.6 等级称号在服务层处理

## 2. 后端服务层

- [x] 2.1 创建 gamificationService
- [x] 2.2 实现 checkIn 方法（签到）
- [x] 2.3 实现 awardXp 方法（奖励XP）
- [x] 2.4 实现 calculateLevel 方法（计算等级）
- [x] 2.5 实现 checkAndUnlockAchievements 方法（检查成就解锁）
- [x] 2.6 实现 updateQuestProgress 方法（更新任务进度）
- [x] 2.7 实现 resetDailyQuests 方法（重置每日任务）
- [x] 2.8 实现 getLeaderboard 方法（获取排行榜）

## 3. 后端 API

- [x] 3.1 POST `/api/gamification/check-in` - 每日签到
- [x] 3.2 GET `/api/gamification/profile` - 获取用户游戏化信息
- [x] 3.3 GET `/api/gamification/achievements` - 获取成就列表
- [x] 3.4 GET `/api/gamification/daily-quests` - 获取每日任务
- [x] 3.5 GET `/api/gamification/leaderboard/weekly` - 周榜
- [x] 3.6 GET `/api/gamification/leaderboard/monthly` - 月榜
- [x] 3.7 集成到 server.ts

## 4. 前端 API

- [x] 4.1 在 api.ts 添加游戏化相关方法
- [x] 4.2 checkIn, getGamificationProfile
- [x] 4.3 getAchievements, getDailyQuests
- [x] 4.4 getWeeklyLeaderboard, getMonthlyLeaderboard

## 5. 前端页面

- [x] 5.1 创建 `/profile/gamification` 页面
- [x] 5.2 实现等级进度条组件
- [x] 5.3 实现签到按钮组件
- [x] 5.4 实现每日任务列表组件
- [x] 5.5 实现成就展示组件
- [x] 5.6 实现排行榜组件
- [x] 5.7 在个人中心添加游戏化入口

## 6. 集成

- [x] 6.1 在现有学习行为中集成XP奖励触发
- [x] 6.2 学习统计更新集成
- [x] 6.3 成就解锁通知集成

## 7. 构建验证

- [x] 7.1 后端构建通过
- [x] 7.2 前端构建通过
- [x] 7.3 功能验收测试
