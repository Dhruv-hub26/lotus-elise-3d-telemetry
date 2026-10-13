import React, { useEffect, useRef, useLayoutEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF, useAnimations } from '@react-three/drei';
import * as THREE from 'three';

interface LotusModelProps {
  isRunning: boolean;
  throttle: number;
  chassisColor?: string;
  wireframe?: boolean;
  onTelemetryUpdate?: (rpm: number, speedKmh: number, gear: string) => void;
}

export const LotusModel: React.FC<LotusModelProps> = ({
  isRunning,
  throttle,
  chassisColor = '#14171D',
  wireframe = false,
  onTelemetryUpdate,
}) => {
  const group = useRef<THREE.Group>(null);
  const { scene, animations } = useGLTF('/lotus_elise.glb');
  const { actions, names } = useAnimations(animations, group);

  // Normalize scale and center top deck of pedestal near Y = 0 (matching Sketchfab)
  const isCentered = useRef(false);
  useLayoutEffect(() => {
    if (!isCentered.current && scene) {
      const box = new THREE.Box3().setFromObject(scene);
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());

      // Normalize scale so pedestal width fits into ~75 units
      const maxDim = Math.max(size.x, size.z);
      const targetScale = 75 / maxDim;

      scene.scale.setScalar(targetScale);
      scene.position.set(
        -center.x * targetScale,
        -center.y * targetScale - 10,
        -center.z * targetScale
      );
      isCentered.current = true;
    }
  }, [scene]);

  // Ensure all original meshes and materials from GLB are visible and properly configured
  useEffect(() => {
    scene.traverse((child) => {
      child.visible = true;

      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;

        if (mesh.material) {
          const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
          mats.forEach((m) => {
            if (m instanceof THREE.MeshStandardMaterial) {
              m.wireframe = wireframe;

              // Neutral dark monochrome tone for the cylinder platform base (removes warm brown tint)
              if (
                m.name === 'material' ||
                m.name === 'SHADE' ||
                m.name.includes('SOL') ||
                mesh.name.includes('SOL') ||
                mesh.name.includes('Layer3')
              ) {
                m.color.set('#4a4e54'); // Dark neutral iron / slate gray
                m.roughness = 0.75;
                m.metalness = 0.45;
              }

              // Car paint
              if (m.name === 'CAR.carros') {
                m.color = new THREE.Color(chassisColor);
                m.metalness = 0.85;
                m.roughness = 0.22;
              }

              // Headlights
              if (m.name.includes('lamp-avant') || m.name === 'CAR.feu') {
                if (isRunning) {
                  m.emissive = new THREE.Color('#FFF5DD');
                  m.emissiveIntensity = 2.5;
                } else {
                  m.emissive = new THREE.Color('#111111');
                  m.emissiveIntensity = 0.05;
                }
              }

              // Taillights
              if (m.name.includes('lamp-arr-rouge') || m.name.includes('lamp-arr-bas')) {
                if (isRunning) {
                  m.emissive = new THREE.Color('#FF1E00');
                  m.emissiveIntensity = 2.8;
                } else {
                  m.emissive = new THREE.Color('#220000');
                  m.emissiveIntensity = 0.1;
                }
              }
            }
          });
        }
      }
    });
  }, [scene, chassisColor, isRunning, wireframe]);

  // Play GLB's native embedded animation ("Base Stack")
  useEffect(() => {
    const action = actions['Base Stack'] || actions[names[0]] || Object.values(actions)[0];
    if (action) {
      if (isRunning) {
        action.paused = false;
        action.play();
        action.setEffectiveTimeScale(throttle);
      } else {
        action.paused = true;
      }
    }
  }, [isRunning, throttle, actions, names]);

  // Frame telemetry calculation (RPM, speed, gear)
  const currentRpmRef = useRef(0);
  const currentSpeedRef = useRef(0);

  useFrame((_, delta) => {
    if (!onTelemetryUpdate) return;

    const targetRpm = isRunning ? 950 + (throttle / 2) * 6800 : 0;
    const targetKmh = isRunning ? (throttle / 2) * 224 : 0;

    currentRpmRef.current = THREE.MathUtils.lerp(currentRpmRef.current, targetRpm, delta * 3.5);
    currentSpeedRef.current = THREE.MathUtils.lerp(currentSpeedRef.current, targetKmh, delta * 2.5);

    const kmh = currentSpeedRef.current;
    let gear = 'P';
    if (isRunning) {
      if (kmh < 1) gear = 'N';
      else if (kmh < 48) gear = '1';
      else if (kmh < 95) gear = '2';
      else if (kmh < 155) gear = '3';
      else if (kmh < 210) gear = '4';
      else gear = '5';
    }

    onTelemetryUpdate(
      Math.round(currentRpmRef.current),
      Math.round(currentSpeedRef.current),
      gear
    );
  });

  return (
    <group ref={group}>
      <primitive object={scene} />
    </group>
  );
};

useGLTF.preload('/lotus_elise.glb');
