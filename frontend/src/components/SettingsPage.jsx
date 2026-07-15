import React, { useState } from 'react';
import { Settings, Store, Save, CheckCircle2, IndianRupee, Percent, Zap, TrendingUp, TrendingDown } from 'lucide-react';
import { SHOP_INFO } from '../data.js';

export default function SettingsPage({ goldRate, onUpdateGoldRate, silverRate, onUpdateSilverRate }) {
  const [shopInfo, setShopInfo] = useState({ ...SHOP_INFO });
  const [rate, setRate] = useState(goldRate);
  const [silverRateInput, setSilverRateInput] = useState(silverRate);
  const [gst, setGst] = useState(3);
  const [success, setSuccess] = useState('');
  const [rateChanged, setRateChanged] = useState(false);
  const [silverRateChanged, setSilverRateChanged] = useState(false);

  const handleSaveRate = () => {
    const parsed = parseFloat(rate);
    if (!parsed || parsed <= 0) { alert('Please enter a valid gold rate'); return; }
    onUpdateGoldRate(parsed);
    setRateChanged(false);
    setSuccess('Gold rate updated successfully!');
    setTimeout(() => setSuccess(''), 3000);
  };

  const handleSaveSilverRate = () => {
    const parsed = parseFloat(silverRateInput);
    if (!parsed || parsed <= 0) { alert('Please enter a valid silver rate'); return; }
    onUpdateSilverRate(parsed);
    setSilverRateChanged(false);
    setSuccess('Silver rate updated successfully!');
    setTimeout(() => setSuccess(''), 3000);
  };

  const handleSave = () => {
    const parsed = parseFloat(rate);
    if (parsed > 0) onUpdateGoldRate(parsed);
    setSuccess('Settings saved successfully!');
    setTimeout(() => setSuccess(''), 3000);
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl text-gray-800">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Settings</h1>
        <p className="text-gray-400 text-sm mt-1">Configure your shop details and billing preferences</p>
      </div>

      {success && (
        <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-xl p-4 animate-fade-in">
          <CheckCircle2 size={16} className="text-emerald-500" />
          <p className="text-emerald-700 text-sm font-semibold">{success}</p>
        </div>
      )}

      {/* ─── Gold Rate Editor (Prominent) ─── */}
      <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-6 relative overflow-hidden shadow-sm">
        {/* Decorative glow */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-200/20 rounded-full blur-3xl pointer-events-none" />
        <div className="relative">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-300/50">
              <TrendingUp size={20} className="text-white" />
            </div>
            <div>
              <h2 className="text-gray-800 font-bold text-lg">Gold Rate Editor</h2>
              <p className="text-amber-700/80 text-xs">Update daily — affects all billing calculations</p>
            </div>
          </div>

          {/* Current rate display */}
          <div className="bg-white rounded-xl px-5 py-4 mb-5 flex items-center justify-between border border-amber-200">
            <div>
              <p className="text-amber-600/70 text-xs font-semibold mb-0.5 uppercase tracking-wider">CURRENT RATE</p>
              <p className="text-amber-600 font-bold text-3xl">₹{goldRate.toLocaleString('en-IN')}<span className="text-lg font-medium text-amber-500/70">/g</span></p>
            </div>
            <div className="w-12 h-12 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center">
              <span className="text-amber-600 font-bold text-lg">₹</span>
            </div>
          </div>

          {/* Rate input + save */}
          <div className="flex gap-3 items-end">
            <div className="flex-1">
              <label className="text-xs text-amber-600 font-semibold mb-1.5 block uppercase tracking-wider">New Rate (₹ per gram)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-600 font-bold text-lg">₹</span>
                <input
                  type="number"
                  value={rate}
                  min={1}
                  onChange={e => { setRate(e.target.value); setRateChanged(true); }}
                  placeholder="Enter new gold rate"
                  className="w-full bg-white border border-amber-300 rounded-xl pl-9 pr-4 py-3 text-gray-800 text-lg font-bold
                    focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100 transition-all placeholder-amber-200 shadow-sm"
                />
              </div>
            </div>
            <button
              onClick={handleSaveRate}
              className={`flex items-center gap-2 px-6 py-3.5 rounded-xl font-bold text-sm transition-all shadow-sm whitespace-nowrap
                ${rateChanged
                  ? 'bg-amber-500 hover:bg-amber-400 text-white shadow-md'
                  : 'bg-amber-100/50 text-amber-700 border border-amber-200 hover:bg-amber-100'
                }`}
            >
              <Zap size={16} />
              Update Rate
            </button>
          </div>

          {rateChanged && (
            <p className="text-amber-600/70 text-xs mt-2 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse inline-block" />
              Unsaved — click "Update Rate" to apply
            </p>
          )}
        </div>
      </div>

      {/* ─── Silver Rate Editor ─── */}
      <div className="bg-gradient-to-br from-slate-50 to-blue-50 border border-blue-200 rounded-2xl p-6 relative overflow-hidden shadow-sm">
        {/* Decorative glow */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-200/20 rounded-full blur-3xl pointer-events-none" />
        <div className="relative">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-400 to-slate-500 flex items-center justify-center shadow-lg shadow-blue-300/50">
              <TrendingDown size={20} className="text-white" />
            </div>
            <div>
              <h2 className="text-gray-800 font-bold text-lg">Silver Rate Editor</h2>
              <p className="text-blue-700/80 text-xs">Update daily — affects all silver billing calculations</p>
            </div>
          </div>

          {/* Current rate display */}
          <div className="bg-white rounded-xl px-5 py-4 mb-5 flex items-center justify-between border border-blue-200">
            <div>
              <p className="text-blue-600/70 text-xs font-semibold mb-0.5 uppercase tracking-wider">CURRENT RATE</p>
              <p className="text-blue-600 font-bold text-3xl">₹{silverRate.toLocaleString('en-IN')}<span className="text-lg font-medium text-blue-500/70">/g</span></p>
            </div>
            <div className="w-12 h-12 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center">
              <span className="text-blue-600 font-bold text-lg">Ag</span>
            </div>
          </div>

          {/* Rate input + save */}
          <div className="flex gap-3 items-end">
            <div className="flex-1">
              <label className="text-xs text-blue-600 font-semibold mb-1.5 block uppercase tracking-wider">New Rate (₹ per gram)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-600 font-bold text-lg">₹</span>
                <input
                  type="number"
                  value={silverRateInput}
                  min={1}
                  onChange={e => { setSilverRateInput(e.target.value); setSilverRateChanged(true); }}
                  placeholder="Enter new silver rate"
                  className="w-full bg-white border border-blue-300 rounded-xl pl-9 pr-4 py-3 text-gray-800 text-lg font-bold
                    focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all placeholder-blue-200 shadow-sm"
                />
              </div>
            </div>
            <button
              onClick={handleSaveSilverRate}
              className={`flex items-center gap-2 px-6 py-3.5 rounded-xl font-bold text-sm transition-all shadow-sm whitespace-nowrap
                ${silverRateChanged
                  ? 'bg-blue-500 hover:bg-blue-400 text-white shadow-md'
                  : 'bg-blue-100/50 text-blue-700 border border-blue-200 hover:bg-blue-100'
                }`}
            >
              <Zap size={16} />
              Update Rate
            </button>
          </div>

          {silverRateChanged && (
            <p className="text-blue-600/70 text-xs mt-2 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse inline-block" />
              Unsaved — click "Update Rate" to apply
            </p>
          )}
        </div>
      </div>

      {/* Shop Info */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <h2 className="text-gray-800 font-bold mb-4 flex items-center gap-2">
          <Store size={16} className="text-amber-500" />
          Shop Information
        </h2>
        <div className="grid gap-4">
          {[
            { key: 'name', label: 'Shop Name', type: 'text' },
            { key: 'address', label: 'Address', type: 'text' },
            { key: 'phone', label: 'Phone Number', type: 'tel' },
            { key: 'email', label: 'Email', type: 'email' },
            { key: 'gstNumber', label: 'GST Number', type: 'text' },
          ].map(f => (
            <div key={f.key}>
              <label className="text-xs text-gray-500 font-semibold mb-1.5 block uppercase tracking-wider">{f.label}</label>
              <input
                type={f.type}
                value={shopInfo[f.key]}
                onChange={e => setShopInfo(p => ({ ...p, [f.key]: e.target.value }))}
                className="w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-2.5 text-gray-805 text-sm
                  placeholder-gray-400 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Pricing */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <h2 className="text-gray-805 font-bold mb-4 flex items-center gap-2">
          <Percent size={16} className="text-amber-500" />
          GST Settings
        </h2>
        <div>
          <label className="text-xs text-gray-500 font-semibold mb-1.5 block uppercase tracking-wider">GST Rate (%)</label>
          <input
            type="number"
            value={gst}
            onChange={e => setGst(e.target.value)}
            className="w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-2.5 text-gray-805 text-sm
              focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all"
          />
          <p className="text-xs text-gray-400 mt-1">Standard jewellery GST is 3%</p>
        </div>
      </div>

      {/* Bill Format */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <h2 className="text-gray-805 font-bold mb-4 flex items-center gap-2">
          <Settings size={16} className="text-amber-500" />
          Bill Format
        </h2>
        <div className="space-y-3">
          {[
            'Show logo on bill',
            'Show GST breakdown',
            'Show staff name on bill',
            'Auto-send WhatsApp after billing',
          ].map(opt => (
            <label key={opt} className="flex items-center gap-3 cursor-pointer group">
              <div className="relative">
                <input type="checkbox" defaultChecked className="sr-only peer" />
                <div className="w-10 h-5 bg-gray-200 peer-checked:bg-amber-500 rounded-full transition-colors border border-gray-300 peer-checked:border-amber-450" />
                <div className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-all peer-checked:translate-x-5 shadow-sm" />
              </div>
              <span className="text-gray-600 text-sm group-hover:text-gray-850 transition-colors font-medium">{opt}</span>
            </label>
          ))}
        </div>
      </div>

      <button
        onClick={handleSave}
        className="flex items-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold hover:from-amber-400 hover:to-orange-400 transition-all shadow-lg"
      >
        <Save size={16} />
        Save All Settings
      </button>
    </div>
  );
}
