# Mathematical & Hydraulic Model Documentation

**Project**: Urban Flood Nowcasting System (Drainage and Rainfall Coupling)  
**Problem Statement**: SIH 26085  
**Stakeholder**: Ministry of Earth Sciences (MoES) / NCMRWF  

---

## 1. Rainfall Processing & Nowcasting Dynamics

### 1.1 Spatial Storm Tracking
Radar nowcast precipitation intensity $I(x, y, t)$ (in $\text{mm/hr}$) is modeled using a 2D Gaussian convective cell moving across the urban catchment:

$$I(r, c, t) = I_{\text{base}}(t) \cdot \left[ 0.40 + 0.60 \cdot \exp\left( -0.5 \left( \frac{(r - r_0(t))^2}{\sigma_r^2} + \frac{(c - c_0(t))^2}{\sigma_c^2} \right) \right) \right]$$

Where:
- $r_0(t), c_0(t)$: Storm centroid tracking along prevailing monsoon wind vectors over the 0–3 hour forecast window.
- $I_{\text{base}}(t)$: Temporal hyetograph scaling factor with convective intensification up to $t = 60\text{--}75$ minutes followed by dissipation.
- $\sigma_r, \sigma_c$: Spatial storm cell dispersion radii.

---

## 2. Rainfall-to-Runoff Partitioning (Rational & Imperviousness Formulation)

### 2.1 Hydrologic Conversion
For each surface cell $(r, c)$ with land-use type $L$:

$$\Delta h_{\text{runoff}}(r, c) = C_L \cdot \frac{I(r, c, t)}{3\,600\,000} \cdot \Delta t$$

Where:
- $I(r, c, t)$ is rainfall intensity in $\text{mm/hr}$.
- $3\,600\,000$ converts $\text{mm/hr}$ to meters per second ($\text{m/s}$).
- $\Delta t$ is the simulation timestep in seconds ($900\text{ s}$ for 15-min increments).
- $C_L$ is the dimensionless urban runoff coefficient:
  - Asphalt / Concrete Roadways: $C = 0.88$
  - Commercial plazas / Paved concrete: $C = 0.90$
  - Buildings & Rooftops: $C = 0.95$
  - High-density Residential: $C = 0.70$
  - Open Ground / Bare Earth: $C = 0.35$
  - Urban Parks & Vegetation: $C = 0.20$

Runoff volume added:

$$\Delta V_{\text{in}} = \Delta h_{\text{runoff}} \cdot A_{\text{cell}}$$

---

## 3. Underground Drainage Hydraulics (Manning's Equation)

### 3.1 Closed Conduit Gravity Discharge
Full-pipe gravitational conveyance capacity $Q_{\text{full}}$ ($\text{m}^3/\text{s}$) prior to pressure surcharge is calculated using Manning's Equation:

$$Q_{\text{full}} = \frac{1}{n} \cdot A \cdot R^{2/3} \cdot S^{1/2}$$

For circular conduits of internal diameter $D$ (m):
- Cross-sectional flow area: $A = \frac{\pi D^2}{4}$
- Wetted perimeter: $P = \pi D$
- Hydraulic radius: $R = \frac{A}{P} = \frac{D}{4}$
- Bed slope: $S = \frac{\Delta z_{\text{invert}}}{L}$
- Roughness coefficient: $n = 0.013$ (smooth pre-cast concrete stormwater sewer).

For rectangular box drains ($W \times H$):
- $A = W \cdot H$
- $P = 2(W + H)$
- $R = \frac{W \cdot H}{2(W + H)}$

---

## 4. Solid Waste Siltation & Conduit Blockage Model

When urban debris, solid waste, or construction silt restricts the conduit cross-section by blockage fraction $B \in [0, 100\%]$:

$$Q_{\text{effective}} = Q_{\text{full}} \cdot \left(1 - \frac{B}{100}\right)^{1.5}$$

*Note*: The $1.5$ exponent accounts for simultaneous reduction in effective cross-sectional flow area $A$ and adverse reduction in hydraulic radius $R$ due to increased boundary shear perimeter.

Pipe utilization:

$$\text{Utilization} (\%) = \left(\frac{Q_{\text{actual}}}{Q_{\text{effective}}}\right) \cdot 100$$

---

## 5. Two-Way Surface-Drainage Coupling & Node Surcharge

### 5.1 Surface Water Intake (Surface $\to$ Drain)
Overland water enters stormwater curb inlets and drop manholes via Poleni weir flow switching to submerged orifice flow:

$$Q_{\text{inlet}} = \begin{cases} 
C_w \cdot L_{\text{curb}} \cdot h^{1.5} & \text{if } h < h_{\text{opening}} \quad (C_w \approx 1.66) \\
C_d \cdot A_{\text{opening}} \sqrt{2g(h - h_0)} & \text{if } h \ge h_{\text{opening}} \quad (C_d \approx 0.60)
\end{cases}$$

Volume captured in timestep $\Delta t$:

$$V_{\text{captured}} = \min(V_{\text{surface}}, Q_{\text{inlet}} \cdot \Delta t)$$

### 5.2 Network Routing & Backwater Surcharge (Drain $\to$ Surface)
If total inflow into node $u$ exceeds the aggregate downstream effective capacity $\sum Q_{\text{out, eff}}$ (due to undersized pipes or high debris blockage):

$$Q_{\text{excess}} = \max\left(0, \frac{V_{\text{inflow}}}{\Delta t} - \sum Q_{\text{out, eff}}\right)$$

$$V_{\text{surcharged}} = Q_{\text{excess}} \cdot \Delta t$$

The surcharged volume returns through the manhole onto the overland surface cell:

$$\Delta h_{\text{surcharge}} = \frac{V_{\text{surcharged}}}{A_{\text{cell}}}$$

This accurately captures urban manhole cover geysering during severe monsoon downpours.

---

## 6. 2D Hydrodynamic Surface Flow (Diffusive Wave Formulation)

Total hydraulic head at cell $i$:

$$H_i = z_i + h_i$$

Where $z_i$ is ground elevation (m) from the Digital Elevation Model (DEM), and $h_i$ is surface water depth (m).

Flow rate $q_{ij}$ between neighboring cells $i$ and $j$ separated by grid spacing $\Delta x$:

$$q_{ij} = \frac{w}{n_{\text{surface}}} \cdot \bar{h}^{5/3} \cdot \sqrt{\max\left(0, \frac{H_i - H_j}{\Delta x}\right)}$$

### 6.1 Numerical Stability & Mass Conservation
To ensure numerical stability and prevent negative depths, an adaptive Courant-Friedrichs-Lewy (CFL) flux limiter is applied across sub-steps:

$$\sum_{j} q_{ij} \cdot \Delta t_{\text{sub}} \le 0.40 \cdot h_i \cdot A_{\text{cell}}$$

$$h_i(t + \Delta t) \ge 0 \quad \forall i$$

$$\sum \text{Rain} - \sum \text{Drain Infiltration} + \sum \text{Surcharge} = \Delta \text{Surface Volume}$$

---

## 7. Dynamic Hydrodynamic Route Optimization

Standard Dijkstra routing optimizes for base travel time $T_{\text{base}} = \frac{L}{v_{\text{speed}}}$.

Under dynamic inundation, edge cost $C_{\text{flood}}$ is penalized according to predicted water depth $h_{\text{road}}$:

$$C_{\text{flood}} = \begin{cases} 
T_{\text{base}} \cdot \left[1 + 10 \cdot \left(\frac{h_{\text{road}}}{h_{\text{crit}}}\right)^{2.5}\right] & \text{if } h_{\text{road}} < h_{\text{crit}} \\
\infty \quad (\text{Strictly Impassable}) & \text{if } h_{\text{road}} \ge h_{\text{crit}}
\end{cases}$$

Where $h_{\text{crit}}$ depends on vehicle clearance:
- Emergency Rescue Trucks: $h_{\text{crit}} = 35\text{ cm}$
- Commuter Sedans: $h_{\text{crit}} = 15\text{ cm}$
- Two-Wheelers: $h_{\text{crit}} = 10\text{ cm}$
- Pedestrian Evacuation: $h_{\text{crit}} = 8\text{ cm}$
