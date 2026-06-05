## Context

当前 Lingua Journey 已有基础的实体结构（User、Conversation、Scene）、认证系统和学习进度统计。现在需要添加课程系统来提供结构化的学习路径。

**现有实体参考：**
- User: 用户实体
- Conversation: AI对话记录
- Scene: 3D学习场景
- SceneObject: 场景中的对象
- VerificationCode: 邮箱验证码
- learning_stats: User实体中的学习统计JSON字段

## Goals / Non-Goals

**Goals:**
- 提供结构化的课程和章节系统
- 追踪用户学习进度
- 与现有 AI 对话和场景功能集成
- 提供清晰的课程列表和详情页面

**Non-Goals:**
- 课程创作/管理后台（第一版仅提供预设课程）
- 用户自定义课程
- 社交功能或排行榜

## Decisions

### 1. 数据模型设计

**方案：**
- `Course`: 课程实体
  - id, name, description, language, difficulty, thumbnail_url, is_active
  - 与 Lesson 一对多关系
- `Lesson`: 章节/关卡实体
  - id, course_id, title, description, order, type（对话练习/场景练习）
  - 关联场景或对话模板
  - 与 Course 多对一关系
- `CourseProgress`: 用户课程进度
  - id, user_id, course_id, current_lesson_id, completed_lessons, started_at, completed_at
  - 与 User、Course 关系
  - completed_lessons: JSON 数组存储已完成章节 ID

**选择理由：** 清晰的层级结构，易于扩展，与现有数据模型风格一致。

### 2. API 设计

**方案：**
- `GET /api/courses`: 获取所有课程列表
- `GET /api/courses/:id`: 获取课程详情（包含章节）
- `GET /api/courses/my`: 获取用户学习中的课程
- `POST /api/courses/:id/enroll`: 用户报名课程
- `PUT /api/courses/:id/lessons/:lessonId/complete`: 完成章节
- `GET /api/courses/:id/progress`: 获取用户在课程中的进度

**选择理由：** RESTful 风格，与现有 API 风格一致。

### 3. 前端页面结构

**方案：**
- `/courses`: 课程列表页，按语言和难度筛选
- `/courses/[id]`: 课程详情页，显示章节列表和进度
- `/courses/[id]/lessons/[lessonId]`: 章节学习页，集成对话练习或场景

**选择理由：** 清晰的页面层次，良好的用户导航体验。

## Risks / Trade-offs

| 风险 | 影响 | 缓解措施 |
|------|------|----------|
| 初始课程内容需要手动创建 | 高 | 先创建几个示例课程，后续再扩展内容库 |
| 课程进度追踪的并发更新 | 中 | 使用数据库事务确保数据一致性 |
