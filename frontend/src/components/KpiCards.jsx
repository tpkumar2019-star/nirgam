import React from 'react';
import { CloudRain, AlertTriangle, Droplets, Network, Gauge, Clock, Zap, ArrowUpRight, Flame, ShieldCheck } from 'lucide-react';

export default function KpiCards({ stepData, forecastSummary, onQuickScenario }) {
  if (!stepData) return null;

  const maxPeakRain = forecastSummary && forecastSummary.length > 0 
    ? Math.max(...forecastSummary.map(s => s.rainfall_intensity_mm_hr)) 
    : stepData.rainfall_intensity_mm_hr;

  return (
    <div className="bg-white border-b border-slate-200/90 px-4 py-3 space-y-2.5 shadow-sm">
      {/* 1. Main Telemetry Cards Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Card 1: Spatial Rainfall Intensity */}
        <div className="glass-card rounded-xl p-3 border border-slate-200 hover:border-cyan-500 transition duration-200 relative overflow-hidden group">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider font-mono">Radar Rain</span>
            <div className="p-1 rounded-lg bg-cyan-50 border border-cyan-200 text-cyan-700">
              <CloudRain className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-extrabold font-outfit text-slate-900 tracking-tight">
              {stepData.rainfall_intensity_mm_hr}
            </span>
            <span className="text-xs font-mono text-cyan-700 font-bold">mm/h</span>
          </div>
          <div className="mt-2 space-y-1">
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
              <div 
                className="bg-gradient-to-r from-cyan-500 to-blue-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, (stepData.rainfall_intensity_mm_hr / 120) * 100)}%` }}
              />
            </div>
            <div className="text-[10px] font-mono text-slate-500 flex items-center justify-between">
              <span>Cum: {stepData.cumulative_rainfall_mm} mm</span>
              <span className="text-cyan-700 font-bold">{stepData.timestamp_label}</span>
            </div>
          </div>
        </div>

        {/* Card 2: Peak Forecast Nowcast */}
        <div className="glass-card rounded-xl p-3 border border-slate-200 hover:border-blue-500 transition duration-200 relative overflow-hidden group">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider font-mono">Peak Forecast</span>
            <div className="p-1 rounded-lg bg-blue-50 border border-blue-200 text-blue-700">
              <Gauge className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-extrabold font-outfit text-slate-900 tracking-tight">
              {maxPeakRain}
            </span>
            <span className="text-xs font-mono text-blue-700 font-bold">mm/h</span>
          </div>
          <div className="mt-2 space-y-1">
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
              <div 
                className="bg-gradient-to-r from-blue-500 to-indigo-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, (maxPeakRain / 120) * 100)}%` }}
              />
            </div>
            <div className="text-[10px] font-mono text-slate-500 flex items-center justify-between">
              <span>Convective burst</span>
              <span className="text-blue-700 font-bold">+60m~+75m</span>
            </div>
          </div>
        </div>

        {/* Card 3: Hazard Corridors */}
        <div className="glass-card rounded-xl p-3 border border-slate-200 hover:border-amber-500 transition duration-200 relative overflow-hidden group">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider font-mono">Hazard Corridors</span>
            <div className={`p-1 rounded-lg border ${stepData.roads_at_risk_count > 0 ? 'bg-amber-50 border-amber-300 text-amber-700' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>
              <AlertTriangle className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className={`text-2xl font-extrabold font-outfit tracking-tight ${stepData.roads_at_risk_count > 0 ? 'text-amber-600' : 'text-slate-900'}`}>
              {stepData.roads_at_risk_count}
            </span>
            <span className="text-xs font-mono text-slate-500">streets</span>
          </div>
          <div className="mt-2 space-y-1">
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
              <div 
                className="bg-gradient-to-r from-amber-500 to-rose-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, (stepData.roads_at_risk_count / 8) * 100)}%` }}
              />
            </div>
            <div className="text-[10px] font-mono text-slate-500 flex items-center justify-between">
              <span>Limit: &gt;15 cm depth</span>
              <span className={stepData.roads_at_risk_count > 0 ? 'text-amber-700 font-bold' : 'text-slate-500'}>
                {stepData.roads_at_risk_count > 0 ? 'DIVERSION' : 'PASSABLE'}
              </span>
            </div>
          </div>
        </div>

        {/* Card 4: Surcharging Manholes */}
        <div className="glass-card rounded-xl p-3 border border-slate-200 hover:border-rose-500 transition duration-200 relative overflow-hidden group">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider font-mono">Drain Surcharges</span>
            <div className={`p-1 rounded-lg border ${stepData.critical_nodes_count > 0 ? 'bg-rose-50 border-rose-300 text-rose-700 animate-pulse' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>
              <Network className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className={`text-2xl font-extrabold font-outfit tracking-tight ${stepData.critical_nodes_count > 0 ? 'text-rose-600' : 'text-emerald-700'}`}>
              {stepData.critical_nodes_count}
            </span>
            <span className="text-xs font-mono text-slate-500">inlets</span>
          </div>
          <div className="mt-2 space-y-1">
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
              <div 
                className="bg-gradient-to-r from-rose-500 to-red-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, (stepData.critical_nodes_count / 6) * 100)}%` }}
              />
            </div>
            <div className="text-[10px] font-mono text-slate-500 flex items-center justify-between">
              <span>Backflow Vol</span>
              <span className="text-rose-600 font-bold">{stepData.total_surcharged_water_m3} m³</span>
            </div>
          </div>
        </div>

        {/* Card 5: Maximum Street Water Depth */}
        <div className="glass-card rounded-xl p-3 border border-slate-200 hover:border-cyan-500 transition duration-200 relative overflow-hidden group">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider font-mono">Peak Inundation</span>
            <div className="p-1 rounded-lg bg-cyan-50 border border-cyan-200 text-cyan-700">
              <Droplets className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className={`text-2xl font-extrabold font-outfit tracking-tight ${
              stepData.max_flood_depth_cm > 30 ? 'text-rose-600' : (stepData.max_flood_depth_cm > 15 ? 'text-amber-600' : 'text-blue-700')
            }`}>
              {stepData.max_flood_depth_cm}
            </span>
            <span className="text-xs font-mono text-slate-600 font-bold">cm</span>
          </div>
          <div className="mt-2 space-y-1">
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
              <div 
                className="bg-gradient-to-r from-emerald-500 via-amber-500 to-rose-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, (stepData.max_flood_depth_cm / 50) * 100)}%` }}
              />
            </div>
            <div className="text-[10px] font-mono text-slate-500 flex items-center justify-between">
              <span>Overland Water</span>
              <span className="text-slate-800 font-bold">{Math.round(stepData.total_surface_water_m3)} m³</span>
            </div>
          </div>
        </div>

        {/* Card 6: Dynamic Evacuation Route Status */}
        <div className="glass-card rounded-xl p-3 border border-slate-200 hover:border-emerald-500 transition duration-200 relative overflow-hidden group">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider font-mono">Route Status</span>
            <div className="p-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700">
              <ShieldCheck className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl font-extrabold font-outfit text-emerald-700 tracking-tight">
              SAFE PASSAGE
            </span>
          </div>
          <div className="mt-2 space-y-1">
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
              <div className="bg-emerald-500 h-full rounded-full w-full" />
            </div>
            <div className="text-[10px] font-mono text-slate-500 flex items-center justify-between">
              <span>Hospital → Shelter</span>
              <span className="text-emerald-700 font-bold">BYPASS ON</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Fast Scenario Trigger Presets Deck */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-200 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono text-slate-600 uppercase font-bold flex items-center gap-1">
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            <span>Interactive Causal Scenarios:</span>
          </span>
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => onQuickScenario && onQuickScenario('severe_monsoon', 95.0, { 'P-104': 75.0 })}
              className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 border border-rose-300 text-rose-800 text-[11px] font-semibold transition cursor-pointer flex items-center gap-1 shadow-sm"
            >
              <span>🚨 Underpass Choke (75% Silt + 95mm/h Rain)</span>
            </button>
            <button
              onClick={() => onQuickScenario && onQuickScenario('cloudburst', 120.0, { 'P-104': 30.0 })}
              className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 border border-blue-300 text-blue-800 text-[11px] font-semibold transition cursor-pointer flex items-center gap-1 shadow-sm"
            >
              <span>⚡ Cloudburst Peak (120 mm/h Rain)</span>
            </button>
            <button
              onClick={() => onQuickScenario && onQuickScenario('clean_drains', 70.0, { 'P-104': 0.0 })}
              className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800 text-[11px] font-semibold transition cursor-pointer flex items-center gap-1 shadow-sm"
            >
              <span>🛡️ Pre-Monsoon Desilted (0% Blockage)</span>
            </button>
            <button
              onClick={() => onQuickScenario && onQuickScenario('moderate', 40.0, { 'P-104': 20.0 })}
              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 text-[11px] font-medium transition cursor-pointer"
            >
              <span>🌧️ Moderate Monsoon (40 mm/h)</span>
            </button>
          </div>
        </div>

        <div className="text-[10px] font-mono text-slate-500 font-medium">
          Coupled Surface ↔ Subsurface Hydrodynamics (MoES / NCMRWF)
        </div>
      </div>
    </div>
  );
}
