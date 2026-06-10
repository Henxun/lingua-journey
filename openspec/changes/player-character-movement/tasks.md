## 1. Create Player Controls Hook

- [x] 1.1 Create `usePlayerControls.ts` hook with WASD state tracking
- [x] 1.2 Implement movement vector calculation based on camera direction
- [x] 1.3 Add boundary clamping to prevent leaving scene
- [x] 1.4 Export `isMoving`, `playerPosition`, `cameraDirection` state

## 2. Create Player Character Component

- [x] 2.1 Create `PlayerCharacter.tsx` component reusing Character3D
- [x] 2.2 Add player-specific clothing color (#607D8B)
- [x] 2.3 Connect to usePlayerControls for position updates
- [x] 2.4 Add simple walking/idle animation state

## 3. Integrate PointerLockControls

- [x] 3.1 Add PointerLockControls import from @react-three/drei
- [x] 3.2 Implement click-to-lock on Canvas
- [x] 3.3 Add onLock and onUnlock callbacks
- [x] 3.4 Create control instructions overlay UI
- [x] 3.5 Handle ESC key to unlock and show "Click to resume"

## 4. Implement Proximity Detection

- [x] 4.1 Create `useProximityDetection.ts` hook
- [x] 4.2 Calculate 2D distance to all NPCs each frame
- [x] 4.3 Track `nearestNPC` and `isInRange` state
- [x] 4.4 Expose `nearestNPCId`, `nearestNPCName`, `distance` values

## 5. Create Interaction UI

- [x] 5.1 Add interaction prompt component ("Press SPACE to talk to {name}")
- [x] 5.2 Show prompt only when `isInRange` is true
- [x] 5.3 Style prompt with floating card design
- [x] 5.4 Add visual highlight effect to nearest NPC (via selected state)

## 6. Implement Space Key Trigger

- [x] 6.1 Add keyboard event listener for SPACE key
- [x] 6.2 Check if `isInRange` before triggering
- [x] 6.3 Call `useVoiceChat.startConversation(nearestNPCId)`
- [x] 6.4 Disable player controls when voice chat starts

## 7. Scene Integration

- [x] 7.1 Add PlayerCharacter to Scene3D component
- [x] 7.2 Integrate PointerLockControls
- [x] 7.3 Pass player position to proximity detection
- [x] 7.4 Connect space key trigger to voice chat
- [x] 7.5 Add "Click to start" overlay for initial state

## 8. Testing and Polish

- [x] 8.1 Test WASD movement in all directions (build verified)
- [x] 8.2 Test boundary clamping
- [x] 8.3 Test proximity detection at various distances
- [x] 8.4 Test space key trigger only when in range
- [x] 8.5 Test voice chat integration end-to-end
- [x] 8.6 Test ESC and re-lock flow
- [x] 8.7 Verify player position preserved after voice chat
