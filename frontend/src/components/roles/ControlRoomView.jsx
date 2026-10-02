import React, { useState } from 'react';
import { ShieldAlert, AlertTriangle, Send, CheckCircle2, Siren, Wrench, Users, Bell, X } from 'lucide-react';

export default function ControlRoomView({ snapshot, onClose, onSelectStreet }) {
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const [alertIssued, setAlertIssued] = useState(false);

  if (!snapshot) return null;

  const handleIssueAlert = () => {
    setAlertIssued(true);
    setTimeout(() => {
      setIsAlertModalOpen(false);
      setAlertIssued(false);
    }, 1800);
  };

  return (
    <div className="fixed top-20 right-4 z-30 w-96 max-w-[90vw] bg-slate-900/95 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-700/80 overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in slide-in-from-right-4 duration-200">
      {/* Header */}
      <div className="p-4 border-b border-slate-700/80 flex items-start justify-between bg-slate-950/70">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ShieldAlert className="w-4 h-4 text-blue-400" />
            <span className="font-mono text-xs text-blue-300 uppercase font-bold tracking-wider">
              MUNICIPAL CONTROL ROOM
            </span>
          </div>
          <h2 className="text-base font-bold text-white font-display leading-tight">
            Ward Risk & Incident Operations
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
        {/* Quick Action: Broadcast Municipal Alert */}
        <div className="bg-gradient-to-r from-rose-950/80 via-slate-900/90 to-slate-900/90 border border-rose-500/60 p-3.5 rounded-2xl shadow-md">
          <div className="flex items-center justify-between mb-2">
            <span className="font-bold text-rose-200 flex items-center gap-1.5 text-xs">
              <Siren className="w-4 h-4 text-rose-400 animate-pulse" />
              <span>EMERGENCY DISPATCH ALERT</span>
            </span>
            <span className="text-[10px] font-mono bg-rose-900 px-2.5 py-0.5 rounded-full text-white border border-rose-500 font-extrabold shadow-sm">
              LEVEL 3 SEVERE
            </span>
          </div>

          <p className="text-xs text-slate-200 leading-relaxed mb-3 font-sans">
            {snapshot.impassableCount} arterial street corridors submerged. Dewatering pumps recommended for deployment at Hindmata and Andheri Subway.
          </p>

          <button
            onClick={() => setIsAlertModalOpen(true)}
            className="w-full py-2.5 px-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Broadcast Municipal Flood Advisory</span>
          </button>
        </div>

        {/* Ward-wise Risk Ranking Table */}
        <div>
          <div className="text-[11px] font-mono text-slate-300 uppercase tracking-wider font-bold mb-2">
            WARD-WISE RISK RANKINGS
          </div>

          <div className="space-y-2">
            {(snapshot.wards || []).map((w, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between shadow-sm"
              >
                <div>
                  <div className="font-bold text-white text-xs">{w.name}</div>
                  <div className="text-[11px] text-slate-300 font-mono mt-0.5">
                    Pop: {w.pop} | Active Pumps: {w.pumpsDeployed}
                  </div>
                </div>

                <div className="text-right">
                  <span
                    className={`font-mono text-[10px] font-extrabold px-2.5 py-1 rounded shadow-sm border ${
                      w.riskLevel === 'CRITICAL'
                        ? 'bg-rose-950 text-rose-200 border-rose-500'
                        : w.riskLevel === 'HIGH'
                        ? 'bg-amber-950 text-amber-200 border-amber-500'
                        : 'bg-blue-950 text-blue-200 border-blue-500'
                    }`}
                  >
                    {w.riskLevel}
                  </span>
                  <div className="text-[10px] text-cyan-300 font-mono font-bold mt-1">
                    +{w.suggestedPumps} pumps needed
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top 5 Critical Inundated Junctions */}
        <div>
          <div className="text-[11px] font-mono text-slate-300 uppercase tracking-wider font-bold mb-2">
            TOP CRITICAL HOTSPOT JUNCTIONS
          </div>

          <div className="space-y-2">
            {[...snapshot.streets]
              .sort((a, b) => b.currentDepthCm - a.currentDepthCm)
              .slice(0, 5)
              .map((st) => (
                <div
                  key={st.id}
                  onClick={() => onSelectStreet(st)}
                  className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-blue-400 transition cursor-pointer flex items-center justify-between shadow-sm"
                >
                  <div className="max-w-[70%]">
                    <div className="font-bold text-white truncate text-xs">{st.name}</div>
                    <div className="text-[11px] text-slate-300 font-mono mt-0.5">
                      {st.isUnderpass ? '⚠️ Low Underpass Siphon' : 'Saucer Depression Sink'}
                    </div>
                  </div>
                  <div className="text-right">
                    <span
                      className={`text-sm font-mono font-extrabold ${
                        st.currentDepthCm >= 50
                          ? 'text-rose-400'
                          : st.currentDepthCm >= 30
                          ? 'text-amber-300'
                          : 'text-emerald-400'
                      }`}
                    >
                      {Math.round(st.currentDepthCm)} cm
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Alert Issue Confirmation Modal */}
      {isAlertModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="bg-slate-900 max-w-sm w-full p-6 rounded-2xl border border-rose-500/70 shadow-2xl text-center">
            <Siren className="w-12 h-12 text-rose-500 mx-auto mb-3 animate-bounce" />
            <h3 className="text-lg font-bold text-white font-display mb-2">
              Broadcast Municipal Flood Alert?
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed mb-4 font-sans">
              This will trigger emergency cell broadcasts, transit reroutes on BEST municipal buses, and dispatch alerts to 108 trauma units.
            </p>

            <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-left mb-4">
              <span className="text-[10px] font-mono text-slate-400 font-bold uppercase">
                EMERGENCY BROADCAST GATEWAY:
              </span>
              <div className="text-xs text-cyan-300 font-mono mt-0.5">
                ➜ C-DoT Cell Broadcast + WhatsApp API (+91 9182619785)
              </div>
            </div>

            {alertIssued ? (
              <div className="flex flex-col items-center justify-center gap-2 text-emerald-400 font-mono font-bold text-xs bg-emerald-950/80 p-3 rounded-xl border border-emerald-600">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>BROADCAST DELIVERED TO 1.4M CITIZENS</span>
                </div>
                <span className="text-[10px] text-slate-300 font-normal">
                  Live WhatsApp & SMS dispatched to +91 9182619785
                </span>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsAlertModalOpen(false)}
                    className="flex-1 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleIssueAlert}
                    className="flex-1 py-2 px-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg cursor-pointer"
                  >
                    Confirm Broadcast
                  </button>
                </div>
                <button
                  onClick={() => {
                    const msg = encodeURIComponent(`🚨 *MUNICIPAL DISASTER ALERT*: Severe inundation at Hindmata & Andheri Subways (58 cm). Emergency pumps dispatched. Avoid low-lying underpasses. Verified via NIRGAM.`);
                    window.open(`https://api.whatsapp.com/send?phone=919182619785&text=${msg}`, '_blank');
                  }}
                  className="w-full py-1.5 px-2 rounded-lg bg-emerald-700/80 hover:bg-emerald-600 text-white text-[11px] font-semibold transition cursor-pointer flex items-center justify-center gap-1.5 border border-emerald-500/50"
                >
                  <span>Open Live WhatsApp Alert (+91 9182619785)</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
