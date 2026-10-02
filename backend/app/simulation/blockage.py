import math
from typing import Dict, Any, Tuple

class BlockageModel:
    """
    Models solid waste / silt sedimentation / debris blockage in stormwater conduits.
    Quantifies the reduction in effective hydraulic cross-section and conveyance capacity.
    """

    @staticmethod
    def calculate_effective_capacity(base_capacity_m3_s: float, blockage_percentage: float) -> float:
        """
        Calculates effective pipe conveyance capacity under blockage conditions.
        
        Equation:
        effective_capacity = base_capacity * (1 - (blockage_pct / 100.0)) ^ 1.5
        
        Note: The 1.5 power exponent reflects both physical cross-sectional area loss
        and increased relative boundary resistance (increased wetted perimeter / reduced hydraulic radius).
        """
        clamped_blockage = max(0.0, min(100.0, blockage_percentage))
        if clamped_blockage >= 99.0:
            return 0.0

        conveyance_factor = (1.0 - (clamped_blockage / 100.0)) ** 1.5
        effective = base_capacity_m3_s * conveyance_factor
        return max(0.0, float(effective))

    @staticmethod
    def evaluate_pipe_condition(current_flow_m3_s: float, effective_capacity_m3_s: float, blockage_pct: float) -> Tuple[float, str, bool]:
        """
        Evaluates pipe hydraulic state:
        Returns (utilization_pct, status_str, is_overloaded)
        """
        if effective_capacity_m3_s <= 0.0001:
            utilization = 999.0 if current_flow_m3_s > 0 else 0.0
            return (utilization, "BLOCKED_SURCHARGED", True)

        utilization = (current_flow_m3_s / effective_capacity_m3_s) * 100.0
        
        if utilization >= 100.0:
            status = "SURCHARGED"
            is_overloaded = True
        elif utilization >= 85.0:
            status = "CRITICAL_CAPACITY"
            is_overloaded = False
        elif utilization >= 60.0:
            status = "HIGH_FLOW"
            is_overloaded = False
        elif blockage_pct >= 50.0:
            status = "DEGRADED_CAPACITY"
            is_overloaded = False
        else:
            status = "NORMAL"
            is_overloaded = False

        return (round(utilization, 1), status, is_overloaded)
