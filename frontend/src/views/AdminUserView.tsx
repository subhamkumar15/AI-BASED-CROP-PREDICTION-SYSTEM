import React, { useState, useEffect } from 'react';
import { Users, Search, ShieldCheck, Mail, MapPin, CheckCircle2 } from 'lucide-react';
import { adminApi } from '../services/api';
import { useModal } from '../context/ModalContext';

export const AdminUserView: React.FC = () => {
  const { showModal } = useModal();
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await adminApi.getUsers();
      setUsers(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleRoleChange = async (userId: number, newRole: string) => {
    try {
      await adminApi.updateRole(userId, newRole);
      setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, role: newRole } : u));
      showModal({
        title: 'Role Updated',
        message: `User permissions successfully updated to ${newRole.toUpperCase()}.`,
        type: 'success'
      });
    } catch {
      alert('Could not update role.');
    }
  };

  const filtered = users.filter((u) =>
    u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.region?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Top Header Card */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900">Platform User Directory</h2>
          <p className="text-xs text-slate-500">Manage agricultural access tiers, researcher permissions, and roles</p>
        </div>

        <div className="relative max-w-xs w-full">
          <Search size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search users..."
            className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Registered Accounts</span>
          <span className="text-xs font-bold text-brand-600 bg-brand-50 px-3 py-1 rounded-full">
            {filtered.length} Users Total
          </span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">Loading user accounts...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-6">User Account</th>
                  <th className="py-3.5 px-6">Region</th>
                  <th className="py-3.5 px-6">Subscription Tier</th>
                  <th className="py-3.5 px-6">Assigned Role</th>
                  <th className="py-3.5 px-6">Joined Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                {filtered.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-slate-800 text-emerald-400 font-bold flex items-center justify-center text-sm">
                          {u.full_name?.charAt(0) || 'U'}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900">{u.full_name}</div>
                          <span className="text-[11px] text-slate-500">{u.email}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-6 text-slate-600">{u.region || 'North India'}</td>

                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        u.subscription === 'enterprise' ? 'bg-purple-100 text-purple-800' :
                        u.subscription === 'pro' ? 'bg-emerald-100 text-emerald-800' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {u.subscription}
                      </span>
                    </td>

                    <td className="py-4 px-6">
                      <select
                        value={u.role}
                        onChange={(e) => handleRoleChange(u.id, e.target.value)}
                        className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 font-semibold text-slate-800 outline-none focus:ring-1 focus:ring-brand-500"
                      >
                        <option value="farmer">Farmer</option>
                        <option value="researcher">Researcher</option>
                        <option value="admin">Administrator</option>
                      </select>
                    </td>

                    <td className="py-4 px-6 text-slate-400 text-[11px]">
                      {u.created_at ? new Date(u.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recent'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
