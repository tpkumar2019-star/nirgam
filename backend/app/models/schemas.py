from typing import List, Dict, Optional, Any
from pydantic import BaseModel, Field

class LandSurfaceType(BaseModel):
    category: str
    runoff_coefficient: float
    description: str

class DEMCell(BaseModel):
    cell_id: str
    row: int
    col: int
    lat: float
    lon: float
    elevation_m: float
    land_use: str
    runoff_coefficient: float
    area_m2: float = 2500.0
    slope_pct: float = 0.0
    aspect_deg: float = 0.0

class RainfallCell(BaseModel):
    cell_id: str
    lat: float
    lon: float
    intensity_mm_hr: float
    cumulative_mm: float

class RainfallNowcast(BaseModel):
    timestamp_min: int
    label: str
    mean_intensity_mm_hr: float
    max_intensity_mm_hr: float
    cells: List[RainfallCell]
    data_source: str = "SIMULATION / DEMONSTRATION DATA (Replaceable with Doppler Radar Nowcast)"

class DrainageNode(BaseModel):
    node_id: str
    name: str
    node_type: str  # "manhole", "inlet", "junction", "outlet", "pump_station"
    lat: float
    lon: float
    ground_elevation_m: float
    invert_elevation_m: float
    inlet_capacity_m3_s: float
    connected_cell_id: str
    current_water_level_m: float = 0.0
    is_surcharged: bool = False
    surcharge_volume_m3: float = 0.0
    utilization_pct: float = 0.0
    blockage_pct: float = 0.0
    status: str = "NORMAL"  # "NORMAL", "HIGH_LOAD", "SURCHARGED", "OVERFLOWING"

class DrainageEdge(BaseModel):
    pipe_id: str
    name: str
    start_node: str
    end_node: str
    shape: str = "CIRCULAR"  # "CIRCULAR" or "BOX"
    diameter_m: float = 1.0  # or width/height
    length_m: float = 100.0
    slope: float = 0.005
    manning_n: float = 0.013
    blockage_pct: float = 0.0
    base_capacity_m3_s: float
    effective_capacity_m3_s: float
    current_flow_m3_s: float = 0.0
    utilization_pct: float = 0.0
    is_overloaded: bool = False
    status: str = "NORMAL"

class RoadSegment(BaseModel):
    road_id: str
    name: str
    road_type: str  # "primary", "secondary", "arterial", "local"
    coordinates: List[List[float]]  # [[lat, lon], ...]
    length_m: float
    elevation_m: float
    connected_cell_ids: List[str]
    current_depth_cm: float = 0.0
    predicted_depth_cm: Dict[str, float] = {}  # e.g. {"0": 2.1, "30": 8.4, "60": 18.2, ...}
    risk_level: str = "Low"  # "Low", "Moderate", "High", "Severe", "Critical"
    is_passable: bool = True
    flood_threshold_cm: float = 15.0
    time_to_critical_min: Optional[int] = None
    speed_limit_kmh: float = 50.0
    current_safe_speed_kmh: float = 50.0
    nearby_drain_nodes: List[str] = []

class Alert(BaseModel):
    alert_id: str
    timestamp_min: int
    severity: str  # "INFO", "WARNING", "CRITICAL"
    category: str  # "DRAIN_SURCHARGE", "ROAD_INUNDATION", "RAINFALL_PEAK"
    title: str
    message: str
    location_id: str
    location_name: str
    lat: float
    lon: float
    recommended_action: str

class SimulationStepData(BaseModel):
    timestep_min: int
    timestamp_label: str
    rainfall_intensity_mm_hr: float
    cumulative_rainfall_mm: float
    total_surface_water_m3: float
    total_drained_water_m3: float
    total_surcharged_water_m3: float
    roads_at_risk_count: int
    critical_nodes_count: int
    max_flood_depth_cm: float
    cells_flood_depth_cm: Dict[str, float]
    roads: List[RoadSegment]
    nodes: List[DrainageNode]
    edges: List[DrainageEdge]
    alerts: List[Alert]

class SimulationResponse(BaseModel):
    model_config = {"protected_namespaces": ()}
    status: str
    current_time_min: int
    total_timesteps: int
    current_step: SimulationStepData
    forecast_timeline: List[Dict[str, Any]]
    model_source: str = "HYBRID PHYSICS-DRAINAGE COUPLING (MoES/NCMRWF Prototype)"

class RouteRequest(BaseModel):
    origin: str  # Node name or "lat,lon"
    destination: str
    travel_mode: str = "emergency_vehicle"  # "emergency_vehicle", "commuter_car", "two_wheeler", "pedestrian"
    time_horizon_min: int = 60  # Check against forecasted water depth at this future minute
    critical_threshold_cm: Optional[float] = None

class RouteSegment(BaseModel):
    road_id: str
    name: str
    coordinates: List[List[float]]
    length_m: float
    travel_time_sec: float
    flood_depth_cm: float
    risk_level: str
    is_hazard: bool

class RouteResult(BaseModel):
    origin_name: str
    destination_name: str
    origin_coords: Optional[List[float]] = []
    destination_coords: Optional[List[float]] = []
    time_horizon_min: int
    route_status: str  # "OPTIMAL_SAFE", "NORMAL_CLEAR", "DIVERTED"
    
    # Normal Route (unaware of flood)
    normal_route: List[RouteSegment]
    normal_distance_m: float
    normal_travel_time_min: float
    normal_max_depth_cm: float
    normal_flooded_roads: List[str]
    normal_is_hazardous: bool

    # Safe Route (flood-aware routing)
    safe_route: List[RouteSegment]
    safe_distance_m: float
    safe_travel_time_min: float
    safe_max_depth_cm: float
    avoided_flooded_roads: List[str]
    
    explanation: str

class ValidationMetrics(BaseModel):
    rmse_depth_cm: float
    mae_depth_cm: float
    r2_score: float
    precision_flood: float
    recall_flood: float
    f1_score: float
    iou_inundation: float
    sample_size: int
    data_provenance: str = "Calculated on synthetic benchmark hydrodynamics (Replaceable with gauge observations)"

class ScenarioUpdateRequest(BaseModel):
    scenario_name: Optional[str] = "severe_monsoon"  # "severe_monsoon", "cloudburst", "moderate", "custom"
    peak_intensity_mm_hr: Optional[float] = 95.0
    pipe_blockage_injections: Optional[Dict[str, float]] = None  # e.g. {"P-104": 85.0}
    inlet_blockage_injections: Optional[Dict[str, float]] = None
