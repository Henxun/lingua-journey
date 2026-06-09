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
