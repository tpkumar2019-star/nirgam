import React from 'react';
import { ResponsiveContainer, BarChart, Bar, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';

export default function RainfallChart({ forecastTimeline, currentTimeMin }) {
  if (!forecastTimeline || forecastTimeline.length === 0) return null;

  const data = forecastTimeline.map((item) => ({
    time: item.label,
    time_min: item.time_min,
    rainfall: item.rainfall_intensity_mm_hr,
    cumulative: item.cumulative_rainfall_mm
  }));

  return (
    <div className="bg-slate-900/90 rounded-xl p-3 border border-slate-800 shadow-md">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-slate-200">Radar Rainfall Hyetograph</span>
        <span className="text-[10px] font-mono text-cyan-400">Doppler Nowcast (0–3h)</span>
      </div>
      <div className="h-40 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 10 }} />
            <YAxis yAxisId="left" stroke="#38bdf8" tick={{ fontSize: 10 }} label={{ value: 'mm/h', angle: -90, position: 'insideLeft', fill: '#38bdf8', fontSize: 9 }} />
            <YAxis yAxisId="right" orientation="right" stroke="#818cf8" tick={{ fontSize: 10 }} label={{ value: 'cum mm', angle: 90, position: 'insideRight', fill: '#818cf8', fontSize: 9 }} />
            <Tooltip
              contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.5rem', fontSize: '11px' }}
              labelStyle={{ color: '#38bdf8', fontWeight: 'bold' }}
            />
            <Bar yAxisId="left" dataKey="rainfall" name="Rain Intensity (mm/h)" fill="#06b6d4" radius={[3, 3, 0, 0]} />
            <Line yAxisId="right" type="monotone" dataKey="cumulative" name="Cumulative (mm)" stroke="#818cf8" strokeWidth={2} dot={{ r: 2 }} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
