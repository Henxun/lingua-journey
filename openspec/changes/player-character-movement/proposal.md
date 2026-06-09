## Why

当前 3D 餐厅场景中的 NPC 是静态的，用户只能通过点击选择角色进入语音对话。添加玩家可控制角色和接近触发机制可以创造更沉浸式的学习体验，让用户通过"走进"角色来自然地开始对话，提升交互的真实感和参与度。

## What Changes

- **新增玩家控制角色**
  - 可在 3D 场景中移动的人形角色
  - WASD 键盘移动 + 鼠标视角控制
  - 与 NPC 视觉风格一致，但通过服装颜色区分（休闲风格）
  
- **新增接近检测系统**
  - 实时计算玩家与各 NPC 的距离
  - 当玩家进入 1-1.5 米范围内时，显示"按空格键开始对话"提示
  
- **新增按键触发语音对话**
  - 靠近 NPC 后按空格键触发语音对话
  - 触发后自动进入现有的语音聊天流程

## Capabilities

### New Capabilities

- `player-character`: 玩家控制角色的行为规范
  - 移动控制（键盘 WASD）
  - 视角控制（鼠标）
  - 碰撞边界限制
  - 与 NPC 交互状态

- `proximity-trigger`: 接近触发机制
  - 距离计算逻辑
  - 可交互状态 UI 提示
  - 触发条件和回调

- `scene-voice-integration`: 场景与语音集成
  - 玩家位置与 NPC 关联
  - 动态选中最近 NPC
  - 无缝切换到语音对话模式

### Modified Capabilities

- 无（现有语音对话功能保持不变，仅调整触发方式）

## Impact

- **新增文件**: 
  - `frontend/src/components/scenes/PlayerCharacter.tsx` - 玩家角色组件
  - `frontend/src/hooks/usePlayerControls.ts` - 玩家控制 Hook
  - `frontend/src/hooks/useProximityDetection.ts` - 接近检测 Hook
  
- **修改文件**:
  - `frontend/src/pages/scenes/index.tsx` - 集成玩家角色和接近检测
  
- **依赖**:
  - `@react-three/drei` - PointerLockControls（鼠标锁定视角控制）
  - 现有语音对话系统（voiceChatStore, useVoiceChat）
