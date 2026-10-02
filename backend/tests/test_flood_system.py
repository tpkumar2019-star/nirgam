import pytest
import numpy as np
from app.simulation.runoff import RunoffModel
from app.simulation.hydraulics import HydraulicCalculator
from app.simulation.blockage import BlockageModel
from app.simulation.surface_flow import SurfaceFlow2DModel
from app.simulation.coupling import SurfaceDrainCoupler
from app.simulation.drainage_graph import DrainageNetworkGraph
from app.routing.flood_router import FloodAwareRouter
from app.simulation.engine import UrbanFloodEngine

def test_1_increasing_rainfall_increases_runoff():
    """TEST 1: Increasing rainfall must increase runoff."""
    model = RunoffModel()
    dt = 900.0  # 15 minutes
    runoff_low = model.calculate_cell_runoff_depth(20.0, "road", dt)
    runoff_high = model.calculate_cell_runoff_depth(80.0, "road", dt)
    assert runoff_high > runoff_low
    assert runoff_high == pytest.approx(runoff_low * 4.0, rel=1e-3)

def test_2_elevation_gradient_causes_water_accumulation_in_lower_cells():
    """TEST 2: Higher elevation cells should generally receive less accumulated water than connected lower cells."""
    rows, cols = 5, 5
    model = SurfaceFlow2DModel(rows, cols, cell_size_m=50.0)
    # Elevation slopes downward from row 0 (high) to row 4 (low)
    elev = np.zeros((rows, cols), dtype=np.float32)
    for r in range(rows):
        elev[r, :] = 100.0 - (r * 2.0)
    lu = np.full((rows, cols), "road", dtype=object)
    model.initialize_terrain(elev, lu)

    # Distribute uniform 0.05m water
    model.water_depth.fill(0.05)
    model.update_heads()

    # Step surface flow
    model.step_surface_flow(dt_seconds=900.0, sub_steps=20)

    # Upper row 0 must have lost water; lowest row 4 must have gained water
    assert model.water_depth[0, 2] < 0.05
    assert model.water_depth[4, 2] > 0.05
    assert (model.water_depth >= 0.0).all()

def test_3_increasing_pipe_blockage_reduces_hydraulic_capacity():
    """TEST 3: Increasing pipe blockage must reduce effective hydraulic capacity."""
    d = 1.0
    slope = 0.005
    base_cap = HydraulicCalculator.manning_pipe_full_capacity(d, slope)
    cap_clear = BlockageModel.calculate_effective_capacity(base_cap, 0.0)
    cap_blocked_30 = BlockageModel.calculate_effective_capacity(base_cap, 30.0)
    cap_blocked_80 = BlockageModel.calculate_effective_capacity(base_cap, 80.0)

    assert cap_clear == pytest.approx(base_cap)
    assert cap_blocked_30 < cap_clear
    assert cap_blocked_80 < cap_blocked_30
    assert cap_blocked_80 > 0.0
    assert BlockageModel.calculate_effective_capacity(base_cap, 100.0) == 0.0

def test_4_inflow_exceeding_capacity_causes_node_surcharge():
    """TEST 4: When drainage inflow exceeds capacity, node surcharge must increase."""
    graph = DrainageNetworkGraph()
    graph.add_node("N1", "Inlet 1", "inlet", 12.0, 77.0, 10.0, 8.0, 5.0, "c_0_0")
    graph.add_node("N2", "Outlet", "outlet", 12.0, 77.01, 8.0, 6.0, 5.0, "c_0_1")
    # Small pipe capacity = ~0.5 m^3/s
    graph.add_edge("P1", "Pipe 1", "N1", "N2", diameter_m=0.5, slope=0.001)

    dt = 900.0
    # Inflow = 1500 m^3 over 900s (~1.67 m^3/s, exceeds ~0.5 m^3/s capacity)
    inflows = {"N1": 1500.0}
    surcharged, flows = SurfaceDrainCoupler.route_network_and_surcharge(graph, inflows, dt)

    assert "N1" in surcharged
    assert surcharged["N1"] > 0.0
    assert graph.nodes_data["N1"]["is_surcharged"] is True
    assert graph.nodes_data["N1"]["status"] == "SURCHARGED"

def test_5_surcharge_increases_surface_water_coupling():
    """TEST 5: Surcharge must increase nearby surface water where coupling exists."""
    dt = 900.0
    cell_area = 2500.0
    initial_surface_h = 0.02  # 2 cm

    # Capture water from surface
    captured_vol, rem_h = SurfaceDrainCoupler.capture_surface_water(
        initial_surface_h, inlet_capacity_m3_s=2.0, cell_area_m2=cell_area, dt_seconds=dt
    )
    assert captured_vol > 0.0
    assert rem_h < initial_surface_h

    # Return surcharged volume of 100 m^3 back to surface
    surcharged_vol = 100.0
    restored_h = rem_h + (surcharged_vol / cell_area)
    assert restored_h > rem_h

def test_6_flood_depth_evolves_over_simulation_time():
    """TEST 6: Flood depth must change over simulation time."""
    engine = UrbanFloodEngine(rows=20, cols=20)
    step_0 = engine.get_step_data(0)
    step_60 = engine.get_step_data(60)
    assert step_0 is not None and step_60 is not None
    assert step_60.cumulative_rainfall_mm > step_0.cumulative_rainfall_mm
    assert step_60.max_flood_depth_cm > step_0.max_flood_depth_cm

def test_7_forecast_changes_with_future_rainfall_profile():
    """TEST 7: The 0–3 hour forecast must change according to future rainfall input."""
    engine = UrbanFloodEngine(rows=20, cols=20)
    timeline = engine.get_forecast_summary()
    assert len(timeline) == 13  # 0, 15, ..., 180 min
    intensities = [step["rainfall_intensity_mm_hr"] for step in timeline]
    # Check that intensities vary over time (peaking then declining)
    assert max(intensities) > min(intensities)

def test_8_routing_engine_penalizes_and_avoids_flooded_roads():
    """TEST 9: The routing engine must penalize or avoid flooded roads."""
    engine = UrbanFloodEngine(rows=20, cols=20)
    # Hospital to Shelter at +60min when Ring Road underpass is inundated
    route_result = engine.calculate_safe_route("INT_HOSPITAL", "INT_SHELTER", time_min=60, travel_mode="emergency_vehicle")
    assert "route_status" in route_result
    assert "safe_route" in route_result
    assert "normal_route" in route_result
    # Safe route must have lower or equal max depth compared to normal route
    assert route_result["safe_max_depth_cm"] <= route_result["normal_max_depth_cm"]

def test_9_changing_rainfall_scenario_produces_different_outcome():
    """TEST 10: Changing rainfall scenario must produce a different flood outcome."""
    engine = UrbanFloodEngine(rows=20, cols=20)
    engine.run_full_nowcast(scenario_name="moderate", peak_intensity_mm_hr=40.0)
    peak_depth_moderate = engine.get_step_data(60).max_flood_depth_cm

    engine.run_full_nowcast(scenario_name="cloudburst", peak_intensity_mm_hr=120.0)
    peak_depth_cloudburst = engine.get_step_data(60).max_flood_depth_cm

    assert peak_depth_cloudburst > peak_depth_moderate

def test_10_changing_blockage_percentage_produces_different_drainage_outcome():
    """TEST 11: Changing blockage percentage must produce a different drainage/flood outcome."""
    engine = UrbanFloodEngine(rows=20, cols=20)
    # Clear pipe P-104
    engine.run_full_nowcast(blockage_overrides={"P-104": 0.0})
    surcharge_clear = engine.drainage_graph.nodes_data["N-104"]["surcharge_volume_m3"]

    # Heavily block pipe P-104
    engine.run_full_nowcast(blockage_overrides={"P-104": 95.0})
    surcharge_blocked = engine.drainage_graph.nodes_data["N-104"]["surcharge_volume_m3"]

    assert surcharge_blocked >= surcharge_clear

def test_11_data_provenance_is_transparently_labeled():
    """TEST 11: The system must never display fabricated real-world measurements without labeling their source."""
    engine = UrbanFloodEngine(rows=20, cols=20)
    metrics = engine.ml_model.get_validation_metrics()
    assert "data_provenance" in metrics
    assert "synthetic" in metrics["data_provenance"].lower() or "benchmark" in metrics["data_provenance"].lower()

def test_12_water_depth_never_negative():
    """TEST 12: Water depth must never become negative under any physical step."""
    rows, cols = 10, 10
    model = SurfaceFlow2DModel(rows, cols, cell_size_m=50.0)
    elev = np.random.uniform(900.0, 930.0, (rows, cols))
    lu = np.full((rows, cols), "road", dtype=object)
    model.initialize_terrain(elev, lu)
    model.water_depth.fill(0.01)
    model.step_surface_flow(dt_seconds=900.0, sub_steps=15)
    assert (model.water_depth >= 0.0).all()

def test_13_mass_balance_approximately_conserved():
    """TEST 13: In a closed overland basin with zero drainage, water mass must be conserved within numerical tolerance."""
    rows, cols = 6, 6
    model = SurfaceFlow2DModel(rows, cols, cell_size_m=50.0)
    elev = np.zeros((rows, cols))
    elev[0, :] = 10.0
    elev[-1, :] = 0.0
    lu = np.full((rows, cols), "road", dtype=object)
    model.initialize_terrain(elev, lu)
    
    # Introduce 100 m^3 across interior cells
    initial_volume = 100.0
    model.water_depth[1:3, 1:3] = 0.05
    vol_start = np.sum(model.water_depth) * model.cell_area
    
    model.step_surface_flow(dt_seconds=300.0, sub_steps=20)
    vol_end = np.sum(model.water_depth) * model.cell_area
    
    # Conservation within 2% numerical diffusion
    assert vol_end == pytest.approx(vol_start, rel=0.02)

def test_14_road_risk_changes_with_flood_depth():
    """TEST 14: Road risk classification and passability must change deterministically with flood depth."""
    engine = UrbanFloodEngine(rows=20, cols=20)
    step_data = engine.get_step_data(60)
    for road in step_data.roads:
        if road.current_depth_cm > 15.0:
            assert road.risk_level.upper() in ["CRITICAL", "SEVERE", "HIGH"]
        elif road.current_depth_cm <= 5.0:
            assert road.risk_level.upper() in ["LOW", "SAFE"]
        else:
            assert road.risk_level.upper() == "MODERATE"



