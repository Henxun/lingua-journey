'use client';

import { useState, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export function AirportEnvironment() {
  return (
    <group>
      {/* FLOOR - polished marble */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[40, 40]} />
        <meshStandardMaterial color="#E8E8E8" roughness={0.3} metalness={0.1} />
      </mesh>

      {/* Floor guide lines */}
      {Array.from({ length: 8 }).map((_, i) => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[-15 + i * 4, 0.002, 0]}>
          <planeGeometry args={[0.05, 40]} />
          <meshStandardMaterial color="#4169E1" emissive="#4169E1" emissiveIntensity={0.1} />
        </mesh>
      ))}

      {/* WALLS - modern glass and metal */}
      {/* Back wall */}
      <mesh position={[0, 3, -10]} receiveShadow>
        <boxGeometry args={[30, 6, 0.1]} />
        <meshStandardMaterial color="#F0F0F0" roughness={0.5} metalness={0.2} />
      </mesh>

      {/* Left wall with windows */}
      <mesh position={[-15, 3, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <boxGeometry args={[20, 6, 0.1]} />
        <meshStandardMaterial color="#87CEEB" roughness={0.2} metalness={0.3} emissive="#B0E0E6" emissiveIntensity={0.1} />
      </mesh>

      {/* Right wall */}
      <mesh position={[15, 3, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <boxGeometry args={[20, 6, 0.1]} />
        <meshStandardMaterial color="#DCDCDC" roughness={0.5} metalness={0.2} />
      </mesh>

      {/* CEILING - modern with lights */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 6, 0]} receiveShadow>
        <planeGeometry args={[40, 40]} />
        <meshStandardMaterial color="#F5F5F5" roughness={0.8} metalness={0.1} />
      </mesh>

      {/* Large departure board */}
      <group position={[0, 4.5, -9.9]}>
        <mesh castShadow>
          <boxGeometry args={[6, 1.5, 0.1]} />
          <meshStandardMaterial color="#1a1a2e" roughness={0.3} />
        </mesh>
        {/* Flight info text placeholders */}
        {[-0.4, 0, 0.4].map((y, i) => (
          <mesh key={i} position={[0, y, 0.06]}>
            <planeGeometry args={[5.5, 0.3]} />
            <meshStandardMaterial color="#00FF00" emissive="#00FF00" emissiveIntensity={0.3} />
          </mesh>
        ))}
      </group>

      {/* CHECK-IN COUNTERS */}
      <group position={[-8, 0, -6]}>
        {/* Counter desk */}
        <mesh position={[0, 0.6, 0]} castShadow>
          <boxGeometry args={[8, 1.2, 1.5]} />
          <meshStandardMaterial color="#2F4F4F" roughness={0.4} metalness={0.3} />
        </mesh>
        {/* Counter top */}
        <mesh position={[0, 1.22, 0]} castShadow>
          <boxGeometry args={[8.2, 0.06, 1.7]} />
          <meshStandardMaterial color="#1C1C1C" roughness={0.2} metalness={0.5} />
        </mesh>
        {/* Computer screens */}
        {[-2.5, 0, 2.5].map((x, i) => (
          <group key={i} position={[x, 1.7, 0]}>
            <mesh castShadow>
              <boxGeometry args={[0.8, 0.5, 0.05]} />
              <meshStandardMaterial color="#333" roughness={0.3} metalness={0.5} />
            </mesh>
            <mesh position={[0, 0, -0.03]}>
              <planeGeometry args={[0.7, 0.4]} />
              <meshStandardMaterial color="#4169E1" emissive="#4169E1" emissiveIntensity={0.2} />
            </mesh>
          </group>
        ))}
        {/* Luggage belts */}
        <group position={[0, 0.1, -1.5]}>
          <mesh rotation={[0, 0, 0]} castShadow>
            <boxGeometry args={[6, 0.2, 0.8]} />
            <meshStandardMaterial color="#696969" roughness={0.6} metalness={0.2} />
          </mesh>
        </group>
      </group>

      {/* SECURITY CHECKPOINT */}
      <group position={[4, 0, -6]}>
        {/* Security desk */}
        <mesh position={[0, 0.5, 0]} castShadow>
          <boxGeometry args={[3, 1, 1]} />
          <meshStandardMaterial color="#808080" roughness={0.5} metalness={0.3} />
        </mesh>
        {/* X-ray machine */}
        <mesh position={[0, 0.8, -2]} castShadow>
          <boxGeometry args={[1.5, 1.2, 0.5]} />
          <meshStandardMaterial color="#A9A9A9" roughness={0.4} metalness={0.4} />
        </mesh>
        {/* Security tray area */}
        <mesh position={[0, 0.02, -1]} receiveShadow>
          <boxGeometry args={[2.5, 0.04, 1]} />
          <meshStandardMaterial color="#D3D3D3" roughness={0.3} metalness={0.2} />
        </mesh>
        {/* Barriers */}
        {[-1.5, 1.5].map((x, i) => (
          <mesh key={i} position={[x, 0.6, -0.5]}>
            <cylinderGeometry args={[0.03, 0.03, 1.2, 8]} />
            <meshStandardMaterial color="#333" metalness={0.6} roughness={0.3} />
          </mesh>
        ))}
      </group>

      {/* GATE AREA with seats */}
      <group position={[8, 0, 2]}>
        {/* Gate sign */}
        <mesh position={[0, 3.5, -5]}>
          <boxGeometry args={[2, 0.6, 0.1]} />
          <meshStandardMaterial color="#DC143C" emissive="#DC143C" emissiveIntensity={0.2} />
        </mesh>

        {/* Waiting area seats */}
        <AirportSeats position={[0, 0, 0]} />
      </group>

      {/* INFORMATION DESK */}
      <group position={[-12, 0, 0]}>
        <mesh position={[0, 0.6, 0]} castShadow>
          <cylinderGeometry args={[1.2, 1.2, 1.2, 24]} />
          <meshStandardMaterial color="#4682B4" roughness={0.4} metalness={0.3} />
        </mesh>
        <mesh position={[0, 1.25, 0]} castShadow>
          <cylinderGeometry args={[1.3, 1.2, 0.1, 24]} />
          <meshStandardMaterial color="#5F9EA0" roughness={0.3} metalness={0.4} />
        </mesh>
      </group>

      {/* Departure lounge area with airplane visible through window */}
      <group position={[0, 2, -9.5]}>
        {/* Window frame */}
        <mesh>
          <boxGeometry args={[12, 3, 0.1]} />
          <meshStandardMaterial color="#708090" metalness={0.5} roughness={0.3} />
        </mesh>
        {/* Sky */}
        <mesh position={[0, 0, 0.1]}>
          <planeGeometry args={[11, 2.5]} />
          <meshStandardMaterial color="#87CEEB" emissive="#87CEEB" emissiveIntensity={0.1} />
        </mesh>
      </group>

      {/* Luggage carts scattered */}
      {[[-10, 0, 2], [-8, 0, 3], [10, 0, -1]].map(([x, y, z], i) => (
        <group key={i} position={[x, y, z]}>
          <mesh position={[0, 0.2, 0]} castShadow>
            <boxGeometry args={[0.6, 0.4, 0.8]} />
            <meshStandardMaterial color="#2F4F4F" roughness={0.5} />
          </mesh>
          {[[-0.25, 0, 0.45], [0.25, 0, 0.45], [-0.25, 0, -0.45], [0.25, 0, -0.45]].map((pos, j) => (
            <mesh key={j} position={pos as [number, number, number]} castShadow>
              <cylinderGeometry args={[0.03, 0.03, 0.2, 8]} />
              <meshStandardMaterial color="#333" metalness={0.6} />
            </mesh>
          ))}
        </group>
      ))}

      {/* Potted plants */}
      {[[-14, 0, 3], [14, 0, 3], [-14, 0, -3], [14, 0, -3]].map(([x, y, z], i) => (
        <group key={i} position={[x, y, z]}>
          <mesh position={[0, 0.25, 0]} castShadow>
            <cylinderGeometry args={[0.4, 0.3, 0.5, 12]} />
            <meshStandardMaterial color="#8B4513" roughness={0.8} />
          </mesh>
          <mesh position={[0, 0.7, 0]} castShadow>
            <sphereGeometry args={[0.4, 8, 8]} />
            <meshStandardMaterial color="#228B22" roughness={0.8} />
          </mesh>
        </group>
      ))}

      {/* Ceiling lights */}
      {[[-10, 0, -5], [0, 0, -5], [10, 0, -5], [-10, 0, 5], [0, 0, 5], [10, 0, 5]].map(([x, y, z], i) => (
        <group key={i} position={[x, 5.8, z]}>
          <mesh>
            <boxGeometry args={[1.5, 0.1, 0.3]} />
            <meshStandardMaterial color="#FFF" emissive="#FFF" emissiveIntensity={0.5} />
          </mesh>
          <pointLight intensity={0.5} color="#FFF" distance={8} decay={2} position={[0, -0.5, 0]} />
        </group>
      ))}

      {/* Digital signage */}
      <group position={[0, 4, -9.9]}>
        <mesh>
          <boxGeometry args={[4, 1, 0.05]} />
          <meshStandardMaterial color="#1a1a2e" />
        </mesh>
      </group>
    </group>
  );
}

// ============== Airport Seats Component ==============
function AirportSeats({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Row 1 */}
      <AirportSeat position={[-1, 0, 0]} />
      <AirportSeat position={[0, 0, 0]} />
      <AirportSeat position={[1, 0, 0]} />
      
      {/* Row 2 */}
      <AirportSeat position={[-1, 0, -1.5]} />
      <AirportSeat position={[0, 0, -1.5]} />
      <AirportSeat position={[1, 0, -1.5]} />
      
      {/* Row 3 */}
      <AirportSeat position={[-1, 0, -3]} />
      <AirportSeat position={[0, 0, -3]} />
      <AirportSeat position={[1, 0, -3]} />
    </group>
  );
}

function AirportSeat({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Seat base */}
      <mesh position={[0, 0.25, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.5, 0.08, 0.5]} />
        <meshStandardMaterial color="#1C1C1C" roughness={0.8} />
      </mesh>
      {/* Seat back */}
      <mesh position={[0, 0.55, -0.22]} castShadow>
        <boxGeometry args={[0.5, 0.5, 0.06]} />
        <meshStandardMaterial color="#1C1C1C" roughness={0.8} />
      </mesh>
      {/* Armrests */}
      <mesh position={[-0.25, 0.4, 0]} castShadow>
        <boxGeometry args={[0.05, 0.15, 0.5]} />
        <meshStandardMaterial color="#333" roughness={0.6} />
      </mesh>
      <mesh position={[0.25, 0.4, 0]} castShadow>
        <boxGeometry args={[0.05, 0.15, 0.5]} />
        <meshStandardMaterial color="#333" roughness={0.6} />
      </mesh>
      {/* Legs */}
      {[[-0.2, 0.12, 0.2], [0.2, 0.12, 0.2], [-0.2, 0.12, -0.2], [0.2, 0.12, -0.2]].map((pos, i) => (
        <mesh key={i} position={pos as [number, number, number]} castShadow>
          <cylinderGeometry args={[0.02, 0.02, 0.24, 8]} />
          <meshStandardMaterial color="#333" metalness={0.6} />
        </mesh>
      ))}
    </group>
  );
}

export default AirportEnvironment;