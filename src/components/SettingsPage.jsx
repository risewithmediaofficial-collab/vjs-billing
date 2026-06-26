import React, { useState } from 'react';
import { Settings, Store, Save, CheckCircle2, IndianRupee, Percent } from 'lucide-react';
import { SHOP_INFO } from '../data.js';

export default function SettingsPage({ goldRate, onUpdateGoldRate }) {
  const [shopInfo, setShopInfo] = useState({ ...SHOP_INFO });
  const [rate, setRate] = useState(goldRate);
  const [gst, setGst] = useState(3);
  const [success, setSuccess] = useState('');

  const handleSave = () => {
    onUpdateGoldRate(parseFloat(rate) || goldRate);
    setSuccess('Settings saved successfully!');
    setTimeout(() => setSuccess(''), 3000);
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-purple-400 text-sm mt-1">Configure your shop details and billing preferences</p>
      </div>

      {success && (
        <div className="flex items-center gap-2 bg-emerald-900/30 border border-emerald-700/50 rounded-xl p-4 animate-fade-in">
          <CheckCircle2 size={16} className="text-emerald-400" />
          <p className="text-emerald-300 text-sm font-medium">{success}</p>
        </div>
      )}

      {/* Shop Info */}
      <div className="bg-white/5 border border-purple-900/30 rounded-2xl p-6">
        <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
          <Store size={16} className="text-amber-400" />
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
              <label className="text-xs text-purple-400 font-medium mb-1.5 block">{f.label}</label>
              <input
                type={f.type}
                value={shopInfo[f.key]}
                onChange={e => setShopInfo(p => ({ ...p, [f.key]: e.target.value }))}
                className="w-full bg-white/5 border border-purple-800/40 rounded-xl px-4 py-2.5 text-white text-sm
                  placeholder-purple-500 focus:outline-none focus:border-amber-400/60 transition-all"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Pricing */}
      <div className="bg-white/5 border border-purple-900/30 rounded-2xl p-6">
        <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
          <IndianRupee size={16} className="text-amber-400" />
          Pricing Settings
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-purple-400 font-medium mb-1.5 block">Gold Rate (₹ per gram)</label>
            <input
              type="number"
              value={rate}
              onChange={e => setRate(e.target.value)}
              className="w-full bg-white/5 border border-purple-800/40 rounded-xl px-4 py-2.5 text-white text-sm
                focus:outline-none focus:border-amber-400/60 transition-all"
            />
            <p className="text-xs text-purple-500 mt-1">Current: ₹{goldRate}/g — Update daily</p>
          </div>
          <div>
            <label className="text-xs text-purple-400 font-medium mb-1.5 block">GST Rate (%)</label>
            <input
              type="number"
              value={gst}
              onChange={e => setGst(e.target.value)}
              className="w-full bg-white/5 border border-purple-800/40 rounded-xl px-4 py-2.5 text-white text-sm
                focus:outline-none focus:border-amber-400/60 transition-all"
            />
            <p className="text-xs text-purple-500 mt-1">Standard jewellery GST is 3%</p>
          </div>
        </div>
      </div>

      {/* Bill Format */}
      <div className="bg-white/5 border border-purple-900/30 rounded-2xl p-6">
        <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
          <Settings size={16} className="text-amber-400" />
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
                <div className="w-10 h-5 bg-purple-900/50 peer-checked:bg-purple-600 rounded-full transition-colors border border-purple-700/50 peer-checked:border-purple-500" />
                <div className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-all peer-checked:translate-x-5 shadow-sm" />
              </div>
              <span className="text-purple-300 text-sm group-hover:text-white transition-colors">{opt}</span>
            </label>
          ))}
        </div>
      </div>

      <button
        onClick={handleSave}
        className="flex items-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold hover:from-amber-400 hover:to-orange-400 transition-all shadow-lg"
      >
        <Save size={16} />
        Save Settings
      </button>
    </div>
  );
}
