import React from 'react';
import { ResponsiveContainer, BarChart, Bar, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';

export default function DrainageLoadChart({ forecastTimeline }) {
  if (!forecastTimeline || forecastTimeline.length === 0) return null;

  const data = forecastTimeline.map((item) => ({
    time: item.label,
    time_min: item.time_min,
    surchargeVol: Math.round(item.total_surcharged_water_m3),
    criticalNodes: item.critical_nodes,
    roadsAtRisk: item.roads_at_risk
  }));

  return (
    <div className="bg-slate-900/90 rounded-xl p-3 border border-slate-800 shadow-md">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-slate-200">Drainage Surcharge & Road Risk</span>
        <span className="text-[10px] font-mono text-amber-400">Node Hydraulic Failure</span>
      </div>
      <div className="h-40 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 10 }} />
            <YAxis yAxisId="left" stroke="#f59e0b" tick={{ fontSize: 10 }} label={{ value: 'm³', angle: -90, position: 'insideLeft', fill: '#f59e0b', fontSize: 9 }} />
            <YAxis yAxisId="right" orientation="right" stroke="#f43f5e" tick={{ fontSize: 10 }} label={{ value: 'count', angle: 90, position: 'insideRight', fill: '#f43f5e', fontSize: 9 }} />
            <Tooltip
              contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.5rem', fontSize: '11px' }}
            />
            <Bar yAxisId="left" dataKey="surchargeVol" name="Surcharge Volume (m³)" fill="#f59e0b" radius={[3, 3, 0, 0]} />
            <Line yAxisId="right" type="monotone" dataKey="roadsAtRisk" name="Roads at Risk" stroke="#f43f5e" strokeWidth={2} dot={{ r: 2 }} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
