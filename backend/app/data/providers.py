from abc import ABC, abstractmethod
from typing import List, Dict, Any, Optional
import numpy as np
import math

class BaseRainfallProvider(ABC):
    """
    Abstract interface for Doppler Weather Radar / Rainfall Nowcast providers.
    Operational deployments should implement this class to fetch real-time
    DWR (Doppler Weather Radar) NetCDF/GRIB2 feeds or AWS gauge networks.
    """
    @abstractmethod
    def get_nowcast(self, timestamp_min: int, grid_rows: int, grid_cols: int, bbox: Dict[str, float]) -> np.ndarray:
        """
        Returns a 2D array of rainfall intensity in mm/hr for the given forecast minute.
        """
        pass

    @abstractmethod
    def get_hyetograph(self, horizon_min: int, step_min: int) -> List[Dict[str, Any]]:
        """Returns mean and peak rainfall timeline over the forecast window."""
        pass


class SimulatedRainfallProvider(BaseRainfallProvider):
    """
    High-fidelity simulated Doppler Radar convective cell nowcast.
    Simulates a storm cell moving across the catchment with temporal growth,
    peak convective intensity, and gradual dissipation.
    """
    def __init__(self, scenario: str = "severe_monsoon", peak_intensity: float = 95.0):
        self.scenario = scenario
        self.peak_intensity = peak_intensity
        # Temporal hyetograph curve: [t_min, fraction of peak]
        # t=0: 15 mm/h, t=30: 45 mm/h, t=60: 95 mm/h, t=90: 120 mm/h, t=120: 65 mm/h, t=180: 20 mm/h
        self.temporal_profile = {
            0: 0.15,
            15: 0.30,
            30: 0.50,
            45: 0.75,
            60: 1.00,
            75: 1.15,  # peak convective burst
            90: 0.90,
            105: 0.70,
            120: 0.50,
            135: 0.35,
            150: 0.25,
            165: 0.18,
            180: 0.10
        }

    def _get_temporal_multiplier(self, t_min: int) -> float:
        times = sorted(self.temporal_profile.keys())
        if t_min in self.temporal_profile:
            return self.temporal_profile[t_min]
        if t_min <= times[0]:
            return self.temporal_profile[times[0]]
        if t_min >= times[-1]:
            return self.temporal_profile[times[-1]]
        # Linear interpolation
        for i in range(len(times) - 1):
            t1, t2 = times[i], times[i+1]
            if t1 <= t_min <= t2:
                frac = (t_min - t1) / (t2 - t1)
                return self.temporal_profile[t1] + frac * (self.temporal_profile[t2] - self.temporal_profile[t1])
        return 0.5

    def get_nowcast(self, timestamp_min: int, grid_rows: int, grid_cols: int, bbox: Dict[str, float]) -> np.ndarray:
        mult = self._get_temporal_multiplier(timestamp_min)
        base_rate = self.peak_intensity * mult

        # Moving storm centroid across the grid (NW to SE trajectory)
        center_r = grid_rows * (0.3 + 0.4 * (timestamp_min / 180.0))
        center_c = grid_cols * (0.35 + 0.3 * (timestamp_min / 180.0))
        sigma_r = grid_rows * 0.35
        sigma_c = grid_cols * 0.35

        grid = np.zeros((grid_rows, grid_cols), dtype=np.float32)
        for r in range(grid_rows):
            for c in range(grid_cols):
                dist_sq = ((r - center_r) / sigma_r) ** 2 + ((c - center_c) / sigma_c) ** 2
                spatial_weight = math.exp(-0.5 * dist_sq)
                # Combine regional storm background (40%) with convective core (60%)
                cell_intensity = base_rate * (0.4 + 0.6 * spatial_weight)
                grid[r, c] = max(0.0, float(cell_intensity))

        return grid

    def get_hyetograph(self, horizon_min: int = 180, step_min: int = 15) -> List[Dict[str, Any]]:
        timeline = []
        cum_rain = 0.0
        for t in range(0, horizon_min + 1, step_min):
            mult = self._get_temporal_multiplier(t)
            intensity = self.peak_intensity * mult
            # Incremental depth in mm = intensity (mm/h) * (step_min / 60)
            incremental = intensity * (step_min / 60.0) if t > 0 else 0.0
            cum_rain += incremental
            timeline.append({
                "time_min": t,
                "label": f"+{t}m" if t > 0 else "NOW",
                "mean_intensity_mm_hr": round(intensity * 0.72, 1),
                "peak_intensity_mm_hr": round(intensity, 1),
                "cumulative_rainfall_mm": round(cum_rain, 1)
            })
        return timeline


class FileRainfallProvider(BaseRainfallProvider):
    """
    Loads historical or CSV/JSON radar grids provided by MoES/NCMRWF datasets.
    """
    def __init__(self, file_path: str):
        self.file_path = file_path
        self.data_cache = {}

    def get_nowcast(self, timestamp_min: int, grid_rows: int, grid_cols: int, bbox: Dict[str, float]) -> np.ndarray:
        # Fallback to zeros if file not loaded
        return np.full((grid_rows, grid_cols), 10.0, dtype=np.float32)

    def get_hyetograph(self, horizon_min: int, step_min: int) -> List[Dict[str, Any]]:
        return []


class BaseDEMProvider(ABC):
    """Abstract interface for Digital Elevation Model data."""
    @abstractmethod
    def get_elevation_grid(self, rows: int, cols: int, bbox: Dict[str, float]) -> np.ndarray:
        pass


class SimulatedDEMProvider(BaseDEMProvider):
    """
    Generates an urban digital elevation model with realistic micro-topography:
    - Overall regional hydraulic gradient toward natural lake/drainage outfall
    - Micro-depressions, street canyons, road embankments, and valley pockets
    """
    def get_elevation_grid(self, rows: int, cols: int, bbox: Dict[str, float]) -> np.ndarray:
        elev = np.zeros((rows, cols), dtype=np.float32)
        base_elevation = 912.0  # e.g., meters above MSL (typical Bangalore plateau elevation)

        for r in range(rows):
            for c in range(cols):
                # Regional slope: water drains from North-West (higher) to South-East (lower)
                regional_slope = -0.55 * r - 0.40 * c
                # Micro-topography waves: ridges and valleys
                valley_1 = -2.8 * math.sin(r * 0.35) * math.cos(c * 0.3)
                # Specific natural depression / low-lying underpass & intersection zones
                depression_a = -3.5 * math.exp(-(((r - 12)**2 + (c - 8)**2) / 8.0))
                depression_b = -4.0 * math.exp(-(((r - 15)**2 + (c - 14)**2) / 12.0))
                # Slight noise
                noise = 0.15 * math.sin(r * 1.5 + c * 2.1)

                elev[r, c] = base_elevation + regional_slope + valley_1 + depression_a + depression_b + noise

        return elev
