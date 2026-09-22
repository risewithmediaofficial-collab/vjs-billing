import React, { useState } from 'react';
import { Settings, Store, Save, CheckCircle2, IndianRupee, Percent, Zap, TrendingUp, TrendingDown, FileText, Check, AlertTriangle } from 'lucide-react';
import { SHOP_INFO } from '../data.js';

export default function SettingsPage({ goldRate, onUpdateGoldRate, silverRate, onUpdateSilverRate }) {
  const [shopInfo, setShopInfo] = useState({ ...SHOP_INFO });
  const [rate, setRate] = useState(goldRate);
  const [silverRateInput, setSilverRateInput] = useState(silverRate);
  const [gst, setGst] = useState(3);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [rateChanged, setRateChanged] = useState(false);
  const [silverRateChanged, setSilverRateChanged] = useState(false);

  const handleSaveRate = () => {
    setError('');
    const parsed = parseFloat(rate);
    if (!parsed || parsed <= 0) { 
      setError('Please enter a valid gold rate'); 
      return; 
    }
    onUpdateGoldRate(parsed);
    setRateChanged(false);
    setSuccess('Gold rate updated successfully!');
    setTimeout(() => setSuccess(''), 3000);
  };

  const handleSaveSilverRate = () => {
    setError('');
    const parsed = parseFloat(silverRateInput);
    if (!parsed || parsed <= 0) { 
      setError('Please enter a valid silver rate'); 
      return; 
    }
    onUpdateSilverRate(parsed);
    setSilverRateChanged(false);
    setSuccess('Silver rate updated successfully!');
    setTimeout(() => setSuccess(''), 3000);
  };

  const handleSave = () => {
    setError('');
    const parsed = parseFloat(rate);
    if (parsed > 0) {
      onUpdateGoldRate(parsed);
      setRateChanged(false);
    }
    const parsedSilver = parseFloat(silverRateInput);
    if (parsedSilver > 0 && onUpdateSilverRate) {
      onUpdateSilverRate(parsedSilver);
      setSilverRateChanged(false);
    }
    setSuccess('Settings saved successfully!');
    setTimeout(() => setSuccess(''), 3000);
  };

  return (
    <div className="space-y-4 animate-fade-in text-gray-800 max-w-6xl">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1 border-b border-gray-100">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-400 text-xs sm:text-sm mt-0.5">
            Configure live metal rates, shop profile, and billing preferences
          </p>
        </div>

        <button
          onClick={handleSave}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-bold text-xs sm:text-sm shadow-md transition-all self-start sm:self-auto active:scale-95 shrink-0"
        >
          <Save size={15} />
          Save All Settings
        </button>
      </div>

      {/* ── Notification Banners ── */}
      {success && (
        <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 animate-fade-in text-xs font-semibold text-emerald-700 shadow-xs">
          <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 animate-fade-in text-xs font-semibold text-red-700 shadow-xs">
          <AlertTriangle size={16} className="text-red-500 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* ── Metal Rates Row (Side by Side) ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 1. Gold Rate Card */}
        <div className="bg-gradient-to-br from-amber-50/90 via-amber-50/40 to-orange-50/70 border border-amber-200/90 rounded-2xl p-4 sm:p-5 shadow-xs relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-28 h-28 bg-amber-300/10 rounded-full blur-2xl pointer-events-none" />
          
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white shadow-xs">
                  <TrendingUp size={18} />
                </div>
                <div>
                  <h2 className="text-gray-900 font-bold text-sm">Gold Rate Editor</h2>
                  <p className="text-amber-800/80 text-[11px]">22K / 916 live gold rate</p>
                </div>
              </div>

              {/* Current Rate Display Pill */}
              <div className="bg-white border border-amber-200 rounded-xl px-3 py-1.5 text-right shadow-2xs">
                <span className="text-[9.5px] font-bold text-amber-700 block uppercase tracking-wider">Current Rate</span>
                <span className="text-base font-extrabold text-amber-600 font-mono">
                  ₹{goldRate.toLocaleString('en-IN')}<span className="text-xs font-normal text-amber-500">/g</span>
                </span>
              </div>
            </div>

            {/* Input + Action Row */}
            <div>
              <label className="text-[11px] text-amber-800 font-bold mb-1 block uppercase tracking-wider">
                New Gold Rate (₹ / gram)
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-amber-700 font-bold text-sm">₹</span>
                  <input
                    type="number"
                    value={rate}
                    min={1}
                    onChange={e => { setRate(e.target.value); setRateChanged(true); }}
                    placeholder="Enter rate"
                    className="w-full bg-white border border-amber-300 rounded-xl pl-8 pr-3 py-2 text-gray-900 font-bold text-sm focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100 shadow-2xs transition-all"
                  />
                </div>
                <button
                  onClick={handleSaveRate}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 whitespace-nowrap active:scale-95 ${
                    rateChanged
                      ? 'bg-amber-500 hover:bg-amber-400 text-white shadow-sm'
                      : 'bg-amber-100/80 text-amber-800 hover:bg-amber-200/80 border border-amber-200'
                  }`}
                >
                  <Zap size={13} /> Update Rate
                </button>
              </div>
            </div>
          </div>

          {rateChanged && (
            <p className="text-amber-700 text-[11px] mt-2 flex items-center gap-1 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse inline-block" />
              Unsaved changes — click "Update Rate" to apply
            </p>
          )}
        </div>

        {/* 2. Silver Rate Card */}
        <div className="bg-gradient-to-br from-slate-50/90 via-slate-50/40 to-blue-50/70 border border-blue-200/80 rounded-2xl p-4 sm:p-5 shadow-xs relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-28 h-28 bg-blue-300/10 rounded-full blur-2xl pointer-events-none" />
          
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-400 to-slate-500 flex items-center justify-center text-white shadow-xs">
                  <TrendingDown size={18} />
                </div>
                <div>
                  <h2 className="text-gray-900 font-bold text-sm">Silver Rate Editor</h2>
                  <p className="text-blue-800/80 text-[11px]">925 / Ag live silver rate</p>
                </div>
              </div>

              {/* Current Rate Display Pill */}
              <div className="bg-white border border-blue-200 rounded-xl px-3 py-1.5 text-right shadow-2xs">
                <span className="text-[9.5px] font-bold text-blue-700 block uppercase tracking-wider">Current Rate</span>
                <span className="text-base font-extrabold text-blue-600 font-mono">
                  ₹{silverRate.toLocaleString('en-IN')}<span className="text-xs font-normal text-blue-500">/g</span>
                </span>
              </div>
            </div>

            {/* Input + Action Row */}
            <div>
              <label className="text-[11px] text-blue-800 font-bold mb-1 block uppercase tracking-wider">
                New Silver Rate (₹ / gram)
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-blue-700 font-bold text-sm">₹</span>
                  <input
                    type="number"
                    value={silverRateInput}
                    min={1}
                    onChange={e => { setSilverRateInput(e.target.value); setSilverRateChanged(true); }}
                    placeholder="Enter rate"
                    className="w-full bg-white border border-blue-300 rounded-xl pl-8 pr-3 py-2 text-gray-900 font-bold text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 shadow-2xs transition-all"
                  />
                </div>
                <button
                  onClick={handleSaveSilverRate}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 whitespace-nowrap active:scale-95 ${
                    silverRateChanged
                      ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-sm'
                      : 'bg-blue-100/80 text-blue-800 hover:bg-blue-200/80 border border-blue-200'
                  }`}
                >
                  <Zap size={13} /> Update Rate
                </button>
              </div>
            </div>
          </div>

          {silverRateChanged && (
            <p className="text-blue-700 text-[11px] mt-2 flex items-center gap-1 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse inline-block" />
              Unsaved changes — click "Update Rate" to apply
            </p>
          )}
        </div>
      </div>

      {/* ── Shop Info & System Preferences Row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* ── Left Column: Shop Information (7 cols) ── */}
        <div className="lg:col-span-7 bg-white border border-gray-200 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3.5">
          <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
            <Store size={16} className="text-amber-500 shrink-0" />
            <div>
              <h2 className="text-gray-900 font-bold text-sm">Shop Information</h2>
              <p className="text-gray-400 text-[11px]">Details printed on physical invoices, vouchers & receipts</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] text-gray-500 font-bold mb-1 block uppercase tracking-wider">Shop Name</label>
              <input
                type="text"
                value={shopInfo.name}
                onChange={e => setShopInfo(p => ({ ...p, name: e.target.value }))}
                className="w-full border border-gray-200 bg-gray-50/70 rounded-xl px-3 py-2 text-gray-800 text-xs sm:text-sm focus:outline-none focus:border-amber-400 focus:bg-white transition-all"
              />
            </div>

            <div>
              <label className="text-[11px] text-gray-500 font-bold mb-1 block uppercase tracking-wider">Phone Number</label>
              <input
                type="tel"
                value={shopInfo.phone}
                onChange={e => setShopInfo(p => ({ ...p, phone: e.target.value }))}
                className="w-full border border-gray-200 bg-gray-50/70 rounded-xl px-3 py-2 text-gray-800 text-xs sm:text-sm focus:outline-none focus:border-amber-400 focus:bg-white transition-all font-mono"
              />
            </div>

            <div>
              <label className="text-[11px] text-gray-500 font-bold mb-1 block uppercase tracking-wider">GST Number</label>
              <input
                type="text"
                value={shopInfo.gstNumber}
                onChange={e => setShopInfo(p => ({ ...p, gstNumber: e.target.value }))}
                className="w-full border border-gray-200 bg-gray-50/70 rounded-xl px-3 py-2 text-gray-800 text-xs sm:text-sm focus:outline-none focus:border-amber-400 focus:bg-white transition-all font-mono uppercase"
              />
            </div>

            <div>
              <label className="text-[11px] text-gray-500 font-bold mb-1 block uppercase tracking-wider">Email Address</label>
              <input
                type="email"
                value={shopInfo.email}
                onChange={e => setShopInfo(p => ({ ...p, email: e.target.value }))}
                className="w-full border border-gray-200 bg-gray-50/70 rounded-xl px-3 py-2 text-gray-800 text-xs sm:text-sm focus:outline-none focus:border-amber-400 focus:bg-white transition-all"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-[11px] text-gray-500 font-bold mb-1 block uppercase tracking-wider">Shop Address</label>
              <input
                type="text"
                value={shopInfo.address}
                onChange={e => setShopInfo(p => ({ ...p, address: e.target.value }))}
                className="w-full border border-gray-200 bg-gray-50/70 rounded-xl px-3 py-2 text-gray-800 text-xs sm:text-sm focus:outline-none focus:border-amber-400 focus:bg-white transition-all"
              />
            </div>
          </div>
        </div>

        {/* ── Right Column: GST & Bill Format Preferences (5 cols) ── */}
        <div className="lg:col-span-5 space-y-4">
          {/* GST Settings */}
          <div className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-5 shadow-xs space-y-2.5">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Percent size={15} className="text-amber-500 shrink-0" />
                <h2 className="text-gray-900 font-bold text-sm">GST Settings</h2>
              </div>
              <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                Gold & Silver Standard: 3%
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative w-28">
                <input
                  type="number"
                  value={gst}
                  onChange={e => setGst(e.target.value)}
                  className="w-full border border-gray-200 bg-gray-50/70 rounded-xl pl-3 pr-8 py-2 text-gray-900 font-bold text-sm focus:outline-none focus:border-amber-400 focus:bg-white transition-all"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xs">%</span>
              </div>
              <p className="text-[11px] text-gray-400 leading-tight">
                Applicable as 1.5% CGST + 1.5% SGST on bullion & ornament bills
              </p>
            </div>
          </div>

          {/* Bill Format Preferences */}
          <div className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
              <Settings size={15} className="text-amber-500 shrink-0" />
              <h2 className="text-gray-900 font-bold text-sm">Bill Preferences</h2>
            </div>

            <div className="space-y-2.5">
              {[
                'Show logo on bill header',
                'Show CGST/SGST breakdown',
                'Show cashier & staff name',
                'Auto-send WhatsApp receipt after billing',
              ].map(opt => (
                <label key={opt} className="flex items-center gap-2.5 cursor-pointer group select-none">
                  <div className="relative">
                    <input type="checkbox" defaultChecked className="sr-only peer" />
                    <div className="w-8 h-4.5 bg-gray-200 peer-checked:bg-amber-500 rounded-full transition-colors border border-gray-300 peer-checked:border-amber-500" />
                    <div className="absolute top-0.5 left-0.5 w-3.5 h-3.5 bg-white rounded-full transition-all peer-checked:translate-x-3.5 shadow-2xs" />
                  </div>
                  <span className="text-gray-700 text-xs group-hover:text-gray-900 transition-colors font-medium">
                    {opt}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
