---
comet_change: player-character-movement
role: technical-design
canonical_spec: openspec
---

# Player Character Movement - Technical Design

## Overview

Add a player-controlled character to the 3D restaurant scene that allows users to walk around and trigger voice interactions with NPCs by proximity. The player uses WASD for movement and mouse for camera control (PointerLockControls). When within 1.5 meters of an NPC, pressing SPACE triggers voice chat.

## Architecture

### Component Structure

```
frontend/src/
├── components/scenes/
│   └── PlayerCharacter.tsx      # Player character component (reuses Character3D)
├── hooks/
│   ├── usePlayerControls.ts    # WASD state + movement calculation
│   └── useProximityDetection.ts # Distance calculation to NPCs
└── pages/scenes/
    └── index.tsx               # Integration point
```

### Data Flow

```
User Input (WASD) → usePlayerControls → playerPosition state
                                    ↓
                            Character3D (renders at position)
                                    ↓
                            useProximityDetection (calculates distances)
                                    ↓
                            UI shows prompt when isInRange
                                    ↓
User Input (SPACE) → voiceChatStore.startConversation(nearestNPCId)
```

## Key Implementation Details

### 1. PointerLockControls Integration

- Import from `@react-three/drei`
- Canvas click enables pointer lock
- ESC releases lock (browser default behavior)
- Track `isLocked` state for UI display

```tsx
<PointerLockControls
  onLock={() => setIsLocked(true)}
  onUnlock={() => setIsLocked(false)}
/>
```

### 2. Movement Calculation

Movement is relative to camera direction using Three.js Vector3:

```tsx
useFrame((state, delta) => {
  if (!isLocked || isChatting) return;
  
  const moveSpeed = 5; // units per second
  const direction = new Vector3();
  
  if (keys.w) direction.z -= 1;
  if (keys.s) direction.z += 1;
  if (keys.a) direction.x -= 1;
  if (keys.d) direction.x += 1;
  
  direction.normalize();
  direction.applyQuaternion(camera.quaternion);
  direction.y = 0; // Keep on ground plane
  
  const velocity = direction.multiplyScalar(moveSpeed * delta);
  const newPos = playerPosition.current.clone().add(velocity);
  
  // Clamp to scene bounds
  newPos.x = Math.max(-6, Math.min(9, newPos.x));
  newPos.z = Math.max(-6, Math.min(5, newPos.z));
  
  playerPosition.current.copy(newPos);
});
```

### 3. Proximity Detection

2D Euclidean distance calculation (ignoring Y):

```tsx
const calculateDistance = (p1: Vector3, p2: Vector3) => {
  const dx = p1.x - p2.x;
  const dz = p1.z - p2.z;
  return Math.sqrt(dx * dx + dz * dz);
};

const INTERACTION_DISTANCE = 1.5;

useFrame(() => {
  const distances = CHARACTERS.map(char => ({
    id: char.id,
    name: char.name,
    distance: calculateDistance(playerPosition.current, new Vector3(...char.position))
  }));
  
  const inRange = distances.filter(d => d.distance <= INTERACTION_DISTANCE);
  inRange.sort((a, b) => a.distance - b.distance);
  
  setNearestNPC(inRange[0] || null);
  setIsInRange(inRange.length > 0);
});
```

### 4. State Management

Shared state via React Context or Zustand:

```typescript
interface SceneState {
  isLocked: boolean;
  isChatting: boolean;
  playerPosition: Vector3;
  nearestNPC: { id: string; name: string; distance: number } | null;
  isInRange: boolean;
}
```

### 5. Player Character Rendering

First-person mode: player character is **not** rendered (we see through the player's eyes). Third-person mode: render Character3D at player position.

```tsx
// First-person: don't render player character
// Third-person: render at player position
{!isFirstPerson && (
  <Character3D
    name="You"
    avatarColor="#FFE4C4"
    clothingColor="#607D8B"
    position={playerPosition}
    role="player"
    // ...
  />
)}
```

## Scene Boundaries

Defined in usePlayerControls:

| Direction | Min | Max |
|-----------|-----|-----|
| X (West-East) | -6 | 9 |
| Z (South-North) | -6 | 5 |

## Testing Strategy

### Unit Tests
- `usePlayerControls`: movement direction calculation, boundary clamping
- `useProximityDetection`: distance calculation, nearest NPC selection

### Integration Tests
- Player moves toward NPC → proximity prompt appears
- Press SPACE when in range → voice chat starts
- Voice chat ends → player controls restored

### Manual Testing
1. Click canvas to enable pointer lock
2. Use WASD to move around
3. Approach NPC → prompt appears
4. Press SPACE → voice chat UI appears
5. End chat → return to movement

## Dependencies

- `@react-three/fiber` - React renderer for Three.js
- `@react-three/drei` - PointerLockControls, helpers
- `three` - 3D math (Vector3)
- `zustand` - State management (reuse existing voiceChatStore)

## Files to Create/Modify

### Create
- `frontend/src/components/scenes/PlayerCharacter.tsx`
- `frontend/src/hooks/usePlayerControls.ts`
- `frontend/src/hooks/useProximityDetection.ts`

### Modify
- `frontend/src/pages/scenes/index.tsx` - Add player controls, integrate components
