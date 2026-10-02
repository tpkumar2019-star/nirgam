import React from 'react';
import { Navigation, ShieldAlert, AlertTriangle, ShieldCheck, Clock, X, PhoneCall, Radio } from 'lucide-react';

export default function DispatcherView({ routeResult, onClose, departTimeMin }) {
  if (!routeResult) return null;

  const isRerouteRequired = routeResult.usualRoute.status === 'IMPASSABLE';

  return (
    <div className="fixed top-20 right-4 z-30 w-96 max-w-[90vw] bg-slate-900/95 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-700/80 overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in slide-in-from-right-4 duration-200">
      {/* Header */}
      <div className="p-4 border-b border-slate-700/80 flex items-start justify-between bg-slate-950/70">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Navigation className="w-4 h-4 text-blue-400" />
            <span className="font-mono text-xs text-blue-300 uppercase font-bold tracking-wider">
              EMERGENCY 108 DISPATCH CONSOLE
            </span>
          </div>
          <h2 className="text-base font-bold text-white font-display leading-tight">
            Ambulance & Fire Corridor Monitor
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
        {/* Prominent Live Re-route Indicator */}
        <div
          className={`p-4 rounded-2xl border flex items-center gap-3.5 shadow-xl ${
            isRerouteRequired
              ? 'bg-rose-950/80 border-rose-500 text-white animate-pulse'
              : 'bg-emerald-950/80 border-emerald-500 text-white'
          }`}
        >
          {isRerouteRequired ? (
            <AlertTriangle className="w-8 h-8 text-rose-400 shrink-0" />
          ) : (
            <ShieldCheck className="w-8 h-8 text-emerald-400 shrink-0" />
          )}
          <div>
            <div className="text-[10px] font-mono tracking-wider uppercase font-bold text-slate-200">
              CORRIDOR PASSABILITY STATUS
            </div>
            <div className="text-base font-black font-display tracking-tight text-white">
              {isRerouteRequired ? 'RE-ROUTE MANDATORY' : 'SAFE CORRIDOR CLEAR'}
            </div>
            <div className="text-xs font-sans text-slate-200 mt-0.5">
              {isRerouteRequired
                ? 'Standard arterial route is blocked. Diverting via elevated Western Express Highway flyover.'
                : 'All corridor segments remain within safe 30 cm wade clearance.'}
            </div>
          </div>
        </div>

        {/* Live Mission Telemetry */}
        <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-xl space-y-2.5 shadow-inner">
          <div className="flex items-center justify-between font-mono text-xs">
            <span className="text-slate-400">ASSIGNED UNIT:</span>
            <span className="text-white font-bold">108-ADV-04 (Parel Trauma Unit)</span>
          </div>
          <div className="flex items-center justify-between font-mono text-xs">
            <span className="text-slate-400">INCIDENT CODE:</span>
            <span className="text-cyan-300 font-bold">Cardiac Emergency 1 → Cooper Hospital</span>
          </div>
          <div className="flex items-center justify-between font-mono text-xs">
            <span className="text-slate-400">SAFE WADE LIMIT:</span>
            <span className="text-amber-300 font-bold">30.0 cm</span>
          </div>
          <div className="flex items-center justify-between font-mono text-xs">
            <span className="text-slate-400">ESTIMATED TRANSIT:</span>
            <span className="text-emerald-300 font-bold">{routeResult.safeRoute.travelTimeMin} min (Detour: +5m)</span>
          </div>
        </div>

        {/* Waypoint Clearance Log */}
        <div>
          <div className="text-[11px] font-mono text-slate-300 uppercase tracking-wider font-bold mb-2">
            WAYPOINT TRANSIT LOG (EVALUATED AT ARRIVAL TIME)
          </div>

          <div className="space-y-1.5">
            {routeResult.safeRoute.waypoints.map((wp, idx) => (
              <div
                key={idx}
                className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between shadow-sm"
              >
                <div>
                  <div className="font-bold text-white text-xs">{wp.name}</div>
                  <div className="text-[11px] text-slate-300 font-mono mt-0.5">
                    Arrival: +{wp.arrivalTimeMin} min | Elev: {wp.elevM}m
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono font-extrabold text-emerald-400">
                    {wp.depthAtArrivalCm} cm
                  </span>
                  <div className="text-[9px] text-emerald-400 font-mono font-bold">CLEAR</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Radio Dispatch Action */}
        <div className="pt-2">
          <button
            onClick={() => alert("Dispatch telemetry transmitted to 108 Emergency Ambulance Unit & Pilot HUD.")}
            className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <Radio className="w-4 h-4" />
            <span>Transmit Safe Corridor to Ambulance HUD</span>
          </button>
        </div>
      </div>
    </div>
  );
}
