import React from 'react';
import { Play, Pause, RotateCcw, ChevronLeft, ChevronRight, Clock } from 'lucide-react';

export default function TimeSlider({ currentTimeMin, onTimeChange, isPlaying, onTogglePlay, onReset, forecastSummary }) {
  const timeSteps = [0, 15, 30, 45, 60, 75, 90, 105, 120, 135, 150, 165, 180];

  const handleStepPrev = () => {
    const idx = timeSteps.indexOf(currentTimeMin);
    if (idx > 0) onTimeChange(timeSteps[idx - 1]);
  };

  const handleStepNext = () => {
    const idx = timeSteps.indexOf(currentTimeMin);
    if (idx < timeSteps.length - 1) onTimeChange(timeSteps[idx + 1]);
  };

  return (
    <div className="bg-white/95 border-t border-slate-200 px-5 py-2.5 shadow-md">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Playback Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={onTogglePlay}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold tracking-wide transition shadow-sm cursor-pointer ${
              isPlaying
                ? 'bg-amber-600 hover:bg-amber-500 text-white'
                : 'bg-blue-600 hover:bg-blue-500 text-white'
            }`}
          >
            {isPlaying ? (
              <>
                <Pause className="w-3.5 h-3.5 fill-current" />
                <span>PAUSE</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>SIMULATE</span>
              </>
            )}
          </button>

          <button
            onClick={handleStepPrev}
            disabled={currentTimeMin === 0}
            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 disabled:opacity-40 transition cursor-pointer"
            title="Previous step (-15 min)"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <button
            onClick={handleStepNext}
            disabled={currentTimeMin === 180}
            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 disabled:opacity-40 transition cursor-pointer"
            title="Next step (+15 min)"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          <button
            onClick={onReset}
            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
            title="Reset to t=0"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Current Time Display */}
          <div className="ml-2 flex items-center gap-2 px-3 py-1 rounded-lg bg-blue-50 border border-blue-200">
            <Clock className="w-3.5 h-3.5 text-blue-700" />
            <span className="text-xs text-slate-600 font-semibold">Horizon:</span>
            <span className="text-sm font-bold font-mono text-blue-900">
              {currentTimeMin === 0 ? 'NOW (t=0)' : `+${currentTimeMin} min`}
            </span>
          </div>
        </div>

        {/* Interactive Scrub Slider */}
        <div className="flex-1 w-full max-w-2xl px-2">
          <div className="relative">
            <input
              type="range"
              min={0}
              max={180}
              step={15}
              value={currentTimeMin}
              onChange={(e) => onTimeChange(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600 focus:outline-none"
            />
            {/* Ticks */}
            <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-1 px-1">
              {timeSteps.map((t) => (
                <button
                  key={t}
                  onClick={() => onTimeChange(t)}
                  className={`hover:text-blue-600 transition font-medium cursor-pointer ${
                    t === currentTimeMin ? 'text-blue-700 font-extrabold scale-110' : ''
                  }`}
                >
                  {t === 0 ? 'NOW' : `+${t}m`}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Legend Hint */}
        <div className="hidden xl:flex items-center gap-3 text-[11px] text-slate-600 border-l border-slate-200 pl-4 font-medium">
          <span className="text-slate-500">Hazard Depths:</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> &lt;5cm</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> 5-15cm</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span> 15-30cm</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-rose-600"></span> &gt;30cm</span>
        </div>
      </div>
    </div>
  );
}
