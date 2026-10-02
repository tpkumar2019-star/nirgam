import React, { useState } from 'react';
import { Sparkles, ChevronRight, ChevronLeft, X, ArrowRight, CloudRain, AlertTriangle, ShieldCheck, Smartphone, Info } from 'lucide-react';

const TOUR_STEPS = [
  {
    step: 1,
    title: '1. Storm Approaches (Doppler Radar Nowcast)',
    icon: <CloudRain className="w-5 h-5 text-cyan-400" />,
    description: 'Moving convective storm cell advects from the Arabian Sea across Mumbai. At +45 min, rainfall intensity spikes to 80 mm/hr over the central and suburban catchments.',
    actionLabel: 'Advance to Inundation'
  },
  {
    step: 2,
    title: '2. Predicted Flooding at Andheri Subway',
    icon: <AlertTriangle className="w-5 h-5 text-rose-400" />,
    description: 'Because Andheri Subway sits 2.4 m below surrounding roads with 22 hectares draining into the railway depression, water accumulates rapidly, reaching 58 cm depth (Impassable for cars and buses).',
    actionLabel: 'Inspect Failure Chain'
  },
  {
    step: 3,
    title: '3. "Why Is This Flooding?" Causal Chain',
    icon: <Info className="w-5 h-5 text-amber-400" />,
    description: 'NIRGAM couples rainfall, DEM pooling, and pipe capacity. Trunk conduit C-AND-22 reaches 154% capacity, causing manhole M-0182 to surcharge backflow onto the street.',
    actionLabel: 'Simulate Emergency Corridor'
  },
  {
    step: 4,
    title: '4. Dynamic Ambulance Rerouting',
    icon: <ShieldCheck className="w-5 h-5 text-emerald-400" />,
    description: 'The time-aware routing engine evaluates street water depths at the exact arrival time. Instead of drowning at Hindmata or Andheri, the ambulance is automatically routed via the elevated Western Express Highway flyover (+5 min ETA).',
    actionLabel: 'View Commuter Alert'
  },
  {
    step: 5,
    title: '5. Actionable Commuter Advisory',
    icon: <Smartphone className="w-5 h-5 text-cyan-400" />,
    description: 'Commuters receive a single clear directive: "Leave by 6:10 pm via Route B. Andheri Subway will be impassable from 6:35." Zero clutter, maximum safety.',
    actionLabel: 'Finish Guided Tour'
  }
];

export default function GuidedTourModal({ onClose, onGoToStep }) {
  const [currentStepIdx, setCurrentStepIdx] = useState(0);

  const step = TOUR_STEPS[currentStepIdx];

  const handleNext = () => {
    if (currentStepIdx < TOUR_STEPS.length - 1) {
      const nextIdx = currentStepIdx + 1;
      setCurrentStepIdx(nextIdx);
      if (onGoToStep) onGoToStep(nextIdx + 1);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentStepIdx > 0) {
      const prevIdx = currentStepIdx - 1;
      setCurrentStepIdx(prevIdx);
      if (onGoToStep) onGoToStep(prevIdx + 1);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="glass-panel-dark max-w-lg w-full rounded-2xl shadow-2xl border border-cyan-500/50 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400 animate-spin" style={{ animationDuration: '6s' }} />
            <span className="font-mono text-xs text-cyan-300 font-bold uppercase tracking-wider">
              60-SECOND NIRGAM DEMO TOUR ({step.step}/5)
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-slate-900 border border-slate-700/80 shadow-md">
              {step.icon}
            </div>
            <h3 className="text-base font-bold text-white font-display">
              {step.title}
            </h3>
          </div>

          <p className="text-xs text-slate-300 font-sans leading-relaxed">
            {step.description}
          </p>

          {/* Stepper Dots */}
          <div className="flex items-center justify-center gap-2 pt-2">
            {TOUR_STEPS.map((s, idx) => (
              <div
                key={s.step}
                className={`h-1.5 rounded-full transition-all ${
                  idx === currentStepIdx
                    ? 'w-6 bg-cyan-400'
                    : 'w-1.5 bg-slate-700'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between">
          <button
            onClick={onClose}
            className="text-xs text-slate-400 hover:text-white font-mono transition cursor-pointer"
          >
            Skip Tour (ESC)
          </button>

          <div className="flex items-center gap-2">
            {currentStepIdx > 0 && (
              <button
                onClick={handlePrev}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 font-medium transition cursor-pointer flex items-center gap-1"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
            )}

            <button
              onClick={handleNext}
              className="px-4 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-lg transition cursor-pointer flex items-center gap-1.5"
            >
              <span>{step.actionLabel}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
