# 成就系统增强任务列表

## 后端任务

### 1. 修改 Achievement 实体
- [ ] 添加 `AchievementRarity` 枚举（common, rare, epic, legendary）
- [ ] 添加 `rarity` 字段到 Achievement 实体

### 2. 更新 gamificationService
- [ ] 添加 `getAchievementsWithProgress` 方法
- [ ] 添加 `generateShareContent` 方法
- [ ] 添加 `calculateAchievementProgress` 方法
- [ ] 添加 `getRarityColor` 方法
- [ ] 更新 `seedAchievements` 添加更多成就和徽章等级

### 3. 更新控制器和路由
- [ ] 添加成就分享 API 端点
- [ ] 更新成就列表 API 返回进度数据

### 4. 数据库迁移
- [ ] 运行数据库迁移以添加新字段

## 前端任务

### 5. 更新 API 类型定义
- [ ] 添加 `AchievementRarity` 类型
- [ ] 添加 `AchievementWithProgress` 类型
- [ ] 添加 `ShareContent` 类型

### 6. 更新成就页面组件
- [ ] 更新 `AchievementsList` 组件显示徽章等级
- [ ] 添加进度条显示
- [ ] 根据稀有度显示不同样式

### 7. 添加分享功能
- [ ] 创建 `ShareModal` 组件
- [ ] 添加分享按钮到成就卡片
- [ ] 实现复制分享文案功能

### 8. 添加成就解锁通知
- [ ] 创建 `AchievementNotification` 组件
- [ ] 监听成就解锁事件
- [ ] 添加动画效果

## 测试任务

### 9. 单元测试
- [ ] 测试成就进度计算
- [ ] 测试分享内容生成
- [ ] 测试徽章等级显示

### 10. 集成测试
- [ ] 测试成就解锁流程
- [ ] 测试分享功能
- [ ] 测试通知系统

## 验收标准

- [ ] 成就系统支持至少20个成就
- [ ] 支持4种徽章等级（普通、稀有、史诗、传说）
- [ ] 提供社交分享功能
- [ ] 显示成就解锁进度
- [ ] 实时通知用户成就解锁