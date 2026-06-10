'use client';

import { useState, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export function StoreEnvironment() {
  return (
    <group>
      {/* FLOOR - clean tile */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[25, 25]} />
        <meshStandardMaterial color="#F5F5F5" roughness={0.4} />
      </mesh>

      {/* Floor tiles pattern */}
      {Array.from({ length: 5 }).map((_, i) =>
        Array.from({ length: 5 }).map((_, j) => (
          <mesh key={`${i}-${j}`} rotation={[-Math.PI / 2, 0, 0]} position={[-10 + i * 5, 0.002, -10 + j * 5]} receiveShadow>
            <planeGeometry args={[4.9, 4.9]} />
            <meshStandardMaterial color={(i + j) % 2 === 0 ? "#FAFAFA" : "#E8E8E8"} roughness={0.4} />
          </mesh>
        ))
      )}

      {/* WALLS */}
      {/* Back wall */}
      <mesh position={[0, 2.5, -8]}>
        <boxGeometry args={[20, 5, 0.1]} />
        <meshStandardMaterial color="#FFFFFF" roughness={0.5} />
      </mesh>

      {/* Left wall with display window */}
      <mesh position={[-10, 2.5, 0]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[16, 5, 0.1]} />
        <meshStandardMaterial color="#F8F8F8" roughness={0.5} />
      </mesh>

      {/* Right wall */}
      <mesh position={[10, 2.5, 0]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[16, 5, 0.1]} />
        <meshStandardMaterial color="#F8F8F8" roughness={0.5} />
      </mesh>

      {/* CEILING */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 5, 0]}>
        <planeGeometry args={[25, 25]} />
        <meshStandardMaterial color="#FFFFFF" roughness={0.8} />
      </mesh>

      {/* STORE SIGN */}
      <group position={[0, 4.2, -7.9]}>
        <mesh>
          <boxGeometry args={[4, 0.6, 0.1]} />
          <meshStandardMaterial color="#FF69B4" emissive="#FF69B4" emissiveIntensity={0.1} />
        </mesh>
        <mesh position={[0, 0, 0.06]}>
          <planeGeometry args={[3.8, 0.4]} />
          <meshStandardMaterial color="#FFFFFF" />
        </mesh>
      </group>

      {/* DISPLAY WINDOW */}
      <group position={[-9.9, 2.5, -2]}>
        <mesh>
          <boxGeometry args={[0.05, 3, 5]} />
          <meshStandardMaterial color="#87CEEB" roughness={0.2} metalness={0.3} emissive="#B0E0E6" emissiveIntensity={0.1} />
        </mesh>
      </group>

      {/* CLOTHING RACKS */}
      <StoreRack position={[-5, 0, -5]} rotation={0.3} />
      <StoreRack position={[0, 0, -5]} rotation={-0.2} />
      <StoreRack position={[5, 0, -5]} rotation={0.1} />

      {/* SHELVES with accessories */}
      <ShelfUnit position={[-7, 0, 2]} />
      <ShelfUnit position={[7, 0, 2]} />

      {/* DISPLAY TABLE with shoes */}
      <DisplayTable position={[3, 0, 0]} />
      <DisplayTable position={[-3, 0, 0]} />

      {/* CHECKOUT COUNTER */}
      <CheckoutCounter position={[0, 0, -7]} />

      {/* FITTING ROOMS */}
      <FittingRoom position={[7, 0, -4]} />

      {/* DISPLAY MANNEQUINS */}
      <Mannequin position={[-8, 0, -2]} />
      <Mannequin position={[-8, 0, -4]} />
      <Mannequin position={[8, 0, 0]} />

      {/* SHOPPING BASKETS */}
      {[0, 1, 2, 3].map((i) => (
        <group key={i} position={[-9, 0.15, 5 - i * 0.8]}>
          <mesh>
            <cylinderGeometry args={[0.2, 0.18, 0.3, 8]} />
            <meshStandardMaterial color="#C0C0C0" metalness={0.5} roughness={0.4} />
          </mesh>
        </group>
      ))}

      {/* PRICE TAGS visible */}
      {[-5, 0, 5].map((x, i) => (
        <group key={i} position={[x, 1.2, -4.8]}>
          <mesh>
            <boxGeometry args={[0.3, 0.4, 0.02]} />
            <meshStandardMaterial color="#FF6347" emissive="#FF6347" emissiveIntensity={0.1} />
          </mesh>
        </group>
      ))}

      {/* DRESSING MIRROR */}
      <group position={[7, 1.2, -6.5]}>
        <mesh>
          <boxGeometry args={[0.8, 1.5, 0.05]} />
          <meshStandardMaterial color="#E0E0E0" metalness={0.3} />
        </mesh>
        <mesh position={[0, 0, 0.03]}>
          <planeGeometry args={[0.7, 1.4]} />
          <meshStandardMaterial color="#DCDCDC" metalness={0.9} roughness={0.1} />
        </mesh>
      </group>

      {/* STORE ENTRANCE */}
      <group position={[0, 0, 7]}>
        {/* Door frame */}
        <mesh>
          <boxGeometry args={[2.2, 3, 0.1]} />
          <meshStandardMaterial color="#A9A9A9" metalness={0.5} roughness={0.4} />
        </mesh>
        {/* Glass door */}
        <mesh position={[0, 0, 0.05]}>
          <boxGeometry args={[1.8, 2.8, 0.05]} />
          <meshStandardMaterial color="#87CEEB" roughness={0.1} metalness={0.2} emissive="#B0E0E6" emissiveIntensity={0.05} />
        </mesh>
        {/* Handle */}
        <mesh position={[0.6, 0, 0.1]}>
          <cylinderGeometry args={[0.03, 0.03, 0.3, 8]} />
          <meshStandardMaterial color="#808080" metalness={0.6} />
        </mesh>
      </group>

      {/* STORE LIGHTING */}
      {[[-6, 0, -3], [0, 0, -3], [6, 0, -3], [-6, 0, 2], [0, 0, 2], [6, 0, 2]].map(([x, y, z], i) => (
        <group key={i} position={[x, 4.9, z]}>
          <mesh>
            <cylinderGeometry args={[0.15, 0.2, 0.1, 16]} />
            <meshStandardMaterial color="#FFFFFF" emissive="#FFFFFF" emissiveIntensity={0.3} />
          </mesh>
          <pointLight intensity={0.4} color="#FFF" distance={6} decay={2} position={[0, -0.5, 0]} />
        </group>
      ))}

      {/* WALL MIRRORS */}
      {[[-9.9, 2.5, -6], [-9.9, 2.5, 3]].map(([x, y, z], i) => (
        <group key={i} position={[x, y, z]}>
          <mesh>
            <boxGeometry args={[0.05, 1.5, 1.5]} />
            <meshStandardMaterial color="#E0E0E0" metalness={0.3} />
          </mesh>
          <mesh position={[0.03, 0, 0]}>
            <planeGeometry args={[1.4, 1.4]} />
            <meshStandardMaterial color="#DCDCDC" metalness={0.9} roughness={0.1} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

// ============== Store Rack Component ==============
function StoreRack({ position, rotation }: { position: [number, number, number]; rotation: number }) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {/* Vertical poles */}
      {[-0.8, 0.8].map((x, i) => (
        <mesh key={i} position={[x, 1.2, 0]} castShadow>
          <cylinderGeometry args={[0.03, 0.03, 2.4, 8]} />
          <meshStandardMaterial color="#808080" metalness={0.6} roughness={0.4} />
        </mesh>
      ))}
      
      {/* Horizontal bar */}
      <mesh position={[0, 1.8, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.02, 0.02, 1.7, 8]} />
        <meshStandardMaterial color="#808080" metalness={0.6} roughness={0.4} />
      </mesh>
      
      {/* Base */}
      <mesh position={[0, 0.05, 0]} castShadow>
        <boxGeometry args={[1.8, 0.1, 0.5]} />
        <meshStandardMaterial color="#696969" roughness={0.6} />
      </mesh>

      {/* Hangers with clothes */}
      {[-0.6, -0.2, 0.2, 0.6].map((x, i) => (
        <group key={i} position={[x, 1.7, 0]}>
          {/* Hanger */}
          <mesh position={[0, 0.1, 0]}>
            <boxGeometry args={[0.08, 0.02, 0.3]} />
            <meshStandardMaterial color="#A9A9A9" metalness={0.4} />
          </mesh>
          {/* Clothing item */}
          <mesh position={[0, -0.2, 0]} castShadow>
            <boxGeometry args={[0.35, 0.6, 0.05]} />
            <meshStandardMaterial color={['#FF69B4', '#4169E1', '#32CD32', '#FF6347'][i]} roughness={0.8} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

// ============== Shelf Unit Component ==============
function ShelfUnit({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Back panel */}
      <mesh position={[0, 1, 0]} castShadow>
        <boxGeometry args={[1.5, 2, 0.1]} />
        <meshStandardMaterial color="#F5F5DC" roughness={0.8} />
      </mesh>
      
      {/* Shelves */}
      {[0.3, 0.9, 1.5].map((y, i) => (
        <mesh key={i} position={[0, y, 0]} castShadow>
          <boxGeometry args={[1.4, 0.03, 0.4]} />
          <meshStandardMaterial color="#DEB887" roughness={0.6} />
        </mesh>
      ))}
      
      {/* Accessories on shelves */}
      {[0.4, 1.0, 1.6].map((y, i) => (
        <group key={i}>
          {[-0.3, 0, 0.3].map((x, j) => (
            <mesh key={j} position={[x, y + 0.08, 0]} castShadow>
              <sphereGeometry args={[0.06, 8, 8]} />
              <meshStandardMaterial color={['#FFD700', '#C0C0C0', '#CD853F'][j]} metalness={0.5} roughness={0.3} />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
}

// ============== Display Table Component ==============
function DisplayTable({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Table top */}
      <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
        <boxGeometry args={[2, 0.08, 1.5]} />
        <meshStandardMaterial color="#8B4513" roughness={0.5} />
      </mesh>
      
      {/* Legs */}
      {[[-0.85, 0.25, 0.6], [0.85, 0.25, 0.6], [-0.85, 0.25, -0.6], [0.85, 0.25, -0.6]].map((pos, i) => (
        <mesh key={i} position={pos as [number, number, number]} castShadow>
          <boxGeometry args={[0.08, 0.5, 0.08]} />
          <meshStandardMaterial color="#654321" roughness={0.6} />
        </mesh>
      ))}
      
      {/* Shoes on table */}
      {[-0.5, 0, 0.5].map((x, i) => (
        <group key={i} position={[x, 0.58, 0]}>
          <mesh castShadow>
            <boxGeometry args={[0.35, 0.1, 0.2]} />
            <meshStandardMaterial color={['#000000', '#8B4513', '#000000'][i]} roughness={0.6} />
          </mesh>
          <mesh position={[0, 0.1, -0.05]} castShadow>
            <boxGeometry args={[0.3, 0.15, 0.1]} />
            <meshStandardMaterial color={['#000000', '#8B4513', '#000000'][i]} roughness={0.6} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

// ============== Checkout Counter Component ==============
function CheckoutCounter({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Counter desk */}
      <mesh position={[0, 0.6, 0]} castShadow>
        <boxGeometry args={[3, 1.2, 1]} />
        <meshStandardMaterial color="#696969" roughness={0.5} metalness={0.2} />
      </mesh>
      
      {/* Counter top */}
      <mesh position={[0, 1.22, 0]} castShadow>
        <boxGeometry args={[3.2, 0.06, 1.2]} />
        <meshStandardMaterial color="#2F2F2F" roughness={0.3} metalness={0.3} />
      </mesh>
      
      {/* Cash register */}
      <mesh position={[0, 1.4, 0]} castShadow>
        <boxGeometry args={[0.5, 0.3, 0.4]} />
        <meshStandardMaterial color="#333" roughness={0.4} metalness={0.3} />
      </mesh>
      <mesh position={[0, 1.5, 0.21]}>
        <planeGeometry args={[0.4, 0.2]} />
        <meshStandardMaterial color="#4169E1" emissive="#4169E1" emissiveIntensity={0.2} />
      </mesh>
      
      {/* Shopping bags */}
      {[-0.8, 0.8].map((x, i) => (
        <group key={i} position={[x, 0.2, 0.3]}>
          <mesh castShadow>
            <boxGeometry args={[0.3, 0.4, 0.2]} />
            <meshStandardMaterial color={i === 0 ? '#FFFFFF' : '#8B4513'} roughness={0.8} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

// ============== Fitting Room Component ==============
function FittingRoom({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Frame */}
      <mesh position={[0, 1.5, 0]}>
        <boxGeometry args={[1.5, 3, 0.05]} />
        <meshStandardMaterial color="#A9A9A9" metalness={0.5} roughness={0.4} />
      </mesh>
      
      {/* Curtain */}
      <mesh position={[0, 1.5, 0.1]}>
        <boxGeometry args={[1.3, 2.8, 0.02]} />
        <meshStandardMaterial color="#FF69B4" roughness={0.9} />
      </mesh>
      
      {/* Curtain rod */}
      <mesh position={[0, 2.9, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.02, 0.02, 1.6, 8]} />
        <meshStandardMaterial color="#808080" metalness={0.6} />
      </mesh>
      
      {/* Bench */}
      <mesh position={[0, 0.25, -0.3]}>
        <boxGeometry args={[0.8, 0.05, 0.4]} />
        <meshStandardMaterial color="#DEB887" roughness={0.7} />
      </mesh>
    </group>
  );
}

// ============== Mannequin Component ==============
function Mannequin({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Stand */}
      <mesh position={[0, 0.1, 0]}>
        <cylinderGeometry args={[0.15, 0.2, 0.2, 12]} />
        <meshStandardMaterial color="#333" metalness={0.5} roughness={0.4} />
      </mesh>
      <mesh position={[0, 0.6, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 1.2, 8]} />
        <meshStandardMaterial color="#333" metalness={0.5} />
      </mesh>
      
      {/* Body */}
      <mesh position={[0, 1, 0]} castShadow>
        <cylinderGeometry args={[0.15, 0.12, 0.6, 12]} />
        <meshStandardMaterial color="#F5DEB3" roughness={0.8} />
      </mesh>
      
      {/* Head */}
      <mesh position={[0, 1.45, 0]} castShadow>
        <sphereGeometry args={[0.12, 12, 12]} />
        <meshStandardMaterial color="#F5DEB3" roughness={0.8} />
      </mesh>
      
      {/* Dress */}
      <mesh position={[0, 0.6, 0]} castShadow>
        <cylinderGeometry args={[0.25, 0.35, 0.8, 12]} />
        <meshStandardMaterial color="#FF69B4" roughness={0.8} />
      </mesh>
    </group>
  );
}

export default StoreEnvironment;