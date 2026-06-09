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

export interface UsePlayerControlsOptions {
  enabled?: boolean;
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
}

/**
 * Hook for player character movement using WASD keys.
 * Updates both player position and camera position for first-person mode.
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

  // Player position (reference to share with camera)
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

  // Update player and camera position in useFrame
  useFrame((_state, delta) => {
    if (!camera) return;

    // Only move if movement is enabled AND pointer lock is active
    if (!enabled || !isLocked) {
      // Still update camera to player position when locked
      if (isLocked) {
        camera.position.copy(playerPosition.current);
      }
      return;
    }

    // Only move if any movement key is pressed
    const { forward, backward, left, right } = keys.current;
    if (!forward && !backward && !left && !right) {
      // Still sync camera to player position even when not moving
      camera.position.copy(playerPosition.current);
      return;
    }

    // Get camera's forward direction (ignore Y component)
    const cameraDirection = new THREE.Vector3();
    camera.getWorldDirection(cameraDirection);
    cameraDirection.y = 0;
    cameraDirection.normalize();

    // Calculate movement direction based on camera facing
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

    // Rotate movement direction by camera's Y rotation
    moveDirection.current.applyAxisAngle(new THREE.Vector3(0, 1, 0), Math.atan2(
      cameraDirection.x,
      cameraDirection.z
    ));

    // Calculate distance to move this frame
    const distance = MOVE_SPEED * delta;

    // Update player position
    playerPosition.current.x += moveDirection.current.x * distance;
    playerPosition.current.z += moveDirection.current.z * distance;

    // Clamp to scene boundaries
    playerPosition.current.x = Math.max(BOUNDS.minX, Math.min(BOUNDS.maxX, playerPosition.current.x));
    playerPosition.current.z = Math.max(BOUNDS.minZ, Math.min(BOUNDS.maxZ, playerPosition.current.z));

    // Keep camera at fixed height (first-person view)
    playerPosition.current.y = CAMERA_HEIGHT;

    // Update camera position to match player position (first-person mode)
    camera.position.copy(playerPosition.current);
  });

  return {
    keys,
    playerPosition,
    isLocked,
  };
}
