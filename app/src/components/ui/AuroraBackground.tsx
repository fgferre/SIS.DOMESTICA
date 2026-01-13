import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere } from '@react-three/drei';
import * as THREE from 'three';
import { cn } from '@/utils/utils';

function MovingOrb({
  color,
  position,
  speed,
  scale,
}: {
  color: string;
  position: [number, number, number];
  speed: number;
  scale: number;
}) {
  const ref = useRef<THREE.Mesh>(null);
  const randomOffset = useRef(Math.random() * 100);

  useFrame(state => {
    if (ref.current) {
      const t = state.clock.getElapsedTime() * speed + randomOffset.current;
      // Organic movement pattern
      ref.current.position.x = position[0] + Math.sin(t) * 1.5;
      ref.current.position.y = position[1] + Math.cos(t * 0.8) * 1.5;
      // Gentle pulsing
      ref.current.scale.setScalar(scale + Math.sin(t * 2) * 0.2);
    }
  });

  return (
    <Sphere ref={ref} args={[1, 32, 32]} position={position} scale={scale}>
      <meshBasicMaterial color={color} transparent opacity={0.8} />
    </Sphere>
  );
}

export function AuroraBackground({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'absolute inset-0 overflow-hidden pointer-events-none',
        'bg-background-light dark:bg-background-dark',
        className
      )}
    >
      {/* 
        Technique: Render distinct distinct colored orbs, then heavily blur them with CSS.
        This ensures visible, strong colors that flow into each other.
      */}
      <Canvas className="absolute inset-0" camera={{ position: [0, 0, 10], fov: 75 }}>
        {/* Orb 1: Primary */}
        <MovingOrb
          color="#8b5cf6" // Violet-500
          position={[-2, 1, 0]}
          speed={0.4}
          scale={2.5}
        />

        {/* Orb 2: Secondary */}
        <MovingOrb
          color="#06b6d4" // Cyan-500
          position={[3, -1, -2]}
          speed={0.3}
          scale={3}
        />

        {/* Orb 3: Deep Indigo Anchor */}
        <MovingOrb
          color="#4f46e5" // Indigo-600
          position={[-1, -3, -1]}
          speed={0.2}
          scale={2.8}
        />
      </Canvas>

      {/* Heavy Blur Overlay to create the "Aurora/Glass" gradient look */}
      <div className="absolute inset-0 backdrop-blur-[80px] bg-white/20 dark:bg-black/30" />
    </div>
  );
}
