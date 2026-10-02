# System Architecture Documentation

**Project**: Urban Flood Nowcasting System (Drainage and Rainfall Coupling)  
**Problem Statement**: SIH 26085  
**Ministry/Department**: Ministry of Earth Sciences (MoES) / NCMRWF  

---

## 1. High-Level Architecture Overview

The system couples Doppler Weather Radar precipitation forecasts with high-resolution digital elevation models, land-use imperviousness, and a 1D/2D hydrodynamic model to deliver **street-level 0–3 hour inundation nowcasts** and **flood-resilient emergency routing**.

```
                           ┌────────────────────────────────────────┐
                           │ Doppler Weather Radar (DWR) Nowcast    │
                           │ or Synthetic Convective Cell Model     │
                           └──────────────────┬─────────────────────┘
                                              │ (I_mm_hr, Lat, Lon, t)
                                              ▼
                           ┌────────────────────────────────────────┐
                           │ Spatial Interpolation & Hyetograph     │
                           └──────────────────┬─────────────────────┘
                                              │
                    ┌─────────────────────────┼─────────────────────────┐
                    ▼                         ▼                         ▼
         ┌───────────────────┐     ┌───────────────────┐     ┌───────────────────┐
         │ High-Res DEM      │     │ Land-Use &        │     │ Underground       │
         │ Elevation (z)     │     │ Runoff Coeff (C)  │     │ Stormwater Graph  │
         └─────────┬─────────┘     └─────────┬─────────┘     └─────────┬─────────┘
                   │                         │                         │
                   └─────────────────────────┼─────────────────────────┘
                                             ▼
                           ┌────────────────────────────────────────┐
                           │ Hydrologic Runoff Partitioning         │
                           │ Delta_h = C * I * Delta_t              │
                           └──────────────────┬─────────────────────┘
                                              ▼
       ┌─────────────────────────────────────────────────────────────────────────────┐
       │               Coupled 2D Overland / 1D Conduit Hydrodynamics                │
       │                                                                             │
       │   Surface Water Pool           Inlet Orifice/Weir          Conduit Graph    │
       │   [ 2D Diffusive Wave ] ───►  [ Poleni/Orifice Intake ] ──► [ Manning Q ]  │
       │           ▲                                                      │          │
       │           │                                                      ▼          │
       │           │                   Manhole Surcharge            [ Blockage &     │
       │           └────────────────── [ V_surcharge Return ] ◄──── Bottlenecks ]   │
       └──────────────────────────────────────┬──────────────────────────────────────┘
                                              │
                                              ▼
                           ┌────────────────────────────────────────┐
                           │ Road Network Risk Mapping (0–3 Hours)  │
                           │ Inundation Depths: 0, 15, ..., 180 min │
                           └──────────────┬──────────────────┬──────┘
                                          │                  │
                                          ▼                  ▼
                    ┌───────────────────────────┐      ┌───────────────────────────┐
                    │ GIS Command Dashboard     │      │ Dynamic Evacuation        │
                    │ Leaflet / Recharts / SSE  │      │ Flood-Safe Dijkstra Route │
                    └───────────────────────────┘      └───────────────────────────┘
```

---

## 2. Core Modules & Responsibilities

| Module | Location | Purpose & Scientific Method |
|---|---|---|
| **Rainfall Engine** | `backend/app/data/providers.py` | Implements `BaseRainfallProvider` interface. In demo mode, generates a moving convective storm cell. In operational mode, connects to NCMRWF Doppler Radar feeds. |
| **DEM & Topography** | `backend/app/simulation/surface_flow.py` | Models micro-topographic depressions, street canyons, and hydraulic head gradients ($H = z + h$). |
| **Runoff Conversion** | `backend/app/simulation/runoff.py` | Uses standard Rational Method coefficients ($C_{road}=0.88, C_{concrete}=0.90, C_{roof}=0.95, C_{park}=0.20$). |
| **Drainage Network** | `backend/app/simulation/drainage_graph.py` | Directed NetworkX graph representing manholes, junctions, drop inlets, and pipes with topological sorting. |
| **Manning Hydraulics** | `backend/app/simulation/hydraulics.py` | Computes gravitational discharge $Q = \frac{1}{n} A R^{2/3} S^{1/2}$ for pipes and box culverts. |
| **Blockage Engine** | `backend/app/simulation/blockage.py` | Models non-linear capacity reduction $Q_{eff} = Q_{base} (1 - B/100)^{1.5}$ due to silt and debris. |
| **2-Way Coupling** | `backend/app/simulation/coupling.py` | Routes surface water into inlets via Poleni weir flow, detects downstream bottlenecks, and computes manhole surcharge. |
| **2D Surface Flow** | `backend/app/simulation/surface_flow.py` | Cellular automaton diffusive wave flow with CFL stability limiter and strict mass conservation ($h \ge 0$). |
| **Routing Engine** | `backend/app/routing/flood_router.py` | Dijkstra shortest path with dynamic hydrodynamic edge costs ($C_{flood} = \infty$ for $h > h_{crit}$). |
| **Hybrid ML Layer** | `backend/app/ml/hybrid_model.py` | Physics-informed Random Forest Regressor & Gradient Boosting Classifier predicting residual depth and blockage probability. |

---

## 3. Real-Time WebSocket Synchronization Protocol

The frontend connects to `/ws/flood-updates`:
- **Server Broadcasts**:
  - `SIMULATION_TICK`: Broadcasts full hydrodynamic state at each elapsed 15-minute interval during auto-playback.
  - `SIMULATION_UPDATE`: Broadcasts instantaneous state when the user scrubs the 0–180m time slider.
  - `STATUS`: Updates play/pause state.
- **Client Commands**:
  - `{"action": "START"}`: Launches live asynchronous simulation loop.
  - `{"action": "PAUSE"}`: Suspends auto-advance.
  - `{"action": "SET_TIME", "time_min": 60}`: Jumps to specific forecast minute.
  - `{"action": "RESET"}`: Returns to $t=0$.

---

## 4. Extensibility for Operational MoES/NCMRWF Deployment

The architecture uses Dependency Injection and Provider Adapters:
- `SimulatedRainfallProvider` $\to$ `RadarNetCDFRainfallProvider` (reads Doppler radar HDF5/NetCDF4).
- `SimulatedDEMProvider` $\to$ `GeoTIFFDEMProvider` (reads CartoDEM / ALOS 12.5m rasters using `rasterio`).
- `DrainageNetworkGraph` $\to$ `PostGISDrainageProvider` (reads municipal stormwater shapefiles/PostGIS tables).
- Local NetworkX $\to$ `pgRouting` or `OSRM` routing service with dynamic edge weighting.
