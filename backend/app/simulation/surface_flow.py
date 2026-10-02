import numpy as np
import math
from typing import Dict, List, Tuple, Any

class SurfaceFlow2DModel:
    """
    Simplified 2D Diffusive Wave / Cellular Automaton Hydrodynamic Surface Flow Model.
    
    Governing Principles:
    - Total hydraulic head for cell (r, c): H(r, c) = z(r, c) + h(r, c)
      where z is ground elevation (m), h is surface water depth (m).
    - Flow occurs down hydraulic head gradient toward lower adjacent cells.
    - Discharge rate between cells i and j:
        q_ij = (w / n) * h_flow^(5/3) * sqrt(max(0, (H_i - H_j) / dx))
      with an adaptive Courant-Friedrichs-Lewy (CFL) volume limiter preventing negative depths.
    - Mass conservation is maintained: sum(depth) only changes by net influx (rain - drain + surcharge).
    """

    def __init__(self, rows: int, cols: int, cell_size_m: float = 50.0, manning_surface_n: float = 0.035):
        self.rows = rows
        self.cols = cols
        self.dx = cell_size_m
        self.cell_area = cell_size_m * cell_size_m
        self.manning_n = manning_surface_n

        # Grid state arrays (in meters)
        self.elevation = np.zeros((rows, cols), dtype=np.float32)
        self.water_depth = np.zeros((rows, cols), dtype=np.float32)
        self.hydraulic_head = np.zeros((rows, cols), dtype=np.float32)
        self.land_use = np.empty((rows, cols), dtype=object)

        # 4-connectivity cardinal neighbors: (dr, dc)
        self.neighbors = [(-1, 0), (1, 0), (0, -1), (0, 1)]

    def initialize_terrain(self, elevation_grid: np.ndarray, land_use_grid: np.ndarray):
        self.elevation = elevation_grid.astype(np.float32)
        self.land_use = land_use_grid
        self.water_depth.fill(0.0)
        self.update_heads()

    def update_heads(self):
        self.hydraulic_head = self.elevation + self.water_depth

    def add_runoff(self, runoff_depth_increment_m: np.ndarray):
        """Adds instantaneous runoff depth (in meters) directly to surface water layer."""
        self.water_depth += np.maximum(0.0, runoff_depth_increment_m)
        self.update_heads()

    def step_surface_flow(self, dt_seconds: float = 900.0, sub_steps: int = 15):
        """
        Executes hydrodynamic surface routing using stable time-splitting.
        Sub-steps ensure numerical stability (Courant condition: dt_sub <= dx / (sqrt(g * h_max) + v)).
        """
        sub_dt = dt_seconds / float(sub_steps)

        for _ in range(sub_steps):
            self.update_heads()
            net_delta_depth = np.zeros((self.rows, self.cols), dtype=np.float32)

            for r in range(self.rows):
                for c in range(self.cols):
                    h_curr = self.water_depth[r, c]
                    if h_curr <= 0.001:  # Negligible film depth, no overland transfer
                        continue

                    H_curr = self.hydraulic_head[r, c]
                    lower_neighbors = []
                    head_diffs = []

                    for dr, dc in self.neighbors:
                        nr, nc = r + dr, c + dc
                        if 0 <= nr < self.rows and 0 <= nc < self.cols:
                            H_neighbor = self.hydraulic_head[nr, nc]
                            diff = H_curr - H_neighbor
                            if diff > 0.001:  # Downward head gradient exists
                                lower_neighbors.append((nr, nc))
                                head_diffs.append(diff)

                    if not lower_neighbors:
                        continue

                    total_diff = sum(head_diffs)
                    # Manning diffusive wave velocity estimate:
                    # v ~ (1/n) * R^(2/3) * S^(1/2), where R ~ h_curr, S ~ diff / dx
                    avg_diff = total_diff / len(head_diffs)
                    slope = max(0.0001, avg_diff / self.dx)
                    flow_vel = (1.0 / self.manning_n) * (max(0.01, h_curr) ** (2.0 / 3.0)) * math.sqrt(slope)
                    
                    # Maximum transferable depth restricted by CFL stability limit (never exceed 40% of cell water per sub-step)
                    max_transfer_depth = min(h_curr * 0.40, (flow_vel * sub_dt / self.dx) * h_curr)

                    # Distribute transfer proportional to head difference
                    for (nr, nc), diff in zip(lower_neighbors, head_diffs):
                        fraction = diff / total_diff
                        transfer_depth = max_transfer_depth * fraction
                        net_delta_depth[r, c] -= transfer_depth
                        net_delta_depth[nr, nc] += transfer_depth

            # Apply net transfer with strict positivity enforcement
            self.water_depth = np.maximum(0.0, self.water_depth + net_delta_depth)

        self.update_heads()

    def apply_infiltration_and_evap(self, dt_seconds: float):
        """Applies minor surface retention / soil infiltration."""
        # 1.5 mm/hr natural infiltration loss on permeable surfaces
        loss_rate_m_s = 0.0015 / 3600.0
        depth_loss = loss_rate_m_s * dt_seconds
        self.water_depth = np.maximum(0.0, self.water_depth - depth_loss)
        self.update_heads()
