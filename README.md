# NIRGAM — Street-Level Urban Flood Nowcasting System

> **A real-time, web-based flood nowcasting platform for Indian metros.**  
> **Pilot City**: Mumbai (with switchable baselines for Delhi NCR and Chennai).  
> **Core Mission**: Predicts **WHICH** streets will flood, **WHEN**, and **HOW DEEP** (in cm) across the next 0–3 hours, routing emergency services, buses, and commuters around hazardous water.

---

## 1. System Vision & Core Idea

Standard weather apps and rainfall forecasts tell you *how much* rain is falling, but they cannot tell you *which streets* will drown. Urban flooding is fundamentally governed by three coupled physical layers:
1. **Rainfall Nowcast**: Moving convective storm cells tracked across a Doppler radar grid (0–3 hours at 5-minute steps).
2. **2D Surface Terrain (DEM)**: Water flows downhill via gravity along slope vectors and pools in depressions, saucer bowls, and railway underpasses.
3. **Underground Stormwater Drain Graph**: A directed network graph ($G = (V, E)$) where nodes represent manholes/inlets with invert levels and edges represent conduits/culverts with Manning discharge capacities. When inflow exceeds conduit capacity, the node **surcharges** and ejects water back onto the street surface as geyser backflow.

```
                              ┌───────────────────────────────────────────┐
                              │  Doppler Weather Radar (0-3 hr Nowcast)   │
                              │       Moving Convective Storm Cells       │
                              └─────────────────────┬─────────────────────┘
                                                    │
                                                    ▼
┌──────────────────────────────────────┐    ┌──────────────────────────────────────┐
│       2D Digital Elevation Model     │───►│       Runoff & Imperviousness        │
│    Micro-topography & Low Sinks      │    │  Concrete, Asphalts & Catchments     │
└──────────────────┬───────────────────┘    └──────────────────┬───────────────────┘
                   │                                           │
                   └─────────────────────┬─────────────────────┘
                                         ▼
                   ┌───────────────────────────────────────────┐
                   │    2D Overland Surface Flow Simulation    │
                   │     Downhill D8 Flow Trajectories         │
                   └─────────────────────┬─────────────────────┘
                                         │  Inflow capture at inlets
                                         ▼
                   ┌───────────────────────────────────────────┐
                   │   Underground Stormwater Drainage Graph   │
                   │        Manning Closed Conduit Capacity    │
                   │     Surcharge Backflow & Tidal Head       │
                   └─────────────────────┬─────────────────────┘
                                         │  Coupled backflow geyser
                                         ▼
                   ┌───────────────────────────────────────────┐
                   │   Street-Level Depth Output (cm @ 5 min)  │
                   │      80% Confidence Interval Ensemble     │
                   └─────────────────────┬─────────────────────┘
                                         │
                   ┌─────────────────────┴─────────────────────┐
                   ▼                                           ▼
┌──────────────────────────────────────┐    ┌──────────────────────────────────────┐
│    Time-Aware Dynamic Routing API    │    │   Multi-Role Operations Web Portal   │
│  Vehicle Wade Depths (Ambulance,     │    │  Control Room, 108 Dispatcher,       │
│  Bus, Car, Bike, Pedestrian)         │    │  Mobile Commuter, API Playground     │
└──────────────────────────────────────┘    └──────────────────────────────────────┘
```

---

## 2. Key Features

### 2.1 Live Full-Screen Operations Map
- **Visual Design**: Dark military / air-traffic-control aesthetic (`#070b14` deep navy base), high-contrast glassmorphic floating panels, single-hue cyan-to-deep-blue depth gradient, with warm amber and red reserved strictly for danger.
- **Layers**:
  - **Flood Depth**: Real-time street segments colored by depth: Clear (<15 cm), Caution (15–30 cm), Hazardous (30–50 cm), and Impassable (>50 cm glowing red).
  - **Surface Flow Paths**: Downhill animated dashed vectors showing runoff trajectories cascading into depressions.
  - **Drain Network Graph**: Conduits colored by utilization (<60% emerald, 60–100% amber, >100% red) with pulsing surcharged manhole nodes.
  - **Rainfall Radar Cells**: Moving Doppler radar reflectivity (dBZ) cloud contours advecting across the city.
  - **Critical Assets**: Geographic markers for Hospitals (🏥), Underpasses (⚠️), Metro Stations (🚇), Fire Stations (🚒), and Emergency Relief Centers (🏛️).

### 2.2 Time Scrubber (0 to +180 min)
- Scrubbing across 36 timesteps in 5-minute steps with zero-latency 60fps instant visual update.
- **Rainfall Hyetograph Sparkline**: Real-time precipitation intensity graph with marked predicted peak intensity (e.g., `⚡ Peak: 80 mm/hr at +45 min`).
- **City-wide Metric Ticker**: `Streets Impassable: 4 → 38 at +45 min | Surcharged Manholes: 9`.

### 2.3 "Why Is This Flooding?" Signature Explainer
Clicking any flooded street opens a vertical 5-step causal failure chain:
1. **Rainfall Nowcast**: *"Radar cell of 78 mm/hr over this catchment from +10 to +50 min"*
2. **Surface Terrain DEM**: *"This street is 1.8 m below surrounding roads; runoff from 14 hectares drains here"*
3. **Drain Network Capacity**: *"Pipe P-214 Britannia Box will be at 138% capacity from +25 min"*
4. **Hydraulic Failure**: *"Manhole M-0391 surcharges at +28 min; backflow adds ~24 cm"*
5. **Inundation Outcome**: *"Predicted depth 48 cm (range 41–56 cm, 80% confidence); peak at +55 min; recedes by +135 min"*
- Includes a 3-hour depth timeline chart and vehicle wade clearance status.

### 2.4 Drain Network View & Interactive Blockage Simulator
- Ranked side drawer of top stressed pipes and surcharging manholes with time-to-overflow.
- **Blockage Injection**: Click any conduit or manhole to simulate an 80% silt/plastic blockage; the simulation instantly recomputes surface backflow geysers and updates inundation depths.

### 2.5 Time-Aware Route Planner
- **Vehicle Wade Profiles**:
  - Ambulance / Fire: 30 cm max wade
  - City Bus: 25 cm max wade
  - Passenger Car: 15 cm max wade
  - Two-Wheeler: 10 cm max wade
  - Pedestrian: 15 cm max wade
- **Time-Awareness**: Evaluates road conditions at the **predicted arrival time** at each waypoint, not merely the departure time.
- **Dual-Route Comparison**: Displays the usual fastest route (showing where it drowns) alongside the flood-safe elevated corridor with detour ETA difference.
- **Departure Advisor**: *"Leave in 15 min to avoid peak at Sion (saves 24 min travel time)."*

### 2.6 Dedicated Role Views
- **Municipal Control Room**: Ward risk rankings (F-South, K-West, G-North, L-Ward), critical junctions, pump deployment advisories, and one-click municipal alert broadcast.
- **108 Dispatcher**: Base-to-incident corridor tracker with a prominent `SAFE CORRIDOR ENGAGED` vs `RE-ROUTE REQUIRED` status beacon.
- **Commuter (Mobile-First)**: Single high-contrast card with a concise recommendation: *"Leave by 6:10 pm via Route B. Andheri Subway will be impassable from 6:35 pm."* with a one-click WhatsApp share button.

### 2.7 Multi-Scenario Simulation
- Moderate Monsoon (40 mm/hr)
- Heavy Downpour (80 mm/hr)
- Extreme Cloudburst (120+ mm/hr, 2005-style deluge)
- Drains 50% Blocked (Pre-monsoon silt accumulation)
- High Tide + Heavy Rain (Tidal backflow at Arabian Sea / Mahim Creek outfalls)

### 2.8 Interactive API Playground
Live execution and documentation for:
- `GET /api/flood-depth?lat=19.0178&lon=72.8435&t=45`
- `POST /api/route`
- `GET /api/hotspots?t=45`
- `GET /api/drain-status?t=45`
Includes copyable cURL snippets and integration blueprints for Google Maps Routes API, MapmyIndia (Mappls), and OSRM.

### 2.9 60-Second Guided Demo Tour & Cinematic Intro
- 3-second cinematic opening sequence showing Doppler radar calibration.
- 5-step interactive tour guiding users through storm approach, underpass inundation, causal explanation, ambulance rerouting, and commuter safety broadcast.

---

## 3. Architecture & Data Flow

```mermaid
flowchart TD
    A[IMD Doppler Radar Feed / GRIB2] -->|5-min Convective Nowcast| B(Precipitation Advection Grid)
    C[City 3D DEM / Cartosat] -->|D8 Downhill Flow Vector| D(Surface Overland Routing)
    B -->|Rational / SCS Runoff| D
    E[Municipal Stormwater GIS] -->|Pipe Conduits & Manholes| F(1D Directed Drain Graph)
    D -->|Inflow Capture at Inlets| F
    F -->|Manning Hydraulic Capacity| G{Inflow > Capacity?}
    G -- Yes -->|Manhole Surcharge Backflow| D
    G -- No -->|Gravity Outfall to Sea/River| H[Ocean / Creek Discharge]
    D --> I[Per-Street Inundation Depth cm & 80% CI]
    I --> J[Time-Aware Dynamic Router]
    I --> K[REST API & Web UI Dashboard]
```

---

## 4. Model Assumptions & Limitations

1. **Hydraulic Conveyance**: Pipe capacity is computed via Manning's closed-conduit equation ($Q = \frac{1}{n} A R^{2/3} S^{1/2}$) with base concrete roughness $n = 0.013$–$0.015$.
2. **Surface Flow**: 2D overland flow uses diffusive-wave accumulation coupled with D8 drainage directions into local elevation depressions.
3. **Tidal Boundary**: High tide conditions add a head boundary restriction (+4.2m to +4.8m CD) at coastal outfall gates (e.g., Mahim Bay, Britannia, Lovegrove outfalls).
4. **Ensemble Uncertainty**: An 80% confidence interval ($\pm 18\%$) is derived from perturbed convective rainfall ensemble variance.
5. **Operational Plug-in**: The current release ships with precomputed and real-time physics engines for Mumbai, Delhi, and Chennai. The system includes an adapter interface ready to ingest live IMD DWR feeds and municipal PostGIS datasets.

---

## 5. Quick Start Guide

### Prerequisites
- Node.js (v18+)
- Python (v3.10+)

### 1. Clone & Set Up Backend
```bash
cd backend
python -m venv venv
# On Windows:
.\venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8001 --reload
```
API Documentation will be available at: `http://localhost:8001/docs`

### 2. Set Up & Launch Frontend
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:5173/` in your browser.

---

## 6. How to Connect Real Operational Data

NIRGAM's modular adapter architecture allows plug-and-play integration with municipal and national data feeds:

| Data Layer | Interface Adapter | File / Stream Format |
|---|---|---|
| **Doppler Radar (IMD)** | `app.data.providers.RadarProvider` | NetCDF4 / GRIB2 files from IMD DWR (Colaba, Veravali) |
| **Micro-DEM** | `app.data.providers.DEMProvider` | GeoTIFF (Cartosat-1, SRTM 30m, or Municipal Drone LiDAR) |
| **Stormwater Network** | `app.simulation.drainage_graph` | GeoJSON / PostGIS tables of BMC SWD (SWD pipes, SWD manholes) |
| **Traffic Speeds** | `app.routing.flood_router` | TomTom / Google Distance Matrix API live speed feeds |

---

## 7. License & Credits

Developed for the **Ministry of Earth Sciences (MoES)** and **National Centre for Medium Range Weather Forecasting (NCMRWF)** under SIH Problem Statement 26085.
