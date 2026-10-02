import React from 'react';
import { AlertTriangle, AlertCircle, Info, ShieldAlert, ArrowUpRight } from 'lucide-react';

export default function AlertsPanel({ alerts, onSelectAlertLocation }) {
  if (!alerts || alerts.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-4 border border-slate-200 text-xs text-slate-500 text-center flex flex-col items-center justify-center min-h-[130px] shadow-sm">
        <ShieldAlert className="w-6 h-6 text-slate-400 mb-1" />
        <p className="font-bold text-slate-800">No Active Inundation Alerts</p>
        <p className="text-[11px] text-slate-500 mt-0.5">Catchment stormwater nodes are discharging within safe baseline parameters.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-3">
      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-lg bg-amber-50 border border-amber-200 text-amber-700">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <h2 className="text-sm font-bold text-slate-900 font-display">Municipal Emergency Alerts</h2>
        </div>
        <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 font-bold">
          {alerts.length} Active Warnings
        </span>
      </div>

      <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
        {alerts.map((alt) => {
          const isCrit = alt.severity === 'CRITICAL';
          return (
            <div
              key={alt.alert_id}
              className={`p-3 rounded-xl border text-xs transition ${
                isCrit
                  ? 'bg-rose-50 border-rose-200 hover:bg-rose-100/70'
                  : 'bg-amber-50 border-amber-200 hover:bg-amber-100/70'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-1.5 font-bold">
                  {isCrit ? (
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  )}
                  <span className={isCrit ? 'text-rose-950 font-bold' : 'text-amber-950 font-bold'}>{alt.title}</span>
                </div>
                <span className="font-mono text-[10px] text-slate-500 shrink-0 font-semibold">+{alt.timestamp_min}m</span>
              </div>

              <p className="text-[11px] text-slate-700 mt-1 leading-relaxed font-sans">{alt.message}</p>

              <div className="mt-2 pt-1.5 border-t border-slate-200 flex items-center justify-between text-[10px]">
                <span className="text-slate-600 font-medium">
                  Action: <strong className="text-slate-900">{alt.recommended_action}</strong>
                </span>
                {onSelectAlertLocation && (
                  <button
                    onClick={() => onSelectAlertLocation(alt)}
                    className="text-blue-700 hover:text-blue-900 flex items-center gap-0.5 font-bold shrink-0 cursor-pointer"
                  >
                    <span>Focus</span>
                    <ArrowUpRight className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
