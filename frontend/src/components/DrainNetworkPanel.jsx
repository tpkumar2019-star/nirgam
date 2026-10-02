import React from 'react';
import { X, Network, AlertTriangle, Wrench, CheckCircle2, RefreshCw } from 'lucide-react';

export default function DrainNetworkPanel({
  snapshot,
  onClose,
  customBlockages,
  onToggleBlockage,
  onResetBlockages,
  isBlockageMode,
  onToggleBlockageMode
}) {
  if (!snapshot) return null;

  const topStressedPipes = [...(snapshot.edges || [])]
    .sort((a, b) => b.utilizationPct - a.utilizationPct)
    .slice(0, 8);

  const topSurchargingNodes = [...(snapshot.nodes || [])]
    .sort((a, b) => b.utilizationPct - a.utilizationPct)
    .slice(0, 6);

  const blockedCount = Object.keys(customBlockages || {}).length;

  return (
    <div className="fixed top-20 right-4 z-30 w-96 max-w-[90vw] bg-slate-900/95 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-700/80 overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in slide-in-from-right-4 duration-200">
      {/* Header */}
      <div className="p-4 border-b border-slate-700/80 flex items-start justify-between bg-slate-950/70">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Network className="w-4 h-4 text-emerald-400" />
            <span className="font-mono text-xs text-emerald-300 uppercase font-bold tracking-wider">
              DRAIN NETWORK GRAPH
            </span>
          </div>
          <h2 className="text-base font-bold text-white font-display leading-tight">
            Stormwater Conduits & Surcharge
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
        {/* Blockage Simulator Controls */}
        <div className="bg-slate-950/80 border border-slate-800 p-3.5 rounded-xl shadow-inner">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono text-cyan-300 font-bold flex items-center gap-1.5">
              <Wrench className="w-3.5 h-3.5 text-amber-400" />
              <span>SIMULATE PIPE BLOCKAGE</span>
            </span>
            {blockedCount > 0 && (
              <button
                onClick={onResetBlockages}
                className="text-xs text-rose-400 hover:text-rose-300 font-mono font-bold flex items-center gap-1 cursor-pointer bg-rose-950/60 px-2 py-0.5 rounded border border-rose-800"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Reset ({blockedCount})</span>
              </button>
            )}
          </div>

          <p className="text-xs text-slate-200 mb-3 leading-relaxed font-sans">
            Click any conduit or manhole on the map to inject an 80% silt blockage. The hydrodynamic solver instantly recalculates backflow geysers and new surface inundation.
          </p>

          <button
            onClick={onToggleBlockageMode}
            className={`w-full py-2.5 px-3 rounded-xl font-bold text-xs transition flex items-center justify-center gap-2 cursor-pointer shadow-md ${
              isBlockageMode
                ? 'bg-rose-600 hover:bg-rose-500 text-white ring-2 ring-rose-400'
                : 'bg-blue-600 hover:bg-blue-500 text-white'
            }`}
          >
            <Wrench className="w-4 h-4" />
            <span>{isBlockageMode ? 'Blockage Mode Active (Click Map Conduits)' : 'Enable Blockage Injection Mode'}</span>
          </button>
        </div>

        {/* Top Stressed Conduits Table */}
        <div>
          <div className="text-[11px] font-mono text-slate-300 uppercase tracking-wider font-bold mb-2">
            TOP STRESSED PIPES & CONDUITS
          </div>

          <div className="space-y-2">
            {topStressedPipes.map((pipe) => {
              const isBlocked = !!customBlockages[pipe.id];
              return (
                <div
                  key={pipe.id}
                  onClick={() => onToggleBlockage(pipe.id)}
                  className={`p-3 rounded-xl border transition cursor-pointer flex items-center justify-between shadow-sm ${
                    isBlocked
                      ? 'bg-slate-800 border-blue-400 text-white ring-1 ring-blue-400'
                      : pipe.utilizationPct > 100
                      ? 'bg-rose-950/60 border-rose-600/70 hover:bg-rose-950/80'
                      : pipe.utilizationPct >= 75
                      ? 'bg-amber-950/60 border-amber-600/70 hover:bg-amber-950/80'
                      : 'bg-slate-950/60 border-slate-800 hover:bg-slate-800/60'
                  }`}
                >
                  <div className="max-w-[65%]">
                    <div className="font-bold text-white text-xs truncate flex items-center gap-1.5">
                      <span>{pipe.name}</span>
                      {isBlocked && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-rose-900 text-rose-100 font-mono font-bold border border-rose-500">
                          BLOCKED
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-300 font-mono mt-0.5">
                      Ø {pipe.diameterM}m | Flow: {pipe.dischargeM3s} m³/s
                    </div>
                  </div>

                  <div className="text-right">
                    <div
                      className={`text-base font-mono font-extrabold ${
                        pipe.utilizationPct > 100
                          ? 'text-rose-400'
                          : pipe.utilizationPct >= 75
                          ? 'text-amber-300'
                          : 'text-emerald-400'
                      }`}
                    >
                      {Math.round(pipe.utilizationPct)}%
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono font-semibold">
                      {pipe.utilizationPct > 100 ? 'OVERLOAD' : 'UTILIZATION'}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Surcharging Manholes */}
        <div>
          <div className="text-[11px] font-mono text-slate-300 uppercase tracking-wider font-bold mb-2">
            CRITICAL MANHOLE INLET NODES
          </div>

          <div className="space-y-2">
            {topSurchargingNodes.map((node) => (
              <div
                key={node.id}
                onClick={() => onToggleBlockage(node.id)}
                className={`p-3 rounded-xl border transition cursor-pointer flex items-center justify-between shadow-sm ${
                  node.isSurcharged
                    ? 'bg-rose-950/70 border-rose-500 text-rose-100'
                    : 'bg-slate-950/60 border-slate-800 text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <div>
                  <div className="font-bold text-white text-xs">{node.name}</div>
                  <div className="text-[11px] text-slate-300 font-mono mt-0.5">
                    {node.isSurcharged ? `⚠️ Backflow: +${node.surchargeBackflowCm} cm onto street` : 'Gravity intake'}
                  </div>
                </div>
                <div className="text-right">
                  <span
                    className={`text-xs font-mono font-extrabold px-2 py-0.5 rounded shadow-sm ${
                      node.isSurcharged
                        ? 'bg-rose-800 text-white animate-pulse'
                        : 'bg-slate-800 text-cyan-300'
                    }`}
                  >
                    {node.isSurcharged ? 'SURCHARGED' : `${Math.round(node.utilizationPct)}%`}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
