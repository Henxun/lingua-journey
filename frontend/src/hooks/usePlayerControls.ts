import { useRef, useEffect, useState, RefObject } from 'react';
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

// Initial player position
const INITIAL_POSITION: [number, number, number] = [0, 0, 0];

export interface UsePlayerControlsOptions {
  enabled?: boolean;
}

export interface UsePlayerControlsReturn {
  keys: RefObject<{
    forward: boolean;
    backward: boolean;
    left: boolean;
    right: boolean;
  }>;
  playerPosition: RefObject<THREE.Vector3>;
  isLocked: boolean;
}

/**
 * Hook for player character movement using WASD keys.
 * Movement is relative to camera direction using quaternion.
 * 
 * Gets camera from useThree() internally.
 * @returns keys ref, playerPosition ref, and isLocked state
 */
export function usePlayerControls({ enabled = true }: UsePlayerControlsOptions = {}): UsePlayerControlsReturn {
  const { camera } = useThree();

  // Keys state - using ref for performance
  const keys = useRef({
    forward: false,
    backward: false,
    left: false,
    right: false,
  });

  // Player position
  const playerPosition = useRef(new THREE.Vector3(...INITIAL_POSITION));

  // Pointer lock state
  const [isLocked, setIsLocked] = useState(false);

  // Temporary vectors for calculations (to avoid allocations in useFrame)
  const moveDirection = useRef(new THREE.Vector3());
  const cameraDirection = useRef(new THREE.Vector3());
  const frontVector = useRef(new THREE.Vector3());
  const sideVector = useRef(new THREE.Vector3());

  // Handle key down
  const handleKeyDown = (event: KeyboardEvent) => {
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

  // Update player position in useFrame
  useFrame((_state, delta) => {
    if (!camera) return;
    
    // Don't move if movement is disabled (e.g., during voice chat)
    if (!enabled) return;

    // Only move if any movement key is pressed
    const { forward, backward, left, right } = keys.current;
    if (!forward && !backward && !left && !right) return;

    // Get camera direction (forward vector)
    camera.getWorldDirection(cameraDirection.current);

    // Project camera direction onto XZ plane (ignore Y component)
    cameraDirection.current.y = 0;
    cameraDirection.current.normalize();

    // Calculate movement direction
    frontVector.current.set(0, 0, Number(backward) - Number(forward));
    sideVector.current.set(Number(left) - Number(right), 0, 0);

    // Combine vectors
    moveDirection.current
      .copy(frontVector.current)
      .add(sideVector.current);

    // Normalize to prevent faster diagonal movement
    if (moveDirection.current.length() > 0) {
      moveDirection.current.normalize();
    }

    // Apply camera rotation to movement direction
    // We need to rotate moveDirection by the camera's Y rotation
    const cameraQuaternion = camera.quaternion;
    moveDirection.current.applyQuaternion(cameraQuaternion);

    // Calculate distance to move this frame
    const distance = MOVE_SPEED * delta;

    // Update position
    playerPosition.current.x += moveDirection.current.x * distance;
    playerPosition.current.z += moveDirection.current.z * distance;

    // Clamp to scene boundaries
    playerPosition.current.x = Math.max(BOUNDS.minX, Math.min(BOUNDS.maxX, playerPosition.current.x));
    playerPosition.current.z = Math.max(BOUNDS.minZ, Math.min(BOUNDS.maxZ, playerPosition.current.z));

    // Y position stays at 0 (ground plane)
    playerPosition.current.y = 0;
  });

  return {
    keys,
    playerPosition,
    isLocked,
  };
}
