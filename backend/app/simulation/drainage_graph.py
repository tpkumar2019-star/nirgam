import networkx as nx
from typing import Dict, List, Any, Optional
from app.simulation.hydraulics import HydraulicCalculator
from app.simulation.blockage import BlockageModel

class DrainageNetworkGraph:
    """
    Stormwater Underground Drainage Graph Representation using NetworkX.
    Nodes: Inlets, Manholes, Trunk Junctions, Outfall Basin.
    Edges: Stormwater conduits, pipes, RCC culverts.
    """

    def __init__(self):
        self.graph = nx.DiGraph()
        self.nodes_data: Dict[str, Dict[str, Any]] = {}
        self.edges_data: Dict[str, Dict[str, Any]] = {}

    def add_node(self, node_id: str, name: str, node_type: str, lat: float, lon: float,
                 ground_elevation_m: float, invert_elevation_m: float,
                 inlet_capacity_m3_s: float, connected_cell_id: str):
        node_attr = {
            "node_id": node_id,
            "name": name,
            "node_type": node_type,
            "lat": lat,
            "lon": lon,
            "ground_elevation_m": ground_elevation_m,
            "invert_elevation_m": invert_elevation_m,
            "inlet_capacity_m3_s": inlet_capacity_m3_s,
            "connected_cell_id": connected_cell_id,
            "current_water_level_m": 0.0,
            "is_surcharged": False,
            "surcharge_volume_m3": 0.0,
            "utilization_pct": 0.0,
            "blockage_pct": 0.0,
            "status": "NORMAL"
        }
        self.graph.add_node(node_id, **node_attr)
        self.nodes_data[node_id] = node_attr

    def add_edge(self, pipe_id: str, name: str, start_node: str, end_node: str,
                 shape: str = "CIRCULAR", diameter_m: float = 1.0, length_m: float = 100.0,
                 slope: float = 0.005, manning_n: float = 0.013, blockage_pct: float = 0.0):
        
        # Calculate theoretical base full-flow capacity using Manning's equation
        if shape == "BOX":
            base_capacity = HydraulicCalculator.manning_box_full_capacity(
                width_m=diameter_m, height_m=diameter_m * 0.8, slope=slope, manning_n=manning_n
            )
        else:
            base_capacity = HydraulicCalculator.manning_pipe_full_capacity(
                diameter_m=diameter_m, slope=slope, manning_n=manning_n
            )

        effective_capacity = BlockageModel.calculate_effective_capacity(base_capacity, blockage_pct)

        edge_attr = {
            "pipe_id": pipe_id,
            "name": name,
            "start_node": start_node,
            "end_node": end_node,
            "shape": shape,
            "diameter_m": diameter_m,
            "length_m": length_m,
            "slope": slope,
            "manning_n": manning_n,
            "blockage_pct": blockage_pct,
            "base_capacity_m3_s": round(base_capacity, 3),
            "effective_capacity_m3_s": round(effective_capacity, 3),
            "current_flow_m3_s": 0.0,
            "utilization_pct": 0.0,
            "is_overloaded": False,
            "status": "NORMAL"
        }
        self.graph.add_edge(start_node, end_node, key=pipe_id, **edge_attr)
        self.edges_data[pipe_id] = edge_attr

    def set_pipe_blockage(self, pipe_id: str, blockage_pct: float):
        """Dynamically injects blockage into a specific conduit."""
        if pipe_id in self.edges_data:
            edge = self.edges_data[pipe_id]
            edge["blockage_pct"] = max(0.0, min(100.0, blockage_pct))
            edge["effective_capacity_m3_s"] = round(
                BlockageModel.calculate_effective_capacity(edge["base_capacity_m3_s"], edge["blockage_pct"]), 3
            )
            # Update networkx graph edge attributes
            u, v = edge["start_node"], edge["end_node"]
            if self.graph.has_edge(u, v):
                self.graph[u][v]["blockage_pct"] = edge["blockage_pct"]
                self.graph[u][v]["effective_capacity_m3_s"] = edge["effective_capacity_m3_s"]

    def get_topological_order(self) -> List[str]:
        """
        Returns nodes in downstream topological order.
        If cycles exist due to loops, falls back to elevation sort.
        """
        try:
            return list(nx.topological_sort(self.graph))
        except nx.NetworkXUnfeasible:
            # Fallback to sorting by ground elevation descending (upstream to downstream)
            return sorted(self.nodes_data.keys(), key=lambda n: self.nodes_data[n]["ground_elevation_m"], reverse=True)
