import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

function GradientSphere({ position, color, scale, speed }: {
    position: [number, number, number];
    color: string;
    scale: number;
    speed: number;
}) {
    const mesh = useRef<THREE.Mesh>(null);
    const initialY = position[1];

    useFrame((state) => {
        if (!mesh.current) return;
        const t = state.clock.getElapsedTime();
        // Gentle floating motion
        mesh.current.position.y = initialY + Math.sin(t * speed) * 0.3;
        mesh.current.position.x = position[0] + Math.cos(t * speed * 0.7) * 0.15;
    });

    return (
        <mesh ref={mesh} position={position} scale={scale}>
            <sphereGeometry args={[1, 32, 32]} />
            <meshStandardMaterial
                color={color}
                roughness={0.9}
                metalness={0.1}
                transparent
                opacity={0.35}
            />
        </mesh>
    );
}

export default function AnimatedSpheres() {
    const spheres = useMemo(() => [
        { position: [-3, 1.5, -2] as [number, number, number], color: '#d97706', scale: 2.5, speed: 0.3 },
        { position: [3.5, -0.5, -3] as [number, number, number], color: '#059669', scale: 2, speed: 0.25 },
        { position: [0, -2, -1.5] as [number, number, number], color: '#b45309', scale: 1.8, speed: 0.35 },
        { position: [-2, -1, -4] as [number, number, number], color: '#0284c7', scale: 3, speed: 0.2 },
        { position: [2, 2.5, -5] as [number, number, number], color: '#7c3aed', scale: 2.2, speed: 0.28 },
    ], []);

    return (
        <>
            <ambientLight intensity={0.15} />
            <pointLight position={[5, 5, 5]} intensity={0.4} color="#fbbf24" />
            <pointLight position={[-5, -3, 3]} intensity={0.3} color="#059669" />

            {spheres.map((s, i) => (
                <GradientSphere key={i} {...s} />
            ))}
        </>
    );
}
