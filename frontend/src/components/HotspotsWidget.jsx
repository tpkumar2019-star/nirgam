import React from 'react';
import { AlertTriangle, Clock, Droplets, MapPin, ArrowRight, ShieldAlert, Activity } from 'lucide-react';

export default function HotspotsWidget({ hotspots, onSelectHotspot, currentTimeMin }) {
  if (!hotspots || hotspots.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-4 border border-slate-200 text-xs text-slate-500 text-center shadow-sm">
        No active flood hotspots derived at this timestep.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-3">
      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-lg bg-rose-50 border border-rose-200 text-rose-600">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <h2 className="text-sm font-bold text-slate-900 font-display">Top Derived Flood Hotspots</h2>
        </div>
        <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 font-bold">
          Ranked (+{currentTimeMin}m)
        </span>
      </div>

      <div className="space-y-2">
        {hotspots.map((hs, idx) => (
          <div
            key={hs.hotspot_id}
            onClick={() => onSelectHotspot(hs)}
            className="p-3 rounded-xl bg-slate-50/80 hover:bg-slate-100 border border-slate-200 hover:border-blue-400 cursor-pointer transition text-xs space-y-2 group shadow-sm"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-slate-200 group-hover:bg-rose-100 group-hover:text-rose-700 font-mono text-[10px] flex items-center justify-center font-bold text-slate-700">
                  {idx + 1}
                </span>
                <span className="font-bold text-slate-900 group-hover:text-blue-700 leading-tight">
                  {hs.name}
                </span>
              </div>
              <div className="text-right shrink-0">
                <span className={`font-mono font-extrabold text-xs px-2 py-0.5 rounded-full ${
                  hs.predicted_depth_cm > 30 ? 'bg-rose-100 text-rose-700 border border-rose-300' :
                  hs.predicted_depth_cm > 15 ? 'bg-amber-100 text-amber-800 border border-amber-300' :
                  'bg-blue-100 text-blue-800 border border-blue-300'
                }`}>
                  {hs.predicted_depth_cm} cm
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 pt-1.5 border-t border-slate-200/70 font-medium">
              <div className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-amber-600" />
                <span>Time to Critical: <strong className="text-slate-900">+{hs.time_to_critical_min}m</strong></span>
              </div>
              <div className="flex items-center gap-1">
                <Droplets className="w-3.5 h-3.5 text-blue-600" />
                <span>Elevation: <strong className="text-slate-900">{hs.elevation_m}m</strong></span>
              </div>
            </div>

            <div className="text-[11px] text-slate-600 bg-white p-2 rounded-lg border border-slate-200">
              <span className="text-blue-700 font-bold">Primary Cause:</span> {hs.primary_cause}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
