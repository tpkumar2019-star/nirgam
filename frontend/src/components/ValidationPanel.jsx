import React from 'react';
import { X, CheckCircle, ShieldCheck, Cpu, Database, Info, Award } from 'lucide-react';

export default function ValidationPanel({ metrics, onClose }) {
  if (!metrics) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 text-xs">
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-outfit font-extrabold text-slate-900">Hydrodynamic &amp; ML Validation</h2>
                <span className="px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-bold">
                  VERIFIED
                </span>
              </div>
              <p className="text-[11px] text-slate-500">MoES / NCMRWF SIH 26085 Empirical Benchmark</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Model Architecture Overview */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
          <span className="font-bold text-slate-900 block flex items-center gap-1.5">
            <Award className="w-4 h-4 text-blue-600" />
            <span>Hybrid Hydrodynamic + ML Architecture:</span>
          </span>
          <p className="text-slate-600 leading-relaxed text-[11px]">
            Primary physics predictions are computed via <strong>2D Overland Diffusive Wave</strong> and <strong>1D Manning Conduit Hydraulics</strong>. 
            A secondary <strong>Random Forest Regressor</strong> predicts residual error corrections while a <strong>Gradient Boosted Classifier</strong> predicts conduit blockage risk.
          </p>
        </div>

        {/* Evaluation Metrics Grid */}
        <div>
          <span className="font-bold text-slate-800 block mb-2">Empirical Validation Benchmarks:</span>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            <div className="bg-slate-50/90 p-3 rounded-xl border border-slate-200 text-center shadow-xs">
              <span className="text-[10px] text-slate-500 block uppercase font-medium">RMSE (Depth)</span>
              <span className="text-lg font-outfit font-extrabold font-mono text-blue-600">{metrics.rmse_depth_cm} cm</span>
            </div>
            <div className="bg-slate-50/90 p-3 rounded-xl border border-slate-200 text-center shadow-xs">
              <span className="text-[10px] text-slate-500 block uppercase font-medium">MAE (Depth)</span>
              <span className="text-lg font-outfit font-extrabold font-mono text-blue-600">{metrics.mae_depth_cm} cm</span>
            </div>
            <div className="bg-slate-50/90 p-3 rounded-xl border border-slate-200 text-center shadow-xs">
              <span className="text-[10px] text-slate-500 block uppercase font-medium">R² Coefficient</span>
              <span className="text-lg font-outfit font-extrabold font-mono text-emerald-600">{metrics.r2_score}</span>
            </div>
            <div className="bg-slate-50/90 p-3 rounded-xl border border-slate-200 text-center shadow-xs">
              <span className="text-[10px] text-slate-500 block uppercase font-medium">F1 Classification</span>
              <span className="text-lg font-outfit font-extrabold font-mono text-indigo-600">{metrics.f1_score}</span>
            </div>
            <div className="bg-slate-50/90 p-3 rounded-xl border border-slate-200 text-center shadow-xs">
              <span className="text-[10px] text-slate-500 block uppercase font-medium">IoU Inundation</span>
              <span className="text-lg font-outfit font-extrabold font-mono text-emerald-600">{metrics.iou_inundation}</span>
            </div>
            <div className="bg-slate-50/90 p-3 rounded-xl border border-slate-200 text-center shadow-xs">
              <span className="text-[10px] text-slate-500 block uppercase font-medium">Benchmark Size</span>
              <span className="text-lg font-outfit font-extrabold font-mono text-slate-800">{metrics.sample_size} runs</span>
            </div>
          </div>
        </div>

        {/* Provenance & Scientific Honesty Badge */}
        <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-2.5 text-[11px] leading-relaxed">
          <Info className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
          <div>
            <strong className="text-amber-950 font-bold">Scientific Provenance &amp; Verification Note:</strong>
            <p className="mt-0.5 text-amber-800">{metrics.data_provenance}</p>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-xl transition cursor-pointer shadow-sm"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
}
