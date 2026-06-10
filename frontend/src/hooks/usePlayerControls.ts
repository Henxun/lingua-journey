import { useRef, useEffect, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

// Scene boundaries
const BOUNDS = {
  minX: -6,
  maxX: 9,
  minZ: -6,
  maxZ: 5,
};

// Movement speed in units per second
const MOVE_SPEED = 5;

// Camera height (first-person view)
const CAMERA_HEIGHT = 1.7;

// Player collision radius (compact body size)
const PLAYER_RADIUS = 0.25;

// Collision obstacles - Axis-Aligned Bounding Boxes in XZ plane
// Format: { minX, maxX, minZ, maxZ }
interface Obstacle {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
  label?: string;
}

const OBSTACLES: Obstacle[] = [
  // ===== WALLS =====
  // Back wall (z = -6) - thick wall
  { minX: -10.5, maxX: 10.5, minZ: -6.3, maxZ: -5.8, label: 'back_wall' },
  // Left wall (x = -10)
  { minX: -10.3, maxX: -9.7, minZ: -6, maxZ: 5.5, label: 'left_wall' },
  // Right wall (x = 10)
  { minX: 9.7, maxX: 10.3, minZ: -6, maxZ: 5.5, label: 'right_wall' },

  // ===== DINING TABLES (compact - just table legs area) =====
  // Table 1: center [-3, 0, -0.5], size about 2 x 1.4
  { minX: -3.9, maxX: -2.1, minZ: -1.2, maxZ: 0.2, label: 'table1' },
  // Table 2: center [2.5, 0, -0.5]
  { minX: 1.6, maxX: 3.4, minZ: -1.2, maxZ: 0.2, label: 'table2' },
  // Table 3: center [3.5, 0, -3]
  { minX: 2.6, maxX: 4.4, minZ: -3.7, maxZ: -2.3, label: 'table3' },

  // ===== CHAIRS (small boxes around tables) =====
  // Table 1 chairs: front chairs at z ~ 0.5, back chairs at z ~ -1.5
  { minX: -3.25, maxX: -2.75, minZ: 0.25, maxZ: 0.85, label: 'table1_chair_front1' },
  { minX: -3.25, maxX: -2.75, minZ: -1.85, maxZ: -1.25, label: 'table1_chair_back1' },
  // Table 2 chairs
  { minX: 2.25, maxX: 2.75, minZ: 0.25, maxZ: 0.85, label: 'table2_chair_front1' },
  { minX: 2.25, maxX: 2.75, minZ: -1.85, maxZ: -1.25, label: 'table2_chair_back1' },
  // Table 3 chairs
  { minX: 3.25, maxX: 3.75, minZ: -2.45, maxZ: -1.85, label: 'table3_chair_front1' },
  { minX: 3.25, maxX: 3.75, minZ: -4.15, maxZ: -3.55, label: 'table3_chair_back1' },

  // ===== BAR / COUNTER =====
  // Position [8.5, 0, -3], size [1.8, 1.1, 0.8]
  { minX: 7.6, maxX: 9.4, minZ: -3.5, maxZ: -2.5, label: 'bar' },

  // ===== PLANT in corner =====
  // Position [-8.5, 0, -5], small pot
  { minX: -8.8, maxX: -8.2, minZ: -5.3, maxZ: -4.7, label: 'plant' },

  // ===== NPC CHARACTERS (small bodies) =====
  // Waiter at [-1.8, 0, 0.5] - small body box
  { minX: -2.1, maxX: -1.5, minZ: 0.25, maxZ: 0.75, label: 'npc_waiter' },
  // Customer 1 (Emma) at [2.2, 0, 0.8]
  { minX: 1.9, maxX: 2.5, minZ: 0.55, maxZ: 1.05, label: 'npc_emma' },
  // Customer 2 (Marcus) at [1.8, 0, -1.8]
  { minX: 1.5, maxX: 2.1, minZ: -2.05, maxZ: -1.55, label: 'npc_marcus' },
];

// Check if a point (x, z) with player radius collides with any obstacle
// Returns true if colliding, false otherwise
function checkCollision(x: number, z: number): boolean {
  const playerMinX = x - PLAYER_RADIUS;
  const playerMaxX = x + PLAYER_RADIUS;
  const playerMinZ = z - PLAYER_RADIUS;
  const playerMaxZ = z + PLAYER_RADIUS;

  for (const obs of OBSTACLES) {
    // AABB intersection test
    if (
      playerMaxX > obs.minX &&
      playerMinX < obs.maxX &&
      playerMaxZ > obs.minZ &&
      playerMinZ < obs.maxZ
    ) {
      return true;
    }
  }
  return false;
}

// Also check bounds - returns clamped position within bounds
function clampToBounds(x: number, z: number): { x: number; z: number } {
  return {
    x: Math.max(BOUNDS.minX, Math.min(BOUNDS.maxX, x)),
    z: Math.max(BOUNDS.minZ, Math.min(BOUNDS.maxZ, z)),
  };
}

export interface UsePlayerControlsOptions {
  enabled?: boolean;
  firstPerson?: boolean;
}

export interface UsePlayerControlsReturn {
  keys: React.RefObject<{
    forward: boolean;
    backward: boolean;
    left: boolean;
    right: boolean;
  }>;
  playerPosition: React.RefObject<THREE.Vector3>;
  isLocked: boolean;
  /** Character facing rotation (radians around Y axis). Updated when moving. */
  playerFacing: React.RefObject<number>;
}

// Third-person camera offset (behind and above player)
const THIRD_PERSON_OFFSET = {
  x: 0,
  y: 2.5,  // Height above player
  z: 3.5,  // Distance behind player
};

/**
 * Hook for player character movement using WASD keys.
 * Supports first-person and third-person camera modes.
 * - First-person: camera is at player's head, no character rendered
 * - Third-person: camera follows from behind the player, character is visible
 */
export function usePlayerControls({ enabled = true, firstPerson = false }: UsePlayerControlsOptions = {}): UsePlayerControlsReturn {
  const { camera } = useThree();

  // Keys state - using ref for performance
  const keys = useRef({
    forward: false,
    backward: false,
    left: false,
    right: false,
  });

  // Player position (reference to share with camera)
  // NOTE: y is at CAMERA_HEIGHT (1.7) for first-person; the character model is rendered at ground level
  const playerPosition = useRef(new THREE.Vector3(0, CAMERA_HEIGHT, 4));

  // Pointer lock state
  const [isLocked, setIsLocked] = useState(false);

  // Temporary vectors for calculations
  const moveDirection = useRef(new THREE.Vector3());
  const frontVector = useRef(new THREE.Vector3());
  const sideVector = useRef(new THREE.Vector3());

  // Handle key down
  const handleKeyDown = (event: KeyboardEvent) => {
    // Don't handle if user is typing in an input
    if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
      return;
    }
    switch (event.code) {
      case 'KeyW':
      case 'ArrowUp':
        keys.current.forward = true;
        break;
      case 'KeyS':
      case 'ArrowDown':
        keys.current.backward = true;
        break;
      case 'KeyA':
      case 'ArrowLeft':
        keys.current.left = true;
        break;
      case 'KeyD':
      case 'ArrowRight':
        keys.current.right = true;
        break;
    }
  };

  // Handle key up
  const handleKeyUp = (event: KeyboardEvent) => {
    switch (event.code) {
      case 'KeyW':
      case 'ArrowUp':
        keys.current.forward = false;
        break;
      case 'KeyS':
      case 'ArrowDown':
        keys.current.backward = false;
        break;
      case 'KeyA':
      case 'ArrowLeft':
        keys.current.left = false;
        break;
      case 'KeyD':
      case 'ArrowRight':
        keys.current.right = false;
        break;
    }
  };

  // Handle pointer lock change
  const handlePointerLockChange = () => {
    setIsLocked(document.pointerLockElement !== null);
  };

  // Set up event listeners
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    document.addEventListener('pointerlockchange', handlePointerLockChange);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
      document.removeEventListener('pointerlockchange', handlePointerLockChange);
    };
  }, []);

  // Player facing direction (rotation around Y axis). Used by the character
  // model so it turns to face where it's going.
  const playerFacingRef = useRef(0);

  // Reusable vectors (avoid allocating new ones every frame)
  const cameraDirection = useRef(new THREE.Vector3());
  const worldMoveDirection = useRef(new THREE.Vector3());

  // Update player and camera position in useFrame
  useFrame((_state, delta) => {
    if (!camera) return;

    // Get camera's forward direction (ignore Y component)
    camera.getWorldDirection(cameraDirection.current);
    cameraDirection.current.y = 0;
    if (cameraDirection.current.lengthSq() > 0) {
      cameraDirection.current.normalize();
    } else {
      // Default: looking down -Z
      cameraDirection.current.set(0, 0, -1);
    }

    // Only move if movement is enabled AND pointer lock is active
    const isMoving = enabled && isLocked && (
      keys.current.forward ||
      keys.current.backward ||
      keys.current.left ||
      keys.current.right
    );

    if (isMoving) {
      const { forward, backward, left, right } = keys.current;

      // Calculate movement direction based on camera facing
      frontVector.current.set(0, 0, Number(forward) - Number(backward));
      sideVector.current.set(Number(left) - Number(right), 0, 0);

      // Combine vectors
      moveDirection.current
        .copy(frontVector.current)
        .add(sideVector.current);

      // Normalize to prevent faster diagonal movement
      if (moveDirection.current.length() > 0) {
        moveDirection.current.normalize();
      }

      // Rotate movement direction by camera's Y rotation
      // camera direction: angle = atan2(cameraDirection.x, cameraDirection.z)
      const camAngle = Math.atan2(
        cameraDirection.current.x,
        cameraDirection.current.z
      );
      worldMoveDirection.current
        .copy(moveDirection.current)
        .applyAxisAngle(new THREE.Vector3(0, 1, 0), camAngle);

      // Calculate distance to move this frame
      const distance = MOVE_SPEED * delta;

      // Store current position as backup
      const oldX = playerPosition.current.x;
      const oldZ = playerPosition.current.z;

      // Try X axis movement first
      const newX = oldX + worldMoveDirection.current.x * distance;
      if (!checkCollision(newX, oldZ)) {
        playerPosition.current.x = newX;
      }

      // Try Z axis movement
      const newZ = oldZ + worldMoveDirection.current.z * distance;
      if (!checkCollision(playerPosition.current.x, newZ)) {
        playerPosition.current.z = newZ;
      }

      // Clamp to scene boundaries as safety net
      playerPosition.current.x = Math.max(BOUNDS.minX, Math.min(BOUNDS.maxX, playerPosition.current.x));
      playerPosition.current.z = Math.max(BOUNDS.minZ, Math.min(BOUNDS.maxZ, playerPosition.current.z));

      // Update player's facing direction — face along movement direction
      if (
        Math.abs(worldMoveDirection.current.x) > 0.01 ||
        Math.abs(worldMoveDirection.current.z) > 0.01
      ) {
        playerFacingRef.current = Math.atan2(
          worldMoveDirection.current.x,
          worldMoveDirection.current.z
        );
      }
    }

    // Keep player y at camera head height
    playerPosition.current.y = CAMERA_HEIGHT;

    // Update camera position based on mode.
    // IMPORTANT: In both modes we ONLY set camera.position — we never call
    // camera.lookAt(). PointerLockControls is responsible for the camera's
    // rotation (via mouse input) and will be overwritten if we call lookAt.
    if (firstPerson) {
      // First-person: camera is at player head — PointerLockControls handles rotation
      camera.position.copy(playerPosition.current);
    } else {
      // Third-person: position camera behind and above player.
      // Camera position = player ground position + (behind camera forward) + (up)
      // PointerLockControls handles rotation so the user can look around.
      const targetPos = new THREE.Vector3(
        playerPosition.current.x + -cameraDirection.current.x * THIRD_PERSON_OFFSET.z,
        playerPosition.current.y - CAMERA_HEIGHT + THIRD_PERSON_OFFSET.y,
        playerPosition.current.z + -cameraDirection.current.z * THIRD_PERSON_OFFSET.z
      );
      camera.position.lerp(targetPos, 0.25);
    }
  });

  return {
    keys,
    playerPosition,
    isLocked,
    playerFacing: playerFacingRef,
  };
}
