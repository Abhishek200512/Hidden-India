import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, Sparkles } from 'lucide-react';

export default function AudioAtmosphere() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.4);
  const [activeMood, setActiveMood] = useState('mystic'); // 'mystic' | 'himalaya' | 'temple'
  const audioCtxRef = useRef(null);
  const gainNodeRef = useRef(null);
  const nodesRef = useRef([]);
  const timerRef = useRef(null);

  const initAudio = () => {
    if (!audioCtxRef.current) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      audioCtxRef.current = new AudioContext();
      
      const masterGain = audioCtxRef.current.createGain();
      masterGain.gain.setValueAtTime(volume, audioCtxRef.current.currentTime);
      masterGain.connect(audioCtxRef.current.destination);
      gainNodeRef.current = masterGain;
    }
  };

  const startSoundscape = () => {
    initAudio();
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
    stopNodes();

    const ctx = audioCtxRef.current;
    const master = gainNodeRef.current;
    const createdNodes = [];

    // Base Tanpura Drone Frequencies (C#3, G#3, C#4 harmonic drone)
    const baseFreqs = activeMood === 'himalaya' 
      ? [110.0, 164.81, 220.0, 329.63] // A minor high alpine
      : [138.59, 207.65, 277.18, 415.30]; // C# Mystic Indian classical raga drone

    baseFreqs.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq + (Math.random() * 0.4 - 0.2), ctx.currentTime);

      // Subtle LFO vibrato
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.frequency.setValueAtTime(0.15 + idx * 0.05, ctx.currentTime);
      lfoGain.gain.setValueAtTime(0.8, ctx.currentTime);
      lfo.connect(osc.frequency);
      lfo.start();
      createdNodes.push(lfo);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(500 + idx * 250, ctx.currentTime);

      // Gentle pulsating drone volume
      const baseVol = 0.08 / (idx + 1);
      oscGain.gain.setValueAtTime(baseVol, ctx.currentTime);

      osc.connect(filter);
      filter.connect(oscGain);
      oscGain.connect(master);
      osc.start();

      createdNodes.push(osc, filter, oscGain);
    });

    // Wind / Sub-bass Pink noise generator
    try {
      const bufferSize = ctx.sampleRate * 2;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      let b0 = 0, b1 = 0, b2 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        output[i] = (b0 + b1 + b2) * 0.03;
      }

      const whiteNoise = ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      whiteNoise.loop = true;

      const windFilter = ctx.createBiquadFilter();
      windFilter.type = 'bandpass';
      windFilter.frequency.setValueAtTime(220, ctx.currentTime);
      windFilter.Q.setValueAtTime(1.5, ctx.currentTime);

      const windGain = ctx.createGain();
      windGain.gain.setValueAtTime(0.04, ctx.currentTime);

      whiteNoise.connect(windFilter);
      windFilter.connect(windGain);
      windGain.connect(master);
      whiteNoise.start();

      createdNodes.push(whiteNoise, windFilter, windGain);
    } catch {
      // Audio buffer fallback if restricted
    }

    // Occasional meditative bell chime
    const playBell = () => {
      if (!audioCtxRef.current || !isPlaying) return;
      try {
        const bellOsc = ctx.createOscillator();
        const bellGain = ctx.createGain();
        const bellFilter = ctx.createBiquadFilter();

        const bellPitches = [523.25, 659.25, 783.99, 1046.50, 1318.51];
        const pitch = bellPitches[Math.floor(Math.random() * bellPitches.length)];

        bellOsc.type = 'sine';
        bellOsc.frequency.setValueAtTime(pitch, ctx.currentTime);

        bellFilter.type = 'highpass';
        bellFilter.frequency.setValueAtTime(300, ctx.currentTime);

        bellGain.gain.setValueAtTime(0.06, ctx.currentTime);
        bellGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 4.5);

        bellOsc.connect(bellFilter);
        bellFilter.connect(bellGain);
        bellGain.connect(master);

        bellOsc.start();
        bellOsc.stop(ctx.currentTime + 4.6);
      } catch {
        // Safe fall-through
      }

      // Schedule next bell
      const nextDelay = 5000 + Math.random() * 8000;
      timerRef.current = setTimeout(playBell, nextDelay);
    };

    timerRef.current = setTimeout(playBell, 4000);
    nodesRef.current = createdNodes;
  };

  const stopNodes = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    nodesRef.current.forEach(node => {
      try {
        if (node.stop) node.stop();
        if (node.disconnect) node.disconnect();
      } catch {
        // ignore
      }
    });
    nodesRef.current = [];
  };

  const toggleSound = () => {
    if (isPlaying) {
      stopNodes();
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
    }
  };

  useEffect(() => {
    if (isPlaying) {
      startSoundscape();
    } else {
      stopNodes();
    }
    return () => stopNodes();
  }, [isPlaying, activeMood]);

  useEffect(() => {
    if (gainNodeRef.current && audioCtxRef.current) {
      gainNodeRef.current.gain.setTargetAtTime(volume, audioCtxRef.current.currentTime, 0.1);
    }
  }, [volume]);

  return (
    <div className="relative group flex items-center gap-2">
      <button
        onClick={toggleSound}
        className={`px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-2 transition-all duration-300 border ${
          isPlaying
            ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.25)]'
            : 'bg-white/5 text-slate-300 border-white/10 hover:border-amber-500/30 hover:text-white'
        }`}
        title={isPlaying ? 'Mute Ambient Soundscape' : 'Enable Indian Tanpura & Alpine Wind Soundscape'}
      >
        {isPlaying ? (
          <>
            <Volume2 className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span className="hidden sm:inline">Ambient Audio</span>
            <span className="flex gap-0.5 items-end h-3">
              <span className="w-0.5 h-1.5 bg-amber-400 animate-[bounce_1s_infinite]"></span>
              <span className="w-0.5 h-3 bg-amber-300 animate-[bounce_0.8s_infinite]"></span>
              <span className="w-0.5 h-2 bg-amber-400 animate-[bounce_1.2s_infinite]"></span>
            </span>
          </>
        ) : (
          <>
            <VolumeX className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden sm:inline">Soundscape: Off</span>
          </>
        )}
      </button>

      {/* Floating control dropdown on hover/focus */}
      {isPlaying && (
        <div className="absolute right-0 top-full mt-2 w-48 p-3 rounded-xl glass-panel-gold shadow-2xl opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-all duration-200 z-50">
          <div className="flex items-center justify-between text-[11px] text-amber-300/80 mb-2">
            <span className="flex items-center gap-1"><Sparkles className="w-3 h-3" /> Aura Mood</span>
            <span>{Math.round(volume * 100)}%</span>
          </div>

          <div className="grid grid-cols-2 gap-1.5 mb-2.5">
            <button
              onClick={() => setActiveMood('mystic')}
              className={`text-[10px] py-1 px-2 rounded font-medium border ${
                activeMood === 'mystic' 
                  ? 'bg-amber-500/30 border-amber-400 text-amber-200' 
                  : 'bg-black/30 border-white/10 text-slate-400 hover:text-white'
              }`}
            >
              Tanpura Drone
            </button>
            <button
              onClick={() => setActiveMood('himalaya')}
              className={`text-[10px] py-1 px-2 rounded font-medium border ${
                activeMood === 'himalaya' 
                  ? 'bg-cyan-500/30 border-cyan-400 text-cyan-200' 
                  : 'bg-black/30 border-white/10 text-slate-400 hover:text-white'
              }`}
            >
              Alpine Winds
            </button>
          </div>

          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="w-full accent-amber-400 h-1 bg-slate-700 rounded-lg cursor-pointer"
          />
        </div>
      )}
    </div>
  );
}
