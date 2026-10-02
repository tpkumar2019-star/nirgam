import React, { useState, useEffect, useRef, useMemo } from 'react';
import NirgamHeader from './components/NirgamHeader';
import NirgamMap from './maps/NirgamMap';
import NirgamTimeScrubber from './components/NirgamTimeScrubber';
import CausalExplainerPanel from './components/CausalExplainerPanel';
import DrainNetworkPanel from './components/DrainNetworkPanel';
import RoutePlannerPanel from './components/RoutePlannerPanel';
import ControlRoomView from './components/roles/ControlRoomView';
import DispatcherView from './components/roles/DispatcherView';
import CommuterView from './components/roles/CommuterView';
import ApiPlaygroundPage from './components/ApiPlaygroundPage';
import GuidedTourModal from './components/GuidedTourModal';
import CinematicIntro from './components/CinematicIntro';

import { computeSimulationSnapshot, calculateTimeAwareRoute } from './data/nirgamData';

export default function App() {
  // App States
  const [showIntro, setShowIntro] = useState(true);
  const [activeCity, setActiveCity] = useState('mumbai');
  const [activeScenario, setActiveScenario] = useState('heavy');
  const [activeRole, setActiveRole] = useState('live_map'); // 'live_map', 'control_room', 'dispatcher', 'commuter', 'api'
  const [currentTimeMin, setCurrentTimeMin] = useState(45); // Default to +45m where storm & inundation are peak
  const [isPlaying, setIsPlaying] = useState(false);
  const [isTourOpen, setIsTourOpen] = useState(false);

  // Layer Toggles
  const [layers, setLayers] = useState({
    floodDepth: true,
    flowPaths: true,
    drainage: true,
    radar: true,
    assets: true,
    routes: true
  });

  // Selection & Route States
  const [selectedStreet, setSelectedStreet] = useState(null);
  const [isDrainPanelOpen, setIsDrainPanelOpen] = useState(false);
  const [isRoutePanelOpen, setIsRoutePanelOpen] = useState(false);
  const [customBlockages, setCustomBlockages] = useState({});
  const [isBlockageMode, setIsBlockageMode] = useState(false);

  // Routing parameters
  const [departTimeMin, setDepartTimeMin] = useState(15);
  const [activeVehicle, setActiveVehicle] = useState('ambulance');

  // Compute live physics simulation snapshot (coupled DEM + radar nowcast + Manning drainage)
  const snapshot = useMemo(() => {
    return computeSimulationSnapshot(activeCity, activeScenario, currentTimeMin, customBlockages);
  }, [activeCity, activeScenario, currentTimeMin, customBlockages]);

  // Compute dynamic time-aware route
  const routeResult = useMemo(() => {
    return calculateTimeAwareRoute(
      'KEM_HOSPITAL',
      'ANDHERI_INCIDENT',
      departTimeMin,
      activeVehicle,
      activeCity,
      activeScenario,
      customBlockages
    );
  }, [activeCity, activeScenario, departTimeMin, activeVehicle, customBlockages]);

  // Update selected street object with latest depth & causal chain on timestep change
  useEffect(() => {
    if (selectedStreet) {
      const updated = snapshot.streets.find((s) => s.id === selectedStreet.id);
      if (updated) setSelectedStreet(updated);
    }
  }, [snapshot]);

  // Playback timer (runs at 60fps capability with 1.2s per 5-min step)
  useEffect(() => {
    let interval = null;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTimeMin((prev) => {
          if (prev >= 180) {
            setIsPlaying(false);
            return 0;
          }
          return prev + 5;
        });
      }, 1200);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  // Keyboard navigation hotkeys (Space to toggle play, ESC to close panels, 1-5 for roles)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['INPUT', 'SELECT', 'TEXTAREA'].includes(e.target.tagName)) return;

      if (e.key === ' ' || e.code === 'Space') {
        e.preventDefault();
        setIsPlaying((p) => !p);
      } else if (e.key === 'Escape') {
        setSelectedStreet(null);
        setIsDrainPanelOpen(false);
        setIsRoutePanelOpen(false);
        setIsTourOpen(false);
        if (activeRole !== 'live_map') setActiveRole('live_map');
      } else if (e.key === '1') {
        setActiveRole('live_map');
      } else if (e.key === '2') {
        setActiveRole('control_room');
      } else if (e.key === '3') {
        setActiveRole('dispatcher');
      } else if (e.key === '4') {
        setActiveRole('commuter');
      } else if (e.key === '5') {
        setActiveRole('api');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeRole]);

  // Handlers
  const handleToggleLayer = (layerKey) => {
    setLayers((prev) => ({ ...prev, [layerKey]: !prev[layerKey] }));
  };

  const handleSelectStreet = (street) => {
    setSelectedStreet(street);
    setIsDrainPanelOpen(false);
    setIsRoutePanelOpen(false);
  };

  const handleToggleBlockage = (objectId) => {
    setCustomBlockages((prev) => {
      const copy = { ...prev };
      if (copy[objectId]) delete copy[objectId];
      else copy[objectId] = true;
      return copy;
    });
  };

  const handleResetBlockages = () => {
    setCustomBlockages({});
  };

  // Demo tour guide actions
  const handleTourGoToStep = (stepNumber) => {
    if (stepNumber === 1) {
      setActiveScenario('heavy');
      setCurrentTimeMin(15);
      setActiveRole('live_map');
      setSelectedStreet(null);
    } else if (stepNumber === 2) {
      setCurrentTimeMin(45);
      setActiveRole('live_map');
    } else if (stepNumber === 3) {
      setCurrentTimeMin(50);
      const andheri = snapshot.streets.find((s) => s.id === 'RD-AND') || snapshot.streets[1];
      if (andheri) setSelectedStreet(andheri);
    } else if (stepNumber === 4) {
      setSelectedStreet(null);
      setActiveRole('dispatcher');
      setDepartTimeMin(15);
      setActiveVehicle('ambulance');
    } else if (stepNumber === 5) {
      setActiveRole('commuter');
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#070b14] text-slate-100 font-sans antialiased select-none">
      {/* 1. Cinematic Rain Intro (3-second skippable) */}
      {showIntro && <CinematicIntro onComplete={() => setShowIntro(false)} />}

      {/* 2. Top Header Navigation */}
      <NirgamHeader
        activeCity={activeCity}
        onCityChange={(city) => {
          setActiveCity(city);
          setSelectedStreet(null);
        }}
        activeScenario={activeScenario}
        onScenarioChange={setActiveScenario}
        activeRole={activeRole}
        onRoleChange={setActiveRole}
        onStartTour={() => setIsTourOpen(true)}
        currentTimeMin={currentTimeMin}
      />

      {/* 3. Hero Map View (The Map is the Hero) */}
      <div className="flex-1 relative w-full h-full overflow-hidden">
        <NirgamMap
          snapshot={snapshot}
          layers={layers}
          onToggleLayer={handleToggleLayer}
          onSelectStreet={handleSelectStreet}
          selectedStreet={selectedStreet}
          routeResult={routeResult}
          onToggleBlockage={handleToggleBlockage}
          customBlockages={customBlockages}
          isBlockageMode={isBlockageMode}
          onToggleBlockageMode={() => setIsBlockageMode((p) => !p)}
        />

        {/* Floating Quick Action Buttons (Top Left of Map) */}
        <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
          {/* Routes Panel Toggle */}
          <button
            onClick={() => {
              setIsRoutePanelOpen(!isRoutePanelOpen);
              setSelectedStreet(null);
              setIsDrainPanelOpen(false);
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold shadow-xl transition flex items-center gap-1.5 cursor-pointer border ${
              isRoutePanelOpen
                ? 'bg-blue-600 text-white border-blue-400 shadow-blue-600/30 ring-2 ring-blue-400/40'
                : 'bg-slate-900/95 backdrop-blur-md text-slate-100 hover:text-white hover:bg-slate-800 border-slate-700/80'
            }`}
          >
            <span>🚑 Safe Corridors</span>
          </button>

          {/* Drainage Graph Details Toggle */}
          <button
            onClick={() => {
              setIsDrainPanelOpen(!isDrainPanelOpen);
              setSelectedStreet(null);
              setIsRoutePanelOpen(false);
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold shadow-xl transition flex items-center gap-1.5 cursor-pointer border ${
              isDrainPanelOpen
                ? 'bg-blue-600 text-white border-blue-400 shadow-blue-600/30 ring-2 ring-blue-400/40'
                : 'bg-slate-900/95 backdrop-blur-md text-slate-100 hover:text-white hover:bg-slate-800 border-slate-700/80'
            }`}
          >
            <span>🌊 Drain Network</span>
          </button>
        </div>

        {/* 4. "Why is this flooding?" Causal Explainer Drawer */}
        {selectedStreet && (
          <CausalExplainerPanel
            street={selectedStreet}
            currentTimeMin={currentTimeMin}
            onClose={() => setSelectedStreet(null)}
          />
        )}

        {/* 5. Drain Network View Drawer */}
        {isDrainPanelOpen && (
          <DrainNetworkPanel
            snapshot={snapshot}
            onClose={() => setIsDrainPanelOpen(false)}
            customBlockages={customBlockages}
            onToggleBlockage={handleToggleBlockage}
            onResetBlockages={handleResetBlockages}
            isBlockageMode={isBlockageMode}
            onToggleBlockageMode={() => setIsBlockageMode((p) => !p)}
          />
        )}

        {/* 6. Route Planner Floating Panel */}
        {isRoutePanelOpen && (
          <RoutePlannerPanel
            routeResult={routeResult}
            departTimeMin={departTimeMin}
            onDepartTimeChange={setDepartTimeMin}
            activeVehicle={activeVehicle}
            onVehicleChange={setActiveVehicle}
            onClose={() => setIsRoutePanelOpen(false)}
          />
        )}

        {/* 7. Dedicated Role Views (Section 4.6) */}
        {activeRole === 'control_room' && (
          <ControlRoomView
            snapshot={snapshot}
            onClose={() => setActiveRole('live_map')}
            onSelectStreet={handleSelectStreet}
          />
        )}

        {activeRole === 'dispatcher' && (
          <DispatcherView
            routeResult={routeResult}
            onClose={() => setActiveRole('live_map')}
            departTimeMin={departTimeMin}
          />
        )}

        {activeRole === 'commuter' && (
          <CommuterView
            routeResult={routeResult}
            currentTimeMin={currentTimeMin}
            onClose={() => setActiveRole('live_map')}
          />
        )}

        {/* 8. API Playground Modal Page (Section 4.8) */}
        {activeRole === 'api' && (
          <ApiPlaygroundPage onClose={() => setActiveRole('live_map')} />
        )}

        {/* 9. Guided Demo Tour Modal (Section 4.9) */}
        {isTourOpen && (
          <GuidedTourModal
            onClose={() => setIsTourOpen(false)}
            onGoToStep={handleTourGoToStep}
          />
        )}
      </div>

      {/* 10. Bottom Time Scrubber with Rain Sparkline (Section 4.2) */}
      <NirgamTimeScrubber
        currentTimeMin={currentTimeMin}
        onTimeChange={setCurrentTimeMin}
        isPlaying={isPlaying}
        onTogglePlay={() => setIsPlaying((p) => !p)}
        rainHyetograph={snapshot.rainHyetograph}
        peakRainMmHr={snapshot.peakRainMmHr}
        peakTimeMin={snapshot.peakTimeMin}
        impassableCount={snapshot.impassableCount}
        hazardousCount={snapshot.hazardousCount}
        surchargedNodesCount={snapshot.surchargedNodesCount}
        rainIntensityMmHr={snapshot.rainIntensityMmHr}
      />
    </div>
  );
}
