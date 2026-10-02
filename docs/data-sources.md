# Data Sources & Operational Integration Guide

**Project**: Urban Flood Nowcasting System (Drainage and Rainfall Coupling)  
**Problem Statement**: SIH 26085  
**Department**: NCMRWF / Ministry of Earth Sciences (MoES)  

---

## 1. Prototype Demonstration Datasets

| Dataset | Current Prototype Implementation | Operational Data Source for Deployment |
|---|---|---|
| **Rainfall Nowcast** | Simulated moving convective storm cell with 0–3h temporal hyetograph curve (15 to 135 mm/h peak). | **IMD/NCMRWF Doppler Weather Radar (DWR)** (S-band/C-band NetCDF4/HDF5 radar reflectivity feeds at 10-min scan cycles, e.g., DWR Bengaluru/Mumbai/Delhi). |
| **Digital Elevation Model (DEM)** | 20x20 grid with regional hydraulic gradient, micro-canyons, and depression pockets. | **ISRO Bhuvan CartoDEM (10m)** or **ALOS PALSAR (12.5m)** or high-resolution municipal drone LiDAR point clouds. |
| **Stormwater Drainage Network** | 16 Manholes/Inlets, 18 Conduits with Manning roughness $n=0.013$ and culvert dimensions. | **Municipal Corporation GIS Shapefiles** (BBMP / MCGM / NDMC Stormwater Drain GIS layers with invert levels, pipe diameters, and outfall coordinates). |
| **Land-Use / Imperviousness** | Categorized into Road, Commercial Concrete, Building, Residential, Vegetation with runoff coefficients. | **Bhuvan LULC (Land Use / Land Cover) 1:10,000 scale** or Sentinel-2 10m NDVI / Impervious Surface Index. |
| **Road Network** | 13 Interconnected road segments with road classifications, elevation mappings, and speed limits. | **OpenStreetMap (OSM)** street centerline extracts via `osmnx` or National Highways Authority of India (NHAI) GIS. |
| **Model Validation** | Synthetic hydrodynamic benchmark with RMSE, MAE, R², F1, and IoU. | **Central Pollution Control Board (CPCB) / Municipal Telemetric Flood Gauge Sensors** installed at critical underpasses. |

---

## 2. Replacing Demonstration Providers with Operational Adapters

The system is engineered around abstract provider interfaces located in `backend/app/data/providers.py`.

### 2.1 Integrating Live Doppler Radar (DWR)
Create a new class implementing `BaseRainfallProvider`:

```python
import xarray as xr
from app.data.providers import BaseRainfallProvider

class IMDDopplerRadarProvider(BaseRainfallProvider):
    def __init__(self, radar_feed_url: str):
        self.radar_url = radar_feed_url

    def get_nowcast(self, timestamp_min: int, grid_rows: int, grid_cols: int, bbox: dict):
        # 1. Fetch latest DWR NetCDF scan from NCMRWF repository
        ds = xr.open_dataset(f"{self.radar_url}/latest_{timestamp_min}.nc")
        # 2. Extract reflectivity Z and apply Marshall-Palmer relation: Z = 200 * R^1.6
        reflectivity = ds['DBZ'].values
        rain_rate_mm_hr = (10 ** (reflectivity / 10.0) / 200.0) ** (1.0 / 1.6)
        # 3. Clip to catchment bounding box
        return self._resample_to_grid(rain_rate_mm_hr, grid_rows, grid_cols, bbox)
```

### 2.2 Integrating Official CartoDEM GeoTIFF
```python
import rasterio
from rasterio.windows import from_bounds
from app.data.providers import BaseDEMProvider

class GeoTIFFDEMProvider(BaseDEMProvider):
    def __init__(self, tiff_path: str):
        self.tiff_path = tiff_path

    def get_elevation_grid(self, rows: int, cols: int, bbox: dict):
        with rasterio.open(self.tiff_path) as src:
            window = from_bounds(bbox["lon_min"], bbox["lat_min"], bbox["lon_max"], bbox["lat_max"], src.transform)
            data = src.read(1, window=window, out_shape=(rows, cols))
            return data.astype(float)
```

### 2.3 Integrating PostGIS Municipal Drainage Database
To load live municipal stormwater layers, replace the NetworkX builder in `UrbanFloodEngine._setup_study_area()` with a query to the municipal PostGIS database:

```sql
SELECT pipe_id, name, ST_AsGeoJSON(geom), diameter_m, slope, roughness_n, current_blockage_pct
FROM municipal_stormwater_conduits;
```
