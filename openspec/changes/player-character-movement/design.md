## Context

当前 3D 餐厅场景（`/scenes`）包含多个 NPC（服务员 James、顾客 Emma、顾客 Marcus），但用户只能通过点击选择角色。这种方式不够自然，缺少探索和移动的沉浸感。

**现有系统：**
- `Character3D` 组件：渲染 NPC 角色（人形，支持 idle/talking/listening/waving 动画）
- `voiceChatStore`：管理语音对话状态
- `useVoiceChat` hook：处理 WebSocket 通信、录音、TTS/STT
- 场景通过 `OrbitControls` 控制相机，用户无法"进入"场景

**目标：** 添加玩家可控制角色，让用户通过 WASD 移动走进 NPC 来触发语音对话。

## Goals / Non-Goals

**Goals:**
- 玩家可以在 3D 场景中自由移动
- WASD 键盘控制前后左右移动
- 鼠标控制视角方向
- 当玩家靠近 NPC（1-1.5 米内）时显示交互提示
- 按空格键触发与最近 NPC 的语音对话
- 保持与现有语音对话系统的兼容性

**Non-Goals:**
- 不是完整的游戏引擎（不考虑战斗、物品系统等）
- 不支持多人联机
- 不改变现有 NPC 的外观或对话内容
- 不支持移动端触摸控制（仅桌面端）

## Decisions

### Decision 1: 使用 PointerLockControls 实现视角控制

**选项：**
- A. PointerLockControls（drei 提供）：点击画布后锁定鼠标，移动鼠标旋转视角
- B. 自定义鼠标拖拽：按住鼠标拖动旋转视角
- C. OrbitControls + 角色跟随：保持现有的轨道相机但让角色跟随移动

**选择：** A. PointerLockControls

**理由：** PointerLockControls 提供最自然的 FPS 游戏体验，用户点击后可以"置身"于场景中。选项 B 体验较差（需要一直按住鼠标），选项 C 缺少沉浸感（相机和角色分离）。

**实现方式：**
```tsx
// 点击 Canvas 启用锁定
<PointerLockControls onLock={() => setIsLocked(true)} />

// WASD 移动应用到角色位置
useFrame((state) => {
  if (isLocked) {
    const direction = new Vector3();
    // 根据 WASD 键状态计算移动方向
    // 移动玩家角色位置
  }
});
```

### Decision 2: 玩家角色复用 Character3D 组件

**选项：**
- A. 复用 Character3D 组件，仅修改参数
- B. 创建新的 PlayerCharacter 组件

**选择：** A. 复用

**理由：** Character3D 已经实现了完整的人形模型（头、身体、手臂、腿）、动画系统和悬停/选中状态。玩家角色只是多了一个"是玩家控制的"标记。

**实现：**
```tsx
<Character3D
  name="You"
  avatarColor="#FFE4C4"  // 浅肤色
  clothingColor="#607D8B"  // 蓝色休闲衬衫
  position={playerPosition}
  animationState={isMoving ? 'idle' : 'idle'}  // 简化动画
  isSelected={false}
  onClick={() => {}}  // 玩家不通过点击触发
  role="customer_m"  // 或新角色类型 'player'
/>
```

### Decision 3: 接近检测使用欧几里得距离

**选项：**
- A. 简单的 2D 平面距离（忽略高度差）
- B. 3D 欧几里得距离（考虑 x, y, z）

**选择：** A. 2D 平面距离

**理由：** 餐厅场景中所有角色都在同一地面平面（y=0），3D 距离和 2D 距离差异很小。简化计算也减少性能开销。

**触发距离：** 1.5 米（约等于 R3F 场景中的 1.5 单位）

### Decision 4: 空格键触发交互

**选项：**
- A. 空格键：通用、不会误触
- B. E 键：游戏常用交互键
- C. 点击按钮：更直观但需要看屏幕

**选择：** A. 空格键

**理由：** 空格键位置方便，不需要移动手指。E 键也是好选择，但空格键更通用。

**UI 提示：** 当玩家进入触发距离时，显示浮动提示：
```
┌─────────────────────────────┐
│   按 [空格] 与 James 交谈   │
└─────────────────────────────┘
```

### Decision 5: 禁用 OrbitControls，启用 PointerLockControls

**理由：** OrbitControls 让相机围绕场景旋转，但玩家角色在原地。PointerLockControls 让玩家"成为"相机，实现真正的第一人称移动。

**权衡：**
- 用户无法同时移动角色和旋转视角（FPS 模式标准行为）
- 需要提示用户如何退出锁定（按 ESC）

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| PointerLockControls 需要用户点击授权 | 添加说明提示用户需要点击画布 |
| 移动时相机抖动 | 使用 `lerp` 平滑插值，避免突变 |
| 玩家可能走出场景边界 | 设置边界限制，阻止玩家离开餐厅 |
| 玩家可能走到桌子/椅子里面 | 添加简单的碰撞检测或放置不可通过的物体 |
| ESC 退出后无法重新进入 | 提供"重新进入场景"按钮 |

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Scenes Page                            │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │PlayerCharacter│  │ NPC Characters │  │ Environment        │ │
│  │ - position   │  │ - James       │  │ - Restaurant        │ │
│  │ - controls   │  │ - Emma        │  │ - Tables           │ │
│  └──────┬───────┘  └──────┬───────┘  └─────────────────────┘ │
│         │                 │                                  │
│         └────────┬────────┘                                  │
│                  ▼                                          │
│         ┌────────────────┐                                  │
│         │ Proximity System │                                 │
│         │ - distance calc  │                                 │
│         │ - nearest NPC    │                                 │
│         └────────┬────────┘                                  │
│                  ▼                                          │
│         ┌────────────────┐                                  │
│         │ VoiceChatStore  │◄── useVoiceChat hook            │
│         │ - selectedNPC   │                                  │
│         │ - conversation  │                                  │
│         └────────────────┘                                  │
└─────────────────────────────────────────────────────────────┘
```

## Open Questions

1. **相机高度**：第一人称视角的相机应该放在角色头部高度（约 1.6 米）还是眼睛高度（约 1.7 米）？
2. **移动速度**：默认移动速度应该多快？是否需要加速跑？
3. **碰撞检测**：是否需要检测玩家与桌椅的碰撞？
4. **退出机制**：除了 ESC，是否还需要其他退出方式？
