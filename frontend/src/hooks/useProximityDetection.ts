import { useRef, useState, useMemo, RefObject } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Interaction distance threshold in units
const INTERACTION_THRESHOLD = 1.5;

// NPC data type
export interface NPCData {
  id: string;
  name: string;
  position: [number, number, number];
  role?: string;
  status?: string;
  avatarColor?: string;
  clothingColor?: string;
}

// Nearest NPC info
export interface NearestNPCInfo {
  id: string;
  name: string;
  distance: number;
}

// Return type for the hook
export interface UseProximityDetectionReturn {
  nearestNPC: NearestNPCInfo | null;
  isInRange: boolean;
  allInRange: NPCData[];
}

/**
 * Hook for detecting proximity to NPCs in a 3D scene.
 * Calculates 2D Euclidean distance (ignoring Y-axis) to each NPC.
 * Updates in real-time using useFrame for responsive interaction.
 *
 * @param playerPosition - Ref to the player's position vector (from usePlayerControls)
 * @param npcPositions - Array of NPC data including positions
 * @returns nearestNPC info, isInRange boolean, and allInRange array
 */
export function useProximityDetection(
  playerPosition: RefObject<THREE.Vector3>,
  npcPositions: NPCData[]
): UseProximityDetectionReturn {
  // Store computed results in refs to avoid triggering re-renders on every frame
  const nearestNPCRef = useRef<NearestNPCInfo | null>(null);
  const isInRangeRef = useRef(false);
  const allInRangeRef = useRef<NPCData[]>([]);

  // State for triggering re-renders (only when nearest NPC changes)
  const [, forceUpdate] = useState({});

  // Cache for NPC position vectors (avoid creating new vectors every frame)
  const npcPositionVectors = useMemo(() => {
    return npcPositions.map((npc) => ({
      ...npc,
      positionVec: new THREE.Vector3(...npc.position),
    }));
  }, [npcPositions]);

  // Temporary vectors for distance calculation (avoid allocations in useFrame)
  const tempVec = useRef(new THREE.Vector3());
  const npc2DPos = useRef(new THREE.Vector3());

  useFrame(() => {
    if (!playerPosition.current) return;

    const playerPos = playerPosition.current;
    let nearestDistance = Infinity;
    let nearest: NearestNPCInfo | null = null;
    const inRange: NPCData[] = [];

    // Calculate distance to each NPC
    for (const npc of npcPositionVectors) {
      // Calculate 2D distance (ignoring Y-axis): sqrt(dx*dx + dz*dz)
      tempVec.current.copy(playerPos);
      tempVec.current.y = 0; // Ignore Y-axis
      npc2DPos.current.set(npc.positionVec.x, 0, npc.positionVec.z);
      const distance = tempVec.current.distanceTo(npc2DPos.current);

      // Track NPCs in range
      if (distance <= INTERACTION_THRESHOLD) {
        inRange.push(npc);
      }

      // Track nearest NPC
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearest = {
          id: npc.id,
          name: npc.name,
          distance,
        };
      }
    }

    // Update refs and detect meaningful state changes
    const prevNearest = nearestNPCRef.current;
    const prevInRange = isInRangeRef.current;
    const newInRange = inRange.length > 0;

    nearestNPCRef.current = nearest;
    isInRangeRef.current = newInRange;
    allInRangeRef.current = inRange;

    // Force re-render when nearest NPC id changes OR when in-range state flips
    const nearestChanged =
      (!prevNearest && nearest) ||
      (prevNearest && !nearest) ||
      (prevNearest && nearest && prevNearest.id !== nearest.id);

    const inRangeFlipped = prevInRange !== newInRange;

    if (nearestChanged || inRangeFlipped) {
      forceUpdate({});
    }
  });

  return {
    nearestNPC: nearestNPCRef.current,
    isInRange: isInRangeRef.current,
    allInRange: allInRangeRef.current,
  };
}
