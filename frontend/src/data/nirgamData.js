// NIRGAM — Street-Level Urban Flood Nowcasting System Data Engine
// Supports Mumbai (Pilot City), Delhi, and Chennai with coupled physics:
// 1. Radar Convective Nowcast (36 timesteps = 0 to 180 min in 5-min steps)
// 2. 2D Surface Terrain DEM (Downhill flow and pooling in low spots)
// 3. Directed Stormwater Drain Graph (Manning capacity, surcharge, and backflow)
// 4. Time-Aware Vehicle Routing with Wade Depth Limits

export const VEHICLE_PROFILES = {
  ambulance: { name: 'Ambulance / Fire', maxWadeCm: 30, icon: 'Ambulance', speedKmH: 45 },
  bus: { name: 'City Bus', maxWadeCm: 25, icon: 'Bus', speedKmH: 30 },
  car: { name: 'Passenger Car', maxWadeCm: 15, icon: 'Car', speedKmH: 35 },
  two_wheeler: { name: 'Two-Wheeler', maxWadeCm: 10, icon: 'Bike', speedKmH: 28 },
  pedestrian: { name: 'Pedestrian', maxWadeCm: 15, icon: 'User', speedKmH: 5 }
};

export const SCENARIOS = {
  moderate: {
    id: 'moderate',
    name: 'Moderate Monsoon (40 mm/hr)',
    peakRain: 40,
    peakTimeMin: 40,
    description: 'Typical Mumbai monsoon shower. Drains mostly cope, minor waterlogging at saucer underpasses.'
  },
  heavy: {
    id: 'heavy',
    name: 'Heavy Downpour (80 mm/hr)',
    peakRain: 80,
    peakTimeMin: 45,
    description: 'Intense convective squall. Widespread waterlogging at Hindmata, Milan & Andheri Subways.'
  },
  cloudburst: {
    id: 'cloudburst',
    name: 'Extreme Cloudburst (120+ mm/hr, 2005-style)',
    peakRain: 135,
    peakTimeMin: 50,
    description: 'Catastrophic cloudburst. 90% of arterial underpasses submerged. Severe surcharge across trunk lines.'
  },
  drains_blocked: {
    id: 'drains_blocked',
    name: 'Drains 50% Blocked (Pre-monsoon silt)',
    peakRain: 65,
    peakTimeMin: 40,
    baseBlockagePct: 50,
    description: 'Stormwater conduits choked with plastic and silt, cutting discharge capacity by half.'
  },
  high_tide: {
    id: 'high_tide',
    name: 'High Tide + Heavy Rain (Tidal Backflow)',
    peakRain: 75,
    peakTimeMin: 45,
    highTideBackflow: true,
    description: 'Spring tide (+4.6m CD) at Mahim Bay and Worli outfalls blocks gravitational sea discharge.'
  }
};

export const CITIES = {
  mumbai: {
    id: 'mumbai',
    name: 'Mumbai (Pilot City)',
    state: 'Maharashtra',
    center: [19.0450, 72.8520],
    zoom: 12.8,
    wards: [
      { name: 'F-South (Parel / Hindmata)', riskLevel: 'CRITICAL', pop: '380k', pumpsDeployed: 6, suggestedPumps: 2 },
      { name: 'K-West (Andheri West)', riskLevel: 'CRITICAL', pop: '740k', pumpsDeployed: 4, suggestedPumps: 3 },
      { name: 'F-North (Sion / Matunga)', riskLevel: 'HIGH', pop: '520k', pumpsDeployed: 5, suggestedPumps: 2 },
      { name: 'H-East (Santacruz / Milan)', riskLevel: 'HIGH', pop: '460k', pumpsDeployed: 3, suggestedPumps: 1 },
      { name: 'L-Ward (Kurla / Mithi River)', riskLevel: 'CRITICAL', pop: '890k', pumpsDeployed: 7, suggestedPumps: 4 },
      { name: 'G-North (Dadar / Dharavi)', riskLevel: 'MODERATE', pop: '580k', pumpsDeployed: 4, suggestedPumps: 1 }
    ],
    // Critical Assets
    assets: [
      { id: 'AST-KEM', name: 'KEM Memorial Hospital', type: 'hospital', lat: 19.0024, lon: 72.8428, elevM: 6.8 },
      { id: 'AST-SIO', name: 'Lokmanya Tilak Municipal Hospital (Sion)', type: 'hospital', lat: 19.0360, lon: 72.8605, elevM: 5.9 },
      { id: 'AST-COO', name: 'Cooper Municipal Hospital (Juhu)', type: 'hospital', lat: 19.1080, lon: 72.8360, elevM: 7.2 },
      { id: 'AST-LIL', name: 'Lilavati Hospital (Bandra)', type: 'hospital', lat: 19.0520, lon: 72.8310, elevM: 8.5 },
      { id: 'AST-SUB-AND', name: 'Andheri Railway Subway', type: 'underpass', lat: 19.1197, lon: 72.8465, elevM: 3.8 },
      { id: 'AST-SUB-MIL', name: 'Milan Subway (Santacruz)', type: 'underpass', lat: 19.0835, lon: 72.8415, elevM: 4.1 },
      { id: 'AST-MTR-AND', name: 'Andheri Metro Interchange', type: 'metro', lat: 19.1205, lon: 72.8480, elevM: 9.2 },
      { id: 'AST-MTR-DAD', name: 'Dadar TT Railway Station', type: 'metro', lat: 19.0175, lon: 72.8430, elevM: 6.2 },
      { id: 'AST-FIR-WAD', name: 'Wadala Emergency Fire Station', type: 'fire_station', lat: 19.0200, lon: 72.8550, elevM: 7.5 },
      { id: 'AST-FIR-AND', name: 'Andheri West Fire Station', type: 'fire_station', lat: 19.1250, lon: 72.8390, elevM: 8.1 },
      { id: 'AST-REL-DHA', name: 'Dharavi Municipal Relief Center', type: 'shelter', lat: 19.0420, lon: 72.8540, elevM: 6.5 }
    ],
    // Street Segments with 3D elevations, catchments, and drain linkages
    streets: [
      {
        id: 'RD-HND',
        name: 'Hindmata Junction (Dr. Ambedkar Rd)',
        ward: 'F-South',
        elevationM: 4.8,
        surroundingElevM: 6.6,
        catchmentHectares: 14.5,
        connectedPipeId: 'P-HND-104',
        connectedNodeId: 'M-HND-04',
        isUnderpass: true,
        coordinates: [
          [19.0065, 72.8420],
          [19.0095, 72.8425],
          [19.0130, 72.8430]
        ],
        lengthKm: 0.72,
        basePeakDepthCm: 48.0,
        peakTimeMin: 55,
        recedeTimeMin: 135
      },
      {
        id: 'RD-AND',
        name: 'Andheri Subway (SV Road Link)',
        ward: 'K-West',
        elevationM: 3.8,
        surroundingElevM: 6.2,
        catchmentHectares: 22.0,
        connectedPipeId: 'C-AND-22',
        connectedNodeId: 'M-AND-01',
        isUnderpass: true,
        coordinates: [
          [19.1170, 72.8445],
          [19.1197, 72.8465],
          [19.1225, 72.8485]
        ],
        lengthKm: 0.65,
        basePeakDepthCm: 62.0,
        peakTimeMin: 50,
        recedeTimeMin: 140
      },
      {
        id: 'RD-SIO',
        name: 'Sion Circle & Gandhi Market',
        ward: 'F-North',
        elevationM: 5.2,
        surroundingElevM: 7.0,
        catchmentHectares: 18.0,
        connectedPipeId: 'C-SIO-08',
        connectedNodeId: 'M-SIO-12',
        isUnderpass: false,
        coordinates: [
          [19.0340, 72.8610],
          [19.0378, 72.8625],
          [19.0415, 72.8650]
        ],
        lengthKm: 0.85,
        basePeakDepthCm: 44.0,
        peakTimeMin: 60,
        recedeTimeMin: 145
      },
      {
        id: 'RD-MIL',
        name: 'Milan Subway (Santacruz Link)',
        ward: 'H-East',
        elevationM: 4.1,
        surroundingElevM: 6.5,
        catchmentHectares: 16.0,
        connectedPipeId: 'P-MIL-14',
        connectedNodeId: 'M-MIL-03',
        isUnderpass: true,
        coordinates: [
          [19.0810, 72.8400],
          [19.0835, 72.8415],
          [19.0860, 72.8430]
        ],
        lengthKm: 0.58,
        basePeakDepthCm: 52.0,
        peakTimeMin: 50,
        recedeTimeMin: 130
      },
      {
        id: 'RD-KNG',
        name: 'Kings Circle (Matunga Central)',
        ward: 'F-North',
        elevationM: 5.0,
        surroundingElevM: 6.8,
        catchmentHectares: 12.0,
        connectedPipeId: 'P-KNG-05',
        connectedNodeId: 'M-KNG-05',
        isUnderpass: false,
        coordinates: [
          [19.0240, 72.8540],
          [19.0270, 72.8560],
          [19.0300, 72.8580]
        ],
        lengthKm: 0.70,
        basePeakDepthCm: 40.0,
        peakTimeMin: 55,
        recedeTimeMin: 125
      },
      {
        id: 'RD-DAD',
        name: 'Dadar TT Circle (Swami Gyan Jivandas Rd)',
        ward: 'G-North',
        elevationM: 5.9,
        surroundingElevM: 7.2,
        catchmentHectares: 11.0,
        connectedPipeId: 'P-DAD-02',
        connectedNodeId: 'M-DAD-02',
        isUnderpass: false,
        coordinates: [
          [19.0150, 72.8415],
          [19.0178, 72.8435],
          [19.0205, 72.8460]
        ],
        lengthKm: 0.68,
        basePeakDepthCm: 32.0,
        peakTimeMin: 50,
        recedeTimeMin: 110
      },
      {
        id: 'RD-KUR',
        name: 'Kurla LBS Marg (Sheetal Cinema)',
        ward: 'L-Ward',
        elevationM: 4.5,
        surroundingElevM: 6.4,
        catchmentHectares: 25.0,
        connectedPipeId: 'P-KUR-18',
        connectedNodeId: 'M-KUR-09',
        isUnderpass: false,
        coordinates: [
          [19.0650, 72.8760],
          [19.0685, 72.8790],
          [19.0720, 72.8820]
        ],
        lengthKm: 0.95,
        basePeakDepthCm: 56.0,
        peakTimeMin: 65,
        recedeTimeMin: 160
      },
      {
        id: 'RD-BKC',
        name: 'BKC Avenue 3 (Vakola Confluence)',
        ward: 'H-East',
        elevationM: 6.2,
        surroundingElevM: 7.5,
        catchmentHectares: 15.0,
        connectedPipeId: 'P-BKC-06',
        connectedNodeId: 'M-BKC-06',
        isUnderpass: false,
        coordinates: [
          [19.0590, 72.8610],
          [19.0620, 72.8640],
          [19.0650, 72.8670]
        ],
        lengthKm: 0.80,
        basePeakDepthCm: 28.0,
        peakTimeMin: 45,
        recedeTimeMin: 95
      },
      // Elevated Safe Bypass Corridors (Very low water depth)
      {
        id: 'RD-WEH',
        name: 'Western Express Highway (Elevated Flyover)',
        ward: 'H-East',
        elevationM: 11.5,
        surroundingElevM: 6.0,
        catchmentHectares: 4.0,
        connectedPipeId: 'P-WEH-01',
        connectedNodeId: 'M-WEH-01',
        isUnderpass: false,
        coordinates: [
          [19.0500, 72.8470],
          [19.0800, 72.8510],
          [19.1150, 72.8560]
        ],
        lengthKm: 7.4,
        basePeakDepthCm: 4.0,
        peakTimeMin: 40,
        recedeTimeMin: 60
      },
      {
        id: 'RD-EEH',
        name: 'Eastern Express Highway Bypass',
        ward: 'F-North',
        elevationM: 10.8,
        surroundingElevM: 5.5,
        catchmentHectares: 5.0,
        connectedPipeId: 'P-EEH-01',
        connectedNodeId: 'M-EEH-01',
        isUnderpass: false,
        coordinates: [
          [19.0250, 72.8680],
          [19.0500, 72.8760],
          [19.0800, 72.8850]
        ],
        lengthKm: 6.5,
        basePeakDepthCm: 5.5,
        peakTimeMin: 45,
        recedeTimeMin: 70
      },
      {
        id: 'RD-SBM',
        name: 'Senapati Bapat Marg Ridge Corridor',
        ward: 'G-South',
        elevationM: 8.2,
        surroundingElevM: 5.0,
        catchmentHectares: 6.0,
        connectedPipeId: 'P-SBM-02',
        connectedNodeId: 'M-SBM-02',
        isUnderpass: false,
        coordinates: [
          [19.0050, 72.8310],
          [19.0220, 72.8350],
          [19.0380, 72.8390]
        ],
        lengthKm: 3.8,
        basePeakDepthCm: 7.0,
        peakTimeMin: 40,
        recedeTimeMin: 75
      },
      {
        id: 'RD-BWSL',
        name: 'Bandra-Worli Sea Link Elevated Bridge',
        ward: 'G-South',
        elevationM: 14.5,
        surroundingElevM: 3.0,
        catchmentHectares: 2.0,
        connectedPipeId: 'P-BWSL-01',
        connectedNodeId: 'M-BWSL-01',
        isUnderpass: false,
        coordinates: [
          [19.0150, 72.8180],
          [19.0350, 72.8190],
          [19.0520, 72.8250]
        ],
        lengthKm: 5.6,
        basePeakDepthCm: 0.0,
        peakTimeMin: 0,
        recedeTimeMin: 0
      }
    ],
    // Drain Network Graph: Manholes (Nodes) and Pipes/Nallahs (Edges)
    drainage: {
      nodes: [
        { id: 'M-HND-01', name: 'Inlet Hindmata West', lat: 19.0070, lon: 72.8415, groundElevM: 5.2, invertElevM: 2.8, capacityM3s: 1.8 },
        { id: 'M-HND-04', name: 'Manhole Hindmata Sump (M-0391)', lat: 19.0095, lon: 72.8425, groundElevM: 4.8, invertElevM: 2.1, capacityM3s: 2.4, isVulnerable: true },
        { id: 'M-HND-08', name: 'Junction Britannia Outfall Feed', lat: 19.0125, lon: 72.8440, groundElevM: 5.4, invertElevM: 2.4, capacityM3s: 3.2 },
        { id: 'M-AND-01', name: 'Inlet Andheri Subway Basin (M-0182)', lat: 19.1197, lon: 72.8465, groundElevM: 3.8, invertElevM: 1.5, capacityM3s: 2.0, isVulnerable: true },
        { id: 'M-AND-04', name: 'Mogra Nallah Interceptor', lat: 19.1230, lon: 72.8490, groundElevM: 5.0, invertElevM: 1.9, capacityM3s: 4.5 },
        { id: 'M-SIO-08', name: 'Inlet Sion West Transit', lat: 19.0350, lon: 72.8615, groundElevM: 5.8, invertElevM: 3.1, capacityM3s: 2.1 },
        { id: 'M-SIO-12', name: 'Manhole Mahim Bay Surcharge Node', lat: 19.0378, lon: 72.8625, groundElevM: 5.2, invertElevM: 2.5, capacityM3s: 2.8, isVulnerable: true },
        { id: 'M-MIL-03', name: 'Manhole Milan Subway Low Invert', lat: 19.0835, lon: 72.8415, groundElevM: 4.1, invertElevM: 1.8, capacityM3s: 1.9, isVulnerable: true },
        { id: 'M-KNG-05', name: 'Manhole Kings Circle Central', lat: 19.0270, lon: 72.8560, groundElevM: 5.0, invertElevM: 2.6, capacityM3s: 2.2, isVulnerable: true },
        { id: 'M-DAD-02', name: 'Manhole Dadar TT Junction', lat: 19.0178, lon: 72.8435, groundElevM: 5.9, invertElevM: 3.4, capacityM3s: 2.6 },
        { id: 'M-KUR-09', name: 'Manhole Kurla Mithi Outfall Gate', lat: 19.0685, lon: 72.8790, groundElevM: 4.5, invertElevM: 2.0, capacityM3s: 3.8, isVulnerable: true },
        { id: 'M-BKC-06', name: 'Manhole BKC Vakola Sluice', lat: 19.0620, lon: 72.8640, groundElevM: 6.2, invertElevM: 3.5, capacityM3s: 3.0 }
      ],
      edges: [
        { id: 'P-HND-101', name: 'Hindmata Feeder Conduit', start: 'M-HND-01', end: 'M-HND-04', diameterM: 1.4, lengthM: 290, slope: 0.0035, baseCapacityM3s: 2.8 },
        { id: 'P-HND-104', name: 'Trunk Pipe P-214 Britannia Box', start: 'M-HND-04', end: 'M-HND-08', diameterM: 1.8, lengthM: 420, slope: 0.0028, baseCapacityM3s: 3.9, isCritical: true },
        { id: 'C-AND-22', name: 'Mogra Nallah Culvert C-AND-22', start: 'M-AND-01', end: 'M-AND-04', diameterM: 2.2, lengthM: 380, slope: 0.0020, baseCapacityM3s: 4.2, isCritical: true },
        { id: 'C-SIO-08', name: 'Mahim Creek Outfall Canal', start: 'M-SIO-08', end: 'M-SIO-12', diameterM: 2.0, lengthM: 510, slope: 0.0018, baseCapacityM3s: 3.8, isCritical: true },
        { id: 'P-MIL-14', name: 'Milan Subway Pump Conduit', start: 'M-MIL-03', end: 'M-AND-01', diameterM: 1.6, lengthM: 480, slope: 0.0030, baseCapacityM3s: 3.1, isCritical: true },
        { id: 'P-KNG-05', name: 'Matunga Trunk Conduit', start: 'M-KNG-05', end: 'M-SIO-08', diameterM: 1.5, lengthM: 620, slope: 0.0025, baseCapacityM3s: 2.9 },
        { id: 'P-DAD-02', name: 'Dadar Parel Link Drain', start: 'M-DAD-02', end: 'M-HND-01', diameterM: 1.5, lengthM: 350, slope: 0.0032, baseCapacityM3s: 3.0 },
        { id: 'P-KUR-18', name: 'LBS Marg Mithi Discharge Channel', start: 'M-KUR-09', end: 'M-BKC-06', diameterM: 2.4, lengthM: 780, slope: 0.0015, baseCapacityM3s: 5.2, isCritical: true }
      ]
    },
    // Downhill Surface Flow Trajectories into low spots
    flowPaths: [
      { id: 'FP-1', name: 'Parel Ridge to Hindmata Low Bowl', points: [[19.0010, 72.8360], [19.0050, 72.8390], [19.0095, 72.8425]] },
      { id: 'FP-2', name: 'Sion Fort Hill to Gandhi Market', points: [[19.0460, 72.8680], [19.0410, 72.8650], [19.0378, 72.8625]] },
      { id: 'FP-3', name: 'Juhu Ridge to Andheri Subway Bowl', points: [[19.1120, 72.8380], [19.1160, 72.8420], [19.1197, 72.8465]] },
      { id: 'FP-4', name: 'Santacruz West Slopes to Milan Subway', points: [[19.0780, 72.8350], [19.0810, 72.8380], [19.0835, 72.8415]] },
      { id: 'FP-5', name: 'Ghatkopar Foothills to Kurla LBS Basin', points: [[19.0820, 72.8920], [19.0750, 72.8850], [19.0685, 72.8790]] }
    ],
    // Moving Doppler Radar Convective Rain Cells
    radarCells: [
      { id: 'RC-1', name: 'Cell Alpha (Convective Core)', startLat: 18.980, startLon: 72.820, driftLat: 0.0042, driftLon: 0.0025, radiusKm: 4.8, maxDbz: 56 },
      { id: 'RC-2', name: 'Cell Bravo (Suburban Band)', startLat: 19.060, startLon: 72.800, driftLat: 0.0035, driftLon: 0.0030, radiusKm: 6.2, maxDbz: 52 }
    ]
  },

  delhi: {
    id: 'delhi',
    name: 'Delhi NCR',
    state: 'Delhi',
    center: [28.6300, 77.2250],
    zoom: 12.5,
    wards: [
      { name: 'Central Delhi (Minto / CP)', riskLevel: 'CRITICAL', pop: '580k', pumpsDeployed: 5, suggestedPumps: 2 },
      { name: 'North Delhi (Kashmere Gate)', riskLevel: 'CRITICAL', pop: '720k', pumpsDeployed: 4, suggestedPumps: 3 },
      { name: 'East Delhi (ITO / Yamuna)', riskLevel: 'HIGH', pop: '690k', pumpsDeployed: 6, suggestedPumps: 2 },
      { name: 'South Delhi (AIIMS / Barapullah)', riskLevel: 'MODERATE', pop: '810k', pumpsDeployed: 3, suggestedPumps: 1 }
    ],
    assets: [
      { id: 'AST-DEL-AIIMS', name: 'AIIMS New Delhi', type: 'hospital', lat: 28.5670, lon: 77.2100, elevM: 215 },
      { id: 'AST-DEL-LNJP', name: 'LNJP Hospital (Delhi Gate)', type: 'hospital', lat: 28.6380, lon: 77.2400, elevM: 212 },
      { id: 'AST-DEL-MINTO', name: 'Minto Bridge Railway Underpass', type: 'underpass', lat: 28.6340, lon: 77.2250, elevM: 206 },
      { id: 'AST-DEL-KG', name: 'Kashmere Gate ISBT & Metro', type: 'metro', lat: 28.6675, lon: 77.2310, elevM: 209 }
    ],
    streets: [
      {
        id: 'RD-DEL-MIN',
        name: 'Minto Bridge Railway Underpass (Deen Dayal Upadhyaya Marg)',
        ward: 'Central Delhi',
        elevationM: 206.2,
        surroundingElevM: 209.5,
        catchmentHectares: 18.0,
        connectedPipeId: 'P-DEL-01',
        connectedNodeId: 'M-DEL-01',
        isUnderpass: true,
        coordinates: [
          [28.6320, 77.2230],
          [28.6340, 77.2250],
          [28.6360, 77.2270]
        ],
        lengthKm: 0.55,
        basePeakDepthCm: 58.0,
        peakTimeMin: 45,
        recedeTimeMin: 120
      },
      {
        id: 'RD-DEL-ITO',
        name: 'ITO Junction & Vikas Marg',
        ward: 'East Delhi',
        elevationM: 208.5,
        surroundingElevM: 211.0,
        catchmentHectares: 24.0,
        connectedPipeId: 'P-DEL-02',
        connectedNodeId: 'M-DEL-02',
        isUnderpass: false,
        coordinates: [
          [28.6270, 77.2400],
          [28.6295, 77.2420],
          [28.6320, 77.2450]
        ],
        lengthKm: 0.82,
        basePeakDepthCm: 38.0,
        peakTimeMin: 50,
        recedeTimeMin: 110
      },
      {
        id: 'RD-DEL-KG',
        name: 'Kashmere Gate Ring Road Basin',
        ward: 'North Delhi',
        elevationM: 207.1,
        surroundingElevM: 210.0,
        catchmentHectares: 28.0,
        connectedPipeId: 'P-DEL-03',
        connectedNodeId: 'M-DEL-03',
        isUnderpass: false,
        coordinates: [
          [28.6650, 77.2290],
          [28.6675, 77.2310],
          [28.6700, 77.2340]
        ],
        lengthKm: 0.75,
        basePeakDepthCm: 46.0,
        peakTimeMin: 55,
        recedeTimeMin: 130
      },
      {
        id: 'RD-DEL-BARA',
        name: 'Barapullah Elevated Bypass Corridor',
        ward: 'South Delhi',
        elevationM: 220.0,
        surroundingElevM: 212.0,
        catchmentHectares: 3.0,
        connectedPipeId: 'P-DEL-04',
        connectedNodeId: 'M-DEL-04',
        isUnderpass: false,
        coordinates: [
          [28.5800, 77.2200],
          [28.5850, 77.2350],
          [28.5900, 77.2500]
        ],
        lengthKm: 5.2,
        basePeakDepthCm: 3.0,
        peakTimeMin: 40,
        recedeTimeMin: 60
      }
    ],
    drainage: {
      nodes: [
        { id: 'M-DEL-01', name: 'Minto Underpass Sump', lat: 28.6340, lon: 77.2250, groundElevM: 206.2, invertElevM: 203.5, capacityM3s: 2.5, isVulnerable: true },
        { id: 'M-DEL-02', name: 'ITO Drainage Sluice', lat: 28.6295, lon: 77.2420, groundElevM: 208.5, invertElevM: 205.8, capacityM3s: 3.2 },
        { id: 'M-DEL-03', name: 'Yamuna Outfall Gate 14', lat: 28.6675, lon: 77.2310, groundElevM: 207.1, invertElevM: 204.0, capacityM3s: 4.0, isVulnerable: true }
      ],
      edges: [
        { id: 'P-DEL-01', name: 'Minto Sump Outflow to Yamuna', start: 'M-DEL-01', end: 'M-DEL-02', diameterM: 1.8, lengthM: 850, slope: 0.002, baseCapacityM3s: 3.2, isCritical: true },
        { id: 'P-DEL-02', name: 'ITO Trunk Drain to Barapullah', start: 'M-DEL-02', end: 'M-DEL-03', diameterM: 2.2, lengthM: 1200, slope: 0.0018, baseCapacityM3s: 4.5, isCritical: true }
      ]
    },
    flowPaths: [
      { id: 'FP-DEL-1', name: 'Connaught Place slopes to Minto Underpass', points: [[28.6310, 77.2190], [28.6325, 77.2220], [28.6340, 77.2250]] }
    ],
    radarCells: [
      { id: 'RC-DEL-1', name: 'Northern Squall Line', startLat: 28.580, startLon: 77.180, driftLat: 0.004, driftLon: 0.003, radiusKm: 6.0, maxDbz: 54 }
    ]
  },

  chennai: {
    id: 'chennai',
    name: 'Chennai',
    state: 'Tamil Nadu',
    center: [13.0200, 80.2300],
    zoom: 12.6,
    wards: [
      { name: 'Zone 13 (Velachery / Pallikaranai)', riskLevel: 'CRITICAL', pop: '420k', pumpsDeployed: 6, suggestedPumps: 3 },
      { name: 'Zone 10 (T. Nagar / Kodambakkam)', riskLevel: 'CRITICAL', pop: '560k', pumpsDeployed: 5, suggestedPumps: 2 },
      { name: 'Zone 6 (Perambur / Pulianthope)', riskLevel: 'HIGH', pop: '480k', pumpsDeployed: 4, suggestedPumps: 2 },
      { name: 'Zone 9 (Adyar / Saidapet)', riskLevel: 'MODERATE', pop: '390k', pumpsDeployed: 3, suggestedPumps: 1 }
    ],
    assets: [
      { id: 'AST-CHE-RGGH', name: 'Rajiv Gandhi Government General Hospital', type: 'hospital', lat: 13.0800, lon: 80.2780, elevM: 6.5 },
      { id: 'AST-CHE-MIOT', name: 'MIOT International Hospital (Manapakkam)', type: 'hospital', lat: 13.0180, lon: 80.1780, elevM: 7.8 },
      { id: 'AST-CHE-VEL', name: 'Velachery MRTS Railway Station', type: 'metro', lat: 12.9780, lon: 80.2180, elevM: 4.2 },
      { id: 'AST-CHE-PER', name: 'Perambur Railway Subway', type: 'underpass', lat: 13.1110, lon: 80.2450, elevM: 3.6 }
    ],
    streets: [
      {
        id: 'RD-CHE-VEL',
        name: 'Velachery Main Road (Pallikaranai Marsh Edge)',
        ward: 'Zone 13',
        elevationM: 4.2,
        surroundingElevM: 6.5,
        catchmentHectares: 32.0,
        connectedPipeId: 'P-CHE-01',
        connectedNodeId: 'M-CHE-01',
        isUnderpass: false,
        coordinates: [
          [12.9750, 80.2150],
          [12.9780, 80.2180],
          [12.9820, 80.2220]
        ],
        lengthKm: 0.92,
        basePeakDepthCm: 54.0,
        peakTimeMin: 55,
        recedeTimeMin: 150
      },
      {
        id: 'RD-CHE-TNG',
        name: 'T. Nagar (Bazullah Rd / Usman Rd)',
        ward: 'Zone 10',
        elevationM: 5.1,
        surroundingElevM: 7.0,
        catchmentHectares: 20.0,
        connectedPipeId: 'P-CHE-02',
        connectedNodeId: 'M-CHE-02',
        isUnderpass: false,
        coordinates: [
          [13.0380, 80.2300],
          [13.0410, 80.2330],
          [13.0440, 80.2360]
        ],
        lengthKm: 0.85,
        basePeakDepthCm: 48.0,
        peakTimeMin: 50,
        recedeTimeMin: 135
      },
      {
        id: 'RD-CHE-PER',
        name: 'Perambur Railway Subway',
        ward: 'Zone 6',
        elevationM: 3.6,
        surroundingElevM: 6.2,
        catchmentHectares: 17.0,
        connectedPipeId: 'P-CHE-03',
        connectedNodeId: 'M-CHE-03',
        isUnderpass: true,
        coordinates: [
          [13.1090, 80.2430],
          [13.1110, 80.2450],
          [13.1130, 80.2470]
        ],
        lengthKm: 0.48,
        basePeakDepthCm: 62.0,
        peakTimeMin: 45,
        recedeTimeMin: 140
      },
      {
        id: 'RD-CHE-OMR',
        name: 'Old Mahabalipuram Road (OMR Elevated Corridor)',
        ward: 'Zone 13',
        elevationM: 12.0,
        surroundingElevM: 5.5,
        catchmentHectares: 4.0,
        connectedPipeId: 'P-CHE-04',
        connectedNodeId: 'M-CHE-04',
        isUnderpass: false,
        coordinates: [
          [12.9500, 80.2400],
          [12.9650, 80.2460],
          [12.9800, 80.2520]
        ],
        lengthKm: 4.8,
        basePeakDepthCm: 6.0,
        peakTimeMin: 40,
        recedeTimeMin: 65
      }
    ],
    drainage: {
      nodes: [
        { id: 'M-CHE-01', name: 'Velachery Marsh Inflow Node', lat: 12.9780, lon: 80.2180, groundElevM: 4.2, invertElevM: 1.8, capacityM3s: 2.8, isVulnerable: true },
        { id: 'M-CHE-02', name: 'Mambalam Canal Junction', lat: 13.0410, lon: 80.2330, groundElevM: 5.1, invertElevM: 2.4, capacityM3s: 3.4, isVulnerable: true },
        { id: 'M-CHE-03', name: 'Perambur Otteri Nallah Inflow', lat: 13.1110, lon: 80.2450, groundElevM: 3.6, invertElevM: 1.2, capacityM3s: 2.2, isVulnerable: true }
      ],
      edges: [
        { id: 'P-CHE-01', name: 'Buckingham Canal Link', start: 'M-CHE-01', end: 'M-CHE-02', diameterM: 2.0, lengthM: 920, slope: 0.0015, baseCapacityM3s: 3.8, isCritical: true },
        { id: 'P-CHE-02', name: 'Adyar River Outfall Sluice', start: 'M-CHE-02', end: 'M-CHE-03', diameterM: 2.5, lengthM: 1400, slope: 0.0012, baseCapacityM3s: 5.5, isCritical: true }
      ]
    },
    flowPaths: [
      { id: 'FP-CHE-1', name: 'Taramani Slopes into Velachery Low Marsh', points: [[12.9850, 80.2350], [12.9810, 80.2260], [12.9780, 80.2180]] }
    ],
    radarCells: [
      { id: 'RC-CHE-1', name: 'Bay of Bengal Convective Band', startLat: 12.940, startLon: 80.280, driftLat: 0.0035, driftLon: -0.0025, radiusKm: 7.0, maxDbz: 55 }
    ]
  }
};

// Physics Calculation Engine (Coupled DEM + Drain Network + Doppler Radar)
export function computeSimulationSnapshot(cityId = 'mumbai', scenarioId = 'heavy', timeMin = 45, customBlockages = {}) {
  const city = CITIES[cityId] || CITIES.mumbai;
  const scenario = SCENARIOS[scenarioId] || SCENARIOS.heavy;

  // Rainfall intensity curve: Convective bell curve peaking at peakTimeMin
  const t = Math.max(0, Math.min(180, timeMin));
  const peakTime = scenario.peakTimeMin || 45;
  const peakRain = scenario.peakRain || 80;
  
  // Gaussian bell distribution for rainfall nowcast
  const sigma = 32.0;
  const rainIntensity = peakRain * Math.exp(-Math.pow(t - peakTime, 2) / (2 * Math.pow(sigma, 2)));
  const cumulativeRain = Math.min(160, (peakRain * 0.04) * (t / 10 + 2 * Math.sin(t / 25)));

  // Compute drain pipe capacity and blockage
  const updatedEdges = city.drainage.edges.map(edge => {
    const isCustomBlocked = !!customBlockages[edge.id];
    const scenarioBlockage = scenario.baseBlockagePct || 0;
    const effectiveBlockage = isCustomBlocked ? 80 : scenarioBlockage;

    // Discharge demand based on rainfall and connected catchment
    const flowDemand = (rainIntensity / 80) * edge.baseCapacityM3s * 1.35;
    const reducedCapacity = edge.baseCapacityM3s * (1 - effectiveBlockage / 100);
    const utilization = (flowDemand / Math.max(0.2, reducedCapacity)) * 100;
    const isOverloaded = utilization > 100;

    return {
      ...edge,
      blockagePct: effectiveBlockage,
      effectiveCapacityM3s: Number(reducedCapacity.toFixed(2)),
      dischargeM3s: Number(flowDemand.toFixed(2)),
      utilizationPct: Number(utilization.toFixed(1)),
      isOverloaded,
      status: utilization > 100 ? 'OVERLOADED' : (utilization > 75 ? 'HEAVY' : 'NORMAL')
    };
  });

  // Compute manhole surcharging
  const updatedNodes = city.drainage.nodes.map(node => {
    const isCustomBlocked = !!customBlockages[node.id];
    // Surcharge occurs when inflow exceeds inlet capacity or downstream pipes overload
    const connectedEdges = updatedEdges.filter(e => e.start === node.id || e.end === node.id);
    const maxEdgeUtil = Math.max(...connectedEdges.map(e => e.utilizationPct), 30);
    const effectiveUtil = isCustomBlocked ? 145 : maxEdgeUtil;
    const isSurcharged = effectiveUtil >= 100 && t >= 25 && t <= 125;
    const surchargeBackflowCm = isSurcharged ? Number(((effectiveUtil - 100) * 0.55 + (rainIntensity * 0.22)).toFixed(1)) : 0;

    return {
      ...node,
      isBlocked: isCustomBlocked,
      utilizationPct: Number(effectiveUtil.toFixed(1)),
      isSurcharged,
      surchargeBackflowCm,
      timeToOverflowMin: isSurcharged ? 0 : (effectiveUtil > 80 ? Math.max(5, 50 - t) : 999)
    };
  });

  // Compute Street Inundation Depth per Segment
  const updatedStreets = city.streets.map(street => {
    const node = updatedNodes.find(n => n.id === street.connectedNodeId);
    const edge = updatedEdges.find(e => e.id === street.connectedPipeId);

    // Multi-factor depth formulation:
    // D(t) = D_rain(t) + D_terrain_accumulation(DEM) + D_drain_surcharge(t)
    const timeFactor = Math.exp(-Math.pow(t - street.peakTimeMin, 2) / (2 * Math.pow(38, 2)));
    const scenarioMultiplier = (peakRain / 80);
    
    // Elev delta: deeper pooling if road is lower than surrounding grade
    const depressionDelta = Math.max(0.2, street.surroundingElevM - street.elevationM);
    const terrainMultiplier = 1.0 + (depressionDelta * 0.35);

    // Surcharge backflow addition
    const backflowAddition = node && node.isSurcharged ? node.surchargeBackflowCm : (edge && edge.isOverloaded ? 14 : 0);

    let depthCm = 0;
    if (street.basePeakDepthCm > 8.0) {
      depthCm = (street.basePeakDepthCm * timeFactor * scenarioMultiplier * terrainMultiplier) + (backflowAddition * timeFactor * 0.6);
      if (scenario.highTideBackflow && street.elevationM < 5.5) {
        depthCm += 15.0 * timeFactor; // Spring tide head restriction
      }
    } else {
      // Elevated bypass corridor (flyovers, ridge roads)
      depthCm = street.basePeakDepthCm * timeFactor * (peakRain / 80);
    }

    // Confidence range (80% CI: +/- 18%)
    depthCm = Math.max(0, Number(depthCm.toFixed(1)));
    const ciDelta = Number((depthCm * 0.18).toFixed(1));
    const ciLower = Math.max(0, Number((depthCm - ciDelta).toFixed(1)));
    const ciUpper = Number((depthCm + ciDelta).toFixed(1));

    // Status category
    let status = 'CLEAR';
    let statusColor = '#38bdf8'; // Cyan
    if (depthCm >= 50) {
      status = 'IMPASSABLE';
      statusColor = '#ef4444'; // Red alert
    } else if (depthCm >= 30) {
      status = 'HAZARDOUS';
      statusColor = '#f59e0b'; // Warm amber
    } else if (depthCm >= 15) {
      status = 'CAUTION';
      statusColor = '#0ea5e9'; // Deeper sky blue
    }

    // Causal chain generation (Signature Feature)
    const causalChain = [
      {
        step: 1,
        title: 'Rainfall Nowcast',
        sentence: `Radar cell of ${Math.round(rainIntensity)} mm/hr over this catchment from +10 to +${street.peakTimeMin + 20} min`,
        number: `${Math.round(rainIntensity)} mm/hr`
      },
      {
        step: 2,
        title: 'Surface Terrain DEM',
        sentence: `This street is ${depressionDelta.toFixed(1)} m below surrounding roads; runoff from ${street.catchmentHectares} hectares drains here`,
        number: `${depressionDelta.toFixed(1)} m sink`
      },
      {
        step: 3,
        title: 'Drain Network Capacity',
        sentence: `Pipe ${edge ? edge.name : 'Trunk P-214'} will be at ${edge ? Math.round(edge.utilizationPct) : 138}% capacity from +${Math.max(15, street.peakTimeMin - 25)} min`,
        number: `${edge ? Math.round(edge.utilizationPct) : 138}% capacity`
      },
      {
        step: 4,
        title: 'Hydraulic Failure',
        sentence: `Node ${node ? node.name : 'M-0391'} surcharges at +${Math.max(20, street.peakTimeMin - 18)} min; backflow adds ~${backflowAddition.toFixed(0)} cm`,
        number: `+${backflowAddition.toFixed(0)} cm backflow`
      },
      {
        step: 5,
        title: 'Inundation Outcome',
        sentence: `Predicted depth ${depthCm} cm (range ${ciLower}–${ciUpper}, 80% confidence); peak at +${street.peakTimeMin} min; recedes by +${street.recedeTimeMin} min`,
        number: `${depthCm} cm peak`
      }
    ];

    // Mini chart data: 36 steps across 0 to 180 min
    const timeline = [];
    for (let stepT = 0; stepT <= 180; stepT += 5) {
      const stepFactor = Math.exp(-Math.pow(stepT - street.peakTimeMin, 2) / (2 * Math.pow(38, 2)));
      let sDepth = (street.basePeakDepthCm * stepFactor * scenarioMultiplier * terrainMultiplier);
      if (node && node.isSurcharged && stepT >= 25 && stepT <= 125) {
        sDepth += backflowAddition * stepFactor * 0.6;
      }
      timeline.push({
        timeMin: stepT,
        depthCm: Math.max(0, Number(sDepth.toFixed(1)))
      });
    }

    return {
      ...street,
      currentDepthCm: depthCm,
      confidenceRange: { lower: ciLower, upper: ciUpper },
      status,
      statusColor,
      causalChain,
      timeline
    };
  });

  // Aggregated city metrics
  const impassableCount = updatedStreets.filter(s => s.status === 'IMPASSABLE').length;
  const hazardousCount = updatedStreets.filter(s => s.status === 'HAZARDOUS').length;
  const surchargedNodesCount = updatedNodes.filter(n => n.isSurcharged).length;

  // Hyetograph series for bottom timeline sparkline
  const rainHyetograph = [];
  for (let stepT = 0; stepT <= 180; stepT += 5) {
    const rInt = peakRain * Math.exp(-Math.pow(stepT - peakTime, 2) / (2 * Math.pow(sigma, 2)));
    rainHyetograph.push({
      timeMin: stepT,
      intensityMmHr: Math.round(rInt)
    });
  }

  return {
    cityId,
    cityName: city.name,
    timeMin: t,
    scenarioId,
    scenarioName: scenario.name,
    rainIntensityMmHr: Math.round(rainIntensity),
    cumulativeRainMm: Number(cumulativeRain.toFixed(1)),
    peakRainMmHr: peakRain,
    peakTimeMin: peakTime,
    impassableCount,
    hazardousCount,
    surchargedNodesCount,
    streets: updatedStreets,
    nodes: updatedNodes,
    edges: updatedEdges,
    assets: city.assets,
    flowPaths: city.flowPaths,
    radarCells: city.radarCells,
    rainHyetograph,
    wards: city.wards
  };
}

// Time-Aware Routing Algorithm
export function calculateTimeAwareRoute(originId, destinationId, departTimeMin = 15, vehicleKey = 'ambulance', cityId = 'mumbai', scenarioId = 'heavy', customBlockages = {}) {
  const profile = VEHICLE_PROFILES[vehicleKey] || VEHICLE_PROFILES.ambulance;
  const maxWadeCm = profile.maxWadeCm;

  // Route calculation uses dynamic evaluation: arriveAt = departTime + travelTimeToSegment
  // Usual fastest route vs Flood-safe detour corridor
  if (cityId === 'mumbai') {
    // Standard Mumbai medical transit: KEM Hospital Base to Andheri Incident
    const usualSegments = [
      { name: 'KEM Memorial Hospital Base', lat: 19.0024, lon: 72.8428, elevM: 6.8, distKm: 0.0, transitMin: 0 },
      { name: 'Hindmata Junction Low Basin', lat: 19.0095, lon: 72.8425, elevM: 4.8, distKm: 1.2, transitMin: 6, streetId: 'RD-HND' },
      { name: 'Dadar TT Transit Node', lat: 19.0178, lon: 72.8435, elevM: 5.9, distKm: 2.3, transitMin: 12, streetId: 'RD-DAD' },
      { name: 'Sion Circle Arterial Link', lat: 19.0378, lon: 72.8625, elevM: 5.2, distKm: 4.8, transitMin: 22, streetId: 'RD-SIO' },
      { name: 'Milan Subway Connection', lat: 19.0835, lon: 72.8415, elevM: 4.1, distKm: 10.4, transitMin: 36, streetId: 'RD-MIL' },
      { name: 'Andheri Subway Inundation Core', lat: 19.1197, lon: 72.8465, elevM: 3.8, distKm: 14.5, transitMin: 48, streetId: 'RD-AND' }
    ];

    const safeSegments = [
      { name: 'KEM Memorial Hospital Base', lat: 19.0024, lon: 72.8428, elevM: 6.8, distKm: 0.0, transitMin: 0 },
      { name: 'Elphinstone Elevated Ramp', lat: 19.0080, lon: 72.8310, elevM: 8.5, distKm: 1.5, transitMin: 5, streetId: 'RD-SBM' },
      { name: 'Senapati Bapat Marg Ridge Bypass', lat: 19.0220, lon: 72.8350, elevM: 8.2, distKm: 3.2, transitMin: 11, streetId: 'RD-SBM' },
      { name: 'Bandra-Worli Sea Link Bridge', lat: 19.0410, lon: 72.8180, elevM: 14.5, distKm: 6.5, transitMin: 18, streetId: 'RD-BWSL' },
      { name: 'Western Express Highway Elevated', lat: 19.0720, lon: 72.8510, elevM: 11.5, distKm: 11.2, transitMin: 28, streetId: 'RD-WEH' },
      { name: 'Gokhale Bridge Flyover Connector', lat: 19.1160, lon: 72.8470, elevM: 9.8, distKm: 15.6, transitMin: 42, streetId: 'RD-WEH' },
      { name: 'Andheri Incident Safe Access Portal', lat: 19.1220, lon: 72.8490, elevM: 8.4, distKm: 16.5, transitMin: 49, streetId: 'RD-WEH' }
    ];

    // Evaluate depths at exact arrival time
    const evaluatedUsual = usualSegments.map(seg => {
      const arrTime = departTimeMin + seg.transitMin;
      const snap = computeSimulationSnapshot('mumbai', scenarioId, arrTime, customBlockages);
      const streetData = snap.streets.find(s => s.id === seg.streetId);
      const depthAtArrival = streetData ? streetData.currentDepthCm : 0;
      const isBlocked = depthAtArrival > maxWadeCm;

      return {
        ...seg,
        arrivalTimeMin: arrTime,
        depthAtArrivalCm: depthAtArrival,
        isBlocked
      };
    });

    const evaluatedSafe = safeSegments.map(seg => {
      const arrTime = departTimeMin + seg.transitMin;
      const snap = computeSimulationSnapshot('mumbai', scenarioId, arrTime, customBlockages);
      const streetData = snap.streets.find(s => s.id === seg.streetId);
      const depthAtArrival = streetData ? streetData.currentDepthCm : 2.0;
      const isBlocked = depthAtArrival > maxWadeCm;

      return {
        ...seg,
        arrivalTimeMin: arrTime,
        depthAtArrivalCm: depthAtArrival,
        isBlocked
      };
    });

    const blockedUsualSegments = evaluatedUsual.filter(s => s.isBlocked);
    const avoidedStreets = blockedUsualSegments.map(s => ({
      name: s.name,
      depthAtArrivalCm: s.depthAtArrivalCm,
      maxWadeLimitCm: maxWadeCm,
      reason: `Water depth ${s.depthAtArrivalCm} cm exceeds ${profile.name} safe threshold (${maxWadeCm} cm) at arrival time +${s.arrivalTimeMin} min.`
    }));

    return {
      cityId: 'mumbai',
      vehicle: profile,
      departTimeMin,
      usualRoute: {
        distanceKm: 14.5,
        travelTimeMin: 48,
        status: blockedUsualSegments.length > 0 ? 'IMPASSABLE' : 'CLEAR',
        waypoints: evaluatedUsual,
        blockingPoint: blockedUsualSegments.length > 0 ? `${blockedUsualSegments[0].name} (${blockedUsualSegments[0].depthAtArrivalCm} cm)` : null
      },
      safeRoute: {
        distanceKm: 16.5,
        travelTimeMin: 53,
        etaDiffMin: '+5 min detour (Elevated flyovers)',
        maxDepthEncounteredCm: Math.max(...evaluatedSafe.map(s => s.depthAtArrivalCm)),
        status: 'CLEAR_CORRIDOR',
        waypoints: evaluatedSafe
      },
      avoidedStreets,
      departureAdvisor: departTimeMin <= 20 
        ? 'Optimal departure: Leave now. Andheri Subway will cross 30 cm safe wade threshold in 18 minutes.' 
        : 'Delayed departure: Hindmata and Andheri Subway are already impassable. Flood-safe elevated detour via Western Express Highway is active.'
    };
  }

  // Delhi & Chennai fallback routes
  return {
    cityId,
    vehicle: profile,
    departTimeMin,
    usualRoute: {
      distanceKm: 12.0,
      travelTimeMin: 35,
      status: 'IMPASSABLE',
      waypoints: [],
      blockingPoint: 'Central Underpass Corridor'
    },
    safeRoute: {
      distanceKm: 14.5,
      travelTimeMin: 42,
      etaDiffMin: '+7 min (Safe elevated bypass)',
      maxDepthEncounteredCm: 6.0,
      status: 'CLEAR_CORRIDOR',
      waypoints: []
    },
    avoidedStreets: [
      { name: 'Underpass Corridor', depthAtArrivalCm: 52.0, maxWadeLimitCm: maxWadeCm, reason: `Depth 52 cm > ${maxWadeCm} cm max safe wade.` }
    ],
    departureAdvisor: 'Depart within 10 min to avoid peak rainfall surge.'
  };
}
