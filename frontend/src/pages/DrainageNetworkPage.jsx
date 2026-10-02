import React, { useState, useEffect } from 'react';
import { Network, Activity, Sliders, AlertOctagon, CheckCircle2, Droplets, Info } from 'lucide-react';
import { api } from '../services/api';

export default function DrainageNetworkPage({ stepData, currentTimeMin, onSelectNode }) {
  const [selectedPipeId, setSelectedPipeId] = useState('P-104');
  const [pipeHydraulics, setPipeHydraulics] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function loadHydraulics() {
      setIsLoading(true);
      try {
        const data = await api.getPipeHydraulics(selectedPipeId, currentTimeMin);
        setPipeHydraulics(data);
      } catch (err) {
        console.error('Failed to load pipe hydraulics:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadHydraulics();
  }, [selectedPipeId, currentTimeMin]);

  const pipes = stepData?.edges || [];
  const nodes = stepData?.nodes || [];
  const surchargedNodes = nodes.filter(n => n.is_surcharged);
  const overloadedPipes = pipes.filter(p => p.is_overloaded || p.utilization_pct >= 85);

  return (
    <div className="h-full overflow-y-auto p-6 space-y-6 bg-slate-50 text-slate-800 max-w-5xl mx-auto">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-slate-200 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700">
              <Network className="w-5 h-5" />
            </div>
            <h1 className="text-lg font-bold text-slate-900 font-display tracking-tight">
              UNDERGROUND STORMWATER DRAINAGE NETWORK
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Manning open-channel/conduit capacity, silt blockage, and surcharge telemetry (+{currentTimeMin}m)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-600 font-medium">Select Conduit:</span>
          <select
            value={selectedPipeId}
            onChange={(e) => setSelectedPipeId(e.target.value)}
            className="bg-white border border-slate-300 text-xs rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-emerald-500 font-semibold font-mono shadow-sm"
          >
            {pipes.map((p) => (
              <option key={p.pipe_id} value={p.pipe_id}>
                {p.pipe_id}: {p.name} ({p.blockage_pct}% Blocked)
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Network KPI Summary Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-slate-500 text-[10px] uppercase block font-bold font-mono">Total Network Inlets</span>
          <span className="text-2xl font-extrabold font-outfit text-slate-900">{nodes.length} nodes</span>
          <span className="text-[11px] text-slate-500 block mt-1">Manholes, gullies, outfalls</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-slate-500 text-[10px] uppercase block font-bold font-mono">Surcharging Manholes</span>
          <span className={`text-2xl font-extrabold font-outfit ${surchargedNodes.length > 0 ? 'text-rose-600 animate-pulse' : 'text-emerald-700'}`}>
            {surchargedNodes.length} nodes
          </span>
          <span className="text-[11px] text-slate-500 block mt-1">{stepData?.total_surcharged_water_m3 || 0} m³ backflow</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-slate-500 text-[10px] uppercase block font-bold font-mono">Total Conduits</span>
          <span className="text-2xl font-extrabold font-outfit text-slate-900">{pipes.length} pipes</span>
          <span className="text-[11px] text-slate-500 block mt-1">Pre-cast RCC & Box culverts</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-slate-500 text-[10px] uppercase block font-bold font-mono">Overloaded Conduits</span>
          <span className={`text-2xl font-extrabold font-outfit ${overloadedPipes.length > 0 ? 'text-amber-700' : 'text-slate-900'}`}>
            {overloadedPipes.length} pipes
          </span>
          <span className="text-[11px] text-slate-500 block mt-1">&gt;85% capacity utilization</span>
        </div>
      </div>

      {/* Deep Pipe Hydraulic Inspector */}
      {pipeHydraulics && (
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4 text-xs">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <span className="font-bold text-slate-900 text-sm font-display">{pipeHydraulics.name}</span>
              <span className="font-mono text-blue-700 text-xs ml-2 font-bold">ID: {pipeHydraulics.pipe_id}</span>
            </div>
            <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold font-mono ${
              pipeHydraulics.is_overloaded ? 'bg-rose-100 text-rose-700 border border-rose-300' :
              pipeHydraulics.utilization_pct > 80 ? 'bg-amber-100 text-amber-800 border border-amber-300' :
              'bg-emerald-100 text-emerald-800 border border-emerald-300'
            }`}>
              {pipeHydraulics.status} ({pipeHydraulics.utilization_pct}%)
            </span>
          </div>

          {/* Governing Equations Box */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1 font-mono text-[11px] text-slate-800">
            <span className="text-[10px] text-slate-500 block font-sans font-bold uppercase">Manning Governing Formula:</span>
            <div className="font-bold text-blue-800">Q = (1 / n) * A * R^(2/3) * S^(1/2)</div>
            <div className="text-slate-600 text-[11px]">
              Q_eff = Q_base * (1 - Blockage / 100)^1.5 = {pipeHydraulics.base_capacity_m3_s} * (1 - {pipeHydraulics.blockage_pct}%)^1.5 = <strong>{pipeHydraulics.effective_capacity_m3_s} m³/s</strong>
            </div>
          </div>

          {/* Detailed Parameter Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] text-slate-500 block font-sans font-medium">Diameter (D)</span>
              <span className="text-sm font-bold text-slate-900">{pipeHydraulics.diameter_m} m</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] text-slate-500 block font-sans font-medium">Length (L)</span>
              <span className="text-sm font-bold text-slate-900">{pipeHydraulics.length_m} m</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] text-slate-500 block font-sans font-medium">Hydraulic Slope (S)</span>
              <span className="text-sm font-bold text-slate-900">{pipeHydraulics.slope}</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] text-slate-500 block font-sans font-medium">Roughness (n)</span>
              <span className="text-sm font-bold text-slate-900">{pipeHydraulics.manning_n}</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] text-slate-500 block font-sans font-medium">Flow Area (A)</span>
              <span className="text-sm font-bold text-slate-900">{pipeHydraulics.cross_sectional_area_m2} m²</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] text-slate-500 block font-sans font-medium">Hydraulic Radius (R)</span>
              <span className="text-sm font-bold text-slate-900">{pipeHydraulics.hydraulic_radius_m} m</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] text-slate-500 block font-sans font-medium">Base Clean Capacity</span>
              <span className="text-sm font-bold text-emerald-700">{pipeHydraulics.base_capacity_m3_s} m³/s</span>
            </div>

            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200">
              <span className="text-[10px] text-rose-800 block font-sans font-bold">Silt Blockage</span>
              <span className="text-sm font-extrabold text-rose-700">{pipeHydraulics.blockage_pct}%</span>
            </div>
          </div>
        </div>
      )}

      {/* Network Nodes Table */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3">
        <span className="font-bold text-slate-900 text-xs block font-display">Municipal Manholes & Inlets Status</span>
        <div className="overflow-x-auto">
          <table className="w-full text-[11px] text-left">
            <thead className="bg-slate-100 text-slate-700 border-b border-slate-200 font-mono">
              <tr>
                <th className="py-2.5 px-3">Node ID</th>
                <th className="py-2.5 px-3">Name</th>
                <th className="py-2.5 px-3">Type</th>
                <th className="py-2.5 px-3">Inlet Cap</th>
                <th className="py-2.5 px-3">Load %</th>
                <th className="py-2.5 px-3">Surcharge</th>
                <th className="py-2.5 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {nodes.map((n) => (
                <tr
                  key={n.node_id}
                  onClick={() => onSelectNode(n)}
                  className="hover:bg-slate-50 cursor-pointer transition"
                >
                  <td className="py-2.5 px-3 text-blue-700 font-bold">{n.node_id}</td>
                  <td className="py-2.5 px-3 font-sans font-medium text-slate-800">{n.name}</td>
                  <td className="py-2.5 px-3 uppercase text-slate-500">{n.node_type}</td>
                  <td className="py-2.5 px-3 text-slate-700">{n.inlet_capacity_m3_s} m³/s</td>
                  <td className="py-2.5 px-3">{n.utilization_pct}%</td>
                  <td className={`py-2.5 px-3 ${n.is_surcharged ? 'text-rose-700 font-bold' : 'text-slate-400'}`}>
                    {n.is_surcharged ? `${n.surcharge_volume_m3} m³` : 'None'}
                  </td>
                  <td className="py-2.5 px-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      n.is_surcharged ? 'bg-rose-100 text-rose-700 border border-rose-300' :
                      n.utilization_pct > 75 ? 'bg-amber-100 text-amber-800 border border-amber-300' :
                      'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    }`}>
                      {n.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
