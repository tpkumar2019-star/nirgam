import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { 
  Layers, 
  ZoomIn, 
  ZoomOut, 
  Compass, 
  MapPin, 
  ShieldAlert, 
  AlertTriangle, 
  CheckCircle2, 
  Activity, 
  Radio, 
  Wrench,
  Maximize2,
  Globe,
  Map as MapIcon,
  Moon
} from 'lucide-react';

const CARTO_KEY = 'cb1_476r_1_7ec837a636e08d0fff669b0b';

export default function NirgamMap({
  snapshot,
  layers,
  onToggleLayer,
  onSelectStreet,
  selectedStreet,
  routeResult,
  onToggleBlockage,
  customBlockages,
  isBlockageMode,
  onToggleBlockageMode
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const [hoveredStreet, setHoveredStreet] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [mouseCoords, setMouseCoords] = useState({ lat: 19.0450, lon: 72.8520 });
  const [activeBasemap, setActiveBasemap] = useState('voyager'); // 'voyager' (Full Color), 'satellite', 'dark'
  const basemapLayersRef = useRef({});

  const layerGroupsRef = useRef({
    streetsGlow: L.layerGroup(),
    streets: L.layerGroup(),
    flowPaths: L.layerGroup(),
    drainagePipes: L.layerGroup(),
    drainageNodes: L.layerGroup(),
    radar: L.layerGroup(),
    assets: L.layerGroup(),
    routes: L.layerGroup()
  });

  // Initialize Map Once
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const initialCenter = snapshot 
      ? [snapshot.streets[0].coordinates[0][0], snapshot.streets[0].coordinates[0][1]] 
      : [19.0450, 72.8520];

    const map = L.map(mapContainerRef.current, {
      center: initialCenter,
      zoom: 13,
      zoomControl: false,
      attributionControl: false
    });

    // 1. CARTO Voyager (Vivid Rich Color Municipal Basemap with user's key)
    const voyagerLayer = L.tileLayer(
      `https://basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png?key=${CARTO_KEY}`,
      { maxZoom: 19, subdomains: 'abcd', attribution: '© CARTO Voyager' }
    );

    // 2. High-Res Satellite Imagery (Esri World Imagery)
    const satelliteLayer = L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      { maxZoom: 19, attribution: '© Esri World Imagery' }
    );

    // 3. CARTO Dark Matter (Night Operations)
    const darkLayer = L.tileLayer(
      `https://basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}.png?key=${CARTO_KEY}`,
      { maxZoom: 19, subdomains: 'abcd', attribution: '© CARTO Dark' }
    );

    basemapLayersRef.current = {
      voyager: voyagerLayer,
      satellite: satelliteLayer,
      dark: darkLayer
    };

    // Default to the rich colorful Carto Voyager basemap!
    voyagerLayer.addTo(map);

    // Track mouse coordinates for live GIS telemetry
    map.on('mousemove', (e) => {
      setMouseCoords({
        lat: Number(e.latlng.lat.toFixed(4)),
        lon: Number(e.latlng.lng.toFixed(4))
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

  // Switch Basemap Handler
  const handleBasemapChange = (type) => {
    const map = mapInstanceRef.current;
    if (!map) return;
    Object.values(basemapLayersRef.current).forEach((layer) => map.removeLayer(layer));
    if (basemapLayersRef.current[type]) {
      basemapLayersRef.current[type].addTo(map);
      // Bring data overlay groups to front
      Object.values(layerGroupsRef.current).forEach((lg) => {
        if (map.hasLayer(lg) && lg.bringToFront) {
          lg.bringToFront();
        }
      });
    }
    setActiveBasemap(type);
  };

  // Center map when city changes
  useEffect(() => {
    if (!mapInstanceRef.current || !snapshot || snapshot.streets.length === 0) return;
    const center = [snapshot.streets[0].coordinates[0][0], snapshot.streets[0].coordinates[0][1]];
    mapInstanceRef.current.setView(center, 13, { animate: true });
  }, [snapshot.cityId]);

  // Render & Update Layers when snapshot, layers, or blockages change
  useEffect(() => {
    if (!mapInstanceRef.current || !snapshot) return;

    const lg = layerGroupsRef.current;
    Object.values(lg).forEach((g) => g.clearLayers());

    // 1. Street Segments Layer (Flood Depth Ribbons)
    if (layers.floodDepth) {
      snapshot.streets.forEach((street) => {
        const isSelected = selectedStreet && selectedStreet.id === street.id;
        const depth = street.currentDepthCm;

        // Vivid Municipal GIS Colors:
        // Clear: Emerald Green (#10b981)
        // Caution: Vivid Sky Blue (#0284c7)
        // Hazardous: Warm Amber/Orange (#f59e0b)
        // Impassable: Crimson Red (#e11d48) with glowing border
        let color = '#10b981';
        let weight = 5;
        let opacity = 0.9;

        if (depth >= 50) {
          color = '#e11d48'; // Impassable (Crimson Red)
          weight = 8;
          opacity = 1.0;
        } else if (depth >= 30) {
          color = '#f59e0b'; // Hazardous (Amber Orange)
          weight = 7;
          opacity = 0.95;
        } else if (depth >= 15) {
          color = '#0284c7'; // Caution (Vivid Sky Blue)
          weight = 6;
          opacity = 0.9;
        }

        // Dark outer halo for crisp contrast against any basemap
        const haloPolyline = L.polyline(street.coordinates, {
          color: '#0f172a',
          weight: weight + 3,
          opacity: 0.65,
          lineCap: 'round',
          lineJoin: 'round'
        });
        haloPolyline.addTo(lg.streetsGlow);

        // Core colored depth polyline
        const polyline = L.polyline(street.coordinates, {
          color: isSelected ? '#ffffff' : color,
          weight: isSelected ? weight + 2 : weight,
          opacity: isSelected ? 1 : opacity,
          lineCap: 'round',
          lineJoin: 'round'
        });

        // Event handlers
        polyline.on('mouseover', (e) => {
          setHoveredStreet(street);
          setMousePos({ x: e.containerPoint.x, y: e.containerPoint.y });
        });
        polyline.on('mousemove', (e) => {
          setMousePos({ x: e.containerPoint.x, y: e.containerPoint.y });
        });
        polyline.on('mouseout', () => {
          setHoveredStreet(null);
        });
        polyline.on('click', () => {
          onSelectStreet(street);
        });

        polyline.addTo(lg.streets);

        // Water depth marker badge on street midpoint
        if (depth >= 12) {
          const midPoint = street.coordinates[Math.floor(street.coordinates.length / 2)];
          const badgeHtml = `
            <div class="relative flex items-center justify-center cursor-pointer transition-transform hover:scale-110">
              <div class="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold shadow-xl flex items-center gap-1 border ${
                depth >= 50 
                  ? 'bg-rose-900 text-white border-rose-400 animate-pulse ring-2 ring-rose-500/50' 
                  : depth >= 30
                  ? 'bg-amber-900 text-amber-100 border-amber-400'
                  : 'bg-slate-900 text-cyan-200 border-cyan-400'
              }">
                <span>${Math.round(depth)} cm</span>
              </div>
            </div>
          `;
          const marker = L.marker(midPoint, {
            icon: L.divIcon({
              className: 'custom-depth-badge',
              html: badgeHtml,
              iconSize: [64, 26],
              iconAnchor: [32, 13]
            })
          });
          marker.on('click', () => onSelectStreet(street));
          marker.addTo(lg.streets);
        }
      });
    }

    // 2. Surface Flow Paths (Downhill Streaming Vectors)
    if (layers.flowPaths && snapshot.flowPaths) {
      snapshot.flowPaths.forEach((path) => {
        const polyline = L.polyline(path.points, {
          color: '#0284c7',
          weight: 3,
          opacity: 0.85,
          dashArray: '6, 10',
          className: 'surface-flow-anim'
        });
        polyline.addTo(lg.flowPaths);

        const endPoint = path.points[path.points.length - 1];
        const arrowMarker = L.circleMarker(endPoint, {
          radius: 5,
          fillColor: '#0284c7',
          color: '#ffffff',
          weight: 1.5,
          fillOpacity: 1
        });
        arrowMarker.addTo(lg.flowPaths);
      });
    }

    // 3. Stormwater Drainage Network Graph (Pipes & Manholes)
    if (layers.drainage && snapshot.edges) {
      snapshot.edges.forEach((edge) => {
        const startNode = snapshot.nodes.find((n) => n.id === edge.start);
        const endNode = snapshot.nodes.find((n) => n.id === edge.end);
        if (!startNode || !endNode) return;

        let edgeColor = '#10b981'; // <60% Green
        if (edge.utilizationPct > 100) edgeColor = '#e11d48'; // Red overloaded
        else if (edge.utilizationPct >= 60) edgeColor = '#f59e0b'; // Amber

        const isBlocked = !!customBlockages[edge.id];
        const pipePoly = L.polyline(
          [[startNode.lat, startNode.lon], [endNode.lat, endNode.lon]],
          {
            color: isBlocked ? '#64748b' : edgeColor,
            weight: isBlocked ? 6 : 4,
            opacity: 0.95,
            dashArray: isBlocked ? '4, 4' : (edge.utilizationPct > 80 ? '8, 8' : null),
            className: edge.utilizationPct > 80 ? 'drain-pipe-flow' : ''
          }
        );

        pipePoly.on('click', () => {
          if (onToggleBlockage) onToggleBlockage(edge.id);
        });

        pipePoly.bindTooltip(
          `<b>${edge.name}</b><br/>Capacity Util: ${edge.utilizationPct}%<br/>Flow: ${edge.dischargeM3s} m³/s`,
          { className: 'gov-map-tooltip' }
        );

        pipePoly.addTo(lg.drainagePipes);
      });

      // Manholes
      snapshot.nodes.forEach((node) => {
        const isBlocked = !!customBlockages[node.id];
        let nodeColor = node.isSurcharged ? '#e11d48' : (node.utilizationPct >= 80 ? '#f59e0b' : '#0284c7');
        if (isBlocked) nodeColor = '#64748b';

        const nodeMarker = L.circleMarker([node.lat, node.lon], {
          radius: node.isSurcharged ? 8 : 6,
          fillColor: nodeColor,
          color: '#ffffff',
          weight: 2,
          fillOpacity: 1
        });

        if (node.isSurcharged) {
          const pulseIcon = L.divIcon({
            className: 'surcharge-pulse-marker',
            html: `<div class="relative w-5 h-5 rounded-full bg-rose-500 animate-ping opacity-80"></div>`,
            iconSize: [20, 20],
            iconAnchor: [10, 10]
          });
          L.marker([node.lat, node.lon], { icon: pulseIcon }).addTo(lg.drainageNodes);
        }

        nodeMarker.on('click', () => {
          if (onToggleBlockage) onToggleBlockage(node.id);
        });

        nodeMarker.bindTooltip(
          `<b>${node.name}</b><br/>Status: ${node.isSurcharged ? '⚠️ SURCHARGING (Backflow)' : 'NORMAL'}<br/>Util: ${node.utilizationPct}%`,
          { className: 'gov-map-tooltip' }
        );

        nodeMarker.addTo(lg.drainageNodes);
      });
    }

    // 4. Moving Doppler Radar Rain Cells
    if (layers.radar && snapshot.radarCells) {
      snapshot.radarCells.forEach((cell) => {
        const t = snapshot.timeMin;
        const currentLat = cell.startLat + cell.driftLat * (t / 10);
        const currentLon = cell.startLon + cell.driftLon * (t / 10);

        const radarCircle = L.circle([currentLat, currentLon], {
          radius: cell.radiusKm * 1000,
          color: '#0284c7',
          weight: 2,
          fillColor: '#38bdf8',
          fillOpacity: 0.2,
          dashArray: '5, 5'
        });
        radarCircle.bindTooltip(
          `<b>${cell.name}</b><br/>Reflectivity: ${cell.maxDbz} dBZ<br/>Track: Moving NE @ 24 km/h`,
          { className: 'gov-map-tooltip' }
        );
        radarCircle.addTo(lg.radar);

        const coreCircle = L.circle([currentLat, currentLon], {
          radius: (cell.radiusKm * 1000) * 0.45,
          color: '#0369a1',
          weight: 1.5,
          fillColor: '#0284c7',
          fillOpacity: 0.35
        });
        coreCircle.addTo(lg.radar);
      });
    }

    // 5. Critical Assets (Hospitals, Underpasses, Metro, Fire)
    if (layers.assets && snapshot.assets) {
      snapshot.assets.forEach((asset) => {
        let iconSymbol = '📍';
        let badgeStyle = 'bg-blue-900 border-blue-400 text-white';

        if (asset.type === 'hospital') {
          iconSymbol = '🏥';
          badgeStyle = 'bg-emerald-800 border-emerald-400 text-white font-bold';
        } else if (asset.type === 'underpass') {
          iconSymbol = '⚠️';
          badgeStyle = 'bg-amber-800 border-amber-400 text-white font-bold';
        } else if (asset.type === 'metro') {
          iconSymbol = '🚇';
          badgeStyle = 'bg-purple-800 border-purple-400 text-white font-bold';
        } else if (asset.type === 'fire_station') {
          iconSymbol = '🚒';
          badgeStyle = 'bg-rose-800 border-rose-400 text-white font-bold';
        }

        const assetHtml = `
          <div class="px-2.5 py-1 rounded-xl text-[11px] font-sans font-semibold border shadow-lg flex items-center gap-1.5 ${badgeStyle}">
            <span>${iconSymbol}</span>
            <span class="max-w-[130px] truncate">${asset.name.split('(')[0]}</span>
          </div>
        `;

        const marker = L.marker([asset.lat, asset.lon], {
          icon: L.divIcon({
            className: 'custom-asset-pin',
            html: assetHtml,
            iconSize: [140, 26],
            iconAnchor: [70, 13]
          })
        });

        marker.bindTooltip(
          `<b>${asset.name}</b><br/>Type: ${asset.type.toUpperCase()}<br/>Elevation: ${asset.elevM}m`,
          { className: 'gov-map-tooltip' }
        );

        marker.addTo(lg.assets);
      });
    }

    // 6. Active Routes (Usual Route vs Flood-Safe Route)
    if (routeResult && layers.routes) {
      if (routeResult.usualRoute && routeResult.usualRoute.waypoints.length > 1) {
        const pts = routeResult.usualRoute.waypoints.map((w) => [w.lat, w.lon]);
        const usualPoly = L.polyline(pts, {
          color: '#e11d48',
          weight: 4,
          opacity: 0.8,
          dashArray: '8, 8'
        });
        usualPoly.bindTooltip('<b>Usual Arterial Route (Submerged & Impassable)</b>', {
          className: 'gov-map-tooltip'
        });
        usualPoly.addTo(lg.routes);
      }

      if (routeResult.safeRoute && routeResult.safeRoute.waypoints.length > 1) {
        const pts = routeResult.safeRoute.waypoints.map((w) => [w.lat, w.lon]);
        const safePoly = L.polyline(pts, {
          color: '#10b981',
          weight: 6,
          opacity: 0.95,
          lineCap: 'round',
          lineJoin: 'round'
        });
        safePoly.bindTooltip(
          `<b>Flood-Safe Corridor (${routeResult.safeRoute.etaDiffMin})</b>`,
          { className: 'gov-map-tooltip' }
        );
        safePoly.addTo(lg.routes);

        const origin = pts[0];
        const dest = pts[pts.length - 1];

        L.circleMarker(origin, {
          radius: 8,
          fillColor: '#10b981',
          color: '#ffffff',
          weight: 2,
          fillOpacity: 1
        }).addTo(lg.routes);

        L.circleMarker(dest, {
          radius: 8,
          fillColor: '#0284c7',
          color: '#ffffff',
          weight: 2,
          fillOpacity: 1
        }).addTo(lg.routes);
      }
    }
  }, [snapshot, layers, selectedStreet, routeResult, customBlockages]);

  const handleZoomIn = () => mapInstanceRef.current?.zoomIn();
  const handleZoomOut = () => mapInstanceRef.current?.zoomOut();

  return (
    <div className="relative w-full h-full overflow-hidden bg-slate-900">
      {/* Map Container */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Floating Basemap & Layer Control Menu (Top Right) */}
      <div className="absolute top-4 right-4 z-20 flex flex-col gap-2.5">
        {/* Basemap Switcher Widget */}
        <div className="bg-slate-900/95 backdrop-blur-md rounded-2xl p-2 shadow-2xl border border-slate-700/80 flex items-center gap-1 text-xs">
          <button
            onClick={() => handleBasemapChange('voyager')}
            className={`px-3 py-1.5 rounded-xl font-medium transition flex items-center gap-1.5 cursor-pointer ${
              activeBasemap === 'voyager'
                ? 'bg-blue-600 text-white font-bold shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
            title="Carto Voyager (Full Color Municipal Basemap)"
          >
            <MapIcon className="w-3.5 h-3.5" />
            <span>Voyager</span>
          </button>

          <button
            onClick={() => handleBasemapChange('satellite')}
            className={`px-3 py-1.5 rounded-xl font-medium transition flex items-center gap-1.5 cursor-pointer ${
              activeBasemap === 'satellite'
                ? 'bg-blue-600 text-white font-bold shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
            title="Esri Satellite Imagery"
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Satellite</span>
          </button>

          <button
            onClick={() => handleBasemapChange('dark')}
            className={`px-3 py-1.5 rounded-xl font-medium transition flex items-center gap-1.5 cursor-pointer ${
              activeBasemap === 'dark'
                ? 'bg-blue-600 text-white font-bold shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
            title="Carto Dark Matter (Night Ops)"
          >
            <Moon className="w-3.5 h-3.5" />
            <span>Night</span>
          </button>
        </div>

        {/* Layer Toggles Panel */}
        <div className="bg-slate-900/95 backdrop-blur-md rounded-2xl p-3 shadow-2xl border border-slate-700/80 flex flex-col gap-2 text-xs text-slate-100 min-w-[210px]">
          <div className="flex items-center justify-between pb-1.5 border-b border-slate-700/80 font-mono text-[11px] text-cyan-300 font-semibold">
            <span className="flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5" />
              <span>GIS OVERLAY LAYERS</span>
            </span>
          </div>

          <label className="flex items-center justify-between p-1 rounded-lg hover:bg-slate-800/80 cursor-pointer">
            <span className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
              <span className="font-medium">Flood Depth (Streets)</span>
            </span>
            <input
              type="checkbox"
              checked={layers.floodDepth}
              onChange={() => onToggleLayer('floodDepth')}
              className="accent-blue-500 rounded cursor-pointer"
            />
          </label>

          <label className="flex items-center justify-between p-1 rounded-lg hover:bg-slate-800/80 cursor-pointer">
            <span className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
              <span className="font-medium">Surface Flow Paths</span>
            </span>
            <input
              type="checkbox"
              checked={layers.flowPaths}
              onChange={() => onToggleLayer('flowPaths')}
              className="accent-blue-500 rounded cursor-pointer"
            />
          </label>

          <label className="flex items-center justify-between p-1 rounded-lg hover:bg-slate-800/80 cursor-pointer">
            <span className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              <span className="font-medium">Drain Network Graph</span>
            </span>
            <input
              type="checkbox"
              checked={layers.drainage}
              onChange={() => onToggleLayer('drainage')}
              className="accent-blue-500 rounded cursor-pointer"
            />
          </label>

          <label className="flex items-center justify-between p-1 rounded-lg hover:bg-slate-800/80 cursor-pointer">
            <span className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-400" />
              <span className="font-medium">Rainfall Radar Cells</span>
            </span>
            <input
              type="checkbox"
              checked={layers.radar}
              onChange={() => onToggleLayer('radar')}
              className="accent-blue-500 rounded cursor-pointer"
            />
          </label>

          <label className="flex items-center justify-between p-1 rounded-lg hover:bg-slate-800/80 cursor-pointer">
            <span className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-400" />
              <span className="font-medium">Critical Assets</span>
            </span>
            <input
              type="checkbox"
              checked={layers.assets}
              onChange={() => onToggleLayer('assets')}
              className="accent-blue-500 rounded cursor-pointer"
            />
          </label>

          {/* Blockage simulation trigger */}
          <div className="pt-2 border-t border-slate-700/80">
            <button
              onClick={onToggleBlockageMode}
              className={`w-full py-2 px-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-md ${
                isBlockageMode
                  ? 'bg-rose-600 text-white ring-2 ring-rose-400'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
              }`}
            >
              <Wrench className="w-3.5 h-3.5" />
              <span>{isBlockageMode ? 'Simulating Blockage (Active)' : 'Simulate Blockage'}</span>
            </button>
          </div>
        </div>

        {/* Zoom Controls */}
        <div className="bg-slate-900/95 backdrop-blur-md rounded-xl p-1 shadow-lg border border-slate-700/80 flex flex-col gap-1 self-end">
          <button
            onClick={handleZoomIn}
            className="p-2 hover:bg-slate-800 rounded-lg text-slate-200 hover:text-white cursor-pointer transition"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={handleZoomOut}
            className="p-2 hover:bg-slate-800 rounded-lg text-slate-200 hover:text-white cursor-pointer transition"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Floating Street Hover Tooltip */}
      {hoveredStreet && (
        <div
          className="fixed pointer-events-none z-30 transform -translate-x-1/2 -translate-y-full mb-3"
          style={{ left: mousePos.x, top: mousePos.y }}
        >
          <div className="bg-slate-950/95 backdrop-blur-md px-4 py-3 rounded-2xl shadow-2xl border border-cyan-400/50 text-left min-w-[220px]">
            <div className="text-[11px] font-mono text-cyan-300 font-bold mb-0.5">
              {hoveredStreet.ward}
            </div>
            <div className="text-sm font-bold text-white font-display mb-2">
              {hoveredStreet.name}
            </div>

            <div className="flex items-baseline gap-2 mb-2 bg-slate-900/90 p-2 rounded-xl border border-slate-800">
              <span className="text-3xl font-black font-mono tracking-tight text-white">
                {Math.round(hoveredStreet.currentDepthCm)}
              </span>
              <span className="text-xs text-slate-300 font-mono">cm water depth</span>
            </div>

            <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-800">
              <span className="font-mono text-slate-400">SAFETY:</span>
              <span
                className={`font-mono font-bold px-2 py-0.5 rounded text-[11px] ${
                  hoveredStreet.status === 'IMPASSABLE'
                    ? 'bg-rose-950 text-rose-200 border border-rose-600'
                    : hoveredStreet.status === 'HAZARDOUS'
                    ? 'bg-amber-950 text-amber-200 border border-amber-600'
                    : 'bg-emerald-950 text-emerald-200 border border-emerald-600'
                }`}
              >
                {hoveredStreet.status}
              </span>
            </div>
            <div className="text-[10px] text-cyan-300/80 mt-1.5 italic font-sans">
              Click street to inspect 5-step causal failure chain
            </div>
          </div>
        </div>
      )}

      {/* Live Map Legend & GPS Telemetry (Bottom Left) */}
      <div className="absolute bottom-6 left-4 z-20 flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 bg-slate-900/95 backdrop-blur-md px-4 py-2.5 rounded-2xl text-xs text-slate-200 shadow-2xl border border-slate-700/80">
        <div className="flex items-center gap-1.5 font-mono text-[11px] text-cyan-300 font-bold uppercase pr-2 border-r border-slate-700/80">
          <span>WATER DEPTH</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-emerald-500 shadow-sm" />
          <span className="text-[11px] text-slate-200 font-mono">&lt;15cm Clear</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-sky-600 shadow-sm" />
          <span className="text-[11px] text-slate-200 font-mono">15-30cm Caution</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-amber-500 shadow-sm" />
          <span className="text-[11px] text-amber-300 font-mono font-semibold">30-50cm Hazard</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-rose-500 shadow-sm animate-pulse" />
          <span className="text-[11px] text-rose-300 font-mono font-bold">&gt;50cm Impassable</span>
        </div>

        {/* Live GPS Coordinates HUD */}
        <div className="hidden lg:flex items-center gap-2 pl-3 border-l border-slate-700/80 font-mono text-[10px] text-slate-400">
          <span>LAT: {mouseCoords.lat}°</span>
          <span>LON: {mouseCoords.lon}°</span>
          <span className="px-1.5 py-0.5 rounded bg-slate-800 text-cyan-300">WGS 84</span>
        </div>
      </div>
    </div>
  );
}
