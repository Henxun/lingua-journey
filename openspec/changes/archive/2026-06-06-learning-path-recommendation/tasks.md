# 学习路径推荐 - 任务清单

## 1. 后端数据模型

- [x] 1.1 创建 LearningGoal entity (学习目标表)
- [x] 1.2 创建 LearningPath entity (学习路径表)
- [x] 1.3 创建 RecommendedCourse entity (推荐课程表)
- [x] 1.4 扩展 Course entity 添加推荐权重字段
- [x] 1.5 更新 database.ts 注册新实体

## 2. 后端服务层

- [x] 2.1 创建 learningGoalService
- [x] 2.2 实现 createGoal 方法
- [x] 2.3 实现 getUserGoals 方法
- [x] 2.4 实现 updateGoalProgress 方法
- [x] 2.5 创建 learningPathService
- [x] 2.6 实现 generatePath 方法（生成学习路径）
- [x] 2.7 实现 getUserPath 方法
- [x] 2.8 实现 updatePathProgress 方法
- [x] 2.9 创建 recommendationService
- [x] 2.10 实现 getRecommendations 方法（推荐算法）
- [x] 2.11 实现 getNextCourse 方法（获取下一课程）

## 3. 后端 API

- [x] 3.1 POST `/api/learning/goals` - 创建学习目标
- [x] 3.2 GET `/api/learning/goals` - 获取用户目标列表
- [x] 3.3 PUT `/api/learning/goals/:id` - 更新目标
- [x] 3.4 DELETE `/api/learning/goals/:id` - 删除目标
- [x] 3.5 GET `/api/learning/path` - 获取用户学习路径
- [x] 3.6 POST `/api/learning/path/generate` - 生成学习路径
- [x] 3.7 PUT `/api/learning/path/progress` - 更新路径进度
- [x] 3.8 GET `/api/learning/recommendations` - 获取课程推荐
- [x] 3.9 集成到 server.ts

## 4. 前端 API

- [x] 4.1 在 api.ts 添加学习路径相关方法
- [x] 4.2 createGoal, getGoals, updateGoal
- [x] 4.3 getLearningPath, generatePath, updatePathProgress
- [x] 4.4 getRecommendations

## 5. 前端页面

- [x] 5.1 创建 `/profile/learning-path` 页面
- [x] 5.2 实现学习目标设置组件
- [x] 5.3 实现学习路径可视化组件
- [x] 5.4 实现推荐课程展示组件
- [x] 5.5 在个人中心添加入口

## 6. 集成

- [x] 6.1 与成就系统集成（完成路径解锁成就）
- [x] 6.2 与游戏化系统集成（路径完成奖励XP）

## 7. 构建验证

- [x] 7.1 后端构建通过
- [x] 7.2 前端构建通过
- [x] 7.3 功能验收测试
