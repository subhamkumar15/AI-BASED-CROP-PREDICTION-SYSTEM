import React, { useState } from 'react';
import { 
  User as UserIcon, 
  Crown, 
  Sparkles, 
  Check, 
  ShieldCheck, 
  Mail, 
  Phone, 
  MapPin, 
  ArrowRight,
  Save
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useModal } from '../context/ModalContext';

export const ProfileView: React.FC = () => {
  const { user, upgradeSubscription } = useAuth();
  const { showModal } = useModal();

  const [fullName, setFullName] = useState(user?.full_name || 'Ravi Kishan Sharma');
  const [phone, setPhone] = useState(user?.phone || '+91 98123 45678');
  const [region, setRegion] = useState(user?.region || 'North India');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const PLANS = [
    {
      id: 'free',
      name: 'AGRISENSE Community',
      price: 'Free',
      period: 'Forever',
      description: 'Essential crop suitability recommendation & daily meteorological readings.',
      features: [
        'Core ML Crop Classification',
        'Daily Weather Conditions',
        'Standard Soil NPK Analysis',
        'Prediction Ledger Access'
      ],
      popular: false
    },
    {
      id: 'pro',
      name: 'AGRISENSE Professional',
      price: '₹499',
      period: 'per month',
      description: 'Precision agronomic intelligence with computer vision foliar diagnostics.',
      features: [
        'Everything in Community',
        'Computer Vision Foliar Pathology',
        '7-Day Extreme Weather Hazard Warning',
        'Unlimited Executive PDF Dossier Downloads',
        'Direct Agronomic AI Assistant Guidance'
      ],
      popular: true
    },
    {
      id: 'enterprise',
      name: 'AGRISENSE Enterprise',
      price: '₹1,999',
      period: 'per month',
      description: 'Full institutional platform with automated model training and API governance.',
      features: [
        'Everything in Professional',
        'Custom Agricultural Dataset CSV Ingestion',
        'Automated Retraining & Model Serialization',
        'Dedicated Dedicated Agriculture Specialist',
        'Multi-Farm Boundary Management',
        'Full REST API Webhooks & Integrations'
      ],
      popular: false
    }
  ];

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handlePlanSelect = (plan: any) => {
    if (user?.subscription === plan.id) return;

    showModal({
      title: `Confirm Plan Upgrade to ${plan.name}`,
      message: `Would you like to activate the ${plan.name} subscription (${plan.price} ${plan.period})? This will immediately unlock all tier capabilities.`,
      type: 'confirm',
      confirmText: 'Activate Subscription',
      onConfirm: async () => {
        await upgradeSubscription(plan.id);
        showModal({
          title: 'Plan Activated',
          message: `Your account has been upgraded to ${plan.name}.`,
          type: 'success'
        });
      }
    });
  };

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Profile Overview Card */}
      <div className="bg-white rounded-3xl p-6 lg:p-8 border border-slate-200/80 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-600 to-emerald-500 text-white font-black text-2xl flex items-center justify-center shadow-lg shadow-brand-500/20">
              {fullName.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-slate-900">{fullName}</h2>
                <span className="text-[10px] uppercase font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                  {user?.role || 'Farmer'}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">{user?.email || 'farmer@agrisense.ai'}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-400">Current Plan:</span>
            <span className="text-xs font-extrabold text-white bg-slate-900 px-3 py-1 rounded-full uppercase tracking-wider">
              {user?.subscription || 'pro'}
            </span>
          </div>
        </div>

        {/* Profile Settings Form */}
        <form onSubmit={handleSaveProfile} className="mt-6 space-y-4 max-w-2xl">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Farm Account Details</h3>
          
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Full Name</label>
              <div className="relative">
                <UserIcon size={16} className="absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Mobile / WhatsApp</label>
              <div className="relative">
                <Phone size={16} className="absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none"
                />
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Agricultural Agro-Climatic Zone</label>
              <div className="relative">
                <MapPin size={16} className="absolute left-3.5 top-3 text-slate-400" />
                <select
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none bg-white"
                >
                  <option value="North India">North India (Punjab, Haryana, UP, Himachal)</option>
                  <option value="West India">West India (Maharashtra, Gujarat, Rajasthan)</option>
                  <option value="Central India">Central India (Madhya Pradesh, Chhattisgarh)</option>
                  <option value="South India">South India (Karnataka, Tamil Nadu, Andhra Pradesh)</option>
                  <option value="East India">East India (West Bengal, Bihar, Assam)</option>
                </select>
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-colors mt-2"
          >
            <Save size={14} />
            <span>{savedSuccess ? 'Profile Saved!' : 'Save Changes'}</span>
          </button>
        </form>
      </div>

      {/* Subscription Plans Matrix */}
      <div>
        <div className="text-center max-w-xl mx-auto mb-8">
          <h3 className="text-xl font-extrabold text-slate-900">Platform Subscription Tiers</h3>
          <p className="text-xs text-slate-500 mt-1">
            Choose the precision level suitable for smallholder farms or commercial agri-enterprises.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {PLANS.map((plan) => {
            const isCurrent = user?.subscription === plan.id;
            return (
              <div
                key={plan.id}
                className={`bg-white rounded-3xl p-6 border transition-all relative flex flex-col justify-between ${
                  plan.popular
                    ? 'border-brand-500 shadow-xl shadow-brand-500/10 ring-2 ring-brand-500'
                    : 'border-slate-200/80 shadow-sm'
                }`}
              >
                {plan.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-brand-600 to-emerald-600 text-white text-[10px] font-extrabold uppercase px-3 py-0.5 rounded-full shadow-md">
                    Recommended Tier
                  </span>
                )}

                <div>
                  <h4 className="font-extrabold text-base text-slate-900">{plan.name}</h4>
                  <p className="text-xs text-slate-500 mt-1 mb-4 leading-relaxed">{plan.description}</p>
                  
                  <div className="flex items-baseline gap-1 my-3 pb-4 border-b border-slate-100">
                    <span className="text-3xl font-black text-slate-900 font-sans">{plan.price}</span>
                    <span className="text-xs font-medium text-slate-400">/{plan.period}</span>
                  </div>

                  <ul className="space-y-2.5 my-4">
                    {plan.features.map((feat, i) => (
                      <li key={i} className="text-xs text-slate-700 flex items-start gap-2">
                        <Check size={14} className="text-emerald-600 flex-shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  onClick={() => handlePlanSelect(plan)}
                  disabled={isCurrent}
                  className={`w-full py-2.5 rounded-xl font-bold text-xs transition-all mt-4 ${
                    isCurrent
                      ? 'bg-slate-100 text-slate-400 cursor-default'
                      : plan.popular
                      ? 'bg-brand-600 hover:bg-brand-700 text-white shadow-md shadow-brand-500/20'
                      : 'bg-slate-900 hover:bg-slate-800 text-white'
                  }`}
                >
                  {isCurrent ? 'Current Plan' : `Upgrade to ${plan.name}`}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
