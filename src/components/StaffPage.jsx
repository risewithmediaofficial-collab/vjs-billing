import React, { useState } from 'react';
import { Users, Plus, Edit3, Trash2, X, Save, CheckCircle2, ShieldCheck } from 'lucide-react';

import { STORES } from '../data.js';

const ROLES = ['Staff', 'Senior Staff', 'Manager', 'Admin'];

const emptyStaff = { id: '', name: '', role: 'Staff', pin: '', storeId: STORES[0].id };

export default function StaffPage({ staff, onUpdateStaff }) {
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(emptyStaff);
  const [success, setSuccess] = useState('');

  const openAdd = () => {
    const nextNum = String(staff.length + 1).padStart(3, '0');
    setForm({ ...emptyStaff, id: `STF-${nextNum}` });
    setEditId(null);
    setShowForm(true);
  };

  const openEdit = (s) => {
    setForm({ ...s });
    setEditId(s.id);
    setShowForm(true);
  };

  const handleSave = () => {
    if (!form.name.trim() || !form.pin.trim() || form.pin.length < 4) {
      alert('Please fill name and PIN (min 4 digits)');
      return;
    }
    if (editId) {
      onUpdateStaff(staff.map(s => s.id === editId ? { ...form } : s));
      setSuccess('Staff updated!');
    } else {
      if (staff.find(s => s.id === form.id)) { alert('Staff ID already exists'); return; }
      onUpdateStaff([...staff, form]);
      setSuccess('Staff member added!');
    }
    setShowForm(false);
    setTimeout(() => setSuccess(''), 3000);
  };

  const handleDelete = (id) => {
    if (confirm('Remove this staff member?')) {
      onUpdateStaff(staff.filter(s => s.id !== id));
    }
  };

  const roleColors = {
    Admin: 'from-red-500 to-orange-500',
    Manager: 'from-amber-500 to-yellow-500',
    'Senior Staff': 'from-purple-500 to-violet-500',
    Staff: 'from-blue-500 to-cyan-500',
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Staff</h1>
          <p className="text-purple-400 text-sm mt-1">{staff.length} staff members</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-violet-600 text-white font-semibold text-sm hover:from-purple-500 hover:to-violet-500 transition-all shadow-lg"
        >
          <Plus size={16} />
          Add Staff
        </button>
      </div>

      {success && (
        <div className="flex items-center gap-2 bg-emerald-900/30 border border-emerald-700/50 rounded-xl p-4 animate-fade-in">
          <CheckCircle2 size={16} className="text-emerald-400" />
          <p className="text-emerald-300 text-sm font-medium">{success}</p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {staff.map(s => (
          <div key={s.id} className="bg-white/5 border border-purple-900/30 rounded-2xl p-6 hover:bg-white/8 transition-all">
            <div className="flex items-start justify-between mb-4">
              <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${roleColors[s.role] || 'from-purple-500 to-violet-500'} flex items-center justify-center text-white font-bold text-xl shadow-lg`}>
                {s.name.charAt(0)}
              </div>
              <div className="flex gap-2">
                <button onClick={() => openEdit(s)} className="w-8 h-8 rounded-lg bg-purple-900/50 hover:bg-purple-700 text-purple-300 hover:text-white flex items-center justify-center transition-all">
                  <Edit3 size={14} />
                </button>
                {staff.length > 1 && (
                  <button onClick={() => handleDelete(s.id)} className="w-8 h-8 rounded-lg bg-red-900/30 hover:bg-red-800 text-red-400 hover:text-white flex items-center justify-center transition-all">
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            </div>
            <h3 className="text-white font-bold text-lg mb-1">{s.name}</h3>
            <p className="text-purple-400 text-sm mb-3">{s.id}</p>
            <div className="flex items-center gap-2 mt-2">
              <ShieldCheck size={14} className="text-purple-400" />
              <span className={`text-xs px-2.5 py-1 rounded-full font-medium bg-gradient-to-r ${roleColors[s.role] || 'from-purple-500 to-violet-500'} text-white`}>
                {s.role}
              </span>
              {s.storeId && (
                <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-white/10 text-purple-300 border border-purple-800/40">
                  {STORES.find(st => st.id === s.storeId)?.name || 'Unknown Store'}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-[#0f0c1e] border border-purple-800/40 rounded-2xl p-6 shadow-2xl animate-fade-in">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-white font-bold text-xl">{editId ? 'Edit Staff' : 'Add Staff'}</h2>
              <button onClick={() => setShowForm(false)} className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4">
              {[
                { key: 'id', label: 'Staff ID', type: 'text', placeholder: 'STF-001', disabled: !!editId },
                { key: 'name', label: 'Full Name *', type: 'text', placeholder: 'Enter full name' },
                { key: 'pin', label: 'PIN (4-6 digits) *', type: 'password', placeholder: '****' },
              ].map(f => (
                <div key={f.key}>
                  <label className="text-xs text-purple-400 font-medium mb-1.5 block">{f.label}</label>
                  <input
                    type={f.type}
                    value={form[f.key]}
                    onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                    placeholder={f.placeholder}
                    disabled={f.disabled}
                    maxLength={f.key === 'pin' ? 6 : undefined}
                    className="w-full bg-white/5 border border-purple-800/40 rounded-xl px-4 py-2.5 text-white text-sm
                      placeholder-purple-500 focus:outline-none focus:border-amber-400/60 transition-all disabled:opacity-50"
                  />
                </div>
              ))}
              <div>
                <label className="text-xs text-purple-400 font-medium mb-1.5 block">Role</label>
                <select value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value }))}
                  className="w-full bg-[#0f0c1e] border border-purple-800/40 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-amber-400/60">
                  {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-purple-400 font-medium mb-1.5 block">Store Assignment</label>
                <select value={form.storeId || STORES[0].id} onChange={e => setForm(p => ({ ...p, storeId: e.target.value }))}
                  className="w-full bg-[#0f0c1e] border border-purple-800/40 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-amber-400/60">
                  {STORES.map(s => <option key={s.id} value={s.id}>{s.name} ({s.location})</option>)}
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowForm(false)} className="flex-1 py-3 rounded-xl bg-white/5 border border-purple-800/40 text-purple-300 font-medium hover:bg-white/10 transition-all">
                Cancel
              </button>
              <button onClick={handleSave} className="flex-1 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-violet-600 text-white font-semibold hover:from-purple-500 hover:to-violet-500 transition-all flex items-center justify-center gap-2">
                <Save size={16} />
                {editId ? 'Update' : 'Add'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
