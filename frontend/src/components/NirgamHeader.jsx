import React, { useState, useEffect } from 'react';
import { 
  Radio, 
  MapPin, 
  CloudRain, 
  ShieldAlert, 
  Navigation, 
  Smartphone, 
  Terminal, 
  Compass, 
  Layers, 
  Sparkles,
  Info,
  Clock,
  Activity
} from 'lucide-react';
import { SCENARIOS } from '../data/nirgamData';

export default function NirgamHeader({
  activeCity,
  onCityChange,
  activeScenario,
  onScenarioChange,
  activeRole,
  onRoleChange,
  onStartTour,
  currentTimeMin
}) {
  const [istTime, setIstTime] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setIstTime(now.toLocaleTimeString('en-IN', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' IST');
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="relative z-30 h-16 w-full bg-[#0a1120] text-slate-100 border-b border-slate-700/80 px-4 sm:px-6 flex items-center justify-between shadow-xl">
      {/* Brand & National Hackathon Identity */}
      <div className="flex items-center gap-3">
        {/* Tricolor Emblem & Logo */}
        <div className="flex items-center gap-2.5">
          <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-blue-900 to-indigo-950 border border-blue-400/40 shadow-inner">
            <Radio className="w-4 h-4 text-cyan-400 animate-pulse" />
            <div className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-slate-900" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-display font-extrabold text-white text-base tracking-wide flex items-center gap-1.5">
                <span>NIRGAM</span>
                <span className="text-[11px] font-normal text-slate-400 hidden md:inline">| राष्ट्रीय शहरी बाढ़ पूर्वाभास</span>
              </span>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-blue-950 text-cyan-300 border border-blue-500/50 shadow-sm">
                SIH PS 26085
              </span>
            </div>
            <p className="text-[11px] text-slate-300 font-sans hidden sm:block">
              MoES / NCMRWF • Street-Level Urban Flood Nowcasting System
            </p>
          </div>
        </div>

        {/* City Selector */}
        <div className="ml-2 pl-3 border-l border-slate-700/80 flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
          <select
            value={activeCity}
            onChange={(e) => onCityChange(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-xs text-white rounded-xl px-3 py-1.5 font-semibold focus:outline-none focus:border-blue-400 cursor-pointer shadow-sm hover:border-slate-600 transition"
          >
            <option value="mumbai">📍 Mumbai (Pilot City)</option>
            <option value="delhi">📍 Delhi NCR</option>
            <option value="chennai">📍 Chennai</option>
          </select>
        </div>
      </div>

      {/* Center: Scenario Switcher & Role Views */}
      <div className="flex items-center gap-3">
        {/* Scenario Selector */}
        <div className="hidden xl:flex items-center gap-1.5 bg-slate-900/90 border border-slate-700/80 rounded-xl p-1 text-xs">
          <div className="flex items-center gap-1.5 px-2 text-slate-300 font-mono text-[11px]">
            <CloudRain className="w-3.5 h-3.5 text-blue-400" />
            <span className="font-semibold">SCENARIO:</span>
          </div>
          <select
            value={activeScenario}
            onChange={(e) => onScenarioChange(e.target.value)}
            className="bg-slate-950 text-blue-200 border border-blue-500/40 rounded-lg px-2.5 py-1 text-xs font-semibold focus:outline-none cursor-pointer"
          >
            {Object.values(SCENARIOS).map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        {/* Role Views Switcher */}
        <nav className="flex items-center bg-slate-900/90 border border-slate-700/80 rounded-xl p-1 text-xs gap-1 shadow-inner">
          <button
            onClick={() => onRoleChange('live_map')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition flex items-center gap-1.5 cursor-pointer ${
              activeRole === 'live_map'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Live Map</span>
          </button>

          <button
            onClick={() => onRoleChange('control_room')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition flex items-center gap-1.5 cursor-pointer ${
              activeRole === 'control_room'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Control Room</span>
          </button>

          <button
            onClick={() => onRoleChange('dispatcher')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition flex items-center gap-1.5 cursor-pointer ${
              activeRole === 'dispatcher'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Navigation className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">108 Dispatcher</span>
          </button>

          <button
            onClick={() => onRoleChange('commuter')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition flex items-center gap-1.5 cursor-pointer ${
              activeRole === 'commuter'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Commuter</span>
          </button>

          <button
            onClick={() => onRoleChange('api')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition flex items-center gap-1.5 cursor-pointer ${
              activeRole === 'api'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span className="hidden md:inline">API</span>
          </button>
        </nav>
      </div>

      {/* Right: IST Clock, Demo Tour & System Status */}
      <div className="flex items-center gap-3">
        {/* Live IST Clock */}
        <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300">
          <Clock className="w-3.5 h-3.5 text-blue-400" />
          <span>{istTime || '12:10:00 IST'}</span>
        </div>

        {/* 60s Demo Tour */}
        <button
          onClick={onStartTour}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-bold transition cursor-pointer shadow-md"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>60s Demo Tour</span>
        </button>

        {/* Operational badge */}
        <div 
          title="Coupled hydrodynamic-drainage simulation active. Plug-ready for IMD Doppler radar and municipal GIS."
          className="hidden 2xl:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-950/80 border border-emerald-600/50 text-[10px] text-emerald-300 font-mono font-bold"
        >
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>OPERATIONAL</span>
        </div>
      </div>
    </header>
  );
}
