import React from 'react';
import { Clock, Droplets, CloudRain, AlertTriangle, ArrowRight, ShieldAlert } from 'lucide-react';
import RainfallChart from '../charts/RainfallChart';
import DepthTimelineChart from '../charts/DepthTimelineChart';
import DrainageLoadChart from '../charts/DrainageLoadChart';

export default function FloodForecastPage({
  forecastTimeline,
  currentTimeMin,
  onTimeChange,
  stepData,
  onSelectRoad
}) {
  const epochSteps = [0, 30, 60, 90, 120, 180];

  const getStepMetrics = (tMin) => {
    return forecastTimeline.find(item => item.time_min === tMin) || {};
  };

  return (
    <div className="h-full overflow-y-auto p-6 space-y-6 bg-slate-50 text-slate-800 max-w-5xl mx-auto">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-slate-200 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1 rounded-lg bg-blue-50 border border-blue-200 text-blue-700">
              <Clock className="w-5 h-5" />
            </div>
            <h1 className="text-lg font-bold text-slate-900 font-display tracking-tight">
              0–3 HOUR NOWCAST EVOLUTION & RISK PROGRESSION
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Forward-looking flood depths, overland accumulation, and road hazard window across 15-minute time steps.
          </p>
        </div>

        {/* Current Active Step Badge */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-blue-50 border border-blue-200 text-xs font-mono">
          <span className="text-blue-700 font-bold">Current Forecast Epoch:</span>
          <span className="text-slate-900 font-extrabold">{currentTimeMin === 0 ? 'NOW' : `+${currentTimeMin} min`}</span>
        </div>
      </div>

      {/* Epoch Comparison Quick Cards (NOW, +30, +60, +90, +120, +180) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
        {epochSteps.map((epoch) => {
          const metrics = getStepMetrics(epoch);
          const isSelected = currentTimeMin === epoch;

          return (
            <button
              key={epoch}
              onClick={() => onTimeChange(epoch)}
              className={`p-3.5 rounded-2xl border text-left transition cursor-pointer space-y-2 shadow-sm ${
                isSelected
                  ? 'bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'bg-white border-slate-200 hover:border-blue-400 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={`font-mono text-xs font-bold ${isSelected ? 'text-white' : 'text-slate-700'}`}>
                  {epoch === 0 ? 'NOW' : `+${epoch}m`}
                </span>
                <span className={`w-2.5 h-2.5 rounded-full ${
                  metrics.max_flood_depth_cm > 30 ? (isSelected ? 'bg-rose-300' : 'bg-rose-500') :
                  metrics.max_flood_depth_cm > 15 ? (isSelected ? 'bg-amber-300' : 'bg-amber-500') : (isSelected ? 'bg-emerald-300' : 'bg-emerald-500')
                }`} />
              </div>

              <div className={`font-mono text-xl font-extrabold ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                {metrics.max_flood_depth_cm || 0} cm
              </div>

              <div className={`text-[10px] space-y-0.5 font-sans ${isSelected ? 'text-blue-100' : 'text-slate-500'}`}>
                <div>Rain: <span className="font-mono font-bold">{metrics.rainfall_intensity_mm_hr || 0} mm/h</span></div>
                <div>Risk: <span className="font-mono font-bold">{metrics.roads_at_risk || 0} roads</span></div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <RainfallChart
            forecastTimeline={forecastTimeline}
            currentTimeMin={currentTimeMin}
          />
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <DepthTimelineChart
            forecastTimeline={forecastTimeline}
            currentTimeMin={currentTimeMin}
          />
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <DrainageLoadChart
          forecastTimeline={forecastTimeline}
        />
      </div>

      {/* Flooded Roads At Current Epoch */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3.5">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <span className="font-bold text-slate-900 font-display text-xs">
            Road Inundation Predictions at +{currentTimeMin} min
          </span>
          <span className="text-[10px] font-mono text-slate-500 font-semibold">
            {stepData?.roads_at_risk_count || 0} Segments Exceeding Vehicle Clearance
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
          {(stepData?.roads || []).map((road) => (
            <div
              key={road.road_id}
              onClick={() => onSelectRoad && onSelectRoad(road)}
              className="p-3 rounded-xl bg-slate-50 border border-slate-200 hover:border-blue-400 hover:bg-slate-100 cursor-pointer transition space-y-1.5 shadow-sm"
            >
              <div className="flex justify-between items-start">
                <span className="font-bold text-slate-900 leading-tight">{road.name}</span>
                <span className={`font-mono font-extrabold text-xs px-2 py-0.5 rounded-full ${
                  road.current_depth_cm > 30 ? 'bg-rose-100 text-rose-700' :
                  road.current_depth_cm > 15 ? 'bg-amber-100 text-amber-800' :
                  road.current_depth_cm > 5 ? 'bg-yellow-100 text-yellow-800' : 'bg-emerald-100 text-emerald-800'
                }`}>
                  {road.current_depth_cm} cm
                </span>
              </div>
              <div className="flex justify-between text-[11px] text-slate-600 font-medium">
                <span>Elev: {road.elevation_m}m</span>
                <span className={`font-bold ${road.is_passable ? 'text-emerald-700' : 'text-rose-700'}`}>
                  {road.is_passable ? 'Passable' : 'IMPASSABLE'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
