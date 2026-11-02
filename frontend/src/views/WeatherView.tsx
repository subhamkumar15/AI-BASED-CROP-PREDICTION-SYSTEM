import React, { useState, useEffect } from 'react';
import { 
  CloudSun, 
  Search, 
  MapPin, 
  Droplets, 
  Wind, 
  ThermometerSun, 
  ShieldAlert, 
  Calendar,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { weatherApi } from '../services/api';

export const WeatherView: React.FC = () => {
  const [selectedHub, setSelectedHub] = useState('Ludhiana, Punjab');
  const [lat, setLat] = useState(30.9010);
  const [lon, setLon] = useState(75.8573);
  const [searchQuery, setSearchQuery] = useState('');
  const [weatherData, setWeatherData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [regions, setRegions] = useState<any[]>([]);

  useEffect(() => {
    weatherApi.getRegions().then(setRegions).catch(() => {});
  }, []);

  const fetchWeather = async (latitude: number, longitude: number, name: string) => {
    setLoading(true);
    try {
      const data = await weatherApi.getLiveWeather(latitude, longitude, name);
      setWeatherData(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather(lat, lon, selectedHub);
  }, [lat, lon, selectedHub]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    try {
      const geo = await weatherApi.searchLocation(searchQuery.trim());
      if (geo) {
        setLat(geo.lat);
        setLon(geo.lon);
        setSelectedHub(geo.name);
      }
    } catch (err) {
      alert('Location not found.');
    }
  };

  const handleRegionChange = (regName: string) => {
    const found = regions.find((r) => r.name === regName);
    if (found) {
      setLat(found.lat);
      setLon(found.lon);
      setSelectedHub(found.name);
    }
  };

  const current = weatherData?.current || {
    temperature: 29.5,
    humidity: 64,
    rainfall_mm: 0.0,
    wind_speed_kmh: 8.5,
    weather_condition: 'Mainly Clear'
  };

  const forecast = weatherData?.forecast_7days || [];
  const risks = weatherData?.climate_risks || {
    heatwave: { level: 'Low Risk', score: 15 },
    drought: { level: 'Adequate Moisture', score: 18 },
    flood: { level: 'Low Inundation Risk', score: 10 },
    frost: { level: 'No Frost Risk', score: 5 }
  };
  const alerts = weatherData?.agricultural_alerts || [
    'Optimal weather for field spraying and fertilizer top-dressing.'
  ];

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Search and Region Picker Header */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4">
        <form onSubmit={handleSearch} className="flex-1 max-w-md relative">
          <Search size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search district, city or village..."
            className="w-full pl-10 pr-24 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
          />
          <button
            type="submit"
            className="absolute right-1.5 top-1.5 px-3 py-1.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold transition-colors"
          >
            Locate
          </button>
        </form>

        <div className="flex items-center gap-3">
          <select
            value={selectedHub}
            onChange={(e) => handleRegionChange(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 text-slate-800 font-semibold rounded-2xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-brand-500/20"
          >
            {regions.map((r) => (
              <option key={r.name} value={r.name}>{r.name}</option>
            ))}
          </select>

          <button
            onClick={() => fetchWeather(lat, lon, selectedHub)}
            disabled={loading}
            className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl transition-colors"
            title="Refresh Weather"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Hero Weather Banner */}
      <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-sky-700 rounded-3xl p-6 lg:p-8 text-white shadow-2xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-blue-200 text-xs font-bold uppercase tracking-wider mb-2 border border-white/10">
              <MapPin size={13} />
              {selectedHub}
            </div>
            <div className="flex items-baseline gap-3 my-1">
              <span className="text-6xl font-black">{current.temperature}°</span>
              <span className="text-2xl font-light text-blue-200">C</span>
              <span className="text-lg font-bold text-amber-300 ml-4 flex items-center gap-2">
                <CloudSun size={24} />
                {current.weather_condition}
              </span>
            </div>
            <p className="text-xs text-blue-100 mt-1">
              Relative Humidity: <b>{current.humidity}%</b> • Surface Wind: <b>{current.wind_speed_kmh} km/h</b> • Precipitation: <b>{current.rainfall_mm} mm</b>
            </p>
          </div>

          {/* Quick Hazards Matrix */}
          <div className="grid grid-cols-2 gap-3 w-full md:w-auto">
            <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10 text-center min-w-[120px]">
              <span className="text-[10px] font-bold text-blue-200 uppercase">Heatwave Hazard</span>
              <div className="text-lg font-black text-amber-300 mt-0.5">{risks.heatwave.level}</div>
            </div>
            <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10 text-center min-w-[120px]">
              <span className="text-[10px] font-bold text-blue-200 uppercase">Drought Hazard</span>
              <div className="text-lg font-black text-emerald-300 mt-0.5">{risks.drought.level}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Agricultural Advisories Banner */}
      <div className="p-5 rounded-3xl bg-amber-50 border border-amber-200/80 flex items-start gap-3">
        <AlertTriangle size={22} className="text-amber-600 flex-shrink-0 mt-0.5" />
        <div>
          <h4 className="font-bold text-xs text-amber-900 uppercase tracking-wider">Automated Agronomic Advisory</h4>
          <ul className="mt-1 space-y-1">
            {alerts.map((alert: string, idx: number) => (
              <li key={idx} className="text-xs text-amber-800 leading-relaxed">• {alert}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* 7-Day Forecast Grid */}
      <div>
        <h3 className="font-bold text-slate-900 text-base mb-4">7-Day Meteorological Outlook</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {forecast.map((day: any, idx: number) => (
            <div key={idx} className="bg-white rounded-2xl p-4 border border-slate-200 text-center shadow-sm hover:shadow-md transition-shadow">
              <span className="text-xs font-bold text-slate-500 uppercase">{day.day_name.slice(0, 3)}</span>
              <div className="text-[10px] text-slate-400 mb-2">{day.date.slice(5)}</div>
              <CloudSun size={24} className="mx-auto text-amber-500 my-1" />
              <div className="text-sm font-black text-slate-900 mt-2">
                {day.temp_max}° <span className="text-xs font-normal text-slate-400">{day.temp_min}°</span>
              </div>
              <div className="text-[10px] text-blue-600 font-semibold mt-1">
                {day.precipitation_sum} mm rain
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Temperature & Rainfall Trend Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm">
          <h3 className="font-bold text-slate-900 text-sm mb-1">Temperature Trajectory (°C)</h3>
          <p className="text-xs text-slate-500 mb-4">Max vs Min daily forecast</p>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={forecast}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="day_name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} domain={['dataMin - 2', 'dataMax + 2']} />
                <Tooltip />
                <Line type="monotone" dataKey="temp_max" stroke="#ef4444" strokeWidth={2.5} name="Max Temp (°C)" />
                <Line type="monotone" dataKey="temp_min" stroke="#3b82f6" strokeWidth={2.5} name="Min Temp (°C)" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm">
          <h3 className="font-bold text-slate-900 text-sm mb-1">Precipitation Forecast (mm)</h3>
          <p className="text-xs text-slate-500 mb-4">Expected cumulative rainfall</p>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={forecast}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="day_name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="precipitation_sum" fill="#0ea5e9" radius={[6, 6, 0, 0]} name="Precipitation (mm)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
