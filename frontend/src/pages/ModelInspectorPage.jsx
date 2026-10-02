import React, { useState, useEffect } from 'react';
import { HelpCircle, ArrowDown, Droplets, CloudRain, ShieldAlert, Cpu, CheckCircle2, ChevronRight, Activity } from 'lucide-react';
import { api } from '../services/api';

export default function ModelInspectorPage({ currentTimeMin }) {
  const [selectedRoadId, setSelectedRoadId] = useState('R-03');
  const [explanation, setExplanation] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const testRoads = [
    { id: 'R-03', name: '100 Ft Ring Road Underpass (Low Valley Floor)' },
    { id: 'R-02', name: 'Central Valley Boulevard' },
    { id: 'R-07', name: 'East Valley Flyover Descent' },
    { id: 'R-06', name: 'High-Elevation Bypass Avenue (Ridge Corridor)' },
    { id: 'R-01', name: 'Hospital Link Road' }
  ];

  useEffect(() => {
    async function loadExplain() {
      setIsLoading(true);
      try {
        const data = await api.explainRoad(selectedRoadId, currentTimeMin);
        setExplanation(data);
      } catch (err) {
        console.error('Failed to explain road:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadExplain();
  }, [selectedRoadId, currentTimeMin]);

  return (
    <div className="h-full overflow-y-auto p-6 space-y-6 bg-slate-50 text-slate-800 max-w-5xl mx-auto">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-slate-200 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1 rounded-lg bg-blue-50 border border-blue-200 text-blue-700">
              <HelpCircle className="w-5 h-5" />
            </div>
            <h1 className="text-lg font-bold text-slate-900 font-display tracking-tight">
              MODEL INSPECTOR: WHY IS THIS STREET FLOODING?
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Transparent physical-hydraulic derivation chain (Section 26 & 48 of SIH Problem Statement 26085)
          </p>
        </div>

        {/* Road Selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-600 font-medium">Select Street:</span>
          <select
            value={selectedRoadId}
            onChange={(e) => setSelectedRoadId(e.target.value)}
            className="bg-white border border-slate-300 text-xs rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-blue-500 font-semibold shadow-sm"
          >
            {testRoads.map((r) => (
              <option key={r.id} value={r.id}>{r.name}</option>
            ))}
          </select>
        </div>
      </div>

      {isLoading && (
        <div className="p-8 text-center text-xs text-slate-500">
          Calculating hydrodynamic causality chain for selected street corridor...
        </div>
      )}

      {explanation && !isLoading && (
        <>
          {/* Causal Narrative Card */}
          <div className="bg-blue-50/70 p-4 rounded-2xl border border-blue-200 shadow-sm space-y-2">
            <div className="flex items-center gap-2 text-blue-800 font-bold text-xs">
              <Activity className="w-4 h-4 text-blue-600" />
              <span className="font-mono uppercase tracking-wider">Deterministic Causal Derivation</span>
            </div>
            <p className="text-xs text-slate-800 leading-relaxed font-sans">
              {explanation.causal_story}
            </p>
          </div>

          {/* 8-Step Physical Derivation Chain */}
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono mb-3">
              Step-by-Step Mathematical Physical Flow
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              {/* Step 1: Precipitation */}
              <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
                <span className="text-[10px] font-mono text-blue-700 block font-bold">STEP 1: PRECIPITATION</span>
                <span className="text-lg font-extrabold font-mono text-slate-900">{explanation.rainfall_intensity_mm_hr} mm/h</span>
                <p className="text-[11px] text-slate-600 leading-snug">Spatial convective cell intensity over road catchment at +{currentTimeMin}m.</p>
              </div>

              {/* Step 2: Runoff */}
              <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
                <span className="text-[10px] font-mono text-blue-700 block font-bold">STEP 2: RUNOFF PARTITIONING</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-lg font-extrabold font-mono text-slate-900">{explanation.runoff_volume_m3} m³</span>
                  <span className="text-[11px] text-slate-500 font-mono font-medium">(C = {explanation.runoff_coefficient})</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-snug">Impervious asphalt/concrete roadway generates immediate overland flow.</p>
              </div>

              {/* Step 3: Topography */}
              <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
                <span className="text-[10px] font-mono text-blue-700 block font-bold">STEP 3: DEM ELEVATION</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-lg font-extrabold font-mono text-slate-900">{explanation.elevation_m} m</span>
                  {explanation.is_topographic_depression && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 font-bold">Valley Pocket</span>
                  )}
                </div>
                <p className="text-[11px] text-slate-600 leading-snug">Overland water funnels down hydraulic head gradient into low-elevation underpass.</p>
              </div>

              {/* Step 4: Inlet Intake */}
              <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
                <span className="text-[10px] font-mono text-emerald-700 block font-bold">STEP 4: DRAIN INTAKE</span>
                <span className="text-lg font-extrabold font-mono text-emerald-700">{explanation.inlet_capacity_m3_s} m³/s</span>
                <p className="text-[11px] text-slate-600 leading-snug">Stormwater inlet {explanation.nearby_inlet_id} captures overland water via weir flow.</p>
              </div>

              {/* Step 5: Conduit Capacity & Blockage */}
              <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
                <span className="text-[10px] font-mono text-amber-700 block font-bold">STEP 5: PIPE CONVEYANCE</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-lg font-extrabold font-mono text-amber-700">{explanation.pipe_effective_capacity_m3_s} m³/s</span>
                  <span className="text-[10px] text-rose-700 font-bold font-mono">({explanation.pipe_blockage_pct}% Silt Blockage)</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-snug">Conduit {explanation.connected_pipe_id} capacity choked by debris; operates at {explanation.drainage_utilization_pct}% load.</p>
              </div>

              {/* Step 6: Surcharge */}
              <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
                <span className="text-[10px] font-mono text-rose-700 block font-bold">STEP 6: MANHOLE SURCHARGE</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-lg font-extrabold font-mono text-rose-700">{explanation.is_surcharged ? 'YES' : 'NO'}</span>
                  <span className="text-[11px] text-slate-600 font-mono">({explanation.surcharge_volume_m3} m³ backflow)</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-snug">Inflow exceeds discharge; excess water geysers back through manhole onto street.</p>
              </div>

              {/* Step 7: Predicted Inundation Depth */}
              <div className="bg-rose-50/70 p-3.5 rounded-2xl border border-rose-200 shadow-sm space-y-1">
                <span className="text-[10px] font-mono text-rose-700 block font-bold">STEP 7: STREET WATER DEPTH</span>
                <span className="text-xl font-extrabold font-mono text-rose-700">{explanation.predicted_depth_cm} cm</span>
                <p className="text-[11px] text-slate-700 leading-snug font-medium">Emergent flood depth exceeds standard sedan intake clearance (15 cm).</p>
              </div>

              {/* Step 8: Time to Critical */}
              <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
                <span className="text-[10px] font-mono text-indigo-700 block font-bold">STEP 8: TIME TO CRITICAL</span>
                <span className="text-xl font-extrabold font-mono text-indigo-700">+{explanation.time_to_critical_min} min</span>
                <p className="text-[11px] text-slate-600 leading-snug">Estimated window for municipal traffic diversion and barricade deployment.</p>
              </div>
            </div>
          </div>

          {/* Model Breakdown: Physics vs ML Hybrid */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-900 font-display">Hybrid Physics-ML Component Breakdown</span>
              <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-semibold">
                {explanation.model_provenance}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-[11px] text-slate-600 block font-semibold">1. Hydrodynamic Physics Model</span>
                <span className="text-lg font-extrabold font-mono text-blue-700">{explanation.physics_depth_cm} cm</span>
                <p className="text-[11px] text-slate-500 leading-snug">Computed via 2D diffusive wave overland flow + Manning closed conduit routing.</p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-[11px] text-slate-600 block font-semibold">2. ML Residual Error Correction</span>
                <span className="text-lg font-extrabold font-mono text-indigo-700">{explanation.ml_residual_correction_cm} cm</span>
                <p className="text-[11px] text-slate-500 leading-snug">Random Forest regression modeling non-linear backwater friction and debris snagging.</p>
              </div>

              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 space-y-1">
                <span className="text-[11px] text-emerald-800 block font-semibold">3. Final Hybrid Prediction</span>
                <span className="text-lg font-extrabold font-mono text-emerald-700">{explanation.hybrid_depth_cm} cm</span>
                <p className="text-[11px] text-slate-600 leading-snug">Delivered to GIS dashboard and dynamic evacuation routing engine.</p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
