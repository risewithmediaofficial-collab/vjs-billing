import React, { useState, useEffect } from 'react';
import {
  Plus, Search, X, Calendar, User, Phone, MapPin,
  CreditCard, CheckCircle2, AlertCircle, TrendingUp, HelpCircle, Loader2
} from 'lucide-react';
import { formatCurrency } from '../data.js';

export default function SchemesPage({
  schemes = [],
  onEnrollScheme,
  onPayScheme,
  onRedeemScheme,
  onCancelScheme,
  currentStore,
  goldRate,
  silverRate,
  currentStaff
}) {
  const [activeTab, setActiveTab] = useState('active'); // active, redeemable, completed
  const [searchQuery, setSearchQuery] = useState('');
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [showPayModal, setShowPayModal] = useState(false);
  const [selectedScheme, setSelectedScheme] = useState(null);

  // Lock body scroll when popup modals are active
  useEffect(() => {
    if (showEnrollModal || showPayModal) {
      document.body.classList.add('overflow-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
    }
    return () => {
      document.body.classList.remove('overflow-hidden');
    };
  }, [showEnrollModal, showPayModal]);
  
  // Enroll Form State
  const [enrollForm, setEnrollForm] = useState({
    customerName: '',
    customerPhone: '',
    customerAddress: '',
    schemeName: 'VJS Gold Savings Scheme',
    schemeType: 'classic_11_1', // classic_11_1, interest_plan
    monthlyAmount: '',
    totalMonths: 11,
    bonusMonths: 1,
    interestRate: 0,
    goldRateAtEnrollment: goldRate,
  });

  // Pay Form State
  const [payForm, setPayForm] = useState({
    amount: '',
    monthIndex: 0,
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [confirmAction, setConfirmAction] = useState(null);
  const [enrollLoading, setEnrollLoading] = useState(false);
  const [payLoading, setPayLoading] = useState(false);

  // Filtering enrollments
  const filteredSchemes = schemes.filter(s => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      s.customerName.toLowerCase().includes(q) ||
      s.customerPhone.includes(q) ||
      s.schemeName.toLowerCase().includes(q);

    if (!matchesSearch) return false;

    if (activeTab === 'active') return s.status === 'active';
    if (activeTab === 'redeemable') return s.status === 'redeemable';
    if (activeTab === 'completed') return s.status === 'completed' || s.status === 'cancelled';
    if (activeTab === 'pending') return s.status === 'redeem_pending' || s.status === 'cancel_pending';
    return true;
  });

  const handleOpenPay = (scheme) => {
    // Find next unpaid month index
    const paidMonths = scheme.payments.map(p => p.monthIndex);
    let nextIndex = 0;
    for (let i = 0; i < scheme.totalMonths; i++) {
      if (!paidMonths.includes(i)) {
        nextIndex = i;
        break;
      }
    }
    
    setSelectedScheme(scheme);
    setPayForm({
      amount: scheme.monthlyAmount,
      monthIndex: nextIndex,
    });
    setShowPayModal(true);
  };

  const handleEnrollSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!enrollForm.customerName.trim() || !enrollForm.customerPhone.trim()) {
      setError('Please fill in: Customer Name and Phone Number');
      return;
    }

    const amt = parseFloat(enrollForm.monthlyAmount);
    if (!amt || amt <= 0) {
      setError('Please enter a valid monthly installment amount');
      return;
    }

    try {
      setEnrollLoading(true);
      const data = {
        ...enrollForm,
        monthlyAmount: amt,
        totalMonths: parseInt(enrollForm.totalMonths) || 11,
        bonusMonths: enrollForm.schemeType === 'classic_11_1' ? 1 : 0,
        interestRate: enrollForm.schemeType === 'interest_plan' ? (parseFloat(enrollForm.interestRate) || 0) : 0,
        goldRateAtEnrollment: goldRate, // lock today's gold rate
        storeId: currentStore,
      };

      await onEnrollScheme(data);
      setSuccess('Scheme enrollment successful!');
      setShowEnrollModal(false);
      setEnrollForm({
        customerName: '',
        customerPhone: '',
        customerAddress: '',
        schemeName: 'VJS Gold Savings Scheme',
        schemeType: 'classic_11_1',
        monthlyAmount: '',
        totalMonths: 11,
        bonusMonths: 1,
        interestRate: 0,
        goldRateAtEnrollment: goldRate,
      });
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to enroll scheme.');
    } finally {
      setEnrollLoading(false);
    }
  };

  const handlePaySubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      setPayLoading(true);
      await onPayScheme(selectedScheme._id, {
        amount: parseFloat(payForm.amount),
        monthIndex: payForm.monthIndex,
      });
      setSuccess('Payment recorded successfully!');
      setShowPayModal(false);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to record payment.');
    } finally {
      setPayLoading(false);
    }
  };

  const handleRedeem = (scheme) => {
    setConfirmAction({ type: 'redeem', scheme });
  };

  const handleCancel = (scheme) => {
    setConfirmAction({ type: 'cancel', scheme });
  };

  const executeConfirmAction = async () => {
    if (!confirmAction) return;
    const { type, scheme } = confirmAction;
    setError('');
    setSuccess('');

    try {
      if (type === 'redeem') {
        await onRedeemScheme(scheme._id);
        setSuccess('Scheme successfully redeemed!');
      } else if (type === 'cancel') {
        await onCancelScheme(scheme._id);
        setSuccess('Scheme successfully cancelled.');
      }
      setConfirmAction(null);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || `Failed to ${type} scheme.`);
      setConfirmAction(null);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in text-gray-800">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Gold Savings Schemes</h1>
          <p className="text-gray-400 text-sm mt-1">Manage monthly gold saving plans for customers</p>
        </div>
        <button
          onClick={() => setShowEnrollModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold text-sm hover:from-amber-400 hover:to-orange-400 transition-all shadow-lg"
        >
          <Plus size={16} />
          New Enrollment
        </button>
      </div>

      {success && (
        <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-xl p-4 animate-fade-in">
          <CheckCircle2 size={16} className="text-emerald-500" />
          <p className="text-emerald-700 text-sm font-semibold">{success}</p>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl p-4 animate-fade-in">
          <AlertCircle size={16} className="text-red-500" />
          <p className="text-red-700 text-sm font-semibold">{error}</p>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-gray-200 gap-6 overflow-x-auto">
        {[
          { key: 'active', label: 'Active Schemes' },
          { key: 'redeemable', label: 'Ready to Redeem' },
          { key: 'completed', label: 'Completed / Cancelled' },
          ...(currentStaff?.role === 'Admin' || (schemes || []).some(s => s.status?.includes('pending'))
            ? [{ key: 'pending', label: `Pending Approvals (${(schemes || []).filter(s => s.status?.includes('pending')).length})` }]
            : []),
        ].map(t => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`pb-3 text-sm font-semibold border-b-2 transition-all ${
              activeTab === t.key
                ? 'border-amber-500 text-amber-600'
                : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Search by customer name, phone, or scheme name..."
          className="w-full border border-gray-200 bg-white rounded-xl pl-11 pr-4 py-3 text-gray-800 text-sm
            placeholder-gray-400 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all shadow-sm"
        />
      </div>

      {/* Cards List */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredSchemes.map(scheme => {
          const totalPaid = scheme.payments.reduce((sum, p) => sum + p.amount, 0);
          const totalTarget = scheme.monthlyAmount * scheme.totalMonths;
          const progressPercent = Math.min((scheme.payments.length / scheme.totalMonths) * 100, 100);
          const nextDueMonth = scheme.payments.length + 1;
          const isFullyPaid = scheme.payments.length >= scheme.totalMonths;

          // Bonus is earned ONLY when fully paid (redeemable or completed)
          // Classic 11+1 gets 1 month installment. Interest plan gets X% interest on total paid.
          const bonusAmt = scheme.schemeType === 'classic_11_1' 
            ? scheme.monthlyAmount 
            : (totalTarget * ((scheme.interestRate || 0) / 100));

          const currentBonusEarned = (scheme.status === 'redeemable' || scheme.status === 'completed') ? bonusAmt : 0;
          const totalRedeemValue = totalPaid + currentBonusEarned;
          const estimatedMaturityValue = totalTarget + bonusAmt;

          return (
            <div key={scheme._id} className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm space-y-4 hover:shadow-md transition-all">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-gray-800 text-base">{scheme.customerName}</h3>
                  <p className="text-xs text-gray-405 mt-0.5 flex items-center gap-1">
                    <Phone size={11} /> {scheme.customerPhone}
                  </p>
                </div>
                <span className={`text-xs px-2.5 py-1 rounded-full font-bold uppercase tracking-wider ${
                  scheme.status === 'active' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                  scheme.status === 'redeemable' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 animate-pulse' :
                  scheme.status === 'completed' ? 'bg-gray-150 text-gray-500 border border-gray-250' :
                  scheme.status === 'cancelled' ? 'bg-red-50 text-red-700 border border-red-200' :
                  scheme.status === 'redeem_pending' ? 'bg-purple-50 text-purple-700 border border-purple-200 animate-pulse' :
                  scheme.status === 'cancel_pending' ? 'bg-orange-50 text-orange-700 border border-orange-200 animate-pulse' :
                  'bg-red-50 text-red-700 border border-red-100'
                }`}>
                  {scheme.status?.replace('_', ' ')}
                </span>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-gray-500 font-medium">
                  <span>Instalment Progress</span>
                  <span>{scheme.payments.length} / {scheme.totalMonths} paid</span>
                </div>
                <div className="w-full bg-gray-150 h-2.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-amber-500 h-full rounded-full transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5 pt-2">
                <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                  <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Total Paid</p>
                  <p className="text-gray-800 font-bold text-base mt-0.5">{formatCurrency(totalPaid)}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                  <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Bonus (at maturity)</p>
                  <p className="text-emerald-600 font-bold text-base mt-0.5">+{formatCurrency(bonusAmt)}</p>
                </div>
              </div>

              <div className="text-xs space-y-2 border-t border-gray-100 pt-3">
                <div className="flex justify-between text-gray-500">
                  <span>Scheme Model</span>
                  <span className="font-semibold text-gray-700">
                    {scheme.schemeType === 'classic_11_1' 
                      ? `11+1 Bonus Plan (${scheme.totalMonths} mos)` 
                      : `Interest Plan (${scheme.interestRate || 0}%, ${scheme.totalMonths} mos)`}
                  </span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>Gold Rate at Enrollment</span>
                  <span className="font-semibold text-gray-700">₹{scheme.goldRateAtEnrollment}/g</span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>Monthly Installment</span>
                  <span className="font-semibold text-gray-700">{formatCurrency(scheme.monthlyAmount)}</span>
                </div>
                {scheme.status === 'active' ? (
                  <div className="flex justify-between text-gray-500">
                    <span>Est. Maturity Value</span>
                    <span className="font-semibold text-gray-700">{formatCurrency(estimatedMaturityValue)}</span>
                  </div>
                ) : null}
                <div className="flex justify-between text-gray-500 font-semibold text-amber-700">
                  <span>Current Redeem Value</span>
                  <span>{formatCurrency(totalRedeemValue)}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-2 pt-2">
                {scheme.status === 'active' && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleOpenPay(scheme)}
                      className="flex-1 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-white font-bold text-xs shadow-sm transition-all"
                    >
                      Record Pay (M{nextDueMonth})
                    </button>
                    <button
                      onClick={() => handleCancel(scheme)}
                      className="px-3 py-2 rounded-xl border border-gray-200 text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all"
                      title="Cancel scheme"
                    >
                      Cancel
                    </button>
                  </div>
                )}
                {scheme.status === 'redeemable' && (
                  <button
                    onClick={() => handleRedeem(scheme)}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-bold text-xs shadow-md transition-all"
                  >
                    Redeem for Gold Jewelry (₹{totalRedeemValue.toLocaleString('en-IN')})
                  </button>
                )}
                {scheme.status === 'redeem_pending' && (
                  currentStaff?.role === 'Admin' ? (
                    <div className="space-y-2">
                      <div className="text-[11px] text-purple-600 font-semibold text-center bg-purple-50 p-1.5 rounded-lg border border-purple-100">
                        Staff requested Redemption for ₹{totalRedeemValue.toLocaleString('en-IN')}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => onRedeemScheme(scheme._id, { status: 'completed' })}
                          className="flex-1 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-xs transition-all shadow-sm"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => onRedeemScheme(scheme._id, { status: 'active' })}
                          className="flex-1 py-2 rounded-xl border border-gray-250 text-gray-655 hover:bg-gray-50 font-bold text-xs transition-all"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="w-full py-2 text-center text-xs bg-purple-50 text-purple-700 rounded-xl font-medium border border-purple-200 animate-pulse">
                      Redemption requested. Waiting for Admin...
                    </div>
                  )
                )}
                {scheme.status === 'cancel_pending' && (
                  currentStaff?.role === 'Admin' ? (
                    <div className="space-y-2">
                      <div className="text-[11px] text-orange-600 font-semibold text-center bg-orange-50 p-1.5 rounded-lg border border-orange-100">
                        Staff requested Cancellation
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => onCancelScheme(scheme._id, { status: 'cancelled' })}
                          className="flex-1 py-2 rounded-xl bg-red-500 hover:bg-red-400 text-white font-bold text-xs transition-all shadow-sm"
                        >
                          Approve Cancel
                        </button>
                        <button
                          onClick={() => onCancelScheme(scheme._id, { status: 'active' })}
                          className="flex-1 py-2 rounded-xl border border-gray-250 text-gray-655 hover:bg-gray-50 font-bold text-xs transition-all"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="w-full py-2 text-center text-xs bg-orange-50 text-orange-700 rounded-xl font-medium border border-orange-200 animate-pulse">
                      Cancellation requested. Waiting for Admin...
                    </div>
                  )
                )}
                {scheme.status === 'completed' && (
                  <div className="w-full py-2 text-center text-xs bg-gray-50 text-gray-400 rounded-xl font-medium border border-gray-100">
                    Redeemed on {new Date(scheme.redeemedAt).toLocaleDateString()}
                  </div>
                )}
                {scheme.status === 'cancelled' && (
                  <div className="w-full py-2 text-center text-xs bg-red-50 text-red-500 rounded-xl font-medium border border-red-100">
                    Cancelled Enrollment
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filteredSchemes.length === 0 && (
        <div className="text-center py-16 bg-white border border-gray-200 rounded-2xl shadow-sm">
          <Calendar size={48} className="text-gray-300 mx-auto mb-4" />
          <p className="text-gray-400 font-semibold">No scheme enrollments found</p>
        </div>
      )}

      {/* ── Enrollment Modal ─────────────────────────────────────────────────── */}
      {showEnrollModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <form onSubmit={handleEnrollSubmit} className="w-full max-w-lg bg-white border border-gray-200 rounded-2xl shadow-2xl animate-fade-in text-gray-800 flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-6 pb-4 border-b border-gray-100 shrink-0">
              <div>
                <h2 className="text-gray-800 font-bold text-lg">New Scheme Enrollment</h2>
                <p className="text-gray-400 text-xs mt-0.5">Start a new monthly savings installment plan</p>
              </div>
              <button
                type="button"
                onClick={() => setShowEnrollModal(false)}
                className="w-9 h-9 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {/* Customer Name */}
                <div className="col-span-2">
                  <label className="text-xs text-gray-500 font-semibold mb-1 block uppercase tracking-wider">Customer Name *</label>
                  <input
                    type="text"
                    required
                    value={enrollForm.customerName}
                    onChange={e => setEnrollForm(p => ({ ...p, customerName: e.target.value }))}
                    placeholder="Enter full name"
                    className="w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-2.5 text-gray-800 text-sm focus:outline-none focus:border-amber-400"
                  />
                </div>

                {/* Customer Phone */}
                <div className="col-span-2">
                  <label className="text-xs text-gray-500 font-semibold mb-1 block uppercase tracking-wider">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={enrollForm.customerPhone}
                    onChange={e => setEnrollForm(p => ({ ...p, customerPhone: e.target.value }))}
                    placeholder="10-digit mobile number"
                    className="w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-2.5 text-gray-800 text-sm focus:outline-none focus:border-amber-400"
                  />
                </div>

                {/* Monthly Amount */}
                <div>
                  <label className="text-xs text-gray-500 font-semibold mb-1 block uppercase tracking-wider">Monthly Amount (₹) *</label>
                  <input
                    type="number"
                    required
                    value={enrollForm.monthlyAmount}
                    onChange={e => setEnrollForm(p => ({ ...p, monthlyAmount: e.target.value }))}
                    placeholder="e.g. 3000"
                    min={1}
                    className="w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-2.5 text-gray-800 text-sm focus:outline-none focus:border-amber-400"
                  />
                </div>

                {/* Locked Gold Rate */}
                <div>
                  <label className="text-xs text-gray-500 font-semibold mb-1 block uppercase tracking-wider">Locked Gold Rate (₹/g)</label>
                  <input
                    type="text"
                    value={`₹${goldRate}/g (Live)`}
                    readOnly
                    className="w-full border border-gray-200 bg-gray-100 rounded-xl px-4 py-2.5 text-gray-500 text-sm cursor-not-allowed"
                  />
                </div>

                {/* Scheme Type */}
                <div className="col-span-2 space-y-4">
                  <label className="text-xs text-gray-500 font-semibold block uppercase tracking-wider">Scheme Model</label>
                  <div className="flex flex-col gap-3 bg-gray-50 p-4 rounded-xl border border-gray-100">
                    {/* Classic 11+1 */}
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="radio"
                        name="schemeType"
                        value="classic_11_1"
                        checked={enrollForm.schemeType === 'classic_11_1'}
                        onChange={() => setEnrollForm(p => ({ ...p, schemeType: 'classic_11_1', totalMonths: 11, bonusMonths: 1, interestRate: 0 }))}
                        className="accent-amber-500 mt-1"
                      />
                      <div>
                        <span className="text-gray-700 text-sm font-semibold">11+1 Bonus Plan</span>
                        <p className="text-[11px] text-gray-400">Pay 11 months, owner pays 12th month free (₹{enrollForm.monthlyAmount || '0'} bonus)</p>
                      </div>
                    </label>

                    {/* Interest Savings Plan */}
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="radio"
                        name="schemeType"
                        value="interest_plan"
                        checked={enrollForm.schemeType === 'interest_plan'}
                        onChange={() => setEnrollForm(p => ({ ...p, schemeType: 'interest_plan', totalMonths: 12, bonusMonths: 0, interestRate: 5 }))}
                        className="accent-amber-500 mt-1"
                      />
                      <div>
                        <span className="text-gray-700 text-sm font-semibold">Interest Savings Plan</span>
                        <p className="text-[11px] text-gray-400">Pay monthly installments for customized duration and earn interest on maturity</p>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Conditional inputs for Interest/Duration configuration */}
                {enrollForm.schemeType === 'interest_plan' && (
                  <>
                    <div>
                      <label className="text-xs text-gray-500 font-semibold mb-1 block uppercase tracking-wider">Plan Duration (Months)</label>
                      <input
                        type="number"
                        required
                        value={enrollForm.totalMonths}
                        onChange={e => setEnrollForm(p => ({ ...p, totalMonths: e.target.value }))}
                        min={1}
                        max={60}
                        className="w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-2.5 text-gray-800 text-sm focus:outline-none focus:border-amber-400"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 font-semibold mb-1 block uppercase tracking-wider">Interest Rate (%)</label>
                      <input
                        type="number"
                        required
                        value={enrollForm.interestRate}
                        onChange={e => setEnrollForm(p => ({ ...p, interestRate: e.target.value }))}
                        min={0}
                        max={100}
                        step="0.1"
                        className="w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-2.5 text-gray-800 text-sm focus:outline-none focus:border-amber-400"
                      />
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="flex gap-3 p-6 pt-4 border-t border-gray-100 shrink-0">
              <button
                type="button"
                onClick={() => setShowEnrollModal(false)}
                disabled={enrollLoading}
                className="flex-1 py-2.5 rounded-xl bg-gray-100 border border-gray-200 text-gray-600 font-semibold text-sm hover:bg-gray-200 transition-all disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={enrollLoading}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold text-sm hover:from-amber-400 hover:to-orange-400 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {enrollLoading ? <Loader2 size={14} className="animate-spin" /> : null}
                {enrollLoading ? 'Enrolling...' : 'Save & Enroll'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── Record Payment Modal ────────────────────────────────────────────── */}
      {showPayModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <form onSubmit={handlePaySubmit} className="w-full max-w-sm bg-white border border-gray-200 rounded-2xl p-6 shadow-2xl animate-fade-in text-gray-800">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-100">
              <div>
                <h2 className="text-gray-800 font-bold text-base">Record Installment Payment</h2>
                <p className="text-xs text-gray-400 mt-0.5">Recording Month {payForm.monthIndex + 1} payment</p>
              </div>
              <button
                type="button"
                onClick={() => setShowPayModal(false)}
                className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs text-gray-500 font-semibold mb-1 block uppercase tracking-wider">Installment Amount (₹)</label>
                <input
                  type="number"
                  required
                  value={payForm.amount}
                  onChange={e => setPayForm(p => ({ ...p, amount: e.target.value }))}
                  className="w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-2.5 text-gray-800 text-sm focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs text-gray-500 font-semibold mb-1 block uppercase tracking-wider">Staff Recorder</label>
                <input
                  type="text"
                  readOnly
                  value="Logged-in Staff"
                  className="w-full border border-gray-200 bg-gray-100 rounded-xl px-4 py-2.5 text-gray-450 text-sm cursor-not-allowed"
                />
              </div>
            </div>

            <div className="flex gap-2.5 mt-5 pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setShowPayModal(false)}
                disabled={payLoading}
                className="flex-1 py-2 rounded-xl bg-gray-100 border border-gray-200 text-gray-600 font-semibold text-xs hover:bg-gray-200 transition-all disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={payLoading}
                className="flex-1 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-white font-bold text-xs shadow-sm transition-all disabled:opacity-60 flex items-center justify-center gap-1.5"
              >
                {payLoading ? <Loader2 size={13} className="animate-spin" /> : null}
                {payLoading ? 'Recording...' : 'Record Payment'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ─── Scheme Action Confirmation Modal ─── */}
      {confirmAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 text-gray-800">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 p-6 w-full max-w-sm animate-fade-in">
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${confirmAction.type === 'cancel' ? 'bg-red-100' : 'bg-emerald-100'}`}>
                {confirmAction.type === 'cancel' ? (
                  <AlertCircle size={20} className="text-red-600" />
                ) : (
                  <CheckCircle2 size={20} className="text-emerald-600" />
                )}
              </div>
              <div>
                <h3 className="font-bold text-gray-800 text-base">
                  {confirmAction.type === 'cancel' ? 'Cancel Savings Scheme' : 'Redeem Savings Scheme'}
                </h3>
                <p className="text-gray-500 text-xs mt-0.5">Please confirm your action</p>
              </div>
            </div>

            <p className="text-sm text-gray-600 mb-6">
              {confirmAction.type === 'cancel' ? (
                <>Are you sure you want to cancel the scheme for <span className="font-bold text-gray-800">"{confirmAction.scheme.customerName}"</span>? All recorded payments will be archived as cancelled.</>
              ) : (
                <>Are you sure you want to redeem the savings scheme for <span className="font-bold text-gray-800">"{confirmAction.scheme.customerName}"</span>? This will close the scheme and mark it as completed.</>
              )}
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setConfirmAction(null)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-650 font-semibold text-sm hover:bg-gray-50 transition-colors"
              >
                Go Back
              </button>
              <button
                onClick={executeConfirmAction}
                className={`flex-1 py-2.5 rounded-xl text-white font-bold text-sm transition-colors shadow-sm ${confirmAction.type === 'cancel' ? 'bg-red-500 hover:bg-red-600' : 'bg-emerald-500 hover:bg-emerald-600'}`}
              >
                {confirmAction.type === 'cancel' ? 'Cancel Scheme' : 'Redeem Scheme'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
