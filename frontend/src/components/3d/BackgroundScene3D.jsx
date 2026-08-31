import React, { useRef, useMemo, useEffect, useState, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useTheme } from '../../context/ThemeContext';
import { ErrorBoundary } from '../ui/ErrorBoundary';

/* ────────────────────────────────────────────────────────────────────────
   1. CONSTELACIÓN NEURONAL DE PARTÍCULAS
──────────────────────────────────────────────────────────────────────── */
const NeuralParticles = ({ isDark, scrollProgressRef, mouseRef }) => {
  const pointsRef = useRef();
  const count = 900;

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const radius = 5 + Math.random() * 14;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);

      pos[i3] = radius * Math.sin(phi) * Math.cos(theta);
      pos[i3 + 1] = (Math.random() - 0.5) * 22;
      pos[i3 + 2] = radius * Math.sin(phi) * Math.sin(theta);
    }
    return pos;
  }, [count]);

  useFrame((state, delta) => {
    if (!pointsRef.current) return;
    const progress = scrollProgressRef.current || 0;
    const mouse = mouseRef.current || { x: 0, y: 0 };

    pointsRef.current.rotation.y += delta * 0.04;
    pointsRef.current.rotation.x = THREE.MathUtils.lerp(
      pointsRef.current.rotation.x,
      progress * Math.PI * 0.6 + mouse.y * 0.12,
      0.06
    );
    pointsRef.current.rotation.z = THREE.MathUtils.lerp(
      pointsRef.current.rotation.z,
      mouse.x * 0.12,
      0.06
    );

    pointsRef.current.position.y = THREE.MathUtils.lerp(
      pointsRef.current.position.y,
      progress * 6 - 3,
      0.06
    );
  });

  const particleColor = isDark ? '#60a5fa' : '#2563eb';

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={isDark ? 0.055 : 0.042}
        color={particleColor}
        transparent
        opacity={isDark ? 0.65 : 0.45}
        sizeAttenuation
        blending={isDark ? THREE.AdditiveBlending : THREE.NormalBlending}
        depthWrite={false}
      />
    </points>
  );
};

/* ────────────────────────────────────────────────────────────────────────
   2. NÚCLEO QUANTUM CORPORATIVO (EL GRAN ICOSAEDRO WIREFRAME & ANILLOS)
──────────────────────────────────────────────────────────────────────── */
const QuantumCoreStructure = ({ isDark, scrollProgressRef, mouseRef }) => {
  const groupRef = useRef();
  const icosahedronRef = useRef();
  const innerSphereRef = useRef();
  const innerRingRef = useRef();
  const midRingRef = useRef();
  const outerRingRef = useRef();

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    const progress = scrollProgressRef.current || 0;
    const mouse = mouseRef.current || { x: 0, y: 0 };
    const t = state.clock.getElapsedTime();

    // Rotaciones cinéticas del núcleo
    if (icosahedronRef.current) {
      icosahedronRef.current.rotation.y = t * 0.4;
      icosahedronRef.current.rotation.x = Math.sin(t * 0.5) * 0.25;
    }
    if (innerSphereRef.current) {
      innerSphereRef.current.rotation.y = -t * 0.3;
    }
    if (innerRingRef.current) {
      innerRingRef.current.rotation.x = t * 0.35;
      innerRingRef.current.rotation.y = t * 0.25;
    }
    if (midRingRef.current) {
      midRingRef.current.rotation.y = -t * 0.28;
      midRingRef.current.rotation.z = t * 0.2;
    }
    if (outerRingRef.current) {
      outerRingRef.current.rotation.x = -t * 0.15;
      outerRingRef.current.rotation.z = -t * 0.3;
    }

    // Scrolltelling Dinámico Reversible:
    // Hero: En la posición exacta del círculo azul (x: 1.85, y: 0.25, z: 0)
    // Scroll abajo: Se traslada suavemente y rota en perspectiva 3D
    const targetX = THREE.MathUtils.lerp(1.85, -2.0, progress) + (mouse.x * 0.35);
    const targetY = THREE.MathUtils.lerp(0.25, -1.2, progress) + (mouse.y * 0.25);
    const targetZ = THREE.MathUtils.lerp(0, -1.8, progress);
    const targetScale = THREE.MathUtils.lerp(1.35, 0.95, progress);

    groupRef.current.position.x = THREE.MathUtils.lerp(groupRef.current.position.x, targetX, 0.06);
    groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, targetY, 0.06);
    groupRef.current.position.z = THREE.MathUtils.lerp(groupRef.current.position.z, targetZ, 0.06);

    const s = THREE.MathUtils.lerp(groupRef.current.scale.x, targetScale, 0.06);
    groupRef.current.scale.set(s, s, s);
  });

  const wireColor = isDark ? '#3b82f6' : '#2563eb';
  const ringColor = isDark ? '#1e293b' : '#94a3b8';
  const accentColor = isDark ? '#60a5fa' : '#3b82f6';
  const emissiveColor = isDark ? '#1d4ed8' : '#60a5fa';

  return (
    <group ref={groupRef} position={[1.85, 0.25, 0]} scale={1.35}>
      {/* 1. Icosaedro Wireframe Central */}
      <mesh ref={icosahedronRef}>
        <icosahedronGeometry args={[1.05, 1]} />
        <meshStandardMaterial
          wireframe
          color={wireColor}
          emissive={emissiveColor}
          emissiveIntensity={isDark ? 0.5 : 0.3}
          roughness={0.15}
          metalness={0.85}
        />
      </mesh>

      {/* 2. Núcleo Quantum Esférico Interno */}
      <mesh ref={innerSphereRef}>
        <sphereGeometry args={[0.5, 32, 32]} />
        <meshStandardMaterial
          color={accentColor}
          emissive={accentColor}
          emissiveIntensity={isDark ? 0.7 : 0.35}
          transparent
          opacity={isDark ? 0.45 : 0.3}
          roughness={0.1}
          metalness={0.9}
        />
      </mesh>

      {/* 3. Anillo Tecnológico Giroscópico Interno */}
      <mesh ref={innerRingRef}>
        <torusGeometry args={[1.5, 0.02, 16, 64]} />
        <meshStandardMaterial
          color={accentColor}
          emissive={accentColor}
          emissiveIntensity={isDark ? 0.55 : 0.25}
          roughness={0.2}
          metalness={0.8}
        />
      </mesh>

      {/* 4. Anillo Intermedio */}
      <mesh ref={midRingRef}>
        <torusGeometry args={[1.95, 0.022, 16, 64]} />
        <meshStandardMaterial
          color={ringColor}
          wireframe={!isDark}
          roughness={0.35}
          metalness={0.7}
        />
      </mesh>

      {/* 5. Anillo Exterior */}
      <mesh ref={outerRingRef}>
        <torusGeometry args={[2.4, 0.016, 16, 80]} />
        <meshStandardMaterial
          color={isDark ? '#334155' : '#cbd5e1'}
          transparent
          opacity={0.65}
          roughness={0.5}
          metalness={0.5}
        />
      </mesh>
    </group>
  );
};

/* ────────────────────────────────────────────────────────────────────────
   3. ILUMINACIÓN REACTIVA & CONTROLADOR DE CÁMARA
──────────────────────────────────────────────────────────────────────── */
const SceneController = ({ isDark, scrollProgressRef, mouseRef }) => {
  const { camera } = useThree();

  useFrame(() => {
    const progress = scrollProgressRef.current || 0;
    const mouse = mouseRef.current || { x: 0, y: 0 };

    camera.position.x = THREE.MathUtils.lerp(camera.position.x, mouse.x * 0.3, 0.05);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, -progress * 1.6 + mouse.y * 0.2, 0.05);
    camera.lookAt(0, -progress * 0.8, 0);
  });

  return (
    <>
      <ambientLight intensity={isDark ? 0.55 : 0.95} color={isDark ? '#e0e7ff' : '#ffffff'} />
      <directionalLight
        position={[8, 10, 5]}
        intensity={isDark ? 1.5 : 1.2}
        color={isDark ? '#60a5fa' : '#3b82f6'}
      />
      <directionalLight
        position={[-8, -5, -4]}
        intensity={isDark ? 0.6 : 0.45}
        color={isDark ? '#818cf8' : '#93c5fd'}
      />
      <pointLight
        position={[0, 1, 3]}
        intensity={isDark ? 1.4 : 0.9}
        color={isDark ? '#38bdf8' : '#2563eb'}
        distance={12}
      />
    </>
  );
};

/* ────────────────────────────────────────────────────────────────────────
   4. CONTENEDOR 3D PROTEGIDO
──────────────────────────────────────────────────────────────────────── */
export const BackgroundScene3D = () => {
  const { isDark } = useTheme();
  const scrollProgressRef = useRef(0);
  const mouseRef = useRef({ x: 0, y: 0 });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        scrollProgressRef.current = Math.min(Math.max(window.scrollY / totalHeight, 0), 1);
      }
    };

    const handleMouseMove = (e) => {
      mouseRef.current = {
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: -(e.clientY / window.innerHeight) * 2 + 1
      };
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  if (!mounted) return null;

  return (
    <ErrorBoundary fallback={null}>
      <div
        className="fixed inset-0 -z-10 pointer-events-none w-full h-full overflow-hidden transition-colors duration-500"
        aria-hidden="true"
      >
        <Suspense fallback={null}>
          <Canvas
            camera={{ position: [0, 0, 7], fov: 45 }}
            dpr={[1, 2]}
            gl={{
              antialias: true,
              alpha: true,
              powerPreference: 'high-performance',
              stencil: false
            }}
            className="w-full h-full"
          >
            <SceneController isDark={isDark} scrollProgressRef={scrollProgressRef} mouseRef={mouseRef} />
            <NeuralParticles isDark={isDark} scrollProgressRef={scrollProgressRef} mouseRef={mouseRef} />
            <QuantumCoreStructure isDark={isDark} scrollProgressRef={scrollProgressRef} mouseRef={mouseRef} />
          </Canvas>
        </Suspense>
      </div>
    </ErrorBoundary>
  );
};

export default BackgroundScene3D;
