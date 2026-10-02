import React, { useState } from 'react';
import { Navigation, ShieldCheck, AlertOctagon, ArrowRight, Car, Truck, Bike, Footprints, CheckCircle2 } from 'lucide-react';

export default function RoutingPanel({ onCalculateRoute, routeResult, isLoading, currentTimeMin }) {
  const [origin, setOrigin] = useState('INT_HOSPITAL');
  const [destination, setDestination] = useState('INT_SHELTER');
  const [travelMode, setTravelMode] = useState('emergency_vehicle');

  const intersections = [
    { id: 'INT_HOSPITAL', name: 'City Hospital & Trauma Center' },
    { id: 'INT_NORTH_SQ', name: 'North Central Square' },
    { id: 'INT_SONY_WORLD', name: 'Sony World Underpass (Valley)' },
    { id: 'INT_TECH_HUB', name: 'Tech Corridor Junction' },
    { id: 'INT_RIDGE_TOP', name: 'Higher Ridge Link Road' },
    { id: 'INT_EAST_BYPASS', name: 'East Peripheral Bypass' },
    { id: 'INT_SHELTER', name: 'Central Emergency Relief Shelter' },
    { id: 'INT_SOUTH_GATE', name: 'South Highway Gateway' }
  ];

  const travelModes = [
    { id: 'emergency_vehicle', label: 'Emergency Rescue Truck', icon: Truck },
    { id: 'commuter_car', label: 'Commuter Car / Sedan', icon: Car },
    { id: 'two_wheeler', label: 'Two-Wheeler', icon: Bike },
    { id: 'pedestrian', label: 'Evacuation Footpath', icon: Footprints }
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    onCalculateRoute({
      origin,
      destination,
      timeHorizonMin: currentTimeMin || 60,
      travelMode
    });
  };

  return (
    <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-3.5">
      <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700">
            <Navigation className="w-4 h-4" />
          </div>
          <h2 className="text-sm font-bold text-slate-900 font-display">Flood-Safe Dynamic Routing</h2>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold">
          Hydrodynamic Edge Costs
        </span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3 text-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <div>
            <label className="block text-slate-600 font-medium mb-1">Origin (Dispatch Point)</label>
            <select
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-2 text-slate-800 focus:outline-none focus:border-emerald-500 font-medium"
            >
              {intersections.map((i) => (
                <option key={i.id} value={i.id}>{i.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-600 font-medium mb-1">Destination (Relief Goal)</label>
            <select
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-2 text-slate-800 focus:outline-none focus:border-emerald-500 font-medium"
            >
              {intersections.map((i) => (
                <option key={i.id} value={i.id}>{i.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Travel Mode Selector */}
        <div>
          <label className="block text-slate-600 font-medium mb-1.5">Travel Mode & Vehicle Clearance</label>
          <div className="grid grid-cols-2 gap-1.5">
            {travelModes.map((m) => {
              const Icon = m.icon;
              const isSelected = travelMode === m.id;
              return (
                <button
                  type="button"
                  key={m.id}
                  onClick={() => setTravelMode(m.id)}
                  className={`flex items-center gap-2 p-2 rounded-xl border text-left transition cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-800 font-bold shadow-sm'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{m.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-300 text-white font-bold flex items-center justify-center gap-2 transition cursor-pointer shadow-sm text-xs"
        >
          <Navigation className="w-3.5 h-3.5" />
          <span>{isLoading ? 'Computing Hydrodynamic Path...' : 'Find Flood-Safe Route'}</span>
        </button>
      </form>

      {/* Route Results Comparison */}
      {routeResult && !routeResult.error && (
        <div className="pt-3 border-t border-slate-100 space-y-2.5 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-800">Routing Evaluation:</span>
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
              routeResult.route_status.includes('DIVERTED')
                ? 'bg-amber-100 text-amber-900 border border-amber-300'
                : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
            }`}>
              {routeResult.route_status.replace(/_/g, ' ')}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {/* Standard Unaware Route */}
            <div className={`p-2.5 rounded-xl border ${
              routeResult.normal_is_hazardous
                ? 'bg-rose-50/80 border-rose-200 text-rose-900'
                : 'bg-slate-50 border-slate-200 text-slate-800'
            }`}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-bold text-[11px]">Normal Shortest Path</span>
                {routeResult.normal_is_hazardous && <AlertOctagon className="w-3.5 h-3.5 text-rose-600" />}
              </div>
              <div className="space-y-0.5 text-[11px] font-mono">
                <div>Dist: <strong>{routeResult.normal_distance_m} m</strong></div>
                <div>Time: <strong>{routeResult.normal_travel_time_min} min</strong></div>
                <div className={routeResult.normal_is_hazardous ? 'text-rose-700 font-extrabold' : ''}>
                  Max Depth: {routeResult.normal_max_depth_cm} cm
                </div>
              </div>
            </div>

            {/* Flood-Safe Dynamic Path */}
            <div className="p-2.5 rounded-xl bg-emerald-50/80 border border-emerald-200 text-emerald-900">
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-bold text-[11px]">Flood-Safe Path</span>
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              </div>
              <div className="space-y-0.5 text-[11px] font-mono">
                <div>Dist: <strong>{routeResult.safe_distance_m} m</strong></div>
                <div>Time: <strong>{routeResult.safe_travel_time_min} min</strong></div>
                <div className="text-emerald-700 font-extrabold">
                  Max Depth: {routeResult.safe_max_depth_cm} cm
                </div>
              </div>
            </div>
          </div>

          {/* Explanation */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-700 leading-relaxed font-sans">
            <span className="text-blue-700 font-bold block mb-1">Hydraulic Justification:</span>
            {routeResult.explanation}
          </div>
        </div>
      )}
    </div>
  );
}
