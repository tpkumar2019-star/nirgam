# API Documentation

**Base URL**: `http://localhost:8000/api`  
**WebSocket URL**: `ws://localhost:8000/ws/flood-updates`  
**Interactive Swagger UI**: `http://localhost:8000/docs`  

---

## 1. Endpoints Summary

### System Health
- **`GET /api/health`**
  - Returns backend online status, version, and active mode (`DEMONSTRATION`).

### Rainfall Nowcast
- **`GET /api/rainfall/current?time_min=0`**
  - Returns current mean intensity (mm/hr), cumulative precipitation, and data provenance.
- **`GET /api/rainfall/forecast`**
  - Returns full 0–180 minute radar hyetograph timeline (15-minute steps).

### Overland Flood & Nowcast State
- **`GET /api/flood/current?time_min=60`**
  - Returns full spatial hydrodynamic state:
    - Maximum flood depth (cm)
    - Total surface water volume ($m^3$)
    - Roads at risk count
    - Surcharging nodes count
    - Active alerts
    - Grid cell depths
- **`GET /api/flood/forecast`**
  - Returns summary timeline of predicted peak water depths, volume, and road hazards across all timesteps (0–180 min).

### Road Network & Inundation Risk
- **`GET /api/roads/risk?time_min=60`**
  - Returns all road segments with coordinates, predicted water depth (cm), risk classification (`Low`, `Moderate`, `High`, `Severe`, `Critical`), speed limits, and traversability.

### Underground Drainage Hydraulics
- **`GET /api/drainage/nodes?time_min=60`**
  - Returns all stormwater manholes/inlets with elevation, Manning capacity, status, and surcharge volume.
- **`GET /api/drainage/edges?time_min=60`**
  - Returns all pipes with diameter, slope, roughness, blockage %, effective capacity, and flow utilization.
- **`GET /api/drainage/critical?time_min=60`**
  - Returns list of overloaded conduits and surcharged nodes.

### Simulation Scenarios & Blockage Injection
- **`POST /api/simulation/scenario`**
  - Request Body:
    ```json
    {
      "scenario_name": "severe_monsoon",
      "peak_intensity_mm_hr": 120.0,
      "pipe_blockage_injections": {
        "P-104": 85.0
      }
    }
    ```
  - Recomputes full 0–3 hour hydrodynamic nowcast and returns updated forecast timeline.

### Flood-Aware Safe Emergency Routing
- **`POST /api/route/safe`**
  - Request Body:
    ```json
    {
      "origin": "INT_HOSPITAL",
      "destination": "INT_SHELTER",
      "travel_mode": "emergency_vehicle",
      "time_horizon_min": 60
    }
    ```
  - Response:
    ```json
    {
      "origin_name": "INT_HOSPITAL",
      "destination_name": "INT_SHELTER",
      "time_horizon_min": 60,
      "route_status": "DIVERTED_FLOOD_AVOIDANCE",
      "normal_distance_m": 1240.5,
      "normal_travel_time_min": 1.9,
      "normal_max_depth_cm": 38.2,
      "normal_is_hazardous": true,
      "safe_distance_m": 1450.0,
      "safe_travel_time_min": 2.2,
      "safe_max_depth_cm": 6.4,
      "avoided_flooded_roads": ["100 Ft Ring Road Underpass (38.2 cm)"],
      "explanation": "Standard route crosses hazardous street segments with predicted 38.2 cm inundation at +60m horizon. Routing engine diverted travel via higher-elevation ridge corridors, reducing maximum flood exposure to 6.4 cm."
    }
    ```

### Model Validation & Scientific Provenance
- **`GET /api/validation`**
  - Returns empirical hydrodynamic and ML residual error metrics: RMSE, MAE, R², F1 score, IoU Inundation, sample size, and data provenance badge.

---

## 2. WebSocket Protocol (`/ws/flood-updates`)

### Outgoing Messages (Server $\to$ Client)
```json
{
  "type": "SIMULATION_TICK",
  "time_min": 60,
  "data": { ... full SimulationStepData ... }
}
```

### Incoming Commands (Client $\to$ Server)
- Start auto-play: `{"action": "START"}`
- Pause auto-play: `{"action": "PAUSE"}`
- Jump to minute: `{"action": "SET_TIME", "time_min": 90}`
- Reset to zero: `{"action": "RESET"}`
