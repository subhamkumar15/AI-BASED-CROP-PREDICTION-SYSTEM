import React from 'react';
import { 
  LayoutDashboard, 
  Sprout, 
  CloudSun, 
  FlaskConical, 
  Bug, 
  History, 
  User, 
  BrainCircuit, 
  Users, 
  Database, 
  Sparkles, 
  LogOut, 
  LogIn, 
  ShieldCheck,
  ChevronRight,
  TrendingUp
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useModal } from '../context/ModalContext';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const { openAuthModal } = useModal();

  const isAdmin = user?.role === 'admin';

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'predict', label: 'Crop Prediction', icon: Sprout, badge: 'AI ML' },
    { id: 'weather', label: 'Weather Intelligence', icon: CloudSun },
    { id: 'soil', label: 'Soil Health Lab', icon: FlaskConical },
    { id: 'pest-detection', label: 'Pest Detection', icon: Bug, badge: 'Vision' },
    { id: 'history', label: 'Prediction Ledger', icon: History },
    { id: 'profile', label: 'My Farm Profile', icon: User },
  ];

  const adminNavItems = [
    { id: 'training', label: 'Model Governance', icon: BrainCircuit, badge: 'v2.4.0' },
    { id: 'users', label: 'User Directory', icon: Users },
  ];

  const handleNavClick = (tabId: string) => {
    setActiveTab(tabId);
    if (window.innerWidth < 1024) {
      onClose();
    }
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div 
          onClick={onClose} 
          className="fixed inset-0 z-30 bg-slate-950/60 backdrop-blur-sm lg:hidden transition-opacity"
        />
      )}

      <aside className={`fixed lg:static top-0 left-0 bottom-0 z-40 w-72 bg-slate-900 text-slate-300 flex flex-col flex-shrink-0 border-r border-slate-800 shadow-2xl transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        {/* Brand Header */}
        <div className="h-20 flex items-center justify-between px-6 border-b border-slate-800/80 bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-emerald-400 flex items-center justify-center text-white shadow-lg shadow-brand-500/30">
              <Sprout size={22} className="animate-pulse-slow" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-xl tracking-tight text-white">AGRI<span className="text-emerald-400">SENSE</span></span>
              </div>
              <p className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase">Precision AI Platform</p>
            </div>
          </div>
          <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold px-2 py-0.5 rounded-full">
            v2.4
          </span>
        </div>

        {/* Scrollable Navigation */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6 custom-scrollbar">
          {/* Main Menu */}
          <div>
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-3 mb-2">
              Agricultural Core
            </div>
            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${
                      isActive
                        ? 'bg-gradient-to-r from-brand-600 to-emerald-600 text-white shadow-lg shadow-brand-600/25 font-semibold'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon size={19} className={isActive ? 'text-white' : 'text-slate-400'} />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isActive ? 'bg-white/20 text-white' : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Admin Management Controls */}
          <div>
            <div className="flex items-center justify-between px-3 mb-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck size={13} className="text-emerald-400" />
                Administration
              </span>
              {isAdmin && (
                <span className="text-[9px] bg-brand-500/20 text-brand-400 font-bold px-1.5 py-0.5 rounded">
                  Superuser
                </span>
              )}
            </div>
            <nav className="space-y-1">
              {adminNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${
                      isActive
                        ? 'bg-slate-800 text-white border border-slate-700 shadow-md font-semibold'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon size={19} className={isActive ? 'text-emerald-400' : 'text-slate-400'} />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className="text-[10px] font-bold bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full border border-slate-700">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Subscription Upgrade Callout */}
          <div className="bg-gradient-to-br from-emerald-950/60 to-slate-900 border border-emerald-500/20 rounded-2xl p-4 relative overflow-hidden">
            <div className="absolute -top-6 -right-6 w-20 h-20 bg-emerald-500/10 rounded-full blur-xl pointer-events-none" />
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-1">
              <Sparkles size={14} />
              {user?.subscription === 'enterprise' ? 'Enterprise Access' : user?.subscription === 'pro' ? 'Pro Tier Active' : 'Basic Tier'}
            </div>
            <p className="text-xs text-slate-400 mb-3 leading-relaxed">
              Real-time satellite NDVI indices, unlimited foliar pathology scans & offline dossiers.
            </p>
            <button
              onClick={() => handleNavClick('profile')}
              className="w-full py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/20"
            >
              <span>{user?.subscription === 'enterprise' ? 'Manage Subscription' : 'Upgrade Plan'}</span>
              <ChevronRight size={14} />
            </button>
          </div>
        </div>

        {/* User Footer Profile */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-950/50 flex items-center justify-between">
          <div 
            onClick={() => handleNavClick('profile')}
            className="flex items-center gap-3 cursor-pointer group flex-1 min-w-0 mr-2"
          >
            <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-emerald-400 font-bold group-hover:border-emerald-500 transition-colors flex-shrink-0">
              {user ? user.full_name.charAt(0) : 'G'}
            </div>
            <div className="truncate">
              <div className="text-sm font-semibold text-white group-hover:text-emerald-300 transition-colors truncate">
                {user ? user.full_name : 'Guest Farmer'}
              </div>
              <div className="text-[11px] text-slate-400 flex items-center gap-1.5 capitalize truncate">
                <span className={`w-1.5 h-1.5 rounded-full ${user?.role === 'admin' ? 'bg-amber-400' : 'bg-emerald-400'}`} />
                {user ? `${user.role} • ${user.region}` : 'Explore Mode'}
              </div>
            </div>
          </div>

          {user ? (
            <button
              onClick={logout}
              title="Sign Out"
              className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800/80 rounded-xl transition-colors"
            >
              <LogOut size={18} />
            </button>
          ) : (
            <button
              onClick={() => openAuthModal('login')}
              title="Sign In"
              className="p-2 text-slate-400 hover:text-emerald-400 hover:bg-slate-800/80 rounded-xl transition-colors"
            >
              <LogIn size={18} />
            </button>
          )}
        </div>
      </aside>
    </>
  );
};
