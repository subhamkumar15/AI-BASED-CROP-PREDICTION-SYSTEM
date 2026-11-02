import React, { useState, useEffect } from 'react';
import { 
  FlaskConical, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight, 
  RotateCcw,
  Layers,
  Activity
} from 'lucide-react';
import { soilApi } from '../services/api';

export const SoilHealthView: React.FC = () => {
  const [params, setParams] = useState({
    N: 75,
    P: 45,
    K: 40,
    ph: 6.5,
    soil_moisture: 50,
    organic_carbon: 0.65,
    electrical_conductivity: 0.8,
    soil_type: 'loam'
  });

  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const runAnalysis = async () => {
    setLoading(true);
    try {
      const data = await soilApi.analyzeSoil(params);
      setAnalysis(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runAnalysis();
  }, [params]);

  const handleSliderChange = (field: string, val: number) => {
    setParams((prev) => ({ ...prev, [field]: val }));
  };

  const applyPreset = (type: string) => {
    if (type === 'acidic') {
      setParams({ N: 50, P: 20, K: 30, ph: 4.8, soil_moisture: 60, organic_carbon: 0.45, electrical_conductivity: 0.5, soil_type: 'red loam' });
    } else if (type === 'alkaline') {
      setParams({ N: 90, P: 35, K: 60, ph: 8.6, soil_moisture: 35, organic_carbon: 0.35, electrical_conductivity: 2.1, soil_type: 'black' });
    } else if (type === 'fertile') {
      setParams({ N: 95, P: 55, K: 50, ph: 6.8, soil_moisture: 65, organic_carbon: 0.85, electrical_conductivity: 0.7, soil_type: 'alluvial' });
    }
  };

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Top Presets Selector */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div>
          <h3 className="font-bold text-slate-900 text-sm">Interactive Soil Simulation Lab</h3>
          <p className="text-xs text-slate-500">Test agronomic scenarios against ICAR Soil Health Card standards</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-slate-400 mr-1">Load Profile:</span>
          <button
            onClick={() => applyPreset('acidic')}
            className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-xl transition-colors border border-rose-200"
          >
            Acidic Soil (pH 4.8)
          </button>
          <button
            onClick={() => applyPreset('alkaline')}
            className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 text-xs font-bold rounded-xl transition-colors border border-amber-200"
          >
            Alkaline / Saline (pH 8.6)
          </button>
          <button
            onClick={() => applyPreset('fertile')}
            className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold rounded-xl transition-colors border border-emerald-200"
          >
            Prime Balanced Loam
          </button>
        </div>
      </div>

      {/* 2-Column Lab Layout */}
      <div className="grid lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive Controls */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <FlaskConical size={18} className="text-emerald-600" />
            <h3 className="font-extrabold text-slate-900 text-sm uppercase tracking-wider">
              Soil Test Parameters
            </h3>
          </div>

          {/* Nitrogen Slider */}
          <div>
            <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
              <span>Nitrogen (N)</span>
              <span className="text-emerald-600 font-extrabold">{params.N} kg/ha</span>
            </div>
            <input
              type="range"
              min="10"
              max="200"
              value={params.N}
              onChange={(e) => handleSliderChange('N', parseFloat(e.target.value))}
              className="w-full accent-emerald-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
              <span>10 (Deficient)</span>
              <span>100 (Optimal)</span>
              <span>200 (Excess)</span>
            </div>
          </div>

          {/* Phosphorus Slider */}
          <div>
            <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
              <span>Phosphorus (P)</span>
              <span className="text-blue-600 font-extrabold">{params.P} kg/ha</span>
            </div>
            <input
              type="range"
              min="5"
              max="150"
              value={params.P}
              onChange={(e) => handleSliderChange('P', parseFloat(e.target.value))}
              className="w-full accent-blue-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
              <span>5 (Deficient)</span>
              <span>50 (Optimal)</span>
              <span>150 (High)</span>
            </div>
          </div>

          {/* Potassium Slider */}
          <div>
            <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
              <span>Potassium (K)</span>
              <span className="text-amber-600 font-extrabold">{params.K} kg/ha</span>
            </div>
            <input
              type="range"
              min="10"
              max="200"
              value={params.K}
              onChange={(e) => handleSliderChange('K', parseFloat(e.target.value))}
              className="w-full accent-amber-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
              <span>10 (Low)</span>
              <span>60 (Optimal)</span>
              <span>200 (High)</span>
            </div>
          </div>

          {/* pH Slider */}
          <div>
            <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
              <span>Soil pH Reaction</span>
              <span className="text-purple-600 font-extrabold">{params.ph}</span>
            </div>
            <input
              type="range"
              min="4.0"
              max="9.5"
              step="0.1"
              value={params.ph}
              onChange={(e) => handleSliderChange('ph', parseFloat(e.target.value))}
              className="w-full accent-purple-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
              <span>4.0 (Acidic)</span>
              <span>6.5 (Neutral)</span>
              <span>9.5 (Alkaline)</span>
            </div>
          </div>

          {/* Moisture Slider */}
          <div>
            <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
              <span>Soil Moisture (%)</span>
              <span className="text-sky-600 font-extrabold">{params.soil_moisture}%</span>
            </div>
            <input
              type="range"
              min="10"
              max="90"
              value={params.soil_moisture}
              onChange={(e) => handleSliderChange('soil_moisture', parseFloat(e.target.value))}
              className="w-full accent-sky-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
              <span>10% (Dry)</span>
              <span>55% (Aerated)</span>
              <span>90% (Saturated)</span>
            </div>
          </div>
        </div>

        {/* Right Column: Diagnosis & Recommendations */}
        <div className="lg:col-span-7 space-y-6">
          {analysis && (
            <>
              {/* Overall Health Score Card */}
              <div className="bg-gradient-to-r from-emerald-900 to-forest-900 rounded-3xl p-6 text-white shadow-xl flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">Diagnostic Evaluation</span>
                  <h3 className="text-2xl font-black mt-1">{analysis.health_grade}</h3>
                  <p className="text-xs text-slate-300 mt-1">Based on ICAR soil fertility index classification</p>
                </div>
                <div className="text-right">
                  <div className="text-4xl font-black text-emerald-400">{analysis.overall_health_score}%</div>
                  <span className="text-[11px] text-emerald-200">Health Index</span>
                </div>
              </div>

              {/* Status Breakdown Grid */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm">
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500 mb-4">
                  Parameter Diagnostic Status
                </h4>
                <div className="grid sm:grid-cols-2 gap-3">
                  {Object.entries(analysis.parameters || {}).map(([key, val]: [string, any]) => (
                    <div key={key} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-slate-900">{key}</span>
                        <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                          val.status.includes('Optimal') ? 'bg-emerald-100 text-emerald-700' :
                          val.status.includes('Deficient') || val.status.includes('Acidic') || val.status.includes('Alkaline') ? 'bg-rose-100 text-rose-700' :
                          'bg-amber-100 text-amber-700'
                        }`}>
                          {val.status}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 mt-1.5 leading-relaxed">
                        {val.recommendation}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actionable Fertilizers & Amendments */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
                <div>
                  <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500 mb-2">
                    Fertilizer Scheduling (NPK Replenishment)
                  </h4>
                  <ul className="space-y-2">
                    {analysis.fertilizer_recommendations.map((rec: string, i: number) => (
                      <li key={i} className="text-xs text-slate-700 bg-emerald-50/70 p-3 rounded-xl border border-emerald-100 flex items-start gap-2">
                        <CheckCircle2 size={16} className="text-emerald-600 flex-shrink-0 mt-0.5" />
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500 mb-2">
                    Chemical & Organic Soil Amendments
                  </h4>
                  <ul className="space-y-2">
                    {analysis.amendment_guidance.map((amend: string, i: number) => (
                      <li key={i} className="text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-start gap-2">
                        <CheckCircle2 size={16} className="text-brand-600 flex-shrink-0 mt-0.5" />
                        <span>{amend}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
