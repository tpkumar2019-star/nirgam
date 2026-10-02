import React, { useState } from 'react';
import { 
  Smartphone, 
  AlertTriangle, 
  ShieldCheck, 
  Share2, 
  Check, 
  Clock, 
  Navigation, 
  ArrowRight,
  MessageSquare,
  Send,
  Phone,
  Radio,
  CheckCircle2,
  X
} from 'lucide-react';

export default function CommuterView({ routeResult, onClose, currentTimeMin }) {
  const [phoneNumber, setPhoneNumber] = useState('9182619785');
  const [copied, setCopied] = useState(false);
  const [showMockSmsModal, setShowMockSmsModal] = useState(false);
  const [smsDeliveryStatus, setSmsDeliveryStatus] = useState('sending'); // 'sending', 'delivered'

  if (!routeResult) return null;

  const advisoryText = `🚨 *NIRGAM FLOOD ALERT (Govt. of Maharashtra / MoES)* 🚨
⏱️ Time: ${new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })} IST
⚠️ *Critical Inundation Warning*: Andheri Subway will become IMPASSABLE (predicted water depth: 58 cm) from 6:35 PM due to coupled rainfall & drainage surcharge.
✅ *Recommended Action*: Leave by 6:10 PM via Route B (Western Express Highway Flyover bypass).
🛣️ *Safe Corridor*: 100% passable for cars & 2-wheelers. Safe wade depth verified.
🌐 Live Nowcast: http://localhost:5173`;

  // 1. Direct Real-Time WhatsApp Send
  const handleSendWhatsApp = () => {
    // Format target phone number (remove spaces or dashes, ensure country code 91)
    const cleanNumber = phoneNumber.replace(/\D/g, '');
    const finalNumber = cleanNumber.startsWith('91') ? cleanNumber : `91${cleanNumber}`;
    const whatsappUrl = `https://api.whatsapp.com/send?phone=${finalNumber}&text=${encodeURIComponent(advisoryText)}`;
    window.open(whatsappUrl, '_blank');
  };

  // 2. Simulated Emergency Cell Broadcast / Flash SMS
  const handleTriggerMockSms = () => {
    setShowMockSmsModal(true);
    setSmsDeliveryStatus('sending');
    setTimeout(() => {
      setSmsDeliveryStatus('delivered');
      // Subtle audio feedback chime
      try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.frequency.setValueAtTime(880, audioCtx.currentTime);
        gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.18);
      } catch (e) {
        // AudioContext silent fallback
      }
    }, 1200);
  };

  const handleCopyClipboard = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(advisoryText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <>
      <div className="fixed inset-x-4 bottom-24 sm:bottom-auto sm:top-20 sm:right-4 sm:inset-x-auto z-30 sm:w-96 max-w-md mx-auto bg-slate-900/95 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-700/80 overflow-hidden flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-200">
        {/* Mobile-first Hero Advisory Card */}
        <div className="p-4 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-lg bg-blue-600/30 text-blue-300">
                <Smartphone className="w-4 h-4" />
              </span>
              <span className="font-mono text-xs text-blue-300 font-bold uppercase tracking-wider">
                CITIZEN COMMUTER ADVISORY
              </span>
            </div>
            <button
              onClick={onClose}
              className="text-xs text-slate-300 hover:text-white font-mono px-2 py-0.5 rounded hover:bg-slate-800 transition"
            >
              Close
            </button>
          </div>

          {/* The One-Line Clear Recommendation */}
          <div className="bg-slate-950/90 border border-blue-500/50 p-4 rounded-2xl shadow-inner mb-3">
            <div className="text-[10px] font-mono text-cyan-300 uppercase font-bold tracking-wider mb-1.5 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              <span>OPTIMAL DEPARTURE WINDOW</span>
            </div>
            <p className="text-sm font-bold text-white leading-relaxed font-sans">
              "Leave by 6:10 pm via Route B (Western Express Highway). Andheri Subway will be impassable from 6:35 pm."
            </p>
          </div>

          {/* Route Risk Gauge */}
          <div className="space-y-1.5 mb-3.5 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-300 font-semibold">YOUR USUAL ROUTE:</span>
              <span className="text-rose-400 font-extrabold flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>HIGH RISK (SUBMERGED)</span>
              </span>
            </div>
            <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden flex">
              <div className="bg-emerald-500 w-1/4 h-full" />
              <div className="bg-amber-500 w-1/4 h-full" />
              <div className="bg-rose-500 w-2/4 h-full animate-pulse" />
            </div>
            <div className="text-[11px] text-slate-300 font-mono mt-0.5">
              Impending submergence: Hindmata (46 cm) & Andheri Subway (58 cm)
            </div>
          </div>

          {/* Recommended Detour Alternative */}
          <div className="bg-emerald-950/50 border border-emerald-500/60 p-3 rounded-xl mb-3 shadow-sm">
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-300 mb-1">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>RECOMMENDED DETOUR: ROUTE B</span>
            </div>
            <p className="text-xs text-slate-200 leading-relaxed font-sans">
              Divert via Elphinstone Elevated Ramp to Western Express Highway flyover. Adds +5 min travel time but stays 100% dry and safe.
            </p>
          </div>

          {/* Target Phone Input for Live Alerts */}
          <div className="mb-3 bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
            <label className="block text-[10px] font-mono text-slate-400 mb-1 font-semibold uppercase">
              TARGET CITIZEN PHONE NUMBER:
            </label>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-slate-400 bg-slate-900 px-2 py-1.5 rounded-lg border border-slate-700">
                +91
              </span>
              <input
                type="text"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="Enter 10-digit phone"
                className="flex-1 bg-slate-900 border border-slate-700 text-white font-mono text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-blue-400"
              />
            </div>
          </div>

          {/* Dual Action Buttons: Live WhatsApp + Mock SMS */}
          <div className="flex flex-col gap-2">
            {/* Live WhatsApp Alert Button */}
            <button
              onClick={handleSendWhatsApp}
              className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg transition flex items-center justify-center gap-2 cursor-pointer"
              title="Click to launch WhatsApp with the alert pre-filled"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Send Live WhatsApp Alert to +91 {phoneNumber}</span>
            </button>

            {/* Simulated Emergency Broadcast SMS */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleTriggerMockSms}
                className="py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-[11px] shadow transition flex items-center justify-center gap-1.5 cursor-pointer"
                title="Simulate government cell broadcast / flash SMS"
              >
                <Radio className="w-3.5 h-3.5" />
                <span>Simulate Cell SMS</span>
              </button>

              <button
                onClick={handleCopyClipboard}
                className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-semibold transition flex items-center justify-center gap-1.5 cursor-pointer border border-slate-700"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied!' : 'Copy Alert Text'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Simulated Smartphone Emergency SMS Pop-up Modal */}
      {showMockSmsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 border-2 border-slate-700 max-w-sm w-full rounded-3xl shadow-2xl overflow-hidden flex flex-col">
            {/* Phone Top Notch */}
            <div className="h-6 bg-slate-950 flex items-center justify-center relative">
              <div className="w-24 h-3.5 bg-slate-900 rounded-b-xl flex items-center justify-center">
                <div className="w-2.5 h-2.5 rounded-full bg-slate-800 mr-2" />
                <div className="w-6 h-1 rounded-full bg-slate-800" />
              </div>
            </div>

            {/* Phone Screen Header */}
            <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-rose-600 flex items-center justify-center text-white font-bold text-xs">
                  🚨
                </div>
                <div>
                  <div className="text-xs font-bold text-white">GOVT OF INDIA / NDMA</div>
                  <div className="text-[10px] text-slate-400 font-mono">Emergency Alert System • Flash SMS</div>
                </div>
              </div>
              <button
                onClick={() => setShowMockSmsModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Phone Notification Content */}
            <div className="p-5 space-y-4 bg-slate-900/90 text-left">
              {/* Delivery Receipt Telemetry */}
              <div className="flex items-center justify-between text-[11px] font-mono bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                <span className="text-slate-400">TARGET MSISDN:</span>
                <span className="text-cyan-300 font-bold">+91 {phoneNumber}</span>
              </div>

              <div className="p-3.5 bg-rose-950/40 border border-rose-500/70 rounded-2xl space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-rose-300">
                  <AlertTriangle className="w-4 h-4 text-rose-400 animate-pulse" />
                  <span>FLASH EMERGENCY FLOOD BROADCAST</span>
                </div>
                <p className="text-xs text-slate-100 font-sans leading-relaxed">
                  <strong>URGENT FLOOD EVASION ADVISORY:</strong> Andheri Subway will reach impassable water depth (58 cm) in 25 min due to convective storm cells & drain surcharge.
                </p>
                <p className="text-xs text-emerald-300 font-sans leading-relaxed font-semibold">
                  ➜ <strong>Action:</strong> Depart immediately via Western Express Highway Flyover corridor. All vehicles remain safe.
                </p>
              </div>

              {/* Status Badge */}
              <div className="flex items-center justify-center gap-2 pt-1 font-mono text-xs">
                {smsDeliveryStatus === 'sending' ? (
                  <div className="flex items-center gap-2 text-amber-300">
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
                    <span>Transmitting to Cellular Towers (C-DoT Gateway)...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-emerald-400 font-bold bg-emerald-950/80 px-3 py-1.5 rounded-xl border border-emerald-600">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>DELIVERED TO +91 {phoneNumber} (DELIVERY ACK: 200 OK)</span>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Bottom Button */}
            <div className="p-4 bg-slate-950 border-t border-slate-800">
              <button
                onClick={() => setShowMockSmsModal(false)}
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs transition cursor-pointer"
              >
                Acknowledge Alert
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
