import { useRef } from 'react';
import * as THREE from 'three';

interface CandleFlickerProps {
  position?: [number, number, number];
}

export function CandleFlicker({ position = [0, 0.77, 0] }: CandleFlickerProps) {
  const flameRef = useRef<THREE.Mesh>(null);
  const lightRef = useRef<THREE.PointLight>(null);

  // Candle will be animated via useFrame in the parent component
  // For now, use simple static animation via CSS-like effect

  return (
    <group position={position}>
      {/* Candle holder */}
      <mesh castShadow>
        <cylinderGeometry args={[0.04, 0.05, 0.25, 8]} />
        <meshStandardMaterial color="#FFF8DC" roughness={0.6} />
      </mesh>
      {/* Flame */}
      <mesh position={[0, 0.18, 0]}>
        <coneGeometry args={[0.03, 0.1, 8]} />
        <meshStandardMaterial color="#FFA500" emissive="#FF6600" emissiveIntensity={2} transparent opacity={0.9} />
      </mesh>
      {/* Point light for candle glow */}
      <pointLight ref={lightRef} color="#FF8C42" distance={2.5} decay={2} position={[0, 0.2, 0]} />
    </group>
  );
}
