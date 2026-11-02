import React, { useState, useEffect } from 'react';
import { CloudSun, Droplets, Wind, Thermometer, ShieldAlert, ChevronRight, RefreshCw } from 'lucide-react';
import { weatherApi } from '../services/api';

export const WeatherWidget: React.FC<{ onExplore?: () => void }> = ({ onExplore }) => {
  const [weatherData, setWeatherData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchWeather = async () => {
    setLoading(true);
    try {
      const data = await weatherApi.getLiveWeather(30.9010, 75.8573, 'Ludhiana, Punjab');
      setWeatherData(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather();
  }, []);

  const curr = weatherData?.current || {
    temperature: 29.5,
    humidity: 64,
    rainfall_mm: 0.0,
    wind_speed_kmh: 8.5,
    weather_condition: 'Mainly Clear'
  };

  const risks = weatherData?.climate_risks || {
    heatwave: { level: 'Low Risk', score: 15 },
    drought: { level: 'Adequate Moisture', score: 18 },
    flood: { level: 'Low Inundation Risk', score: 10 }
  };

  return (
    <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-sky-700 rounded-3xl p-6 text-white shadow-xl shadow-blue-500/15 relative overflow-hidden flex flex-col justify-between transition-transform duration-300 hover:shadow-2xl">
      {/* Background ambient lighting */}
      <div className="absolute -top-12 -right-12 w-44 h-44 bg-white/10 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -bottom-12 -left-12 w-40 h-40 bg-sky-400/20 rounded-full blur-2xl pointer-events-none" />

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between mb-4">
        <div>
          <span className="text-[10px] font-bold tracking-wider uppercase text-blue-200 bg-white/10 px-2.5 py-0.5 rounded-full border border-white/10">
            Open-Meteo Live Agro-Climatology
          </span>
          <h3 className="text-xl font-bold mt-1 tracking-tight flex items-center gap-2">
            <span>{weatherData?.location || 'Ludhiana, Punjab'}</span>
          </h3>
        </div>
        <button
          onClick={fetchWeather}
          disabled={loading}
          className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors text-white"
          title="Refresh Meteorological Readings"
        >
          <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Main Temperature & Condition Display */}
      <div className="relative z-10 flex items-center justify-between my-2">
        <div className="flex items-baseline gap-2">
          <span className="text-5xl font-extrabold tracking-tight font-sans">{curr.temperature}</span>
          <span className="text-2xl font-light text-blue-200">°C</span>
        </div>
        <div className="text-right">
          <div className="flex items-center justify-end gap-1.5 text-amber-300 font-bold text-sm">
            <CloudSun size={20} />
            <span>{curr.weather_condition}</span>
          </div>
          <span className="text-[11px] text-blue-200">Precipitation: {curr.rainfall_mm} mm</span>
        </div>
      </div>

      {/* Quick Metrics Grid */}
      <div className="relative z-10 grid grid-cols-3 gap-2 my-4 pt-3 border-t border-white/15">
        <div className="bg-white/10 rounded-xl p-2.5 backdrop-blur-sm">
          <div className="flex items-center gap-1.5 text-blue-200 text-[10px] font-bold uppercase">
            <Droplets size={12} />
            <span>Humidity</span>
          </div>
          <p className="text-base font-bold mt-0.5">{curr.humidity}%</p>
        </div>

        <div className="bg-white/10 rounded-xl p-2.5 backdrop-blur-sm">
          <div className="flex items-center gap-1.5 text-blue-200 text-[10px] font-bold uppercase">
            <Wind size={12} />
            <span>Wind</span>
          </div>
          <p className="text-base font-bold mt-0.5">{curr.wind_speed_kmh} <span className="text-[10px] font-normal">km/h</span></p>
        </div>

        <div className="bg-white/10 rounded-xl p-2.5 backdrop-blur-sm">
          <div className="flex items-center gap-1.5 text-blue-200 text-[10px] font-bold uppercase">
            <ShieldAlert size={12} />
            <span>Heat Stress</span>
          </div>
          <p className="text-base font-bold mt-0.5">{risks.heatwave.score}%</p>
        </div>
      </div>

      {/* Action Footer */}
      {onExplore && (
        <button
          onClick={onExplore}
          className="relative z-10 w-full py-2.5 bg-white/15 hover:bg-white/25 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 backdrop-blur-sm"
        >
          <span>View 7-Day Meteorological Forecast</span>
          <ChevronRight size={14} />
        </button>
      )}
    </div>
  );
};
