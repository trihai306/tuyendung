import { Canvas } from '@react-three/fiber';
import { PerspectiveCamera } from '@react-three/drei';
import { Suspense } from 'react';
import AnimatedSpheres from './AnimatedSpheres';

export default function Scene() {
    return (
        <div className="absolute inset-0 z-0">
            <Canvas dpr={[1, 1.5]}>
                <PerspectiveCamera makeDefault position={[0, 0, 6]} fov={60} />
                <color attach="background" args={['#0c0a09']} />

                <Suspense fallback={null}>
                    <AnimatedSpheres />
                </Suspense>
            </Canvas>

            {/* Soft gradient overlays for blending */}
            <div className="absolute inset-0 z-10 bg-gradient-to-b from-transparent via-transparent to-stone-950 pointer-events-none" />
            <div className="absolute inset-0 z-10 bg-[radial-gradient(ellipse_at_top,transparent_0%,rgba(12,10,9,0.6)_70%)] pointer-events-none" />
        </div>
    );
}
