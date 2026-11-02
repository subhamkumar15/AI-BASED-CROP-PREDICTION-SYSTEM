import React from 'react';
import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react';

const COMMODITY_RATES = [
  { name: 'Paddy (Rice)', price: 2250, change: '+1.8%', up: true },
  { name: 'Wheat (Mill)', price: 2480, change: '+0.9%', up: true },
  { name: 'Cotton (MCX)', price: 7120, change: '+2.4%', up: true },
  { name: 'Maize (Feed)', price: 2090, change: '-0.5%', up: false },
  { name: 'Chickpea (Chana)', price: 5650, change: '+1.2%', up: true },
  { name: 'Mustard Seed', price: 5400, change: '+3.1%', up: true },
  { name: 'Soybean', price: 4600, change: '-1.1%', up: false },
  { name: 'Grapes (Export)', price: 6200, change: '+4.0%', up: true }
];

export const MarketTicker: React.FC = () => {
  return (
    <div className="bg-slate-900 text-white border-y border-slate-800 py-2 overflow-hidden flex items-center">
      <div className="px-4 flex items-center gap-2 border-r border-slate-800 text-[11px] font-extrabold uppercase text-emerald-400 flex-shrink-0 z-10 bg-slate-900">
        <TrendingUp size={14} />
        <span>APMC Mandi Rates</span>
      </div>

      <div className="flex gap-8 overflow-x-auto custom-scrollbar px-6 whitespace-nowrap text-xs font-medium">
        {COMMODITY_RATES.map((item, idx) => (
          <div key={idx} className="flex items-center gap-2 flex-shrink-0">
            <span className="text-slate-300 font-semibold">{item.name}:</span>
            <span className="text-white font-bold font-sans">₹{item.price.toLocaleString()}/q</span>
            <span className={`text-[10px] font-bold flex items-center gap-0.5 px-1.5 py-0.5 rounded ${
              item.up ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
            }`}>
              {item.up ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
              {item.change}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
