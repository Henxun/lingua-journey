## Why

当前 Lingua Journey 虽然有 AI 对话练习和场景功能，但缺少结构化的学习路径。用户不知道从哪里开始学习，也无法系统性地提升语言能力。

## What Changes

**课程系统核心功能：**
- 创建课程实体，包含标题、描述、语言、难度、场景列表
- 创建课程章节/关卡，每个章节有明确的学习目标
- 追踪用户的课程学习进度
- 显示课程列表和详情页面
- 在完成章节/关卡后给予奖励和解锁新内容

**用户体验改进：**
- 首页增加课程推荐入口
- 个人资料页显示学习中的课程
- 课程详情页展示章节列表和进度

## Capabilities

### New Capabilities
- `course-management`: 课程管理功能，包括创建、查看课程列表和详情
- `lesson-system`: 课程章节/关卡系统，管理学习内容和进度
- `course-progress`: 课程进度追踪，记录用户学习状态和完成度

### Modified Capabilities

## Impact

**后端改动：**
- 新增 Course、Lesson、CourseProgress 实体
- 新增 courseService.ts：课程和章节的业务逻辑
- 新增 courseController.ts：课程相关 API 处理
- 新增 courseRoutes.ts：课程路由
- 更新 server.ts：注册课程路由

**前端改动：**
- 新增 /courses 页面：课程列表
- 新增 /courses/[id] 页面：课程详情
- 新增 /courses/[id]/lessons/[lessonId] 页面：章节学习
- 扩展 api.ts：新增课程相关 API 调用
- 更新首页和个人资料页：添加课程入口
