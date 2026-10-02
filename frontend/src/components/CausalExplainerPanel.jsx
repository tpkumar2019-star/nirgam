import React from 'react';
import { X, CloudRain, Mountain, Network, AlertCircle, BarChart2, ShieldCheck, Car, Bike, User } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

export default function CausalExplainerPanel({ street, onClose, currentTimeMin }) {
  if (!street) return null;

  const currentDepth = Math.round(street.currentDepthCm);
  const isImpassable = street.status === 'IMPASSABLE';
  const isHazard = street.status === 'HAZARDOUS';

  const icons = [
    <CloudRain className="w-4 h-4 text-blue-400" />,
    <Mountain className="w-4 h-4 text-cyan-400" />,
    <Network className="w-4 h-4 text-amber-400" />,
    <AlertCircle className="w-4 h-4 text-rose-400" />,
    <BarChart2 className="w-4 h-4 text-emerald-400" />
  ];

  return (
    <div className="fixed top-20 left-4 z-30 w-96 max-w-[90vw] bg-slate-900/95 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-700/80 overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in slide-in-from-left-4 duration-200">
      {/* Header */}
      <div className="p-4 border-b border-slate-700/80 flex items-start justify-between bg-slate-950/70">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-xs text-blue-400 font-bold uppercase">
              {street.ward}
            </span>
            <span
              className={`text-[10px] font-mono font-extrabold px-2 py-0.5 rounded border ${
                isImpassable
                  ? 'bg-rose-950 text-rose-200 border-rose-600'
                  : isHazard
                  ? 'bg-amber-950 text-amber-200 border-amber-600'
                  : 'bg-emerald-950 text-emerald-200 border-emerald-600'
              }`}
            >
              {street.status}
            </span>
          </div>
          <h2 className="text-base font-bold text-white font-display leading-tight">
            {street.name}
          </h2>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Main Body */}
      <div className="p-4 overflow-y-auto space-y-4 text-xs">
        {/* Large confident depth numeral */}
        <div className="flex items-baseline justify-between bg-slate-950/80 border border-slate-800 p-3.5 rounded-xl shadow-inner">
          <div>
            <div className="text-[10px] text-slate-400 font-mono font-semibold">PREDICTED DEPTH AT +{currentTimeMin}m</div>
            <div className="flex items-baseline gap-2">
              <span className={`text-4xl font-black font-mono tracking-tight ${isImpassable ? 'text-rose-400' : isHazard ? 'text-amber-300' : 'text-emerald-400'}`}>
                {currentDepth}
              </span>
              <span className="text-sm font-mono text-slate-300 font-bold">cm</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-[10px] text-slate-400 font-mono font-semibold">80% CONFIDENCE BAND</div>
            <div className="text-sm font-mono font-bold text-blue-300">
              {street.confidenceRange.lower} – {street.confidenceRange.upper} cm
            </div>
          </div>
        </div>

        {/* Signature Feature: 5-Step Vertical Causal Chain */}
        <div>
          <div className="text-xs font-mono text-cyan-300 uppercase tracking-wider font-bold mb-2.5 flex items-center gap-1.5">
            <span>PHYSICAL-HYDRAULIC FAILURE CAUSAL CHAIN</span>
          </div>

          <div className="space-y-2.5 relative before:absolute before:left-3.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-700">
            {street.causalChain.map((step, idx) => (
              <div key={idx} className="relative flex items-start gap-3 pl-1">
                {/* Step badge */}
                <div className="w-7 h-7 rounded-full bg-slate-950 border border-slate-700 flex items-center justify-center shrink-0 z-10 shadow-md">
                  {icons[idx] || <span className="font-mono text-xs text-blue-400 font-bold">{step.step}</span>}
                </div>

                {/* Content */}
                <div className="flex-1 bg-slate-950/60 border border-slate-800 rounded-xl p-3 shadow-sm hover:border-slate-700 transition">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-mono text-slate-300 uppercase font-bold">
                      {step.title}
                    </span>
                    <span className="text-[10px] font-mono font-extrabold px-2 py-0.5 rounded bg-slate-900 text-blue-300 border border-blue-900/60">
                      {step.number}
                    </span>
                  </div>
                  <p className="text-slate-200 font-sans leading-relaxed text-xs">
                    "{step.sentence}"
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 3-Hour Depth Horizon Mini Chart */}
        <div>
          <div className="flex items-center justify-between mb-1.5 text-xs font-mono text-slate-300">
            <span className="font-bold">0–3h WATER DEPTH TRAJECTORY</span>
            <span className="text-cyan-300 font-bold">Peak: {street.basePeakDepthCm} cm at +{street.peakTimeMin}m</span>
          </div>

          <div className="h-32 w-full bg-slate-950/80 border border-slate-800 rounded-xl p-2 shadow-inner">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={street.timeline || []} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="depthGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={isImpassable ? '#e11d48' : '#0284c7'} stopOpacity={0.9} />
                    <stop offset="95%" stopColor={isImpassable ? '#e11d48' : '#0284c7'} stopOpacity={0.15} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="timeMin" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#475569', borderRadius: '10px', fontSize: '11px', color: '#fff' }}
                  labelFormatter={(v) => `+${v} min`}
                  formatter={(val) => [`${val} cm`, 'Water Depth']}
                />
                {/* Safe wade threshold lines */}
                <ReferenceLine y={15} stroke="#0ea5e9" strokeDasharray="3 3" />
                <ReferenceLine y={30} stroke="#f59e0b" strokeDasharray="3 3" />
                <ReferenceLine y={50} stroke="#e11d48" strokeDasharray="3 3" />
                <Area type="monotone" dataKey="depthCm" stroke={isImpassable ? '#e11d48' : '#0284c7'} strokeWidth={2.5} fill="url(#depthGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono mt-1 px-1">
            <span className="text-cyan-400">Car Limit (15cm)</span>
            <span className="text-amber-400">Ambulance (30cm)</span>
            <span className="text-rose-400">Impassable (50cm)</span>
          </div>
        </div>

        {/* Vehicle Wade Clearance Meter */}
        <div className="pt-2 border-t border-slate-800">
          <div className="text-[11px] font-mono text-slate-300 font-bold mb-2">VEHICLE PASSABILITY AT CURRENT DEPTH:</div>
          <div className="grid grid-cols-3 gap-2 text-xs font-mono">
            <div className={`p-2 rounded-xl border text-center font-bold ${currentDepth <= 30 ? 'bg-emerald-950/80 border-emerald-600 text-emerald-300' : 'bg-rose-950/80 border-rose-600 text-rose-300'}`}>
              <div>🚑 Ambulance</div>
              <div className="text-xs">{currentDepth <= 30 ? 'SAFE' : 'RISK'}</div>
            </div>
            <div className={`p-2 rounded-xl border text-center font-bold ${currentDepth <= 15 ? 'bg-emerald-950/80 border-emerald-600 text-emerald-300' : 'bg-rose-950/80 border-rose-600 text-rose-300'}`}>
              <div>🚗 Car</div>
              <div className="text-xs">{currentDepth <= 15 ? 'SAFE' : 'BLOCKED'}</div>
            </div>
            <div className={`p-2 rounded-xl border text-center font-bold ${currentDepth <= 10 ? 'bg-emerald-950/80 border-emerald-600 text-emerald-300' : 'bg-rose-950/80 border-rose-600 text-rose-300'}`}>
              <div>🛵 Two-Wheeler</div>
              <div className="text-xs">{currentDepth <= 10 ? 'SAFE' : 'BLOCKED'}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
