---
change: player-character-movement
design-doc: docs/superpowers/specs/2026-06-09-player-character-movement-design.md
base-ref: f1600b5f30e147e6366009e1ea052cc291436e84
---

# Player Character Movement - Implementation Plan

## Overview

Implement player-controlled character movement in the 3D restaurant scene with proximity-based voice chat triggering.

## Task Breakdown

### Phase 1: Core Hooks

#### Task 1.1: Create `usePlayerControls.ts` Hook
- Track WASD key states using useRef for performance
- Calculate movement direction based on camera quaternion
- Apply movement speed (5 units/second) with delta time
- Clamp position to scene boundaries (X: -6 to 9, Z: -6 to 5)
- Export: `keys` ref, `playerPosition` ref, `isLocked` state

#### Task 1.2: Create `useProximityDetection.ts` Hook
- Accept `playerPosition` and `npcPositions` as inputs
- Calculate 2D Euclidean distance to each NPC
- Determine `nearestNPC` and `isInRange` state
- Interaction distance threshold: 1.5 units

### Phase 2: Components

#### Task 2.1: Create `PlayerCharacter.tsx` Component
- Reuse existing `Character3D` component
- Connect to `usePlayerControls` for position updates
- First-person mode: render nothing (camera is at player position)
- Props: `position`, `role`, `onClick`

#### Task 2.2: Create Interaction Prompt UI
- Position: center-bottom of screen
- Content: "Press [SPACE] to talk to {name}"
- Only visible when `isInRange === true`
- Animated entrance/exit

### Phase 3: Scene Integration

#### Task 3.1: Integrate PointerLockControls
- Add to Canvas in `scenes/index.tsx`
- Handle `onLock` and `onUnlock` callbacks
- Add overlay UI for control instructions

#### Task 3.2: Connect Space Key to Voice Chat
- Add keyboard event listener for SPACE
- When `isInRange === true`, call `useVoiceChat.startConversation(nearestNPC.id)`
- Disable player controls when voice chat starts

#### Task 3.3: Handle State Transitions
- `isLocked: false` → Show "Click to start" overlay
- `isLocked: true` → Hide overlay, enable movement
- `isChatting: true` → Disable movement, show voice chat UI
- `isChatting: false` → Restore movement (if locked)

## Implementation Order

1. **usePlayerControls.ts** - Foundation for movement
2. **useProximityDetection.ts** - Foundation for NPC detection
3. **PlayerCharacter.tsx** - Renders the player
4. **Scene integration** - PointerLockControls + space key
5. **UI prompts** - Interaction hints
6. **Testing** - Manual verification

## Files to Create

| File | Description |
|------|-------------|
| `frontend/src/hooks/usePlayerControls.ts` | WASD movement + position state |
| `frontend/src/hooks/useProximityDetection.ts` | NPC distance calculation |
| `frontend/src/components/scenes/PlayerCharacter.tsx` | Player character component |

## Files to Modify

| File | Changes |
|------|---------|
| `frontend/src/pages/scenes/index.tsx` | Add PointerLockControls, integrate hooks, add UI |

## Verification

- [ ] WASD moves player in correct direction
- [ ] Player stays within scene boundaries
- [ ] Proximity prompt appears when within 1.5m of NPC
- [ ] SPACE key starts voice chat when in range
- [ ] Voice chat disables player movement
- [ ] Exiting voice chat restores movement
