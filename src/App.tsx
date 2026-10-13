import React, { useState, useCallback } from 'react';
import { CanvasScene, CameraPreset } from './components/CanvasScene';
import { TelemetryHUD } from './components/TelemetryHUD';
import { useEngineAudio } from './hooks/useEngineAudio';

export function App() {
  const [isRunning, setIsRunning] = useState(false);
  const [throttle, setThrottle] = useState(1.0);
  const [cameraPreset, setCameraPreset] = useState<CameraPreset>('ORBIT');
  const [rpm, setRpm] = useState(0);
  const [speedKmh, setSpeedKmh] = useState(0);
  const [gear, setGear] = useState('P');
  const [autoRotate, setAutoRotate] = useState(false);
  const [wireframe, setWireframe] = useState(false);
  const [chassisColor, setChassisColor] = useState('#14171D');

  const audio = useEngineAudio();

  // Engine Start/Stop toggle
  const handleToggleEngine = useCallback(() => {
    if (isRunning) {
      audio.stopEngine();
      setIsRunning(false);
    } else {
      audio.startEngine();
      setIsRunning(true);
    }
  }, [isRunning, audio]);

  // Frame telemetry update from 3D canvas
  const handleTelemetryUpdate = useCallback(
    (currentRpm: number, currentSpeed: number, currentGear: string) => {
      setRpm(currentRpm);
      setSpeedKmh(currentSpeed);
      setGear(currentGear);
      audio.updateRpm(currentRpm);
    },
    [audio]
  );

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-[#090b0e] select-none">
      {/* 3D Scene Viewport */}
      <CanvasScene
        isRunning={isRunning}
        throttle={throttle}
        cameraPreset={cameraPreset}
        chassisColor={chassisColor}
        wireframe={wireframe}
        autoRotate={autoRotate}
        onTelemetryUpdate={handleTelemetryUpdate}
      />

      {/* Cybernetic Industrial HUD Overlay */}
      <TelemetryHUD
        isRunning={isRunning}
        onToggleEngine={handleToggleEngine}
        rpm={rpm}
        speedKmh={speedKmh}
        gear={gear}
        throttle={throttle}
        onChangeThrottle={setThrottle}
        cameraPreset={cameraPreset}
        onSelectCameraPreset={setCameraPreset}
        isMuted={audio.isMuted}
        onToggleMute={audio.toggleMute}
        autoRotate={autoRotate}
        onToggleAutoRotate={() => setAutoRotate((prev) => !prev)}
        wireframe={wireframe}
        onToggleWireframe={() => setWireframe((prev) => !prev)}
        chassisColor={chassisColor}
        onChangeChassisColor={setChassisColor}
        onPlayClickSound={audio.playClick}
      />
    </main>
  );
}

export default App;
