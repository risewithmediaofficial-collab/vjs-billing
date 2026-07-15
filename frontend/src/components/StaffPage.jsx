import React, { useState, useEffect } from 'react';
import { Users, Plus, Trash2, X, Save, CheckCircle2, ShieldCheck, Lock, KeyRound } from 'lucide-react';
import { STORES, formatCurrency } from '../data.js';
import { staffApi } from '../api.js';

const ROLES = ['Staff', 'Senior Staff', 'Manager', 'Admin'];
const emptyForm = { name: '', role: 'Staff', pin: '', storeId: STORES[0].id };

export default function StaffPage({ staff, onCreateStaff, onDeleteStaff, onUpdateStaff, currentStaff, bills = [], products = [] }) {
  const [showForm, setShowForm]   = useState(false);
  const [form, setForm]           = useState(emptyForm);
  const [success, setSuccess]     = useState('');
  const [saving, setSaving]       = useState(false);
  const [error, setError]         = useState('');

  // Security Verification Modal States
  const [showSecurityModal, setShowSecurityModal] = useState(false);
  const [securityStaff, setSecurityStaff] = useState(null);
  const [activeSecurityTab, setActiveSecurityTab] = useState('reveal'); // 'reveal' | 'change'
  const [adminVerificationPin, setAdminVerificationPin] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [revealedPassword, setRevealedPassword] = useState('');
  const [securityError, setSecurityError] = useState('');
  const [securitySuccess, setSecuritySuccess] = useState('');

  // Lock body scroll when popup modals are active
  useEffect(() => {
    if (showForm || showSecurityModal) {
      document.body.classList.add('overflow-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
    }
    return () => {
      document.body.classList.remove('overflow-hidden');
    };
  }, [showForm, showSecurityModal]);

  const handleRevealPinSubmit = async () => {
    setSecurityError('');
    setRevealedPassword('');
    if (!adminVerificationPin.trim()) {
      setSecurityError('Please enter your Admin verification password.');
      return;
    }
    try {
      const res = await staffApi.revealPin(securityStaff._id || securityStaff.id, adminVerificationPin);
      setRevealedPassword(res.rawPin);
      setAdminVerificationPin('');
      setSecuritySuccess('Password successfully retrieved!');
      setTimeout(() => setSecuritySuccess(''), 3000);
    } catch (err) {
      setSecurityError(err.message || 'Incorrect Admin PIN or verification failed.');
    }
  };

  const handleChangePinSubmit = async () => {
    setSecurityError('');
    setSecuritySuccess('');
    if (!newPassword.trim() || newPassword.length < 4) {
      setSecurityError('New PIN must be at least 4 characters long.');
      return;
    }
    if (!adminVerificationPin.trim()) {
      setSecurityError('Please verify with your Admin password.');
      return;
    }

    try {
      // First verify the Admin PIN by attempting to reveal the PIN (this is a secure verification trick!)
      await staffApi.revealPin(securityStaff._id || securityStaff.id, adminVerificationPin);
      
      // If verification succeeds, update the target staff user PIN!
      await onUpdateStaff(securityStaff._id || securityStaff.id, { pin: newPassword });
      
      setSecuritySuccess('Staff password successfully updated!');
      setNewPassword('');
      setAdminVerificationPin('');
      setTimeout(() => {
        setSecuritySuccess('');
        setShowSecurityModal(false);
        setSecurityStaff(null);
      }, 2500);
    } catch (err) {
      setSecurityError(err.message || 'Failed to verify Admin PIN or update staff password.');
    }
  };

  const isAdmin = currentStaff?.role === 'Admin';

  const openAdd = () => {
    setForm(emptyForm);
    setError('');
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) { setError('Name is required.'); return; }
    if (!form.pin.trim() || form.pin.length < 4) { setError('Password must be at least 4 characters.'); return; }

    setSaving(true);
    setError('');
    try {
      await onCreateStaff({
        name: form.name.trim(),
        pin: form.pin.trim(),
        role: form.role,
        storeId: form.storeId,
      });
      setShowForm(false);
      setForm(emptyForm);
      setSuccess('Staff member added successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to add staff.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, name) => {
    const adminPin = window.prompt(`To delete staff member "${name}", please enter your Admin PIN to authorize:`);
    if (adminPin === null) return; // user cancelled prompt

    if (!adminPin.trim()) {
      alert('Verification PIN is required to delete staff.');
      return;
    }

    try {
      // Verify Admin PIN by making a call to revealPin for this staff member
      await staffApi.revealPin(id, adminPin.trim());
      
      // If verification succeeds, execute delete
      await onDeleteStaff(id);
    } catch (err) {
      alert('Verification failed: Incorrect Admin password. Deletion cancelled.');
    }
  };

  const roleColors = {
    Admin:          'from-red-500 to-orange-500',
    Manager:        'from-amber-500 to-yellow-500',
    'Senior Staff': 'from-purple-500 to-violet-500',
    Staff:          'from-blue-500 to-cyan-500',
  };

  return (
    <div className="space-y-6 animate-fade-in text-gray-800">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-855">Staff</h1>
          <p className="text-gray-450 text-sm mt-1">{staff.length} staff member{staff.length !== 1 ? 's' : ''}</p>
        </div>
        {isAdmin && (
          <button
            onClick={openAdd}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold text-sm hover:from-amber-400 hover:to-orange-400 transition-all shadow-lg"
          >
            <Plus size={16} />
            Add Staff
          </button>
        )}
      </div>

      {/* Success banner */}
      {success && (
        <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-xl p-4 animate-fade-in">
          <CheckCircle2 size={16} className="text-emerald-500" />
          <p className="text-emerald-700 text-sm font-semibold">{success}</p>
        </div>
      )}

      {/* Store Inventory Metrics Summary */}
      {products && products.length > 0 && (
        <div className="bg-amber-50/50 border border-amber-200 rounded-2xl p-5 shadow-sm space-y-3">
          <h3 className="font-bold text-amber-800 text-xs uppercase tracking-wider">Store Stock & Inventory Warnings</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 font-semibold">Total Inventory Items</p>
                <p className="text-xl font-bold text-gray-800 mt-1">{products.length}</p>
              </div>
              <span className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center text-amber-600 font-bold text-sm">#</span>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 font-semibold">Low Stock Items (1-2 Left)</p>
                <p className="text-xl font-bold text-amber-650 mt-1">{products.filter(p => p.stock > 0 && p.stock <= 2).length}</p>
              </div>
              <span className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-500 font-bold text-sm">⚠️</span>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 font-semibold">Sold Out / Out of Stock</p>
                <p className="text-xl font-bold text-red-650 mt-1">{products.filter(p => p.stock === 0).length}</p>
              </div>
              <span className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center text-red-500 font-bold text-sm">🚫</span>
            </div>
          </div>
        </div>
      )}

      {/* Staff grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {staff.map(s => {
          // Calculate billing metrics for this staff member
          const staffBills = (bills || []).filter(b => b.staffId === s._id || b.staffId === s.id || b.staffName === s.name);
          const totalBilledAmt = staffBills.reduce((sum, b) => sum + (b.totalAmount ?? b.finalTotal ?? 0), 0);
          const totalBillsCount = staffBills.length;

          return (
            <div key={s._id || s.id} className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-md transition-all shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${roleColors[s.role] || 'from-amber-400 to-amber-600'} flex items-center justify-center text-white font-bold text-xl shadow-md`}>
                    {s.name.charAt(0)}
                  </div>
                  <div className="flex items-center">
                    {/* Security/Key button — Admin only */}
                    {isAdmin && s.name.toLowerCase() !== 'system admin' && (
                      <button
                        onClick={() => {
                          setSecurityStaff(s);
                          setShowSecurityModal(true);
                          setActiveSecurityTab('reveal');
                        }}
                        className="w-8 h-8 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-600 hover:text-amber-700 flex items-center justify-center transition-all border border-amber-200 mr-2 shadow-sm"
                        title="Password Recovery & Reset"
                      >
                        <KeyRound size={14} />
                      </button>
                    )}
                    {/* Delete button — Admin only, can't delete yourself or System Admin */}
                    {isAdmin &&
                     (s._id || s.id) !== (currentStaff._id || currentStaff.id) &&
                     s.name.toLowerCase() !== 'system admin' && (
                      <button
                        onClick={() => handleDelete(s._id || s.id, s.name)}
                        className="w-8 h-8 rounded-lg bg-red-50 hover:bg-red-100 text-red-500 hover:text-red-700 flex items-center justify-center transition-all border border-red-200 shadow-sm"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>
                <h3 className="text-gray-800 font-bold text-lg mb-1">{s.name}</h3>
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <ShieldCheck size={14} className="text-amber-500" />
                  <span className={`text-xs px-2.5 py-1 rounded-full font-semibold bg-gradient-to-r ${roleColors[s.role] || 'from-amber-400 to-amber-600'} text-white`}>
                    {s.role}
                  </span>
                  {s.name.toLowerCase() === 'system admin' && (
                    <span className="text-xs px-2.5 py-1 rounded-full font-semibold bg-gray-800 text-white flex items-center gap-1">
                      <Lock size={9} /> Protected
                    </span>
                  )}
                  {s.storeId && (
                    <span className="text-xs px-2.5 py-1 rounded-full font-semibold bg-gray-50 text-gray-500 border border-gray-200">
                      {STORES.find(st => st.id === s.storeId)?.name || 'Unknown Store'}
                    </span>
                  )}
                </div>
              </div>

              {/* Performance Section */}
              <div className="mt-5 pt-4 border-t border-gray-100 space-y-2">
                <div className="flex justify-between items-center text-xs font-semibold text-gray-500">
                  <span>Total Amount Billed:</span>
                  <span className="text-amber-600 font-bold text-sm">{formatCurrency(totalBilledAmt)}</span>
                </div>
                <div className="flex justify-between items-center text-xs text-gray-405">
                  <span>Invoices Generated:</span>
                  <span className="font-medium text-gray-700">{totalBillsCount} bill{totalBillsCount !== 1 ? 's' : ''}</span>
                </div>
              </div>
            </div>
          );
        })}

        {staff.length === 0 && (
          <div className="col-span-full text-center py-16 text-gray-400">
            <Users size={40} className="mx-auto mb-3 opacity-30" />
            <p className="font-medium">No staff members found.</p>
            {isAdmin && (
              <p className="text-sm mt-1">Click "Add Staff" to add your first team member.</p>
            )}
          </div>
        )}
      </div>

      {/* Add Staff Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 text-gray-800">
          <div className="w-full max-w-md bg-white border border-gray-200 rounded-2xl p-6 shadow-2xl animate-fade-in">
            <div className="flex items-center justify-between mb-6 pb-2 border-b border-gray-100">
              <h2 className="text-gray-800 font-bold text-xl">Add Staff Member</h2>
              <button onClick={() => setShowForm(false)} className="w-9 h-9 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-550 flex items-center justify-center">
                <X size={18} />
              </button>
            </div>

            {error && (
              <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-2.5">
                {error}
              </div>
            )}

            <div className="space-y-4">
              {/* Name */}
              <div>
                <label className="text-xs text-gray-500 font-semibold mb-1.5 block uppercase tracking-wider">Name *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                  placeholder="Enter staff name"
                  className="w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-2.5 text-gray-800 text-sm placeholder-gray-400 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all"
                />
                <p className="text-xs text-gray-400 mt-1">This name is used to log in to the system.</p>
              </div>

              {/* Password */}
              <div>
                <label className="text-xs text-gray-500 font-semibold mb-1.5 block uppercase tracking-wider">
                  <span className="flex items-center gap-1"><Lock size={11} /> Password *</span>
                </label>
                <input
                  type="password"
                  value={form.pin}
                  onChange={e => setForm(p => ({ ...p, pin: e.target.value }))}
                  placeholder="Min 4 characters"
                  className="w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-2.5 text-gray-800 text-sm placeholder-gray-400 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all"
                />
              </div>

              {/* Role */}
              <div>
                <label className="text-xs text-gray-500 font-semibold mb-1.5 block uppercase tracking-wider">Role</label>
                <select
                  value={form.role}
                  onChange={e => setForm(p => ({ ...p, role: e.target.value }))}
                  className="w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-2.5 text-gray-800 text-sm focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
                >
                  {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>

              {/* Store */}
              <div>
                <label className="text-xs text-gray-500 font-semibold mb-1.5 block uppercase tracking-wider">Store Assignment</label>
                <select
                  value={form.storeId}
                  onChange={e => setForm(p => ({ ...p, storeId: e.target.value }))}
                  className="w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-2.5 text-gray-800 text-sm focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
                >
                  {STORES.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-6 border-t border-gray-100 pt-4">
              <button
                onClick={() => setShowForm(false)}
                className="flex-1 py-3 rounded-xl bg-gray-100 border border-gray-200 text-gray-600 font-semibold hover:bg-gray-200 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 py-3 rounded-xl bg-amber-500 text-white font-bold hover:bg-amber-400 transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-60"
              >
                <Save size={16} />
                {saving ? 'Saving...' : 'Add Staff'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Staff Security Management Modal (Admin Only) */}
      {showSecurityModal && securityStaff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 text-gray-800">
          <div className="w-full max-w-md bg-white border border-gray-200 rounded-2xl p-6 shadow-2xl animate-fade-in flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between mb-5 pb-3 border-b border-gray-100 shrink-0">
              <div>
                <h2 className="text-gray-800 font-bold text-lg">Staff Security Settings</h2>
                <p className="text-gray-400 text-xs mt-0.5">Manage credentials for {securityStaff.name}</p>
              </div>
              <button
                onClick={() => {
                  setShowSecurityModal(false);
                  setSecurityStaff(null);
                  setAdminVerificationPin('');
                  setNewPassword('');
                  setRevealedPassword('');
                  setSecurityError('');
                  setSecuritySuccess('');
                }}
                className="w-9 h-9 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Error and Success Banners */}
            {securityError && (
              <div className="mb-4 text-xs font-semibold text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-2.5 shrink-0">
                ⚠️ {securityError}
              </div>
            )}
            {securitySuccess && (
              <div className="mb-4 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2.5 shrink-0">
                ✅ {securitySuccess}
              </div>
            )}

            {/* Tab selections */}
            <div className="flex border-b border-gray-150 gap-4 mb-4 shrink-0">
              <button
                onClick={() => {
                  setActiveSecurityTab('reveal');
                  setSecurityError('');
                  setSecuritySuccess('');
                  setRevealedPassword('');
                }}
                className={`pb-2 text-xs font-bold border-b-2 transition-all ${
                  activeSecurityTab === 'reveal'
                    ? 'border-amber-500 text-amber-600'
                    : 'border-transparent text-gray-400 hover:text-gray-655'
                }`}
              >
                Reveal Password
              </button>
              <button
                onClick={() => {
                  setActiveSecurityTab('change');
                  setSecurityError('');
                  setSecuritySuccess('');
                  setRevealedPassword('');
                }}
                className={`pb-2 text-xs font-bold border-b-2 transition-all ${
                  activeSecurityTab === 'change'
                    ? 'border-amber-500 text-amber-600'
                    : 'border-transparent text-gray-400 hover:text-gray-655'
                }`}
              >
                Change Password
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-1">
              {activeSecurityTab === 'reveal' && (
                <div className="space-y-4">
                  <p className="text-xs text-gray-500 leading-relaxed">
                    To retrieve and display the current PIN for <strong>{securityStaff.name}</strong>, please enter your Admin authorization password below.
                  </p>
                  <div>
                    <label className="text-xs text-gray-500 font-semibold mb-1 block uppercase tracking-wider">Admin Password *</label>
                    <input
                      type="password"
                      required
                      value={adminVerificationPin}
                      onChange={e => setAdminVerificationPin(e.target.value)}
                      placeholder="Enter your Admin PIN"
                      className="w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-2.5 text-gray-800 text-sm focus:outline-none focus:border-amber-400"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleRevealPinSubmit}
                    className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-white font-bold text-xs shadow-sm transition-all"
                  >
                    Verify & Reveal PIN
                  </button>

                  {revealedPassword && (
                    <div className="mt-4 bg-gray-50 border border-gray-200 rounded-xl p-4 text-center">
                      <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Retrieved PIN</p>
                      <p className="text-2xl font-bold text-amber-600 mt-1 select-all font-mono tracking-widest">{revealedPassword}</p>
                      <p className="text-[10px] text-gray-400 mt-1">This is the active password for {securityStaff.name}.</p>
                    </div>
                  )}
                </div>
              )}

              {activeSecurityTab === 'change' && (
                <div className="space-y-4">
                  <p className="text-xs text-gray-500 leading-relaxed">
                    Set a new password for <strong>{securityStaff.name}</strong>. Admin verification is required to authorize this change.
                  </p>
                  <div>
                    <label className="text-xs text-gray-500 font-semibold mb-1 block uppercase tracking-wider">New Password (PIN) *</label>
                    <input
                      type="text"
                      required
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      placeholder="Enter new PIN"
                      className="w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-2.5 text-gray-850 text-sm focus:outline-none focus:border-amber-400"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 font-semibold mb-1 block uppercase tracking-wider">Admin Password *</label>
                    <input
                      type="password"
                      required
                      value={adminVerificationPin}
                      onChange={e => setAdminVerificationPin(e.target.value)}
                      placeholder="Verify your Admin PIN"
                      className="w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-2.5 text-gray-800 text-sm focus:outline-none focus:border-amber-400"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleChangePinSubmit}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold text-xs shadow-md transition-all"
                  >
                    Verify & Save New PIN
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
