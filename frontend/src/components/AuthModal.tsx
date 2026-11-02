import React, { useState } from 'react';
import { X, Lock, Mail, User as UserIcon, ShieldCheck, Sprout, ArrowRight, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useModal } from '../context/ModalContext';

export const AuthModal: React.FC = () => {
  const { login, register, isLoading } = useAuth();
  const { isAuthModalOpen, closeAuthModal, authModalTab } = useModal();

  const [activeTab, setActiveTab] = useState<'farmer' | 'admin' | 'register'>(
    authModalTab === 'register' ? 'register' : 'farmer'
  );

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [region, setRegion] = useState('North India');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isAuthModalOpen) return null;

  const handleFillDemo = (type: 'farmer' | 'admin') => {
    if (type === 'farmer') {
      setEmail('farmer@agrisense.ai');
      setPassword('farmer123');
      setActiveTab('farmer');
    } else {
      setEmail('admin@agrisense.ai');
      setPassword('admin123');
      setActiveTab('admin');
    }
    setErrorMsg(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    try {
      if (activeTab === 'register') {
        await register({
          email,
          password,
          full_name: fullName || 'Agronomist',
          role: 'farmer',
          region
        });
      } else {
        await login(email, password);
      }
      closeAuthModal();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.detail || 'Authentication failed. Please verify credentials.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fade-in-up">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden relative">
        {/* Close Button */}
        <button
          onClick={closeAuthModal}
          className="absolute top-4 right-4 z-10 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
        >
          <X size={18} />
        </button>

        {/* Modal Top Hero */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 p-6 text-white text-center relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-emerald-500/20 rounded-full blur-2xl" />
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-emerald-400 flex items-center justify-center text-white mx-auto mb-3 shadow-lg shadow-brand-500/30">
            <Sprout size={24} />
          </div>
          <h2 className="text-xl font-extrabold tracking-tight">AGRI<span className="text-emerald-400">SENSE</span> Access</h2>
          <p className="text-xs text-slate-400 mt-1">Enterprise Precision Farming Platform</p>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-200 bg-slate-50 p-1">
          <button
            onClick={() => { setActiveTab('farmer'); setErrorMsg(null); }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
              activeTab === 'farmer' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Farmer Sign In
          </button>
          <button
            onClick={() => { setActiveTab('admin'); setErrorMsg(null); }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
              activeTab === 'admin' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Admin Sign In
          </button>
          <button
            onClick={() => { setActiveTab('register'); setErrorMsg(null); }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
              activeTab === 'register' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
              {errorMsg}
            </div>
          )}

          {activeTab === 'register' && (
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Full Name</label>
              <div className="relative">
                <UserIcon size={16} className="absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Ramesh Kumar"
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Email Address</label>
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-3 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@agrisense.ai"
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Password</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-3 text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none"
              />
            </div>
          </div>

          {activeTab === 'register' && (
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Farming Region</label>
              <select
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none bg-white"
              >
                <option value="North India">North India (Punjab, Haryana, UP)</option>
                <option value="West India">West India (Maharashtra, Gujarat, Rajasthan)</option>
                <option value="South India">South India (Tamil Nadu, Karnataka, AP)</option>
                <option value="East India">East India (West Bengal, Bihar, Odisha)</option>
                <option value="Central India">Central India (Madhya Pradesh, Chhattisgarh)</option>
              </select>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-gradient-to-r from-brand-600 to-emerald-600 hover:from-brand-700 hover:to-emerald-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-brand-500/25 transition-all flex items-center justify-center gap-2 mt-4"
          >
            <span>{isLoading ? 'Processing...' : activeTab === 'register' ? 'Register Farm Account' : 'Authenticate & Enter'}</span>
            <ArrowRight size={15} />
          </button>

          {/* Quick Demo Credentials Autofill */}
          <div className="pt-4 border-t border-slate-100">
            <span className="block text-[10px] uppercase font-bold text-slate-400 text-center mb-2">
              Instant Demo Access
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleFillDemo('farmer')}
                className="py-1.5 px-2 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 rounded-lg text-[11px] font-semibold transition-colors text-center border border-slate-200"
              >
                Farmer Demo
              </button>
              <button
                type="button"
                onClick={() => handleFillDemo('admin')}
                className="py-1.5 px-2 bg-slate-100 hover:bg-slate-800 hover:text-white text-slate-700 rounded-lg text-[11px] font-semibold transition-colors text-center border border-slate-200"
              >
                Admin Demo
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
