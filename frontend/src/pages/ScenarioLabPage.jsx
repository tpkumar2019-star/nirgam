import React, { useState } from 'react';
import { Sliders, RefreshCw, GitCompare, ArrowRight, ShieldCheck, AlertTriangle, CheckCircle2, Droplets } from 'lucide-react';
import { api } from '../services/api';

export default function ScenarioLabPage({ onUpdateScenario, isLoading }) {
  const [baseBlockage, setBaseBlockage] = useState(20.0);
  const [stressBlockage, setStressBlockage] = useState(75.0);
  const [peakRain, setPeakRain] = useState(95.0);
  const [comparisonResult, setComparisonResult] = useState(null);
  const [isComparing, setIsComparing] = useState(false);

  const handleRunComparison = async () => {
    setIsComparing(true);
    try {
      const res = await api.compareScenarios({
        baseBlockage: Number(baseBlockage),
        stressBlockage: Number(stressBlockage),
        peakRain: Number(peakRain)
      });
      setComparisonResult(res);
    } catch (err) {
      console.error('Scenario comparison failed:', err);
    } finally {
      setIsComparing(false);
    }
  };

  return (
    <div className="h-full overflow-y-auto p-6 space-y-6 bg-slate-50 text-slate-800 max-w-5xl mx-auto">
      {/* Title Header */}
      <div className="pb-4 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-lg bg-blue-50 border border-blue-200 text-blue-700">
            <Sliders className="w-5 h-5" />
          </div>
          <h1 className="text-lg font-bold text-slate-900 font-display tracking-tight">
            SCENARIO LAB: EXPERIMENTAL CAUSALITY & STRESS TESTING
          </h1>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          Evaluate how pipe blockage and rainfall intensity alter drainage utilization, node surcharge, and road traversability.
        </p>
      </div>

      {/* Control Configuration Grid */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4 text-xs">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <span className="font-bold text-slate-900 font-display">Comparison Parameters</span>
          <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold border border-slate-200">
            Real Hydrodynamic Execution
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* 1. Rainfall Intensity */}
          <div className="space-y-1.5 p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex justify-between">
              <span className="text-slate-600 font-medium">Precipitation Intensity:</span>
              <span className="font-mono text-blue-700 font-bold">{peakRain} mm/h</span>
            </div>
            <input
              type="range"
              min={30}
              max={140}
              step={5}
              value={peakRain}
              onChange={(e) => setPeakRain(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <span className="text-[10px] text-slate-500 block">Peak convective storm cell intensity</span>
          </div>

          {/* 2. Baseline Blockage */}
          <div className="space-y-1.5 p-3.5 rounded-xl bg-emerald-50/50 border border-emerald-200">
            <div className="flex justify-between">
              <span className="text-emerald-800 font-medium">Scenario A (Clean Drains):</span>
              <span className="font-mono text-emerald-700 font-bold">{baseBlockage}% Blockage</span>
            </div>
            <input
              type="range"
              min={0}
              max={50}
              step={5}
              value={baseBlockage}
              onChange={(e) => setBaseBlockage(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
            />
            <span className="text-[10px] text-slate-500 block">Typical municipal pre-monsoon cleaned drain</span>
          </div>

          {/* 3. Stress Blockage */}
          <div className="space-y-1.5 p-3.5 rounded-xl bg-rose-50/50 border border-rose-200">
            <div className="flex justify-between">
              <span className="text-rose-800 font-medium">Scenario B (Debris Siltation):</span>
              <span className="font-mono text-rose-700 font-bold">{stressBlockage}% Blockage</span>
            </div>
            <input
              type="range"
              min={40}
              max={95}
              step={5}
              value={stressBlockage}
              onChange={(e) => setStressBlockage(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-rose-600"
            />
            <span className="text-[10px] text-slate-500 block">Severe solid waste and construction silt choke</span>
          </div>
        </div>

        <button
          onClick={handleRunComparison}
          disabled={isComparing || isLoading}
          className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:bg-slate-300 text-white font-bold flex items-center justify-center gap-2 transition cursor-pointer shadow-sm text-xs"
        >
          <GitCompare className={`w-4 h-4 ${isComparing ? 'animate-spin' : ''}`} />
          <span>{isComparing ? 'Simulating Dual Scenarios...' : 'Run Comparative Causal Stress Test'}</span>
        </button>
      </div>

      {/* Comparison Results Card */}
      {comparisonResult && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3.5">
            <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span className="font-display">CAUSAL IMPACT PROVEN: SIDE-BY-SIDE MATRIX</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {/* Scenario A Card */}
              <div className="bg-emerald-50/70 p-4 rounded-xl border border-emerald-200 space-y-2.5">
                <div className="flex justify-between items-center pb-2 border-b border-emerald-200">
                  <span className="font-bold text-emerald-900 font-display">SCENARIO A ({comparisonResult.baseline_scenario.blockage_pct}% Blockage)</span>
                  <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold">PASSABLE</span>
                </div>
                <div className="space-y-1.5 font-mono text-[11px] text-slate-700">
                  <div className="flex justify-between">
                    <span>Underpass Flood Depth:</span>
                    <strong className="text-emerald-700">{comparisonResult.baseline_scenario.underpass_depth_cm} cm</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Peak System Depth:</span>
                    <span>{comparisonResult.baseline_scenario.max_flood_depth_cm} cm</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Surcharged Inlets:</span>
                    <span className="text-emerald-700 font-bold">{comparisonResult.baseline_scenario.critical_nodes_count}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Surcharge Volume:</span>
                    <span>{comparisonResult.baseline_scenario.total_surcharge_m3} m³</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Roads Impassable:</span>
                    <span>{comparisonResult.baseline_scenario.roads_at_risk_count}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Route Status:</span>
                    <span className="text-emerald-700 font-bold">{comparisonResult.baseline_scenario.route_status}</span>
                  </div>
                </div>
              </div>

              {/* Scenario B Card */}
              <div className="bg-rose-50/70 p-4 rounded-xl border border-rose-200 space-y-2.5">
                <div className="flex justify-between items-center pb-2 border-b border-rose-200">
                  <span className="font-bold text-rose-900 font-display">SCENARIO B ({comparisonResult.stress_scenario.blockage_pct}% Blockage)</span>
                  <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-300 font-bold">HAZARDOUS</span>
                </div>
                <div className="space-y-1.5 font-mono text-[11px] text-slate-700">
                  <div className="flex justify-between">
                    <span>Underpass Flood Depth:</span>
                    <strong className="text-rose-700">{comparisonResult.stress_scenario.underpass_depth_cm} cm</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Peak System Depth:</span>
                    <span>{comparisonResult.stress_scenario.max_flood_depth_cm} cm</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Surcharged Inlets:</span>
                    <span className="text-rose-700 font-bold">{comparisonResult.stress_scenario.critical_nodes_count}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Surcharge Volume:</span>
                    <span className="text-rose-700 font-bold">{comparisonResult.stress_scenario.total_surcharge_m3} m³</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Roads Impassable:</span>
                    <span className="text-amber-800 font-bold">{comparisonResult.stress_scenario.roads_at_risk_count}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Route Status:</span>
                    <span className="text-amber-800 font-bold">{comparisonResult.stress_scenario.route_status}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Scientific Explanation of Causality */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 leading-relaxed font-sans">
              <span className="text-blue-700 font-bold block mb-1">Empirical Demonstration Takeaway:</span>
              {comparisonResult.comparison_explanation}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
