import React from 'react';
import { Layers, Eye, EyeOff, Map, Droplets, Network, Navigation } from 'lucide-react';

export default function LayersControl({ layers, onToggleLayer }) {
  const layerDefs = [
    { key: 'floodDepth', label: 'Flood Inundation (2D Surface)', icon: Droplets, color: 'text-blue-600' },
    { key: 'drainage', label: 'Drainage Pipes & Manholes', icon: Network, color: 'text-emerald-600' },
    { key: 'roads', label: 'Road Network & Flood Risk', icon: Map, color: 'text-amber-600' },
    { key: 'route', label: 'Evacuation & Safe Route', icon: Navigation, color: 'text-indigo-600' },
    { key: 'dem', label: 'DEM Topography Grid', icon: Layers, color: 'text-purple-600' }
  ];

  return (
    <div className="bg-white rounded-2xl p-3.5 border border-slate-200 shadow-sm space-y-2.5">
      <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
        <Layers className="w-4 h-4 text-blue-600" />
        <span className="text-xs font-bold text-slate-900 font-display">GIS Map Layer Toggles</span>
      </div>

      <div className="space-y-1.5 text-xs">
        {layerDefs.map((l) => {
          const Icon = l.icon;
          const isVisible = layers[l.key];
          return (
            <button
              key={l.key}
              onClick={() => onToggleLayer(l.key)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl border transition cursor-pointer font-medium ${
                isVisible
                  ? 'bg-slate-50 border-slate-300 text-slate-800'
                  : 'bg-white border-slate-200 text-slate-400 line-through opacity-60'
              }`}
            >
              <div className="flex items-center gap-2">
                <Icon className={`w-3.5 h-3.5 ${isVisible ? l.color : 'text-slate-400'}`} />
                <span>{l.label}</span>
              </div>
              {isVisible ? (
                <Eye className="w-3.5 h-3.5 text-blue-600" />
              ) : (
                <EyeOff className="w-3.5 h-3.5 text-slate-400" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
