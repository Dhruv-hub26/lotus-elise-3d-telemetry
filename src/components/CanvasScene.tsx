import React, { useRef, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import {
  OrbitControls,
  Environment,
  ContactShadows,
  Html,
  useProgress,
} from '@react-three/drei';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import * as THREE from 'three';
import { LotusModel } from './LotusModel';

export type CameraPreset = 'ORBIT' | 'INSPECT ENGINE' | 'COCKPIT' | 'TOP VIEW';

interface CanvasSceneProps {
  isRunning: boolean;
  throttle: number;
  cameraPreset: CameraPreset;
  chassisColor: string;
  wireframe: boolean;
  autoRotate: boolean;
  onTelemetryUpdate: (rpm: number, speedKmh: number, gear: string) => void;
}

// Preset camera positions matching normalized Sketchfab rig coordinates
const PRESET_CONFIGS: Record<CameraPreset, { pos: [number, number, number]; target: [number, number, number] }> = {
  ORBIT: {
    pos: [0, 55, 95],
    target: [0, 0, 0],
  },
  'INSPECT ENGINE': {
    pos: [0, 14, -22],
    target: [0, 2, -6],
  },
  COCKPIT: {
    pos: [-6, 12, 10],
    target: [-1, 3, 2],
  },
  'TOP VIEW': {
    pos: [0, 110, 1],
    target: [0, 0, 0],
  },
};

// Smooth Camera Transition Controller for Presets
const CameraPresetController: React.FC<{
  preset: CameraPreset;
  controlsRef: React.RefObject<OrbitControlsImpl | null>;
}> = ({ preset, controlsRef }) => {
  const { camera } = useThree();
  const targetPos = useRef(new THREE.Vector3(...PRESET_CONFIGS.ORBIT.pos));
  const targetLookAt = useRef(new THREE.Vector3(...PRESET_CONFIGS.ORBIT.target));
  const isTransitioning = useRef(false);
  const transitionStart = useRef(0);

  useEffect(() => {
    const config = PRESET_CONFIGS[preset];
    if (config) {
      targetPos.current.set(...config.pos);
      targetLookAt.current.set(...config.target);
      isTransitioning.current = true;
      transitionStart.current = performance.now();
    }
  }, [preset]);

  useFrame((_, delta) => {
    if (!isTransitioning.current || !controlsRef.current) return;

    const lerpFactor = THREE.MathUtils.clamp(delta * 3.5, 0, 1);
    camera.position.lerp(targetPos.current, lerpFactor);
    controlsRef.current.target.lerp(targetLookAt.current, lerpFactor);
    controlsRef.current.update();

    if (
      camera.position.distanceTo(targetPos.current) < 0.5 &&
      controlsRef.current.target.distanceTo(targetLookAt.current) < 0.3
    ) {
      isTransitioning.current = false;
    } else if (performance.now() - transitionStart.current > 1200) {
      isTransitioning.current = false;
    }
  });

  return null;
};

// Loading fallback HUD
const CanvasLoader: React.FC = () => {
  const { progress } = useProgress();
  return (
    <Html center>
      <div className="flex flex-col items-center justify-center bg-[#0E1218]/90 backdrop-blur-md px-6 py-4 rounded-lg border border-white/10 shadow-2xl min-w-[240px]">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-2 h-2 rounded-full bg-amber-accent animate-ping" />
          <span className="font-mono-hud text-xs tracking-wider text-amber-accent font-semibold uppercase">
            CALIBRATING RIG
          </span>
        </div>
        <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden border border-white/5">
          <div
            className="bg-gradient-to-r from-amber-dark via-amber-accent to-amber-bright h-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex justify-between w-full mt-2 font-mono-hud text-[10px] text-slate-400">
          <span>STREAMING GEOMETRY</span>
          <span className="text-amber-accent font-bold">{Math.round(progress)}%</span>
        </div>
      </div>
    </Html>
  );
};

export const CanvasScene: React.FC<CanvasSceneProps> = ({
  isRunning,
  throttle,
  cameraPreset,
  chassisColor,
  wireframe,
  autoRotate,
  onTelemetryUpdate,
}) => {
  const controlsRef = useRef<OrbitControlsImpl>(null);

  return (
    <div className="relative w-full h-full bg-[#090b0e]">
      <Canvas
        className="w-full h-full cursor-grab active:cursor-grabbing"
        camera={{
          position: [0, 55, 95],
          fov: 45,
          near: 0.1,
          far: 1000,
        }}
        shadows
        gl={{
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.15,
          powerPreference: 'high-performance',
        }}
      >
        {/* Subtle Matte Graphite Background */}
        <color attach="background" args={['#090b0e']} />

        {/* Ambient Fog Floor dissolving cylinder base into infinite canvas */}
        <fog attach="fog" args={['#090b0e', 100, 240]} />

        <React.Suspense fallback={<CanvasLoader />}>
          {/* Ambient Light (intensity 0.6 keeps shadows deep & dramatic) */}
          <ambientLight intensity={0.6} color="#B0C2D8" />

          {/* Key Directional Light: Cool white (f0f4f8) */}
          <directionalLight
            position={[30, 70, 40]}
            intensity={2.0}
            color="#f0f4f8"
            castShadow
            shadow-mapSize={[2048, 2048]}
            shadow-camera-near={10}
            shadow-camera-far={250}
            shadow-camera-left={-50}
            shadow-camera-right={50}
            shadow-camera-top={50}
            shadow-camera-bottom={-50}
            shadow-bias={-0.0001}
          />

          {/* Rim / Back Light: Crisp edge highlights along cylinder rim */}
          <directionalLight
            position={[-40, 20, -50]}
            intensity={1.2}
            color="#8899aa"
          />

          {/* Subtle Side Fill */}
          <directionalLight
            position={[-20, 30, 30]}
            intensity={0.4}
            color="#68788c"
          />

          {/* Subtle Ground Contact Shadow */}
          <ContactShadows
            position={[0, -28, 0]}
            opacity={0.8}
            scale={120}
            blur={2.4}
            far={50}
            color="#000000"
          />

          {/* Studio HDRI Environment for realistic metallic highlights */}
          <Environment preset="city" environmentIntensity={0.5} />

          {/* Raw Lotus Elise Model */}
          <LotusModel
            isRunning={isRunning}
            throttle={throttle}
            chassisColor={chassisColor}
            wireframe={wireframe}
            onTelemetryUpdate={onTelemetryUpdate}
          />

          {/* Camera Preset Transitions */}
          <CameraPresetController preset={cameraPreset} controlsRef={controlsRef} />

          {/* Full Manual 3D Controls (Orbit, Pan, Zoom) */}
          <OrbitControls
            ref={controlsRef}
            makeDefault
            target={[0, 0, 0]}
            enableDamping={true}
            dampingFactor={0.06}
            enableZoom={true}
            minDistance={20}
            maxDistance={250}
            minPolarAngle={Math.PI / 6}
            maxPolarAngle={Math.PI / 2 + 0.05}
            autoRotate={autoRotate}
            autoRotateSpeed={0.8}
          />
        </React.Suspense>
      </Canvas>
    </div>
  );
};
