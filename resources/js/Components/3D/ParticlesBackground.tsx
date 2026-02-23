import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export default function ParticlesBackground() {
    const count = 800; // Giảm từ 3000 xuống 800 hạt để bớt rối mắt
    const mesh = useRef<THREE.InstancedMesh>(null);
    const light = useRef<THREE.PointLight>(null);

    // Create particles data
    const particles = useMemo(() => {
        const temp = [];
        for (let i = 0; i < count; i++) {
            const time = Math.random() * 100;
            const factor = Math.random() * 100 + 20;
            const speed = (Math.random() * 0.01 + 0.005) * 0.3; // Giảm tốc độ đi 3 lần để bay chậm lững lờ
            const x = Math.random() * 200 - 100;
            const y = Math.random() * 200 - 100;
            const z = Math.random() * 200 - 100;
            temp.push({ time, factor, speed, x, y, z });
        }
        return temp;
    }, [count]);

    const dummy = useMemo(() => new THREE.Object3D(), []);

    useFrame((state) => {
        particles.forEach((particle, i) => {
            let { t, factor, speed, x, y, z } = particle as any;

            // Calculate movement
            t = particle.time += speed;
            const a = Math.cos(t) + Math.sin(t * 1) / 10;
            const b = Math.sin(t) + Math.cos(t * 2) / 10;
            const s = Math.cos(t);

            // Update dummy object
            dummy.position.set(
                (particle.x / 4) + Math.cos((t / 10) * factor) + (Math.sin(t * 1) * factor) / 10,
                (particle.y / 4) + Math.sin((t / 10) * factor) + (Math.cos(t * 2) * factor) / 10,
                (particle.z / 4) + Math.cos((t / 10) * factor) + (Math.sin(t * 3) * factor) / 10
            );

            dummy.scale.set(s, s, s);
            dummy.rotation.set(s * 5, s * 5, s * 5);
            dummy.updateMatrix();

            // Apply matrix to instanced mesh
            if (mesh.current) {
                mesh.current.setMatrixAt(i, dummy.matrix);
            }
        });

        if (mesh.current) {
            mesh.current.instanceMatrix.needsUpdate = true;
            // Slight rotation to the whole group
            mesh.current.rotation.y = state.clock.getElapsedTime() * 0.05;
            mesh.current.rotation.x = state.clock.getElapsedTime() * 0.02;
        }

        // Move light with mouse
        if (light.current) {
            light.current.position.set(
                (state.pointer.x * state.viewport.width) / 2,
                (state.pointer.y * state.viewport.height) / 2,
                10
            );
        }
    });

    return (
        <>
            <pointLight ref={light} distance={40} intensity={4} color="#d97706" /> {/* Giảm sáng pointlight */}
            <ambientLight intensity={0.2} /> {/* Giảm chói nền */}
            <instancedMesh ref={mesh} args={[undefined, undefined, count]}>
                <dodecahedronGeometry args={[0.2, 0]} />
                <meshStandardMaterial
                    color="#fcd34d"
                    roughness={0.2}
                    metalness={0.8}
                    emissive="#92400e" // Màu tối hơn
                    emissiveIntensity={0.1} // Bớt phát sáng chói lóa
                />
            </instancedMesh>
        </>
    );
}
