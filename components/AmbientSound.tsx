import React, { useEffect, useRef, useState, useCallback } from 'react';

interface Props {
  isPlaying: boolean;
}

const AmbientSound: React.FC<Props> = ({ isPlaying }) => {
  const ctxRef = useRef<AudioContext | null>(null);
  const gainRef = useRef<GainNode | null>(null);
  const nodesRef = useRef<OscillatorNode[]>([]);
  const bgmRef = useRef<HTMLAudioElement | null>(null);
  const [hasBgm, setHasBgm] = useState(false);

  const createAmbient = useCallback(() => {
    if (ctxRef.current) return;

    const ctx = new AudioContext();
    ctxRef.current = ctx;

    const masterGain = ctx.createGain();
    masterGain.gain.value = 0;
    masterGain.connect(ctx.destination);
    gainRef.current = masterGain;

    // Drone layer: deep pad
    const createDrone = (freq: number, vol: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.value = vol;
      filter.type = 'lowpass';
      filter.frequency.value = 800;
      filter.Q.value = 1;

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(masterGain);
      osc.start();

      // Subtle frequency drift
      const drift = () => {
        const target = freq + (Math.random() - 0.5) * 4;
        osc.frequency.linearRampToValueAtTime(target, ctx.currentTime + 4);
        setTimeout(drift, 4000 + Math.random() * 2000);
      };
      drift();

      nodesRef.current.push(osc);
      return osc;
    };

    // Pentatonic chime layer (oriental scale)
    const createChime = () => {
      const pentatonic = [261.6, 293.7, 329.6, 392.0, 440.0, 523.3, 587.3];

      const playChime = () => {
        if (!ctxRef.current || ctxRef.current.state === 'closed') return;

        const freq = pentatonic[Math.floor(Math.random() * pentatonic.length)];
        const octave = Math.random() > 0.5 ? 1 : 0.5;

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const filter = ctx.createBiquadFilter();

        osc.type = 'sine';
        osc.frequency.value = freq * octave;
        filter.type = 'bandpass';
        filter.frequency.value = freq * octave;
        filter.Q.value = 10;

        gain.gain.setValueAtTime(0, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.03, ctx.currentTime + 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 3);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(masterGain);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 3);

        setTimeout(playChime, 3000 + Math.random() * 5000);
      };

      setTimeout(playChime, 1000 + Math.random() * 3000);
    };

    // Wind-like noise layer
    const createWind = () => {
      const bufferSize = ctx.sampleRate * 2;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * 0.5;
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      noise.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 300;
      filter.Q.value = 0.5;

      const gain = ctx.createGain();
      gain.gain.value = 0.008;

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(masterGain);
      noise.start();

      // Modulate wind
      const modulate = () => {
        if (!ctxRef.current || ctxRef.current.state === 'closed') return;
        const targetFreq = 200 + Math.random() * 400;
        const targetGain = 0.005 + Math.random() * 0.01;
        filter.frequency.linearRampToValueAtTime(targetFreq, ctx.currentTime + 3);
        gain.gain.linearRampToValueAtTime(targetGain, ctx.currentTime + 3);
        setTimeout(modulate, 3000 + Math.random() * 4000);
      };
      modulate();
    };

    // Build layers
    createDrone(65, 0.06);    // Deep C2
    createDrone(98, 0.04);    // G2
    createDrone(130.8, 0.03); // C3
    createChime();
    createWind();

  }, []);

  useEffect(() => {
    if (isPlaying) {
      createAmbient();
      if (gainRef.current && ctxRef.current) {
        ctxRef.current.resume();
        gainRef.current.gain.linearRampToValueAtTime(1, ctxRef.current.currentTime + 2);
      }
      if (bgmRef.current) {
        bgmRef.current.play().catch(() => {});
      }
    } else {
      if (gainRef.current && ctxRef.current && ctxRef.current.state !== 'closed') {
        gainRef.current.gain.linearRampToValueAtTime(0, ctxRef.current.currentTime + 1);
      }
      if (bgmRef.current) {
        bgmRef.current.pause();
      }
    }
  }, [isPlaying, createAmbient]);

  useEffect(() => {
    return () => {
      nodesRef.current.forEach(n => { try { n.stop(); } catch {} });
      if (ctxRef.current && ctxRef.current.state !== 'closed') {
        ctxRef.current.close();
      }
    };
  }, []);

  return null;
};

export default AmbientSound;
