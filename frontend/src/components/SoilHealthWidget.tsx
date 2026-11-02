import React, { useState } from 'react';
import { FlaskConical, RefreshCw, CheckCircle2, ChevronRight, Activity } from 'lucide-react';

export const SoilHealthWidget: React.FC<{ onExplore?: () => void }> = ({ onExplore }) => {
  const [testing, setTesting] = useState(false);
  const [soilMetrics, setSoilMetrics] = useState({
    n: 82,
    p: 48,
    k: 44,
    ph: 6.6,
    healthScore: 92
  });

  const runQuickTest = () => {
    setTesting(true);
    setTimeout(() => {
      setSoilMetrics({
        n: Math.floor(Math.random() * 20) + 75,
        p: Math.floor(Math.random() * 15) + 40,
        k: Math.floor(Math.random() * 20) + 35,
        ph: Number((Math.random() * 0.8 + 6.2).toFixed(1)),
        healthScore: Math.floor(Math.random() * 8) + 88
      });
      setTesting(false);
    }, 1000);
  };

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm relative overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <FlaskConical size={18} />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 tracking-tight text-sm">Real-time Soil Vigor Index</h3>
            <span className="text-[11px] text-slate-500">ICAR Standard Benchmark</span>
          </div>
        </div>

        <button
          onClick={runQuickTest}
          disabled={testing}
          className="text-xs text-brand-600 hover:text-brand-700 bg-brand-50 hover:bg-brand-100 px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-colors"
        >
          <RefreshCw size={12} className={testing ? 'animate-spin' : ''} />
          <span>{testing ? 'Sampling...' : 'Sample Soil'}</span>
        </button>
      </div>

      {/* Main Score Chip */}
      <div className="my-2 p-3.5 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100 flex items-center justify-between">
        <div>
          <span className="text-[10px] uppercase font-extrabold text-emerald-700 tracking-wider">Health Rating</span>
          <div className="text-2xl font-black text-emerald-950">{soilMetrics.healthScore}% <span className="text-xs font-semibold text-emerald-600">Optimal</span></div>
        </div>
        <div className="text-right">
          <span className="text-[10px] uppercase font-extrabold text-slate-500 tracking-wider">Reaction pH</span>
          <div className="text-xl font-bold text-slate-800">{soilMetrics.ph} <span className="text-xs font-normal text-slate-500">(Neutral)</span></div>
        </div>
      </div>

      {/* NPK Progress Indicators */}
      <div className="space-y-2.5 my-2">
        <div>
          <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              Nitrogen (N)
            </span>
            <span className="text-slate-900 font-bold">{soilMetrics.n} <span className="text-[10px] text-slate-400 font-normal">kg/ha</span></span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div className="bg-emerald-500 h-full rounded-full transition-all duration-500" style={{ width: `${Math.min(100, (soilMetrics.n / 120) * 100)}%` }} />
          </div>
        </div>

        <div>
          <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              Phosphorus (P)
            </span>
            <span className="text-slate-900 font-bold">{soilMetrics.p} <span className="text-[10px] text-slate-400 font-normal">kg/ha</span></span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div className="bg-blue-500 h-full rounded-full transition-all duration-500" style={{ width: `${Math.min(100, (soilMetrics.p / 80) * 100)}%` }} />
          </div>
        </div>

        <div>
          <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              Potassium (K)
            </span>
            <span className="text-slate-900 font-bold">{soilMetrics.k} <span className="text-[10px] text-slate-400 font-normal">kg/ha</span></span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div className="bg-amber-500 h-full rounded-full transition-all duration-500" style={{ width: `${Math.min(100, (soilMetrics.k / 70) * 100)}%` }} />
          </div>
        </div>
      </div>

      {/* Footer */}
      {onExplore && (
        <button
          onClick={onExplore}
          className="mt-2 w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1"
        >
          <span>Open Full Soil Chemistry Lab</span>
          <ChevronRight size={14} />
        </button>
      )}
    </div>
  );
};
