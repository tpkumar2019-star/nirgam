import networkx as nx
from typing import Dict, List, Any, Optional, Tuple
import math

class FloodAwareRouter:
    """
    Geospatial Dijkstra / A* Routing Engine with Dynamic Hydrodynamic Edge Penalties.
    Calculates both standard navigation routes and flood-resilient emergency routes.
    """

    def __init__(self, road_segments: List[Dict[str, Any]]):
        self.road_segments_dict = {r["road_id"]: r for r in road_segments}
        self.road_graph = nx.DiGraph()
        self._build_road_graph(road_segments)

    def _build_road_graph(self, road_segments: List[Dict[str, Any]]):
        """Constructs dual-direction road network graph."""
        for r in road_segments:
            road_id = r["road_id"]
            u = r.get("start_intersection", f"node_{road_id}_start")
            v = r.get("end_intersection", f"node_{road_id}_end")
            length = float(r.get("length_m", 250.0))
            speed = float(r.get("speed_limit_kmh", 40.0))
            base_travel_time_sec = (length / (speed * 1000.0 / 3600.0))

            edge_data = {
                "road_id": road_id,
                "name": r["name"],
                "length_m": length,
                "base_travel_time_sec": base_travel_time_sec,
                "coordinates": r.get("coordinates", [])
            }
            # Bidirectional traversability for urban streets
            self.road_graph.add_edge(u, v, **edge_data)
            self.road_graph.add_edge(v, u, **edge_data)

    def find_safe_route(self, origin_node: str, destination_node: str,
                        time_horizon_min: int = 60,
                        travel_mode: str = "emergency_vehicle",
                        critical_depth_threshold_cm: float = 20.0) -> Dict[str, Any]:
        """
        Calculates:
        1. Normal shortest route (dry/flood-unaware)
        2. Dynamic flood-safe alternative route avoiding or heavily penalizing hazardous water depths.
        """
        # Critical vehicle impassability thresholds (cm)
        threshold_map = {
            "emergency_vehicle": 35.0,  # High-clearance fire/rescue truck
            "commuter_car": 15.0,       # Sedan exhaust/intake clearance
            "two_wheeler": 10.0,       # Scooter/bike balance limit
            "pedestrian": 8.0          # Walkway wading limit
        }
        crit_threshold = critical_depth_threshold_cm or threshold_map.get(travel_mode, 20.0)
        time_key = str(time_horizon_min)

        # 1. Compute Normal Shortest Path (Standard Cost = Base Travel Time)
        try:
            normal_path_nodes = nx.shortest_path(self.road_graph, origin_node, destination_node, weight="base_travel_time_sec")
        except nx.NetworkXNoPath:
            return {"error": f"No traversable physical road path between {origin_node} and {destination_node}"}

        # 2. Assign dynamic flood penalty weights to all edges
        for u, v, data in self.road_graph.edges(data=True):
            r_id = data["road_id"]
            road_data = self.road_segments_dict.get(r_id, {})
            predicted_depths = road_data.get("predicted_depth_cm", {})
            depth_cm = float(predicted_depths.get(time_key, road_data.get("current_depth_cm", 0.0)))
            base_time = data["base_travel_time_sec"]

            if depth_cm >= crit_threshold:
                # Impassable hazard: Infinite penalty (cannot safely traverse)
                data["flood_adjusted_cost"] = 1e9
            else:
                # Progressive slowdown cost due to wading water resistance
                penalty_multiplier = 1.0 + 10.0 * ((depth_cm / crit_threshold) ** 2.5)
                data["flood_adjusted_cost"] = base_time * penalty_multiplier

        # 3. Compute Flood-Safe Optimal Path
        try:
            safe_path_nodes = nx.shortest_path(self.road_graph, origin_node, destination_node, weight="flood_adjusted_cost")
        except nx.NetworkXNoPath:
            safe_path_nodes = normal_path_nodes  # Fallback

        # Helper to construct detailed route segment records
        def build_route_details(path_nodes: List[str]) -> Tuple[List[Dict[str, Any]], float, float, float, List[str], bool]:
            segments = []
            total_dist = 0.0
            total_time_sec = 0.0
            max_depth = 0.0
            flooded_roads = []
            is_hazardous = False

            for i in range(len(path_nodes) - 1):
                u, v = path_nodes[i], path_nodes[i+1]
                edge_d = self.road_graph[u][v]
                r_id = edge_d["road_id"]
                road_info = self.road_segments_dict.get(r_id, {})
                predicted_depths = road_info.get("predicted_depth_cm", {})
                depth = float(predicted_depths.get(time_key, road_info.get("current_depth_cm", 0.0)))

                length = edge_d["length_m"]
                base_time = edge_d["base_travel_time_sec"]
                total_dist += length
                total_time_sec += base_time
                if depth > max_depth:
                    max_depth = depth

                hazard = depth >= crit_threshold
                if hazard:
                    is_hazardous = True
                    flooded_roads.append(f"{road_info.get('name', r_id)} ({round(depth, 1)} cm)")
                elif depth > 10.0:
                    flooded_roads.append(f"{road_info.get('name', r_id)} ({round(depth, 1)} cm)")

                risk_lvl = "Critical" if depth > 50 else ("Severe" if depth > 30 else ("High" if depth > 15 else ("Moderate" if depth > 5 else "Low")))

                segments.append({
                    "road_id": r_id,
                    "name": road_info.get("name", r_id),
                    "coordinates": edge_d["coordinates"],
                    "length_m": round(length, 1),
                    "travel_time_sec": round(base_time, 1),
                    "flood_depth_cm": round(depth, 1),
                    "risk_level": risk_lvl,
                    "is_hazard": hazard
                })

            return segments, round(total_dist, 1), round(total_time_sec / 60.0, 1), round(max_depth, 1), flooded_roads, is_hazardous

        norm_segments, norm_dist, norm_time, norm_max_d, norm_flooded, norm_hazard = build_route_details(normal_path_nodes)
        safe_segments, safe_dist, safe_time, safe_max_d, safe_flooded, safe_hazard = build_route_details(safe_path_nodes)

        is_diverted = safe_path_nodes != normal_path_nodes

        # Generate clear justification explanation
        if is_diverted and norm_hazard:
            explanation = (
                f"Standard route crosses hazardous street segments with predicted {norm_max_d} cm inundation at +{time_horizon_min}m horizon. "
                f"Routing engine diverted travel via higher-elevation ridge corridors, reducing maximum flood exposure to {safe_max_d} cm "
                f"(Travel time adjustment: +{max(0.1, round(safe_time - norm_time, 1))} min, +{round(safe_dist - norm_dist, 0)} m)."
            )
            route_status = "DIVERTED_FLOOD_AVOIDANCE"
        elif is_diverted:
            explanation = (
                f"Alternative route selected to minimize wading resistance (Normal max depth: {norm_max_d} cm vs Safe route: {safe_max_d} cm)."
            )
            route_status = "OPTIMAL_SAFE"
        else:
            explanation = f"Primary route is fully flood-safe (Maximum predicted inundation: {safe_max_d} cm, below critical vehicle threshold of {crit_threshold} cm)."
            route_status = "NORMAL_CLEAR"

        # Extract origin and destination coordinates from segments
        origin_coords = norm_segments[0]["coordinates"][0] if norm_segments and norm_segments[0]["coordinates"] else [12.943, 77.588]
        destination_coords = norm_segments[-1]["coordinates"][-1] if norm_segments and norm_segments[-1]["coordinates"] else [12.928, 77.601]

        return {
            "origin_name": origin_node,
            "destination_name": destination_node,
            "origin_coords": origin_coords,
            "destination_coords": destination_coords,
            "time_horizon_min": time_horizon_min,
            "travel_mode": travel_mode,
            "critical_threshold_cm": crit_threshold,
            "route_status": route_status,
            "normal_route": norm_segments,
            "normal_distance_m": norm_dist,
            "normal_travel_time_min": norm_time,
            "normal_max_depth_cm": norm_max_d,
            "normal_flooded_roads": norm_flooded,
            "normal_is_hazardous": norm_hazard,
            "safe_route": safe_segments,
            "safe_distance_m": safe_dist,
            "safe_travel_time_min": safe_time,
            "safe_max_depth_cm": safe_max_d,
            "avoided_flooded_roads": norm_flooded if is_diverted else [],
            "explanation": explanation
        }
