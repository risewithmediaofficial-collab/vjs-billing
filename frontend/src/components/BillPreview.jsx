import React, { useRef, useState, useEffect } from 'react';
import { X, Printer, Download, MessageCircle, Mail, FileText, CheckCircle2, Sparkles, BookOpen, Layers } from 'lucide-react';
import { formatCurrency, formatDate, SHOP_INFO } from '../data.js';
import useScrollLock from '../useScrollLock.js';

function BillContent({ bill, viewMode }) {
  // Resolve customer details safely
  const customerName = bill.customerName || bill.customer?.name || 'Walk-in Customer';
  const customerMobile = bill.customerMobile || bill.customer?.phone || '—';
  const customerAddress = bill.customerAddress || bill.customer?.address || '';

  // Resolve totals safely
  const goldValue = bill.totalGoldValue ?? bill.goldValue ?? 0;
  const makingCharge = bill.totalMaking ?? bill.makingTotal ?? 0;
  const stoneCharge = bill.totalStone ?? bill.stoneTotal ?? 0;
  const taxableValue = bill.taxableValue ?? (goldValue + makingCharge + stoneCharge);
  
  // Determine if GST is charged on this bill
  const isGstCharged = bill?.includeGst !== false && (
    (bill.totalGST !== undefined && bill.totalGST > 0) ||
    (bill.gstAmount !== undefined && bill.gstAmount > 0) ||
    (bill.cgstAmount !== undefined && bill.cgstAmount > 0) ||
    (bill.includeGst === true)
  );

  // Split GST: CGST 1.5% and SGST 1.5%
  const cgstAmount = isGstCharged ? (bill.cgstAmount ?? Math.round((taxableValue * 0.015) * 100) / 100) : 0;
  const sgstAmount = isGstCharged ? (bill.sgstAmount ?? Math.round((taxableValue * 0.015) * 100) / 100) : 0;
  const gstAmount = isGstCharged ? (bill.totalGST ?? bill.gstAmount ?? (cgstAmount + sgstAmount)) : 0;
  
  const discountAmount = bill.discount ?? 0;
  const grossBeforeDiscount = taxableValue + gstAmount;
  const finalTotal = bill.finalTotal ?? bill.totalAmount ?? (grossBeforeDiscount - discountAmount);
  const netPayable = bill.netPayable ?? Math.round(finalTotal);
  const roundOff = bill.roundOff ?? Math.round((netPayable - finalTotal) * 100) / 100;

  // Weight totals
  const totalPcs = (bill.items || []).reduce((s, i) => s + (i.quantity || 1), 0);
  const totalGrossWeight = (bill.items || []).reduce((s, i) => s + ((i.grossWeight || i.weight || 0) * (i.quantity || 1)), 0);
  const totalNetWeight = (bill.items || []).reduce((s, i) => s + ((i.netWeight || i.weight || 0) * (i.quantity || 1)), 0);

  const isRough = viewMode === 'quotation';

  // Format purity/fineness like Indian jewellery standards (e.g. 22 Ct / 916)
  const formatPurity = (purity) => {
    if (!purity) return '22K / 916';
    if (purity.includes('22')) return '22 Ct / 916';
    if (purity.includes('24')) return '24 Ct / 999';
    if (purity.includes('18')) return '18 Ct / 750';
    if (purity.includes('14')) return '14 Ct / 585';
    if (purity.toLowerCase().includes('silver')) return 'Silver / 925';
    if (purity.toLowerCase().includes('plat')) return 'Platinum / 950';
    return purity;
  };

  // Detect whether the bill contains Silver items, Gold items, or both
  const hasSilver = (bill.items || []).some(item => {
    const purity = (item.purity || '').toLowerCase();
    const cat = (item.category || '').toLowerCase();
    const name = (item.name || '').toLowerCase();
    return purity.includes('silver') || cat.includes('silver') || name.includes('silver') || item.metalType === 'silver';
  });

  const hasGold = (bill.items || []).some(item => {
    const purity = (item.purity || '').toLowerCase();
    const cat = (item.category || '').toLowerCase();
    const name = (item.name || '').toLowerCase();
    const isSilver = purity.includes('silver') || cat.includes('silver') || name.includes('silver') || item.metalType === 'silver';
    return !isSilver;
  }) || (!hasSilver);

  return (
    <div id="bill-front-print-area" className="relative overflow-hidden bg-white text-gray-900 font-sans text-xs max-w-[650px] mx-auto p-4 sm:p-6 border border-gray-300 shadow-sm print:shadow-none print:border-0 print:p-0">
      {/* Watermark Stamps if Refunded or Exchanged */}
      {bill.status === 'refunded' && (
        <div className="absolute top-28 right-6 sm:right-10 border-4 border-red-500/80 text-red-600 font-black text-base sm:text-lg px-3 sm:px-4 py-1.5 rounded-xl rotate-[-12deg] uppercase tracking-widest pointer-events-none select-none bg-red-50/80 z-10 shadow-sm text-center">
          REFUNDED / திரும்பப் பெறப்பட்டது
          <div className="text-[10px] tracking-normal font-semibold text-red-700 mt-0.5">
            {bill.actionDate ? formatDate(bill.actionDate) : ''} {bill.actionReason ? `• ${bill.actionReason}` : ''}
          </div>
        </div>
      )}
      {bill.status === 'exchanged' && (
        <div className="absolute top-28 right-6 sm:right-10 border-4 border-blue-600/80 text-blue-700 font-black text-base sm:text-lg px-3 sm:px-4 py-1.5 rounded-xl rotate-[-12deg] uppercase tracking-widest pointer-events-none select-none bg-blue-50/80 z-10 shadow-sm text-center">
          EXCHANGED / மாற்றப்பட்டது
          <div className="text-[10px] tracking-normal font-semibold text-blue-800 mt-0.5">
            {bill.actionDate ? formatDate(bill.actionDate) : ''} {bill.actionReason ? `• ${bill.actionReason}` : ''}
          </div>
        </div>
      )}

      {/* ── Top Header ─────────────────────────────────────────── */}
      <div className="border-b-2 border-amber-500 pb-3 mb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-2.5">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-white font-bold text-xl shadow-sm shrink-0 border border-amber-400">
              VJS
            </div>
            <div>
              <h1 className="font-extrabold text-base text-gray-900 tracking-wide uppercase">{SHOP_INFO.name}</h1>
              <p className="text-[10px] text-gray-600 leading-tight">{SHOP_INFO.address}</p>
              <p className="text-[10px] text-gray-600">Ph: {SHOP_INFO.phone} | Email: {SHOP_INFO.email}</p>
            </div>
          </div>
          <div className="text-right text-[10px] text-gray-600 shrink-0">
            <p className="font-semibold text-gray-700">GSTIN: {SHOP_INFO.gstNumber}</p>
            <p>Ph: {SHOP_INFO.phone}</p>
            <p className="text-[9px] text-gray-400 mt-0.5">PLACE OF SUPPLY: IN OUR SHOP PREMISES</p>
          </div>
        </div>
      </div>

      {/* ── Title Banner ────────────────────────────────────────── */}
      <div className={`flex items-center justify-between px-3 py-1.5 rounded-md font-bold uppercase tracking-wider text-xs mb-3 ${
        isRough 
          ? 'bg-blue-100 text-blue-900 border border-blue-200'
          : isGstCharged
            ? 'bg-amber-100 text-amber-900 border border-amber-300'
            : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
      }`}>
        <span className="flex items-center gap-2">
          {isRough 
            ? 'ESTIMATE / QUOTATION (ROUGH BILL)' 
            : isGstCharged 
              ? 'TAX INVOICE' 
              : 'BILL OF SUPPLY / CASH MEMO'}
        </span>
        <span className="text-[10px] font-medium lowercase italic text-gray-600">
          {isRough 
            ? '(quotation only — not a tax invoice)' 
            : isGstCharged 
              ? 'customer copy' 
              : '(non-gst / exempt bill)'}
        </span>
      </div>

      {/* ── Customer & Meta Details Grid ────────────────────────── */}
      <div className="grid grid-cols-2 gap-4 border border-gray-200 rounded-lg p-3 mb-3 bg-gray-50/50 text-[11px]">
        <div className="space-y-1 pr-2 border-r border-gray-200">
          <p><span className="font-bold text-gray-700">Name:</span> <span className="uppercase font-semibold">{customerName}</span></p>
          {customerAddress && <p><span className="font-bold text-gray-700">Address:</span> {customerAddress}</p>}
          <p><span className="font-bold text-gray-700">Mobile No:</span> {customerMobile}</p>
          <p><span className="font-bold text-gray-700">State:</span> Telangana (Code: 36)</p>
        </div>
        <div className="space-y-1 pl-2">
          <p><span className="font-bold text-gray-700">{isRough ? 'Quotation Date:' : 'Invoice Date:'}</span> {formatDate(bill.createdAt)}</p>
          <p><span className="font-bold text-gray-700">{isRough ? 'Estimate No:' : 'Invoice No:'}</span> <span className="font-bold text-amber-700">{bill.invoiceNumber}</span></p>
          {hasGold && (
            <p><span className="font-bold text-gray-700">Gold Rate (22K):</span> ₹{(bill.goldRate || 7500).toLocaleString('en-IN')}/g</p>
          )}
          {hasSilver && (
            <p><span className="font-bold text-gray-700">Silver Rate:</span> ₹{(bill.silverRate || 85).toLocaleString('en-IN')}/g</p>
          )}
        </div>
      </div>

      {/* ── Items Table ─────────────────────────────────────────── */}
      <div className="border border-gray-300 rounded-lg overflow-hidden mb-3">
        <table className="w-full text-left text-[10px] border-collapse">
          <thead>
            <tr className="bg-gray-100 border-b border-gray-300 text-gray-800 font-bold uppercase">
              <th className="py-2 px-1.5 text-center border-r border-gray-200 w-7">S.No</th>
              {!isRough && <th className="py-2 px-1.5 border-r border-gray-200 w-14">HSN</th>}
              <th className="py-2 px-2 border-r border-gray-200">Description</th>
              <th className="py-2 px-1.5 border-r border-gray-200 w-16 text-center">Purity</th>
              <th className="py-2 px-1.5 border-r border-gray-200 text-center w-8">Pcs</th>
              {!isRough && <th className="py-2 px-1.5 border-r border-gray-200 text-right w-14">Gross Wt</th>}
              {!isRough && <th className="py-2 px-1.5 border-r border-gray-200 text-right w-14">Net Wt</th>}
              <th className="py-2 px-1.5 border-r border-gray-200 text-right w-16">Rate/g</th>
              {isRough && <th className="py-2 px-1.5 border-r border-gray-200 text-right w-16 bg-blue-50 text-blue-800">VA / g</th>}
              <th className="py-2 px-2 text-right w-20">Amount (₹)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {(bill.items || []).map((item, idx) => {
              const qty = item.quantity || 1;
              const grossWt = (item.grossWeight || item.weight || 0) * qty;
              const netWt = (item.netWeight || item.weight || 0) * qty;
              const itemGoldRate = item.goldRate || (bill.goldRate || 7500);
              const itemGoldVal = item.goldValue ?? (netWt * itemGoldRate);
              const itemMaking = item.makingCharge || 0;
              const itemStone = item.stoneCharge || 0;
              const lineTotal = item.subtotal ?? (itemGoldVal + itemMaking + itemStone);
              const vaPerGram = item.vaPerGram ?? (netWt > 0 ? (itemMaking / netWt).toFixed(2) : 0);

              return (
                <tr key={idx} className="hover:bg-gray-50/50">
                  <td className="py-2 px-1.5 text-center border-r border-gray-200">{idx + 1}</td>
                  {!isRough && (
                    <td className="py-2 px-1.5 border-r border-gray-200 text-gray-500 font-mono">
                      {item.hsn || '711319'}
                    </td>
                  )}
                  <td className="py-2 px-2 border-r border-gray-200">
                    <p className="font-semibold text-gray-800">{item.name}</p>
                    <p className="text-[9px] text-gray-400">{item.category}</p>
                  </td>
                  <td className="py-2 px-1.5 border-r border-gray-200 text-center font-medium">
                    {formatPurity(item.purity)}
                  </td>
                  <td className="py-2 px-1.5 border-r border-gray-200 text-center font-semibold">
                    {qty}
                  </td>
                  {!isRough && (
                    <td className="py-2 px-1.5 border-r border-gray-200 text-right">
                      {grossWt.toFixed(3)}g
                    </td>
                  )}
                  {!isRough && (
                    <td className="py-2 px-1.5 border-r border-gray-200 text-right font-medium">
                      {netWt.toFixed(3)}g
                    </td>
                  )}
                  <td className="py-2 px-1.5 border-r border-gray-200 text-right font-mono">
                    ₹{itemGoldRate.toLocaleString('en-IN')}
                  </td>
                  {isRough && (
                    <td className="py-2 px-1.5 border-r border-gray-200 text-right font-mono bg-blue-50/40 text-blue-900 font-semibold">
                      ₹{parseFloat(vaPerGram).toLocaleString('en-IN')}
                    </td>
                  )}
                  <td className="py-2 px-2 text-right font-bold text-gray-900 font-mono">
                    {formatCurrency(lineTotal)}
                  </td>
                </tr>
              );
            })}
          </tbody>
          {/* Table Totals Row */}
          <tfoot>
            <tr className="bg-gray-50 font-bold border-t-2 border-gray-300 text-gray-800">
              <td colSpan={!isRough ? 4 : 3} className="py-2 px-2 text-right uppercase border-r border-gray-200">
                Total:
              </td>
              <td className="py-2 px-1.5 text-center border-r border-gray-200">{totalPcs}</td>
              {!isRough && <td className="py-2 px-1.5 text-right border-r border-gray-200">{totalGrossWeight.toFixed(3)}g</td>}
              {!isRough && <td className="py-2 px-1.5 text-right border-r border-gray-200">{totalNetWeight.toFixed(3)}g</td>}
              <td colSpan={isRough ? 2 : 1} className="border-r border-gray-200"></td>
              <td className="py-2 px-2 text-right font-mono font-bold text-amber-900">
                {formatCurrency(taxableValue)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* ── Summary & Payment Section ───────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
        {/* Left: Payment Mode / Quotation Disclaimer */}
        <div className="border border-gray-200 rounded-lg p-3 bg-gray-50/40 space-y-2">
          {isRough ? (
            <div className="space-y-1.5">
              <p className="font-bold text-blue-900 text-xs flex items-center gap-1.5">
                <FileText size={14} /> Rough Bill / Estimate Notice
              </p>
              <p className="text-[10px] text-gray-600 leading-relaxed">
                This is an estimate quotation provided for information purposes. Value Addition (VA) represents making charges and wastage.
              </p>
              <p className="text-[10px] text-amber-800 font-medium">
                • Rates subject to change according to daily market bullion rates.
              </p>
              <p className="text-[10px] text-gray-500">Staff: {bill.staffName || 'System Admin'}</p>
            </div>
          ) : (
            <div className="space-y-1.5">
              <p className="font-bold text-gray-800 text-xs">Payment Information</p>
              <div className="flex justify-between text-[11px]">
                <span className="font-semibold text-gray-600">Payment Mode:</span>
                <span className="font-bold text-gray-900">{bill.paymentMethod}</span>
              </div>
              {bill.paymentSplits && bill.paymentSplits.length > 0 && (
                <div className="pt-1.5 border-t border-dashed border-gray-300 space-y-1 pl-1">
                  {bill.paymentSplits.map((s, idx) => (
                    <div key={idx} className="flex justify-between text-[10px] text-gray-700">
                      <span>• {s.method}{s.reference ? ` (${s.reference})` : ''}:</span>
                      <span className="font-semibold font-mono">{formatCurrency(s.amount)}</span>
                    </div>
                  ))}
                </div>
              )}
              <div className="pt-2 text-[10px] text-gray-500">
                <p>Staff: {bill.staffName || 'System Admin'}</p>
                <div className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded border border-emerald-300 bg-emerald-50 text-emerald-700 font-semibold text-[9px] uppercase tracking-wide">
                  <CheckCircle2 size={10} className="stroke-[2.5]" />
                  <span>Verified & Hallmarked</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right: Detailed Financials */}
        <div className="border border-gray-300 rounded-lg p-3 bg-gray-50/60 space-y-1.5 text-[11px]">
          {isRough ? (
            /* Rough Bill Financials with VA breakdown */
            <>
              <div className="flex justify-between text-gray-600">
                <span>Gold Value:</span>
                <span className="font-mono">{formatCurrency(goldValue)}</span>
              </div>
              <div className="flex justify-between text-blue-900 font-semibold bg-blue-50/50 px-1 py-0.5 rounded">
                <span>Value Addition (VA Total):</span>
                <span className="font-mono">{formatCurrency(makingCharge)}</span>
              </div>
              {stoneCharge > 0 && (
                <div className="flex justify-between text-gray-600">
                  <span>Stone Charges:</span>
                  <span className="font-mono">{formatCurrency(stoneCharge)}</span>
                </div>
              )}
              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-700">
                  <span>Discount:</span>
                  <span className="font-mono">- {formatCurrency(discountAmount)}</span>
                </div>
              )}
              {bill.exchangeDetails?.applied && bill.exchangeDetails?.totalDeduction > 0 && (
                <div className="flex justify-between text-amber-900 font-semibold bg-amber-50/80 px-1 py-0.5 rounded border border-amber-200">
                  <span>Less : Old {bill.exchangeDetails.metalType === 'silver' ? 'Silver' : 'Gold'} ({bill.exchangeDetails.netWeight}g @ ₹{(bill.exchangeDetails.rate || 0).toLocaleString('en-IN')}/g):</span>
                  <span className="font-mono text-amber-950 font-bold">- {formatCurrency(bill.exchangeDetails.totalDeduction)}</span>
                </div>
              )}
              <div className="border-t-2 border-gray-800 pt-1.5 mt-1.5 flex justify-between font-black text-sm text-gray-900">
                <span>Quotation Total:</span>
                <span className="font-mono text-blue-900">{formatCurrency(finalTotal)}</span>
              </div>
            </>
          ) : (
            /* Main Bill Financials (Tax Invoice or Bill of Supply) */
            <>
              <div className="flex justify-between text-gray-700 font-medium">
                <span>Taxable Value:</span>
                <span className="font-mono">{formatCurrency(taxableValue)}</span>
              </div>
              {isGstCharged ? (
                <>
                  <div className="flex justify-between text-gray-700">
                    <span>Add : CGST @ 1.50 %:</span>
                    <span className="font-mono">{formatCurrency(cgstAmount)}</span>
                  </div>
                  <div className="flex justify-between text-gray-700">
                    <span>Add : SGST @ 1.50 %:</span>
                    <span className="font-mono">{formatCurrency(sgstAmount)}</span>
                  </div>
                </>
              ) : (
                <div className="flex justify-between text-emerald-700 font-medium text-[11px]">
                  <span>GST (Non-GST / Exempt):</span>
                  <span className="font-mono">₹0.00 (0%)</span>
                </div>
              )}
              <div className="flex justify-between text-gray-700 font-semibold border-t border-gray-200 pt-1">
                <span>Total Value:</span>
                <span className="font-mono">{formatCurrency(grossBeforeDiscount)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-700">
                  <span>Less : Discount:</span>
                  <span className="font-mono">- {formatCurrency(discountAmount)}</span>
                </div>
              )}
              {bill.exchangeDetails?.applied && bill.exchangeDetails?.totalDeduction > 0 && (
                <div className="flex justify-between text-amber-900 font-semibold bg-amber-50/80 px-1.5 py-0.5 rounded border border-amber-200">
                  <span>Less : Old {bill.exchangeDetails.metalType === 'silver' ? 'Silver' : 'Gold'} Exchange ({bill.exchangeDetails.purity || '22K'} {bill.exchangeDetails.netWeight}g @ ₹{(bill.exchangeDetails.rate || 0).toLocaleString('en-IN')}/g):</span>
                  <span className="font-mono text-amber-950 font-bold">- {formatCurrency(bill.exchangeDetails.totalDeduction)}</span>
                </div>
              )}
              {roundOff !== 0 && (
                <div className="flex justify-between text-gray-600 text-[10px]">
                  <span>{roundOff < 0 ? 'Less : Round off:' : 'Add : Round off:'}</span>
                  <span className="font-mono">{roundOff < 0 ? `- ₹${Math.abs(roundOff).toFixed(2)}` : `+ ₹${roundOff.toFixed(2)}`}</span>
                </div>
              )}
              <div className="border-t-2 border-gray-900 pt-1.5 mt-1.5 flex justify-between font-black text-sm text-gray-950">
                <span>Net Payable:</span>
                <span className="font-mono text-amber-700 text-base">{formatCurrency(netPayable)}</span>
              </div>
              <div className="flex justify-between text-gray-600 text-[10px] pt-0.5">
                <span>Amount Received:</span>
                <span className="font-mono font-bold">{formatCurrency(netPayable)}</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── Footer / Terms ──────────────────────────────────────── */}
      <div className="border-t border-gray-300 pt-3 text-center space-y-1.5">
        <p className="text-xs font-bold tracking-widest uppercase text-gray-800 font-serif">
          THANK YOU VISIT AGAIN
        </p>
        <p className="text-[9px] text-gray-500">
          Consumers can get the purity of the Hallmarked Jewellery verified from any BIS recognized A&H center.
        </p>

        {/* Signature blocks */}
        <div className="flex justify-between items-end pt-5 px-4 text-[10px] text-gray-600">
          <div className="text-center border-t border-gray-400 pt-1 w-32">
            <span>Customer Signature</span>
          </div>
          <div className="text-center border-t border-gray-400 pt-1 w-36">
            <span>For {SHOP_INFO.name}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function BillBacksideTerms({ shopInfo = SHOP_INFO }) {
  return (
    <div
      id="bill-back-print-area"
      className="bg-white text-gray-900 font-sans text-xs max-w-[650px] mx-auto border border-gray-300 shadow-sm print:shadow-none print:border-0 print:p-0 overflow-hidden"
    >
      {/* ── Top Orange / Amber Banner ─────────────────────────────── */}
      <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white px-6 py-5 text-center relative shadow-inner">
        {/* Diamond / Jewellery Logo Mark */}
        <div className="flex justify-center mb-1.5">
          <div className="w-9 h-9 border border-white/50 rounded-lg flex items-center justify-center bg-white/20 backdrop-blur-xs shadow-xs">
            <Sparkles size={18} className="text-white" />
          </div>
        </div>
        {/* Shop Name */}
        <h2 className="text-2xl sm:text-3xl font-serif font-black tracking-wider uppercase text-white drop-shadow-xs">
          {shopInfo.name || 'VJS JEWELLERY'}
        </h2>
        {/* Shop Address */}
        <p className="text-[11px] sm:text-xs text-amber-50 font-medium tracking-wide mt-0.5">
          {shopInfo.address || 'Bangalore Road, KRISHNAGIRI-1.'}
        </p>
      </div>

      {/* ── Content Body (Tamil & English Terms) ──────────────────── */}
      <div className="p-5 sm:p-7 space-y-5 bg-[#FCFBF9]">
        {/* ── TAMIL SECTION ── */}
        <div className="space-y-3 font-['Noto_Sans_Tamil','Nirmala_UI',sans-serif] text-gray-800">
          <div>
            <p className="font-bold text-sm text-amber-900">
              அன்பார்ந்த வாடிக்கையாளரே!
            </p>
            <p className="text-[11px] leading-relaxed text-gray-700 mt-1">
              தாங்கள் தங்க நகைகள் மற்றும் வெள்ளிப் பொருட்களை எங்களிடம் வாங்கியதில் மிக்க மகிழ்ச்சியடைகின்றோம். எங்களது மனமார்ந்த நன்றியை தெரிவித்துக்கொள்கிறோம்.
            </p>
          </div>

          <div>
            <p className="font-bold text-xs text-amber-900 underline decoration-amber-400 underline-offset-4 mb-2">
              தரச்சான்று விதிமுறைகள்:
            </p>
            <ol className="space-y-1.5 text-[10.5px] leading-relaxed text-gray-700 list-none pl-0">
              <li className="flex items-start gap-2">
                <span className="font-bold text-amber-600 shrink-0">1.</span>
                <span>எங்களிடமிருந்து விற்பனை செய்யப்பட்ட தங்க நகைகள் மற்றும் வெள்ளிப்பொருட்களை விற்பனை செய்யப்பட்ட தேதியிலிருந்து மூன்று நாட்களுக்குள் எந்தவித குறைபாடுகளின்றி இருப்பின் மாற்றிக்கொள்ளலாம். நகைக்குரிய எங்களது பில் அவசியம்.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-amber-600 shrink-0">2.</span>
                <span>தங்க நகைகளை வாங்கிய மூன்று நாட்களுக்கு மேல் மாற்றும் போது அன்றைய மார்க்கெட் விலைக்கு ரொக்கமாகவோ அல்லது மாற்றமோ செய்து கொள்ளலாம்.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-amber-600 shrink-0">3.</span>
                <span>பொருட்களில் ஏதேனும் சேதம் ஏற்பட்டிருந்தாலோ அல்லது கற்களில் ஏதேனும் சேதம் அடைந்திருந்தாலோ Exchange விதிமுறைகளுக்குட்பட்டு ஏற்கப்படும்.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-amber-600 shrink-0">4.</span>
                <span>உடல் உஷ்ணம், ஈரப்பதமான காற்று, உப்பு தண்ணீர் மற்றும் இரும்பு பெட்டியில் வைப்பதாலும் வெள்ளி கருமை அடையும்.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-amber-600 shrink-0">5.</span>
                <span>வெள்ளி கொலுசுகள் மற்றும் பொருட்கள் பழுது ஏற்பட்டால் ரிப்பேர் செய்து தரப்படும். மாற்றித்தர இயலாது.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-amber-600 shrink-0">6.</span>
                <span>எங்களிடம் உள்ள Karat Meter உதவியுடன் பொருட்களின் தரத்தை தெரிந்து கொள்ளலாம்.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-amber-600 shrink-0">7.</span>
                <span>மேற்கண்ட விதிமுறைகள் யாவும் எங்களது நிர்வாக சட்டதிட்டங்களுக்கு உட்பட்டதாகும்.</span>
              </li>
            </ol>
          </div>
        </div>

        {/* Dividing amber/orange accent line */}
        <div className="border-t-2 border-amber-200/80 pt-2" />

        {/* ── ENGLISH SECTION ── */}
        <div className="space-y-3 text-gray-800">
          <div>
            <p className="font-bold text-xs text-amber-900 italic">
              Dear customer ! Thank you for your patronage.
            </p>
          </div>

          <div>
            <p className="font-bold text-xs text-amber-900 underline decoration-amber-400 underline-offset-4 mb-2">
              Terms & Conditions
            </p>
            <ol className="space-y-1.5 text-[10.5px] leading-relaxed text-gray-700 list-none pl-0">
              <li className="flex items-start gap-2">
                <span className="font-bold text-amber-600 shrink-0">1.</span>
                <span>Exchange of gold ornaments is permitted within 3 days of purchase only if it is in good condition and supported with the original bill.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-amber-600 shrink-0">2.</span>
                <span>If the request for any exchange for jewellery or for cash is brought to us after 3 days from the date of purchase, it can be exchanged only on the prevalent Gold Rates on that day.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-amber-600 shrink-0">3.</span>
                <span>Damaged jewellery either on the ornament or on embellishments will be exchanged only of specified terms.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-amber-600 shrink-0">4.</span>
                <span>Body heat, humid air, salt water and storing in Iron safe may also cause the gold/silver jewellery to oxidise faster and darken.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-amber-600 shrink-0">5.</span>
                <span>Silver Anklets if damaged will be repaired by our qualified artisans and will not be exchanged on any account.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-amber-600 shrink-0">6.</span>
                <span>You can test the quality of every jewel by testing it with our karat meter.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-amber-600 shrink-0">7.</span>
                <span>Terms and conditions are subject to change without notice.</span>
              </li>
            </ol>
          </div>
        </div>

        {/* Footer Guarantee Seal */}
        <div className="pt-2 border-t border-gray-200 flex items-center justify-between text-[9px] text-gray-500">
          <span className="font-semibold text-amber-700 inline-flex items-center gap-1">
            <CheckCircle2 size={10} className="stroke-[2.5]" />
            <span>100% BIS Hallmarked Jewellery</span>
          </span>
          <span>Computerized Karatmeter Purity Assured</span>
        </div>
      </div>
    </div>
  );
}

export default function BillPreview({ bill, onClose }) {
  const [viewMode, setViewMode] = useState(
    bill?.isRoughBill || bill?.billType === 'quotation' ? 'quotation' : 'tax_invoice'
  );
  const [activeSide, setActiveSide] = useState('front'); // 'front' | 'back' | 'both'

  // Lock background screen scroll while modal is open
  useScrollLock(true);

  const paymentSummaryText = bill?.paymentSplits && bill.paymentSplits.length > 0
    ? `Split (${bill.paymentSplits.map(s => `${s.method}: ${formatCurrency(s.amount)}`).join(', ')})`
    : bill?.paymentMethod || 'Cash';

  const handlePrint = (sideToPrint = activeSide) => {
    let title = `${bill?.invoiceNumber || 'Invoice'} - ${SHOP_INFO.name}`;
    let bodyContent = '';

    const frontEl = document.getElementById('bill-front-print-area');
    const backEl = document.getElementById('bill-back-print-area');

    if (sideToPrint === 'front') {
      title = `INVOICE-FRONT-${bill?.invoiceNumber || ''}`;
      bodyContent = frontEl ? frontEl.innerHTML : '';
    } else if (sideToPrint === 'back') {
      title = `INVOICE-TERMS-BACK-${bill?.invoiceNumber || ''}`;
      bodyContent = backEl ? backEl.innerHTML : '';
    } else {
      // Both Sides
      title = `INVOICE-COMPLETE-${bill?.invoiceNumber || ''}`;
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
        body { font-family: 'Inter', 'Nirmala UI', 'Noto Sans Tamil', -apple-system, sans-serif; background: #fff; padding: 10px; }
        @media print {
          @page { margin: 0.8cm; size: A4 portrait; }
          body { padding: 0; }
          .print-page { width: 100%; }
        }
      </style>
      </head><body>${bodyContent}</body></html>
    `);
    w.document.close();
    w.focus();
    setTimeout(() => { w.print(); }, 600);
  };

  const handleDownloadPDF = () => {
    handlePrint(activeSide === 'back' ? 'back' : 'both');
  };

  const handleWhatsApp = () => {
    const isRough = viewMode === 'quotation';
    const text = encodeURIComponent(
      `*${SHOP_INFO.name}*\n` +
      `${isRough ? 'ESTIMATE / QUOTATION' : 'TAX INVOICE'}: ${bill.invoiceNumber}\n` +
      `Date: ${formatDate(bill.createdAt)}\n` +
      `Customer: ${bill.customerName}\n` +
      `Items: ${(bill.items || []).map(i => i.name).join(', ')}\n` +
      `Net Payable: ${formatCurrency(bill.netPayable || bill.finalTotal)}\n` +
      (!isRough ? `Payment: ${paymentSummaryText}\n\n` : `(Quotation)\n\n`) +
      `Thank you for visiting ${SHOP_INFO.name}!`
    );
    window.open(`https://wa.me/${bill.customerMobile}?text=${text}`, '_blank');
  };

  const handleEmail = () => {
    const isRough = viewMode === 'quotation';
    const subject = encodeURIComponent(`${isRough ? 'Quotation' : 'Invoice'} ${bill.invoiceNumber} - ${SHOP_INFO.name}`);
    const body = encodeURIComponent(
      `Dear ${bill.customerName},\n\n` +
      `Thank you for visiting ${SHOP_INFO.name}.\n\n` +
      `${isRough ? 'Quotation Number' : 'Invoice Number'}: ${bill.invoiceNumber}\n` +
      `Date: ${formatDate(bill.createdAt)}\n` +
      `Net Amount: ${formatCurrency(bill.netPayable || bill.finalTotal)}\n\n` +
      `Regards,\n${SHOP_INFO.name}`
    );
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 backdrop-blur-sm overflow-y-auto py-6 px-3 sm:px-4">
      <div className="w-full max-w-3xl bg-white rounded-3xl p-5 sm:p-6 shadow-2xl border border-gray-200 animate-fade-in my-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between mb-3 pb-3 border-b border-gray-100">
          <div>
            <h2 className="text-gray-900 font-extrabold text-lg sm:text-xl font-display">
              {viewMode === 'quotation' ? 'Quotation / Rough Bill Preview' : 'Tax Invoice Preview'}
            </h2>
            <p className="text-gray-400 text-xs mt-0.5">
              {bill?.invoiceNumber} • {formatDate(bill?.createdAt)}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Bill Type Switcher */}
        <div className="flex gap-2 p-1.5 bg-gray-100 rounded-2xl mb-2.5">
          <button
            type="button"
            onClick={() => setViewMode('tax_invoice')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              viewMode === 'tax_invoice'
                ? 'bg-white text-amber-700 shadow-sm'
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            <CheckCircle2 size={14} className={viewMode === 'tax_invoice' ? 'text-amber-500' : 'text-gray-400'} />
            Main Bill (Tax Invoice)
          </button>
          <button
            type="button"
            onClick={() => setViewMode('quotation')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              viewMode === 'quotation'
                ? 'bg-white text-blue-700 shadow-sm'
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            <FileText size={14} className={viewMode === 'quotation' ? 'text-blue-500' : 'text-gray-400'} />
            Rough Bill (Quotation)
          </button>
        </div>

        {/* Side Selector (Front / Back Side Terms / Both) */}
        <div className="flex gap-1.5 p-1 bg-amber-50/70 border border-amber-200/80 rounded-xl mb-3.5">
          <button
            type="button"
            onClick={() => setActiveSide('front')}
            className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeSide === 'front'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'text-amber-900 hover:bg-amber-100/60'
            }`}
          >
            <FileText size={13} />
            <span>Front Side</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveSide('back')}
            className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeSide === 'back'
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-xs'
                : 'text-amber-900 hover:bg-amber-100/60'
            }`}
          >
            <BookOpen size={13} />
            <span>Back Side (Terms)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveSide('both')}
            className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeSide === 'both'
                ? 'bg-gray-900 text-white shadow-xs'
                : 'text-amber-900 hover:bg-amber-100/60'
            }`}
          >
            <Layers size={13} />
            <span>Both Sides</span>
          </button>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-4">
          <button
            onClick={() => handlePrint(activeSide)}
            className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-white font-bold text-xs transition-all shadow-sm active:scale-95"
          >
            <Printer size={15} />
            {activeSide === 'front' ? 'Print Invoice' : activeSide === 'back' ? 'Print Back (Terms)' : 'Print Both Sides'}
          </button>
          <button
            onClick={handleDownloadPDF}
            className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-gray-800 hover:bg-gray-700 text-white font-bold text-xs transition-all shadow-sm active:scale-95"
            title="Save PDF (Both Front and Backside Terms)"
          >
            <Download size={15} />
            Save PDF
          </button>
          <button
            onClick={handleWhatsApp}
            className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all shadow-sm active:scale-95"
          >
            <MessageCircle size={15} />
            WhatsApp
          </button>
          <button
            onClick={handleEmail}
            className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-all shadow-sm active:scale-95"
          >
            <Mail size={15} />
            Email
          </button>
        </div>

        {/* Bill Preview Area */}
        <div className="rounded-2xl overflow-hidden border border-gray-200 bg-gray-50/50 p-2 sm:p-4 max-h-[65vh] overflow-y-auto">
          {/* Front Side */}
          <div className={activeSide === 'back' ? 'hidden' : 'block'}>
            <BillContent bill={bill} viewMode={viewMode} />
          </div>

          {/* Divider between Front and Back when Both Sides is active */}
          {activeSide === 'both' && (
            <div className="my-6 border-t-2 border-dashed border-amber-300 relative flex items-center justify-center">
              <span className="bg-amber-100 text-amber-900 text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider border border-amber-200 shadow-xs">
                Back Side — Terms & Conditions (விதிமுறைகள்)
              </span>
            </div>
          )}

          {/* Back Side */}
          <div className={activeSide === 'front' ? 'hidden' : 'block'}>
            <BillBacksideTerms shopInfo={SHOP_INFO} />
          </div>
        </div>

        {/* Bottom helper text */}
        <p className="text-center text-gray-400 text-[11px] mt-3 flex items-center justify-center gap-1.5">
          <Sparkles size={12} className="text-amber-500 shrink-0" />
          <span>You can view and print <b>Front Side</b>, <b>Back Side (Terms & Conditions in Tamil & English)</b>, or <b>Both Sides</b>.</span>
        </p>
      </div>
    </div>
  );
}
