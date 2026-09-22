import React, { useState, useEffect } from 'react';
import {
  Plus, Search, X, Calendar, User, Phone, MapPin,
  CreditCard, CheckCircle2, AlertCircle, TrendingUp, HelpCircle, Loader2, Printer, ChevronDown,
  Sparkles, Gift, ShieldCheck, Award, BookOpen, Layers, Info, Coins
} from 'lucide-react';
import {
  formatCurrency, formatDate, SHOP_INFO,
  SAVINGS_SCHEME_TERMS, SAVINGS_SCHEME_TAMIL_TERMS, SAVINGS_SCHEME_BENEFITS
} from '../data.js';
import useScrollLock from '../useScrollLock.js';

/* ── Passbook Front: Card Cover, Customer Info & Payment Ledger with Manual Seal Boxes ── */
function PassbookFront({ scheme, totalPaid, bonusAmt, estimatedMaturityValue, shopInfo, goldRate, silverRate }) {
  const totalMonths = scheme.totalMonths || 12;
  const isSilver = scheme.metalType === 'silver' || scheme.schemeName?.toLowerCase().includes('silver');
  const metalLabel = isSilver ? 'SILVER' : 'GOLD';
  const lockedRate = isSilver
    ? (scheme.silverRateAtEnrollment || silverRate || 0)
    : (scheme.goldRateAtEnrollment || goldRate || 0);

  const planName = scheme.schemeType === 'classic_5_1'
    ? '5+1 Bonus Plan (Pay 5 Months, Get 1 Month Bonus)'
    : scheme.schemeType === 'classic_11_1'
      ? '11+1 Bonus Plan (Pay 11 Months, Get 1 Month Bonus)'
      : `${metalLabel} Savings Scheme (${scheme.interestRate || 0}% Interest Plan)`;

  return (
    <div className="bg-white text-gray-900 border border-gray-300 rounded-xl p-4 sm:p-5 shadow-sm max-w-[540px] mx-auto space-y-3 font-sans print:border-0 print:p-0 print:shadow-none">
      {/* ── Top Header (Common across all bills) ── */}
      <div className="border-b-2 border-amber-500 pb-2.5 mb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-2.5">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-sm shrink-0 border ${
              isSilver ? 'bg-gradient-to-br from-slate-500 to-slate-700 border-slate-400' : 'bg-gradient-to-br from-amber-500 to-amber-700 border-amber-400'
            }`}>
              VJS
            </div>
            <div>
              <h1 className="font-extrabold text-base text-gray-900 tracking-wide uppercase leading-tight">
                {shopInfo.name || 'VJS JEWELLERY'}
              </h1>
              <p className="text-[10px] text-gray-600 leading-tight mt-0.5">{shopInfo.address}</p>
              <p className="text-[10px] text-gray-600">Ph: {shopInfo.phone} | Email: {shopInfo.email}</p>
            </div>
          </div>
          <div className="text-right text-[10px] text-gray-600 shrink-0">
            <p className="font-semibold text-gray-700">GSTIN: {shopInfo.gstNumber}</p>
            <p>Ph: {shopInfo.phone}</p>
            <p className="text-[9px] text-gray-400 mt-0.5">{metalLabel} SAVINGS PASSBOOK</p>
          </div>
        </div>
      </div>

      {/* ── Title Banner ── */}
      <div className={`flex items-center justify-between px-3 py-1.5 rounded-md font-bold uppercase tracking-wider text-xs mb-2 border ${
        isSilver ? 'bg-slate-100 text-slate-900 border-slate-300' : 'bg-amber-100 text-amber-900 border-amber-300'
      }`}>
        <span className="flex items-center gap-2">
          {metalLabel} SAVINGS SCHEME PASSBOOK
        </span>
        <span className="text-[10px] font-medium lowercase italic text-gray-600">
          customer passbook & ledger
        </span>
      </div>

      {/* ── Scheme Plan Banner ── */}
      <div className={`${isSilver ? 'bg-slate-50 border-slate-200' : 'bg-amber-50/80 border-amber-200'} border rounded-lg p-2 text-center shadow-xs`}>
        <p className="text-xs sm:text-sm font-bold text-gray-900">
          Monthly Installment: <span className={`font-mono font-extrabold ${isSilver ? 'text-slate-900' : 'text-amber-900'}`}>{formatCurrency(scheme.monthlyAmount)}</span> / month ({totalMonths} Months Scheme)
        </p>
        <p className={`text-[11px] font-semibold ${isSilver ? 'text-slate-800' : 'text-amber-800'} mt-0.5`}>
          {planName}
        </p>
        <p className="text-[9.5px] font-bold text-amber-900 bg-amber-100/80 border border-amber-300 rounded px-2 py-0.5 mt-1 inline-block">
          {isSilver ? '0% Wastage (சேதாரம் இல்லை) on Silver Jewellery | Not Eligible for Coins' : '11+1 Bonus Plan | Strictly Not Eligible for Coins'}
        </p>
      </div>

      {/* ── Customer & Account Details ── */}
      <div className="border border-gray-200 bg-gray-50/70 rounded-lg p-3 space-y-1.5 text-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5">
          <div className="flex items-baseline gap-1.5">
            <span className="font-bold text-gray-700 whitespace-nowrap">Customer Name:</span>
            <span className="font-semibold text-gray-900 border-b border-dotted border-gray-400 flex-1 truncate px-1">
              {scheme.customerName}
            </span>
          </div>

          <div className="flex items-baseline gap-1.5">
            <span className="font-bold text-gray-700 whitespace-nowrap">Phone Number:</span>
            <span className="font-mono font-semibold text-gray-900 border-b border-dotted border-gray-400 flex-1 px-1">
              {scheme.customerPhone}
            </span>
          </div>

          <div className="flex items-baseline gap-1.5 sm:col-span-2">
            <span className="font-bold text-gray-700 whitespace-nowrap">Customer Address:</span>
            <span className="font-medium text-gray-800 border-b border-dotted border-gray-400 flex-1 truncate px-1">
              {scheme.customerAddress || 'Local Customer, Krishnagiri'}
            </span>
          </div>

          <div className="flex items-baseline gap-1.5">
            <span className="font-bold text-gray-700 whitespace-nowrap">Passbook A/C No:</span>
            <span className="font-mono font-bold text-amber-800 border-b border-dotted border-gray-400 flex-1 px-1">
              VJS-SCH-{(scheme._id || '001').slice(-6).toUpperCase()}
            </span>
          </div>

          <div className="flex items-baseline gap-1.5">
            <span className="font-bold text-gray-700 whitespace-nowrap">Enrolled Rate:</span>
            <span className="font-mono font-bold text-gray-900 border-b border-dotted border-gray-400 flex-1 px-1">
              ₹{lockedRate}/g ({metalLabel})
            </span>
          </div>

          <div className="flex items-baseline gap-1.5">
            <span className="font-bold text-gray-700 whitespace-nowrap">Enrollment Date:</span>
            <span className="font-semibold text-gray-800 border-b border-dotted border-gray-400 flex-1 px-1">
              {formatDate(scheme.createdAt || scheme.enrolledAt)}
            </span>
          </div>

          <div className="flex items-baseline gap-1.5">
            <span className="font-bold text-gray-700 whitespace-nowrap">Scheme Type:</span>
            <span className="font-bold text-amber-800 border-b border-dotted border-gray-400 flex-1 px-1">
              {metalLabel} 11+1 Scheme
            </span>
          </div>
        </div>
      </div>

      {/* ── Payment Ledger Table with Empty Boxes for Manual Ink Stamping ── */}
      <div>
        <div className="flex items-center justify-between mb-1.5 px-0.5">
          <h4 className="text-xs font-bold text-gray-900">
            Monthly Payment & Installment Ledger
          </h4>
          <span className="text-[10px] font-bold text-gray-600 uppercase tracking-wider">
            {scheme.payments?.length || 0} / {totalMonths} Installments Paid
          </span>
        </div>

        <div className="border border-gray-300 rounded-lg overflow-hidden overflow-x-auto shadow-xs bg-white">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-amber-600 text-white font-bold text-[11px]">
                <th className="py-2 px-2.5 border-r border-amber-500 text-center w-12">Month</th>
                <th className="py-2 px-3 border-r border-amber-500 text-center">Paid Date</th>
                <th className="py-2 px-3 border-r border-amber-500 text-right">Amount</th>
                <th className="py-2 px-3 text-center">Cashier Seal & Signature</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {Array.from({ length: totalMonths }, (_, idx) => {
                const monthNum = idx + 1;
                const payment = scheme.payments?.find(p => (p.monthIndex === idx) || (p.monthIndex === monthNum)) || scheme.payments?.[idx];
                const isPaid = !!payment;

                return (
                  <tr key={monthNum} className={isPaid ? 'bg-amber-50/40' : 'bg-white'}>
                    {/* Month Number */}
                    <td className="py-2 px-2.5 border-r border-gray-200 text-center font-bold text-gray-800">
                      {monthNum}
                    </td>

                    {/* Date */}
                    <td className="py-2 px-3 border-r border-gray-200 text-center font-mono">
                      {isPaid ? (
                        <span className="font-semibold text-gray-900">{formatDate(payment.date)}</span>
                      ) : (
                        <span className="text-gray-300 tracking-widest text-[10px]">················</span>
                      )}
                    </td>

                    {/* Amount */}
                    <td className="py-2 px-3 border-r border-gray-200 text-right font-mono">
                      {isPaid ? (
                        <span className="font-extrabold text-gray-950">{formatCurrency(payment.amount)}</span>
                      ) : (
                        <span className="text-gray-300 tracking-wider text-[10px]">₹············</span>
                      )}
                    </td>

                    {/* Cashier Seal / Signature Marking (Empty Box for Manual Stamping) */}
                    <td className="py-1.5 px-3 text-center">
                      <div className="h-7 w-full max-w-[125px] mx-auto border border-dashed border-gray-300 rounded bg-white flex items-center justify-center">
                        {/* Empty box for manual rubber stamp & signature */}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Summary Cards ── */}
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="bg-white border border-gray-200 rounded-lg p-2 shadow-xs">
          <span className="text-[9.5px] font-bold text-gray-600 block uppercase">Total Paid</span>
          <span className="font-mono font-black text-xs sm:text-sm text-gray-900">{formatCurrency(totalPaid)}</span>
        </div>
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-2 shadow-xs">
          <span className="text-[9.5px] font-bold text-emerald-800 block uppercase">Bonus / Benefit</span>
          <span className="font-mono font-black text-xs sm:text-sm text-emerald-700">+{formatCurrency(bonusAmt)}</span>
        </div>
        <div className="bg-amber-50 border border-amber-300 rounded-lg p-2 shadow-xs">
          <span className="text-[9.5px] font-bold text-amber-900 block uppercase">Est. Maturity Value</span>
          <span className="font-mono font-black text-xs sm:text-sm text-amber-950">{formatCurrency(estimatedMaturityValue)}</span>
        </div>
      </div>

      {/* ── Signatures & Manual Store Seal Area (Empty boxes for manual completion) ── */}
      <div className="pt-3 border-t border-gray-200 flex items-end justify-between gap-4">
        {/* Customer Sign */}
        <div className="text-center w-40 sm:w-48">
          <div className="h-12 border-b border-gray-400 mb-1 flex items-end justify-center pb-1">
            <span className="text-xs text-gray-400 font-mono italic">{scheme.customerName}</span>
          </div>
          <p className="text-[11px] font-bold text-gray-800">Customer Signature</p>
        </div>

        {/* Store Seal & Authorized Signatory Box */}
        <div className="text-center w-44 sm:w-52">
          <div className="h-16 border border-dashed border-gray-400 rounded-lg mb-1 flex items-center justify-center bg-gray-50/50">
            <span className="text-[9px] text-gray-400 font-medium">[ Store Seal & Signature ]</span>
          </div>
          <p className="text-[11px] font-bold text-gray-800">For {shopInfo.name || 'VJS JEWELLERY'}</p>
          <p className="text-[9.5px] text-gray-500">Authorized Signatory</p>
        </div>
      </div>
    </div>
  );
}

/* ── Passbook Back: Jewellery Scheme Content, Rules & Benefits ── */
function PassbookBack({ scheme, shopInfo }) {
  const isSilver = scheme?.metalType === 'silver' || scheme?.schemeName?.toLowerCase().includes('silver');

  return (
    <div className="bg-white text-gray-900 border border-gray-300 rounded-xl p-4 sm:p-5 shadow-sm max-w-[540px] mx-auto space-y-3 font-sans print:border-0 print:p-0 print:shadow-none">
      {/* ── Top Header (Common across all bills) ── */}
      <div className="border-b-2 border-amber-500 pb-2.5 mb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-2.5">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-white font-bold text-lg shadow-sm shrink-0 border border-amber-400">
              VJS
            </div>
            <div>
              <h2 className="font-extrabold text-base text-gray-900 tracking-wide uppercase leading-tight">
                {shopInfo.name || 'VJS JEWELLERY'}
              </h2>
              <p className="text-[10px] text-gray-600 leading-tight mt-0.5">{shopInfo.address}</p>
              <p className="text-[10px] text-gray-600">Ph: {shopInfo.phone} | Email: {shopInfo.email}</p>
            </div>
          </div>
          <div className="text-right text-[10px] text-gray-600 shrink-0">
            <p className="font-semibold text-gray-700">GSTIN: {shopInfo.gstNumber}</p>
            <p>Ph: {shopInfo.phone}</p>
            <p className="text-[9px] text-gray-400 mt-0.5">RULES & BENEFITS</p>
          </div>
        </div>
      </div>

      {/* ── Title Banner ── */}
      <div className="flex items-center justify-between px-3 py-1.5 rounded-md font-bold uppercase tracking-wider text-xs mb-3 bg-amber-100 text-amber-900 border border-amber-300">
        <span className="flex items-center gap-2">
          GOLD & SILVER SAVINGS SCHEME — TERMS & BENEFITS
        </span>
        <span className="text-[10px] font-medium lowercase italic text-gray-600">
          rules & customer privileges
        </span>
      </div>

      {/* ── Split Panel: Rules (Left) & Benefits / Privileges (Right) in Tamil ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* ── Left Column: விதிமுறைகள் & நிபந்தனைகள் (Terms & Conditions) ── */}
        <div className="border border-gray-200 bg-gray-50/50 rounded-lg p-3 space-y-2 shadow-xs">
          <div className="border-b border-gray-200 pb-1.5 flex items-center gap-1.5">
            <BookOpen size={14} className="text-amber-700 shrink-0" />
            <h3 className="font-extrabold text-gray-900 text-xs font-['Noto_Sans_Tamil',sans-serif]">
              விதிமுறைகள் & நிபந்தனைகள் (Terms & Conditions)
            </h3>
          </div>

          <ol className="space-y-1.5 text-[9.5px] sm:text-[10px] leading-relaxed text-gray-800 list-none pl-0 font-['Noto_Sans_Tamil',sans-serif]">
            {SAVINGS_SCHEME_TAMIL_TERMS.map(({ num, title, text }) => (
              <li key={num} className="flex items-start gap-1.5">
                <span className="font-bold text-amber-700 shrink-0">{num}.</span>
                <span><strong>{title}:</strong> {text}</span>
              </li>
            ))}
          </ol>
        </div>

        {/* ── Right Column: நன்மைகள் & சலுகைகள் (Benefits & Privileges) ── */}
        <div className="border border-gray-200 bg-gray-50/50 rounded-lg p-3 space-y-2 shadow-xs">
          <div className="border-b border-gray-200 pb-1.5 flex items-center gap-1.5">
            <Gift size={14} className="text-amber-700 shrink-0" />
            <h3 className="font-extrabold text-gray-900 text-xs font-['Noto_Sans_Tamil',sans-serif]">
              நன்மைகள் & சலுகைகள் (Benefits & Privileges)
            </h3>
          </div>

          <div className="space-y-1.5 text-[9.5px] sm:text-[10px] font-['Noto_Sans_Tamil',sans-serif]">
            {SAVINGS_SCHEME_BENEFITS.map((b, idx) => (
              <div key={idx} className="flex items-start gap-2 bg-white p-2 rounded-lg border border-gray-200">
                {idx === 0 && <Award size={16} className="text-amber-600 shrink-0 mt-0.5" />}
                {idx === 1 && <Sparkles size={16} className="text-emerald-600 shrink-0 mt-0.5" />}
                {idx === 2 && <ShieldCheck size={16} className="text-blue-600 shrink-0 mt-0.5" />}
                {idx === 3 && <AlertCircle size={16} className="text-rose-600 shrink-0 mt-0.5" />}
                {idx === 4 && <Gift size={16} className="text-purple-600 shrink-0 mt-0.5" />}
                {idx === 5 && <Phone size={16} className="text-cyan-600 shrink-0 mt-0.5" />}
                <div>
                  <div className="flex items-center gap-1.5">
                    <strong className="text-gray-900 block font-bold">{b.title}</strong>
                    <span className="text-[9px] px-1.5 py-0.2 bg-amber-50 text-amber-800 border border-amber-200 rounded font-semibold shrink-0">
                      {b.badge}
                    </span>
                  </div>
                  <span className="text-gray-700 leading-snug block mt-0.5">{b.text}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Key Highlight Notice Bar ── */}
      <div className="bg-amber-50 border border-amber-300 rounded-lg p-2 text-center text-[10px] font-bold text-amber-900 space-y-0.5 font-['Noto_Sans_Tamil',sans-serif]">
        <p>வெள்ளி சேமிப்பு திட்டத்தில் சேதாரம் (0% VA) முற்றிலும் இலவசம்!</p>
        <p className="text-rose-800 font-extrabold">தங்கம் மற்றும் வெள்ளி இரு திட்டங்களிலும் நாணயங்கள் (Coins) பெற இயலாது; அழகு ஆபரண நகைகள் மட்டுமே பெறலாம்.</p>
      </div>

      {/* ── Footer Motto & Contact Info ── */}
      <div className="pt-2 border-t border-gray-200 text-center space-y-1">
        <p className="font-bold text-xs text-amber-900 font-['Noto_Sans_Tamil',sans-serif]">
          “எங்கள் தங்கம் & வெள்ளி சேமிப்புத் திட்டத்தில் இணைந்து உங்கள் எதிர்காலத்தை பொன்னாக்குங்கள்!”
        </p>

        <div className="border border-gray-200 bg-gray-50 rounded-lg p-2 text-xs text-gray-700">
          <p className="font-semibold text-gray-900">வாடிக்கையாளர் உதவி மையம் (Customer Helpline):</p>
          <p className="font-mono font-bold text-xs tracking-wider text-amber-900 mt-0.5">
            {shopInfo.phone} &nbsp;•&nbsp; Email: {shopInfo.email}
          </p>
          <p className="text-[10px] text-gray-500 mt-0.5">
            {shopInfo.address}
          </p>
        </div>
      </div>
    </div>
  );
}

/* ── Scheme Terms & Conditions Interactive Modal ── */
function SchemeTermsModal({ onClose, shopInfo = {} }) {
  const handlePrint = () => {
    const printContent = document.getElementById('scheme-terms-modal-print-area').innerHTML;
    const w = window.open('', '_blank');
    w.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Savings Scheme Terms & Conditions - ${shopInfo?.name || 'VJS Jewellery'}</title>
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Noto+Sans+Tamil:wght@400;500;600;700;800&display=swap" rel="stylesheet">
        <script src="https://cdn.tailwindcss.com"></script>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: 'Inter', 'Noto Sans Tamil', -apple-system, sans-serif;
            background: #fff;
            color: #111827;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          @page { size: A4 portrait; margin: 8mm; }
          @media print { .no-print { display: none !important; } }
        </style>
      </head>
      <body>
        <div class="p-3 max-w-[760px] mx-auto">
          ${printContent}
        </div>
      </body>
      </html>
    `);
    w.document.close();
    w.focus();
    setTimeout(() => { w.print(); }, 500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="w-full max-w-4xl bg-white rounded-2xl p-4 sm:p-6 shadow-2xl border border-gray-200 animate-fade-in my-auto max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-gray-200 gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-white font-bold shadow-sm shrink-0">
              <BookOpen size={20} />
            </div>
            <div>
              <h2 className="text-gray-900 font-extrabold text-base sm:text-lg">
                Gold & Silver Savings Schemes — Terms & Benefits
              </h2>
              <p className="text-gray-500 text-xs mt-0.5">
                விதிமுறைகள், நிபந்தனைகள் & வாடிக்கையாளர் சலுகைகள் (Customer Rules & Privileges)
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handlePrint}
              className="py-1.5 px-3 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-semibold text-xs flex items-center gap-1.5 shadow-sm transition-all"
            >
              <Printer size={14} /> Print Rules
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Highlight Callouts */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 my-3 shrink-0">
          <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-2">
            <Sparkles className="text-amber-600 shrink-0 mt-0.5" size={16} />
            <div>
              <p className="text-xs font-bold text-amber-900">Gold & Silver 11+1</p>
              <p className="text-[11px] text-amber-800 leading-tight mt-0.5">Pay 11 months, 12th month paid free as bonus by {shopInfo.name || 'VJS Jewellery'}.</p>
            </div>
          </div>
          <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-2">
            <ShieldCheck className="text-emerald-600 shrink-0 mt-0.5" size={16} />
            <div>
              <p className="text-xs font-bold text-emerald-900">0% Wastage on Silver</p>
              <p className="text-[11px] text-emerald-800 leading-tight mt-0.5">No wastage (சேதாரம் இல்லை) while claiming silver jewellery/articles!</p>
            </div>
          </div>
          <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2">
            <AlertCircle className="text-rose-600 shrink-0 mt-0.5" size={16} />
            <div>
              <p className="text-xs font-bold text-rose-900">Coins Not Eligible</p>
              <p className="text-[11px] text-rose-800 leading-tight mt-0.5">Strictly not eligible for gold or silver coins (jewellery/articles only).</p>
            </div>
          </div>
        </div>

        {/* Scrollable Printable Content */}
        <div className="flex-1 overflow-y-auto pr-1">
          <div id="scheme-terms-modal-print-area" className="space-y-4">
            {/* Tamil Rules */}
            <div className="border border-gray-200 rounded-xl p-4 bg-gray-50/50">
              <h3 className="font-extrabold text-sm text-gray-900 font-['Noto_Sans_Tamil',sans-serif] mb-2.5 flex items-center gap-2">
                <BookOpen size={16} className="text-amber-600" />
                விதிமுறைகள் & நிபந்தனைகள் (Tamil Terms & Conditions)
              </h3>
              <ol className="space-y-2 text-xs text-gray-800 font-['Noto_Sans_Tamil',sans-serif] leading-relaxed">
                {SAVINGS_SCHEME_TAMIL_TERMS.map(({ num, title, text }) => (
                  <li key={num} className="flex items-start gap-2">
                    <span className="font-bold text-amber-700 shrink-0">{num}.</span>
                    <div>
                      <strong className="text-gray-900">{title}:</strong> <span>{text}</span>
                    </div>
                  </li>
                ))}
              </ol>
            </div>

            {/* English Rules */}
            <div className="border border-gray-200 rounded-xl p-4 bg-gray-50/50">
              <h3 className="font-extrabold text-sm text-gray-900 mb-2.5 flex items-center gap-2">
                <Layers size={16} className="text-amber-600" />
                English Terms & Conditions
              </h3>
              <ol className="space-y-2 text-xs text-gray-800 leading-relaxed">
                {SAVINGS_SCHEME_TERMS.map(({ num, title, text }) => (
                  <li key={num} className="flex items-start gap-2">
                    <span className="font-bold text-amber-700 shrink-0">{num}.</span>
                    <div>
                      <strong className="text-gray-900">{title}:</strong> <span>{text}</span>
                    </div>
                  </li>
                ))}
              </ol>
            </div>

            {/* Benefits */}
            <div className="border border-gray-200 rounded-xl p-4 bg-white">
              <h3 className="font-extrabold text-sm text-gray-900 mb-3 flex items-center gap-2">
                <Gift size={16} className="text-amber-600" />
                Customer Privileges & Benefits (சலுகைகள்)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {SAVINGS_SCHEME_BENEFITS.map((b, idx) => (
                  <div key={idx} className="p-2.5 rounded-lg border border-gray-200 bg-gray-50/60 flex items-start gap-2">
                    <Award size={16} className="text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <strong className="text-xs font-bold text-gray-900">{b.title}</strong>
                        <span className="text-[9px] px-1.5 py-0.2 bg-amber-100 text-amber-800 rounded font-semibold shrink-0">
                          {b.badge}
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-600 mt-0.5 leading-snug">{b.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="pt-3 border-t border-gray-200 flex items-center justify-between shrink-0 text-xs text-gray-500">
          <span>{shopInfo.name || 'VJS Jewellery'} — Customer Savings Scheme Policy</span>
          <button
            onClick={onClose}
            className="py-1.5 px-4 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-xs transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}


/* ── Scheme Passbook / Receipt Modal Container ── */
function SchemeReceipt({ scheme, onClose, goldRate, silverRate }) {
  const [viewSide, setViewSide] = useState('both'); // 'front', 'back', 'both'
  const shopInfo = SHOP_INFO || {};

  const totalPaid = scheme.payments ? scheme.payments.reduce((s, p) => s + (p.amount || 0), 0) : 0;
  const totalTarget = (scheme.monthlyAmount || 0) * (scheme.totalMonths || 12);
  const bonusAmt = (scheme.schemeType === 'classic_11_1' || scheme.schemeType === 'classic_5_1')
    ? (scheme.monthlyAmount * (scheme.bonusMonths || 1))
    : (scheme.schemeType === 'interest_plan'
        ? (totalTarget * ((scheme.interestRate || 0) / 100))
        : (scheme.monthlyAmount || 0));
  const estimatedMaturityValue = totalTarget + bonusAmt;

  const handlePrint = () => {
    const printContent = document.getElementById('scheme-passbook-print-area').innerHTML;
    const w = window.open('', '_blank');
    w.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Scheme Passbook - ${scheme.customerName} - ${shopInfo.name}</title>
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Noto+Sans+Tamil:wght@400;500;600;700;800&display=swap" rel="stylesheet">
        <script src="https://cdn.tailwindcss.com"></script>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: 'Inter', 'Noto Sans Tamil', -apple-system, sans-serif;
            background: #fff;
            color: #111827;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          @page {
            size: A5 portrait;
            margin: 6mm;
          }
          .page-break {
            page-break-after: always;
            break-after: page;
          }
          @media print {
            body { padding: 0; }
            .no-print { display: none !important; }
          }
        </style>
      </head>
      <body>
        <div class="p-1 max-w-[540px] mx-auto">
          ${printContent}
        </div>
      </body>
      </html>
    `);
    w.document.close();
    w.focus();
    setTimeout(() => { w.print(); }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 backdrop-blur-sm overflow-y-auto py-6 px-3 sm:px-4">
      <div className="w-full max-w-3xl bg-white rounded-2xl p-4 sm:p-6 shadow-2xl border border-gray-200 animate-fade-in my-auto">
        {/* ── Modal Header ── */}
        <div className="flex items-center justify-between pb-3 border-b border-gray-200 gap-3">
          <div>
            <h2 className="text-gray-900 font-bold text-lg sm:text-xl">
              Gold & Silver Savings Scheme Passbook & Receipt
            </h2>
            <p className="text-gray-500 text-xs mt-0.5">
              Customer passbook card, payment records & scheme terms
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center transition-colors shrink-0"
          >
            <X size={18} />
          </button>
        </div>

        {/* ── View Switchers & Print Action ── */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 my-4">
          {/* Tabs in English */}
          <div className="flex bg-gray-100 p-1 rounded-xl gap-1 text-xs font-semibold">
            <button
              onClick={() => setViewSide('front')}
              className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-lg transition-all ${
                viewSide === 'front' ? 'bg-white text-amber-800 shadow-xs font-bold' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Front Side (Passbook)
            </button>
            <button
              onClick={() => setViewSide('back')}
              className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-lg transition-all ${
                viewSide === 'back' ? 'bg-white text-amber-800 shadow-xs font-bold' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Back Side (Rules & Benefits)
            </button>
            <button
              onClick={() => setViewSide('both')}
              className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-lg transition-all ${
                viewSide === 'both' ? 'bg-white text-amber-800 shadow-xs font-bold' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Both Sides
            </button>
          </div>

          {/* Print Button */}
          <button
            onClick={handlePrint}
            className="flex items-center justify-center gap-2 py-2 px-5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-bold text-xs shadow-md transition-all shrink-0 active:scale-95"
          >
            <Printer size={15} /> Print Passbook
          </button>
        </div>

        {/* ── Printable & Scrollable Card Preview Container ── */}
        <div className="rounded-xl overflow-hidden border border-gray-200 bg-gray-50/50 p-2 sm:p-4 max-h-[75vh] overflow-y-auto">
          <div id="scheme-passbook-print-area" className="space-y-6">
            {/* Front Side */}
            {(viewSide === 'front' || viewSide === 'both') && (
              <PassbookFront
                scheme={scheme}
                totalPaid={totalPaid}
                bonusAmt={bonusAmt}
                estimatedMaturityValue={estimatedMaturityValue}
                shopInfo={shopInfo}
                goldRate={goldRate}
                silverRate={silverRate}
              />
            )}

            {/* Page Break for Print when both sides are selected */}
            {viewSide === 'both' && (
              <div className="page-break my-4 border-t-2 border-dashed border-gray-300 relative text-center">
                <span className="bg-gray-100 text-gray-700 font-bold text-[10px] px-2.5 py-0.5 rounded-full absolute -top-2.5 left-1/2 -translate-x-1/2 shadow-xs print:hidden">
                  Page 2 - Back Side (Rules & Benefits)
                </span>
              </div>
            )}

            {/* Back Side */}
            {(viewSide === 'back' || viewSide === 'both') && (
              <PassbookBack
                scheme={scheme}
                shopInfo={shopInfo}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

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
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [selectedScheme, setSelectedScheme] = useState(null);
  const [previewScheme, setPreviewScheme] = useState(null);
  const [expandedSchemes, setExpandedSchemes] = useState({});

  const toggleExpand = (id) => {
    setExpandedSchemes(prev => ({ ...prev, [id]: !prev[id] }));
  };

  
  // Enroll Form State
  const [enrollForm, setEnrollForm] = useState({
    customerName: '',
    customerPhone: '',
    customerAddress: '',
    metalType: 'gold', // 'gold' | 'silver'
    schemeName: 'VJS Gold Savings Scheme',
    schemeType: 'classic_11_1', // classic_11_1, classic_5_1
    monthlyAmount: '',
    totalMonths: 11,
    bonusMonths: 1,
    interestRate: 0,
    goldRateAtEnrollment: goldRate,
    silverRateAtEnrollment: silverRate,
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

  // Lock screen scroll when any scheme popup / modal / form is active
  useScrollLock(showEnrollModal || showPayModal || showTermsModal || !!confirmAction || !!previewScheme);

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
      const is5Plus1 = enrollForm.schemeType === 'classic_5_1';
      const isSilver = enrollForm.metalType === 'silver';
      const data = {
        ...enrollForm,
        schemeName: isSilver ? 'VJS Silver Savings Scheme' : 'VJS Gold Savings Scheme',
        monthlyAmount: amt,
        totalMonths: is5Plus1 ? 5 : 11,
        bonusMonths: 1,
        interestRate: 0,
        goldRateAtEnrollment: goldRate || 0,
        silverRateAtEnrollment: silverRate || 0,
        storeId: currentStore,
        payments: [],
      };

      await onEnrollScheme(data);

      setSuccess('Scheme enrollment successful!');
      setShowEnrollModal(false);
      setPreviewScheme(data);
      setEnrollForm({
        customerName: '',
        customerPhone: '',
        customerAddress: '',
        metalType: 'gold',
        schemeName: 'VJS Gold Savings Scheme',
        schemeType: 'classic_11_1',
        monthlyAmount: '',
        totalMonths: 11,
        bonusMonths: 1,
        interestRate: 0,
        goldRateAtEnrollment: goldRate,
        silverRateAtEnrollment: silverRate,
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
      const payAmt = parseFloat(payForm.amount);
      await onPayScheme(selectedScheme._id || selectedScheme.id, {
        amount: payAmt,
        monthIndex: payForm.monthIndex,
      });

      const updatedPayments = [...(selectedScheme.payments || []), { monthIndex: payForm.monthIndex, amount: payAmt, date: new Date().toISOString() }];
      const updatedScheme = { ...selectedScheme, payments: updatedPayments };

      setSuccess('Payment recorded successfully!');
      setShowPayModal(false);
      setPreviewScheme(updatedScheme);
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
        await onRedeemScheme(scheme._id || scheme.id);
        setSuccess('Scheme successfully redeemed!');
        setPreviewScheme({ ...scheme, status: 'completed' });
      } else if (type === 'cancel') {
        await onCancelScheme(scheme._id || scheme.id);
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
      {/* ── Top Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-2xl font-bold text-gray-800">Gold & Silver Savings Schemes</h1>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
              11+1 Bonus Plan
            </span>
          </div>
          <p className="text-gray-500 text-sm mt-1">
            Manage monthly savings plans for Gold & Silver jewellery (11+1 & 5+1 schemes)
          </p>
        </div>
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => setShowTermsModal(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold text-xs shadow-xs transition-all active:scale-95"
          >
            <BookOpen size={15} />
            <span>Scheme Rules & Terms (விதிகள்)</span>
          </button>
          <button
            onClick={() => setShowEnrollModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold text-sm hover:from-amber-400 hover:to-orange-400 transition-all shadow-lg active:scale-95"
          >
            <Plus size={16} />
            New Enrollment
          </button>
        </div>
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

      {/* Schemes List View */}
      <div className="space-y-3">
        {filteredSchemes.map(scheme => {
          const isSilver = scheme.metalType === 'silver' || scheme.schemeName?.toLowerCase().includes('silver');
          const metalRate = isSilver
            ? (scheme.silverRateAtEnrollment || scheme.goldRateAtEnrollment || silverRate || 0)
            : (scheme.goldRateAtEnrollment || goldRate || 0);

          const totalPaid = scheme.payments.reduce((sum, p) => sum + p.amount, 0);
          const totalTarget = scheme.monthlyAmount * scheme.totalMonths;
          const progressPercent = Math.min((scheme.payments.length / scheme.totalMonths) * 100, 100);
          const nextDueMonth = scheme.payments.length + 1;
          const isFullyPaid = scheme.payments.length >= scheme.totalMonths;

          // Bonus is earned ONLY when fully paid (redeemable or completed)
          const bonusAmt = (scheme.schemeType === 'classic_11_1' || scheme.schemeType === 'classic_5_1') 
            ? (scheme.monthlyAmount * (scheme.bonusMonths || 1))
            : (scheme.schemeType === 'interest_plan' 
                ? (totalTarget * ((scheme.interestRate || 0) / 100))
                : scheme.monthlyAmount);

          const currentBonusEarned = (scheme.status === 'redeemable' || scheme.status === 'completed') ? bonusAmt : 0;
          const totalRedeemValue = totalPaid + currentBonusEarned;
          const estimatedMaturityValue = totalTarget + bonusAmt;
          const isExpanded = !!expandedSchemes[scheme._id];

          return (
            <div
              key={scheme._id}
              className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-5 shadow-xs hover:shadow-md hover:border-amber-200 transition-all space-y-4"
            >
              {/* ── Top Main Row (List View) ── */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[minmax(250px,1.8fr)_minmax(220px,1.4fr)_auto_auto] items-center gap-4 lg:gap-6">
                
                {/* 1. Customer Info */}
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-white font-bold text-base shrink-0 shadow-xs ${
                    isSilver ? 'bg-gradient-to-br from-slate-500 to-slate-700' : 'bg-gradient-to-br from-amber-400 to-amber-600'
                  }`}>
                    {(scheme.customerName || 'C').charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-gray-900 text-sm truncate">{scheme.customerName}</h3>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                        scheme.status === 'active' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                        scheme.status === 'redeemable' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 animate-pulse' :
                        scheme.status === 'completed' ? 'bg-gray-100 text-gray-500 border border-gray-200' :
                        scheme.status === 'cancelled' ? 'bg-red-50 text-red-700 border border-red-200' :
                        scheme.status === 'redeem_pending' ? 'bg-purple-50 text-purple-700 border border-purple-200 animate-pulse' :
                        scheme.status === 'cancel_pending' ? 'bg-orange-50 text-orange-700 border border-orange-200 animate-pulse' :
                        'bg-red-50 text-red-700 border border-red-100'
                      }`}>
                        {scheme.status?.replace('_', ' ')}
                      </span>
                      {isSilver ? (
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-bold tracking-wider bg-slate-100 text-slate-700 border border-slate-300 inline-flex items-center gap-1">
                          <Sparkles size={11} className="stroke-[2.2]" />
                          <span>Silver (0% Wastage)</span>
                        </span>
                      ) : (
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-bold tracking-wider bg-amber-50 text-amber-800 border border-amber-300 inline-flex items-center gap-1">
                          <Coins size={11} className="stroke-[2.2]" />
                          <span>Gold</span>
                        </span>
                      )}
                    </div>
                    <p className="text-gray-400 text-xs flex items-center gap-1 font-mono">
                      <Phone size={11} className="text-gray-400" /> {scheme.customerPhone}
                    </p>
                    <p className="text-amber-800/80 text-[11px] font-medium truncate">
                      {isSilver ? 'Silver' : 'Gold'} {scheme.schemeType === 'classic_5_1'
                        ? `5+1 Plan (${scheme.totalMonths} mos)`
                        : scheme.schemeType === 'classic_11_1'
                          ? `11+1 Plan (${scheme.totalMonths} mos)` 
                          : `Interest Plan (${scheme.interestRate || 0}%, ${scheme.totalMonths} mos)`}
                    </p>
                  </div>
                </div>

                {/* 2. Progress */}
                <div className="min-w-0 space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-medium">
                    <span className="text-gray-600">Installment Progress</span>
                    <span className="font-bold text-amber-800 font-mono">{scheme.payments.length} / {scheme.totalMonths} paid</span>
                  </div>
                  <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden border border-gray-200/60">
                    <div 
                      className={`h-full rounded-full transition-all duration-300 ${
                        isSilver ? 'bg-gradient-to-r from-slate-500 to-slate-700' : 'bg-gradient-to-r from-amber-500 to-orange-500'
                      }`}
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-gray-500 font-medium">
                    Monthly: <strong className="text-gray-700 font-mono">{formatCurrency(scheme.monthlyAmount)}</strong>
                  </p>
                </div>

                {/* 3. Financials */}
                <div className="min-w-0 flex flex-col justify-center">
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Total Paid</span>
                  <p className="text-gray-900 font-extrabold text-base sm:text-lg font-mono leading-tight mt-0.5 whitespace-nowrap">
                    {formatCurrency(totalPaid)}
                  </p>
                </div>

                {/* 4. Action Buttons & Show More Toggle */}
                <div className="flex items-center justify-start lg:justify-end gap-2 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-gray-100 flex-wrap">
                  {scheme.status === 'active' && (
                    <>
                      <button
                        onClick={() => handleOpenPay(scheme)}
                        className="py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-95 text-white font-bold text-xs shadow-xs transition-all whitespace-nowrap"
                      >
                        Record Pay (M{nextDueMonth})
                      </button>
                      <button
                        onClick={() => setPreviewScheme(scheme)}
                        className="py-2 px-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-100 active:scale-95 transition-all flex items-center gap-1 text-xs font-semibold whitespace-nowrap shadow-xs"
                        title="View Passbook / Receipt"
                      >
                        <Printer size={13} /> Receipt
                      </button>
                      <button
                        onClick={() => handleCancel(scheme)}
                        className="py-2 px-2.5 rounded-xl border border-gray-200 text-gray-400 hover:text-red-500 hover:bg-red-50 active:scale-95 transition-all text-xs font-semibold whitespace-nowrap"
                        title="Cancel scheme"
                      >
                        Cancel
                      </button>
                    </>
                  )}
                  {scheme.status === 'redeemable' && (
                    <button
                      onClick={() => handleRedeem(scheme)}
                      className="py-2 px-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 active:scale-95 text-white font-bold text-xs shadow-xs transition-all whitespace-nowrap"
                    >
                      Redeem (₹{totalRedeemValue.toLocaleString('en-IN')})
                    </button>
                  )}
                  {scheme.status === 'redeem_pending' && (
                    currentStaff?.role === 'Admin' ? (
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => onRedeemScheme(scheme._id, { status: 'completed' })}
                          className="py-2 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-xs transition-all shadow-xs"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => onRedeemScheme(scheme._id, { status: 'active' })}
                          className="py-2 px-3 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-100 font-bold text-xs transition-all"
                        >
                          Reject
                        </button>
                      </div>
                    ) : (
                      <span className="py-1.5 px-2.5 text-xs bg-purple-50 text-purple-700 rounded-xl font-medium border border-purple-200 animate-pulse">
                        Waiting Admin...
                      </span>
                    )
                  )}
                  {scheme.status === 'cancel_pending' && (
                    currentStaff?.role === 'Admin' ? (
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => onCancelScheme(scheme._id, { status: 'cancelled' })}
                          className="py-2 px-3 rounded-xl bg-red-500 hover:bg-red-400 text-white font-bold text-xs transition-all shadow-xs"
                        >
                          Approve Cancel
                        </button>
                        <button
                          onClick={() => onCancelScheme(scheme._id, { status: 'active' })}
                          className="py-2 px-3 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-100 font-bold text-xs transition-all"
                        >
                          Reject
                        </button>
                      </div>
                    ) : (
                      <span className="py-1.5 px-2.5 text-xs bg-orange-50 text-orange-700 rounded-xl font-medium border border-orange-200 animate-pulse">
                        Cancel Pending...
                      </span>
                    )
                  )}
                  {scheme.status === 'completed' && (
                    <span className="py-1.5 px-2.5 text-xs bg-gray-50 text-gray-400 rounded-xl font-medium border border-gray-200">
                      Redeemed
                    </span>
                  )}
                  {scheme.status === 'cancelled' && (
                    <span className="py-1.5 px-2.5 text-xs bg-red-50 text-red-500 rounded-xl font-medium border border-red-100">
                      Cancelled
                    </span>
                  )}

                  {/* Show More / Show Less Toggle Button */}
                  <button
                    type="button"
                    onClick={() => toggleExpand(scheme._id)}
                    className="py-2 px-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200/80 text-xs font-semibold flex items-center gap-1 transition-all shadow-xs whitespace-nowrap ml-auto lg:ml-0"
                  >
                    <span>{isExpanded ? 'Show Less' : 'Show More'}</span>
                    <ChevronDown
                      size={13}
                      className={`transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                    />
                  </button>
                </div>
              </div>

              {/* ── Collapsible Details (Show More / Show Less) ── */}
              {isExpanded && (
                <div className="pt-4 border-t border-gray-100 space-y-4 animate-fade-in">
                  {/* Detail Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                    <div className="bg-gray-50/80 rounded-xl p-3 border border-gray-100">
                      <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Scheme Model</span>
                      <p className="text-xs font-semibold text-gray-800 mt-1">
                        {isSilver ? 'Silver' : 'Gold'} {scheme.schemeType === 'classic_5_1'
                          ? `5+1 Bonus (${scheme.totalMonths} mos)`
                          : scheme.schemeType === 'classic_11_1'
                            ? `11+1 Bonus (${scheme.totalMonths} mos)` 
                            : `Interest (${scheme.interestRate || 0}%, ${scheme.totalMonths} mos)`}
                      </p>
                    </div>

                    <div className="bg-gray-50/80 rounded-xl p-3 border border-gray-100">
                      <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">
                        Enrollment {isSilver ? 'Silver' : 'Gold'} Rate
                      </span>
                      <p className="text-xs font-semibold text-gray-800 mt-1 font-mono">₹{metalRate}/g</p>
                    </div>

                    <div className="bg-gray-50/80 rounded-xl p-3 border border-gray-100">
                      <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Monthly Installment</span>
                      <p className="text-xs font-semibold text-gray-800 mt-1 font-mono">{formatCurrency(scheme.monthlyAmount)}</p>
                    </div>

                    <div className="bg-gray-50/80 rounded-xl p-3 border border-gray-100">
                      <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Est. Maturity Value</span>
                      <p className="text-xs font-semibold text-gray-800 mt-1 font-mono">{formatCurrency(estimatedMaturityValue)}</p>
                    </div>

                    <div className="bg-amber-50/60 rounded-xl p-3 border border-amber-100">
                      <span className="text-[10px] text-amber-700 font-bold uppercase tracking-wider block">Current Redeem Value</span>
                      <p className="text-xs font-bold text-amber-800 mt-1 font-mono">{formatCurrency(totalRedeemValue)}</p>
                    </div>
                  </div>

                  {/* Customer Address & Enrollment Info & Terms Badge */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 text-xs text-gray-500">
                    {scheme.customerAddress && (
                      <p className="flex items-center gap-1 text-gray-500">
                        <MapPin size={12} className="text-amber-500 shrink-0" />
                        <span>Address: {scheme.customerAddress}</span>
                      </p>
                    )}
                    <div className="flex items-center gap-3">
                      <span className="text-[11px] font-semibold text-amber-900 bg-amber-50 border border-amber-200/80 rounded-lg px-2 py-0.5">
                        {isSilver ? '0% Wastage on Silver Jewellery' : '100% BIS Hallmark Gold'} | Not Eligible for Coins
                      </span>
                      <p className="text-[11px] text-gray-400">
                        Enrolled: {formatDate(scheme.createdAt || scheme.enrolledAt)}
                      </p>
                    </div>
                  </div>

                  {/* Installments Payment History Table */}
                  {scheme.payments && scheme.payments.length > 0 && (
                    <div className="border border-gray-200 rounded-xl overflow-hidden shadow-xs">
                      <div className="bg-gray-50 px-3.5 py-2 border-b border-gray-200 flex justify-between items-center text-xs font-bold text-gray-700">
                        <span>Paid Installments History</span>
                        <span className="text-[11px] font-semibold text-gray-500">{scheme.payments.length} installment{scheme.payments.length !== 1 ? 's' : ''} paid</span>
                      </div>
                      <div className="divide-y divide-gray-100 max-h-40 overflow-y-auto">
                        {scheme.payments.map((p, idx) => (
                          <div key={idx} className="px-3.5 py-2 text-xs flex justify-between items-center hover:bg-gray-50/50">
                            <span className="font-semibold text-gray-700">Month {p.monthIndex || (idx + 1)}</span>
                            <span className="text-gray-400 text-[11px]">{formatDate(p.date)}</span>
                            <span className="font-mono font-bold text-gray-900">{formatCurrency(p.amount)}</span>
                            <span className="text-emerald-600 font-semibold text-[10px] bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                              <CheckCircle2 size={10} className="stroke-[2.5]" />
                              <span>Paid</span>
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
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
                {/* Metal Type Selector (Gold vs Silver) */}
                <div className="col-span-2">
                  <label className="text-xs text-gray-500 font-semibold mb-1.5 block uppercase tracking-wider">
                    Savings Scheme Metal *
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setEnrollForm(p => ({
                        ...p,
                        metalType: 'gold',
                        schemeName: 'VJS Gold Savings Scheme'
                      }))}
                      className={`p-3 rounded-xl border flex items-center gap-3 transition-all cursor-pointer ${
                        enrollForm.metalType === 'gold'
                          ? 'bg-amber-50 border-amber-400 text-amber-900 shadow-sm ring-2 ring-amber-300'
                          : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-white flex items-center justify-center font-bold text-sm shadow-xs shrink-0">
                        Au
                      </div>
                      <div className="text-left">
                        <span className="text-xs font-bold block">Gold Scheme</span>
                        <span className="text-[11px] text-amber-800 font-mono font-bold">₹{goldRate}/g (Live)</span>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setEnrollForm(p => ({
                        ...p,
                        metalType: 'silver',
                        schemeName: 'VJS Silver Savings Scheme'
                      }))}
                      className={`p-3 rounded-xl border flex items-center gap-3 transition-all cursor-pointer ${
                        enrollForm.metalType === 'silver'
                          ? 'bg-slate-100 border-slate-400 text-slate-900 shadow-sm ring-2 ring-slate-300'
                          : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-slate-500 to-slate-700 text-white flex items-center justify-center font-bold text-sm shadow-xs shrink-0">
                        Ag
                      </div>
                      <div className="text-left">
                        <span className="text-xs font-bold block">Silver Scheme</span>
                        <span className="text-[11px] text-slate-800 font-mono font-bold">₹{silverRate}/g (Live)</span>
                      </div>
                    </button>
                  </div>

                  {/* Metal-specific highlights */}
                  <div className="mt-2 text-[11px] p-2 rounded-lg bg-amber-50/70 border border-amber-200">
                    {enrollForm.metalType === 'silver' ? (
                      <p className="text-slate-900 font-semibold flex items-center gap-1.5">
                        <Sparkles size={14} className="text-emerald-600 shrink-0" />
                        <span><strong>Silver 11+1 Plan:</strong> 0% Wastage (சேதாரம் இல்லை) on silver jewellery! (Not eligible for coins).</span>
                      </p>
                    ) : (
                      <p className="text-amber-900 font-semibold flex items-center gap-1.5">
                        <Sparkles size={14} className="text-amber-600 shrink-0" />
                        <span><strong>Gold 11+1 Plan:</strong> Pay 11 months, 12th month bonus free. (Not eligible for coins).</span>
                      </p>
                    )}
                  </div>
                </div>

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

                {/* Locked Metal Rate */}
                <div>
                  <label className="text-xs text-gray-500 font-semibold mb-1 block uppercase tracking-wider">
                    {enrollForm.metalType === 'silver' ? 'Locked Silver Rate (₹/g)' : 'Locked Gold Rate (₹/g)'}
                  </label>
                  <input
                    type="text"
                    value={enrollForm.metalType === 'silver' ? `₹${silverRate}/g (Live Silver Rate)` : `₹${goldRate}/g (Live Gold Rate)`}
                    readOnly
                    className="w-full border border-gray-200 bg-gray-100 rounded-xl px-4 py-2.5 text-gray-600 font-mono text-sm cursor-not-allowed"
                  />
                </div>

                {/* Scheme Type */}
                <div className="col-span-2 space-y-2.5">
                  <label className="text-xs text-gray-500 font-semibold block uppercase tracking-wider">
                    Scheme Model ({enrollForm.metalType === 'silver' ? 'Silver' : 'Gold'})
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-gray-50 p-3.5 rounded-xl border border-gray-200">
                    {/* Classic 11+1 */}
                    <label className={`flex items-start gap-3 cursor-pointer p-3 rounded-xl border transition-all ${
                      enrollForm.schemeType === 'classic_11_1' ? 'bg-amber-50/70 border-amber-300 shadow-sm' : 'bg-white border-gray-200 hover:border-amber-200'
                    }`}>
                      <input
                        type="radio"
                        name="schemeType"
                        value="classic_11_1"
                        checked={enrollForm.schemeType === 'classic_11_1'}
                        onChange={() => setEnrollForm(p => ({ ...p, schemeType: 'classic_11_1', totalMonths: 11, bonusMonths: 1, interestRate: 0 }))}
                        className="accent-amber-500 mt-1"
                      />
                      <div>
                        <span className="text-gray-800 text-sm font-bold block">11+1 Bonus Plan</span>
                        <p className="text-[11px] text-gray-500 mt-0.5">Pay 11 months, owner pays 12th month free ({enrollForm.monthlyAmount ? `₹${parseFloat(enrollForm.monthlyAmount).toLocaleString('en-IN')}` : '₹0'} bonus)</p>
                      </div>
                    </label>

                    {/* 5+1 Bonus Plan */}
                    <label className={`flex items-start gap-3 cursor-pointer p-3 rounded-xl border transition-all ${
                      enrollForm.schemeType === 'classic_5_1' ? 'bg-amber-50/70 border-amber-300 shadow-sm' : 'bg-white border-gray-200 hover:border-amber-200'
                    }`}>
                      <input
                        type="radio"
                        name="schemeType"
                        value="classic_5_1"
                        checked={enrollForm.schemeType === 'classic_5_1'}
                        onChange={() => setEnrollForm(p => ({ ...p, schemeType: 'classic_5_1', totalMonths: 5, bonusMonths: 1, interestRate: 0 }))}
                        className="accent-amber-500 mt-1"
                      />
                      <div>
                        <span className="text-gray-800 text-sm font-bold block">5+1 Bonus Plan</span>
                        <p className="text-[11px] text-gray-500 mt-0.5">Pay 5 months, owner pays 6th month free ({enrollForm.monthlyAmount ? `₹${parseFloat(enrollForm.monthlyAmount).toLocaleString('en-IN')}` : '₹0'} bonus)</p>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Important Terms & Conditions Notice Box */}
                <div className="col-span-2 bg-amber-50/90 border border-amber-300 rounded-xl p-3 text-xs space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-amber-950">
                    <AlertCircle size={14} className="text-amber-700 shrink-0" />
                    <span>Key Terms & Conditions:</span>
                  </div>
                  <ul className="text-[11px] text-amber-900 leading-snug list-disc list-inside space-y-1 pl-1 font-medium">
                    <li>
                      <strong>Silver 11+1 Scheme:</strong> Same 11+1 scheme applies to silver articles with <strong>0% Wastage (சேதாரம் இல்லை / No VA)</strong> when claiming!
                    </li>
                    <li>
                      <strong>Strict Coin Exclusion Policy:</strong> Both Gold and Silver schemes are <strong>strictly NOT eligible for purchasing Gold or Silver coins</strong> (jewellery & ornaments only).
                    </li>
                    <li>
                      <strong>Installment Due Date:</strong> Pay promptly between the 1st and 10th of each month.
                    </li>
                  </ul>
                </div>
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

      {/* Scheme Receipt / Passbook Modal */}
      {previewScheme && (
        <SchemeReceipt
          scheme={previewScheme}
          onClose={() => setPreviewScheme(null)}
          goldRate={goldRate}
          silverRate={silverRate}
        />
      )}

      {/* Scheme Terms & Conditions Interactive Modal */}
      {showTermsModal && (
        <SchemeTermsModal
          onClose={() => setShowTermsModal(false)}
          shopInfo={SHOP_INFO}
        />
      )}
    </div>
  );
}
