import React, { useState, useEffect } from 'react';
import { 
  Wallet, Search, Plus, X, IndianRupee, Clock, 
  CheckCircle2, AlertTriangle, FileText, Printer, Camera, Image as ImageIcon, Loader2, User,
  CreditCard, Calendar, RotateCw, Layers, RefreshCw
} from 'lucide-react';
import { 
  calculateLoanInterest, calculateDueDate, getLoanDueDate, generateLoanNumber, 
  generateInvoiceNumber, formatCurrency, formatDate, SHOP_INFO, JEWEL_LOAN_TERMS,
  JEWEL_LOAN_TAMIL_TERMS, JEWEL_LOAN_OFFICE_HOURS, JEWEL_LOAN_COMPANY_DETAILS 
} from '../data.js';
import useScrollLock from '../useScrollLock.js';

// ─── Printable Jewel Loan Card Bill (Front & Backside Passbook) ───────────────
function LoanCardBillPreview({ loan, initialSide = 'front', onClose }) {
  const [activeSide, setActiveSide] = useState(initialSide); // 'front' | 'back' | 'both'
  const [invertTopForFold, setInvertTopForFold] = useState(true); // Matches Photo 1 fold mechanics

  useEffect(() => {
    setActiveSide(initialSide);
  }, [initialSide]);

  const dueDate = getLoanDueDate(loan);
  const startDate = loan.lastRenewalDate || loan.issueDate;
  const calc = calculateLoanInterest(
    loan.loanAmount,
    loan.interestRate,
    startDate,
    new Date().toISOString(),
    loan.overdueInterestRate,
    dueDate,
    loan.tenureMonths || 12
  );

  const handlePrint = (mode = 'front') => {
    let title = '';
    let bodyContent = '';

    const frontEl = document.getElementById('loan-card-front-print-area');
    const backEl = document.getElementById('loan-card-back-print-area');

    if (mode === 'front') {
      title = `CARD-BILL-FRONT-${loan.loanNumber}`;
      bodyContent = frontEl ? frontEl.innerHTML : '';
    } else if (mode === 'back') {
      title = `CARD-BILL-BACK-${loan.loanNumber}`;
      bodyContent = backEl ? backEl.innerHTML : '';
    } else {
      title = `CARD-BILL-COMPLETE-${loan.loanNumber}`;
      const frontHtml = frontEl ? frontEl.innerHTML : '';
      const backHtml = backEl ? backEl.innerHTML : '';
      bodyContent = `
        <div class="print-page">${frontHtml}</div>
        <div style="page-break-before: always; break-before: page; margin-top: 24px;"></div>
        <div class="print-page">${backHtml}</div>
      `;
    }

    const w = window.open('', '_blank');
    w.document.write(`
      <!DOCTYPE html><html><head>
      <meta charset="UTF-8">
      <title>${title} - ${SHOP_INFO.name}</title>
      <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
          font-family: 'Segoe UI', 'Nirmala UI', 'Noto Sans Tamil', Arial, sans-serif; 
          background: #fff; 
          color: #111; 
          padding: 15px; 
        }
        .card-box { width: 100%; max-width: 650px; margin: 0 auto; border: 2px solid #111; padding: 20px; border-radius: 8px; }
        .header { text-align: center; border-bottom: 2px solid #111; padding-bottom: 8px; margin-bottom: 12px; }
        @media print { 
          @page { size: A4 portrait; margin: 0.6cm; } 
          body { padding: 0; }
          .no-print { display: none !important; }
          .print-page { width: 100%; }
          ${invertTopForFold ? `
            .fold-top-panel {
              transform: rotate(180deg) !important;
              transform-origin: center center !important;
            }
          ` : ''}
        }
        ${invertTopForFold ? `
          .fold-top-panel {
            transform: rotate(180deg);
            transform-origin: center center;
          }
        ` : ''}
      </style>
      </head><body>${bodyContent}</body></html>
    `);
    w.document.close();
    w.focus();
    setTimeout(() => { w.print(); }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 backdrop-blur-sm overflow-y-auto py-3 sm:py-8 px-2 sm:px-4">
      <div className="w-full max-w-3xl bg-white rounded-2xl p-3.5 sm:p-6 shadow-2xl border border-gray-200 animate-fade-in my-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between mb-3 sm:mb-4 pb-2.5 sm:pb-3 border-b border-gray-100">
          <div>
            <h2 className="text-gray-800 font-bold text-base sm:text-xl flex items-center gap-2">
              <CreditCard className="text-amber-500 shrink-0" size={18} /> Jewel Loan Card Bill & Passbook
            </h2>
            <p className="text-gray-400 text-xs mt-0.5">Loan #{loan.loanNumber} • Customer: {loan.customerName}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center transition-colors shrink-0">
            <X size={18} />
          </button>
        </div>

        {/* View Mode Selector Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3 sm:mb-4 bg-gray-100 p-1.5 rounded-xl border border-gray-200">
          <div className="flex gap-1 overflow-x-auto pb-1 sm:pb-0 w-full sm:w-auto">
            <button
              onClick={() => setActiveSide('front')}
              className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 whitespace-nowrap ${
                activeSide === 'front' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <span>Front Side</span>
              <span className="text-[10px] text-gray-400 font-normal hidden xs:inline">(Loan Details)</span>
            </button>
            <button
              onClick={() => setActiveSide('back')}
              className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 whitespace-nowrap ${
                activeSide === 'back' ? 'bg-white text-amber-800 shadow-sm border border-amber-200' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <span>Back Side</span>
              <span className="text-[10px] text-amber-600 font-bold hidden xs:inline">(Terms & Cover)</span>
            </button>
            <button
              onClick={() => setActiveSide('both')}
              className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 whitespace-nowrap ${
                activeSide === 'both' ? 'bg-white text-blue-800 shadow-sm border border-blue-200' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <span>Both Sides</span>
            </button>
          </div>

          {/* Passbook Fold Orientation Toggle for Backside */}
          {(activeSide === 'back' || activeSide === 'both') && (
            <button
              type="button"
              onClick={() => setInvertTopForFold(!invertTopForFold)}
              className={`w-full sm:w-auto px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-all flex items-center justify-center gap-1.5 border select-none ${
                invertTopForFold 
                  ? 'bg-amber-50 text-amber-900 border-amber-300' 
                  : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
              }`}
              title={invertTopForFold ? "Top half inverted 180° so both outer sides are upright when folded (Photo 1)" : "Top half upright"}
            >
              <RotateCw size={12} className={invertTopForFold ? 'text-amber-600' : ''} />
              <span>Passbook Fold Mode: {invertTopForFold ? 'Inverted 180° (On)' : 'Upright'}</span>
            </button>
          )}
        </div>

        {/* Print Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-3 sm:mb-4">
          <button 
            onClick={() => handlePrint('front')} 
            className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs transition-all border border-gray-200"
          >
            <Printer size={14} /> Print Front Side
          </button>
          <button 
            onClick={() => handlePrint('back')} 
            className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-800 font-bold text-xs transition-all border border-blue-200"
          >
            <Printer size={14} /> Print Back Side (Terms)
          </button>
          <button 
            onClick={() => handlePrint('both')} 
            className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-bold text-xs transition-all shadow-sm"
          >
            <Printer size={14} /> Print Both Sides (Duplex)
          </button>
        </div>

        {/* ── Preview Scroll Area ── */}
        <div className="rounded-xl overflow-hidden border border-gray-200 bg-gray-100 p-2 sm:p-5 max-h-[calc(100vh-230px)] overflow-y-auto space-y-6">

          {/* ══════════════ FRONT SIDE PREVIEW ══════════════ */}
          <div className={activeSide === 'front' || activeSide === 'both' ? 'block' : 'hidden'}>
            <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center justify-between">
              <span>Side 1: Loan & Gold Pledge Details (Front)</span>
              <span className="text-[10px] bg-gray-200 text-gray-700 px-2 py-0.5 rounded font-mono">Page 1</span>
            </div>
            <div id="loan-card-front-print-area" className="bg-white text-gray-900 p-3 sm:p-5 max-w-[660px] mx-auto border-2 border-gray-900 rounded-sm shadow-sm">

              {/* ── HEADER SECTION ── */}
              <div className="border-b-2 border-gray-900 pb-2 mb-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2 flex-1">
                    <div className="w-10 h-10 rounded-full border-2 border-gray-800 flex items-center justify-center shrink-0 bg-gray-100">
                      <span className="text-[7px] font-black text-gray-500 text-center leading-tight">LOGO</span>
                    </div>
                    <div>
                      <div className="font-black text-lg tracking-wide uppercase text-gray-900 leading-tight">{SHOP_INFO.name}</div>
                      <div className="text-[10px] text-gray-600 leading-tight">{SHOP_INFO.address}</div>
                      <div className="text-[10px] text-gray-600">Ph: {SHOP_INFO.phone}{SHOP_INFO.gstNumber ? ` | GST: ${SHOP_INFO.gstNumber}` : ''}</div>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="font-mono font-black text-sm text-gray-900 border-2 border-gray-800 px-2 py-0.5 rounded">{loan.loanNumber}</div>
                    <div className="text-[9px] text-gray-500 mt-0.5 font-bold tracking-wide">LOAN A/C NO.</div>
                    <div className="text-[9px] text-red-700 font-bold font-mono mt-0.5">
                      Pkt No: {loan.packetNo || loan.loanNumber?.replace(/[^\d]/g, '').slice(-5) || '—'}
                    </div>
                  </div>
                </div>
                <div className="mt-1.5 text-center">
                  <span className="inline-block bg-gray-900 text-white font-black text-[10px] sm:text-xs px-4 py-0.5 tracking-widest uppercase">JEWEL LOAN CARD BILL / PLEDGE PASSBOOK</span>
                </div>
              </div>

              {/* ── BRANCH / CUSTOMER + LOAN DETAILS ── */}
              <div className="grid grid-cols-2 gap-x-3 text-[10.5px] border-b border-gray-700 pb-2 mb-2">
                <div className="space-y-0.5 pr-2">
                  <div className="flex gap-1">
                    <span className="font-bold w-14 shrink-0">Branch :</span>
                    <span className="text-gray-800">{JEWEL_LOAN_COMPANY_DETAILS?.branchBox?.city?.split('-')[0]?.trim() || SHOP_INFO.name}</span>
                  </div>
                  <div className="flex gap-1">
                    <span className="font-bold w-14 shrink-0">Date :</span>
                    <span>
                      {formatDate(loan.originalIssueDate || loan.issueDate)}
                      {loan.lastRenewalDate && (
                        <span className="text-emerald-700 font-bold ml-1 text-[9px]">
                          (Renewed: {formatDate(loan.lastRenewalDate)})
                        </span>
                      )}
                    </span>
                  </div>
                  <div className="flex gap-1">
                    <span className="font-bold w-14 shrink-0">Cust ID :</span>
                    <span className="font-mono">{loan.customerMobile?.slice(-6) || '—'}</span>
                  </div>
                  <div className="flex gap-1 items-start pt-0.5">
                    <span className="font-bold w-14 shrink-0 leading-tight">Name &amp;<br />Address :</span>
                    <span className="font-bold text-gray-900 leading-tight">
                      {loan.customerName}
                      {loan.customerAddress && <><br /><span className="font-normal text-gray-600">{loan.customerAddress}</span></>}
                      {loan.customerMobile && <><br /><span className="font-normal text-gray-600">Ph: {loan.customerMobile}</span></>}
                    </span>
                  </div>
                  {loan.govtProof && (
                    <div className="flex gap-1">
                      <span className="font-bold w-14 shrink-0">Govt ID :</span>
                      <span className="text-gray-700">{loan.govtProof}</span>
                    </div>
                  )}
                </div>
                <div className="space-y-0.5 border-l border-gray-700 pl-3">
                  <div className="flex justify-between">
                    <span className="font-bold">Loan Amount ₹</span>
                    <span className="font-black">{Number(loan.loanAmount).toLocaleString('en-IN')}=</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-bold">Gross Wt.</span>
                    <span>{loan.weight ? `${loan.weight} g` : '—'}</span>
                  </div>
                  {loan.purity && (
                    <div className="flex justify-between">
                      <span className="font-bold">Purity</span>
                      <span>{loan.purity}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="font-bold">Rate of Interest</span>
                    <span className="font-semibold">{loan.interestRate} %</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-bold">Scheme Name</span>
                    <span>{loan.schemeName || 'GOLD LOAN'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-bold">Loan Type</span>
                    <span>{loan.loanType || 'NEW'}</span>
                  </div>
                  <div className="flex justify-between text-red-800 font-bold border-t border-gray-400 pt-0.5 mt-0.5">
                    <span className="leading-tight">Due date for<br />Renewal/Redemption</span>
                    <span className="self-end">{formatDate(getLoanDueDate(loan))}</span>
                  </div>
                  <div className="text-[8.5px] text-gray-500 text-right">புதுப்பிக்கும் / திருப்பும் நிலுவைத் தேதி</div>
                </div>
              </div>

              {/* ── ARTICLES PLEDGED + ORNAMENTS PHOTO ── */}
              <div className="grid grid-cols-5 gap-2 border-b border-gray-700 pb-2 mb-2">
                <div className="col-span-3 text-[10.5px]">
                  <div className="font-black uppercase text-[9.5px] border-b border-gray-400 pb-0.5 mb-1 tracking-widest">ARTICLES PLEDGED</div>
                  <p className="font-bold text-gray-900 leading-tight">{loan.pledgeItem}</p>
                  {loan.huid && <p className="text-gray-600 mt-0.5">HUID: {loan.huid}</p>}
                  {loan.damagePercentage && <p className="text-amber-800 mt-0.5">Damage: {loan.damagePercentage}%</p>}
                  <div className="mt-1 space-y-0.5">
                    <div className="flex gap-2">
                      <span className="font-semibold">Gross Wt:</span>
                      <span>{loan.weight ? `${loan.weight} g` : '—'}</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="font-semibold">Purity:</span>
                      <span>{loan.purity || '—'}</span>
                    </div>
                    {loan.tenureMonths && (
                      <div className="flex gap-2">
                        <span className="font-semibold">Tenure:</span>
                        <span>{loan.tenureMonths} Months</span>
                      </div>
                    )}
                  </div>
                  {loan.customerPhoto && (
                    <div className="mt-1">
                      <div className="text-[9px] font-bold text-gray-500 mb-0.5">CUSTOMER PHOTO</div>
                      <img src={loan.customerPhoto} alt="Customer" className="max-h-16 rounded border border-gray-300" />
                    </div>
                  )}
                </div>
                <div className="col-span-2 text-[10px]">
                  <div className="font-black uppercase text-[9.5px] border-b border-gray-400 pb-0.5 mb-1 tracking-widest text-center">ORNAMENTS PHOTO</div>
                  {loan.goldImage ? (
                    <img src={loan.goldImage} alt="Ornament" className="w-full max-h-28 object-contain rounded border border-gray-300 bg-gray-50" />
                  ) : (
                    <div className="w-full h-24 border border-dashed border-gray-400 rounded flex items-center justify-center bg-gray-50 text-gray-400">
                      <div className="text-center">
                        <div className="text-xl mb-0.5">📷</div>
                        <div className="text-[9px]">Photo Here</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* ── OVERDUE NOTICE (Tamil + English) ── */}
              <div className="border border-gray-700 rounded-sm px-2.5 py-1.5 mb-2 bg-gray-50 text-[10.5px] leading-snug">
                <span className="font-bold">{formatDate(getLoanDueDate(loan))}</span>
                {' '}நிலுவைத் தேதிக்குள் கடனை பைசல் செய்ய அல்லது புதுப்பிக்கத் தவறினால்{' '}
                <span className="font-black text-red-800">{Number(loan.tenureMonths || 12)}வது</span>
                {' '}மாதத்திலிருந்து வட்டி{' '}
                <span className="font-black text-red-800 underline">{loan.overdueInterestRate || loan.interestRate} %</span>
                {' '}வசூலிக்கப்படும்.
                <span className="ml-2 text-gray-500 text-[9px]">(Overdue Rate: {loan.overdueInterestRate || loan.interestRate}%/mo)</span>
              </div>

              {/* ── LEDGER TABLE ── */}
              {(() => {
                const principal = Number(loan.loanAmount) || 0;
                const rate = Number(loan.interestRate) || 0;
                const overdueRate = Number(loan.overdueInterestRate || loan.interestRate) || rate;
                const normalInterest = calc.normalInterest || 0;
                const overdueInterest = calc.overdueInterest || 0;
                const totalInterest = calc.interestAmount || 0;
                const totalRepayable = calc.totalRepayment || principal;
                const normalMonths = parseFloat(calc.normalMonths || 0);
                const overdueMonths = parseFloat(calc.overdueMonths || 0);

                return (
                  <div className="text-[9.5px] border border-gray-800 overflow-hidden mb-2">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-gray-100 border-b border-gray-800">
                          <th className="border-r border-gray-800 px-1 py-0.5 text-left font-bold w-16">Date</th>
                          <th className="border-r border-gray-800 px-1 py-0.5 text-left font-bold">Particulars</th>
                          <th className="border-r border-gray-800 px-1 py-0.5 text-center font-bold" colSpan={2}>PRINCIPAL</th>
                          <th className="border-r border-gray-800 px-1 py-0.5 text-center font-bold" colSpan={2}>SIMPLE INTEREST</th>
                          <th className="border-r border-gray-800 px-1 py-0.5 text-center font-bold w-10">Notice ₹</th>
                          <th className="px-1 py-0.5 text-center font-bold w-8">Auth. Sign</th>
                        </tr>
                        <tr className="bg-gray-50 border-b border-gray-700 text-[8.5px]">
                          <th className="border-r border-gray-700 px-1 py-0.5"></th>
                          <th className="border-r border-gray-700 px-1 py-0.5"></th>
                          <th className="border-r border-gray-700 px-1 py-0.5 text-center">Cr. ₹</th>
                          <th className="border-r border-gray-700 px-1 py-0.5 text-center">Balance ₹</th>
                          <th className="border-r border-gray-700 px-1 py-0.5 text-center">Cr. ₹</th>
                          <th className="border-r border-gray-700 px-1 py-0.5 text-center">Balance ₹</th>
                          <th className="border-r border-gray-700 px-1 py-0.5"></th>
                          <th className="px-1 py-0.5"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {/* Row 1 — Loan Granted */}
                        <tr className="border-b border-gray-500">
                          <td className="border-r border-gray-500 px-1 py-1 leading-tight">{formatDate(loan.originalIssueDate || loan.issueDate)}</td>
                          <td className="border-r border-gray-500 px-1 py-1 font-semibold">Loan Granted</td>
                          <td className="border-r border-gray-500 px-1 py-1 text-center text-green-800 font-bold">{(loan.originalLoanAmount || principal).toLocaleString('en-IN')}=</td>
                          <td className="border-r border-gray-500 px-1 py-1 text-center font-bold">{(loan.originalLoanAmount || principal).toLocaleString('en-IN')}=</td>
                          <td className="border-r border-gray-500 px-1 py-1 text-center">—</td>
                          <td className="border-r border-gray-500 px-1 py-1 text-center">0.00</td>
                          <td className="border-r border-gray-500 px-1 py-1"></td>
                          <td className="px-1 py-1 text-center font-bold">{loan.staffName?.substring(0, 3)?.toUpperCase() || ''}</td>
                        </tr>

                        {/* Renewal history rows */}
                        {loan.renewals?.map((ren, idx) => (
                          <React.Fragment key={`ren-${idx}`}>
                            {ren.principalPaid > 0 && (
                              <tr className="border-b border-gray-400 bg-emerald-50/50">
                                <td className="border-r border-gray-400 px-1 py-1 leading-tight">{formatDate(ren.renewalDate)}</td>
                                <td className="border-r border-gray-400 px-1 py-1 font-medium text-emerald-900">Part Principal Repaid</td>
                                <td className="border-r border-gray-400 px-1 py-1 text-center text-emerald-800 font-bold">{ren.principalPaid.toLocaleString('en-IN')}=</td>
                                <td className="border-r border-gray-400 px-1 py-1 text-center font-bold">{ren.newPrincipal.toLocaleString('en-IN')}=</td>
                                <td className="border-r border-gray-400 px-1 py-1 text-center">—</td>
                                <td className="border-r border-gray-400 px-1 py-1 text-center">—</td>
                                <td className="border-r border-gray-400 px-1 py-1"></td>
                                <td className="px-1 py-1 text-center font-bold">{ren.staffName?.substring(0, 3)?.toUpperCase() || ''}</td>
                              </tr>
                            )}
                            <tr className="border-b border-gray-400 bg-blue-50/50">
                              <td className="border-r border-gray-400 px-1 py-1 leading-tight">{formatDate(ren.renewalDate)}</td>
                              <td className="border-r border-gray-400 px-1 py-1 font-semibold text-blue-900">
                                Renewal #{idx + 1}: Int. Paid ({ren.monthsPaid ? Number(ren.monthsPaid).toFixed(1) + ' mo' : 'cleared'})
                              </td>
                              <td className="border-r border-gray-400 px-1 py-1 text-center">—</td>
                              <td className="border-r border-gray-400 px-1 py-1 text-center font-bold">{ren.newPrincipal.toLocaleString('en-IN')}=</td>
                              <td className="border-r border-gray-400 px-1 py-1 text-center text-blue-800 font-bold">{ren.interestPaid.toLocaleString('en-IN')}</td>
                              <td className="border-r border-gray-400 px-1 py-1 text-center font-bold text-gray-700">0.00</td>
                              <td className="border-r border-gray-400 px-1 py-1"></td>
                              <td className="px-1 py-1 text-center font-bold">{ren.staffName?.substring(0, 3)?.toUpperCase() || ''}</td>
                            </tr>
                          </React.Fragment>
                        ))}

                        {/* Row 2 — Interest Accrued (Normal) */}
                        {normalMonths > 0 && (
                          <tr className="border-b border-gray-400">
                            <td className="border-r border-gray-400 px-1 py-1 leading-tight">{formatDate(getLoanDueDate(loan))}</td>
                            <td className="border-r border-gray-400 px-1 py-1">
                              Interest @ {rate}%/mo × {normalMonths.toFixed(1)} mo
                            </td>
                            <td className="border-r border-gray-400 px-1 py-1 text-center">—</td>
                            <td className="border-r border-gray-400 px-1 py-1 text-center font-bold">{principal.toLocaleString('en-IN')}=</td>
                            <td className="border-r border-gray-400 px-1 py-1 text-center text-blue-800 font-bold">{normalInterest.toLocaleString('en-IN')}</td>
                            <td className="border-r border-gray-400 px-1 py-1 text-center font-bold">{normalInterest.toLocaleString('en-IN')}</td>
                            <td className="border-r border-gray-400 px-1 py-1"></td>
                            <td className="px-1 py-1 text-center">{loan.staffName?.substring(0, 3)?.toUpperCase() || ''}</td>
                          </tr>
                        )}

                        {/* Row 3 — Overdue Interest (if applicable) */}
                        {calc.isOverdue && overdueMonths > 0 && (
                          <tr className="border-b border-red-300 bg-red-50">
                            <td className="border-r border-red-300 px-1 py-1 leading-tight text-red-800">{formatDate(new Date().toISOString())}</td>
                            <td className="border-r border-red-300 px-1 py-1 text-red-800 font-semibold">
                              Overdue @ {overdueRate}%/mo × {overdueMonths.toFixed(1)} mo
                            </td>
                            <td className="border-r border-red-300 px-1 py-1 text-center">—</td>
                            <td className="border-r border-red-300 px-1 py-1 text-center font-bold text-red-800">{principal.toLocaleString('en-IN')}=</td>
                            <td className="border-r border-red-300 px-1 py-1 text-center text-red-800 font-bold">{overdueInterest.toLocaleString('en-IN')}</td>
                            <td className="border-r border-red-300 px-1 py-1 text-center font-bold text-red-800">{totalInterest.toLocaleString('en-IN')}</td>
                            <td className="border-r border-red-300 px-1 py-1"></td>
                            <td className="px-1 py-1 text-center text-red-800">{loan.staffName?.substring(0, 3)?.toUpperCase() || ''}</td>
                          </tr>
                        )}

                        {/* Blank rows for manual entries */}
                        {[...Array(calc.isOverdue && overdueMonths > 0 ? 3 : 4)].map((_, i) => (
                          <tr key={i} className="border-b border-gray-300" style={{ height: '22px' }}>
                            <td className="border-r border-gray-300"></td>
                            <td className="border-r border-gray-300"></td>
                            <td className="border-r border-gray-300"></td>
                            <td className="border-r border-gray-300"></td>
                            <td className="border-r border-gray-300"></td>
                            <td className="border-r border-gray-300"></td>
                            <td className="border-r border-gray-300"></td>
                            <td></td>
                          </tr>
                        ))}

                        {/* TOTAL ROW */}
                        <tr className="bg-amber-50 border-t-2 border-gray-800 font-bold">
                          <td className="border-r border-gray-700 px-1 py-1" colSpan={2}>TOTAL AS ON DATE</td>
                          <td className="border-r border-gray-700 px-1 py-1 text-center">—</td>
                          <td className="border-r border-gray-700 px-1 py-1 text-center text-amber-900">{principal.toLocaleString('en-IN')}=</td>
                          <td className="border-r border-gray-700 px-1 py-1 text-center">—</td>
                          <td className="border-r border-gray-700 px-1 py-1 text-center text-blue-900">{totalInterest.toLocaleString('en-IN')}</td>
                          <td className="border-r border-gray-700 px-1 py-1"></td>
                          <td className="px-1 py-1 text-center text-green-900">{totalRepayable.toLocaleString('en-IN')}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                );
              })()}

              {/* ── DEBIT / CREDIT SUMMARY ── */}
              {(() => {
                const principal = Number(loan.loanAmount) || 0;
                const totalInterest = calc.interestAmount || 0;
                const totalRepayable = calc.totalRepayment || principal;
                return (
                  <div className="grid grid-cols-2 gap-3 text-[9.5px] mb-3">
                    <div className="border border-gray-400 p-1.5 space-y-0.5">
                      <div className="font-bold border-b border-gray-300 pb-0.5 mb-0.5">Debit : LOAN GRANT AMOUNT</div>
                      <div className="flex justify-between">
                        <span>Principal Loan Amount</span>
                        <span>{principal.toLocaleString('en-IN')}.00</span>
                      </div>
                      <div className="flex justify-between text-blue-800">
                        <span>Interest ({loan.interestRate}%/mo × {calc.normalMonths} mo)</span>
                        <span>{(calc.normalInterest || 0).toLocaleString('en-IN')}.00</span>
                      </div>
                      {calc.isOverdue && (calc.overdueInterest || 0) > 0 && (
                        <div className="flex justify-between text-red-700">
                          <span>Overdue Interest ({loan.overdueInterestRate || loan.interestRate}%)</span>
                          <span>{(calc.overdueInterest || 0).toLocaleString('en-IN')}.00</span>
                        </div>
                      )}
                      <div className="flex justify-between font-bold border-t border-gray-400 pt-0.5">
                        <span>TOTAL ₹</span>
                        <span className="underline">{totalRepayable.toLocaleString('en-IN')}.00</span>
                      </div>
                    </div>
                    <div className="border border-gray-400 p-1.5 space-y-0.5">
                      <div className="font-bold border-b border-gray-300 pb-0.5 mb-0.5">Credit : {loan.customerName}</div>
                      <div className="flex justify-between">
                        <span>Loan Amount Disbursed</span>
                        <span>{principal.toLocaleString('en-IN')}.00</span>
                      </div>
                      <div className="flex justify-between text-gray-600">
                        <span>Rate : {loan.interestRate}%/mo | Tenure : {loan.tenureMonths || 12} mo</span>
                        <span></span>
                      </div>
                      <div className="flex justify-between font-bold border-t border-gray-400 pt-0.5">
                        <span>TOTAL ₹</span>
                        <span className="underline">{principal.toLocaleString('en-IN')}.00</span>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* ── SIGNATURES ── */}
              <div className="flex justify-between items-end pt-3 border-t border-dashed border-gray-500 text-[10px]">
                <div className="text-center">
                  <div className="h-8"></div>
                  <div className="border-t border-gray-800 w-28 pt-1 font-bold">Customer Signature</div>
                </div>
                <div className="text-center text-[9px] text-gray-600">
                  <div className="font-semibold text-gray-700">Issued By</div>
                  <div className="font-bold text-gray-900">{loan.staffName}</div>
                </div>
                <div className="text-center">
                  <div className="h-8"></div>
                  <div className="border-t border-gray-800 w-28 pt-1 font-bold">For {SHOP_INFO.name}</div>
                  <div className="text-gray-500">Authorized Signature</div>
                </div>
              </div>
            </div>
          </div>

          {/* ══════════════ BACK SIDE PREVIEW (TERMS & PASSBOOK COVER) ══════════════ */}
          <div className={activeSide === 'back' || activeSide === 'both' ? 'block' : 'hidden'}>
            <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center justify-between">
              <span>Side 2: Foldable Passbook Cover & Tamil Terms (Backside)</span>
              <span className="text-[10px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-mono">Page 2</span>
            </div>
              <div id="loan-card-back-print-area" className="bg-white text-gray-900 p-5 sm:p-7 max-w-[620px] mx-auto border-2 border-gray-900 rounded-lg shadow-sm flex flex-col justify-between min-h-[750px]">
                
                {/* ─── TOP PANEL: SHOP DETAILS / PASSBOOK FRONT COVER (Photo 3 - Upside Down for Folding) ─── */}
                <div 
                  className={`text-center space-y-2 py-4 transition-transform duration-300 ${invertTopForFold ? 'fold-top-panel' : ''}`}
                  style={{
                    transform: invertTopForFold ? 'rotate(180deg)' : 'none',
                    transformOrigin: 'center center',
                    WebkitTransform: invertTopForFold ? 'rotate(180deg)' : 'none',
                  }}
                >
                  {/* Empty Logo Area (Placeholder as requested: leave logo empty, will update later) */}
                  <div className="w-20 h-20 mx-auto rounded-full border-2 border-dashed border-blue-900 flex flex-col items-center justify-center text-blue-950/40 select-none bg-blue-50/20">
                    <div className="w-14 h-14 rounded-full border border-blue-900/30 flex items-center justify-center">
                      <span className="text-[10px] font-extrabold tracking-wider text-blue-900/50">[ LOGO ]</span>
                    </div>
                  </div>

                  {/* Header Badge */}
                  <div>
                    <span className="inline-block bg-[#1e3a8a] text-white font-black text-xs sm:text-sm px-4 py-1 rounded tracking-wider uppercase shadow-xs">
                      {JEWEL_LOAN_COMPANY_DETAILS.badge}
                    </span>
                  </div>

                  {/* Company / Nidhi Full Legal Name */}
                  <div>
                    <h3 className="font-serif font-extrabold text-base sm:text-lg text-gray-950 tracking-wide">
                      {JEWEL_LOAN_COMPANY_DETAILS.companyName}
                    </h3>
                    <p className="text-[11px] font-bold text-gray-700 tracking-wider mt-0.5">{JEWEL_LOAN_COMPANY_DETAILS.cin}</p>
                    <p className="text-[10.5px] text-gray-600 mt-0.5">{JEWEL_LOAN_COMPANY_DETAILS.regdOffice}</p>
                    <p className="text-[10.5px] text-gray-600">
                      E-mail : {JEWEL_LOAN_COMPANY_DETAILS.email} &nbsp; Website : {JEWEL_LOAN_COMPANY_DETAILS.website}
                    </p>
                  </div>

                  {/* Branch Stamp Box */}
                  <div className="pt-2">
                    <p className="text-xs font-black tracking-widest text-blue-950 uppercase mb-1.5">
                      {JEWEL_LOAN_COMPANY_DETAILS.branchBox.title}
                    </p>
                    <div className="border-2 border-blue-950 rounded-lg p-3 max-w-[360px] mx-auto bg-blue-50/30 text-center space-y-0.5 shadow-xs">
                      <p className="font-extrabold text-xs sm:text-sm text-blue-950 tracking-wide uppercase">
                        {JEWEL_LOAN_COMPANY_DETAILS.branchBox.name}
                      </p>
                      <p className="text-xs font-semibold text-gray-800">{JEWEL_LOAN_COMPANY_DETAILS.branchBox.building}</p>
                      <p className="text-xs text-gray-700">{JEWEL_LOAN_COMPANY_DETAILS.branchBox.street}</p>
                      <p className="text-xs font-bold text-gray-900 uppercase">{JEWEL_LOAN_COMPANY_DETAILS.branchBox.city}</p>
                      <p className="text-xs font-bold text-blue-950 mt-1">📞 : {JEWEL_LOAN_COMPANY_DETAILS.branchBox.phone}</p>
                      <p className="text-[10.5px] text-gray-600">email: {JEWEL_LOAN_COMPANY_DETAILS.branchBox.email}</p>
                    </div>
                  </div>

                  {/* Address Change Notice */}
                  <p className="text-[9.5px] font-bold text-gray-600 tracking-wider uppercase pt-2">
                    * {JEWEL_LOAN_COMPANY_DETAILS.footerNotice}
                  </p>
                </div>

                {/* ─── HORIZONTAL FOLD LINE DIVIDER ─── */}
                <div className="my-6 border-t-2 border-dashed border-gray-400 relative text-center">
                  <span className="bg-white px-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest relative -top-2 select-none">
                    ✂️ மடிக்க வேண்டிய இடம் / Fold Line Across Center ✂️
                  </span>
                </div>

                {/* ─── BOTTOM PANEL: TAMIL TERMS & CONDITIONS (நகைக் கடன் விதிகள்) (Photo 2) ─── */}
                <div className="space-y-3 pt-1">
                  <h4 className="font-bold text-center text-sm sm:text-base text-gray-950 border-b-2 border-gray-900 pb-1.5 tracking-wide">
                    நகைக் கடன் விதிகள்
                  </h4>

                  {/* Selected Points: 1 to 6 Order Wise */}
                  <div className="space-y-2 text-[11px] sm:text-xs text-gray-900 leading-relaxed text-justify">
                    {JEWEL_LOAN_TAMIL_TERMS.map(({ num, text }) => (
                      <div key={num} className="flex items-start gap-1.5">
                        <span className="font-bold text-gray-900 shrink-0 min-w-[20px]">{num}.</span>
                        <p className="flex-1">{text}</p>
                      </div>
                    ))}
                  </div>

                  {/* Managing Director Signature */}
                  <div className="flex justify-end pt-2 text-right">
                    <div className="text-center w-36">
                      <div className="border-t border-gray-800 pt-1 font-bold text-xs text-gray-900">
                        {JEWEL_LOAN_OFFICE_HOURS.authority}
                      </div>
                    </div>
                  </div>

                  {/* Office Hours Table */}
                  <div className="border border-gray-800 rounded mt-2 overflow-hidden text-[10.5px]">
                    <div className="bg-gray-100 font-bold text-center py-1 border-b border-gray-800 text-xs text-gray-900">
                      {JEWEL_LOAN_OFFICE_HOURS.title}
                    </div>
                    <div className="grid grid-cols-2 divide-x divide-gray-800">
                      {/* Main / City Branches */}
                      <div className="p-2 space-y-1">
                        <p className="font-bold text-center underline text-[11px] text-gray-900">
                          {JEWEL_LOAN_OFFICE_HOURS.mainBranches.title}
                        </p>
                        <p>{JEWEL_LOAN_OFFICE_HOURS.mainBranches.weekdays}</p>
                        <p>{JEWEL_LOAN_OFFICE_HOURS.mainBranches.sunday}</p>
                      </div>
                      {/* Other Branches */}
                      <div className="p-2 space-y-1">
                        <p className="font-bold text-center underline text-[11px] text-gray-900">
                          {JEWEL_LOAN_OFFICE_HOURS.otherBranches.title}
                        </p>
                        <p>{JEWEL_LOAN_OFFICE_HOURS.otherBranches.weekdays}</p>
                        <p>{JEWEL_LOAN_OFFICE_HOURS.otherBranches.sunday}</p>
                      </div>
                    </div>
                  </div>

                  {/* Schedule Footnotes */}
                  <div className="text-center text-[10.5px] text-gray-800 space-y-0.5 pt-1 font-medium">
                    <p>{JEWEL_LOAN_OFFICE_HOURS.lunchBreak}</p>
                    <p className="font-bold text-gray-950">
                      வார விடுமுறை : <span className="font-bold text-amber-900 underline">Monday (திங்கட்கிழமை)</span>
                    </p>
                  </div>
                </div>

              </div>
            </div>

        </div>
      </div>
    </div>
  );
}

// ─── Printable Customer Jewel Loan Card Slip (நகை ஈட்டுக் கடன் ரசீது) ───────────────
function LoanCustomerCardModal({ loan, onClose }) {
  const dueDate = getLoanDueDate(loan);
  const packetNo = loan.packetNo || loan.loanNumber?.replace(/[^\d]/g, '').slice(-5) || '17642';

  const handlePrintCard = () => {
    const cardEl = document.getElementById('loan-customer-card-print-area');
    if (!cardEl) return;
    const w = window.open('', '_blank');
    w.document.write(`
      <!DOCTYPE html><html><head>
      <meta charset="UTF-8">
      <title>CUSTOMER-CARD-${loan.loanNumber} - ${SHOP_INFO.name}</title>
      <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
          font-family: 'Segoe UI', 'Nirmala UI', 'Noto Sans Tamil', Arial, sans-serif; 
          background: #fff; 
          color: #111; 
          padding: 10px;
          display: flex;
          justify-content: center;
        }
        @media print { 
          @page { size: 105mm 150mm; margin: 4mm; } 
          body { padding: 0; }
          .no-print { display: none !important; }
        }
        .slip-outer {
          width: 100%;
          max-width: 400px;
          background-color: #eaf4fc !important;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
          border: 2px solid #0284c7;
          border-radius: 8px;
          padding: 14px;
        }
      </style>
      </head><body>
        <div class="slip-outer">${cardEl.innerHTML}</div>
      </body></html>
    `);
    w.document.close();
    w.focus();
    setTimeout(() => { w.print(); }, 500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm overflow-y-auto py-4 px-3">
      <div className="w-full max-w-md bg-white rounded-2xl p-4 sm:p-6 shadow-2xl border border-gray-200 animate-fade-in my-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between mb-3 pb-2.5 border-b border-gray-100">
          <div>
            <h2 className="text-gray-800 font-bold text-base sm:text-lg flex items-center gap-2">
              <CreditCard className="text-blue-600 shrink-0" size={18} /> வாடிக்கையாளர் அட்டை ரசீது
            </h2>
            <p className="text-gray-400 text-xs">Customer Pledge Slip • {loan.customerName}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 mb-3">
          <button
            onClick={handlePrintCard}
            className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs sm:text-sm transition-all shadow-sm flex items-center justify-center gap-1.5 active:scale-95"
          >
            <Printer size={15} /> Print Card (ரசீது அச்சிடு)
          </button>
          <button
            onClick={onClose}
            className="py-2 px-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-xs transition-all"
          >
            Close
          </button>
        </div>

        {/* Authentic Customer Slip Preview Area matching photo */}
        <div className="rounded-xl overflow-hidden border border-blue-200 bg-gray-50 p-2 sm:p-3 max-h-[calc(100vh-200px)] overflow-y-auto">
          <div 
            id="loan-customer-card-print-area" 
            className="bg-[#eaf4fc] text-gray-900 p-4 rounded-lg border-2 border-[#0284c7] shadow-sm max-w-[380px] mx-auto select-none"
            style={{ fontFamily: "'Segoe UI', 'Nirmala UI', 'Noto Sans Tamil', Arial, sans-serif" }}
          >
            {/* Top Row: Shop Info Left, Packet No Right */}
            <div className="flex items-start justify-between gap-2 border-b border-blue-300 pb-2">
              <div className="flex-1">
                <div className="flex items-center gap-1">
                  <span className="font-black text-xs sm:text-sm text-blue-950 uppercase tracking-wide leading-tight">
                    {SHOP_INFO.name}
                  </span>
                </div>
                <div className="text-[10px] font-bold text-blue-800 uppercase leading-tight mt-0.5">
                  {JEWEL_LOAN_COMPANY_DETAILS?.branchBox?.city?.split('-')[0]?.trim() || 'KRISHNAGIRI MAIN'} BRANCH
                </div>
                <div className="text-[9.5px] text-gray-700 leading-tight">
                  Ph: {SHOP_INFO.phone}
                </div>
              </div>

              {/* Packet No Box with symbol like in photo */}
              <div className="text-right shrink-0">
                <div className="text-[10px] font-bold text-blue-900 font-serif leading-none mb-0.5">ஏ/ட</div>
                <div className="border-2 border-blue-900 bg-white/80 px-2 py-0.5 rounded text-center min-w-[70px]">
                  <div className="text-[8px] font-bold text-gray-600 uppercase tracking-wider leading-none">Packet No.</div>
                  <div className="font-mono font-black text-xs sm:text-sm text-red-600 leading-tight mt-0.5">{packetNo}</div>
                </div>
              </div>
            </div>

            {/* Main Title Banner */}
            <div className="my-2 py-1 px-2 border-2 border-blue-900 rounded-lg text-center bg-white/60">
              <div className="font-black text-blue-950 text-sm sm:text-base tracking-wide leading-tight">
                நகை ஈட்டுக் கடன் ரசீது
              </div>
              <div className="text-[8.5px] font-bold text-blue-800 tracking-wider uppercase">
                JEWEL PLEDGE LOAN RECEIPT
              </div>
              {loan.lastRenewalDate && (
                <div className="mt-1">
                  <span className="inline-block bg-emerald-700 text-white text-[8px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                    புதுப்பிக்கப்பட்டது • Renewed ({loan.renewals?.length || 1}x)
                  </span>
                </div>
              )}
            </div>

            {/* Data Rows */}
            <div className="text-[11px] sm:text-xs text-gray-900 space-y-1.5 pt-1">
              <div className="flex justify-between items-baseline border-b border-blue-200/70 pb-1">
                <span className="font-bold text-blue-950 shrink-0">பெயர் :</span>
                <span className="font-bold text-gray-950 text-right truncate ml-2">{loan.customerName}</span>
              </div>

              <div className="flex justify-between items-baseline border-b border-blue-200/70 pb-1">
                <span className="font-bold text-blue-950 shrink-0">நகை ஈட்டு கடன் எண் :</span>
                <span className="font-mono font-black text-red-700 text-right ml-2">{loan.loanNumber}</span>
              </div>

              <div className="flex justify-between items-baseline border-b border-blue-200/70 pb-1">
                <span className="font-bold text-blue-950 shrink-0">தேதி :</span>
                <span className="font-semibold text-blue-950 text-right ml-2">
                  {formatDate(loan.originalIssueDate || loan.issueDate)}
                  {loan.lastRenewalDate && (
                    <span className="text-emerald-700 font-bold ml-1 text-[9.5px]">
                      (புதுப்பித்தது: {formatDate(loan.lastRenewalDate)})
                    </span>
                  )}
                </span>
              </div>

              <div className="flex justify-between items-baseline border-b border-blue-200/70 pb-1">
                <span className="font-bold text-blue-950 shrink-0">தொகை ரூ. :</span>
                <span className="font-black text-sm sm:text-base text-gray-950 text-right ml-2">
                  ₹ {Number(loan.loanAmount).toLocaleString('en-IN')}/-
                </span>
              </div>

              <div className="flex justify-between items-baseline border-b border-blue-200/70 pb-1">
                <span className="font-bold text-red-900 shrink-0">திருப்பு செலுத்த வேண்டிய தேதி :</span>
                <span className="font-black text-red-900 text-right ml-2">{formatDate(dueDate)}</span>
              </div>
            </div>

            {/* Bottom Boxed Row (கீ: weight / items / rate) */}
            <div className="mt-2 p-2 rounded border border-blue-500 bg-white/70 text-[11px]">
              <div className="flex items-center justify-between gap-1">
                <div>
                  <span className="font-black text-blue-950">கீ : </span>
                  <span className="font-black text-gray-900">{loan.weight ? `${loan.weight}g` : ''}</span>
                  <span className="text-gray-700 ml-1">({loan.pledgeItem} {loan.purity})</span>
                </div>
                <div className="font-bold text-blue-900 text-[10.5px] shrink-0">
                  {loan.interestRate}%/mo
                </div>
              </div>
              {loan.damagePercentage && (
                <div className="text-[9.5px] text-amber-800 font-semibold mt-0.5">
                  சேத விபரம்: {loan.damagePercentage}
                </div>
              )}
            </div>

            {/* Signature Area with Seal */}
            <div className="mt-3 pt-3 border-t border-dashed border-blue-400 flex justify-between items-end text-[10px]">
              <div className="text-center">
                <div className="w-20 border-b border-blue-900 pb-0.5 mb-1"></div>
                <span className="font-bold text-blue-950">கடன் பெறுபவர்</span>
              </div>

              {/* Manager Seal & Sign */}
              <div className="text-center relative">
                <div className="w-20 border-b border-blue-900 pb-0.5 mb-1 font-serif italic text-blue-900 text-[10px]">
                  {loan.staffName || 'Staff'}
                </div>
                <span className="font-bold text-blue-950">மேலாளர்</span>
              </div>
            </div>

            {/* Footer conditions */}
            <div className="mt-2.5 pt-2 border-t border-blue-300 text-[9px] text-blue-950 space-y-0.5 leading-tight">
              <p>✤ இந்த ரசீதை கவனமாக பாதுகாக்க வேண்டும்.</p>
              <p>✤ {loan.tenureMonths || 11} மாதங்களுக்குள் நகையை மீட்டுக்கொள்ள வேண்டும்.</p>
              <p>✤ தவணைக்கு மேல் கூடுதல் வட்டி வசூலிக்கப்படும்.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Modal for Renewing Jewel Loan (புதுப்பித்தல்) ─────────────────────────────
function RenewLoanModal({ loan, onClose, onConfirm, currentStaff }) {
  const [interestPaid, setInterestPaid] = useState('');
  const [principalPaid, setPrincipalPaid] = useState('0');
  const [tenureMonths, setTenureMonths] = useState(String(loan.tenureMonths || 12));
  const [paymentMode, setPaymentMode] = useState('Cash');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const dueDate = getLoanDueDate(loan);
  const startDate = loan.lastRenewalDate || loan.issueDate;
  const calc = calculateLoanInterest(
    loan.loanAmount,
    loan.interestRate,
    startDate,
    new Date().toISOString(),
    loan.overdueInterestRate,
    dueDate,
    loan.tenureMonths || 12
  );

  // Initialize interest to calculated accrued interest
  useEffect(() => {
    setInterestPaid(String(Math.round(calc.interestAmount || 0)));
  }, [calc.interestAmount]);

  const currentPrincipal = Number(loan.loanAmount) || 0;
  const numInt = Math.max(0, Number(interestPaid) || 0);
  const numPrinPaid = Math.max(0, Number(principalPaid) || 0);
  const totalCollect = numInt + numPrinPaid;
  const newPrincipal = currentPrincipal - numPrinPaid;
  const newDueDate = calculateDueDate(new Date(), parseInt(tenureMonths || '12', 10));

  const handleRenew = async () => {
    if (numPrinPaid >= currentPrincipal) {
      setError("To pay full principal and close the loan, please use 'Settle' instead.");
      return;
    }
    if (numInt <= 0 && numPrinPaid <= 0) {
      setError("Please enter the interest amount to collect for renewal.");
      return;
    }
    setError('');
    setLoading(true);

    try {
      const now = new Date();
      const renewalRecord = {
        renewalDate: now.toISOString(),
        interestPaid: numInt,
        principalPaid: numPrinPaid,
        previousPrincipal: currentPrincipal,
        newPrincipal: newPrincipal,
        previousDueDate: dueDate ? dueDate.toISOString() : loan.dueDate,
        newDueDate: newDueDate.toISOString(),
        monthsPaid: calc.months,
        tenureMonths: parseInt(tenureMonths || '12', 10),
        paymentMode,
        notes: notes.trim(),
        staffId: currentStaff?.id || currentStaff?._id,
        staffName: currentStaff?.name || 'Staff',
      };

      const updatedLoan = {
        ...loan,
        originalIssueDate: loan.originalIssueDate || loan.issueDate,
        originalLoanAmount: loan.originalLoanAmount || currentPrincipal,
        lastRenewalDate: now.toISOString(),
        dueDate: newDueDate.toISOString(),
        loanAmount: newPrincipal,
        tenureMonths: parseInt(tenureMonths || '12', 10),
        renewals: [...(loan.renewals || []), renewalRecord],
      };

      await onConfirm(updatedLoan, totalCollect);
    } catch (err) {
      setError(err.message || 'Failed to renew loan');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 text-gray-800">
      <div className="w-full max-w-lg bg-white border border-gray-200 rounded-2xl p-5 sm:p-6 shadow-2xl max-h-[92vh] overflow-y-auto animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
          <div>
            <h2 className="text-gray-800 font-bold text-lg sm:text-xl flex items-center gap-2">
              <RefreshCw className="text-emerald-600" size={20} /> Renew Jewel Loan (புதுப்பித்தல்)
            </h2>
            <p className="text-gray-400 text-xs mt-0.5">Loan #{loan.loanNumber} • {loan.customerName}</p>
          </div>
          <button onClick={onClose} disabled={loading} className="w-8 h-8 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center transition-colors">
            <X size={18} />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-medium">
            {error}
          </div>
        )}

        {/* Current Loan & Interest Breakdown Card */}
        <div className="bg-emerald-50/60 border border-emerald-200/80 rounded-xl p-3.5 mb-4 text-xs space-y-2">
          <div className="flex justify-between items-center font-bold text-emerald-950 border-b border-emerald-200/60 pb-1.5">
            <span>Current Principal Amount:</span>
            <span className="font-extrabold text-sm sm:text-base text-emerald-900">{formatCurrency(currentPrincipal)}</span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-gray-700 pt-0.5">
            <div>
              <span className="text-gray-400 font-medium">From Date:</span>
              <p className="font-semibold text-gray-900">{formatDate(startDate)}</p>
            </div>
            <div className="text-right">
              <span className="text-gray-400 font-medium">Current Due Date:</span>
              <p className="font-semibold text-gray-900">{dueDate ? formatDate(dueDate) : 'N/A'}</p>
            </div>
            <div>
              <span className="text-gray-400 font-medium">Period Elapsed:</span>
              <p className="font-semibold text-gray-900">{calc.days} days ({calc.months} months)</p>
            </div>
            <div className="text-right">
              <span className="text-gray-400 font-medium">Standard Rate:</span>
              <p className="font-semibold text-gray-900">{loan.interestRate}%/mo</p>
            </div>
          </div>

          {calc.isOverdue && (
            <div className="p-2 bg-red-50 border border-red-200 rounded-lg text-red-800 text-[11px] font-semibold flex items-center gap-1.5">
              <AlertTriangle size={14} className="shrink-0 text-red-600" />
              <span>
                Loan is OVERDUE! Overdue rate ({loan.overdueInterestRate || loan.interestRate}%/mo) applied for {calc.overdueMonths.toFixed(1)} mo.
              </span>
            </div>
          )}

          <div className="flex justify-between items-center font-bold text-gray-900 pt-1 border-t border-emerald-200/60">
            <span>Accrued Interest Due:</span>
            <span className="font-extrabold text-sm sm:text-base text-blue-900">{formatCurrency(calc.interestAmount)}</span>
          </div>
        </div>

        {/* Renewal Form Inputs */}
        <div className="space-y-3 mb-4">
          <div>
            <label className="text-xs text-gray-600 font-bold mb-1 block uppercase tracking-wider">
              Interest Amount to Collect (வட்டி தொகை) *
            </label>
            <input 
              type="number"
              value={interestPaid}
              onWheel={(e) => e.target.blur()}
              onChange={e => setInterestPaid(e.target.value)}
              className="w-full border border-gray-300 bg-gray-50 focus:bg-white rounded-xl px-3.5 py-2.5 text-gray-900 text-sm font-bold focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 focus:outline-none"
              placeholder="e.g. 1500"
            />
            <p className="text-[11px] text-gray-400 mt-0.5">Auto-calculated accrued interest. You can adjust or round off if needed.</p>
          </div>

          <div>
            <label className="text-xs text-gray-600 font-bold mb-1 block uppercase tracking-wider">
              Principal Part-Payment (அசல் பகுதி செலுத்துதல் - Optional)
            </label>
            <input 
              type="number"
              value={principalPaid}
              onWheel={(e) => e.target.blur()}
              onChange={e => setPrincipalPaid(e.target.value)}
              className="w-full border border-gray-300 bg-gray-50 focus:bg-white rounded-xl px-3.5 py-2.5 text-gray-900 text-sm font-bold focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 focus:outline-none"
              placeholder="0 (leave 0 if customer only pays interest)"
            />
            <p className="text-[11px] text-gray-400 mt-0.5">If customer is also paying cash towards principal, enter amount here.</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-600 font-bold mb-1 block uppercase tracking-wider">
                New Tenure (புதிய தவணை)
              </label>
              <select
                value={tenureMonths}
                onChange={e => setTenureMonths(e.target.value)}
                className="w-full border border-gray-300 bg-gray-50 focus:bg-white rounded-xl px-3 py-2 text-gray-900 text-xs sm:text-sm font-semibold focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 focus:outline-none"
              >
                <option value="6">6 Months</option>
                <option value="12">12 Months (1 Year)</option>
                <option value="18">18 Months</option>
                <option value="24">24 Months (2 Years)</option>
              </select>
            </div>

            <div>
              <label className="text-xs text-gray-600 font-bold mb-1 block uppercase tracking-wider">
                Payment Mode
              </label>
              <select
                value={paymentMode}
                onChange={e => setPaymentMode(e.target.value)}
                className="w-full border border-gray-300 bg-gray-50 focus:bg-white rounded-xl px-3 py-2 text-gray-900 text-xs sm:text-sm font-semibold focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 focus:outline-none"
              >
                <option value="Cash">Cash (பணம்)</option>
                <option value="UPI">UPI / GPay / PhonePe</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Cheque">Cheque</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs text-gray-600 font-bold mb-1 block uppercase tracking-wider">
              Notes (குறிப்பு - optional)
            </label>
            <input 
              type="text"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="w-full border border-gray-300 bg-gray-50 focus:bg-white rounded-xl px-3.5 py-2 text-gray-900 text-xs sm:text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 focus:outline-none"
              placeholder="e.g. Paid interest in cash and renewed for 1 year"
            />
          </div>
        </div>

        {/* Live Summary Box */}
        <div className="bg-gray-100 rounded-xl p-3.5 mb-5 border border-gray-200 text-xs space-y-1.5">
          <div className="flex justify-between items-center text-sm font-bold text-gray-900">
            <span>Total Cash to Collect:</span>
            <span className="text-base sm:text-lg text-emerald-700 font-black">{formatCurrency(totalCollect)}</span>
          </div>
          <div className="flex justify-between text-gray-600 pt-1 border-t border-gray-200">
            <span>New Principal Balance:</span>
            <span className="font-bold text-gray-900">{formatCurrency(newPrincipal)}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>New Due Date:</span>
            <span className="font-bold text-amber-800">{formatDate(newDueDate)}</span>
          </div>
        </div>

        {/* Modal Buttons */}
        <div className="flex gap-2.5">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-xs sm:text-sm transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleRenew}
            disabled={loading}
            className="flex-2 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs sm:text-sm transition-all shadow-md flex items-center justify-center gap-2 active:scale-95 disabled:opacity-60"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
            {loading ? 'Renewing Loan...' : 'Confirm Renewal (புதுப்பித்தல்)'}
          </button>
        </div>
      </div>
    </div>
  );
}

const emptyLoan = {
  customerName: '', customerMobile: '', govtProof: '',
  pledgeItem: '', huid: '', packetNo: '', weight: '', purity: '22K', 
  loanAmount: '', interestRate: '1.5', overdueInterestRate: '2.0',
  tenureMonths: '12', damagePercentage: '',
};

export default function LoansPage({ loans, bills = [], onSaveLoan, onUpdateLoan, onGenerateBill, currentStaff, currentStore }) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyLoan);
  const [success, setSuccess] = useState('');
  const [formError, setFormError] = useState('');
  const [goldImage, setGoldImage] = useState(null);
  const [goldImagePreview, setGoldImagePreview] = useState(null);
  const [customerPhoto, setCustomerPhoto] = useState(null);
  const [customerPhotoPreview, setCustomerPhotoPreview] = useState(null);
  
  const [settleLoanId, setSettleLoanId] = useState(null);
  const [previewCardBill, setPreviewCardBill] = useState(null);
  const [cardBillSide, setCardBillSide] = useState('front');
  const [previewCustomerCard, setPreviewCustomerCard] = useState(null);
  const [renewLoan, setRenewLoan] = useState(null);
  const [loanSaveLoading, setLoanSaveLoading] = useState(false);

  // Lock screen scroll when any loan popup modal / form is active
  useScrollLock(showForm || !!settleLoanId || !!previewCardBill || !!previewCustomerCard || !!renewLoan);

  const handleConfirmRenewal = async (updatedLoan, totalCollected) => {
    await onUpdateLoan(updatedLoan);
    setRenewLoan(null);
    setSuccess(`Loan #${updatedLoan.loanNumber} renewed successfully! Total collected: ${formatCurrency(totalCollected)}`);
    setTimeout(() => setSuccess(''), 4000);
    setPreviewCardBill(updatedLoan);
    setCardBillSide('front');
  };

  const filtered = loans.filter(l => {
    if (filter === 'Overdue') {
      const loanDueDate = getLoanDueDate(l);
      const isPastDue = loanDueDate ? new Date() > new Date(loanDueDate) : false;
      return l.status === 'Active' && isPastDue;
    }
    if (filter !== 'All' && l.status !== filter) {
      return false;
    }
    const q = search.toLowerCase();
    const huid = (l.huid || '').toLowerCase();
    const govt = (l.govtProof || '').toLowerCase();
    return l.customerName.toLowerCase().includes(q) ||
           l.customerMobile.includes(q) ||
           l.loanNumber.toLowerCase().includes(q) ||
           huid.includes(q) ||
           govt.includes(q);
  }).sort((a, b) => new Date(b.issueDate) - new Date(a.issueDate));

  const totalActiveLoansAmount = loans.filter(l => l.status === 'Active').reduce((s, l) => s + l.loanAmount, 0);

  const handleGoldImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const MAX_SIZE = 1024 * 1024; // 1 MB
    if (file.size > MAX_SIZE) {
      setFormError(`Article photo is too large (${(file.size / (1024 * 1024)).toFixed(2)} MB). Maximum allowed size is 1 MB.`);
      e.target.value = '';
      return;
    }
    setFormError('');
    const reader = new FileReader();
    reader.onloadend = () => {
      setGoldImage(reader.result);
      setGoldImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleCustomerPhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const MAX_SIZE = 1024 * 1024; // 1 MB
    if (file.size > MAX_SIZE) {
      setFormError(`Customer photo is too large (${(file.size / (1024 * 1024)).toFixed(2)} MB). Maximum allowed size is 1 MB.`);
      e.target.value = '';
      return;
    }
    setFormError('');
    const reader = new FileReader();
    reader.onloadend = () => {
      setCustomerPhoto(reader.result);
      setCustomerPhotoPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleCreate = async () => {
    if (!form.customerName || !form.customerMobile || !form.pledgeItem || !form.weight || !form.loanAmount) {
      setFormError('Please fill all required fields: Customer Name, Mobile, Item, Weight, and Loan Amount.');
      return;
    }
    setFormError('');
    setLoanSaveLoading(true);

    const issueDate = new Date();
    const tenureMonths = parseInt(form.tenureMonths || '12', 10);
    const dueDate = calculateDueDate(issueDate, tenureMonths);

    const newLoan = {
      storeId: currentStore,
      loanNumber: generateLoanNumber(loans),
      packetNo: form.packetNo?.trim() || (generateLoanNumber(loans)?.replace(/[^\d]/g, '').slice(-5) || '17642'),
      customerName: form.customerName,
      customerMobile: form.customerMobile,
      govtProof: form.govtProof || '',
      pledgeItem: form.pledgeItem,
      huid: form.huid || '',
      damagePercentage: form.damagePercentage || '',
      weight: parseFloat(form.weight),
      purity: form.purity,
      loanAmount: parseFloat(form.loanAmount),
      interestRate: parseFloat(form.interestRate),
      overdueInterestRate: parseFloat(form.overdueInterestRate || form.interestRate),
      tenureMonths: tenureMonths,
      issueDate: issueDate.toISOString(),
      dueDate: dueDate.toISOString(),
      status: 'Active',
      staffId: currentStaff?.id || currentStaff?._id,
      staffName: currentStaff?.name || 'Staff',
      goldImage: goldImage || null,
      customerPhoto: customerPhoto || null,
    };

    try {
      await onSaveLoan(newLoan);

      setShowForm(false);
      setForm(emptyLoan);
      setGoldImage(null);
      setGoldImagePreview(null);
      setCustomerPhoto(null);
      setCustomerPhotoPreview(null);
      setSuccess('Jewel Loan issued successfully!');
      setTimeout(() => setSuccess(''), 3000);
      setPreviewCardBill(newLoan);
      setCardBillSide('front');
    } catch (err) {
      setFormError('Failed to issue loan: ' + (err.message || 'Unknown error'));
    } finally {
      setLoanSaveLoading(false);
    }
  };

  const handleSettle = async () => {
    const loan = loans.find(l => (l.id || l._id) === settleLoanId);
    if (!loan) return;
    
    const now = new Date().toISOString();
    const dueDate = getLoanDueDate(loan);
    const startDate = loan.lastRenewalDate || loan.issueDate;
    const calc = calculateLoanInterest(
      loan.loanAmount,
      loan.interestRate,
      startDate,
      now,
      loan.overdueInterestRate,
      dueDate,
      loan.tenureMonths || 12
    );
    
    const updatedLoan = {
      ...loan,
      status: 'Closed',
      closingDate: now,
      monthsCalculated: calc.months,
      interestAccrued: calc.interestAmount,
      totalRepaid: calc.totalRepayment
    };
    
    try {
      await onUpdateLoan(updatedLoan);

      setSettleLoanId(null);
      setSuccess('Jewel Loan settled successfully!');
      setTimeout(() => setSuccess(''), 3000);
      
      setPreviewCardBill(updatedLoan);
      setCardBillSide('front');
    } catch (err) {
      setFormError('Failed to settle loan: ' + (err.message || 'Unknown error'));
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Wallet className="text-amber-500" />
            Jewel Loan Solutions
          </h1>
          <p className="text-gray-400 text-xs sm:text-sm mt-0.5">Manage pledged items, interest rates & card billing</p>
        </div>
        <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4">
          <div className="text-left sm:text-right bg-amber-50 sm:bg-transparent px-3 py-1.5 sm:p-0 rounded-xl border border-amber-200 sm:border-0">
            <p className="text-gray-500 sm:text-gray-450 text-[11px] sm:text-xs font-medium">Total Active Loans</p>
            <p className="text-amber-700 sm:text-amber-600 font-bold text-sm sm:text-base">{formatCurrency(totalActiveLoansAmount)}</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-1.5 sm:gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold text-xs sm:text-sm hover:from-amber-400 hover:to-orange-400 transition-all shadow-md shrink-0 active:scale-95"
          >
            <Plus size={16} /> Issue Loan
          </button>
        </div>
      </div>

      {success && (
        <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-xl p-3 sm:p-4 animate-fade-in text-xs sm:text-sm">
          <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
          <p className="text-emerald-700 font-semibold">{success}</p>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-2xl p-3 sm:p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-450" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by loan no, name, mobile, HUID or Govt ID..."
              className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-2 sm:py-2.5 text-gray-850 text-xs sm:text-sm focus:outline-none focus:border-amber-450 focus:ring-2 focus:ring-amber-100 transition-all"
            />
          </div>
          <div className="grid grid-cols-2 sm:flex gap-1.5 sm:gap-2">
            {['All', 'Active', 'Overdue', 'Closed'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`py-1.5 sm:py-2 px-3 sm:px-4 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-1.5
                  ${filter === f 
                    ? f === 'Overdue' ? 'bg-red-600 text-white shadow-sm' : 'bg-amber-500 text-white shadow-sm' 
                    : 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200'}`}
              >
                {f === 'Overdue' && <AlertTriangle size={13} />}
                {f === 'All' ? 'All Loans' : f}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Loans List */}
      {/* Loans List View */}
      <div className="space-y-3">
        {filtered.map(loan => {
          const loanDueDate = getLoanDueDate(loan);
          const isOverdue = loanDueDate && loan.status === 'Active' ? new Date() > new Date(loanDueDate) : false;

          return (
            <div
              key={loan.id || loan._id}
              className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-5 hover:shadow-md transition-all shadow-sm"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[minmax(220px,2fr)_minmax(180px,1.5fr)_minmax(140px,1.2fr)_auto] items-center gap-4 w-full">
                
                {/* 1. Customer & Avatar / Photo */}
                <div className="flex items-center gap-3 min-w-0">
                  {(loan.customerPhoto || loan.goldImage) ? (
                    <div className="flex items-center gap-1.5 shrink-0">
                      {loan.customerPhoto && (
                        <div className="w-10 h-10 rounded-xl overflow-hidden border border-blue-200 shrink-0 relative shadow-xs" title="Customer Photo">
                          <img src={loan.customerPhoto} alt="Customer" className="w-full h-full object-cover" />
                        </div>
                      )}
                      {loan.goldImage && (
                        <div className="w-10 h-10 rounded-xl overflow-hidden border border-amber-300 shrink-0 relative shadow-xs" title="Pledged Article Photo">
                          <img src={loan.goldImage} alt="Article item" className="w-full h-full object-cover" />
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-xs">
                      {(loan.customerName || 'C').charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-gray-900 font-bold text-sm sm:text-base truncate">{loan.customerName}</h3>
                      {loan.status === 'Closed' && (
                        <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-full">CLOSED</span>
                      )}
                      {loan.status === 'SettlePending' && (
                        <span className="bg-purple-50 text-purple-700 border border-purple-200 text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse">PENDING</span>
                      )}
                      {isOverdue && (
                        <span className="bg-red-50 text-red-600 border border-red-200 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                          <AlertTriangle size={10} /> OVERDUE
                        </span>
                      )}
                    </div>
                    <p className="text-gray-400 text-xs mt-0.5 font-mono">{loan.customerMobile}</p>
                    {loan.govtProof && (
                      <p className="text-amber-700/80 text-[11px] font-medium truncate mt-0.5">Govt ID: {loan.govtProof}</p>
                    )}
                  </div>
                </div>

                {/* 2. Loan Number & Dates */}
                <div className="min-w-0 text-left">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-gray-800 font-mono text-xs font-bold bg-gray-100 border border-gray-200 px-2.5 py-0.5 rounded-md">
                      {loan.loanNumber}
                    </span>
                    {loan.packetNo && (
                      <span className="text-gray-400 text-[11px] font-mono">#{loan.packetNo}</span>
                    )}
                  </div>
                  <div className="text-[11px] text-gray-500 mt-1 space-y-0.5">
                    <p className="flex items-center gap-1.5">
                      <span className="text-gray-400">Issued:</span>
                      <span className="font-medium text-gray-700">{formatDate(loan.originalIssueDate || loan.issueDate)}</span>
                    </p>
                    <p className="flex items-center gap-1.5">
                      <span className="text-gray-400">Due:</span>
                      <span className={isOverdue ? 'text-red-600 font-bold' : 'font-medium text-gray-700'}>
                        {loanDueDate ? formatDate(loanDueDate) : 'N/A'}
                      </span>
                    </p>
                    {loan.lastRenewalDate && (
                      <p className="text-emerald-700 font-bold text-[10px]">
                        Renewed: {formatDate(loan.lastRenewalDate)} ({loan.renewals?.length || 1}x)
                      </p>
                    )}
                  </div>
                </div>

                {/* 3. Principal Amount */}
                <div className="text-left lg:text-right min-w-0">
                  <p className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">PRINCIPAL</p>
                  <p className="text-amber-600 font-extrabold text-base sm:text-lg font-mono whitespace-nowrap">
                    {formatCurrency(loan.loanAmount)}
                  </p>
                </div>

                {/* 4. Action Buttons (All 4 buttons visible for all loans) */}
                <div className="flex items-center justify-start lg:justify-end gap-1.5 shrink-0 pt-3 lg:pt-0 border-t lg:border-t-0 border-gray-100 flex-wrap">
                  <button
                    onClick={() => { setPreviewCardBill(loan); setCardBillSide('front'); }}
                    className="py-2 px-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 hover:bg-amber-100 text-xs font-semibold transition-all flex items-center gap-1.5 shadow-xs active:scale-95 whitespace-nowrap shrink-0"
                    title="View & Print Full Jewel Loan Bill (Front & Both Sides)"
                  >
                    <FileText size={13} className="text-amber-600" /> Receipt
                  </button>

                  <button
                    onClick={() => setPreviewCustomerCard(loan)}
                    className="py-2 px-2.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-800 hover:bg-blue-100 text-xs font-semibold transition-all flex items-center gap-1.5 shadow-xs active:scale-95 whitespace-nowrap shrink-0"
                    title="Print Customer Card Slip (நகை ஈட்டுக் கடன் ரசீது)"
                  >
                    <CreditCard size={13} className="text-blue-600" /> Card
                  </button>

                  <button
                    onClick={() => setRenewLoan(loan)}
                    className="py-2 px-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 hover:bg-emerald-100 text-xs font-semibold transition-all flex items-center gap-1 shadow-xs active:scale-95 whitespace-nowrap shrink-0"
                    title="Renew Loan (Customer pays interest to renew)"
                  >
                    <RefreshCw size={12} className="text-emerald-600" /> Renew
                  </button>

                  <button
                    onClick={() => {
                      if (loan.status === 'Closed') {
                        setPreviewCardBill(loan);
                        setCardBillSide('front');
                      } else {
                        setSettleLoanId(loan.id || loan._id);
                      }
                    }}
                    className="py-2 px-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-white text-xs font-semibold transition-all shadow-xs flex items-center active:scale-95 whitespace-nowrap shrink-0"
                    title={loan.status === 'Closed' ? 'View Settled Receipt & Bill' : 'Settle Jewel Loan'}
                  >
                    Settle
                  </button>
                </div>

              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="text-center py-12 bg-white border border-gray-200 rounded-2xl shadow-sm animate-fade-in">
            <Wallet size={48} className="text-gray-300 mx-auto mb-4" />
            <p className="text-gray-400 font-semibold">No loans found</p>
          </div>
        )}
      </div>

      {/* Settle Loan Confirmation Modal */}
      {settleLoanId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 text-gray-800">
          <div className="w-full max-w-md bg-white border border-gray-200 rounded-2xl p-6 shadow-2xl animate-fade-in">
            <h2 className="text-gray-800 font-bold text-xl mb-4 flex items-center gap-2 border-b border-gray-100 pb-2">
              <CheckCircle2 className="text-emerald-500" /> Settle Jewel Loan
            </h2>
            
            {(() => {
              const loan = loans.find(l => (l.id || l._id) === settleLoanId);
              const dueDate = getLoanDueDate(loan);
              const startDate = loan.lastRenewalDate || loan.issueDate;
              const calc = calculateLoanInterest(
                loan.loanAmount, 
                loan.interestRate, 
                startDate, 
                new Date().toISOString(),
                loan.overdueInterestRate,
                dueDate,
                loan.tenureMonths || 12
              );
              
              return (
                <div className="space-y-3 mb-6 bg-gray-50 border border-gray-200 rounded-xl p-4 text-sm">
                  <div className="flex justify-between text-gray-500"><span>Principal:</span> <span className="font-semibold">{formatCurrency(loan.loanAmount)}</span></div>
                  <div className="flex justify-between text-gray-500"><span>Duration:</span> <span className="font-semibold">{calc.months} months</span></div>
                  <div className="flex justify-between text-gray-500"><span>Standard Interest ({loan.interestRate}%/mo):</span> <span className="font-semibold">{formatCurrency(calc.normalInterest)}</span></div>
                  {calc.isOverdue && (
                    <div className="flex justify-between text-red-600 font-semibold">
                      <span>Overdue Extra ({loan.overdueInterestRate || loan.interestRate}%/mo):</span> <span>{formatCurrency(calc.overdueInterest)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-gray-800 font-bold text-lg pt-2 border-t border-gray-200">
                    <span>Total Amount to Collect:</span> <span className="text-amber-600">{formatCurrency(calc.totalRepayment)}</span>
                  </div>
                </div>
              );
            })()}

            <div className="flex gap-3">
              <button onClick={() => setSettleLoanId(null)} className="flex-1 py-2.5 rounded-xl bg-gray-100 border border-gray-200 text-gray-650 font-semibold hover:bg-gray-200 transition-all">Cancel</button>
              <button onClick={handleSettle} className="flex-1 py-2.5 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-500 transition-all shadow-sm">Confirm Settlement</button>
            </div>
          </div>
        </div>
      )}

      {/* Issue New Gold Loan Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 text-gray-800">
          <div className="w-full max-w-xl bg-white border border-gray-200 rounded-2xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto animate-fade-in">
            <div className="flex items-center justify-between mb-6 pb-2 border-b border-gray-100">
              <h2 className="text-gray-800 font-bold text-xl">Issue New Jewel Loan</h2>
              <button 
                onClick={() => { 
                  setShowForm(false); 
                  setGoldImage(null); 
                  setGoldImagePreview(null); 
                  setCustomerPhoto(null); 
                  setCustomerPhotoPreview(null);
                }} 
                className="w-9 h-9 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="text-xs text-gray-500 font-semibold mb-1.5 block uppercase tracking-wider">Customer Name *</label>
                <input type="text" value={form.customerName} onChange={e => setForm(p => ({ ...p, customerName: e.target.value }))} className="w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-2.5 text-gray-800 text-sm focus:border-amber-400 focus:ring-2 focus:ring-amber-100 focus:outline-none" />
              </div>
              <div className="col-span-2 sm:col-span-1">
                <label className="text-xs text-gray-500 font-semibold mb-1.5 block uppercase tracking-wider">Mobile Number *</label>
                <input type="tel" value={form.customerMobile} onChange={e => setForm(p => ({ ...p, customerMobile: e.target.value }))} maxLength={10} className="w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-2.5 text-gray-800 text-sm focus:border-amber-400 focus:ring-2 focus:ring-amber-100 focus:outline-none" />
              </div>
              <div className="col-span-2 sm:col-span-1">
                <label className="text-xs text-gray-500 font-semibold mb-1.5 block uppercase tracking-wider">Govt Proof ID</label>
                <input type="text" placeholder="Aadhaar / PAN / Voter ID" value={form.govtProof} onChange={e => setForm(p => ({ ...p, govtProof: e.target.value }))} className="w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-2.5 text-gray-800 text-sm focus:border-amber-400 focus:ring-2 focus:ring-amber-100 focus:outline-none" />
              </div>
              <div className="col-span-2 sm:col-span-1">
                <label className="text-xs text-gray-500 font-semibold mb-1.5 block uppercase tracking-wider">Item Pledged *</label>
                <input type="text" placeholder="e.g. Gold Bangle 22K" value={form.pledgeItem} onChange={e => setForm(p => ({ ...p, pledgeItem: e.target.value }))} className="w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-2.5 text-gray-800 text-sm focus:border-amber-400 focus:ring-2 focus:ring-amber-100 focus:outline-none" />
              </div>
              <div className="col-span-2 sm:col-span-1">
                <label className="text-xs text-gray-500 font-semibold mb-1.5 block uppercase tracking-wider">HUID No (optional)</label>
                <input type="text" placeholder="e.g. HUID-8901234" value={form.huid} onChange={e => setForm(p => ({ ...p, huid: e.target.value }))} className="w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-2.5 text-gray-800 text-sm focus:border-amber-400 focus:ring-2 focus:ring-amber-100 focus:outline-none" />
              </div>
              <div className="col-span-2 sm:col-span-1">
                <label className="text-xs text-gray-500 font-semibold mb-1.5 block uppercase tracking-wider">Packet No (பாக்கெட் எண்)</label>
                <input type="text" placeholder="e.g. 17642 (Auto if empty)" value={form.packetNo || ''} onChange={e => setForm(p => ({ ...p, packetNo: e.target.value }))} className="w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-2.5 text-gray-800 text-sm focus:border-amber-400 focus:ring-2 focus:ring-amber-100 focus:outline-none" />
              </div>
              <div>
                <label className="text-xs text-gray-500 font-semibold mb-1.5 block uppercase tracking-wider">Weight (g) *</label>
                <input type="number" value={form.weight} onWheel={(e) => e.target.blur()} onChange={e => setForm(p => ({ ...p, weight: e.target.value }))} className="w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-2.5 text-gray-800 text-sm focus:border-amber-400 focus:ring-2 focus:ring-amber-100 focus:outline-none" />
              </div>
              <div>
                <label className="text-xs text-gray-500 font-semibold mb-1.5 block uppercase tracking-wider">Purity</label>
                <select value={form.purity} onChange={e => setForm(p => ({ ...p, purity: e.target.value }))} className="w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-2.5 text-gray-800 text-sm focus:border-amber-400 focus:ring-2 focus:ring-amber-100 focus:outline-none">
                  {['24K', '22K', '18K', '14K'].map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div className="col-span-2">
                <label className="text-xs text-gray-500 font-semibold mb-1.5 block uppercase tracking-wider">If Any Damage Description</label>
                <input type="text" placeholder="Scratch on lock / None" value={form.damagePercentage} onChange={e => setForm(p => ({ ...p, damagePercentage: e.target.value }))} className="w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-2.5 text-gray-800 text-sm focus:border-amber-400 focus:ring-2 focus:ring-amber-100 focus:outline-none" />
              </div>

              <div>
                <label className="text-xs text-gray-500 font-semibold mb-1.5 block uppercase tracking-wider">Loan Principal (₹) *</label>
                <input type="number" value={form.loanAmount} onWheel={(e) => e.target.blur()} onChange={e => setForm(p => ({ ...p, loanAmount: e.target.value }))} className="w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-2.5 text-gray-800 text-sm focus:border-amber-400 focus:ring-2 focus:ring-amber-100 focus:outline-none" />
              </div>
              <div>
                <label className="text-xs text-gray-500 font-semibold mb-1.5 block uppercase tracking-wider">Tenure (Months)</label>
                <select value={form.tenureMonths} onChange={e => setForm(p => ({ ...p, tenureMonths: e.target.value }))} className="w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-2.5 text-gray-800 text-sm focus:border-amber-400 focus:ring-2 focus:ring-amber-100 focus:outline-none">
                  <option value="6">6 Months</option>
                  <option value="12">12 Months (1 Year)</option>
                  <option value="18">18 Months</option>
                  <option value="24">24 Months (2 Years)</option>
                </select>
                <p className="text-[11px] text-amber-700 font-medium mt-1">
                  Due Date: {formatDate(calculateDueDate(new Date(), parseInt(form.tenureMonths || '12', 10)))} (1 day before full tenure)
                </p>
              </div>

              <div>
                <label className="text-xs text-gray-500 font-semibold mb-1.5 block uppercase tracking-wider">Standard Rate (%/mo) *</label>
                <input type="number" step="0.1" value={form.interestRate} onWheel={(e) => e.target.blur()} onChange={e => setForm(p => ({ ...p, interestRate: e.target.value }))} className="w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-2.5 text-gray-800 text-sm focus:border-amber-400 focus:ring-2 focus:ring-amber-100 focus:outline-none" />
              </div>

              <div>
                <label className="text-xs text-gray-500 font-semibold mb-1.5 block uppercase tracking-wider">Overdue Rate (%/mo)</label>
                <input type="number" step="0.1" value={form.overdueInterestRate} onWheel={(e) => e.target.blur()} onChange={e => setForm(p => ({ ...p, overdueInterestRate: e.target.value }))} className="w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-2.5 text-gray-800 text-sm focus:border-amber-400 focus:ring-2 focus:ring-amber-100 focus:outline-none" />
              </div>

              {/* Photo Uploads */}
              <div className="col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-600 font-semibold mb-2 block uppercase tracking-wider flex items-center gap-1.5">
                    <User size={13} className="text-blue-500" /> Customer Photo
                  </label>
                  <div className="border border-gray-200 bg-gray-50 rounded-xl p-3.5">
                    <div className="flex flex-col items-center gap-2 text-center">
                      <div className="w-20 h-20 rounded-xl overflow-hidden bg-white border border-gray-200 flex items-center justify-center shrink-0 shadow-sm">
                        {customerPhotoPreview ? (
                          <img src={customerPhotoPreview} alt="Customer" className="w-full h-full object-cover" />
                        ) : (
                          <User size={32} className="text-gray-300" />
                        )}
                      </div>
                      <label className="flex items-center gap-1.5 cursor-pointer px-3 py-1.5 rounded-xl bg-white border border-gray-200 text-gray-700 hover:bg-gray-100 transition-all text-xs font-semibold shadow-sm">
                        <Camera size={13} />
                        {customerPhotoPreview ? 'Change' : 'Upload'}
                        <input type="file" accept="image/*" onChange={handleCustomerPhotoChange} className="hidden" />
                      </label>
                      <span className="text-[10px] text-gray-400 font-medium">Max size: 1 MB</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-xs text-gray-600 font-semibold mb-2 block uppercase tracking-wider flex items-center gap-1.5">
                    <Camera size={13} className="text-amber-500" /> Article Photo (Jewel)
                  </label>
                  <div className="border border-gray-200 bg-gray-50 rounded-xl p-3.5">
                    <div className="flex flex-col items-center gap-2 text-center">
                      <div className="w-20 h-20 rounded-xl overflow-hidden bg-white border border-gray-200 flex items-center justify-center shrink-0 shadow-sm">
                        {goldImagePreview ? (
                          <img src={goldImagePreview} alt="Article item" className="w-full h-full object-cover" />
                        ) : (
                          <ImageIcon size={32} className="text-gray-300" />
                        )}
                      </div>
                      <label className="flex items-center gap-1.5 cursor-pointer px-3 py-1.5 rounded-xl bg-white border border-gray-200 text-gray-700 hover:bg-gray-100 transition-all text-xs font-semibold shadow-sm">
                        <Camera size={13} />
                        {goldImagePreview ? 'Change' : 'Upload'}
                        <input type="file" accept="image/*" onChange={handleGoldImageChange} className="hidden" />
                      </label>
                      <span className="text-[10px] text-gray-400 font-medium">Max size: 1 MB</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {formError && (
              <div className="flex items-center gap-2 text-red-700 bg-red-50 border border-red-200 rounded-xl px-3 py-2 mt-4 text-xs font-medium animate-fade-in">
                <span>⚠️</span> {formError}
              </div>
            )}

            <div className="flex gap-3 mt-6 border-t border-gray-100 pt-4">
              <button 
                onClick={() => { 
                  setShowForm(false); 
                  setGoldImage(null); 
                  setGoldImagePreview(null); 
                  setCustomerPhoto(null); 
                  setCustomerPhotoPreview(null); 
                  setFormError(''); 
                }} 
                disabled={loanSaveLoading} 
                className="flex-1 py-3 rounded-xl bg-gray-100 border border-gray-200 text-gray-650 font-semibold hover:bg-gray-200 transition-all disabled:opacity-50"
              >
                Cancel
              </button>
              <button onClick={handleCreate} disabled={loanSaveLoading} className="flex-1 py-3 rounded-xl bg-amber-500 text-white font-bold hover:bg-amber-400 transition-all shadow-sm disabled:opacity-60 flex items-center justify-center gap-2">
                {loanSaveLoading ? <Loader2 size={16} className="animate-spin" /> : null}
                {loanSaveLoading ? 'Issuing Loan...' : 'Issue Loan & Card'}
              </button>
            </div>
          </div>
        </div>
      )}


      {/* Card Bill Modal */}
      {previewCardBill && (
        <LoanCardBillPreview 
          loan={previewCardBill} 
          initialSide={cardBillSide} 
          onClose={() => setPreviewCardBill(null)} 
        />
      )}

      {/* Customer Card Modal */}
      {previewCustomerCard && (
        <LoanCustomerCardModal loan={previewCustomerCard} onClose={() => setPreviewCustomerCard(null)} />
      )}

      {/* Renew Loan Modal */}
      {renewLoan && (
        <RenewLoanModal 
          loan={renewLoan} 
          onClose={() => setRenewLoan(null)} 
          onConfirm={handleConfirmRenewal} 
          currentStaff={currentStaff} 
        />
      )}
    </div>
  );
}
