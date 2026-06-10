# 成就系统增强设计文档

## 架构概览

```
┌─────────────────────────────────────────────────────────────────┐
│                      成就系统增强架构                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────┐     ┌──────────────┐     ┌──────────────┐    │
│  │   前端展示层  │     │    API层      │     │   服务层      │    │
│  │   Achievement │◄───│  gamification │───►│gamification  │    │
│  │   BadgeDisplay│     │    Routes    │     │  Service     │    │
│  │   ShareModal  │     │              │     │              │    │
│  └──────────────┘     └──────────────┘     └──────────────┘    │
│         │                    │                    │            │
│         ▼                    ▼                    ▼            │
│  ┌──────────────┐     ┌──────────────┐     ┌──────────────┐    │
│  │   进度显示    │     │    Controller│     │    进度计算   │    │
│  │   通知系统    │     │              │     │    分享生成   │    │
│  └──────────────┘     └──────────────┘     └──────────────┘    │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                        数据层                                   │
│  ┌──────────────┐     ┌──────────────┐     ┌──────────────┐    │
│  │ Achievement  │     │UserAchievement│    │   User       │    │
│  │ (等级字段)   │     │              │     │(stats/xp)    │    │
│  └──────────────┘     └──────────────┘     └──────────────┘    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## 数据模型设计

### 1. Achievement 实体扩展

| 字段名 | 类型 | 说明 |
|--------|------|------|
| id | UUID | 主键 |
| name | string | 成就名称 |
| description | string | 成就描述 |
| icon | string | 成就图标（emoji） |
| category | AchievementCategory | 成就类别 |
| **rarity** | **AchievementRarity** | **新增：徽章等级** |
| condition_type | string | 条件类型 |
| condition_value | number | 条件值 |
| xp_reward | number | XP奖励 |

### 2. AchievementRarity 枚举

| 值 | 名称 | 颜色 | 图标边框 |
|----|------|------|----------|
| common | 普通 | 灰色 | 普通边框 |
| rare | 稀有 | 蓝色 | 发光边框 |
| epic | 史诗 | 紫色 | 闪烁边框 |
| legendary | 传说 | 金色 | 动态边框 |

### 3. 新增条件类型

| 条件类型 | 说明 | 示例 |
|----------|------|------|
| conversation_count | 对话练习次数 | 完成10次对话 |
| assessment_passed | 通过评估次数 | 通过5次评估 |
| vocabulary_mastered | 掌握词汇数 | 掌握100个词汇 |
| scene_explored | 探索场景数 | 探索5个场景 |
| ai_teacher_interaction | AI教师交互次数 | 与AI教师对话50次 |
| perfect_streak | 完美连续签到 | 连续签到365天 |

## API 设计

### 1. 获取成就列表（含进度）

**GET** `/api/gamification/achievements`

**响应**:
```json
{
  "achievements": [
    {
      "id": "uuid",
      "name": "对话达人",
      "description": "完成100次对话练习",
      "icon": "💬",
      "category": "practice",
      "rarity": "rare",
      "xp_reward": 200,
      "unlocked": true,
      "unlocked_at": "2024-01-15T10:30:00Z",
      "progress": 100,
      "current_value": 120,
      "target_value": 100
    }
  ],
  "summary": {
    "total": 20,
    "unlocked": 8,
    "by_rarity": {
      "common": 4,
      "rare": 3,
      "epic": 1,
      "legendary": 0
    }
  }
}
```

### 2. 获取成就分享信息

**GET** `/api/gamification/achievements/{id}/share`

**响应**:
```json
{
  "title": "🎉 解锁成就！",
  "message": "我在 Lingua Journey 解锁了「对话达人」成就！快来挑战我吧！",
  "icon": "💬",
  "rarity": "rare",
  "user_stats": {
    "level": 15,
    "xp": 3200,
    "achievements_unlocked": 8
  }
}
```

### 3. 检查并解锁成就（内部调用）

**POST** `/api/gamification/achievements/check`

**请求**:
```json
{
  "condition_type": "conversation_count",
  "current_value": 100
}
```

**响应**:
```json
{
  "unlocked": ["对话达人"],
  "already_unlocked": [],
  "xp_earned": 200
}
```

## 服务层设计

### 新增方法

| 方法名 | 参数 | 返回值 | 说明 |
|--------|------|--------|------|
| getAchievementsWithProgress | userId: string | AchievementWithProgress[] | 获取成就列表及进度 |
| generateShareContent | userId: string, achievementId: string | ShareContent | 生成分享内容 |
| calculateAchievementProgress | userId: string, achievement: Achievement | number | 计算单个成就进度 |
| getRarityColor | rarity: AchievementRarity | string | 获取徽章颜色 |

## 前端组件设计

### 1. AchievementCard 组件

- 显示成就图标、名称、描述
- 根据稀有度显示不同样式
- 显示解锁状态和进度条
- 点击可查看详情和分享

### 2. AchievementProgressBar 组件

- 显示进度百分比
- 动画效果
- 显示当前值/目标值

### 3. ShareModal 组件

- 显示成就卡片预览
- 提供分享文案
- 支持复制链接/文案

### 4. AchievementNotification 组件

- 成就解锁时弹出通知
- 显示成就信息和奖励
- 动画效果

## 数据流

```
用户完成动作 → 触发条件检查 → 检查成就条件 → 
  ├─ 条件满足 → 创建UserAchievement → 发放XP → 发送通知
  └─ 条件未满足 → 更新进度显示

用户查看成就页面 → 请求成就列表 → 返回成就+进度数据 → 渲染成就卡片

用户点击分享 → 请求分享内容 → 返回分享文案 → 显示分享弹窗
```

## 安全考虑

1. **权限控制**：所有成就相关API需要用户认证
2. **防止作弊**：成就解锁由服务端验证，客户端仅展示
3. **数据一致性**：使用数据库事务确保成就解锁和XP发放的原子性

## 性能考虑

1. **缓存策略**：成就列表可缓存，用户成就状态实时查询
2. **批量查询**：一次查询获取所有成就及用户状态，减少请求次数
3. **异步通知**：成就解锁通知采用WebSocket推送，不阻塞主流程