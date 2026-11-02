import React, { useState, useEffect } from 'react';
import { 
  History as HistoryIcon, 
  Search, 
  Download, 
  Trash2, 
  Eye, 
  Sprout, 
  Calendar, 
  MapPin, 
  ArrowUpDown,
  Filter,
  CheckCircle2,
  X
} from 'lucide-react';
import { historyApi } from '../services/api';
import { useModal } from '../context/ModalContext';

export const HistoryView: React.FC = () => {
  const { showModal } = useModal();
  const [history, setHistory] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [seasonFilter, setSeasonFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [selectedRecord, setSelectedRecord] = useState<any>(null);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const data = await historyApi.getHistory();
      setHistory(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const handleDelete = (id: number) => {
    showModal({
      title: 'Delete Prediction Record',
      message: 'Are you sure you want to delete this historical prediction from your ledger? This action cannot be undone.',
      type: 'confirm',
      confirmText: 'Delete Record',
      onConfirm: async () => {
        try {
          await historyApi.deleteItem(id);
          setHistory((prev) => prev.filter((item) => item.id !== id));
        } catch {
          alert('Could not delete record.');
        }
      }
    });
  };

  const filtered = history.filter((item) => {
    const matchesSearch = 
      item.predicted_crop?.toLowerCase().includes(search.toLowerCase()) ||
      item.display_name?.toLowerCase().includes(search.toLowerCase()) ||
      item.farm_location?.toLowerCase().includes(search.toLowerCase());
    const matchesSeason = seasonFilter === 'all' || item.season?.toLowerCase() === seasonFilter.toLowerCase();
    return matchesSearch && matchesSeason;
  });

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Top Filter and Search Controls */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by crop, farm location..."
            className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 font-medium"
          />
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
            <Filter size={14} />
            <span>Season:</span>
          </div>
          <select
            value={seasonFilter}
            onChange={(e) => setSeasonFilter(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 text-slate-800 font-semibold rounded-2xl px-3 py-2 outline-none focus:ring-2 focus:ring-brand-500/20"
          >
            <option value="all">All Seasons</option>
            <option value="kharif">Kharif</option>
            <option value="rabi">Rabi</option>
            <option value="zaid">Zaid</option>
            <option value="whole year">Whole Year</option>
          </select>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-base">Prediction Ledger</h3>
            <p className="text-xs text-slate-500">Chronological audit trail of executed farm analyses</p>
          </div>
          <span className="text-xs font-bold text-brand-600 bg-brand-50 px-3 py-1 rounded-full">
            {filtered.length} Entries Recorded
          </span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">Loading ledger records...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <Sprout size={32} className="mx-auto text-slate-300 mb-2" />
            <p className="text-xs text-slate-500">No matching predictions found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase font-bold tracking-wider text-[10px] border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-6">Recommended Crop</th>
                  <th className="py-3.5 px-6">Location & Season</th>
                  <th className="py-3.5 px-6">Suitability</th>
                  <th className="py-3.5 px-6">Confidence</th>
                  <th className="py-3.5 px-6">Timestamp</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                {filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                          <Sprout size={16} />
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 capitalize">
                            {item.display_name || item.predicted_crop}
                          </div>
                          <span className="text-[10px] text-slate-400 uppercase font-semibold">
                            {item.model_version}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-6">
                      <div className="text-slate-900 font-semibold">{item.farm_location}</div>
                      <span className="text-[11px] text-slate-500">{item.season} • {item.soil_type}</span>
                    </td>

                    <td className="py-4 px-6">
                      <span className="inline-flex items-center gap-1 font-extrabold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full text-[11px]">
                        <CheckCircle2 size={12} />
                        {item.suitability_score}%
                      </span>
                    </td>

                    <td className="py-4 px-6">
                      <span className="text-slate-700 font-semibold">{item.model_confidence}%</span>
                    </td>

                    <td className="py-4 px-6 text-slate-500 text-[11px]">
                      {item.created_at ? new Date(item.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recent'}
                    </td>

                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedRecord(item)}
                          className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye size={15} />
                        </button>

                        <a
                          href={historyApi.downloadPDFUrl(item.id)}
                          target="_blank"
                          rel="noreferrer"
                          className="p-2 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                          title="Download Dossier PDF"
                        >
                          <Download size={15} />
                        </a>

                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Delete Record"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Record Inspection Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in-up">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 lg:p-8 shadow-2xl border border-slate-200 relative max-h-[85vh] overflow-y-auto custom-scrollbar">
            <button
              onClick={() => setSelectedRecord(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                <Sprout size={24} />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Archived Dossier #{selectedRecord.id}</span>
                <h3 className="text-xl font-black text-slate-900">{selectedRecord.display_name}</h3>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-4">
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                <span className="text-[10px] uppercase text-slate-400 font-bold">Suitability</span>
                <div className="text-lg font-black text-emerald-600 mt-0.5">{selectedRecord.suitability_score}%</div>
              </div>
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                <span className="text-[10px] uppercase text-slate-400 font-bold">Confidence</span>
                <div className="text-lg font-black text-blue-600 mt-0.5">{selectedRecord.model_confidence}%</div>
              </div>
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                <span className="text-[10px] uppercase text-slate-400 font-bold">Season</span>
                <div className="text-sm font-bold text-slate-800 mt-0.5">{selectedRecord.season}</div>
              </div>
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                <span className="text-[10px] uppercase text-slate-400 font-bold">Soil</span>
                <div className="text-sm font-bold text-slate-800 mt-0.5 capitalize">{selectedRecord.soil_type}</div>
              </div>
            </div>

            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mt-4 mb-2">Recorded Farm Inputs</h4>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 text-xs">
              {Object.entries(selectedRecord.inputs || {}).map(([k, v]: [string, any]) => (
                <div key={k} className="p-2 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">{k}</span>
                  <div className="font-bold text-slate-800">{String(v)}</div>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex justify-between items-center">
              <span className="text-xs text-slate-400">
                Model: {selectedRecord.model_version}
              </span>
              <a
                href={historyApi.downloadPDFUrl(selectedRecord.id)}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5 transition-colors"
              >
                <Download size={14} />
                <span>Export Official PDF</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
