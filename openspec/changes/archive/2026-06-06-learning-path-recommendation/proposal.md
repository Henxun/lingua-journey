## Why

用户缺乏明确的学习方向和计划，当前系统没有根据用户的学习目标、水平和进度提供个性化的课程推荐和学习路径。学习路径推荐系统可以帮助用户更高效地学习，达到既定目标。

## What Changes

- 新增学习目标设置功能（短期/中期/长期目标）
- 新增个性化学习路径生成算法
- 新增课程推荐引擎（基于用户偏好和历史学习数据）
- 新增学习进度跟踪和路径调整
- 新增学习路径可视化展示
- 修改课程管理，支持学习路径关联

## Capabilities

### New Capabilities

- `learning-goals`: 学习目标管理，支持设置和追踪学习目标
- `learning-path`: 个性化学习路径生成和展示
- `course-recommendation`: 智能课程推荐算法

### Modified Capabilities

- `course-management`: 扩展支持学习路径关联和推荐权重

## Impact

- 后端：新增 learning-goal、learning-path、recommendation 实体和服务
- 前端：新增学习路径页面、目标设置组件、推荐课程展示
- 数据库：扩展 Course 表添加推荐权重字段
- 算法：基于用户学习历史和目标的新推荐算法
