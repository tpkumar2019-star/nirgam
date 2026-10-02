import React from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export default function DepthTimelineChart({ forecastTimeline, currentTimeMin }) {
  if (!forecastTimeline || forecastTimeline.length === 0) return null;

  const data = forecastTimeline.map((item) => ({
    time: item.label,
    time_min: item.time_min,
    maxDepth: item.max_flood_depth_cm,
    surfaceWater: item.total_surface_water_m3
  }));

  return (
    <div className="bg-slate-900/90 rounded-xl p-3 border border-slate-800 shadow-md">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-slate-200">Max Inundation Depth Evolution</span>
        <span className="text-[10px] font-mono text-rose-400">Peak Street Depth (cm)</span>
      </div>
      <div className="h-40 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="depthGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.6}/>
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0.0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 10 }} />
            <YAxis stroke="#f87171" tick={{ fontSize: 10 }} label={{ value: 'cm', angle: -90, position: 'insideLeft', fill: '#f87171', fontSize: 9 }} />
            <Tooltip
              contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.5rem', fontSize: '11px' }}
              labelStyle={{ color: '#f87171', fontWeight: 'bold' }}
            />
            <Area
              type="monotone"
              dataKey="maxDepth"
              name="Peak Flood Depth (cm)"
              stroke="#ef4444"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#depthGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
