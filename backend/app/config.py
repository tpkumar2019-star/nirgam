# Urban Flood Nowcasting System (Drainage and Rainfall Coupling)
# Problem Statement 26085 - Ministry of Earth Sciences (MoES) / NCMRWF

import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Urban Flood Nowcasting System"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"
    ENVIRONMENT: str = "demonstration"  # "demonstration" or "operational"
    
    # Simulation defaults
    DEFAULT_TIME_STEP_MINUTES: int = 15
    FORECAST_HORIZON_MINUTES: int = 180
    GRID_ROWS: int = 20
    GRID_COLS: int = 20
    CELL_SIZE_METERS: float = 50.0  # 50m x 50m cells
    
    # Study area bounding box (Bengaluru Central Basin sample)
    BBOX_LAT_MIN: float = 12.9250
    BBOX_LAT_MAX: float = 12.9450
    BBOX_LON_MIN: float = 77.5850
    BBOX_LON_MAX: float = 77.6100
    
    # Safety thresholds (cm)
    DEPTH_THRESHOLD_LOW: float = 5.0
    DEPTH_THRESHOLD_MODERATE: float = 15.0
    DEPTH_THRESHOLD_HIGH: float = 30.0
    DEPTH_THRESHOLD_SEVERE: float = 50.0

    class Config:
        case_sensitive = True

settings = Settings()
