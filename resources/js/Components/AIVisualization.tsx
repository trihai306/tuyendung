import { Canvas, useFrame } from '@react-three/fiber';
import { useRef, useMemo, useState, useEffect } from 'react';
import * as THREE from 'three';

// Neural network node
function NeuralNode({ position, color, scale = 1, pulseDelay = 0 }: {
    position: [number, number, number];
    color: string;
    scale?: number;
    pulseDelay?: number;
}) {
    const meshRef = useRef<THREE.Mesh>(null);
    const glowRef = useRef<THREE.Mesh>(null);

    useFrame(({ clock }) => {
        const t = clock.getElapsedTime() + pulseDelay;
        if (meshRef.current) {
            meshRef.current.scale.setScalar(scale * (1 + 0.15 * Math.sin(t * 1.5)));
        }
        if (glowRef.current) {
            const glowScale = scale * (1.8 + 0.4 * Math.sin(t * 1.2));
            glowRef.current.scale.setScalar(glowScale);
            (glowRef.current.material as THREE.MeshBasicMaterial).opacity = 0.15 + 0.08 * Math.sin(t * 1.5);
        }
    });

    return (
        <group position={position}>
            {/* Core sphere */}
            <mesh ref={meshRef}>
                <sphereGeometry args={[0.08, 16, 16]} />
                <meshStandardMaterial
                    color={color}
                    emissive={color}
                    emissiveIntensity={0.8}
                    roughness={0.2}
                    metalness={0.5}
                />
            </mesh>
            {/* Glow sphere */}
            <mesh ref={glowRef}>
                <sphereGeometry args={[0.08, 16, 16]} />
                <meshBasicMaterial
                    color={color}
                    transparent
                    opacity={0.15}
                />
            </mesh>
        </group>
    );
}

// Connection line between nodes with data flow particles
function NeuralConnection({ start, end, color, speed = 1 }: {
    start: [number, number, number];
    end: [number, number, number];
    color: string;
    speed?: number;
}) {
    const groupRef = useRef<THREE.Group>(null);
    const particleRef = useRef<THREE.Mesh>(null);

    // Create line object manually to avoid JSX <line> SVG type collision
    useEffect(() => {
        if (!groupRef.current) return;
        const s = new THREE.Vector3(...start);
        const e = new THREE.Vector3(...end);
        const geo = new THREE.BufferGeometry().setFromPoints([s, e]);
        const mat = new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.12 });
        const lineObj = new THREE.Line(geo, mat);
        groupRef.current.add(lineObj);
        return () => {
            groupRef.current?.remove(lineObj);
            geo.dispose();
            mat.dispose();
        };
    }, [start, end, color]);

    useFrame(({ clock }) => {
        if (particleRef.current) {
            const t = ((clock.getElapsedTime() * speed * 0.3) % 1);
            const s = new THREE.Vector3(...start);
            const e = new THREE.Vector3(...end);
            particleRef.current.position.lerpVectors(s, e, t);
            (particleRef.current.material as THREE.MeshBasicMaterial).opacity = Math.sin(t * Math.PI) * 0.8;
        }
    });

    return (
        <group ref={groupRef}>
            {/* Traveling data particle */}
            <mesh ref={particleRef}>
                <sphereGeometry args={[0.035, 8, 8]} />
                <meshBasicMaterial color={color} transparent opacity={0.6} />
            </mesh>
        </group>
    );
}

// Floating orbital ring
function OrbitalRing({ radius, color, rotationSpeed, tilt }: {
    radius: number;
    color: string;
    rotationSpeed: number;
    tilt: [number, number, number];
}) {
    const ringRef = useRef<THREE.Mesh>(null);

    useFrame(({ clock }) => {
        if (ringRef.current) {
            ringRef.current.rotation.z = clock.getElapsedTime() * rotationSpeed;
        }
    });

    return (
        <mesh ref={ringRef} rotation={tilt}>
            <torusGeometry args={[radius, 0.008, 8, 64]} />
            <meshBasicMaterial color={color} transparent opacity={0.2} />
        </mesh>
    );
}

// Central AI brain core
function AICore() {
    const coreRef = useRef<THREE.Mesh>(null);
    const outerRef = useRef<THREE.Mesh>(null);

    useFrame(({ clock }) => {
        const t = clock.getElapsedTime();
        if (coreRef.current) {
            coreRef.current.rotation.y = t * 0.3;
            coreRef.current.rotation.x = Math.sin(t * 0.2) * 0.1;
        }
        if (outerRef.current) {
            outerRef.current.rotation.y = -t * 0.15;
            outerRef.current.rotation.z = t * 0.1;
            (outerRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity =
                0.3 + 0.15 * Math.sin(t * 1.5);
        }
    });

    return (
        <group>
            {/* Inner core - icosahedron */}
            <mesh ref={coreRef}>
                <icosahedronGeometry args={[0.35, 1]} />
                <meshStandardMaterial
                    color="#8b5cf6"
                    emissive="#8b5cf6"
                    emissiveIntensity={0.6}
                    wireframe
                    transparent
                    opacity={0.7}
                />
            </mesh>
            {/* Outer shell */}
            <mesh ref={outerRef}>
                <icosahedronGeometry args={[0.5, 0]} />
                <meshStandardMaterial
                    color="#6366f1"
                    emissive="#6366f1"
                    emissiveIntensity={0.3}
                    wireframe
                    transparent
                    opacity={0.25}
                />
            </mesh>
        </group>
    );
}

// Floating data points around the scene
function FloatingDataPoints() {
    const groupRef = useRef<THREE.Group>(null);
    const count = 50;

    const particles = useMemo(() => {
        const positions = new Float32Array(count * 3);
        for (let i = 0; i < count; i++) {
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            const r = 2 + Math.random() * 1.5;
            positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
            positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
            positions[i * 3 + 2] = r * Math.cos(phi);
        }
        return positions;
    }, []);

    useFrame(({ clock }) => {
        if (groupRef.current) {
            groupRef.current.rotation.y = clock.getElapsedTime() * 0.05;
        }
    });

    return (
        <group ref={groupRef}>
            <points>
                <bufferGeometry>
                    <bufferAttribute
                        attach="attributes-position"
                        count={count}
                        array={particles}
                        itemSize={3}
                    />
                </bufferGeometry>
                <pointsMaterial
                    size={0.03}
                    color="#a78bfa"
                    transparent
                    opacity={0.5}
                    sizeAttenuation
                />
            </points>
        </group>
    );
}

// Main scene content
function AIScene() {
    // Neural network node positions (3 clusters for 3 services)
    const jobNodes: [number, number, number][] = useMemo(() => [
        [-1.5, 0.8, 0],
        [-1.8, 0.3, 0.3],
        [-1.2, 0.5, -0.2],
        [-1.6, 1.2, 0.1],
        [-1.0, 0.9, 0.4],
    ], []);

    const roomNodes: [number, number, number][] = useMemo(() => [
        [1.5, 0.8, 0],
        [1.8, 0.3, -0.3],
        [1.2, 0.5, 0.2],
        [1.6, 1.2, -0.1],
        [1.0, 0.9, -0.4],
    ], []);

    const transportNodes: [number, number, number][] = useMemo(() => [
        [0, -1.3, 0],
        [-0.4, -1.6, 0.3],
        [0.4, -1.6, -0.3],
        [0, -1.9, 0.2],
        [-0.3, -1.1, -0.2],
    ], []);

    return (
        <>
            {/* Lighting */}
            <ambientLight intensity={0.3} />
            <pointLight position={[0, 0, 3]} intensity={0.8} color="#8b5cf6" />
            <pointLight position={[-2, 1, 1]} intensity={0.4} color="#3b82f6" />
            <pointLight position={[2, 1, 1]} intensity={0.4} color="#10b981" />
            <pointLight position={[0, -2, 1]} intensity={0.4} color="#f59e0b" />

            {/* Central AI Core */}
            <AICore />

            {/* Orbital rings */}
            <OrbitalRing radius={1.0} color="#8b5cf6" rotationSpeed={0.2} tilt={[0.3, 0, 0]} />
            <OrbitalRing radius={1.4} color="#3b82f6" rotationSpeed={-0.15} tilt={[0.8, 0.5, 0]} />
            <OrbitalRing radius={1.8} color="#10b981" rotationSpeed={0.1} tilt={[1.2, 0.8, 0.3]} />

            {/* Job search cluster - Violet */}
            {jobNodes.map((pos, i) => (
                <NeuralNode key={`job-${i}`} position={pos} color="#8b5cf6" scale={0.8 + Math.random() * 0.4} pulseDelay={i * 0.5} />
            ))}

            {/* Room cluster - Emerald */}
            {roomNodes.map((pos, i) => (
                <NeuralNode key={`room-${i}`} position={pos} color="#10b981" scale={0.8 + Math.random() * 0.4} pulseDelay={i * 0.6} />
            ))}

            {/* Transport cluster - Amber */}
            {transportNodes.map((pos, i) => (
                <NeuralNode key={`transport-${i}`} position={pos} color="#f59e0b" scale={0.8 + Math.random() * 0.4} pulseDelay={i * 0.7} />
            ))}

            {/* Connections from core to clusters */}
            {jobNodes.map((pos, i) => (
                <NeuralConnection key={`conn-job-${i}`} start={[0, 0, 0]} end={pos} color="#8b5cf6" speed={0.8 + i * 0.2} />
            ))}
            {roomNodes.map((pos, i) => (
                <NeuralConnection key={`conn-room-${i}`} start={[0, 0, 0]} end={pos} color="#10b981" speed={0.9 + i * 0.15} />
            ))}
            {transportNodes.map((pos, i) => (
                <NeuralConnection key={`conn-transport-${i}`} start={[0, 0, 0]} end={pos} color="#f59e0b" speed={0.7 + i * 0.25} />
            ))}

            {/* Inter-cluster connections */}
            <NeuralConnection start={jobNodes[0]} end={roomNodes[0]} color="#6366f1" speed={0.5} />
            <NeuralConnection start={roomNodes[2]} end={transportNodes[0]} color="#14b8a6" speed={0.6} />
            <NeuralConnection start={transportNodes[1]} end={jobNodes[2]} color="#d97706" speed={0.55} />

            {/* Floating data points */}
            <FloatingDataPoints />
        </>
    );
}

export default function AIVisualization() {
    const [isLoaded, setIsLoaded] = useState(false);

    return (
        <div className="relative w-full h-[400px] md:h-[500px] lg:h-[550px]">
            {/* Noise/glow underlay */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-violet-500/[0.06] rounded-full blur-[100px]" />
                <div className="absolute left-1/4 top-1/3 w-64 h-64 bg-blue-500/[0.04] rounded-full blur-[80px]" />
                <div className="absolute right-1/4 bottom-1/3 w-56 h-56 bg-emerald-500/[0.04] rounded-full blur-[80px]" />
            </div>

            <Canvas
                camera={{ position: [0, 0, 4.5], fov: 45 }}
                dpr={[1, 1.5]}
                gl={{ antialias: true, alpha: true }}
                onCreated={() => setIsLoaded(true)}
                style={{ opacity: isLoaded ? 1 : 0, transition: 'opacity 1s ease-in-out' }}
            >
                <AIScene />
            </Canvas>

            {/* Labels overlay */}
            <div className="absolute inset-0 pointer-events-none">
                {/* Job label - top left */}
                <div className="absolute left-[8%] top-[18%] flex items-center gap-2 rounded-xl border border-violet-500/20 bg-stone-900/80 backdrop-blur-lg px-3 py-2 shadow-lg shadow-violet-900/10">
                    <div className="w-2 h-2 rounded-full bg-violet-400 animate-pulse" />
                    <span className="text-[10px] font-medium text-violet-300">Tìm việc</span>
                </div>

                {/* Room label - top right */}
                <div className="absolute right-[8%] top-[18%] flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-stone-900/80 backdrop-blur-lg px-3 py-2 shadow-lg shadow-emerald-900/10">
                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-[10px] font-medium text-emerald-300">Phòng trọ</span>
                </div>

                {/* Transport label - bottom center */}
                <div className="absolute left-1/2 -translate-x-1/2 bottom-[12%] flex items-center gap-2 rounded-xl border border-amber-500/20 bg-stone-900/80 backdrop-blur-lg px-3 py-2 shadow-lg shadow-amber-900/10">
                    <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                    <span className="text-[10px] font-medium text-amber-300">Đưa đón</span>
                </div>

                {/* Central AI label */}
                <div className="absolute left-1/2 -translate-x-1/2 top-[42%] flex items-center gap-2 rounded-xl border border-violet-500/15 bg-stone-900/60 backdrop-blur-lg px-3 py-1.5 shadow-lg">
                    <span className="text-[9px] font-bold bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent tracking-wider">AI ENGINE</span>
                </div>
            </div>
        </div>
    );
}
