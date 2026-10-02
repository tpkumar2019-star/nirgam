from typing import Dict, Any, List, Tuple
import math
from app.simulation.hydraulics import HydraulicCalculator
from app.simulation.blockage import BlockageModel

class SurfaceDrainCoupler:
    """
    Two-way hydraulic coupling between the overland 2D surface grid
    and the underground 1D pipe network.
    
    Interactions:
    1. Surface -> Drain: Overland water enters street curbs/inlets up to hydraulic capture capacity.
    2. Network Routing: Conduit flows are routed along pipes toward downstream outfall.
    3. Drain -> Surface (Surcharge): If downstream pipe capacity or blockage restricts outflow,
       hydraulic pressure builds at the node, causing water to surcharge up through the manhole/gully
       back onto the surface street cell.
    """

    @staticmethod
    def capture_surface_water(surface_depth_m: float, inlet_capacity_m3_s: float, 
                              cell_area_m2: float, dt_seconds: float) -> Tuple[float, float]:
        """
        Calculates volume captured by drainage inlet from surface during dt_seconds.
        Returns: (captured_volume_m3, remaining_surface_depth_m)
        """
        if surface_depth_m <= 0.001:
            return 0.0, surface_depth_m

        available_vol = surface_depth_m * cell_area_m2
        # Hydraulic intake rate governed by weir/curb opening
        intake_rate = HydraulicCalculator.inlet_weir_orifice_capture(surface_depth_m)
        intake_rate = min(intake_rate, inlet_capacity_m3_s)

        vol_captured = min(available_vol, intake_rate * dt_seconds)
        rem_vol = available_vol - vol_captured
        rem_depth = rem_vol / cell_area_m2
        return vol_captured, max(0.0, rem_depth)

    @staticmethod
    def route_network_and_surcharge(drainage_graph, node_inflow_volumes: Dict[str, float], dt_seconds: float) -> Tuple[Dict[str, float], Dict[str, float]]:
        """
        Routes incoming water volume through the underground conduit graph.
        Identifies pipe bottlenecking, computes node surcharge, and returns:
        - surcharged_volumes_m3: {node_id: excess_water_m3_returning_to_surface}
        - pipe_flows: {pipe_id: flow_m3_s}
        """
        surcharged_volumes: Dict[str, float] = {}
        pipe_flows: Dict[str, float] = {}
        node_water_pool: Dict[str, float] = {n: node_inflow_volumes.get(n, 0.0) for n in drainage_graph.nodes_data}

        # Traverse from upstream to downstream
        topo_order = drainage_graph.get_topological_order()

        for u in topo_order:
            inflow_vol = node_water_pool.get(u, 0.0)
            out_edges = list(drainage_graph.graph.out_edges(u, data=True))

            if not out_edges:
                # Outlet node - discharges safely to river/retention basin
                node_data = drainage_graph.nodes_data[u]
                node_data["is_surcharged"] = False
                node_data["surcharge_volume_m3"] = 0.0
                node_data["status"] = "OUTLET_DISCHARGE"
                node_data["utilization_pct"] = round(min(100.0, (inflow_vol / dt_seconds / 5.0) * 100), 1)
                continue

            # Calculate total outgoing capacity from node u
            total_out_eff_cap = sum(edata["effective_capacity_m3_s"] for _, _, edata in out_edges)
            req_discharge_rate = inflow_vol / max(1.0, dt_seconds)

            if req_discharge_rate > total_out_eff_cap:
                # Downstream capacity exceeded -> Node surcharges back to street surface
                excess_rate = req_discharge_rate - total_out_eff_cap
                excess_vol = excess_rate * dt_seconds
                surcharged_volumes[u] = excess_vol

                # Outgoing pipes run at 100% maximum capacity
                delivered_vol = total_out_eff_cap * dt_seconds
                node_data = drainage_graph.nodes_data[u]
                node_data["is_surcharged"] = True
                node_data["surcharge_volume_m3"] = round(excess_vol, 2)
                node_data["status"] = "SURCHARGED"
                node_data["utilization_pct"] = round((req_discharge_rate / max(0.01, total_out_eff_cap)) * 100.0, 1)

                # Divide full flow among outgoing pipes proportional to their capacity
                for _, v, edata in out_edges:
                    p_id = edata["pipe_id"]
                    cap_ratio = edata["effective_capacity_m3_s"] / max(0.001, total_out_eff_cap)
                    p_flow = edata["effective_capacity_m3_s"]
                    pipe_flows[p_id] = p_flow
                    node_water_pool[v] = node_water_pool.get(v, 0.0) + (p_flow * dt_seconds)

                    util, status, is_over = BlockageModel.evaluate_pipe_condition(
                        p_flow, edata["effective_capacity_m3_s"], edata["blockage_pct"]
                    )
                    edata["current_flow_m3_s"] = round(p_flow, 3)
                    edata["utilization_pct"] = util
                    edata["status"] = status
                    edata["is_overloaded"] = is_over
            else:
                # All water safely conveyed through pipes
                delivered_vol = inflow_vol
                node_data = drainage_graph.nodes_data[u]
                node_data["is_surcharged"] = False
                node_data["surcharge_volume_m3"] = 0.0
                node_data["utilization_pct"] = round((req_discharge_rate / max(0.01, total_out_eff_cap)) * 100.0, 1) if total_out_eff_cap > 0 else 0.0
                node_data["status"] = "HIGH_LOAD" if node_data["utilization_pct"] > 75.0 else "NORMAL"

                # Distribute flow
                for _, v, edata in out_edges:
                    p_id = edata["pipe_id"]
                    cap_ratio = edata["effective_capacity_m3_s"] / max(0.001, total_out_eff_cap)
                    p_flow = req_discharge_rate * cap_ratio
                    pipe_flows[p_id] = p_flow
                    node_water_pool[v] = node_water_pool.get(v, 0.0) + (p_flow * dt_seconds)

                    util, status, is_over = BlockageModel.evaluate_pipe_condition(
                        p_flow, edata["effective_capacity_m3_s"], edata["blockage_pct"]
                    )
                    edata["current_flow_m3_s"] = round(p_flow, 3)
                    edata["utilization_pct"] = util
                    edata["status"] = status
                    edata["is_overloaded"] = is_over

        return surcharged_volumes, pipe_flows
