import React, { useState } from 'react';
import { Sliders, CloudLightning, Trash2, RefreshCw, AlertCircle } from 'lucide-react';

export default function SimulationControls({ onUpdateScenario, isLoading }) {
  const [scenarioName, setScenarioName] = useState('severe_monsoon');
  const [peakIntensity, setPeakIntensity] = useState(95.0);
  const [pipeBlockage, setPipeBlockage] = useState(75.0);
  const [isApplying, setIsApplying] = useState(false);

  const scenarios = [
    { id: 'severe_monsoon', name: 'Severe Monsoon Storm (95 mm/h)', defaultPeak: 95.0 },
    { id: 'cloudburst', name: 'Extreme Cloudburst Event (135 mm/h)', defaultPeak: 135.0 },
    { id: 'moderate', name: 'Moderate Convective Shower (45 mm/h)', defaultPeak: 45.0 }
  ];

  const handleScenarioChange = (sId) => {
    setScenarioName(sId);
    const found = scenarios.find(s => s.id === sId);
    if (found) setPeakIntensity(found.defaultPeak);
  };

  const handleApply = async () => {
    setIsApplying(true);
    try {
      await onUpdateScenario({
        scenarioName,
        peakIntensity: Number(peakIntensity),
        blockageOverrides: { 'P-104': Number(pipeBlockage) }
      });
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-3.5">
      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-lg bg-blue-50 border border-blue-200 text-blue-700">
            <Sliders className="w-4 h-4" />
          </div>
          <h2 className="text-sm font-bold text-slate-900 font-display">Scenario & Blockage Controls</h2>
        </div>
        <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 font-semibold">
          Hydraulic Injection
        </span>
      </div>

      <div className="space-y-3 text-xs">
        {/* Scenario Preset */}
        <div>
          <label className="block text-slate-600 font-medium mb-1">Precipitation Scenario</label>
          <select
            value={scenarioName}
            onChange={(e) => handleScenarioChange(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-2 text-slate-800 focus:outline-none focus:border-blue-500 font-medium"
          >
            {scenarios.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>

        {/* Peak Intensity Slider */}
        <div>
          <div className="flex justify-between mb-1">
            <span className="text-slate-600 font-medium">Peak Rain Rate:</span>
            <span className="font-mono text-blue-700 font-bold">{peakIntensity} mm/h</span>
          </div>
          <input
            type="range"
            min={20}
            max={150}
            step={5}
            value={peakIntensity}
            onChange={(e) => setPeakIntensity(Number(e.target.value))}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
        </div>

        {/* Conduit Blockage Injector */}
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-slate-700 font-medium flex items-center gap-1.5">
              <Trash2 className="w-3.5 h-3.5 text-rose-600" />
              Pipe P-104 Silt Blockage:
            </span>
            <span className={`font-mono font-extrabold ${pipeBlockage > 50 ? 'text-rose-700' : 'text-slate-800'}`}>
              {pipeBlockage}%
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={95}
            step={5}
            value={pipeBlockage}
            onChange={(e) => setPipeBlockage(Number(e.target.value))}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-rose-600"
          />
          <p className="text-[11px] text-slate-500 leading-tight">
            Controls culvert conveyance loss at Sony World junction. Higher blockage triggers upstream node surcharge and surface flooding.
          </p>
        </div>

        {/* Action Button */}
        <button
          onClick={handleApply}
          disabled={isLoading || isApplying}
          className="w-full py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold flex items-center justify-center gap-2 transition cursor-pointer shadow-sm text-xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isApplying ? 'animate-spin' : ''}`} />
          <span>{isApplying ? 'Re-Running Hydrodynamics...' : 'Apply & Recalculate Nowcast'}</span>
        </button>
      </div>
    </div>
  );
}
