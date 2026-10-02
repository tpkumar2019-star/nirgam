const API_BASE = '/api';

export const api = {
  async getHealth() {
    const res = await fetch(`${API_BASE}/health`);
    return res.json();
  },

  async getFloodState(timeMin = 0) {
    const res = await fetch(`${API_BASE}/flood/current?time_min=${timeMin}`);
    if (!res.ok) throw new Error(`Failed to fetch flood state for t=${timeMin}`);
    return res.json();
  },

  async getForecastTimeline() {
    const res = await fetch(`${API_BASE}/flood/forecast`);
    return res.json();
  },

  async getRainfallForecast() {
    const res = await fetch(`${API_BASE}/rainfall/forecast`);
    return res.json();
  },

  async getDemGrid() {
    const res = await fetch(`${API_BASE}/dem/grid`);
    return res.json();
  },

  async getCriticalDrainage(timeMin = 60) {
    const res = await fetch(`${API_BASE}/drainage/critical?time_min=${timeMin}`);
    return res.json();
  },

  async getAlerts(timeMin = 60) {
    const res = await fetch(`${API_BASE}/alerts?time_min=${timeMin}`);
    return res.json();
  },

  async calculateSafeRoute({ origin, destination, timeHorizonMin = 60, travelMode = "emergency_vehicle" }) {
    const res = await fetch(`${API_BASE}/route/safe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        origin,
        destination,
        time_horizon_min: timeHorizonMin,
        travel_mode: travelMode
      })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || 'Routing failed');
    }
    return res.json();
  },

  async updateScenario({ scenarioName, peakIntensity, blockageOverrides }) {
    const res = await fetch(`${API_BASE}/simulation/scenario`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        scenario_name: scenarioName,
        peak_intensity_mm_hr: peakIntensity,
        pipe_blockage_injections: blockageOverrides
      })
    });
    return res.json();
  },

  async getValidationMetrics() {
    const res = await fetch(`${API_BASE}/validation`);
    return res.json();
  },

  async getModelStatus() {
    const res = await fetch(`${API_BASE}/model/status`);
    return res.json();
  },

  async getHotspots(timeMin = 60, limit = 5) {
    const res = await fetch(`${API_BASE}/hotspots?time_min=${timeMin}&limit=${limit}`);
    return res.json();
  },

  async explainRoad(roadId, timeMin = 60) {
    const res = await fetch(`${API_BASE}/explain/road/${roadId}?time_min=${timeMin}`);
    return res.json();
  },

  async getPipeHydraulics(pipeId, timeMin = 60) {
    const res = await fetch(`${API_BASE}/drainage/pipe/${pipeId}?time_min=${timeMin}`);
    return res.json();
  },

  async compareScenarios({ baseBlockage = 20.0, stressBlockage = 75.0, peakRain = 95.0 }) {
    const res = await fetch(`${API_BASE}/simulation/compare?base_blockage=${baseBlockage}&stress_blockage=${stressBlockage}&peak_rain=${peakRain}`, {
      method: 'POST'
    });
    return res.json();
  }
};
