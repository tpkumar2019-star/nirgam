import React, { useState, useEffect } from 'react';
import { CloudRain, Radio, Shield, ArrowRight, Zap, Play } from 'lucide-react';

export default function CinematicIntro({ onComplete }) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    // 3-second cinematic sequence
    const t1 = setTimeout(() => setStep(1), 800);
    const t2 = setTimeout(() => setStep(2), 1800);
    const t3 = setTimeout(() => onComplete(), 3200);

    const handleKeyDown = (e) => {
      if (e.key === 'Escape' || e.key === ' ' || e.key === 'Enter') {
        onComplete();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onComplete]);

  return (
    <div 
      onClick={onComplete}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#060a12] text-slate-100 cursor-pointer overflow-hidden select-none"
    >
      {/* Background Animated Rain Particles */}
      <div className="absolute inset-0 pointer-events-none opacity-25 overflow-hidden">
        {Array.from({ length: 40 }).map((_, i) => (
          <div
            key={i}
            className="absolute bg-cyan-400/80 rounded-full"
            style={{
              width: `${1 + (i % 2)}px`,
              height: `${20 + (i % 30)}px`,
              top: `${(i * 19) % 100}%`,
              left: `${(i * 7) % 100}%`,
              opacity: 0.2 + (i % 5) * 0.15,
              animation: `rain-fall ${0.6 + (i % 4) * 0.2}s linear infinite`
            }}
          />
        ))}
      </div>

      {/* Radar Sweep Effect */}
      <div className="absolute w-[600px] h-[600px] rounded-full border border-cyan-500/15 flex items-center justify-center pointer-events-none">
        <div className="w-[440px] h-[440px] rounded-full border border-cyan-500/20 flex items-center justify-center">
          <div className="w-[280px] h-[280px] rounded-full border border-cyan-500/25 flex items-center justify-center">
            <div className="w-4 h-4 rounded-full bg-cyan-500/50 animate-ping" />
          </div>
        </div>
        <div 
          className="absolute inset-0 rounded-full bg-gradient-to-tr from-cyan-500/10 via-transparent to-transparent animate-spin"
          style={{ animationDuration: '4s' }}
        />
      </div>

      {/* Content Container */}
      <div className="relative z-10 text-center max-w-xl px-6 flex flex-col items-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/70 border border-cyan-500/30 text-cyan-400 text-xs font-mono mb-4 tracking-wider">
          <Radio className="w-3.5 h-3.5 animate-pulse text-cyan-400" />
          <span>IMD DOPPLER RADAR + 2D DEM + DRAIN GRAPH</span>
        </div>

        {/* Title */}
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight font-display text-white mb-2">
          NIRGAM <span className="text-cyan-400">NOWCAST</span>
        </h1>
        <p className="text-sm md:text-base text-slate-300 font-sans max-w-md mx-auto leading-relaxed mb-6">
          Street-Level Urban Flood Nowcasting System for Indian Metros. Predicting depth (cm), timing, and safe corridors.
        </p>

        {/* Telemetry Progress Steps */}
        <div className="flex items-center gap-3 text-xs font-mono text-slate-400 bg-slate-900/80 border border-slate-800 px-4 py-2 rounded-xl mb-6">
          <div className="flex items-center gap-1.5 text-cyan-400">
            <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
            <span>{step === 0 ? 'CALIBRATING DEM...' : (step === 1 ? 'SOLVING DRAIN NETWORK...' : 'LIVE NOWCAST READY')}</span>
          </div>
          <span className="text-slate-600">|</span>
          <span className="text-slate-400">PILOT: MUMBAI</span>
        </div>

        {/* Skip Action Hint */}
        <button
          onClick={onComplete}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 text-xs font-medium transition cursor-pointer"
        >
          <span>Enter Live Map (Skip intro)</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <style>{`
        @keyframes rain-fall {
          0% { transform: translateY(-100px); }
          100% { transform: translateY(800px); }
        }
      `}</style>
    </div>
  );
}
