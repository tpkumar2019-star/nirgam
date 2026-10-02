import numpy as np
from typing import Dict

# Standard Hydrologic Runoff Coefficients (Rational Method, ASCE / CPHEEO Indian Urban Drainage Manual)
DEFAULT_RUNOFF_COEFFICIENTS: Dict[str, float] = {
    "road": 0.88,              # Asphalt / Bituminous & concrete arterial highways
    "concrete": 0.90,          # Paved plazas, commercial aprons
    "building": 0.95,          # Rooftops, industrial complexes
    "residential": 0.70,       # High-density urban dwellings with partial yards
    "open_ground": 0.35,       # Bare unpaved earth, construction parcels
    "vegetation": 0.20,        # Parks, gardens, tree cover, urban green spaces
    "water_body": 1.00         # Direct detention basins/ponds
}

class RunoffModel:
    """
    Translates spatial precipitation intensity into effective surface runoff volume.
    Explicit Unit System:
    - Rainfall Intensity: I (mm / hour)
    - Converted to meters per second: I_m_s = I / (1000.0 * 3600.0)
    - Timestep: dt (seconds)
    - Surface Area: Area (m^2)
    - Runoff Volume added: V_runoff = C * I_m_s * Area * dt (m^3)
    - Surface Depth Increment: delta_h = V_runoff / Area = C * (I / 1000.0) * (dt / 3600.0) (meters)
    """

    def __init__(self, coefficients: Dict[str, float] = None):
        self.coefficients = coefficients or DEFAULT_RUNOFF_COEFFICIENTS

    def get_coefficient(self, land_use: str) -> float:
        return self.coefficients.get(land_use.lower(), 0.65)

    def calculate_cell_runoff_depth(self, rainfall_intensity_mm_hr: float, land_use: str, dt_seconds: float) -> float:
        """
        Calculates incremental surface water depth in meters added to a cell in dt_seconds.
        """
        c = self.get_coefficient(land_use)
        # Intensity in m/s = (mm/hr) / (1000 * 3600)
        i_m_s = rainfall_intensity_mm_hr / 3600000.0
        delta_h_m = c * i_m_s * dt_seconds
        return max(0.0, float(delta_h_m))

    def calculate_cell_runoff_volume(self, rainfall_intensity_mm_hr: float, land_use: str, area_m2: float, dt_seconds: float) -> float:
        """
        Calculates incremental runoff volume (m^3) for a cell over dt_seconds.
        """
        delta_h_m = self.calculate_cell_runoff_depth(rainfall_intensity_mm_hr, land_use, dt_seconds)
        return delta_h_m * area_m2
