import React from 'react';
import { FileText, Printer, Download, X, ShieldAlert, AlertTriangle, CheckCircle2, Droplets, Clock, MapPin, Gauge } from 'lucide-react';

export default function SituationReportModal({
  isOpen,
  onClose,
  stepData,
  forecastSummary,
  currentTimeMin,
  routeResult
}) {
  if (!isOpen) return null;

  const now = new Date();
  const dateStr = now.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  const timeStr = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  const handlePrint = () => {
    window.print();
  };

  const floodedRoads = (stepData?.roads || []).filter(r => !r.is_passable || r.current_depth_cm > 15);
  const surchargedNodes = (stepData?.nodes || []).filter(n => n.is_surcharged);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-3xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header Bar */}
        <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 px-6 py-4 border-b border-slate-800 flex items-center justify-between text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-white shadow-sm">
              <FileText className="w-5 h-5 text-cyan-300" />
            </div>
            <div>
              <h2 className="text-base font-outfit font-extrabold text-white tracking-tight">
                MUNICIPAL DISASTER MANAGEMENT SITUATION REPORT (SITREP)
              </h2>
              <p className="text-xs text-cyan-200/80 font-mono">
                REF: MoES-NCMRWF/BLR-CV/2026-SR-{currentTimeMin}M • CLASSIFICATION: OFFICIAL USE
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs text-white border border-white/20 font-medium transition cursor-pointer shadow-sm"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Report Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-700 font-sans print:p-0 print:text-black">
          {/* Official Emblem Banner */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-slate-200 gap-3">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500 block">
                GOVERNMENT OF INDIA • MINISTRY OF EARTH SCIENCES
              </span>
              <span className="text-sm font-outfit font-extrabold text-slate-900">
                NATIONAL CENTRE FOR MEDIUM RANGE WEATHER FORECASTING (NCMRWF)
              </span>
              <p className="text-[11px] text-slate-500">
                Urban Hydrometeorology &amp; Drainage Intelligence Division • Bengaluru Catchment Cell
              </p>
            </div>
            <div className="text-left sm:text-right font-mono text-[11px] bg-slate-50 p-2.5 rounded-xl border border-slate-200">
              <div><strong>Generated:</strong> {dateStr} {timeStr} IST</div>
              <div><strong>Forecast Horizon:</strong> T+{currentTimeMin} min</div>
              <div className="text-amber-600 font-bold">STATUS: ADVISORY ACTIVE</div>
            </div>
          </div>

          {/* Section 1: Executive Summary */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-blue-700 font-mono flex items-center gap-1.5">
              <span>1. Meteorological &amp; Hydrologic Overview</span>
            </h3>
            <p className="text-slate-600 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              Spatial Doppler radar simulation indicates convective storm cell activity centered over the{' '}
              <strong className="text-slate-900">Bengaluru Central Valley Catchment (1.0 km²)</strong>. Regional precipitation intensity is{' '}
              <strong className="text-slate-900">{stepData?.rainfall_intensity_mm_hr || 0} mm/h</strong>, generating an estimated{' '}
              <strong className="text-slate-900">{Math.round(stepData?.total_surface_water_m3 || 0)} m³</strong> of overland surface runoff.
              Peak catchment flood depth has reached <strong className="text-rose-600 font-bold">{stepData?.max_flood_depth_cm || 0} cm</strong> in topographic valley depressions.
            </p>
          </div>

          {/* Section 2: Critical Asset Impact Grid */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-rose-700 font-mono">
              2. Road Network Hazard Assessment
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 shadow-xs">
                <span className="text-[10px] text-slate-500 block font-sans">Roads Evaluated</span>
                <span className="text-base font-outfit font-extrabold text-slate-900">{(stepData?.roads || []).length} Segments</span>
              </div>
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 shadow-xs">
                <span className="text-[10px] text-rose-600 block font-sans font-medium">Impassable Corridors (&gt;15cm)</span>
                <span className="text-base font-outfit font-extrabold text-rose-600">{floodedRoads.length} Segments</span>
              </div>
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 shadow-xs">
                <span className="text-[10px] text-amber-700 block font-sans font-medium">Traffic Advisory Level</span>
                <span className="text-base font-outfit font-extrabold text-amber-700">AMBER: RE-ROUTE</span>
              </div>
            </div>

            {floodedRoads.length > 0 && (
              <div className="overflow-x-auto mt-2">
                <table className="w-full text-left font-mono text-[11px] border border-slate-200 rounded-xl overflow-hidden shadow-xs">
                  <thead className="bg-slate-100 text-slate-700 border-b border-slate-200">
                    <tr>
                      <th className="p-2.5">Road ID</th>
                      <th className="p-2.5 font-sans">Corridor Name</th>
                      <th className="p-2.5">Water Depth</th>
                      <th className="p-2.5">Passability</th>
                      <th className="p-2.5 font-sans">Recommended Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {floodedRoads.map((r) => (
                      <tr key={r.road_id} className="hover:bg-slate-50">
                        <td className="p-2.5 text-blue-700 font-bold">{r.road_id}</td>
                        <td className="p-2.5 font-sans font-semibold text-slate-800">{r.name}</td>
                        <td className="p-2.5 text-rose-600 font-bold">{r.current_depth_cm} cm</td>
                        <td className="p-2.5">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                            BLOCKED
                          </span>
                        </td>
                        <td className="p-2.5 font-sans text-slate-600">Deploy traffic marshals &amp; barricades</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Section 3: Drainage Infrastructure Telemetry */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-700 font-mono">
              3. Underground Stormwater Network Status
            </h3>
            <p className="text-slate-600 bg-slate-50 p-3.5 rounded-xl border border-slate-200 leading-relaxed">
              Downstream trunk conduit <strong className="text-slate-900">P-104 (100 Ft Ring Road Box Culvert)</strong> is experiencing hydraulic throttling 
              due to solid waste and silt accumulation. Total backflow surcharge returned to the surface is{' '}
              <strong className="text-slate-900">{stepData?.total_surcharged_water_m3 || 0} m³</strong> across{' '}
              <strong className="text-slate-900">{surchargedNodes.length} surcharging manholes</strong>.
            </p>
          </div>

          {/* Section 4: Emergency Dispatch Recommendation */}
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 space-y-2">
            <div className="flex items-center gap-2 text-emerald-800 font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>RECOMMENDED EMERGENCY ACTION PROTOCOL</span>
            </div>
            <p className="text-emerald-950 leading-relaxed text-xs">
              1. <strong>Hospital to Shelter Corridor:</strong> Traffic diverted from flooded valley underpass onto the higher elevation Ridge Link Road (Elevation: 914.5m MSL).
              <br/>
              2. <strong>Municipal Dewatering Deployment:</strong> Immediate dispatch of high-discharge pumps to Sony World Underpass (Node N-104 / N-105).
              <br/>
              3. <strong>Citizen Advisory:</strong> Broadcast automated SMS alerts advising two-wheelers and sedans to avoid low-lying underpasses.
            </p>
          </div>

          {/* Official Sign-Off Footer */}
          <div className="pt-4 border-t border-slate-200 flex justify-between text-[10px] text-slate-500 font-mono">
            <div>AUTHENTICATED BY: NCMRWF AUTOMATED NOWCASTING ENGINE v1.0</div>
            <div>VERIFIED AGAINST DEM &amp; MANNING HYDRAULIC EQUATIONS</div>
          </div>
        </div>
      </div>
    </div>
  );
}
