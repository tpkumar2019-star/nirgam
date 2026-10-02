import React from 'react';
import { X, Navigation, Clock, ShieldCheck, AlertTriangle, ArrowRight, Zap, CheckCircle2 } from 'lucide-react';
import { VEHICLE_PROFILES } from '../data/nirgamData';

export default function RoutePlannerPanel({
  routeResult,
  departTimeMin,
  onDepartTimeChange,
  activeVehicle,
  onVehicleChange,
  onClose
}) {
  if (!routeResult) return null;

  const currentVehicleProfile = VEHICLE_PROFILES[activeVehicle] || VEHICLE_PROFILES.ambulance;

  return (
    <div className="fixed top-20 left-4 z-30 w-96 max-w-[90vw] bg-slate-900/95 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-700/80 overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in slide-in-from-left-4 duration-200">
      {/* Header */}
      <div className="p-4 border-b border-slate-700/80 flex items-start justify-between bg-slate-950/70">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Navigation className="w-4 h-4 text-blue-400" />
            <span className="font-mono text-xs text-blue-300 uppercase font-bold tracking-wider">
              DYNAMIC TIME-AWARE ROUTER
            </span>
          </div>
          <h2 className="text-base font-bold text-white font-display leading-tight">
            Flood-Safe Corridor Navigation
          </h2>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="p-4 overflow-y-auto space-y-4 text-xs">
        {/* Vehicle Profile Selector */}
        <div>
          <div className="text-[11px] font-mono text-slate-300 font-bold mb-2">VEHICLE PROFILE & MAX WADE DEPTH:</div>
          <div className="grid grid-cols-3 gap-1.5">
            {Object.entries(VEHICLE_PROFILES).map(([key, v]) => (
              <button
                key={key}
                onClick={() => onVehicleChange(key)}
                className={`p-2 rounded-xl border text-center transition cursor-pointer flex flex-col items-center gap-1 shadow-sm ${
                  activeVehicle === key
                    ? 'bg-blue-600 text-white border-blue-400 font-bold shadow-md'
                    : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800/80'
                }`}
              >
                <span className="text-xs font-semibold">{v.name.split('/')[0]}</span>
                <span className={`font-mono text-[10px] font-bold ${activeVehicle === key ? 'text-blue-100' : 'text-blue-400'}`}>
                  {v.maxWadeCm} cm max
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Departure Time Horizon Slider */}
        <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-xl shadow-inner">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-mono text-slate-300 font-semibold flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-blue-400" />
              <span>DEPARTURE TIME:</span>
            </span>
            <span className="font-mono font-bold text-cyan-300 text-xs">
              +{departTimeMin} min ({departTimeMin === 0 ? 'Depart Now' : `in ${departTimeMin}m`})
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={60}
            step={5}
            value={departTimeMin}
            onChange={(e) => onDepartTimeChange(Number(e.target.value))}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
          />
          <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-1">
            <span>Now (+0m)</span>
            <span>+15m</span>
            <span>+30m</span>
            <span>+45m</span>
            <span>+60m</span>
          </div>
        </div>

        {/* Departure Advisor Card */}
        <div className="bg-gradient-to-r from-blue-950/80 to-indigo-950/80 border border-blue-500/50 p-3.5 rounded-xl flex items-start gap-2.5 shadow-md">
          <Zap className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <div className="text-[10px] font-mono text-cyan-300 uppercase font-bold tracking-wider">
              DEPARTURE ADVISOR
            </div>
            <p className="text-xs text-white font-sans leading-relaxed mt-0.5">
              {routeResult.departureAdvisor}
            </p>
          </div>
        </div>

        {/* Dual Route Comparison Cards */}
        <div className="space-y-2.5">
          {/* Safe Route */}
          <div className="bg-emerald-950/40 border border-emerald-500/60 p-3.5 rounded-xl shadow-md">
            <div className="flex items-center justify-between mb-1.5">
              <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-300">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>FLOOD-SAFE CORRIDOR</span>
              </span>
              <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-900 text-emerald-100 border border-emerald-500">
                {routeResult.safeRoute.etaDiffMin}
              </span>
            </div>

            <div className="flex items-baseline justify-between text-xs mb-2">
              <span className="text-slate-300 font-medium">
                {routeResult.safeRoute.distanceKm} km | {routeResult.safeRoute.travelTimeMin} min ETA
              </span>
              <span className="font-mono text-xs text-emerald-300 font-bold">
                Max depth: {routeResult.safeRoute.maxDepthEncounteredCm} cm (Safe)
              </span>
            </div>

            <div className="text-[11px] text-slate-200 bg-slate-900/90 px-2.5 py-1.5 rounded-lg border border-slate-800">
              Corridor: Elphinstone Elevated Ramp → Western Express Highway Flyovers → Gokhale Bypass.
            </div>
          </div>

          {/* Usual Fastest Route (Blocked) */}
          <div className="bg-rose-950/40 border border-rose-500/60 p-3.5 rounded-xl shadow-md">
            <div className="flex items-center justify-between mb-1">
              <span className="flex items-center gap-1.5 text-xs font-bold text-rose-300">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                <span>USUAL FASTEST ROUTE (BLOCKED)</span>
              </span>
              <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-rose-900 text-rose-100 border border-rose-500 font-extrabold">
                DROWNS
              </span>
            </div>

            <p className="text-xs text-slate-200 leading-relaxed font-sans">
              Fails at: <strong className="text-rose-300">{routeResult.usualRoute.blockingPoint}</strong>. Water depth exceeds vehicle wade clearance.
            </p>
          </div>
        </div>

        {/* Avoided Corridors */}
        <div>
          <div className="text-[11px] font-mono text-slate-300 uppercase tracking-wider font-bold mb-2">
            CORRIDORS AVOIDED & FAILURE REASONS
          </div>

          <div className="space-y-2">
            {routeResult.avoidedStreets.map((avoided, idx) => (
              <div key={idx} className="bg-slate-950/70 border border-slate-800 p-3 rounded-xl shadow-sm">
                <div className="flex items-center justify-between mb-1 font-bold text-white text-xs">
                  <span>{avoided.name}</span>
                  <span className="font-mono text-rose-400 text-xs">
                    {avoided.depthAtArrivalCm} cm &gt; {avoided.maxWadeLimitCm} cm
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed font-sans">
                  {avoided.reason}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
