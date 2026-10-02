import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Compass, Layers, Crosshair, ZoomIn, ZoomOut, AlertTriangle, ShieldCheck, MapPin, Eye } from 'lucide-react';

export default function FloodMap({
  stepData,
  demData,
  layers,
  routeResult,
  onSelectRoad,
  onSelectNode,
  selectedItem
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const [coordsHover, setCoordsHover] = useState({ lat: 12.9350, lon: 77.5970, elev: 906.5 });
  const [activeBasemap, setActiveBasemap] = useState('light'); // 'light', 'satellite', 'dark'
  const basemapLayersRef = useRef({});

  const layerGroupsRef = useRef({
    flood: L.layerGroup(),
    dem: L.layerGroup(),
    drainagePipes: L.layerGroup(),
    drainageNodes: L.layerGroup(),
    roads: L.layerGroup(),
    route: L.layerGroup()
  });

  // Initialize Map Once
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [12.936, 77.596],
      zoom: 15,
      zoomControl: false,
      attributionControl: false
    });

    // Basemaps dictionary
    // 1. Pristine Carto Positron (Light Municipal Default)
    const lightTile = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      subdomains: 'abcd'
    });

    // 2. High-Res Satellite Imagery (Esri World Imagery)
    const satTile = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      maxZoom: 19
    });

    // 3. Dark Matter CartoDB (Night Ops)
    const darkTile = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      subdomains: 'abcd'
    });

    basemapLayersRef.current = { light: lightTile, satellite: satTile, dark: darkTile };
    lightTile.addTo(map);

    // Track mouse coordinates for live GIS telemetry
    map.on('mousemove', (e) => {
      const { lat, lng } = e.latlng;
      const elev = 902.0 + Math.abs(lat - 12.935) * 450.0 + Math.abs(lng - 77.597) * 350.0;
      setCoordsHover({
        lat: lat.toFixed(4),
        lon: lng.toFixed(4),
        elev: elev.toFixed(1)
      });
    });

    // Add layer groups to map
    Object.values(layerGroupsRef.current).forEach((lg) => lg.addTo(map));

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Switch Basemap
  const handleBasemapChange = (type) => {
    const map = mapInstanceRef.current;
    if (!map) return;
    Object.values(basemapLayersRef.current).forEach((layer) => map.removeLayer(layer));
    if (basemapLayersRef.current[type]) {
      basemapLayersRef.current[type].addTo(map);
      Object.values(layerGroupsRef.current).forEach((lg) => {
        if (map.hasLayer(lg)) {
          lg.bringToFront ? lg.bringToFront() : null;
        }
      });
    }
    setActiveBasemap(type);
  };

  // Zoom controls
  const handleZoomIn = () => mapInstanceRef.current?.zoomIn();
  const handleZoomOut = () => mapInstanceRef.current?.zoomOut();
  const handleFocusHotspot = () => {
    mapInstanceRef.current?.flyTo([12.933, 77.595], 16, { duration: 1.2 });
  };
  const handleResetView = () => {
    mapInstanceRef.current?.flyTo([12.936, 77.596], 15, { duration: 1.0 });
  };

  // Update Layers Visibility
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const { flood, dem, drainagePipes, drainageNodes, roads, route } = layerGroupsRef.current;

    layers.floodDepth ? map.addLayer(flood) : map.removeLayer(flood);
    layers.dem ? map.addLayer(dem) : map.removeLayer(dem);
    if (layers.drainage) {
      map.addLayer(drainagePipes);
      map.addLayer(drainageNodes);
    } else {
      map.removeLayer(drainagePipes);
      map.removeLayer(drainageNodes);
    }
    layers.roads ? map.addLayer(roads) : map.removeLayer(roads);
    layers.route ? map.addLayer(route) : map.removeLayer(route);
  }, [layers]);

  // Render Surface Flood Inundation & DEM
  useEffect(() => {
    if (!mapInstanceRef.current || !demData || !demData.cells) return;

    const { flood, dem } = layerGroupsRef.current;
    flood.clearLayers();
    dem.clearLayers();

    const dLat = (demData.bbox.lat_max - demData.bbox.lat_min) / demData.rows;
    const dLon = (demData.bbox.lon_max - demData.bbox.lon_min) / demData.cols;

    const depths = stepData?.cells_flood_depth_cm || {};

    Object.entries(demData.cells).forEach(([cellId, cell]) => {
      const south = cell.lat - dLat * 0.5;
      const north = cell.lat + dLat * 0.5;
      const west = cell.lon - dLon * 0.5;
      const east = cell.lon + dLon * 0.5;
      const bounds = [[south, west], [north, east]];

      const depthCm = depths[cellId] || 0.0;

      // 1. Flood Inundation Polygon (Crisp translucent light-mode colors)
      if (depthCm > 2.0) {
        let fillColor = '#0284c7';
        let fillOpacity = 0.45;

        if (depthCm > 50.0) {
          fillColor = '#9f1239'; // Critical
          fillOpacity = 0.85;
        } else if (depthCm > 30.0) {
          fillColor = '#e11d48'; // Severe
          fillOpacity = 0.75;
        } else if (depthCm > 15.0) {
          fillColor = '#ea580c'; // High
          fillOpacity = 0.60;
        } else if (depthCm > 5.0) {
          fillColor = '#d97706'; // Moderate
          fillOpacity = 0.45;
        }

        const rect = L.rectangle(bounds, {
          color: fillColor,
          weight: 1,
          opacity: 0.6,
          fillColor: fillColor,
          fillOpacity: fillOpacity
        });

        rect.bindTooltip(`
          <div class="text-xs font-sans p-1 text-slate-800">
            <div class="font-bold text-slate-900 mb-0.5">Cell ${cellId}</div>
            <div>Depth: <strong class="text-blue-700 font-mono">${depthCm} cm</strong></div>
            <div>Elevation: <span class="font-mono text-slate-600">${cell.elevation_m} m</span></div>
            <div>Land Use: <span class="uppercase text-slate-500 font-semibold">${cell.land_use}</span></div>
          </div>
        `, { sticky: true });

        flood.addLayer(rect);
      }

      // 2. DEM Elevation Tint
      const normElev = (cell.elevation_m - demData.min_elevation_m) / Math.max(1.0, (demData.max_elevation_m - demData.min_elevation_m));
      const demColor = normElev > 0.6 ? '#059669' : (normElev > 0.3 ? '#7c3aed' : '#2563eb');
      const demRect = L.rectangle(bounds, {
        color: demColor,
        weight: 0.5,
        opacity: 0.25,
        fillColor: demColor,
        fillOpacity: 0.12
      });
      demRect.bindTooltip(`DEM Elevation: ${cell.elevation_m} m MSL`, { sticky: true });
      dem.addLayer(demRect);
    });
  }, [stepData, demData]);

  // Render Drainage Pipes & Nodes
  useEffect(() => {
    if (!mapInstanceRef.current || !stepData) return;

    const { drainagePipes, drainageNodes } = layerGroupsRef.current;
    drainagePipes.clearLayers();
    drainageNodes.clearLayers();

    const nodeCoords = {};
    (stepData.nodes || []).forEach((node) => {
      nodeCoords[node.node_id] = [node.lat, node.lon];
    });

    // 1. Pipes (Edges)
    (stepData.edges || []).forEach((edge) => {
      const uCoords = nodeCoords[edge.start_node];
      const vCoords = nodeCoords[edge.end_node];
      if (!uCoords || !vCoords) return;

      let pipeColor = '#059669'; // Green
      let pipeWidth = 3.5;
      let dashPattern = null;

      if (edge.is_overloaded || edge.utilization_pct >= 100) {
        pipeColor = '#dc2626'; // Red Surcharged
        pipeWidth = 6;
        dashPattern = '4, 4';
      } else if (edge.utilization_pct >= 85) {
        pipeColor = '#ea580c'; // Orange Critical
        pipeWidth = 4.5;
      } else if (edge.utilization_pct >= 60) {
        pipeColor = '#d97706'; // Amber High
        pipeWidth = 4;
      }

      const poly = L.polyline([uCoords, vCoords], {
        color: pipeColor,
        weight: pipeWidth,
        opacity: 0.9,
        dashArray: dashPattern,
        className: edge.utilization_pct > 75 ? 'water-pipe-flow' : ''
      });

      poly.bindTooltip(`
        <div class="text-xs font-sans p-1 text-slate-800">
          <div class="font-bold text-slate-900">Conduit: ${edge.name} (${edge.pipe_id})</div>
          <div>Manning Capacity: <span class="font-mono text-blue-700 font-bold">${edge.effective_capacity_m3_s} m³/s</span></div>
          <div>Flow Load: <span class="font-mono font-bold ${edge.utilization_pct > 85 ? 'text-rose-600' : 'text-emerald-700'}">${edge.utilization_pct}%</span></div>
          <div>Silt Blockage: <span class="font-mono font-bold text-amber-700">${edge.blockage_pct}%</span></div>
        </div>
      `, { sticky: true });

      drainagePipes.addLayer(poly);
    });

    // 2. Nodes
    (stepData.nodes || []).forEach((node) => {
      let markerColor = '#059669';
      let radius = 6;

      if (node.is_surcharged) {
        markerColor = '#dc2626';
        radius = 9;
      } else if (node.utilization_pct > 75) {
        markerColor = '#d97706';
        radius = 7;
      }

      const marker = L.circleMarker([node.lat, node.lon], {
        radius: radius,
        fillColor: markerColor,
        color: '#ffffff',
        weight: 2,
        opacity: 1,
        fillOpacity: 0.95,
        className: node.is_surcharged ? 'surcharge-pulse' : ''
      });

      marker.bindTooltip(`
        <div class="text-xs font-sans p-1 text-slate-800">
          <div class="font-bold text-slate-900">${node.name} (${node.node_id})</div>
          <div>Type: <span class="uppercase font-semibold text-slate-600">${node.node_type}</span></div>
          <div>Status: <span class="font-bold ${node.is_surcharged ? 'text-rose-600' : 'text-emerald-700'}">${node.status}</span></div>
          ${node.is_surcharged ? `<div>Surcharge: <span class="text-rose-600 font-bold font-mono">${node.surcharge_volume_m3} m³</span></div>` : ''}
        </div>
      `, { sticky: true });

      marker.on('click', () => {
        onSelectNode(node);
      });

      drainageNodes.addLayer(marker);
    });
  }, [stepData, onSelectNode]);

  // Render Roads
  useEffect(() => {
    if (!mapInstanceRef.current || !stepData) return;

    const { roads } = layerGroupsRef.current;
    roads.clearLayers();

    (stepData.roads || []).forEach((road) => {
      let roadColor = '#059669'; // Low (<5cm)
      let roadWidth = 4.5;

      if (road.current_depth_cm > 50) {
        roadColor = '#9f1239'; // Critical
        roadWidth = 7;
      } else if (road.current_depth_cm > 30) {
        roadColor = '#dc2626'; // Severe
        roadWidth = 6;
      } else if (road.current_depth_cm > 15) {
        roadColor = '#ea580c'; // High
        roadWidth = 5.5;
      } else if (road.current_depth_cm > 5) {
        roadColor = '#d97706'; // Moderate
        roadWidth = 5;
      }

      const isSelected = selectedItem?.type === 'road' && selectedItem?.data?.road_id === road.road_id;

      const poly = L.polyline(road.coordinates, {
        color: isSelected ? '#0284c7' : roadColor,
        weight: isSelected ? roadWidth + 3 : roadWidth,
        opacity: 0.95
      });

      poly.bindTooltip(`
        <div class="text-xs font-sans p-1 text-slate-800">
          <div class="font-bold text-slate-900">${road.name}</div>
          <div>Water Depth: <strong class="font-mono ${road.current_depth_cm > 15 ? 'text-rose-600' : 'text-blue-700'}">${road.current_depth_cm} cm</strong></div>
          <div>Status: <span class="font-bold ${road.is_passable ? 'text-emerald-700' : 'text-rose-600'}">${road.is_passable ? 'PASSABLE' : 'IMPASSABLE'}</span></div>
          <div>Elevation: <span class="font-mono text-slate-600">${road.elevation_m} m</span></div>
        </div>
      `, { sticky: true });

      poly.on('click', () => {
        onSelectRoad(road);
      });

      roads.addLayer(poly);
    });
  }, [stepData, selectedItem, onSelectRoad]);

  // Render Routing Result
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    const { route } = layerGroupsRef.current;
    route.clearLayers();

    if (!routeResult || routeResult.error) return;

    // 1. Normal Route (Red dashed if hazardous)
    if (routeResult.normal_route) {
      routeResult.normal_route.forEach((seg) => {
        const poly = L.polyline(seg.coordinates, {
          color: seg.is_hazard ? '#dc2626' : '#64748b',
          weight: 4.5,
          opacity: 0.8,
          dashArray: '6, 6'
        });
        poly.bindTooltip(`Normal Route: ${seg.name} (${seg.flood_depth_cm} cm flood)`);
        route.addLayer(poly);
      });
    }

    // 2. Flood-Safe Route (Vibrant Emerald line)
    if (routeResult.safe_route) {
      routeResult.safe_route.forEach((seg) => {
        const poly = L.polyline(seg.coordinates, {
          color: '#059669',
          weight: 6.5,
          opacity: 0.95
        });
        poly.bindTooltip(`Safe Dynamic Route: ${seg.name} (Max depth: ${seg.flood_depth_cm} cm)`);
        route.addLayer(poly);
      });
    }

    // 3. Start & Destination Markers
    const startCoord = routeResult.normal_route?.[0]?.coordinates?.[0] || [12.942, 77.590];
    const endCoord = routeResult.normal_route?.[routeResult.normal_route.length - 1]?.coordinates?.slice(-1)[0] || [12.928, 77.605];

    const startMarker = L.circleMarker(startCoord, {
      radius: 9,
      fillColor: '#0284c7',
      color: '#ffffff',
      weight: 2,
      fillOpacity: 1
    }).bindPopup('<strong>Origin Point:</strong> City Hospital / Dispatch Center');

    const destMarker = L.circleMarker(endCoord, {
      radius: 9,
      fillColor: '#059669',
      color: '#ffffff',
      weight: 2,
      fillOpacity: 1
    }).bindPopup('<strong>Destination:</strong> Central Emergency Relief Shelter');

    route.addLayer(startMarker);
    route.addLayer(destMarker);
  }, [routeResult]);

  return (
    <div className="relative w-full h-full min-h-[420px] bg-slate-100 overflow-hidden">
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* 1. Top-Left Compass & North Indicator */}
      <div className="absolute top-4 left-4 z-10 flex items-center gap-2 pointer-events-none">
        <div className="w-8 h-8 rounded-xl bg-white/95 backdrop-blur-md border border-slate-200 shadow-md flex items-center justify-center text-blue-600">
          <Compass className="w-4 h-4 animate-spin-slow" />
        </div>
        <div className="bg-white/95 backdrop-blur-md border border-slate-200 px-2.5 py-1 rounded-lg text-[10px] font-mono text-slate-700 shadow-sm font-semibold">
          <span className="text-blue-600 font-bold">N</span> 000° • BENGALURU CV
        </div>
      </div>

      {/* 2. Top-Right Tactical Controls: Basemap Switcher & Zoom */}
      <div className="absolute top-4 right-4 z-10 flex flex-col gap-2 items-end">
        {/* Basemap Switcher Pill */}
        <div className="flex items-center bg-white/95 backdrop-blur-md p-1 rounded-xl border border-slate-200 shadow-md text-xs gap-1">
          <button
            onClick={() => handleBasemapChange('light')}
            className={`px-2.5 py-1 rounded-lg font-semibold transition cursor-pointer ${
              activeBasemap === 'light' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Municipal Light
          </button>
          <button
            onClick={() => handleBasemapChange('satellite')}
            className={`px-2.5 py-1 rounded-lg font-semibold transition cursor-pointer ${
              activeBasemap === 'satellite' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Satellite
          </button>
          <button
            onClick={() => handleBasemapChange('dark')}
            className={`px-2.5 py-1 rounded-lg font-semibold transition cursor-pointer ${
              activeBasemap === 'dark' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Tactical Dark
          </button>
        </div>

        {/* Quick Map Action Buttons */}
        <div className="flex items-center gap-1.5 bg-white/95 backdrop-blur-md p-1 rounded-xl border border-slate-200 shadow-md">
          <button
            onClick={handleFocusHotspot}
            className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-[11px] font-semibold transition cursor-pointer flex items-center gap-1"
            title="Focus on Sony World Underpass Valley Hotspot"
          >
            <MapPin className="w-3 h-3 text-rose-600" />
            <span>Focus Hotspot</span>
          </button>
          <button
            onClick={handleResetView}
            className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-medium transition cursor-pointer"
            title="Reset Catchment Extent"
          >
            Reset
          </button>
          <div className="h-4 w-[1px] bg-slate-200 mx-0.5" />
          <button
            onClick={handleZoomIn}
            className="p-1 rounded-lg hover:bg-slate-100 text-slate-700 transition cursor-pointer"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={handleZoomOut}
            className="p-1 rounded-lg hover:bg-slate-100 text-slate-700 transition cursor-pointer"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 3. Bottom-Left Floating Map Legend */}
      <div className="absolute bottom-4 left-4 z-10 bg-white/95 backdrop-blur-md p-3.5 rounded-2xl border border-slate-200/90 text-[11px] shadow-lg pointer-events-auto space-y-2 max-w-xs">
        <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
          <span className="font-bold text-slate-900 flex items-center gap-1.5 font-display">
            <span className="w-2 h-2 rounded-full bg-blue-600" />
            <span>GIS Hydrologic Legend</span>
          </span>
          <span className="text-[10px] font-mono text-slate-500 font-semibold">1:10,000</span>
        </div>
        <div className="space-y-1.5 font-sans">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-2 rounded bg-emerald-500 shadow-sm" />
              <span className="text-slate-700 font-medium">Passable Road (&lt;5cm)</span>
            </div>
            <span className="text-[10px] font-mono text-slate-500 font-semibold">&lt; 5 cm</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-2 rounded bg-amber-500 shadow-sm" />
              <span className="text-slate-700 font-medium">Moderate Water Warning</span>
            </div>
            <span className="text-[10px] font-mono text-slate-500 font-semibold">5 – 15 cm</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-2 rounded bg-orange-500 shadow-sm" />
              <span className="text-slate-700 font-medium">High Risk (Sedan Blocked)</span>
            </div>
            <span className="text-[10px] font-mono text-slate-500 font-semibold">15 – 30 cm</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-2 rounded bg-rose-600 shadow-sm" />
              <span className="text-rose-700 font-semibold">Critical Flash Flood</span>
            </div>
            <span className="text-[10px] font-mono text-rose-700 font-bold">&gt; 30 cm</span>
          </div>

          <div className="pt-1.5 border-t border-slate-200 flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-rose-600 border-2 border-white shadow-md animate-ping" />
            <span className="text-rose-700 font-bold">Surcharging Drain Backflow</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="w-4 h-1.5 rounded-full bg-emerald-600 shadow-sm" />
            <span className="text-emerald-700 font-semibold">Active Flood-Safe Route</span>
          </div>
        </div>
      </div>

      {/* 4. Bottom-Right Live GIS Coordinates & Telemetry HUD */}
      <div className="absolute bottom-4 right-4 z-10 bg-white/95 backdrop-blur-md px-3 py-2 rounded-xl border border-slate-200 text-[10px] font-mono text-slate-700 shadow-md flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          <Crosshair className="w-3.5 h-3.5 text-blue-600" />
          <span className="font-semibold">{coordsHover.lat}° N, {coordsHover.lon}° E</span>
        </div>
        <span className="text-slate-300">|</span>
        <div>
          <span>ELEV: <strong className="text-blue-700">{coordsHover.elev} m</strong> MSL</span>
        </div>
        <span className="text-slate-300">|</span>
        <div className="text-slate-500 hidden sm:inline">
          <span>CRS: WGS 84 (EPSG:4326)</span>
        </div>
      </div>
    </div>
  );
}
