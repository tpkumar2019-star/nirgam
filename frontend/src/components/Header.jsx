import React, { useState, useEffect } from 'react';
import { 
  CloudRain, Activity, ShieldAlert, Waves, Satellite, Info, Clock, Network, 
  Navigation, Sliders, HelpCircle, LayoutDashboard, FileText, Bell, Volume2, 
  VolumeX, Sparkles, AlertOctagon, CheckCircle2, Zap
} from 'lucide-react';

export default function Header({
  isConnected,
  currentMode,
  setMode,
  onOpenValidation,
  activeView,
  setActiveView,
  onQuickScenario,
  onOpenSitRep
}) {
  const [istTime, setIstTime] = useState('');
  const [isAudioMuted, setIsAudioMuted] = useState(false);

  useEffect(() => {
    function updateClock() {
      const now = new Date();
      const timeStr = now.toLocaleTimeString('en-IN', { hour12: true, hour: '2-digit', minute: '2-digit', second: '2-digit' });
      const dateStr = now.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
      setIstTime(`${timeStr} IST • ${dateStr}`);
    }
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  const views = [
    { id: 'command_center', label: 'Command Center', icon: LayoutDashboard, hotkey: '1' },
    { id: 'forecast', label: '0–3h Nowcast', icon: Clock, hotkey: '2' },
    { id: 'drainage', label: 'Drainage SCADA', icon: Network, hotkey: '3' },
    { id: 'routes', label: 'Safe Routes', icon: Navigation, hotkey: '4' },
    { id: 'scenario_lab', label: 'Scenario Lab', icon: Sliders, hotkey: '5' },
    { id: 'inspector', label: 'Why Street Floods?', icon: HelpCircle, hotkey: '6' }
  ];

  return (
    <header className="bg-white/95 backdrop-blur-xl border-b border-slate-200/90 px-4 py-2 sticky top-0 z-30 shadow-sm">
      {/* Top Utility Ticker Bar */}
      <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-slate-100 text-[11px] text-slate-500">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 font-bold tracking-wider text-slate-800">
            <span className="w-2 h-2 rounded-full bg-blue-600 shadow-[0_0_6px_#2563eb] animate-pulse" />
            <span className="text-blue-700 font-mono">GOVT OF INDIA</span>
            <span className="text-slate-300">•</span>
            <span className="text-slate-800">MINISTRY OF EARTH SCIENCES (MoES)</span>
            <span className="text-slate-300">•</span>
            <span className="text-blue-600 font-semibold">NCMRWF</span>
          </div>
          <span className="hidden lg:inline text-slate-300">|</span>
          <div className="hidden lg:flex items-center gap-1.5 text-slate-600">
            <Satellite className="w-3.5 h-3.5 text-blue-600" />
            <span>RADAR NOWCAST: <strong className="text-slate-800">BENGALURU CENTRAL VALLEY (1.0 km²)</strong></span>
          </div>
        </div>

        <div className="flex items-center gap-3 font-mono text-[11px]">
          {/* Threat Advisory Badge */}
          <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-300 text-amber-800 font-semibold">
            <AlertOctagon className="w-3 h-3 text-amber-600" />
            <span>ADVISORY LEVEL: ORANGE</span>
          </div>

          {/* Live IST Clock */}
          <div className="hidden sm:flex items-center gap-1.5 text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
            <Clock className="w-3 h-3 text-blue-600" />
            <span className="font-medium">{istTime || 'CONNECTING...'}</span>
          </div>

          {/* Audio Chime Toggle */}
          <button
            onClick={() => setIsAudioMuted(!isAudioMuted)}
            className="p-1 rounded text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition cursor-pointer"
            title={isAudioMuted ? 'Unmute Emergency Chimes' : 'Mute Emergency Chimes'}
          >
            {isAudioMuted ? <VolumeX className="w-3.5 h-3.5 text-rose-500" /> : <Volume2 className="w-3.5 h-3.5 text-emerald-600" />}
          </button>
        </div>
      </div>

      {/* Main Bar: Branding, 6 Views Navigation & Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Logo & Platform Title */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 to-cyan-600 flex items-center justify-center shadow-md shadow-blue-500/20 border border-blue-400/30">
              <Waves className="w-6 h-6 text-white" />
            </div>
            <span className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white shadow-sm" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-extrabold tracking-tight text-slate-900 font-display flex items-center gap-2">
                URBAN FLOOD NOWCASTING
                <span className="text-[10px] px-2 py-0.5 rounded-full font-mono font-bold bg-blue-50 text-blue-700 border border-blue-200 shadow-sm">
                  SIH PS 26085
                </span>
              </h1>
            </div>
            <p className="text-[11px] text-slate-500 flex items-center gap-1.5 font-sans">
              <span>Hydrodynamic Drainage Coupling Engine</span>
              <span>•</span>
              <span className="text-emerald-700 font-mono font-semibold">Physics + ML Hybrid</span>
            </p>
          </div>
        </div>

        {/* 6 Core Views Navigation Bar */}
        <nav className="flex items-center bg-slate-100/90 p-1 rounded-xl border border-slate-200 shadow-inner gap-1">
          {views.map((v) => {
            const Icon = v.icon;
            const isActive = activeView === v.id;
            return (
              <button
                key={v.id}
                onClick={() => setActiveView(v.id)}
                className={`relative flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  isActive
                    ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-600/30'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-blue-600'}`} />
                <span className="hidden md:inline font-sans">{v.label}</span>
                <span className={`text-[9px] font-mono px-1 rounded ${isActive ? 'bg-blue-800 text-white' : 'text-slate-400 bg-white border border-slate-200'}`}>
                  {v.hotkey}
                </span>
              </button>
            );
          })}
        </nav>

        {/* Quick Actions Deck */}
        <div className="flex items-center gap-2">
          {/* Generate Situation Report (SitRep) */}
          <button
            onClick={onOpenSitRep}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 text-xs font-semibold shadow-sm transition cursor-pointer"
            title="Generate Official Municipal Incident Briefing"
          >
            <FileText className="w-3.5 h-3.5 text-indigo-600" />
            <span className="hidden xl:inline">SitRep Briefing</span>
          </button>

          {/* Validation Metrics Modal */}
          <button
            onClick={onOpenValidation}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 text-xs font-medium transition cursor-pointer"
            title="Inspect Model Validation Benchmarks (RMSE, R², IoU)"
          >
            <Activity className="w-3.5 h-3.5 text-blue-600" />
            <span className="hidden sm:inline">Model Benchmarks</span>
          </button>

          {/* WebSocket Engine Indicator */}
          <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-[11px] font-mono">
            <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500 shadow-[0_0_6px_#10b981]' : 'bg-amber-500 animate-ping'}`} />
            <span className="text-emerald-800 font-bold hidden sm:inline">
              {isConnected ? 'COUPLED' : 'SYNCING'}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
