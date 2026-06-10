# Comet Design Handoff

- Change: player-character-movement
- Phase: design
- Mode: compact
- Context hash: fede0326eb61c84aecf43dd63d58ced9744418754574bf91267ae7f7210a35bd

Generated-by: comet-handoff.sh

OpenSpec remains the canonical capability spec. This handoff is a deterministic, source-traceable context pack, not an agent-authored summary.

## openspec/changes/player-character-movement/proposal.md

- Source: openspec/changes/player-character-movement/proposal.md
- Lines: 1-56
- SHA256: 08ae7c84304a604f91435be4188e6edbb68b41a24df896be5da0cb893a8a9f7c

```md
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
```

## openspec/changes/player-character-movement/design.md

- Source: openspec/changes/player-character-movement/design.md
- Lines: 1-162
- SHA256: 4b650abe0666bf59a427acbbff5cb634d43d78188adb30896fe628561247d491

[TRUNCATED]

```md
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

```

Full source: openspec/changes/player-character-movement/design.md

## openspec/changes/player-character-movement/tasks.md

- Source: openspec/changes/player-character-movement/tasks.md
- Lines: 1-60
- SHA256: 00a2575cd95a984ec0e667a45c2f0d2a433998f72d3c7e17515019a89bb9225b

```md
## 1. Create Player Controls Hook

- [ ] 1.1 Create `usePlayerControls.ts` hook with WASD state tracking
- [ ] 1.2 Implement movement vector calculation based on camera direction
- [ ] 1.3 Add boundary clamping to prevent leaving scene
- [ ] 1.4 Export `isMoving`, `playerPosition`, `cameraDirection` state

## 2. Create Player Character Component

- [ ] 2.1 Create `PlayerCharacter.tsx` component reusing Character3D
- [ ] 2.2 Add player-specific clothing color (#607D8B)
- [ ] 2.3 Connect to usePlayerControls for position updates
- [ ] 2.4 Add simple walking/idle animation state

## 3. Integrate PointerLockControls

- [ ] 3.1 Add PointerLockControls import from @react-three/drei
- [ ] 3.2 Implement click-to-lock on Canvas
- [ ] 3.3 Add onLock and onUnlock callbacks
- [ ] 3.4 Create control instructions overlay UI
- [ ] 3.5 Handle ESC key to unlock and show "Click to resume"

## 4. Implement Proximity Detection

- [ ] 4.1 Create `useProximityDetection.ts` hook
- [ ] 4.2 Calculate 2D distance to all NPCs each frame
- [ ] 4.3 Track `nearestNPC` and `isInRange` state
- [ ] 4.4 Expose `nearestNPCId`, `nearestNPCName`, `distance` values

## 5. Create Interaction UI

- [ ] 5.1 Add interaction prompt component ("Press SPACE to talk to {name}")
- [ ] 5.2 Show prompt only when `isInRange` is true
- [ ] 5.3 Style prompt with floating card design
- [ ] 5.4 Add visual highlight effect to nearest NPC

## 6. Implement Space Key Trigger

- [ ] 6.1 Add keyboard event listener for SPACE key
- [ ] 6.2 Check if `isInRange` before triggering
- [ ] 6.3 Call `useVoiceChat.startConversation(nearestNPCId)`
- [ ] 6.4 Disable player controls when voice chat starts

## 7. Scene Integration

- [ ] 7.1 Add PlayerCharacter to Scene3D component
- [ ] 7.2 Integrate PointerLockControls
- [ ] 7.3 Pass player position to proximity detection
- [ ] 7.4 Connect space key trigger to voice chat
- [ ] 7.5 Add "Click to start" overlay for initial state

## 8. Testing and Polish

- [ ] 8.1 Test WASD movement in all directions
- [ ] 8.2 Test boundary clamping
- [ ] 8.3 Test proximity detection at various distances
- [ ] 8.4 Test space key trigger only when in range
- [ ] 8.5 Test voice chat integration end-to-end
- [ ] 8.6 Test ESC and re-lock flow
- [ ] 8.7 Verify player position preserved after voice chat
```

## openspec/changes/player-character-movement/specs/player-character/spec.md

- Source: openspec/changes/player-character-movement/specs/player-character/spec.md
- Lines: 1-88
- SHA256: e3194737a846c1bd4aebf58a3575bb0f71afdebe17d4443368f075aff5164287

[TRUNCATED]

```md
# Player Character Specification

## ADDED Requirements

### Requirement: Player character exists in scene
The system SHALL render a player-controlled humanoid character in the 3D restaurant scene that visually resembles the existing NPC characters.

#### Scenario: Player character renders
- **WHEN** user navigates to the /scenes page
- **THEN** a player character shall appear at the starting position (0, 0, 4)

#### Scenario: Player character visually distinct
- **WHEN** user observes the player character
- **THEN** the player character SHALL have a different clothing color (#607D8B - blue casual shirt) than the NPCs to distinguish it

### Requirement: WASD keyboard movement
The system SHALL allow the player to move using WASD keys when PointerLockControls is active.

#### Scenario: W key moves forward
- **WHEN** PointerLockControls is active and user presses W
- **THEN** the player character SHALL move in the direction the camera is facing
- **AND** the movement speed SHALL be 5 units per second

#### Scenario: S key moves backward
- **WHEN** PointerLockControls is active and user presses S
- **THEN** the player character SHALL move opposite to the camera direction

#### Scenario: A key moves left
- **WHEN** PointerLockControls is active and user presses A
- **THEN** the player character SHALL move to the left relative to camera direction

#### Scenario: D key moves right
- **WHEN** PointerLockControls is active and user presses D
- **THEN** the player character SHALL move to the right relative to camera direction

#### Scenario: Diagonal movement
- **WHEN** user presses two movement keys simultaneously (e.g., W + A)
- **THEN** the player character SHALL move diagonally
- **AND** the diagonal speed SHALL be normalized to prevent faster diagonal movement

### Requirement: Mouse look controls view direction
The system SHALL use PointerLockControls to allow mouse movement to control the camera/view direction.

#### Scenario: Mouse horizontal movement rotates view
- **WHEN** PointerLockControls is active and user moves mouse horizontally
- **THEN** the camera SHALL rotate horizontally following mouse movement

#### Scenario: Mouse vertical movement rotates view
- **WHEN** PointerLockControls is active and user moves mouse vertically
- **THEN** the camera SHALL rotate vertically following mouse movement
- **AND** vertical rotation SHALL be clamped to prevent camera flipping

#### Scenario: ESC exits pointer lock
- **WHEN** user presses ESC key
- **THEN** PointerLockControls SHALL release mouse lock
- **AND** the control hint SHALL change to "Click to resume"

### Requirement: Player character stays within scene bounds
The system SHALL prevent the player character from leaving the restaurant boundaries.

#### Scenario: Player blocked at north wall
- **WHEN** player position would exceed Z > 5
- **THEN** player position SHALL be clamped to Z = 5

#### Scenario: Player blocked at south wall
- **WHEN** player position would exceed Z < -6
- **THEN** player position SHALL be clamped to Z = -6

#### Scenario: Player blocked at east wall
- **WHEN** player position would exceed X > 9
- **THEN** player position SHALL be clamped to X = 9

#### Scenario: Player blocked at west wall
- **WHEN** player position would exceed X < -6
- **THEN** player position SHALL be clamped to X = -6

### Requirement: Control instructions displayed
The system SHALL display control instructions when PointerLockControls is not active.

#### Scenario: Initial state shows enter instructions
```

Full source: openspec/changes/player-character-movement/specs/player-character/spec.md

## openspec/changes/player-character-movement/specs/proximity-trigger/spec.md

- Source: openspec/changes/player-character-movement/specs/proximity-trigger/spec.md
- Lines: 1-75
- SHA256: 6c71a6c273a45b1fbae6694480add5265b9d99dc12228b4a0ebddc9dacd169a2

```md
# Proximity Trigger Specification

## ADDED Requirements

### Requirement: Distance calculation to NPCs
The system SHALL calculate the 2D Euclidean distance between the player position and each NPC position in the scene.

#### Scenario: Distance calculated correctly
- **WHEN** player is at position (0, 0, 0) and NPC is at (3, 0, 4)
- **THEN** the calculated distance SHALL be 5 units (sqrt(9 + 16))

#### Scenario: Y-axis ignored in calculation
- **WHEN** player is at (0, 0, 0) and NPC is at (3, 0, 4)
- **AND** the NPC head is at y=1.6
- **THEN** the distance SHALL still be calculated using only X and Z coordinates

### Requirement: Proximity detection threshold
The system SHALL consider an NPC "in range" when the distance to the player is less than or equal to 1.5 units.

#### Scenario: NPC in range
- **WHEN** player is 1.4 units from an NPC
- **THEN** that NPC SHALL be marked as "in range"

#### Scenario: NPC out of range
- **WHEN** player is 1.6 units from an NPC
- **THEN** that NPC SHALL NOT be marked as "in range"

#### Scenario: Multiple NPCs in range
- **WHEN** player is within 1.5 units of multiple NPCs simultaneously
- **THEN** all in-range NPCs SHALL be identified

### Requirement: Nearest NPC identification
The system SHALL identify the nearest NPC when one or more NPCs are in range.

#### Scenario: Single nearest NPC
- **WHEN** player is 1.0 unit from NPC-A and 1.4 units from NPC-B
- **THEN** NPC-A SHALL be identified as the nearest NPC

#### Scenario: Equal distance selects first
- **WHEN** player is exactly 1.5 units from NPC-A and exactly 1.5 units from NPC-B
- **THEN** the NPC with the lower array index SHALL be selected as nearest

### Requirement: Proximity UI indicator
The system SHALL display an interaction prompt when the player is in range of at least one NPC.

#### Scenario: Prompt appears when in range
- **WHEN** player enters within 1.5 units of any NPC
- **THEN** a prompt SHALL appear on screen
- **AND** the prompt SHALL show the NPC's name: "Press [SPACE] to talk to {NPC_name}"

#### Scenario: Prompt updates to nearest NPC
- **WHEN** player is in range of multiple NPCs
- **AND** then moves closer to a different NPC
- **THEN** the prompt SHALL update to show the new nearest NPC's name

#### Scenario: Prompt disappears when leaving range
- **WHEN** player moves beyond 1.5 units of all NPCs
- **THEN** the interaction prompt SHALL disappear

### Requirement: Visual indicator on nearest NPC
The system SHALL highlight the nearest NPC when they are in range.

#### Scenario: Highlight appears
- **WHEN** player enters within 1.5 units of NPC
- **THEN** the NPC SHALL display a subtle glow effect

#### Scenario: Highlight changes with nearest
- **WHEN** player is in range of NPC-A and NPC-B
- **AND** NPC-A is nearest
- **THEN** only NPC-A SHALL have the highlight effect
- **AND** when player moves closer to NPC-B, NPC-B SHALL become highlighted

#### Scenario: No highlight when out of range
- **WHEN** player is more than 1.5 units from all NPCs
- **THEN** no NPC SHALL display a highlight effect
```

## openspec/changes/player-character-movement/specs/scene-voice-integration/spec.md

- Source: openspec/changes/player-character-movement/specs/scene-voice-integration/spec.md
- Lines: 1-85
- SHA256: 3323ace4058e7157d78e027a954375b2d514ba31d734aefacace0f77bc55ea80

[TRUNCATED]

```md
# Scene Voice Integration Specification

## ADDED Requirements

### Requirement: Space key triggers voice chat
The system SHALL initiate voice chat with the nearest NPC when the player is in range and presses the SPACE key.

#### Scenario: Space key initiates chat
- **WHEN** player is within 1.5 units of an NPC
- **AND** player presses SPACE
- **THEN** voice chat SHALL begin with that NPC
- **AND** the existing voice chat UI SHALL appear

#### Scenario: Space key ignored when out of range
- **WHEN** player is more than 1.5 units from all NPCs
- **AND** player presses SPACE
- **THEN** nothing SHALL happen
- **AND** no error SHALL be shown

#### Scenario: Space key triggers nearest NPC
- **WHEN** player is within 1.5 units of multiple NPCs
- **AND** player presses SPACE
- **THEN** voice chat SHALL begin with the nearest NPC

### Requirement: Voice chat pauses player controls
The system SHALL disable player movement controls while voice chat is active.

#### Scenario: Movement disabled during chat
- **WHEN** voice chat is active
- **THEN** WASD keys SHALL NOT move the player character
- **AND** mouse movement SHALL NOT rotate the camera

#### Scenario: Controls restored after chat ends
- **WHEN** voice chat ends (user clicks "End Chat" or conversation completes)
- **THEN** WASD controls SHALL be re-enabled
- **AND** PointerLockControls SHALL be re-enabled

### Requirement: Seamless transition to voice chat
The system SHALL use the existing voice chat infrastructure without modification.

#### Scenario: Voice chat uses existing hooks
- **WHEN** player presses SPACE near NPC
- **THEN** the system SHALL call the existing `useVoiceChat.startConversation(npcId)` function
- **AND** the existing voice chat store state SHALL be updated

#### Scenario: Existing UI displayed
- **WHEN** voice chat is active
- **THEN** the existing conversation panel SHALL be displayed
- **AND** TTS and STT SHALL function as before

#### Scenario: Evaluation triggered on chat end
- **WHEN** voice chat conversation ends
- **THEN** the existing pronunciation/grammar evaluation SHALL be triggered
- **AND** results SHALL be displayed as before

### Requirement: Player position not tracked during chat
The system SHALL maintain the player's last position during voice chat without updating it.

#### Scenario: Player stays in place
- **WHEN** voice chat is active
- **THEN** the player character SHALL remain at its last position
- **AND** no movement SHALL occur even if keys are pressed

#### Scenario: Player position restored
- **WHEN** voice chat ends
- **THEN** the player character SHALL still be at the same position
- **AND** player can continue exploring from that position

### Requirement: Camera state preserved
The system SHALL preserve the camera direction when entering and exiting voice chat.

#### Scenario: Camera direction preserved on entry
- **WHEN** player presses SPACE to start voice chat
- **THEN** the camera direction SHALL remain facing the NPC
- **AND** PointerLockControls SHALL be temporarily disabled

#### Scenario: Camera direction preserved on exit
- **WHEN** voice chat ends
- **AND** PointerLockControls is re-enabled
- **THEN** the camera SHALL still be facing the same direction as before the chat
```

Full source: openspec/changes/player-character-movement/specs/scene-voice-integration/spec.md

