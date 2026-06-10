import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Character3D } from './Character3D';

export interface PlayerCharacterProps {
  firstPerson?: boolean;
  name?: string;
  /** Player position ref (from usePlayerControls in parent). y is at CAMERA_HEIGHT. */
  playerPosition: React.RefObject<THREE.Vector3>;
  /** Movement keys ref (from usePlayerControls in parent) */
  keys: React.RefObject<{ forward: boolean; backward: boolean; left: boolean; right: boolean }>;
  /** Character facing direction (radians, around Y axis). Ref updated in usePlayerControls. */
  playerFacing: React.RefObject<number>;
}

/**
 * Player character component. Renders ONLY in third-person mode.
 * - In first-person mode: returns null (camera IS the player)
 * - In third-person mode: renders a 3D character model that follows
 *   playerPosition and rotates toward playerFacing via useFrame.
 */
export function PlayerCharacter({
  firstPerson = true,
  name = 'Player',
  playerPosition,
  keys,
  playerFacing,
}: PlayerCharacterProps) {
  // In first-person mode, don't render the player character
  // (the camera IS the player, so we just see through their eyes)
  if (firstPerson) {
    return null;
  }

  // Third-person mode: render the character at player position (on the ground).
  return (
    <ThirdPersonCharacter
      name={name}
      playerPosition={playerPosition}
      keys={keys}
      playerFacing={playerFacing}
    />
  );
}

/**
 * Inner component that uses useFrame to move/rotate the character model each frame.
 */
function ThirdPersonCharacter({
  name,
  playerPosition,
  playerFacing,
}: {
  name: string;
  playerPosition: React.RefObject<THREE.Vector3>;
  keys: React.RefObject<{ forward: boolean; backward: boolean; left: boolean; right: boolean }>;
  playerFacing: React.RefObject<number>;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const smoothPos = useRef(new THREE.Vector3(0, 0, 4));
  const smoothFacing = useRef(0);
  const initialized = useRef(false);

  useFrame(() => {
    if (!groupRef.current || !playerPosition.current) return;

    // Initialize on first frame
    if (!initialized.current) {
      smoothPos.current.set(playerPosition.current.x, 0, playerPosition.current.z);
      groupRef.current.position.copy(smoothPos.current);
      smoothFacing.current =
        typeof playerFacing.current === 'number' && isFinite(playerFacing.current)
          ? playerFacing.current
          : 0;
      groupRef.current.rotation.y = smoothFacing.current;
      initialized.current = true;
      return;
    }

    // Smoothly follow the player's current x/z (ground level)
    smoothPos.current.lerp(
      new THREE.Vector3(playerPosition.current.x, 0, playerPosition.current.z),
      0.35
    );
    groupRef.current.position.copy(smoothPos.current);

    // Smoothly rotate toward facing direction. Handle wrap-around at ±PI.
    const facing = playerFacing.current;
    if (typeof facing === 'number' && isFinite(facing)) {
      let diff = facing - smoothFacing.current;
      // Normalize to [-PI, PI] to avoid spinning the long way around
      while (diff > Math.PI) diff -= 2 * Math.PI;
      while (diff < -Math.PI) diff += 2 * Math.PI;
      smoothFacing.current += diff * 0.3;
      groupRef.current.rotation.y = smoothFacing.current;
    }
  });

  return (
    <group ref={groupRef}>
      <Character3D
        name={name}
        avatarColor="#FFE4C4"
        clothingColor="#607D8B"
        position={[0, 0, 0]}
        animationState="idle"
        isSelected={false}
        onClick={() => {}}
        role="customer_m"
      />
    </group>
  );
}
