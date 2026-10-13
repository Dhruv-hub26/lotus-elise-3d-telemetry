import { useRef, useEffect, useCallback, useState } from 'react';

export interface EngineAudioHook {
  startEngine: () => void;
  stopEngine: () => void;
  updateRpm: (rpm: number) => void;
  playClick: () => void;
  isMuted: boolean;
  toggleMute: () => void;
}

export function useEngineAudio(): EngineAudioHook {
  const [isMuted, setIsMuted] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);

  // Engine synthesizer nodes
  const engineGainRef = useRef<GainNode | null>(null);
  const osc1Ref = useRef<OscillatorNode | null>(null); // Low sub-bass triangle wave
  const osc2Ref = useRef<OscillatorNode | null>(null); // Detuned sine wave
  const filterRef = useRef<BiquadFilterNode | null>(null); // Lowpass filter
  const isRunningRef = useRef<boolean>(false);
  const stopTimeoutRef = useRef<number | null>(null);

  // Initialize AudioContext lazily on user interaction
  const getAudioContext = useCallback(() => {
    if (!audioCtxRef.current) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      const master = ctx.createGain();
      // Cap master volume at 0.15 for pleasant ambient presence
      master.gain.setValueAtTime(isMuted ? 0 : 0.15, ctx.currentTime);
      master.connect(ctx.destination);

      audioCtxRef.current = ctx;
      masterGainRef.current = master;
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
    return { ctx: audioCtxRef.current, master: masterGainRef.current! };
  }, [isMuted]);

  // Soft subtle tactile button click
  const playClick = useCallback(() => {
    try {
      const { ctx, master } = getAudioContext();
      const osc = ctx.createOscillator();
      const clickGain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(420, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(140, ctx.currentTime + 0.03);

      clickGain.gain.setValueAtTime(0.08, ctx.currentTime);
      clickGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.03);

      osc.connect(clickGain);
      clickGain.connect(master);

      osc.start();
      osc.stop(ctx.currentTime + 0.035);
    } catch {
      // Audio autoplay policy fallback
    }
  }, [getAudioContext]);

  // Smooth RPM frequency mapping
  const updateRpm = useCallback((rpm: number) => {
    if (!isRunningRef.current || !audioCtxRef.current) return;
    const ctx = audioCtxRef.current;
    const t = ctx.currentTime;

    // rpm ratio: 0 (idle ~900 RPM) to 1 (redline ~8500 RPM)
    const ratio = Math.min(1, Math.max(0, (rpm - 900) / 7600));

    // Oscillator 1: Triangle wave from 42 Hz (idle purr) up to 85 Hz (max thrum)
    const freq1 = 42 + ratio * 43;
    // Oscillator 2: Sine wave slightly detuned (+3 Hz) for natural acoustic phasing
    const freq2 = freq1 + 3;
    // Biquad lowpass filter: 160 Hz at idle, scaling smoothly to 380 Hz at max throttle
    const cutoff = 160 + ratio * 220;

    if (osc1Ref.current) {
      osc1Ref.current.frequency.setTargetAtTime(freq1, t, 0.08);
    }
    if (osc2Ref.current) {
      osc2Ref.current.frequency.setTargetAtTime(freq2, t, 0.08);
    }
    if (filterRef.current) {
      filterRef.current.frequency.setTargetAtTime(cutoff, t, 0.08);
    }
  }, []);

  // Start engine with smooth 0.4s fade-in
  const startEngine = useCallback(() => {
    if (stopTimeoutRef.current) {
      window.clearTimeout(stopTimeoutRef.current);
      stopTimeoutRef.current = null;
    }

    const { ctx, master } = getAudioContext();
    isRunningRef.current = true;

    // Clean up any lingering nodes safely
    try {
      osc1Ref.current?.stop();
      osc2Ref.current?.stop();
    } catch {
      // Ignore
    }

    const now = ctx.currentTime;

    // Engine volume envelope with smooth linear fade-in over 0.4s
    const engineGain = ctx.createGain();
    engineGain.gain.setValueAtTime(0, now);
    engineGain.gain.linearRampToValueAtTime(1.0, now + 0.4);
    engineGain.connect(master);
    engineGainRef.current = engineGain;

    // Tight lowpass filter to eliminate all harsh high frequencies
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(160, now);
    filter.Q.setValueAtTime(1.2, now);
    filter.connect(engineGain);
    filterRef.current = filter;

    // Oscillator 1: Deep sub-bass triangle wave (~42 Hz idle purr)
    const osc1 = ctx.createOscillator();
    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(42, now);
    osc1.connect(filter);
    osc1.start(now);
    osc1Ref.current = osc1;

    // Oscillator 2: Sine wave (+3 Hz detuned) for natural acoustic engine thrum
    const osc2 = ctx.createOscillator();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(45, now);
    osc2.connect(filter);
    osc2.start(now);
    osc2Ref.current = osc2;
  }, [getAudioContext]);

  // Stop engine with smooth 0.5s fade-out
  const stopEngine = useCallback(() => {
    if (!isRunningRef.current || !audioCtxRef.current) return;
    isRunningRef.current = false;
    const ctx = audioCtxRef.current;
    const now = ctx.currentTime;

    // Smooth linear fade-out over 0.5s
    if (engineGainRef.current) {
      engineGainRef.current.gain.cancelScheduledValues(now);
      engineGainRef.current.gain.setValueAtTime(engineGainRef.current.gain.value, now);
      engineGainRef.current.gain.linearRampToValueAtTime(0.0001, now + 0.5);
    }

    // Pitch decelerates down smoothly during fade-out
    if (osc1Ref.current) {
      osc1Ref.current.frequency.cancelScheduledValues(now);
      osc1Ref.current.frequency.setTargetAtTime(25, now, 0.2);
    }
    if (osc2Ref.current) {
      osc2Ref.current.frequency.cancelScheduledValues(now);
      osc2Ref.current.frequency.setTargetAtTime(28, now, 0.2);
    }

    stopTimeoutRef.current = window.setTimeout(() => {
      try {
        osc1Ref.current?.stop();
        osc2Ref.current?.stop();
      } catch {
        // Ignore
      }
      osc1Ref.current = null;
      osc2Ref.current = null;
      engineGainRef.current = null;
      filterRef.current = null;
    }, 550);
  }, []);

  // Mute / Unmute toggle
  const toggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const next = !prev;
      if (masterGainRef.current && audioCtxRef.current) {
        masterGainRef.current.gain.setTargetAtTime(
          next ? 0 : 0.15,
          audioCtxRef.current.currentTime,
          0.05
        );
      }
      return next;
    });
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (stopTimeoutRef.current) clearTimeout(stopTimeoutRef.current);
      try {
        osc1Ref.current?.stop();
        osc2Ref.current?.stop();
        audioCtxRef.current?.close();
      } catch {
        // Ignore
      }
    };
  }, []);

  return {
    startEngine,
    stopEngine,
    updateRpm,
    playClick,
    isMuted,
    toggleMute,
  };
}
