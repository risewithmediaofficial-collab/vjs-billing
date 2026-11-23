import React, { useState, useEffect } from 'react';
import { 
  X, RefreshCw, TrendingUp, TrendingDown, CheckCircle2, 
  Coins, Sparkles, ExternalLink, ShieldAlert, Clock
} from 'lucide-react';
import { bullionApi } from '../api.js';
import useScrollLock from '../useScrollLock.js';

export default function BullionRatesModal({ 
  onClose, 
  currentStore = 'store-1', 
  onRatesApplied = null 
}) {
  const [ratesData, setRatesData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [applying, setApplying] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Lock background screen scroll while modal is open
  useScrollLock(true);

  const fetchRates = async () => {
    try {
      setLoading(true);
      setErrorMsg('');
      const res = await bullionApi.getLatest();
      if (res && res.success) {
        setRatesData(res);
      } else {
        setErrorMsg(res?.message || 'Failed to load rates.');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Unable to connect to Bullion service.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRates();
  }, []);

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      setErrorMsg('');
      setSuccessMsg('');
      const res = await bullionApi.refresh();
      if (res && res.success) {
        setRatesData(res);
        setSuccessMsg('Live benchmark rates refreshed from India Bullion API!');
        setTimeout(() => setSuccessMsg(''), 4000);
      } else {
        setErrorMsg(res?.message || 'Failed to refresh rates.');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Refresh failed.');
    } finally {
      setRefreshing(false);
    }
  };

  const handleApplyToStore = async () => {
    try {
      setApplying(true);
      setErrorMsg('');
      setSuccessMsg('');
      const res = await bullionApi.applyToStore(currentStore);
      if (res && res.success) {
        setSuccessMsg(`Applied to Store: Gold 22K @ ₹${res.applied.goldRate}/g, Silver @ ₹${res.applied.silverRate}/g`);
        if (onRatesApplied) {
          onRatesApplied(res.applied.goldRate, res.applied.silverRate);
        }
        setTimeout(() => setSuccessMsg(''), 5000);
      } else {
        setErrorMsg(res?.message || 'Failed to apply rates.');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Apply to store failed.');
    } finally {
      setApplying(false);
    }
  };

  const formatINR = (val) => {
    if (val === null || val === undefined) return '—';
    return Number(val).toLocaleString('en-IN');
  };

  const norm = ratesData?.normalized || {};

  return (
    <div 
      className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs transition-opacity"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-xl sm:max-w-2xl bg-white h-full shadow-2xl border-l border-gray-200 overflow-hidden animate-drawer-right rounded-l-2xl sm:rounded-l-3xl flex flex-col">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-600 via-amber-500 to-orange-500 text-white p-4 sm:p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center border border-white/30 text-white shadow-inner">
              <Sparkles size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black tracking-wide uppercase">
                  India Bullion Rates (IBJA)
                </h2>
                {ratesData?.data?.[0]?.session && (
                  <span className="bg-white/20 border border-white/40 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                    {ratesData.data[0].session} Session
                  </span>
                )}
              </div>
              <p className="text-xs text-amber-100 font-medium mt-0.5">
                Official Benchmark Gold, Silver & Platinum Rates
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
            title="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Action & Date Sub-header */}
        <div className="bg-amber-50/70 border-b border-amber-200/80 px-4 py-2.5 flex items-center justify-between flex-wrap gap-2 text-xs">
          <div className="flex items-center gap-2 text-gray-700 font-medium">
            <Clock size={13} className="text-amber-700" />
            <span>Market Date: <strong className="text-gray-900">{ratesData?.date || 'Today'}</strong></span>
            {ratesData?.updatedAt && (
              <span className="text-gray-400 text-[11px] hidden sm:inline">
                • Fetched {new Date(ratesData.updatedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleRefresh}
              disabled={loading || refreshing}
              className="px-3 py-1 rounded-lg text-xs font-bold bg-white hover:bg-amber-100 text-amber-900 border border-amber-300 transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs disabled:opacity-60"
              title="Refresh from India Bullion API"
            >
              <RefreshCw size={12} className={refreshing ? 'animate-spin text-amber-600' : 'text-amber-600'} />
              <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
            </button>
            <button
              onClick={handleApplyToStore}
              disabled={loading || applying || !norm.gold22k}
              className="px-3 py-1 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-400 text-white transition-all flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-60"
              title="Apply 22K Gold and 999 Silver to live store billing rate"
            >
              <CheckCircle2 size={13} />
              <span>{applying ? 'Applying...' : 'Apply to Store'}</span>
            </button>
          </div>
        </div>

        {/* Alert Notifications */}
        {successMsg && (
          <div className="mx-4 mt-3 p-2.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-fade-in">
            <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}
        {errorMsg && (
          <div className="mx-4 mt-3 p-2.5 rounded-xl bg-rose-50 border border-rose-300 text-rose-800 text-xs font-semibold flex items-center gap-2 animate-fade-in">
            <ShieldAlert size={15} className="text-rose-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Content Body: Price Cards */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
          {loading && !ratesData ? (
            <div className="py-12 text-center text-gray-500 space-y-2">
              <RefreshCw size={24} className="animate-spin text-amber-500 mx-auto" />
              <p className="text-xs font-semibold">Loading live IBJA bullion rates...</p>
            </div>
          ) : (
            <>
              {/* Gold Cards Grid */}
              <div>
                <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Coins size={13} className="text-amber-500" />
                  <span>Gold Benchmark Rates</span>
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  
                  {/* 24K Pure Gold */}
                  {norm.gold24k && (
                    <div className="bg-gradient-to-br from-amber-50/80 to-yellow-50/40 border border-amber-200 rounded-xl p-3.5 shadow-2xs hover:border-amber-300 transition-all">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-extrabold text-sm text-gray-900">24K Pure Gold (999)</span>
                        {norm.gold24k.change !== undefined && (
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5 ${norm.gold24k.change >= 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                            {norm.gold24k.change >= 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                            {norm.gold24k.change >= 0 ? `+₹${norm.gold24k.change}` : `-₹${Math.abs(norm.gold24k.change)}`}
                          </span>
                        )}
                      </div>
                      <div className="flex items-baseline justify-between mt-2 pt-1 border-t border-amber-200/60">
                        <div>
                          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Per Gram</p>
                          <p className="text-lg font-black text-amber-900 font-mono">₹{formatINR(norm.gold24k.perGram)}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">10 Grams</p>
                          <p className="text-xs font-bold text-gray-800 font-mono">₹{formatINR(norm.gold24k.rupees)}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 22K Jewellery Gold (916) */}
                  {norm.gold22k && (
                    <div className="bg-gradient-to-br from-amber-100/70 via-amber-50/90 to-orange-50/60 border-2 border-amber-400/90 rounded-xl p-3.5 shadow-xs relative">
                      <div className="absolute top-2 right-2">
                        <span className="bg-amber-600 text-white font-extrabold text-[9px] px-1.5 py-0.5 rounded uppercase tracking-wider">
                          Standard 916
                        </span>
                      </div>
                      <div className="flex items-center justify-between mb-1 pr-16">
                        <span className="font-extrabold text-sm text-amber-950">22K Gold (916)</span>
                      </div>
                      <div className="flex items-baseline justify-between mt-2 pt-1 border-t border-amber-300/60">
                        <div>
                          <p className="text-[10px] text-amber-800 font-bold uppercase tracking-wider">Per Gram (Live)</p>
                          <p className="text-xl font-black text-amber-950 font-mono">₹{formatINR(norm.gold22k.perGram)}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">10 Grams</p>
                          <p className="text-xs font-bold text-gray-800 font-mono">₹{formatINR(norm.gold22k.rupees)}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 18K Hallmarked Gold */}
                  {norm.gold18k && (
                    <div className="bg-white border border-gray-200 rounded-xl p-3.5 shadow-2xs hover:border-gray-300 transition-all">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-xs text-gray-800">18K Gold (750)</span>
                        {norm.gold18k.change !== undefined && (
                          <span className="text-[10px] font-bold text-gray-500">
                            {norm.gold18k.change >= 0 ? `+₹${norm.gold18k.change}` : `-₹${Math.abs(norm.gold18k.change)}`}
                          </span>
                        )}
                      </div>
                      <div className="flex items-baseline justify-between mt-2 pt-1 border-t border-gray-100">
                        <div>
                          <p className="text-[10px] text-gray-400 font-bold uppercase">Per Gram</p>
                          <p className="text-base font-bold text-gray-900 font-mono">₹{formatINR(norm.gold18k.perGram)}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] text-gray-400 font-bold uppercase">10 Grams</p>
                          <p className="text-xs font-semibold text-gray-700 font-mono">₹{formatINR(norm.gold18k.rupees)}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 14K Gold */}
                  {norm.gold14k && (
                    <div className="bg-white border border-gray-200 rounded-xl p-3.5 shadow-2xs hover:border-gray-300 transition-all">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-xs text-gray-800">14K Gold (585)</span>
                      </div>
                      <div className="flex items-baseline justify-between mt-2 pt-1 border-t border-gray-100">
                        <div>
                          <p className="text-[10px] text-gray-400 font-bold uppercase">Per Gram</p>
                          <p className="text-base font-bold text-gray-900 font-mono">₹{formatINR(norm.gold14k.perGram)}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] text-gray-400 font-bold uppercase">10 Grams</p>
                          <p className="text-xs font-semibold text-gray-700 font-mono">₹{formatINR(norm.gold14k.rupees)}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Silver & Platinum Section */}
              <div>
                <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">
                  Silver &amp; Platinum Rates
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  
                  {/* Silver 999 */}
                  {norm.silver999 && (
                    <div className="bg-gradient-to-br from-slate-50 to-blue-50/40 border border-blue-200 rounded-xl p-3.5 shadow-2xs">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-extrabold text-sm text-slate-900">Silver 999 (Fine Silver)</span>
                        {norm.silver999.change !== undefined && (
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5 ${norm.silver999.change >= 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                            {norm.silver999.change >= 0 ? `+₹${norm.silver999.change}` : `-₹${Math.abs(norm.silver999.change)}`}
                          </span>
                        )}
                      </div>
                      <div className="flex items-baseline justify-between mt-2 pt-1 border-t border-blue-200/60">
                        <div>
                          <p className="text-[10px] text-gray-500 font-bold uppercase">Per Gram</p>
                          <p className="text-lg font-black text-blue-950 font-mono">₹{formatINR(norm.silver999.perGram)}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] text-gray-500 font-bold uppercase">1 Kilogram (1000g)</p>
                          <p className="text-xs font-bold text-gray-800 font-mono">₹{formatINR(norm.silver999.rupees)}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Platinum 999 */}
                  {norm.platinum999 && (
                    <div className="bg-gradient-to-br from-gray-50 to-purple-50/30 border border-gray-200 rounded-xl p-3.5 shadow-2xs">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-extrabold text-sm text-gray-900">Platinum 999</span>
                      </div>
                      <div className="flex items-baseline justify-between mt-2 pt-1 border-t border-gray-200/60">
                        <div>
                          <p className="text-[10px] text-gray-500 font-bold uppercase">Per Gram</p>
                          <p className="text-lg font-black text-purple-950 font-mono">₹{formatINR(norm.platinum999.perGram)}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] text-gray-500 font-bold uppercase">10 Grams</p>
                          <p className="text-xs font-bold text-gray-800 font-mono">₹{formatINR(norm.platinum999.rupees)}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer Disclaimer & Source Attributions */}
        <div className="bg-gray-50 border-t border-gray-200 p-3 sm:p-4 text-[11px] text-gray-500 space-y-1 shrink-0">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <span>
              <strong>Source:</strong> India Bullion and Jewellers Association (<a href="https://ibjarates.com/" target="_blank" rel="noreferrer" className="text-blue-600 hover:underline inline-flex items-center gap-0.5">ibjarates.com <ExternalLink size={10} /></a>)
            </span>
            <span>API via <a href="https://api.dharun.dev/docs/bullion" target="_blank" rel="noreferrer" className="text-amber-700 font-semibold hover:underline">api.dharun.dev</a></span>
          </div>
          <p className="text-[10px] text-gray-400 leading-tight">
            * Benchmark wholesale rates before GST (3%) and jewellery making charges. Jewellers' retail prices may vary according to local market spreads.
          </p>
        </div>

      </div>
    </div>
  );
}
