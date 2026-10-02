import React, { useState } from 'react';
import { Navigation, ShieldCheck, AlertOctagon, ArrowRight, Car, Truck, Bike, Footprints, CheckCircle2, AlertTriangle, Clock, MapPin, Gauge } from 'lucide-react';
import FloodMap from '../maps/FloodMap';

export default function RoutePlannerPage({
  stepData,
  demData,
  routeResult,
  onCalculateRoute,
  isLoading,
  currentTimeMin,
  onTimeChange
}) {
  const [origin, setOrigin] = useState('INT_HOSPITAL');
  const [destination, setDestination] = useState('INT_SHELTER');
  const [travelMode, setTravelMode] = useState('emergency_vehicle');
  const [timeMin, setTimeMin] = useState(currentTimeMin || 60);

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
    { id: 'emergency_vehicle', label: 'Emergency Rescue Truck', icon: Truck, clearance: '35 cm' },
    { id: 'commuter_car', label: 'Commuter Car / Sedan', icon: Car, clearance: '15 cm' },
    { id: 'two_wheeler', label: 'Two-Wheeler / Bike', icon: Bike, clearance: '10 cm' },
    { id: 'pedestrian', label: 'Evacuation Footpath', icon: Footprints, clearance: '5 cm' }
  ];

  const timeEpochs = [0, 30, 60, 90, 120, 180];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onTimeChange && timeMin !== currentTimeMin) {
      onTimeChange(timeMin);
    }
    onCalculateRoute({
      origin,
      destination,
      timeHorizonMin: timeMin,
      travelMode
    });
  };

  return (
    <div className="h-full overflow-y-auto p-5 space-y-5 bg-slate-50 text-slate-800 max-w-6xl mx-auto">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-slate-200 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700">
              <Navigation className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-outfit font-extrabold text-slate-900 tracking-tight">
              FLOOD-AWARE DYNAMIC EMERGENCY ROUTE PLANNER
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Dynamic Dijkstra graph pathfinding over hydrodynamic edge costs (Water depth &gt; clearance triggers infinite penalty &amp; automatic diversion)
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-mono shadow-sm">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span className="text-emerald-800 font-bold">Safe Passage Certified</span>
        </div>
      </div>

      {/* Main Grid: Left Controls & Comparison, Right Map Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Form & Route Metrics */}
        <div className="lg:col-span-6 space-y-4">
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm space-y-4 text-xs">
            <span className="font-semibold text-slate-900 text-sm block border-b border-slate-100 pb-2">
              Dispatch Origin &amp; Evacuation Goal
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-600 font-medium mb-1.5 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-blue-600" />
                  <span>Origin (Dispatch Point)</span>
                </label>
                <select
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium transition"
                >
                  {intersections.map((i) => (
                    <option key={i.id} value={i.id}>{i.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1.5 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Destination (Relief Goal)</span>
                </label>
                <select
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium transition"
                >
                  {intersections.map((i) => (
                    <option key={i.id} value={i.id}>{i.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Travel Mode Selector */}
            <div>
              <label className="block text-slate-600 font-medium mb-1.5">
                Vehicle Type &amp; Permissible Water Clearance
              </label>
              <div className="grid grid-cols-2 gap-2">
                {travelModes.map((m) => {
                  const Icon = m.icon;
                  const isSelected = travelMode === m.id;
                  return (
                    <button
                      type="button"
                      key={m.id}
                      onClick={() => setTravelMode(m.id)}
                      className={`flex items-center justify-between p-2.5 rounded-xl border text-left transition cursor-pointer ${
                        isSelected
                          ? 'bg-emerald-50 border-emerald-500 text-emerald-900 font-semibold shadow-sm'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <Icon className={`w-4 h-4 shrink-0 ${isSelected ? 'text-emerald-700' : 'text-slate-500'}`} />
                        <span className="truncate">{m.label}</span>
                      </div>
                      <span className={`font-mono text-[10px] px-2 py-0.5 rounded-md border shrink-0 ${
                        isSelected ? 'bg-white border-emerald-200 text-emerald-800' : 'bg-white border-slate-200 text-slate-600'
                      }`}>
                        {m.clearance}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Forecast Epoch Horizon */}
            <div>
              <label className="block text-slate-600 font-medium mb-1.5 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-indigo-600" />
                <span>Forecast Epoch Horizon</span>
              </label>
              <div className="grid grid-cols-6 gap-2 font-mono text-center">
                {timeEpochs.map((epoch) => (
                  <button
                    type="button"
                    key={epoch}
                    onClick={() => setTimeMin(epoch)}
                    className={`py-2 rounded-xl border transition cursor-pointer text-xs ${
                      timeMin === epoch
                        ? 'bg-indigo-600 border-indigo-600 text-white font-bold shadow-sm'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    {epoch === 0 ? 'NOW' : `+${epoch}m`}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:bg-slate-200 disabled:text-slate-400 text-white font-semibold flex items-center justify-center gap-2 transition cursor-pointer shadow-md text-sm"
            >
              <Navigation className="w-4 h-4" />
              <span>{isLoading ? 'Computing Hydrodynamic Path...' : 'Calculate Dynamic Safe Route'}</span>
            </button>
          </form>

          {/* Route Comparison Side-by-Side */}
          {routeResult && !routeResult.error && (
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-md space-y-4 text-xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="font-bold text-slate-900 text-sm">Dynamic Routing Comparison Matrix</span>
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold tracking-wide uppercase ${
                  routeResult.route_status.includes('DIVERTED')
                    ? 'bg-amber-100 text-amber-900 border border-amber-300'
                    : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                }`}>
                  {routeResult.route_status.replace(/_/g, ' ')}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Standard Unaware Path */}
                <div className={`p-4 rounded-xl border ${
                  routeResult.normal_is_hazardous
                    ? 'bg-rose-50 border-rose-200 text-rose-950'
                    : 'bg-slate-50 border-slate-200 text-slate-800'
                }`}>
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-bold text-xs">Standard Unaware Route</span>
                    {routeResult.normal_is_hazardous ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-200 flex items-center gap-1">
                        <AlertOctagon className="w-3 h-3 text-rose-600" /> HAZARDOUS
                      </span>
                    ) : (
                      <span className="text-[10px] px-2 py-0.5 rounded bg-slate-200 text-slate-700">Dry</span>
                    )}
                  </div>
                  <div className="space-y-1.5 font-mono text-[11px]">
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-sans">Total Distance:</span>
                      <strong className="text-slate-900">{routeResult.normal_distance_m} m</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-sans">Travel Time:</span>
                      <strong className="text-slate-900">{routeResult.normal_travel_time_min} min</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-sans">Peak Water Depth:</span>
                      <strong className={routeResult.normal_is_hazardous ? 'text-rose-600 font-bold text-xs' : 'text-emerald-600'}>
                        {routeResult.normal_max_depth_cm} cm
                      </strong>
                    </div>
                  </div>
                </div>

                {/* Flood-Safe Dynamic Path */}
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-950">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-bold text-xs">Flood-Aware Safe Route</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-emerald-600" /> SAFE PASSAGE
                    </span>
                  </div>
                  <div className="space-y-1.5 font-mono text-[11px]">
                    <div className="flex justify-between">
                      <span className="text-emerald-700 font-sans">Total Distance:</span>
                      <strong className="text-slate-900">{routeResult.safe_distance_m} m</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-emerald-700 font-sans">Travel Time:</span>
                      <strong className="text-slate-900">{routeResult.safe_travel_time_min} min</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-emerald-700 font-sans">Peak Water Depth:</span>
                      <strong className="text-emerald-700 font-bold text-xs">
                        {routeResult.safe_max_depth_cm} cm
                      </strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* Justification Box */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-700 leading-relaxed">
                <span className="text-blue-700 font-bold block mb-1 flex items-center gap-1.5">
                  <Gauge className="w-3.5 h-3.5 text-blue-600" />
                  <span>Hydrodynamic Causality Justification:</span>
                </span>
                {routeResult.explanation}
              </div>

              {/* Avoided Roads Table */}
              {routeResult.avoided_roads && routeResult.avoided_roads.length > 0 && (
                <div className="space-y-2 pt-1">
                  <span className="font-bold text-slate-800 text-[11px] block">
                    Hazardous Corridors Dynamically Avoided:
                  </span>
                  <div className="space-y-1.5">
                    {routeResult.avoided_roads.map((rd, i) => (
                      <div key={i} className="flex items-center justify-between p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-[11px]">
                        <span className="text-rose-900 font-medium">{rd.name || rd.road_id}</span>
                        <div className="flex items-center gap-2 font-mono">
                          <span className="text-rose-700 font-bold">{rd.predicted_depth_cm} cm</span>
                          <span className="text-[10px] text-rose-800 bg-rose-100 px-2 py-0.5 rounded-md border border-rose-200">
                            Exceeds {rd.threshold_cm || 15} cm limit
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Embedded Route Map */}
        <div className="lg:col-span-6 h-[580px] bg-white rounded-2xl overflow-hidden border border-slate-200 relative shadow-md">
          <FloodMap
            stepData={stepData}
            demData={demData}
            layers={{
              floodDepth: true,
              drainage: false,
              roads: true,
              route: true,
              dem: false
            }}
            routeResult={routeResult}
          />
          <div className="absolute top-3 left-3 z-10 bg-white/95 border border-slate-200 px-3 py-1.5 rounded-xl text-[11px] text-slate-700 shadow-md backdrop-blur flex items-center gap-2 font-mono">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm" />
            <span className="font-semibold text-slate-800">Green: Safe Dynamic Route | Dashed Rose: Hazardous Path</span>
          </div>
        </div>
      </div>
    </div>
  );
}
