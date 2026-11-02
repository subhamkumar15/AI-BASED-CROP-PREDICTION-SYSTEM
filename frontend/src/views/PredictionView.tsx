import React, { useState, useEffect } from 'react';
import { 
  Sprout, 
  Sparkles, 
  RefreshCw, 
  RotateCcw, 
  MapPin, 
  DollarSign, 
  TrendingUp, 
  Calendar, 
  Download, 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight,
  Droplets,
  CloudSun,
  FlaskConical,
  HelpCircle
} from 'lucide-react';
import { 
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  ResponsiveContainer 
} from 'recharts';
import confetti from 'canvas-confetti';
import { predictApi, weatherApi, historyApi } from '../services/api';
import { useModal } from '../context/ModalContext';

interface PredictionViewProps {
  initialFormData?: any;
}

export const PredictionView: React.FC<PredictionViewProps> = ({ initialFormData }) => {
  const { showModal } = useModal();

  // Form State
  const [formData, setFormData] = useState<any>({
    location_name: 'Farm Field Block A',
    state: 'Punjab',
    district: 'Ludhiana',
    season: 'Kharif',
    soil_type: 'alluvial',
    N: 85,
    P: 45,
    K: 40,
    temperature: 27.5,
    humidity: 80,
    ph: 6.5,
    rainfall: 200,
    soil_moisture: 65,
    solar_radiation: 6.2,
    wind_speed: 7.0,
    latitude: 30.9010,
    longitude: 75.8573
  });

  const [isLoading, setIsLoading] = useState(false);
  const [syncingWeather, setSyncingWeather] = useState(false);
  const [predictionResult, setPredictionResult] = useState<any>(null);
  const [presets, setPresets] = useState<any[]>([]);

  // Update from props if preset was selected from Dashboard
  useEffect(() => {
    if (initialFormData) {
      setFormData((prev: any) => ({ ...prev, ...initialFormData }));
    }
  }, [initialFormData]);

  useEffect(() => {
    predictApi.getPresets().then(setPresets).catch(() => {});
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const numFields = ['N', 'P', 'K', 'temperature', 'humidity', 'ph', 'rainfall', 'soil_moisture', 'solar_radiation', 'wind_speed', 'latitude', 'longitude'];
    setFormData((prev: any) => ({
      ...prev,
      [name]: numFields.includes(name) ? parseFloat(value) || 0 : value
    }));
  };

  const handlePresetSelect = (presetId: string) => {
    const found = presets.find((p) => p.id === presetId);
    if (found) {
      setFormData((prev: any) => ({ ...prev, ...found.data }));
    }
  };

  const handleSyncLiveWeather = async () => {
    setSyncingWeather(true);
    try {
      const data = await weatherApi.getLiveWeather(formData.latitude, formData.longitude, formData.district);
      if (data?.current) {
        setFormData((prev: any) => ({
          ...prev,
          temperature: data.current.temperature,
          humidity: data.current.humidity,
          rainfall: data.current.rainfall_mm > 0 ? data.current.rainfall_mm : prev.rainfall,
          wind_speed: data.current.wind_speed_kmh
        }));
        showModal({
          title: 'Live Weather Synced',
          message: `Updated local conditions from Open-Meteo for ${formData.district || 'farm'}: ${data.current.temperature}°C, ${data.current.humidity}% humidity.`,
          type: 'success'
        });
      }
    } catch {
      showModal({
        title: 'Weather Sync Notice',
        message: 'Could not reach live weather server. Kept current agronomic parameters.',
        type: 'warning'
      });
    } finally {
      setSyncingWeather(false);
    }
  };

  const handleReset = () => {
    setFormData({
      location_name: 'Farm Field Block A',
      state: 'Punjab',
      district: 'Ludhiana',
      season: 'Kharif',
      soil_type: 'alluvial',
      N: 85,
      P: 45,
      K: 40,
      temperature: 27.5,
      humidity: 80,
      ph: 6.5,
      rainfall: 200,
      soil_moisture: 65,
      solar_radiation: 6.2,
      wind_speed: 7.0,
      latitude: 30.9010,
      longitude: 75.8573
    });
    setPredictionResult(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await predictApi.recommend(formData);
      setPredictionResult(result);

      // Trigger celebratory confetti
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 }
      });
    } catch (err: any) {
      showModal({
        title: 'Prediction Error',
        message: err.response?.data?.detail || 'Inference engine failed to compute recommendation.',
        type: 'warning'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Top Presets & Weather Quick Action Bar */}
      <div className="bg-white rounded-3xl p-4 lg:p-6 border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-brand-50 text-brand-700 flex items-center justify-center font-bold">
            <Sprout size={20} />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Farm Simulation Engine</h3>
            <p className="text-xs text-slate-500">Benchmark presets & automated meteorological ingestion</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <select
            onChange={(e) => handlePresetSelect(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 text-slate-700 font-semibold rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-brand-500/20"
          >
            <option value="">-- Load Regional Preset --</option>
            {presets.map((p) => (
              <option key={p.id} value={p.id}>{p.title}</option>
            ))}
          </select>

          <button
            type="button"
            onClick={handleSyncLiveWeather}
            disabled={syncingWeather}
            className="px-3.5 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
          >
            <CloudSun size={14} className={syncingWeather ? 'animate-spin' : ''} />
            <span>{syncingWeather ? 'Syncing...' : 'Sync Live Weather'}</span>
          </button>

          <button
            type="button"
            onClick={handleReset}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-bold flex items-center gap-1 transition-colors"
          >
            <RotateCcw size={13} />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 lg:p-8 border border-slate-200/80 shadow-sm space-y-8">
        {/* Section 1: Geographical & Environmental Context */}
        <div>
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 mb-5">
            <MapPin size={18} className="text-brand-600" />
            <h3 className="font-extrabold text-slate-900 text-sm uppercase tracking-wider">
              1. Geographic & Seasonal Horizon
            </h3>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Field / Location Name</label>
              <input
                type="text"
                name="location_name"
                value={formData.location_name}
                onChange={handleInputChange}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">State / Province</label>
              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleInputChange}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">District / Tehsil</label>
              <input
                type="text"
                name="district"
                value={formData.district}
                onChange={handleInputChange}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Cropping Season</label>
              <select
                name="season"
                value={formData.season}
                onChange={handleInputChange}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none font-medium"
              >
                <option value="Kharif">Kharif (Monsoon / Autumn)</option>
                <option value="Rabi">Rabi (Winter / Spring)</option>
                <option value="Zaid">Zaid (Summer)</option>
                <option value="Whole Year">Whole Year (Perennial)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 2: Soil Chemistry & Nutrients */}
        <div>
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 mb-5">
            <FlaskConical size={18} className="text-emerald-600" />
            <h3 className="font-extrabold text-slate-900 text-sm uppercase tracking-wider">
              2. Soil Chemistry & Macronutrients (NPK)
            </h3>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-bold text-slate-600 uppercase">Nitrogen (N)</label>
                <span className="text-[10px] font-semibold text-slate-400">0 - 250 kg/ha</span>
              </div>
              <input
                type="number"
                name="N"
                min="0"
                max="250"
                value={formData.N}
                onChange={handleInputChange}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none font-semibold text-slate-800"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-bold text-slate-600 uppercase">Phosphorus (P)</label>
                <span className="text-[10px] font-semibold text-slate-400">0 - 250 kg/ha</span>
              </div>
              <input
                type="number"
                name="P"
                min="0"
                max="250"
                value={formData.P}
                onChange={handleInputChange}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none font-semibold text-slate-800"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-bold text-slate-600 uppercase">Potassium (K)</label>
                <span className="text-[10px] font-semibold text-slate-400">0 - 300 kg/ha</span>
              </div>
              <input
                type="number"
                name="K"
                min="0"
                max="300"
                value={formData.K}
                onChange={handleInputChange}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none font-semibold text-slate-800"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-bold text-slate-600 uppercase">Soil pH Value</label>
                <span className="text-[10px] font-semibold text-slate-400">3.5 - 9.5</span>
              </div>
              <input
                type="number"
                step="0.1"
                name="ph"
                min="3.0"
                max="10.0"
                value={formData.ph}
                onChange={handleInputChange}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none font-semibold text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Primary Soil Texture</label>
              <select
                name="soil_type"
                value={formData.soil_type}
                onChange={handleInputChange}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none font-medium"
              >
                <option value="alluvial">Alluvial Loam (Indo-Gangetic)</option>
                <option value="black">Black Cotton Soil (Regur)</option>
                <option value="loam">Standard Productive Loam</option>
                <option value="clayey">Clayey / Deep Heavy Clay</option>
                <option value="clay loam">Clay Loam</option>
                <option value="sandy loam">Sandy Loam</option>
                <option value="red loam">Red Laterite / Red Loam</option>
                <option value="mountain loam">Mountain Forest Loam</option>
                <option value="coastal sandy">Coastal Sand</option>
              </select>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-bold text-slate-600 uppercase">Soil Moisture (%)</label>
                <span className="text-[10px] font-semibold text-slate-400">15 - 95%</span>
              </div>
              <input
                type="number"
                name="soil_moisture"
                min="10"
                max="100"
                value={formData.soil_moisture}
                onChange={handleInputChange}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none font-semibold text-slate-800"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Weather & Meteorological Readings */}
        <div>
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 mb-5">
            <CloudSun size={18} className="text-sky-600" />
            <h3 className="font-extrabold text-slate-900 text-sm uppercase tracking-wider">
              3. Meteorological Readings & Climate Factors
            </h3>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-bold text-slate-600 uppercase">Temperature (°C)</label>
                <span className="text-[10px] font-semibold text-slate-400">5 - 50 °C</span>
              </div>
              <input
                type="number"
                step="0.5"
                name="temperature"
                value={formData.temperature}
                onChange={handleInputChange}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none font-semibold text-slate-800"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-bold text-slate-600 uppercase">Relative Humidity (%)</label>
                <span className="text-[10px] font-semibold text-slate-400">10 - 100%</span>
              </div>
              <input
                type="number"
                name="humidity"
                min="10"
                max="100"
                value={formData.humidity}
                onChange={handleInputChange}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none font-semibold text-slate-800"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-bold text-slate-600 uppercase">Rainfall (mm)</label>
                <span className="text-[10px] font-semibold text-slate-400">0 - 500 mm</span>
              </div>
              <input
                type="number"
                name="rainfall"
                min="0"
                max="800"
                value={formData.rainfall}
                onChange={handleInputChange}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none font-semibold text-slate-800"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-bold text-slate-600 uppercase">Solar Radiation</label>
                <span className="text-[10px] font-semibold text-slate-400">kWh/m²/day</span>
              </div>
              <input
                type="number"
                step="0.1"
                name="solar_radiation"
                value={formData.solar_radiation}
                onChange={handleInputChange}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none font-semibold text-slate-800"
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-4 border-t border-slate-100 flex justify-end">
          <button
            type="submit"
            disabled={isLoading}
            className="px-8 py-3.5 bg-gradient-to-r from-brand-600 to-emerald-600 hover:from-brand-700 hover:to-emerald-700 text-white rounded-2xl font-extrabold text-sm tracking-wide shadow-xl shadow-brand-500/25 flex items-center gap-2.5 transition-all hover:scale-[1.01] active:scale-95 disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <RefreshCw size={18} className="animate-spin" />
                <span>Computing Agronomic Suitability...</span>
              </>
            ) : (
              <>
                <Sprout size={18} />
                <span>Execute Crop Recommendation</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </div>
      </form>

      {/* AI Recommendation Results Section */}
      {predictionResult && (
        <div className="space-y-6 animate-fade-in-up">
          {/* Champion Banner */}
          <div className="bg-gradient-to-r from-emerald-900 via-slate-900 to-forest-900 rounded-3xl p-6 lg:p-8 text-white border border-emerald-500/30 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 px-2.5 py-0.5 rounded-full">
                    Champion Recommendation
                  </span>
                  <span className="text-[10px] font-medium text-slate-400">
                    Engine: {predictionResult.model_name} ({predictionResult.model_version})
                  </span>
                </div>
                <h2 className="text-3xl lg:text-4xl font-black text-white tracking-tight">
                  {predictionResult.display_name}
                </h2>
                <p className="text-slate-300 text-xs mt-1">
                  Category: <b className="text-emerald-400">{predictionResult.category}</b> • Growth Duration: <b className="text-white">{predictionResult.agronomic_advisory.duration_days} days</b>
                </p>
              </div>

              {/* Suitability & Confidence Pills */}
              <div className="flex items-center gap-4">
                <div className="bg-white/10 rounded-2xl p-4 border border-white/10 backdrop-blur-sm text-center min-w-[130px]">
                  <span className="text-[10px] uppercase font-extrabold text-emerald-300 tracking-wider">Agronomic Suitability</span>
                  <div className="text-3xl font-black text-white mt-0.5">{predictionResult.suitability_score}%</div>
                </div>

                <div className="bg-white/10 rounded-2xl p-4 border border-white/10 backdrop-blur-sm text-center min-w-[130px]">
                  <span className="text-[10px] uppercase font-extrabold text-blue-300 tracking-wider">Statistical Confidence</span>
                  <div className="text-3xl font-black text-white mt-0.5">{predictionResult.model_confidence}%</div>
                </div>

                {predictionResult.prediction_id && (
                  <a
                    href={historyApi.downloadPDFUrl(predictionResult.prediction_id)}
                    target="_blank"
                    rel="noreferrer"
                    className="p-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-2xl text-xs flex flex-col items-center justify-center gap-1 shadow-lg shadow-emerald-500/30 transition-all hover:scale-105"
                  >
                    <Download size={20} />
                    <span>Download PDF</span>
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* 2-Column Results Analysis Grid */}
          <div className="grid lg:grid-cols-12 gap-6">
            {/* Left Column: Radar Comparison & Key Drivers */}
            <div className="lg:col-span-6 space-y-6">
              {/* Radar Chart Card */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-slate-900 text-sm">Farm vs Crop Requirements Radar</h3>
                  <span className="text-[11px] font-semibold text-slate-500">Multivariate Balance</span>
                </div>
                <p className="text-xs text-slate-500 mb-4">
                  Current farm measurements plotted against ideal agronomic parameters for {predictionResult.display_name}.
                </p>

                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="75%" data={predictionResult.radar_data}>
                      <PolarGrid stroke="#e2e8f0" />
                      <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 11 }} />
                      <PolarRadiusAxis angle={30} domain={[0, 'auto']} stroke="#cbd5e1" />
                      <Radar name="Your Farm" dataKey="farm" stroke="#10b981" fill="#10b981" fillOpacity={0.4} />
                      <Radar name="Optimal Crop Norm" dataKey="optimal" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>

                <div className="flex items-center justify-center gap-6 mt-2 text-xs font-semibold">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-emerald-500" />
                    <span className="text-slate-700">Your Farm Value</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-blue-500" />
                    <span className="text-slate-700">Optimal Agronomic Range</span>
                  </div>
                </div>
              </div>

              {/* Agronomic Key Drivers */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm">
                <h3 className="font-bold text-slate-900 text-sm mb-3">Model Attribution & Explainability</h3>
                <div className="space-y-2.5">
                  {predictionResult.key_drivers.map((driver: string, idx: number) => (
                    <div key={idx} className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-100 text-xs text-emerald-900 font-medium flex items-start gap-2.5">
                      <CheckCircle2 size={16} className="text-emerald-600 flex-shrink-0 mt-0.5" />
                      <span>{driver}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: Economics & Top 5 Alternatives */}
            <div className="lg:col-span-6 space-y-6">
              {/* Financial Returns Card */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm">
                <h3 className="font-bold text-slate-900 text-sm mb-1">Projected Acre Economics & ROI</h3>
                <p className="text-xs text-slate-500 mb-4">Calculated from Directorate of Economics MSP & local mandi trends</p>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                    <span className="text-[10px] font-bold uppercase text-slate-400">Expected Yield</span>
                    <p className="text-base font-extrabold text-slate-900 mt-0.5">
                      {predictionResult.economics.base_yield_quintal_acre} <span className="text-xs font-normal">q/acre</span>
                    </p>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                    <span className="text-[10px] font-bold uppercase text-slate-400">Market Price</span>
                    <p className="text-base font-extrabold text-slate-900 mt-0.5">
                      ₹{predictionResult.economics.market_price_quintal.toLocaleString()} <span className="text-xs font-normal">/q</span>
                    </p>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                    <span className="text-[10px] font-bold uppercase text-slate-400">Cultivation Cost</span>
                    <p className="text-base font-extrabold text-slate-900 mt-0.5">
                      ₹{predictionResult.economics.cost_per_acre.toLocaleString()}
                    </p>
                  </div>

                  <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 col-span-2 sm:col-span-1">
                    <span className="text-[10px] font-bold uppercase text-emerald-700">Gross Revenue</span>
                    <p className="text-base font-black text-emerald-950 mt-0.5">
                      ₹{predictionResult.economics.gross_revenue.toLocaleString()}
                    </p>
                  </div>

                  <div className="p-3 bg-emerald-600 text-white rounded-2xl col-span-2">
                    <span className="text-[10px] font-bold uppercase text-emerald-100">Net Profit / Projected ROI</span>
                    <div className="flex items-baseline justify-between mt-0.5">
                      <span className="text-lg font-black">₹{predictionResult.economics.net_profit.toLocaleString()}</span>
                      <span className="text-sm font-bold bg-white/20 px-2 py-0.5 rounded-lg">+{predictionResult.economics.roi_percent}% ROI</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Top 5 Alternatives Table */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm">
                <h3 className="font-bold text-slate-900 text-sm mb-3">Top 5 Viable Alternative Crops</h3>
                <div className="space-y-2">
                  {predictionResult.top_alternatives.map((alt: any, idx: number) => (
                    <div key={idx} className="p-3 rounded-2xl bg-slate-50 hover:bg-slate-100/80 border border-slate-200/80 flex items-center justify-between text-xs transition-colors">
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-[11px]">
                          #{idx + 1}
                        </span>
                        <div>
                          <div className="font-bold text-slate-900">{alt.display_name}</div>
                          <span className="text-[10px] text-slate-500">{alt.category} • {alt.duration_days} days</span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="font-extrabold text-emerald-600">{alt.suitability_score}% Match</span>
                        <div className="text-[10px] text-slate-400">₹{alt.market_price}/q</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Agronomic Advisories */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm grid md:grid-cols-2 gap-6">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-xs font-bold text-slate-900 flex items-center gap-2 mb-2">
                <Sprout size={16} className="text-emerald-600" />
                Fertilizer Scheduling (NPK)
              </span>
              <p className="text-xs text-slate-600 leading-relaxed">
                {predictionResult.agronomic_advisory.fertilizer_guidance}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-xs font-bold text-slate-900 flex items-center gap-2 mb-2">
                <Droplets size={16} className="text-blue-600" />
                Irrigation & Water Management
              </span>
              <p className="text-xs text-slate-600 leading-relaxed">
                {predictionResult.agronomic_advisory.irrigation_guidance}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
