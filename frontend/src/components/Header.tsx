import React, { useState, useEffect } from 'react';
import { Menu, CloudSun, Bell, Shield, User, Sparkles, MapPin } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useModal } from '../context/ModalContext';
import { weatherApi } from '../services/api';

interface HeaderProps {
  activeTab: string;
  onMenuClick: () => void;
  setActiveTab: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, onMenuClick, setActiveTab }) => {
  const { user } = useAuth();
  const { openAuthModal } = useModal();
  const [weatherSnippet, setWeatherSnippet] = useState<{ temp: number; condition: string } | null>({
    temp: 29.5,
    condition: 'Mainly Clear'
  });

  useEffect(() => {
    // Quick weather fetch for Punjab hub
    weatherApi.getLiveWeather(30.9010, 75.8573, 'Ludhiana')
      .then((data) => {
        if (data?.current) {
          setWeatherSnippet({
            temp: data.current.temperature,
            condition: data.current.weather_condition
          });
        }
      })
      .catch(() => {});
  }, []);

  const getTabTitle = (tab: string) => {
    switch (tab) {
      case 'dashboard':
        return { title: 'Executive Agricultural Dashboard', desc: 'Precision telemetry, real-time climate risks, and predictive crop analytics.' };
      case 'predict':
        return { title: 'AI Crop Recommendation Engine', desc: 'Multi-variate classification considering 16 soil, climatic, and risk parameters.' };
      case 'weather':
        return { title: 'Weather & Climate Intelligence', desc: 'High-resolution 7-day meteorological forecasts and extreme event hazard detection.' };
      case 'soil':
        return { title: 'Soil Health & Fertility Lab', desc: 'Macronutrient balancing, pH neutralization, and customized fertilizer scheduling.' };
      case 'pest-detection':
        return { title: 'Computer Vision Foliar Diagnostics', desc: 'Automated leaf pathology detection with verified integrated pest management protocols.' };
      case 'history':
        return { title: 'Prediction Ledger & Reports', desc: 'Archived field intelligence dossiers with exportable executive PDF downloads.' };
      case 'profile':
        return { title: 'Farm Profile & Subscription', desc: 'Manage your agricultural holdings, regional soil defaults, and platform tier.' };
      case 'training':
        return { title: 'Machine Learning Model Governance', desc: 'Algorithm comparisons, cross-validation metrics, feature attribution, and retraining controls.' };
      case 'users':
        return { title: 'Enterprise User Directory', desc: 'Platform role-based access management, permissions, and security monitoring.' };
      default:
        return { title: 'AGRISENSE Intelligence', desc: 'AI-Powered Precision Farming' };
    }
  };

  const info = getTabTitle(activeTab);

  return (
    <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200/80 flex items-center justify-between px-6 lg:px-8 flex-shrink-0 z-20 sticky top-0">
      {/* Left Title and Mobile Menu */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
          aria-label="Open Navigation Menu"
        >
          <Menu size={22} />
        </button>

        <div>
          <h1 className="text-xl lg:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <span>{info.title}</span>
          </h1>
          <p className="text-xs text-slate-500 hidden sm:block font-medium truncate max-w-xl">
            {info.desc}
          </p>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3 lg:gap-4">
        {/* Quick Weather Badge */}
        {weatherSnippet && (
          <div 
            onClick={() => setActiveTab('weather')}
            className="hidden md:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-100 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-200 cursor-pointer transition-all text-xs font-semibold text-slate-700"
          >
            <CloudSun size={16} className="text-amber-500" />
            <span>{weatherSnippet.temp}°C • {weatherSnippet.condition}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          </div>
        )}

        {/* Region Chip */}
        <div 
          onClick={() => setActiveTab('weather')}
          className="hidden xl:flex items-center gap-1.5 text-xs font-medium text-slate-500 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-200 cursor-pointer hover:border-slate-300"
        >
          <MapPin size={13} className="text-emerald-600" />
          <span>{user?.region || 'North India Hub'}</span>
        </div>

        {/* Auth CTA or User Button */}
        {user ? (
          <div 
            onClick={() => setActiveTab('profile')}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900 text-white hover:bg-slate-800 cursor-pointer transition-all shadow-sm"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-xs font-bold capitalize">{user.role}</span>
          </div>
        ) : (
          <button
            onClick={() => openAuthModal('login')}
            className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-brand-600/20"
          >
            Sign In
          </button>
        )}
      </div>
    </header>
  );
};
