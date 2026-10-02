import math
from typing import Dict, Any

class HydraulicCalculator:
    """
    Implements fundamental hydraulic equations for open channel and closed conduit flow.
    Primary reference: Manning's Formula for gravitational storm sewers.
    """

    @staticmethod
    def manning_pipe_full_capacity(diameter_m: float, slope: float, manning_n: float = 0.013) -> float:
        """
        Calculates theoretical full-pipe gravitational discharge Q (m^3/s) using Manning's equation:
        Q = (1 / n) * A * (R ^ (2/3)) * (S ^ (1/2))

        Parameters:
        - diameter_m (float): Internal pipe diameter in meters (D)
        - slope (float): Hydraulic energy slope / bed slope S (dimensionless, m/m)
        - manning_n (float): Manning's roughness coefficient (typically 0.013 for smooth concrete)

        Assumptions:
        - Steady, uniform, gravity-driven pipe flow under atmospheric pressure prior to surcharge.
        - Cross-sectional flow area A = pi * D^2 / 4
        - Wetted perimeter P = pi * D
        - Hydraulic radius R = A / P = D / 4
        """
        if diameter_m <= 0.0 or slope <= 0.0 or manning_n <= 0.0:
            return 0.0

        area = (math.pi * (diameter_m ** 2)) / 4.0
        hydraulic_radius = diameter_m / 4.0
        slope_term = math.sqrt(max(0.0001, slope))

        q_full = (1.0 / manning_n) * area * (hydraulic_radius ** (2.0 / 3.0)) * slope_term
        return max(0.0, float(q_full))

    @staticmethod
    def manning_box_full_capacity(width_m: float, height_m: float, slope: float, manning_n: float = 0.015) -> float:
        """
        Calculates full capacity for rectangular stormwater culvert / box drain:
        A = W * H
        P = 2 * (W + H)
        R = A / P
        Q = (1 / n) * A * R^(2/3) * S^(1/2)
        """
        if width_m <= 0.0 or height_m <= 0.0 or slope <= 0.0 or manning_n <= 0.0:
            return 0.0

        area = width_m * height_m
        perimeter = 2.0 * (width_m + height_m)
        hydraulic_radius = area / perimeter
        slope_term = math.sqrt(max(0.0001, slope))

        q_box = (1.0 / manning_n) * area * (hydraulic_radius ** (2.0 / 3.0)) * slope_term
        return max(0.0, float(q_box))

    @staticmethod
    def inlet_weir_orifice_capture(water_depth_surface_m: float, inlet_length_m: float = 1.0, opening_height_m: float = 0.15) -> float:
        """
        Calculates stormwater road curb-inlet / grate capture capacity (m^3/s).
        Uses standard Poleni weir formula for shallow head, switching to orifice equation for submerged head:
        - Weir flow (h < opening_height): Q_weir = C_w * L * h^(3/2), C_w ~ 1.66
        - Orifice flow (h >= opening_height): Q_orifice = C_d * A_opening * sqrt(2 * g * h), C_d ~ 0.60
        """
        if water_depth_surface_m <= 0.001:
            return 0.0

        g = 9.81
        if water_depth_surface_m < opening_height_m:
            # Weir control
            c_w = 1.66
            q = c_w * inlet_length_m * (water_depth_surface_m ** 1.5)
        else:
            # Submerged orifice control
            c_d = 0.60
            area = inlet_length_m * opening_height_m
            head = max(0.01, water_depth_surface_m - (opening_height_m / 2.0))
            q = c_d * area * math.sqrt(2.0 * g * head)

        return float(min(1.5, max(0.0, q)))  # Bound by realistic maximum physical intake
