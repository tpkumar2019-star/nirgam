import React from 'react';
import { Play, Pause, RotateCcw, ChevronLeft, ChevronRight, Zap, CloudRain, AlertTriangle } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer, XAxis, Tooltip } from 'recharts';

export default function NirgamTimeScrubber({
  currentTimeMin,
  onTimeChange,
  isPlaying,
  onTogglePlay,
  rainHyetograph,
  peakRainMmHr,
  peakTimeMin,
  impassableCount,
  hazardousCount,
  surchargedNodesCount,
  rainIntensityMmHr
}) {
  return (
    <div className="relative z-20 w-full bg-[#0a1120]/95 backdrop-blur-md border-t border-slate-700/80 px-4 sm:px-6 py-2.5 shadow-2xl flex flex-col gap-2">
      {/* Top Row: Rainfall Sparkline & City-Wide Summary */}
      <div className="flex items-center justify-between gap-4">
        {/* City-wide dynamic metric */}
        <div className="flex items-center gap-2.5 text-xs font-mono">
          <div className="flex items-center gap-1.5 text-rose-300 bg-rose-950/80 border border-rose-600/70 px-3 py-1 rounded-xl shadow-sm">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
            <span>Streets Impassable: <strong className="text-white text-sm">{impassableCount}</strong></span>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 text-amber-200 bg-amber-950/80 border border-amber-600/70 px-3 py-1 rounded-xl shadow-sm">
            <span>Hazardous: <strong className="text-white text-sm">{hazardousCount}</strong></span>
          </div>

          <div className="hidden md:flex items-center gap-1.5 text-blue-200 bg-blue-950/80 border border-blue-600/70 px-3 py-1 rounded-xl shadow-sm">
            <span>Surcharged Manholes: <strong className="text-white text-sm">{surchargedNodesCount}</strong></span>
          </div>
        </div>

        {/* Rain Intensity Peak Indicator & Sparkline */}
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <div className="text-xs font-mono text-cyan-300 font-bold flex items-center justify-end gap-1">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>PEAK: {peakRainMmHr} mm/hr at +{peakTimeMin}m</span>
            </div>
            <div className="text-[11px] text-slate-300 font-mono">
              Rain Rate: <span className="text-white font-bold">{rainIntensityMmHr} mm/hr</span>
            </div>
          </div>

          {/* Mini Hyetograph Sparkline */}
          <div className="w-36 sm:w-48 h-8 opacity-90 bg-slate-900/60 rounded-lg p-0.5 border border-slate-800">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={rainHyetograph || []} margin={{ top: 1, right: 1, left: 1, bottom: 1 }}>
                <defs>
                  <linearGradient id="rainGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.9}/>
                    <stop offset="95%" stopColor="#0284c7" stopOpacity={0.2}/>
                  </linearGradient>
                </defs>
                <Area 
                  type="monotone" 
                  dataKey="intensityMmHr" 
                  stroke="#38bdf8" 
                  strokeWidth={2} 
                  fillOpacity={1} 
                  fill="url(#rainGradient)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bottom Row: Scrubber Bar Controls */}
      <div className="flex items-center gap-3">
        {/* Play/Pause Button */}
        <button
          onClick={onTogglePlay}
          className="flex items-center justify-center w-9 h-9 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition shadow-md cursor-pointer shrink-0"
          title={isPlaying ? "Pause Timeline" : "Play Timeline (Space)"}
        >
          {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
        </button>

        {/* Step Buttons */}
        <button
          onClick={() => onTimeChange(Math.max(0, currentTimeMin - 5))}
          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white transition cursor-pointer border border-slate-700"
          title="Step back 5 min"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* NOW Badge (0 min) */}
        <button
          onClick={() => onTimeChange(0)}
          className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition cursor-pointer shrink-0 ${
            currentTimeMin === 0 
              ? 'bg-emerald-600 text-white shadow-md' 
              : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
          }`}
        >
          NOW
        </button>

        {/* 0 to +180 min Slider (5 min steps) */}
        <div className="relative flex-1 flex items-center mx-2">
          <input
            type="range"
            min={0}
            max={180}
            step={5}
            value={currentTimeMin}
            onChange={(e) => onTimeChange(Number(e.target.value))}
            className="w-full h-2.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500 focus:outline-none"
          />

          {/* Peak Rain Marker Tick */}
          <div 
            className="absolute top-0 bottom-0 w-1 bg-amber-400 pointer-events-none rounded-full"
            style={{ left: `${(peakTimeMin / 180) * 100}%` }}
            title={`Peak rain at +${peakTimeMin} min`}
          />
        </div>

        <button
          onClick={() => onTimeChange(Math.min(180, currentTimeMin + 5))}
          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white transition cursor-pointer border border-slate-700"
          title="Step forward 5 min"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        {/* Current Time Display */}
        <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-700 px-3.5 py-1.5 rounded-xl shrink-0 shadow-inner">
          <span className="text-[11px] text-slate-400 font-mono">T:</span>
          <span className="text-base font-mono font-extrabold text-blue-300">
            +{currentTimeMin} min
          </span>
          <span className="text-xs text-slate-400 font-mono">/ +180m</span>
        </div>
      </div>
    </div>
  );
}
