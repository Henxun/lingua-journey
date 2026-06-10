'use client';

import { useState, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Billboard, Html } from '@react-three/drei';
import * as THREE from 'three';

// ============== Cafe Environment ==============
export function CafeEnvironment() {
  return (
    <group>
      {/* FLOOR - checkered tile pattern */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[25, 25]} />
        <meshStandardMaterial color="#8B7355" roughness={0.7} />
      </mesh>
      
      {/* Checkered floor pattern */}
      {Array.from({ length: 10 }).map((_, i) =>
        Array.from({ length: 10 }).map((_, j) => (
          (i + j) % 2 === 0 ? (
            <mesh key={`${i}-${j}`} rotation={[-Math.PI / 2, 0, 0]} position={[-9 + i * 2, 0.002, -9 + j * 2]} receiveShadow>
              <planeGeometry args={[2, 2]} />
              <meshStandardMaterial color="#A08060" roughness={0.7} />
            </mesh>
          ) : null
        ))
      )}

      {/* WALLS - warm beige */}
      {/* Back wall */}
      <mesh position={[0, 2.5, -6]} receiveShadow>
        <boxGeometry args={[20, 5, 0.2]} />
        <meshStandardMaterial color="#DEB887" roughness={0.85} />
      </mesh>
      
      {/* Left wall */}
      <mesh position={[-10, 2.5, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <boxGeometry args={[12, 5, 0.2]} />
        <meshStandardMaterial color="#D2B48C" roughness={0.85} />
      </mesh>
      
      {/* Right wall */}
      <mesh position={[10, 2.5, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <boxGeometry args={[12, 5, 0.2]} />
        <meshStandardMaterial color="#D2B48C" roughness={0.85} />
      </mesh>

      {/* CEILING */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 5, 0]} receiveShadow>
        <planeGeometry args={[30, 30]} />
        <meshStandardMaterial color="#F5DEB3" roughness={0.9} />
      </mesh>

      {/* MENU BOARD on back wall */}
      <group position={[0, 3.2, -5.85]}>
        <mesh castShadow>
          <boxGeometry args={[3, 2, 0.1]} />
          <meshStandardMaterial color="#2F1810" roughness={0.6} />
        </mesh>
        {/* Menu items text placeholder */}
        <mesh position={[0, 0.2, 0.06]}>
          <planeGeometry args={[2.6, 0.15]} />
          <meshStandardMaterial color="#F5F5DC" />
        </mesh>
        <mesh position={[0, -0.1, 0.06]}>
          <planeGeometry args={[2.6, 0.12]} />
          <meshStandardMaterial color="#F5F5DC" />
        </mesh>
        <mesh position={[0, -0.35, 0.06]}>
          <planeGeometry args={[2.6, 0.12]} />
          <meshStandardMaterial color="#F5F5DC" />
        </mesh>
      </group>

      {/* LARGE WINDOW on back wall */}
      <group position={[-6, 3, -5.85]}>
        <mesh position={[0, 0, 0.05]}>
          <boxGeometry args={[3.5, 2.5, 0.05]} />
          <meshStandardMaterial color="#4A6FA5" roughness={0.3} metalness={0.1} emissive="#6A8FC5" emissiveIntensity={0.2} />
        </mesh>
        {/* Window frame */}
        <mesh position={[0, 0, 0.1]}>
          <boxGeometry args={[3.7, 2.7, 0.1]} />
          <meshStandardMaterial color="#8B7355" />
        </mesh>
        {/* Window cross bars */}
        <mesh position={[0, 0, 0.08]}>
          <boxGeometry args={[0.05, 2.5, 0.05]} />
          <meshStandardMaterial color="#8B7355" />
        </mesh>
        <mesh position={[0, 0, 0.08]}>
          <boxGeometry args={[3.5, 0.05, 0.05]} />
          <meshStandardMaterial color="#8B7355" />
        </mesh>
      </group>

      {/* DOOR on back wall right */}
      <group position={[5, 1.5, -5.85]}>
        <mesh position={[0, 0, 0.05]} castShadow>
          <boxGeometry args={[1.4, 3, 0.08]} />
          <meshStandardMaterial color="#6B4423" roughness={0.6} />
        </mesh>
        <mesh position={[0.4, 0, 0.15]}>
          <sphereGeometry args={[0.04, 8, 8]} />
          <meshStandardMaterial color="#B8860B" metalness={0.7} roughness={0.3} />
        </mesh>
      </group>

      {/* HANGING LIGHTS / PENDANT LAMPS */}
      {[-4, 0, 4].map((x, i) => (
        <group key={i} position={[x, 4.6, 0]}>
          {/* Cord */}
          <mesh position={[0, 0.1, 0]}>
            <cylinderGeometry args={[0.015, 0.015, 0.6, 8]} />
            <meshStandardMaterial color="#333" />
          </mesh>
          {/* Lamp shade */}
          <mesh position={[0, -0.3, 0]} castShadow>
            <cylinderGeometry args={[0.2, 0.25, 0.25, 16]} />
            <meshStandardMaterial color="#DEB887" roughness={0.7} emissive="#8B7355" emissiveIntensity={0.2} />
          </mesh>
          {/* Light bulb glow */}
          <mesh position={[0, -0.35, 0]}>
            <sphereGeometry args={[0.06, 12, 12]} />
            <meshStandardMaterial color="#FFFACD" emissive="#FFE4B5" emissiveIntensity={2} />
          </mesh>
          {/* Point light */}
          <pointLight intensity={0.7} color="#FFD700" distance={5} decay={2} position={[0, -0.35, 0]} />
        </group>
      ))}

      {/* COFFEE COUNTER on right side */}
      <group position={[7, 0, -2]}>
        <mesh position={[0, 0.55, 0]} castShadow>
          <boxGeometry args={[2.5, 1.1, 1]} />
          <meshStandardMaterial color="#8B7355" roughness={0.6} />
        </mesh>
        <mesh position={[0, 1.15, 0]} castShadow>
          <boxGeometry args={[2.6, 0.06, 1.1]} />
          <meshStandardMaterial color="#654321" roughness={0.4} metalness={0.1} />
        </mesh>
        
        {/* Espresso machine */}
        <group position={[-0.7, 1.35, 0]}>
          <mesh castShadow>
            <boxGeometry args={[0.5, 0.5, 0.4]} />
            <meshStandardMaterial color="#2F2F2F" roughness={0.5} metalness={0.3} />
          </mesh>
          {/* Coffee spouts */}
          <mesh position={[0, -0.3, 0.2]}>
            <cylinderGeometry args={[0.03, 0.03, 0.1, 8]} />
            <meshStandardMaterial color="#8B4513" metalness={0.5} />
          </mesh>
        </group>
        
        {/* Coffee cups on counter */}
        {[-0.2, 0.2].map((x, i) => (
          <group key={i} position={[x, 1.2, -0.3]}>
            <mesh castShadow>
              <cylinderGeometry args={[0.08, 0.06, 0.12, 16]} />
              <meshStandardMaterial color="white" roughness={0.3} />
            </mesh>
            {i === 0 && (
              <mesh position={[0, 0.07, 0]}>
                <cylinderGeometry args={[0.07, 0.07, 0.02, 16]} />
                <meshStandardMaterial color="#8B4513" roughness={0.3} />
              </mesh>
            )}
          </group>
        ))}
      </group>

      {/* PLANT decorations */}
      {[[-8, 0, -5], [8, 0, 4]].map(([x, y, z], i) => (
        <group key={i} position={[x, y, z]}>
          <mesh position={[0, 0.3, 0]} castShadow>
            <cylinderGeometry args={[0.3, 0.2, 0.6, 12]} />
            <meshStandardMaterial color="#8B4513" roughness={0.8} />
          </mesh>
          {Array.from({ length: 6 }).map((_, j) => (
            <mesh key={j} position={[Math.cos(j * 1) * 0.2, 0.9 + j * 0.1, Math.sin(j * 1) * 0.2]} castShadow>
              <sphereGeometry args={[0.2, 8, 8]} />
              <meshStandardMaterial color={j % 2 === 0 ? '#228B22' : '#32CD32'} roughness={0.8} />
            </mesh>
          ))}
        </group>
      ))}

      {/* OUTDOOR VIEW through window */}
      <group position={[-6, 3, -5.8]}>
        <mesh>
          <planeGeometry args={[3.4, 2.4]} />
          <meshStandardMaterial color="#87CEEB" emissive="#87CEEB" emissiveIntensity={0.1} />
        </mesh>
      </group>

      {/* Small tables with chairs */}
      <CafeTable position={[-3, 0, 0]} rotationY={0.2} />
      <CafeTable position={[1, 0, 0]} rotationY={-0.3} />
      <CafeTable position={[4, 0, 3]} rotationY={0.5} />
      <CafeTable position={[-4, 0, 3]} rotationY={-0.4} />
    </group>
  );
}

// ============== Cafe Table Component ==============
function CafeTable({ position, rotationY = 0 }: { position: [number, number, number]; rotationY?: number }) {
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      {/* Round table top */}
      <mesh position={[0, 0.75, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.6, 0.6, 0.06, 24]} />
        <meshStandardMaterial color="#8B7355" roughness={0.5} />
      </mesh>
      
      {/* Table leg */}
      <mesh position={[0, 0.35, 0]} castShadow>
        <cylinderGeometry args={[0.05, 0.08, 0.7, 12]} />
        <meshStandardMaterial color="#654321" roughness={0.6} />
      </mesh>
      
      {/* Table base */}
      <mesh position={[0, 0.02, 0]} castShadow>
        <cylinderGeometry args={[0.3, 0.35, 0.04, 24]} />
        <meshStandardMaterial color="#654321" roughness={0.6} />
      </mesh>
      
      {/* Small coffee cup on table */}
      <group position={[0.2, 0.81, 0]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.05, 0.04, 0.08, 12]} />
          <meshStandardMaterial color="white" roughness={0.3} />
        </mesh>
      </group>
      
      {/* Small plate */}
      <group position={[-0.15, 0.79, 0.1]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.08, 0.07, 0.01, 16]} />
          <meshStandardMaterial color="white" roughness={0.3} />
        </mesh>
        {/* Small pastry */}
        <mesh position={[0, 0.02, 0]} castShadow>
          <cylinderGeometry args={[0.03, 0.04, 0.03, 8]} />
          <meshStandardMaterial color="#D2691E" roughness={0.7} />
        </mesh>
      </group>
      
      {/* Chair 1 */}
      <CafeChair position={[0.7, 0, 0]} rotationY={-0.5} />
      <CafeChair position={[-0.7, 0, 0]} rotationY={0.5} />
    </group>
  );
}

// ============== Cafe Chair Component ==============
function CafeChair({ position, rotationY = 0 }: { position: [number, number, number]; rotationY?: number }) {
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      {/* Seat */}
      <mesh position={[0, 0.45, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.45, 0.04, 0.45]} />
        <meshStandardMaterial color="#DEB887" roughness={0.6} />
      </mesh>
      {/* Back rest */}
      <mesh position={[0, 0.75, -0.2]} castShadow>
        <boxGeometry args={[0.4, 0.5, 0.04]} />
        <meshStandardMaterial color="#DEB887" roughness={0.6} />
      </mesh>
      {/* Legs */}
      {[[-0.18, 0.22, 0.18], [0.18, 0.22, 0.18], [-0.18, 0.22, -0.18], [0.18, 0.22, -0.18]].map((pos, i) => (
        <mesh key={i} position={pos as [number, number, number]} castShadow>
          <cylinderGeometry args={[0.02, 0.02, 0.45, 8]} />
          <meshStandardMaterial color="#654321" roughness={0.7} />
        </mesh>
      ))}
    </group>
  );
}

export default CafeEnvironment;