import React from 'react';
import { X, MapPin, Network, Activity, ShieldCheck, AlertTriangle, Droplets } from 'lucide-react';

export default function LocationDetails({ selectedItem, onClose, currentTimeMin }) {
  if (!selectedItem) {
    return (
      <div className="bg-white rounded-2xl p-4 border border-slate-200 text-slate-500 text-xs text-center flex flex-col items-center justify-center min-h-[160px] shadow-sm">
        <MapPin className="w-8 h-8 text-slate-400 mb-2 stroke-[1.5]" />
        <p className="font-bold text-slate-800">No Location Selected</p>
        <p className="text-[11px] text-slate-500 mt-1 max-w-[220px]">
          Click on any road segment or drainage node on the GIS map to inspect live hydraulic parameters.
        </p>
      </div>
    );
  }

  const isRoad = selectedItem.type === 'road';
  const data = selectedItem.data;

  return (
    <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm text-xs space-y-3">
      {/* Header */}
      <div className="flex items-start justify-between pb-2 border-b border-slate-100">
        <div className="flex items-center gap-2">
          {isRoad ? (
            <div className="p-1.5 rounded-lg bg-amber-50 text-amber-700 border border-amber-200">
              <MapPin className="w-4 h-4" />
            </div>
          ) : (
            <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200">
              <Network className="w-4 h-4" />
            </div>
          )}
          <div>
            <h3 className="font-bold text-slate-900 text-sm leading-tight font-display">{data.name}</h3>
            <span className="font-mono text-[10px] text-blue-700 font-semibold uppercase">
              {isRoad ? `Road ID: ${data.road_id}` : `Node ID: ${data.node_id} (${data.node_type})`}
            </span>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-800 transition cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {isRoad ? (
        /* Road Inspection Details */
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
              <span className="text-slate-500 text-[10px] font-medium block">Current Depth</span>
              <span className="text-base font-extrabold font-mono text-blue-700">
                {data.predicted_depth_cm?.[String(currentTimeMin)] ?? data.current_depth_cm ?? 0.0} cm
              </span>
            </div>
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
              <span className="text-slate-500 text-[10px] font-medium block">Risk Classification</span>
              <span className={`text-xs font-bold ${
                data.risk_level === 'Critical' ? 'text-rose-700' :
                data.risk_level === 'Severe' ? 'text-orange-700' :
                data.risk_level === 'High' ? 'text-amber-700' : 'text-emerald-700'
              }`}>
                {data.risk_level}
              </span>
            </div>
          </div>

          {/* 0-3h Forecast Table */}
          <div>
            <span className="font-bold text-slate-700 block mb-1.5 text-[11px]">0–3 Hour Inundation Profile:</span>
            <div className="grid grid-cols-6 gap-1 bg-slate-50 p-2 rounded-xl border border-slate-200 text-center font-mono text-[11px]">
              {['0', '30', '60', '90', '120', '180'].map((m) => {
                const depth = data.predicted_depth_cm?.[m] ?? 0.0;
                const isSelected = String(currentTimeMin) === m;
                return (
                  <div key={m} className={`p-1 rounded-lg ${isSelected ? 'bg-blue-600 text-white font-bold' : 'text-slate-600 bg-white border border-slate-200'}`}>
                    <div className={`text-[9px] ${isSelected ? 'text-blue-100' : 'text-slate-400'}`}>+{m}m</div>
                    <div className={depth > 15 && !isSelected ? 'text-amber-700 font-bold' : (depth > 30 && !isSelected ? 'text-rose-700 font-bold' : '')}>
                      {depth}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-slate-600 text-[11px] font-medium bg-slate-50 p-2.5 rounded-xl border border-slate-200">
            <div>Length: <span className="text-slate-900 font-mono font-bold">{data.length_m} m</span></div>
            <div>Elevation: <span className="text-slate-900 font-mono font-bold">{data.elevation_m} m</span></div>
            <div>Safe Speed: <span className="text-slate-900 font-mono font-bold">{data.is_passable ? `${data.speed_limit_kmh} km/h` : 'IMPASSABLE'}</span></div>
            <div>Nearby Inlets: <span className="text-slate-900 font-mono font-bold">{data.nearby_drain_nodes?.join(', ') || 'N-104'}</span></div>
          </div>
        </div>
      ) : (
        /* Drainage Node Inspection Details */
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
              <span className="text-slate-500 text-[10px] font-medium block">Manning Capacity</span>
              <span className="text-base font-extrabold font-mono text-emerald-700">
                {data.inlet_capacity_m3_s} m³/s
              </span>
            </div>
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
              <span className="text-slate-500 text-[10px] font-medium block">Hydraulic Status</span>
              <span className={`text-xs font-bold font-mono ${
                data.is_surcharged ? 'text-rose-700' :
                data.utilization_pct > 75 ? 'text-amber-700' : 'text-emerald-700'
              }`}>
                {data.status}
              </span>
            </div>
          </div>

          <div className="space-y-1.5 bg-slate-50 p-3 rounded-xl border border-slate-200 font-medium">
            <div className="flex justify-between">
              <span className="text-slate-600">Pipe Load Utilization:</span>
              <span className="font-mono text-slate-900 font-bold">{data.utilization_pct}%</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
              <div
                className={`h-full transition-all ${
                  data.utilization_pct > 100 ? 'bg-rose-600' :
                  data.utilization_pct > 75 ? 'bg-amber-500' : 'bg-emerald-600'
                }`}
                style={{ width: `${Math.min(100, data.utilization_pct)}%` }}
              />
            </div>
            <div className="flex justify-between pt-1">
              <span className="text-slate-600">Surcharge Volume:</span>
              <span className="font-mono text-rose-700 font-bold">{data.surcharge_volume_m3} m³</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Ground / Invert Elevation:</span>
              <span className="font-mono text-slate-900">{data.ground_elevation_m}m / {data.invert_elevation_m}m</span>
            </div>
          </div>

          {data.is_surcharged && (
            <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
              <span className="font-medium">Downstream conveyance bottlenecked. Water surcharging onto surface street!</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
