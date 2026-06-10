import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Billboard, Html } from '@react-three/drei';
import * as THREE from 'three';

type AnimationState = 'idle' | 'talking' | 'listening' | 'waving';
type CharacterRole = 'waiter' | 'customer_f' | 'customer_m';

export interface Character3DProps {
  name: string;
  avatarColor: string;
  clothingColor: string;
  position: [number, number, number];
  animationState: AnimationState;
  isSelected: boolean;
  onClick: () => void;
  status?: string;
  role?: CharacterRole;
}

export function Character3D({
  name,
  avatarColor,
  clothingColor,
  position,
  animationState,
  isSelected,
  onClick,
  status = 'Ready to chat',
  role = 'customer_m'
}: Character3DProps) {
  const groupRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Group>(null);
  const mouthRef = useRef<THREE.Mesh>(null);
  const leftArmRef = useRef<THREE.Group>(null);
  const rightArmRef = useRef<THREE.Group>(null);
  const leftLegRef = useRef<THREE.Group>(null);
  const rightLegRef = useRef<THREE.Group>(null);
  const bodyRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;

    // Breathing / idle body movement
    if (bodyRef.current) {
      bodyRef.current.position.y = Math.sin(t * 1.5) * 0.015;
    }

    // Head idle look around
    if (headRef.current) {
      if (animationState === 'listening') {
        headRef.current.rotation.z = 0.12 + Math.sin(t * 0.8) * 0.06;
        headRef.current.rotation.y = Math.sin(t * 0.6) * 0.1;
      } else if (animationState === 'talking') {
        headRef.current.rotation.z = Math.sin(t * 4) * 0.05;
      } else if (animationState === 'waving') {
        headRef.current.rotation.y = Math.sin(t * 2) * 0.08;
      } else {
        headRef.current.rotation.z = Math.sin(t * 0.7) * 0.03;
        headRef.current.rotation.y = Math.sin(t * 0.3) * 0.05;
      }
    }

    // Mouth animation when talking
    if (mouthRef.current) {
      if (animationState === 'talking') {
        const s = 0.6 + Math.abs(Math.sin(t * 15)) * 0.8;
        mouthRef.current.scale.set(1, s, 1);
      } else {
        mouthRef.current.scale.set(1, 1, 1);
      }
    }

    // Arm animations
    if (rightArmRef.current) {
      if (animationState === 'waving') {
        rightArmRef.current.rotation.x = -1.8 + Math.sin(t * 8) * 0.5;
        rightArmRef.current.rotation.z = -0.3;
      } else if (animationState === 'talking') {
        rightArmRef.current.rotation.x = -0.3 + Math.sin(t * 3) * 0.25;
        rightArmRef.current.rotation.z = -0.3 + Math.sin(t * 2) * 0.1;
      } else if (animationState === 'listening') {
        rightArmRef.current.rotation.x = -0.1;
        rightArmRef.current.rotation.z = -0.2;
      } else {
        rightArmRef.current.rotation.x = Math.sin(t * 1.5) * 0.03;
        rightArmRef.current.rotation.z = -0.2;
      }
    }

    if (leftArmRef.current) {
      if (animationState === 'talking') {
        leftArmRef.current.rotation.x = -0.2 + Math.sin(t * 3 + 1) * 0.2;
        leftArmRef.current.rotation.z = 0.3 + Math.sin(t * 2 + 1) * 0.1;
      } else if (animationState === 'listening') {
        leftArmRef.current.rotation.x = -0.15;
        leftArmRef.current.rotation.z = 0.2;
      } else {
        leftArmRef.current.rotation.x = Math.sin(t * 1.5 + 1) * 0.03;
        leftArmRef.current.rotation.z = 0.2;
      }
    }

    // Leg sway
    if (leftLegRef.current && rightLegRef.current) {
      leftLegRef.current.rotation.x = Math.sin(t * 1.5) * 0.01;
      rightLegRef.current.rotation.x = Math.sin(t * 1.5 + Math.PI) * 0.01;
    }
  });

  const scale = isSelected ? 1.1 : hovered ? 1.03 : 1;
  const emissiveIntensity = isSelected ? 0.5 : hovered ? 0.25 : 0;

  return (
    <group
      ref={groupRef}
      position={position}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
      }}
      onPointerOut={() => setHovered(false)}
      scale={scale}
    >
      <group ref={bodyRef}>
        {/* HEAD GROUP */}
        <group ref={headRef} position={[0, 1.55, 0]}>
          {/* Skull */}
          <mesh castShadow>
            <sphereGeometry args={[0.22, 24, 24]} />
            <meshStandardMaterial
              color={avatarColor}
              roughness={0.7}
              emissive={avatarColor}
              emissiveIntensity={emissiveIntensity * 0.3}
            />
          </mesh>

          {/* Hair */}
          {role === 'waiter' && (
            <mesh position={[0, 0.1, 0]} castShadow>
              <sphereGeometry args={[0.24, 24, 16, 0, Math.PI * 2, 0, Math.PI * 0.65]} />
              <meshStandardMaterial color="#1a1a1a" roughness={0.8} />
            </mesh>
          )}
          {role === 'customer_f' && (
            <>
              <mesh position={[0, 0.12, 0]} castShadow>
                <sphereGeometry args={[0.25, 24, 16, 0, Math.PI * 2, 0, Math.PI * 0.7]} />
                <meshStandardMaterial color="#8B4513" roughness={0.6} />
              </mesh>
              <mesh position={[-0.2, -0.05, 0]} castShadow>
                <sphereGeometry args={[0.12, 16, 16]} />
                <meshStandardMaterial color="#8B4513" roughness={0.6} />
              </mesh>
              <mesh position={[0.2, -0.05, 0]} castShadow>
                <sphereGeometry args={[0.12, 16, 16]} />
                <meshStandardMaterial color="#8B4513" roughness={0.6} />
              </mesh>
            </>
          )}
          {role === 'customer_m' && (
            <mesh position={[0, 0.08, 0]} castShadow>
              <sphereGeometry args={[0.23, 24, 16, 0, Math.PI * 2, 0, Math.PI * 0.6]} />
              <meshStandardMaterial color="#3d2817" roughness={0.7} />
            </mesh>
          )}

          {/* Eyes */}
          <mesh position={[-0.08, 0.02, 0.19]}>
            <sphereGeometry args={[0.035, 12, 12]} />
            <meshStandardMaterial color="white" />
          </mesh>
          <mesh position={[0.08, 0.02, 0.19]}>
            <sphereGeometry args={[0.035, 12, 12]} />
            <meshStandardMaterial color="white" />
          </mesh>
          <mesh position={[-0.08, 0.02, 0.21]}>
            <sphereGeometry args={[0.02, 10, 10]} />
            <meshStandardMaterial color="#1a1a1a" />
          </mesh>
          <mesh position={[0.08, 0.02, 0.21]}>
            <sphereGeometry args={[0.02, 10, 10]} />
            <meshStandardMaterial color="#1a1a1a" />
          </mesh>

          {/* Nose */}
          <mesh position={[0, -0.03, 0.22]} rotation={[0.3, 0, 0]}>
            <coneGeometry args={[0.025, 0.06, 8]} />
            <meshStandardMaterial color={avatarColor} roughness={0.7} />
          </mesh>

          {/* Mouth */}
          <mesh ref={mouthRef} position={[0, -0.09, 0.2]}>
            <boxGeometry args={[0.06, 0.015, 0.01]} />
            <meshStandardMaterial color="#8B0000" />
          </mesh>
        </group>

        {/* NECK */}
        <mesh position={[0, 1.3, 0]} castShadow>
          <cylinderGeometry args={[0.06, 0.07, 0.1, 12]} />
          <meshStandardMaterial color={avatarColor} roughness={0.7} />
        </mesh>

        {/* TORSO - Shirt */}
        <group position={[0, 0.95, 0]}>
          <mesh castShadow>
            <boxGeometry args={[0.5, 0.55, 0.28]} />
            <meshStandardMaterial
              color={clothingColor}
              roughness={0.8}
              emissive={clothingColor}
              emissiveIntensity={emissiveIntensity * 0.2}
            />
          </mesh>
          {/* Shirt detail - collar */}
          <mesh position={[0, 0.28, 0.15]} castShadow>
            <boxGeometry args={[0.3, 0.08, 0.02]} />
            <meshStandardMaterial color="white" roughness={0.7} />
          </mesh>
          {/* Buttons */}
          {[0.15, 0, -0.15].map((y, i) => (
            <mesh key={i} position={[0, y, 0.15]}>
              <sphereGeometry args={[0.02, 8, 8]} />
              <meshStandardMaterial color="#333" metalness={0.5} roughness={0.4} />
            </mesh>
          ))}
          {/* Apron for waiter */}
          {role === 'waiter' && (
            <mesh position={[0, -0.05, 0.15]} castShadow>
              <boxGeometry args={[0.38, 0.45, 0.015]} />
              <meshStandardMaterial color="white" roughness={0.7} />
            </mesh>
          )}
        </group>

        {/* ARMS - positioned in front of torso */}
        <group ref={rightArmRef} position={[0.28, 1.15, 0.16]}>
          <mesh position={[0, -0.2, 0]} castShadow>
            <capsuleGeometry args={[0.06, 0.35, 6, 12]} />
            <meshStandardMaterial
              color={clothingColor}
              roughness={0.8}
              emissive={clothingColor}
              emissiveIntensity={emissiveIntensity * 0.15}
            />
          </mesh>
          {/* Hand */}
          <mesh position={[0, -0.42, 0]} castShadow>
            <sphereGeometry args={[0.065, 12, 12]} />
            <meshStandardMaterial color={avatarColor} roughness={0.7} />
          </mesh>
          {role === 'waiter' && (
            <mesh position={[0, -0.52, 0.05]} castShadow>
              <boxGeometry args={[0.18, 0.02, 0.15]} />
              <meshStandardMaterial color="white" />
            </mesh>
          )}
        </group>

        <group ref={leftArmRef} position={[-0.28, 1.15, 0.16]}>
          <mesh position={[0, -0.2, 0]} castShadow>
            <capsuleGeometry args={[0.06, 0.35, 6, 12]} />
            <meshStandardMaterial color={clothingColor} roughness={0.8} />
          </mesh>
          <mesh position={[0, -0.42, 0]} castShadow>
            <sphereGeometry args={[0.065, 12, 12]} />
            <meshStandardMaterial color={avatarColor} roughness={0.7} />
          </mesh>
        </group>

        {/* HIPS / Pants */}
        <mesh position={[0, 0.6, 0]} castShadow>
          <boxGeometry args={[0.48, 0.2, 0.28]} />
          <meshStandardMaterial color="#2d2d2d" roughness={0.85} />
        </mesh>

        {/* LEGS */}
        <group ref={rightLegRef} position={[0.12, 0.45, 0]}>
          <mesh position={[0, -0.2, 0]} castShadow>
            <boxGeometry args={[0.14, 0.4, 0.18]} />
            <meshStandardMaterial color="#2d2d2d" roughness={0.85} />
          </mesh>
          {/* Shoe */}
          <mesh position={[0, -0.45, 0.04]} castShadow>
            <boxGeometry args={[0.15, 0.06, 0.22]} />
            <meshStandardMaterial color="#1a1a1a" roughness={0.6} metalness={0.3} />
          </mesh>
        </group>

        <group ref={leftLegRef} position={[-0.12, 0.45, 0]}>
          <mesh position={[0, -0.2, 0]} castShadow>
            <boxGeometry args={[0.14, 0.4, 0.18]} />
            <meshStandardMaterial color="#2d2d2d" roughness={0.85} />
          </mesh>
          <mesh position={[0, -0.45, 0.04]} castShadow>
            <boxGeometry args={[0.15, 0.06, 0.22]} />
            <meshStandardMaterial color="#1a1a1a" roughness={0.6} metalness={0.3} />
          </mesh>
        </group>
      </group>

      {/* Name label - always faces camera */}
      <Billboard position={[0, 2.4, 0]}>
        <Html>
          <div
            className={`px-3 py-1.5 rounded-xl shadow-lg text-center whitespace-nowrap transition-all ${
              isSelected
                ? 'bg-green-50/95 border-2 border-green-400 text-green-800'
                : hovered
                ? 'bg-white/95 border-2 border-blue-300 text-gray-900'
                : 'bg-white/85 border-2 border-transparent text-gray-800'
            }`}
            style={{ pointerEvents: 'none', fontSize: '12px' }}
          >
            <div className="font-bold">{name}</div>
            <div className={`text-xs ${isSelected ? 'text-green-600' : 'text-gray-500'}`}>
              {status}
            </div>
          </div>
        </Html>
      </Billboard>

      {/* Selection ring */}
      {(isSelected || hovered) && (
        <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.4, 0.5, 32]} />
          <meshBasicMaterial
            color={isSelected ? '#22c55e' : '#3b82f6'}
            transparent
            opacity={0.7}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}

      {/* Glow aura when selected */}
      {isSelected && (
        <mesh position={[0, 1, 0]}>
          <sphereGeometry args={[0.7, 16, 16]} />
          <meshBasicMaterial color="#22c55e" transparent opacity={0.06} />
        </mesh>
      )}
    </group>
  );
}
