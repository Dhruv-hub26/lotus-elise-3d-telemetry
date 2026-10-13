import React from 'react';
import {
  Volume2,
  VolumeX,
  RotateCw,
  Gauge,
  Layers,
  Zap,
  Cpu,
} from 'lucide-react';
import type { CameraPreset } from './CanvasScene';

interface TelemetryHUDProps {
  isRunning: boolean;
  onToggleEngine: () => void;
  rpm: number;
  speedKmh: number;
  gear: string;
  throttle: number;
  onChangeThrottle: (multiplier: number) => void;
  cameraPreset: CameraPreset;
  onSelectCameraPreset: (preset: CameraPreset) => void;
  isMuted: boolean;
  onToggleMute: () => void;
  autoRotate: boolean;
  onToggleAutoRotate: () => void;
  wireframe: boolean;
  onToggleWireframe: () => void;
  chassisColor: string;
  onChangeChassisColor: (color: string) => void;
  onPlayClickSound: () => void;
}

const COLOR_OPTIONS = [
  { name: 'Obsidian Slate', hex: '#16191E' },
  { name: 'Graphite Cast', hex: '#2F3642' },
  { name: 'Warm Apricot', hex: '#FB923C' },
  { name: 'Sage Mist', hex: '#2F483D' },
  { name: 'Polar Glacier', hex: '#94A3B8' },
];

export const TelemetryHUD: React.FC<TelemetryHUDProps> = ({
  isRunning,
  onToggleEngine,
  rpm,
  speedKmh,
  gear,
  throttle,
  onChangeThrottle,
  cameraPreset,
  onSelectCameraPreset,
  isMuted,
  onToggleMute,
  autoRotate,
  onToggleAutoRotate,
  wireframe,
  onToggleWireframe,
  chassisColor,
  onChangeChassisColor,
  onPlayClickSound,
}) => {
  // Tachometer geometry calculations
  const maxRpm = 8500;
  const rpmPercent = Math.min(100, Math.max(0, (rpm / maxRpm) * 100));
  const circumference = 2 * Math.PI * 40;
  const arcLength = circumference * 0.72;
  const strokeDashoffset = arcLength - (rpmPercent / 100) * arcLength;

  return (
    <div className="pointer-events-none fixed inset-0 z-20 flex flex-col justify-between p-6 md:p-8 w-screen h-screen overflow-hidden select-none">
      {/* 1. TOP BAR (HEADER) */}
      <div className="w-full flex items-center justify-between pointer-events-none">
        {/* Left Badge Pill */}
        <div className="pointer-events-auto bg-slate-950/75 backdrop-blur-md border border-white/10 px-4 py-2 flex items-center gap-3 shadow-lg rounded-2xl">
          <div className="flex items-center justify-center w-6 h-6 rounded-lg bg-amber-400/10 border border-amber-400/30 text-amber-400 font-bold text-xs shadow-inner">
            L
          </div>
          <div className="flex items-center gap-2">
            <h1 className="font-sans font-bold text-sm tracking-wide text-slate-100">
              LOTUS ÉLISE
            </h1>
            <span className="font-mono text-[11px] text-amber-400 font-semibold tracking-tight">
              // SPEC RIG
            </span>
          </div>
          <span className="inline-flex items-center gap-1.5 font-sans text-[9px] text-teal-300 bg-teal-400/10 px-2 py-0.5 rounded-full border border-teal-400/20 font-medium tracking-wide ml-1">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
            [SYSTEM ACTIVE]
          </span>
        </div>

        {/* Right Header Panel */}
        <div className="pointer-events-auto bg-slate-950/75 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-2xl flex items-center gap-3 shadow-lg">
          <div className="flex items-center gap-2 px-1">
            <span className="font-sans text-[10px] text-slate-400 tracking-wide uppercase font-medium hidden sm:inline">
              POWER UNIT:
            </span>
            <div className="flex items-center gap-1.5">
              <span
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  isRunning
                    ? 'bg-amber-400 shadow-[0_0_8px_#FBBF24] animate-pulse'
                    : 'bg-slate-600'
                }`}
              />
              <span
                className={`font-mono text-xs font-bold tracking-tight ${
                  isRunning ? 'text-amber-400' : 'text-slate-400'
                }`}
              >
                {isRunning ? 'LIVE' : 'STANDBY'}
              </span>
            </div>
          </div>

          <div className="h-4 w-px bg-white/10 hidden sm:block" />

          {/* Quick HUD Utility Toggles */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => {
                onPlayClickSound();
                onToggleMute();
              }}
              className={`p-1.5 rounded-lg transition-all duration-200 btn-tactile ${
                isMuted
                  ? 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                  : 'text-amber-400 bg-amber-400/15 border border-amber-400/25'
              }`}
              title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
            >
              {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
            </button>

            <button
              onClick={() => {
                onPlayClickSound();
                onToggleAutoRotate();
              }}
              className={`p-1.5 rounded-lg transition-all duration-200 btn-tactile ${
                autoRotate
                  ? 'text-teal-300 bg-teal-400/15 border border-teal-400/25'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
              title="Turntable Orbit"
            >
              <RotateCw size={14} className={autoRotate ? 'animate-spin' : ''} />
            </button>

            <button
              onClick={() => {
                onPlayClickSound();
                onToggleWireframe();
              }}
              className={`p-1.5 rounded-lg transition-all duration-200 btn-tactile ${
                wireframe
                  ? 'text-cyan-300 bg-cyan-400/15 border border-cyan-400/25'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
              title="Toggle Wireframe Mesh"
            >
              <Layers size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* 2. MIDDLE ROW (LEFT & RIGHT TELEMETRY PANELS) */}
      <div className="w-full flex items-center justify-between pointer-events-none my-auto">
        {/* Left Panel (TELEMETRY CORE) */}
        <aside className="w-64 sm:w-72 bg-slate-950/75 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-2xl pointer-events-auto space-y-3.5">
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <div className="flex items-center gap-2 text-slate-200">
              <Gauge size={14} className="text-teal-300" />
              <span className="font-sans text-[11px] font-semibold tracking-wide uppercase">
                TELEMETRY CORE
              </span>
            </div>
            <span className="font-mono text-[9px] text-teal-300 bg-teal-400/10 px-2 py-0.5 rounded-full border border-teal-400/20 font-semibold tracking-tight">
              CH-01
            </span>
          </div>

          {/* Radial Tachometer + Digital RPM */}
          <div className="flex items-center gap-3">
            <div className="relative w-24 h-24 flex items-center justify-center shrink-0">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <defs>
                  <linearGradient id="rpmGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#5EEAD4" />
                    <stop offset="65%" stopColor="#67E8F9" />
                    <stop offset="100%" stopColor="#FBBF24" />
                  </linearGradient>
                </defs>
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  className="gauge-track"
                  strokeWidth="5"
                  fill="transparent"
                  strokeDasharray={`${arcLength} ${circumference}`}
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  className="gauge-fill"
                  stroke={rpm > 6800 ? '#F97316' : 'url(#rpmGrad)'}
                  strokeWidth="5"
                  fill="transparent"
                  strokeDasharray={`${arcLength} ${circumference}`}
                  strokeDashoffset={strokeDashoffset}
                />
              </svg>

              <div className="absolute flex flex-col items-center">
                <span className="font-mono text-lg font-bold tracking-tight text-slate-100 leading-none">
                  {rpm}
                </span>
                <span className="font-sans text-[8px] font-medium text-slate-400 tracking-wider mt-0.5">
                  RPM
                </span>
                {rpm > 7000 && (
                  <span className="font-sans text-[7px] text-amber-400 font-extrabold tracking-wide animate-pulse mt-0.5">
                    PEAK
                  </span>
                )}
              </div>
            </div>

            {/* Gear & Velocity Box */}
            <div className="flex flex-col gap-1.5 flex-1 min-w-0">
              <div className="bg-slate-900/60 border border-white/5 rounded-xl p-2 flex items-center justify-between">
                <span className="font-sans text-[9px] text-slate-400 font-medium tracking-wide">GEAR</span>
                <span
                  className={`font-mono text-xl font-black tracking-tight ${
                    gear === 'P'
                      ? 'text-slate-500'
                      : gear === 'N'
                      ? 'text-teal-300'
                      : 'text-amber-400'
                  }`}
                >
                  {gear}
                </span>
              </div>

              <div className="bg-slate-900/60 border border-white/5 rounded-xl p-2 flex items-center justify-between">
                <div>
                  <span className="font-sans text-[8px] text-slate-400 block font-medium tracking-wide">VELOCITY</span>
                  <span className="font-mono text-[11px] text-teal-300 font-semibold tracking-tight">
                    {Math.round(speedKmh * 0.621371)} MPH
                  </span>
                </div>
                <div className="text-right">
                  <span className="font-mono text-lg font-bold text-slate-100 leading-none block tracking-tight">
                    {speedKmh}
                  </span>
                  <span className="font-sans text-[8px] text-slate-400 uppercase font-medium tracking-wider">KM/H</span>
                </div>
              </div>
            </div>
          </div>

          {/* Linear Throttle Meter */}
          <div>
            <div className="flex justify-between items-center font-sans text-[9px] text-slate-400 mb-1 font-medium tracking-wide">
              <span>THROTTLE LOAD</span>
              <span className="font-mono text-amber-400 font-semibold tracking-tight">
                {isRunning ? Math.round((rpm / maxRpm) * 100) : 0}%
              </span>
            </div>
            <div className="w-full h-1.5 bg-slate-900/70 rounded-full overflow-hidden border border-white/5 flex">
              <div
                className="bg-gradient-to-r from-teal-300 via-cyan-300 to-amber-400 h-full transition-all duration-120"
                style={{ width: `${isRunning ? (rpm / maxRpm) * 100 : 0}%` }}
              />
            </div>
          </div>
        </aside>

        {/* Right Panel (CHASSIS TELEMETRY) */}
        <aside className="w-64 sm:w-72 bg-slate-950/75 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-2xl pointer-events-auto space-y-3.5 hidden md:block">
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <div className="flex items-center gap-2 text-slate-200">
              <Cpu size={14} className="text-amber-400" />
              <span className="font-sans text-[11px] font-semibold tracking-wide uppercase">
                CHASSIS TELEMETRY
              </span>
            </div>
            <span className="font-mono text-[9px] text-slate-400 tracking-tight">RIG-V2</span>
          </div>

          <div className="grid grid-cols-2 gap-1.5 font-mono text-[10px]">
            <div className="bg-slate-900/60 p-2 rounded-xl border border-white/5">
              <span className="font-sans text-[8px] text-slate-400 block uppercase font-medium tracking-wide">TRIANGLES</span>
              <span className="font-mono font-bold text-slate-200 tracking-tight">434.9k</span>
            </div>
            <div className="bg-slate-900/60 p-2 rounded-xl border border-white/5">
              <span className="font-sans text-[8px] text-slate-400 block uppercase font-medium tracking-wide">MESHES</span>
              <span className="font-mono font-bold text-slate-200 tracking-tight">62</span>
            </div>
            <div className="bg-slate-900/60 p-2 rounded-xl border border-white/5">
              <span className="font-sans text-[8px] text-slate-400 block uppercase font-medium tracking-wide">WEIGHT</span>
              <span className="font-mono font-bold text-amber-400 tracking-tight">860 KG</span>
            </div>
            <div className="bg-slate-900/60 p-2 rounded-xl border border-white/5">
              <span className="font-sans text-[8px] text-slate-400 block uppercase font-medium tracking-wide">0-100 KM/H</span>
              <span className="font-mono font-bold text-teal-300 tracking-tight">4.9 SEC</span>
            </div>
          </div>

          <div>
            <span className="font-sans text-[9px] text-slate-400 block mb-1.5 font-medium uppercase tracking-wide">
              EXTERIOR FINISH:
            </span>
            <div className="flex items-center gap-2">
              {COLOR_OPTIONS.map((c) => (
                <button
                  key={c.name}
                  onClick={() => {
                    onPlayClickSound();
                    onChangeChassisColor(c.hex);
                  }}
                  className={`w-6 h-6 rounded-full border-2 transition-all duration-200 btn-tactile ${
                    chassisColor === c.hex
                      ? 'border-amber-400 scale-110 shadow-[0_0_8px_rgba(251,191,36,0.6)]'
                      : 'border-white/20 hover:border-white/50'
                  }`}
                  style={{ backgroundColor: c.hex }}
                  title={c.name}
                />
              ))}
            </div>
          </div>

          <div className="text-[9px] text-slate-400 space-y-1 bg-slate-900/60 p-2 rounded-xl border border-white/5">
            <div className="flex justify-between font-sans">
              <span className="font-medium tracking-wide">EXTRUSION:</span>
              <span className="font-mono text-slate-200 tracking-tight">ALUMINIUM 6000</span>
            </div>
            <div className="flex justify-between font-sans">
              <span className="font-medium tracking-wide">DRIVETRAIN:</span>
              <span className="font-mono text-slate-200 tracking-tight">MID-ENGINE RWD</span>
            </div>
            <div className="flex justify-between font-sans">
              <span className="font-medium tracking-wide">ENGINE:</span>
              <span className="font-mono text-slate-200 tracking-tight">1796 CC VVT-i</span>
            </div>
          </div>
        </aside>
      </div>

      {/* 3. BOTTOM CONTROL DOCK (SINGLE UNIFIED HORIZONTAL ROW) */}
      <div className="w-full flex flex-col items-center gap-2 pointer-events-none pb-2">
        {/* Main Single Dock */}
        <div className="pointer-events-auto bg-slate-950/85 backdrop-blur-xl border border-white/10 rounded-2xl p-2 flex items-center gap-3 shadow-2xl flex-nowrap whitespace-nowrap overflow-x-auto max-w-full">
          {/* Camera Presets Group */}
          <div className="flex items-center gap-1 bg-slate-900/60 p-1 rounded-xl border border-white/5 shrink-0">
            <span className="font-sans text-[9px] text-slate-400 px-2 uppercase hidden xl:inline font-medium tracking-wide">
              CAMERA
            </span>
            {(['ORBIT', 'INSPECT ENGINE', 'COCKPIT', 'TOP VIEW'] as CameraPreset[]).map(
              (preset) => (
                <button
                  key={preset}
                  onClick={() => {
                    onPlayClickSound();
                    onSelectCameraPreset(preset);
                  }}
                  className={`px-2.5 py-1.5 rounded-lg font-sans text-[10px] font-semibold tracking-wide transition-all duration-200 btn-tactile whitespace-nowrap ${
                    cameraPreset === preset
                      ? 'bg-amber-400/20 text-amber-300 border border-amber-400/35 font-bold shadow-[0_0_10px_rgba(251,191,36,0.2)]'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                  }`}
                >
                  {preset}
                </button>
              )
            )}
          </div>

          {/* Center Big START / STOP ENGINE Button */}
          <button
            id="engine-start-stop-btn"
            onClick={() => {
              onPlayClickSound();
              onToggleEngine();
            }}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs sm:text-sm shrink-0 whitespace-nowrap transition-all duration-200 btn-tactile ${
              isRunning
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-lg'
                : 'bg-gradient-to-r from-amber-400 to-orange-400 text-slate-950 font-bold shadow-lg shadow-orange-500/20 active:scale-95'
            }`}
          >
            <Zap
              size={15}
              className={`transition-transform duration-200 ${
                isRunning ? 'text-rose-300 fill-rose-300 animate-pulse' : 'text-slate-950'
              }`}
            />
            <span className="font-sans font-bold tracking-wide">
              {isRunning ? 'STOP ENGINE' : 'START ENGINE'}
            </span>
            <span
              className={`w-2 h-2 rounded-full ${
                isRunning
                  ? 'bg-rose-400 shadow-[0_0_6px_#FB7185] animate-ping'
                  : 'bg-slate-950/40'
              }`}
            />
          </button>

          {/* Throttle Group on the EXACT SAME ROW */}
          <div className="flex items-center gap-1 bg-slate-900/60 p-1 rounded-xl border border-white/5 shrink-0">
            <span className="font-sans text-[9px] text-slate-400 px-2 uppercase hidden xl:inline font-medium tracking-wide">
              THROTTLE
            </span>
            {[
              { label: 'SLOW-MO', val: 0.5 },
              { label: '1X', val: 1.0 },
              { label: '2X', val: 2.0 },
            ].map((item) => (
              <button
                key={item.label}
                onClick={() => {
                  onPlayClickSound();
                  onChangeThrottle(item.val);
                }}
                className={`px-2.5 py-1.5 rounded-lg font-sans text-[10px] font-semibold tracking-wide transition-all duration-200 btn-tactile whitespace-nowrap ${
                  throttle === item.val
                    ? 'bg-teal-400/20 text-teal-300 border border-teal-400/35 font-bold shadow-[0_0_10px_rgba(94,234,212,0.15)]'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Bottom Footer Metadata Caption */}
        <div className="pointer-events-none font-mono text-[10px] text-slate-500 tracking-widest uppercase mt-1">
          <span>COORDINATES: LAT 52.56°N LON 1.15°E (HETHEL RIG) • SKETCHFAB MONOCHROME STUDIO // THREE.JS R174</span>
        </div>
      </div>
    </div>
  );
};
