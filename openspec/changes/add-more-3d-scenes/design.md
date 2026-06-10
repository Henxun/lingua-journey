# 3D场景扩展设计文档

## 架构概览

```
┌─────────────────────────────────────────────────────────────┐
│                      场景系统架构                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────┐     ┌──────────────┐     ┌────────────┐ │
│  │ SceneSelector│────►│  Scene3D    │────►│  Learning  │ │
│  │  场景选择器   │     │   Canvas    │     │   Panel    │ │
│  └──────────────┘     └──────────────┘     └────────────┘ │
│         │                    │                    │       │
│         ▼                    ▼                    ▼       │
│  ┌──────────────┐     ┌──────────────┐     ┌────────────┐ │
│  │  SceneList   │     │ Environment  │     │Vocabulary  │ │
│  │  场景列表卡片 │     │   Components │     │   内容     │ │
│  └──────────────┘     └──────────────┘     └────────────┘ │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## 场景设计

### 1. 咖啡馆场景 (Cafe)

```
┌─────────────────────────────────────────┐
│           CAFE ENVIRONMENT               │
├─────────────────────────────────────────┤
│                                         │
│    [COUNTER]  ←────  [BARISTA]          │
│       │                                    │
│    [MENU]     [TABLE1]    [TABLE2]     │
│                          ↓               │
│    [PLANT]   ←──── [CUSTOMER]           │
│                                         │
│    [DOOR]  ←─────── [WINDOW]            │
│                                         │
└─────────────────────────────────────────┘
```

**角色配置**:
- `barista_1`: 咖啡师 - "点一杯咖啡"
- `customer_1`: 顾客 - "社交对话练习"
- `customer_2`: 顾客 - "结伴聊天"

**交互元素**:
- 菜单黑板 - 学习咖啡种类词汇
- 柜台 - 点单对话
- 餐桌 - 休闲聊天
- 咖啡杯 - 咖啡相关词汇

**学习内容**:
```typescript
const cafeContent = {
  vocabulary: ['Espresso', 'Latte', 'Cappuccino', 'Mocha', 'To-go cup', 'Stay in'],
  phrases: [
    'I would like a coffee, please.',
    'What do you recommend?',
    'Could I have that to go?',
    'How much is a latte?'
  ],
  dialogue: '...'
};
```

### 2. 机场场景 (Airport)

```
┌─────────────────────────────────────────┐
│          AIRPORT ENVIRONMENT             │
├─────────────────────────────────────────┤
│                                         │
│  [CHECK-IN] [SECURITY] [GATE] [SHOP]  │
│       │           │          │          │
│   [STAFF]    [OFFICER]  [PASSENGER]   │
│                                         │
│  [BOARDING]  ←─── [PLANE]              │
│                                         │
└─────────────────────────────────────────┘
```

**角色配置**:
- `staff_1`: 机场工作人员 - "值机服务"
- `officer_1`: 安检人员 - "安检对话"
- `passenger_1`: 旅客 - "问路对话"
- `passenger_2`: 旅客 - "登机对话"

**交互元素**:
- 值机柜台 - 登机手续
- 安检通道 - 安检对话
- 登机口 - 登机广播
- 电子屏 - 航班信息

**学习内容**:
```typescript
const airportContent = {
  vocabulary: ['Boarding pass', 'Passport', 'Gate', 'Luggage', 'Security', 'Customs'],
  phrases: [
    'Where is the gate?',
    'Can I bring this on the plane?',
    'My flight is delayed.',
    'I need to check in.'
  ]
};
```

### 3. 商店场景 (Store)

```
┌─────────────────────────────────────────┐
│           STORE ENVIRONMENT             │
├─────────────────────────────────────────┤
│                                         │
│  [COUNTER]  ←────  [SALES]             │
│       │                                    │
│  [RACK1]   [RACK2]    [SHOES]          │
│    ↓         ↓           ↓             │
│ [CLOTHES] [ACCESS]    [TRY-ON]          │
│                                         │
│    [CART]  ←───── [CHECKOUT]            │
│                                         │
└─────────────────────────────────────────┘
```

**角色配置**:
- `sales_1`: 店员 - "购物帮助"
- `sales_2`: 店员 - "结账服务"
- `customer_1`: 顾客 - "试穿对话"

**交互元素**:
- 衣架/货架 - 商品种类
- 试衣间 - 试穿对话
- 收银台 - 付款结账
- 收据 - 购物词汇

**学习内容**:
```typescript
const storeContent = {
  vocabulary: ['T-shirt', 'Jeans', 'Shoes', 'Size', 'Price', 'Discount', 'Receipt'],
  phrases: [
    'Do you have this in a different size?',
    'Can I try this on?',
    'Where is the fitting room?',
    'I would like to pay.',
    'Can I get a refund?'
  ]
};
```

## 组件架构

### 场景选择器页面

```tsx
interface SceneSelectorProps {
  onSelectScene: (sceneId: string) => void;
}

function SceneSelector({ onSelectScene }: SceneSelectorProps) {
  const scenes = [
    { id: 'restaurant', name: 'Restaurant', emoji: '🍽️' },
    { id: 'cafe', name: 'Cafe', emoji: '☕' },
    { id: 'airport', name: 'Airport', emoji: '✈️' },
    { id: 'store', name: 'Store', emoji: '🛍️' },
  ];
  
  return (
    <div className="scene-selector">
      {scenes.map(scene => (
        <SceneCard 
          key={scene.id}
          {...scene}
          onClick={() => onSelectScene(scene.id)}
        />
      ))}
    </div>
  );
}
```

### 可复用环境组件

```tsx
// 基础环境组件
function Floor() { /* 地板 */ }
function Walls() { /* 墙壁 */ }
function Ceiling() { /* 天花板 */ }
function Door() { /* 门 */ }
function Window() { /* 窗户 */ }
function Lighting() { /* 灯光 */ }

// 家具组件
function Table() { /* 桌子 */ }
function Chair() { /* 椅子 */ }
function Counter() { /* 柜台 */ }
function Shelf() { /* 货架 */ }

// 装饰组件
function Plant() { /* 植物 */ }
function Lamp() { /* 灯饰 */ }
function Picture() { /* 画作 */ }
```

### 路由配置

```
/scenes              → 场景选择页面
/scenes/restaurant    → 餐厅场景
/scenes/cafe          → 咖啡馆场景
/scenes/airport       → 机场场景
/scenes/store         → 商店场景
```

## 技术实现

### 1. 场景配置文件

```typescript
// scenes/config.ts
export const SCENE_CONFIG = {
  restaurant: {
    name: 'Restaurant',
    emoji: '🍽️',
    characters: [...],
    objects: [...],
    learningContent: {...}
  },
  cafe: {
    name: 'Cafe',
    emoji: '☕',
    characters: [...],
    objects: [...],
    learningContent: {...}
  },
  // ...
};
```

### 2. 动态场景加载

```tsx
function DynamicScene({ sceneId }: { sceneId: string }) {
  const SceneComponent = {
    restaurant: RestaurantEnvironment,
    cafe: CafeEnvironment,
    airport: AirportEnvironment,
    store: StoreEnvironment,
  }[sceneId];
  
  return SceneComponent ? <SceneComponent /> : null;
}
```

### 3. 统一学习面板

```tsx
function LearningPanel({ sceneId, objectId }) {
  const content = SCENE_CONFIG[sceneId]?.learningContent[objectId];
  return content ? <VocabularyPanel {...content} /> : null;
}
```

## 数据流

```
用户选择场景 → 加载场景配置 → 渲染3D环境 →
  ↓
点击对象 → 获取学习内容 → 显示学习面板
  ↓
点击角色 → 连接语音聊天 → 开始对话练习
  ↓
结束对话 → 评估发音 → 保存进度
```

## 复用策略

1. **基础环境组件**: Floor, Walls, Ceiling, Lighting 可直接复用
2. **交互系统**: 使用现有的 useVoiceChat hook
3. **玩家控制**: 使用现有的 usePlayerControls hook
4. **学习面板**: 统一使用 LearningPanel 组件
5. **角色系统**: 使用现有的 Character3D 组件