import React, { useState, useEffect, useRef } from 'react';
import {
  Search, FileText, Eye, Printer, Download, MessageCircle,
  Calendar, Filter, ChevronDown, X, RotateCcw, RefreshCw, Lock,
  ShieldAlert, AlertCircle, Check, Loader2, Package, Edit3
} from 'lucide-react';
import { formatCurrency, formatDate } from '../data.js';
import BillPreview from './BillPreview.jsx';
import useScrollLock from '../useScrollLock.js';

export default function InvoicesPage({ bills, onProcessBillAction, onEditBill, currentStaff }) {
  const [search, setSearch] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all'); // 'all' | 'tax_invoice' | 'quotation' | 'refunded' | 'exchanged'
  const [selectedBill, setSelectedBill] = useState(null);
  const searchRef = useRef(null);

  // State for Refund / Exchange confirmation modal
  const [actionModal, setActionModal] = useState({
    isOpen: false,
    bill: null,
    action: 'refund', // 'refund' | 'exchange'
    reason: '',
    loading: false,
    error: '',
  });

  // Lock background screen scroll when Refund/Exchange modal or Bill Preview is open
  useScrollLock(actionModal.isOpen || !!selectedBill);

  // ── Keyboard Shortcuts for Invoices Page ──────────────────────────────────
  useEffect(() => {
    const handleKeyDown = (e) => {
      const activeEl = document.activeElement;
      const isInput = ['INPUT', 'TEXTAREA', 'SELECT'].includes(activeEl?.tagName);

      // 1. Alt + S or /: Focus search box
      if ((e.altKey && (e.key === 's' || e.key === 'S')) || (!isInput && e.key === '/')) {
        e.preventDefault();
        searchRef.current?.focus();
        searchRef.current?.select();
        return;
      }

      // 2. Escape: Close modal or clear search
      if (e.key === 'Escape') {
        if (actionModal.isOpen) {
          e.preventDefault();
          closeActionModal();
          return;
        }
        if (selectedBill) {
          e.preventDefault();
          setSelectedBill(null);
          return;
        }
        if (search) {
          e.preventDefault();
          setSearch('');
          searchRef.current?.blur();
          return;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [actionModal.isOpen, selectedBill, search]);

  const openActionModal = (bill, action) => {
    setActionModal({
      isOpen: true,
      bill,
      action,
      reason: action === 'refund' ? 'Customer return (within 3 days)' : 'Exchange for other jewellery',
      loading: false,
      error: '',
    });
  };

  const closeActionModal = () => {
    setActionModal({
      isOpen: false,
      bill: null,
      action: 'refund',
      reason: '',
      loading: false,
      error: '',
    });
  };

  const handleConfirmAction = async (e) => {
    e?.preventDefault();
    try {
      setActionModal(prev => ({ ...prev, loading: true, error: '' }));
      if (onProcessBillAction) {
        await onProcessBillAction(actionModal.bill._id || actionModal.bill.id, {
          action: actionModal.action,
          reason: actionModal.reason.trim(),
        });
      }
      closeActionModal();
    } catch (err) {
      setActionModal(prev => ({
        ...prev,
        loading: false,
        error: err.message || `Failed to process ${actionModal.action}.`,
      }));
    }
  };

  const filterDate = bill => {
    const d = new Date(bill.createdAt);
    const now = new Date();
    if (dateFilter === 'today') return d.toDateString() === now.toDateString();
    if (dateFilter === 'week') return (now - d) < 7 * 24 * 60 * 60 * 1000;
    if (dateFilter === 'month') return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    return true;
  };

  const isQuotationBill = b => b.isRoughBill || b.billType === 'quotation' || b.invoiceNumber?.startsWith('EST-');

  const filtered = bills
    .filter(filterDate)
    .filter(b => {
      const isQuote = isQuotationBill(b);
      if (typeFilter === 'tax_invoice') return !isQuote && b.status !== 'refunded' && b.status !== 'exchanged';
      if (typeFilter === 'quotation') return isQuote && b.status !== 'refunded' && b.status !== 'exchanged';
      if (typeFilter === 'refunded') return b.status === 'refunded';
      if (typeFilter === 'exchanged') return b.status === 'exchanged';
      return true;
    })
    .filter(b => {
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      const name = (b.customer?.name || b.customerName || '').toLowerCase();
      const phone = b.customer?.phone || b.customerMobile || '';
      return (
        b.invoiceNumber.toLowerCase().includes(q) ||
        name.includes(q) ||
        phone.includes(q)
      );
    })
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  // Only active tax invoices count toward total net revenue
  const totalRevenue = filtered
    .filter(b => !isQuotationBill(b) && b.status !== 'refunded' && b.status !== 'exchanged')
    .reduce((s, b) => s + (b.totalAmount ?? b.finalTotal ?? 0), 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Invoices & Quotations</h1>
        <p className="text-gray-400 text-sm mt-1">View, manage, refund, and exchange generated tax invoices and rough quotations</p>
      </div>

      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              ref={searchRef}
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by invoice no, customer name or mobile... (Alt+S or /)"
              className="w-full border border-gray-200 bg-gray-50 rounded-xl pl-11 pr-16 py-2.5 text-gray-800 text-sm
                placeholder-gray-400 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all"
            />
            {search ? (
              <button
                onClick={() => setSearch('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                title="Clear Search"
              >
                <X size={15} />
              </button>
            ) : (
              <span className="hidden sm:flex items-center gap-1 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[10px] text-gray-400 bg-white border border-gray-200 px-1.5 py-0.5 rounded shadow-2xs font-mono font-semibold">
                Alt+S
              </span>
            )}
          </div>

          {/* Type Filter Pills */}
          <div className="flex gap-1.5 p-1 bg-gray-100 rounded-xl border border-gray-200 self-start sm:self-auto flex-wrap">
            {[
              { key: 'all', label: 'All Bills' },
              { key: 'tax_invoice', label: 'Tax Invoices' },
              { key: 'quotation', label: 'Rough Bills' },
              { key: 'refunded', label: 'Refunded' },
              { key: 'exchanged', label: 'Exchanged' },
            ].map(t => (
              <button
                key={t.key}
                onClick={() => setTypeFilter(t.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap
                  ${typeFilter === t.key
                    ? 'bg-white text-gray-800 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                  }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Date Filter */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {[
              { key: 'all', label: 'All Time' },
              { key: 'today', label: 'Today' },
              { key: 'week', label: 'This Week' },
              { key: 'month', label: 'This Month' },
            ].map(f => (
              <button
                key={f.key}
                onClick={() => setDateFilter(f.key)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap
                  ${dateFilter === f.key
                    ? 'bg-amber-500 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200 border border-gray-200'
                  }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Summary row */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100 flex-wrap gap-2">
          <p className="text-gray-500 text-xs">
            Showing <strong className="text-gray-700">{filtered.length}</strong> record{filtered.length !== 1 ? 's' : ''}
          </p>
          <p className="text-amber-700 font-bold text-sm">
            Active Revenue (Tax Invoices): {formatCurrency(totalRevenue)}
          </p>
        </div>
      </div>

      {/* Invoice List */}
      {filtered.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-16 text-center shadow-sm">
          <FileText size={48} className="text-gray-300 mx-auto mb-4" />
          <p className="text-gray-400 font-semibold">No invoices found</p>
          <p className="text-gray-300 text-sm mt-1">
            {bills.length === 0 ? 'Generate your first bill to see it here' : 'Try adjusting filters'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Aligned Table Header for Desktop (xl and wider) */}
          <div className="hidden xl:grid xl:grid-cols-[minmax(200px,1.25fr)_minmax(190px,1.15fr)_minmax(120px,0.85fr)_minmax(160px,1fr)_auto] items-center gap-4 xl:gap-6 px-5 py-1 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
            <span>Customer</span>
            <span>Invoice & Date</span>
            <span>Staff</span>
            <span>Total Amount</span>
            <span className="text-right pr-4">Actions</span>
          </div>

          {filtered.map(bill => (
            <div
              key={bill._id || bill.id}
              className={`bg-white border rounded-2xl p-4 sm:p-5 hover:shadow-md transition-all group shadow-xs ${
                bill.status === 'refunded' ? 'border-red-200 bg-red-50/20' :
                bill.status === 'exchanged' ? 'border-blue-200 bg-blue-50/20' :
                'border-gray-200 hover:border-amber-200'
              }`}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-[minmax(200px,1.25fr)_minmax(190px,1.15fr)_minmax(120px,0.85fr)_minmax(160px,1fr)_auto] items-center gap-4 xl:gap-6">
                {/* 1. Customer */}
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-white font-bold text-base shrink-0 shadow-xs ${
                    bill.status === 'refunded' ? 'bg-gradient-to-br from-red-500 to-rose-700' :
                    bill.status === 'exchanged' ? 'bg-gradient-to-br from-blue-500 to-indigo-700' :
                    'bg-gradient-to-br from-amber-400 to-amber-600'
                  }`}>
                    {(bill.customer?.name || bill.customerName || 'W').charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-gray-800 font-bold text-sm truncate">
                      {bill.customer?.name || bill.customerName || 'Walk-in Customer'}
                    </p>
                    <p className="text-gray-500 text-xs font-mono">
                      {bill.customer?.phone || bill.customerMobile || '—'}
                    </p>
                    {(bill.customer?.address || bill.customerAddress) && (
                      <p className="text-gray-400 text-xs truncate max-w-[200px]">
                        {bill.customer?.address || bill.customerAddress}
                      </p>
                    )}
                  </div>
                </div>

                {/* 2. Invoice Meta & Status */}
                <div className="min-w-0 flex flex-col justify-center space-y-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <p className="text-gray-800 font-mono text-sm font-bold tracking-tight">
                      {bill.invoiceNumber}
                    </p>
                    {bill.isEdited && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-amber-50 text-amber-800 border border-amber-300 shrink-0">
                        EDITED
                      </span>
                    )}
                    {bill.status === 'refunded' ? (
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-red-100 text-red-700 border border-red-200 shrink-0 flex items-center gap-1">
                        <RotateCcw size={10} /> REFUNDED
                      </span>
                    ) : bill.status === 'exchanged' ? (
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-blue-100 text-blue-700 border border-blue-200 shrink-0 flex items-center gap-1">
                        <RefreshCw size={10} /> EXCHANGED
                      </span>
                    ) : isQuotationBill(bill) ? (
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-amber-100 text-amber-800 border border-amber-300 shrink-0">
                        ROUGH BILL
                      </span>
                    ) : bill.includeGst === false || (bill.gstAmount === 0 && bill.cgstAmount === 0 && bill.sgstAmount === 0) ? (
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-blue-50 text-blue-700 border border-blue-200 shrink-0">
                        NON-GST BILL
                      </span>
                    ) : (
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                        TAX INVOICE
                      </span>
                    )}
                  </div>
                  <p className="text-gray-400 text-xs">
                    {formatDate(bill.createdAt)}
                  </p>
                  {(bill.status === 'refunded' || bill.status === 'exchanged') && bill.actionReason && (
                    <p className="text-[11px] text-gray-500 font-medium truncate">
                      Note: {bill.actionReason}
                    </p>
                  )}
                  {bill.isEdited && bill.lastEditedBy && (
                    <p className="text-[10px] text-amber-700 font-medium truncate">
                      Edited by {bill.lastEditedBy}
                    </p>
                  )}
                  <p className="text-[11px] text-gray-500 xl:hidden">
                    Staff: <span className="font-medium text-gray-700">{bill.staffName || 'System Admin'}</span>
                  </p>
                </div>

                {/* 3. Billed By Staff (xl and wider) */}
                <div className="hidden xl:flex flex-col justify-center min-w-0">
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider xl:hidden">
                    Staff
                  </span>
                  <p className="text-xs font-semibold text-gray-700 truncate">
                    {bill.staffName || 'System Admin'}
                  </p>
                </div>

                {/* 4. Amount & Payment */}
                <div className="flex flex-col justify-center min-w-0">
                  <p className={`font-bold text-base sm:text-lg font-mono leading-tight ${
                    bill.status === 'refunded' ? 'text-gray-400 line-through' :
                    bill.status === 'exchanged' ? 'text-blue-800' :
                    'text-amber-600'
                  }`}>
                    {formatCurrency(bill.totalAmount ?? bill.finalTotal)}
                  </p>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                      bill.paymentMethod === 'Cash' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                      bill.paymentMethod === 'UPI' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                      bill.paymentMethod === 'Card' ? 'bg-purple-50 text-purple-700 border border-purple-200' :
                      bill.paymentMethod === 'Split' ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' :
                      'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}>
                      {bill.paymentMethod}
                    </span>
                    {bill.paymentSplits && bill.paymentSplits.length > 0 && bill.paymentMethod === 'Split' && (
                      <span className="text-[10px] text-gray-400 font-medium hidden xl:inline">
                        ({bill.paymentSplits.map(s => s.method).join('+')})
                      </span>
                    )}
                  </div>
                </div>

                {/* 5. Actions */}
                <div className="flex items-center justify-start xl:justify-end gap-2 shrink-0 flex-wrap sm:col-span-2 xl:col-span-1 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100">
                  <button
                    onClick={() => setSelectedBill(bill)}
                    className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-95 text-white text-xs font-semibold transition-all shadow-xs min-w-[70px]"
                    title="View Receipt"
                  >
                    <Eye size={13} />
                    <span>View</span>
                  </button>

                  {/* Actions for active bills */}
                  {bill.status !== 'refunded' && bill.status !== 'exchanged' && (
                    <>
                      <button
                        onClick={() => onEditBill && onEditBill(bill)}
                        className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl border border-amber-300 text-amber-800 bg-amber-50 hover:bg-amber-100 active:scale-95 text-xs font-semibold transition-all shadow-xs min-w-[70px]"
                        title="Edit bill to correct any mistakes"
                      >
                        <Edit3 size={13} />
                        <span>Edit</span>
                      </button>

                      <button
                        onClick={() => openActionModal(bill, 'refund')}
                        className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 active:scale-95 text-xs font-semibold transition-all shadow-xs min-w-[76px]"
                        title="Process return & refund with stock restoration"
                      >
                        <RotateCcw size={13} />
                        <span>Refund</span>
                      </button>

                      <button
                        onClick={() => openActionModal(bill, 'exchange')}
                        className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl border border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300 active:scale-95 text-xs font-semibold transition-all shadow-xs min-w-[82px]"
                        title="Process item exchange with stock restoration"
                      >
                        <RefreshCw size={13} />
                        <span>Exchange</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Bill Preview Modal */}
      {selectedBill && (
        <BillPreview bill={selectedBill} onClose={() => setSelectedBill(null)} />
      )}

      {/* ── Bill Action Modal (Refund / Exchange) ── */}
      {actionModal.isOpen && actionModal.bill && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs overflow-y-auto animate-fade-in"
          onClick={(e) => e.stopPropagation()}
        >
          <div
            className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl max-w-lg w-full max-h-[90vh] flex flex-col overflow-hidden border border-gray-200 my-auto animate-scale-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header — fixed at top */}
            <div className={`shrink-0 p-4 sm:p-5 text-white flex items-center justify-between ${
              actionModal.action === 'refund'
                ? 'bg-gradient-to-r from-red-600 to-rose-700'
                : 'bg-gradient-to-r from-blue-600 to-indigo-700'
            }`}>
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center shrink-0 border border-white/20">
                  {actionModal.action === 'refund' ? <RotateCcw size={20} /> : <RefreshCw size={20} />}
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-base truncate">
                    {actionModal.action === 'refund' ? 'Process Bill Refund' : 'Process Bill Exchange'}
                  </h3>
                  <p className="text-white/80 text-xs truncate">
                    Invoice: <strong className="font-mono">{actionModal.bill.invoiceNumber}</strong>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={closeActionModal}
                className="text-white/80 hover:text-white p-1.5 rounded-xl hover:bg-white/15 active:scale-95 transition-all shrink-0 cursor-pointer"
                title="Close"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleConfirmAction} className="flex flex-col flex-1 min-h-0 overflow-hidden">
              {/* Scrollable Form Body */}
              <div className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1 overscroll-contain">
                {/* Summary of affected bill */}
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-3.5 space-y-2 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">Customer:</span>
                    <span className="font-bold text-gray-800">{actionModal.bill.customer?.name || 'Walk-in'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">Total Bill Value:</span>
                    <span className="font-extrabold text-gray-900 font-mono text-sm">
                      {formatCurrency(actionModal.bill.totalAmount ?? actionModal.bill.finalTotal)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">Payment Mode:</span>
                    <span className="font-semibold text-gray-700">{actionModal.bill.paymentMethod}</span>
                  </div>

                  {/* Stock Restock Notice */}
                  <div className="pt-2 border-t border-gray-200 flex items-start gap-2 text-emerald-800 font-medium">
                    <Package size={14} className="text-emerald-600 shrink-0 mt-0.5" />
                    <span>
                      <strong>Automatic Stock Restock:</strong> All {actionModal.bill.items?.length || 0} item(s) from this invoice will be automatically restored back into inventory stock.
                    </span>
                  </div>

                  {/* Items preview list */}
                  {actionModal.bill.items && actionModal.bill.items.length > 0 && (
                    <div className="pt-1 flex flex-wrap gap-1.5">
                      {actionModal.bill.items.map((item, idx) => (
                        <span key={idx} className="bg-white border border-gray-200 text-gray-700 px-2 py-0.5 rounded-lg text-[10px] font-medium">
                          {item.name} ({item.weight}g) × {item.quantity || 1}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Reason / Notes */}
                <div>
                  <label className="text-xs font-bold text-gray-700 mb-1.5 block">
                    {actionModal.action === 'refund' ? 'Reason for Return / Refund' : 'Reason for Exchange'}
                  </label>
                  
                  {/* Preset quick reasons */}
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {(actionModal.action === 'refund' ? [
                      'Customer return (within 3 days)',
                      'Damaged / Defective article',
                      'Dissatisfied with model',
                      'Billing mistake',
                    ] : [
                      'Exchange for other jewellery',
                      'Size / Fitting exchange',
                      'Weight difference exchange',
                      'Design upgrade',
                    ]).map(r => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setActionModal(prev => ({ ...prev, reason: r }))}
                        className={`text-[11px] px-2.5 py-1 rounded-lg border font-medium transition-all cursor-pointer ${
                          actionModal.reason === r
                            ? (actionModal.action === 'refund' ? 'bg-red-50 text-red-700 border-red-300 font-bold' : 'bg-blue-50 text-blue-700 border-blue-300 font-bold')
                            : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                        }`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>

                  <input
                    type="text"
                    value={actionModal.reason}
                    onChange={e => setActionModal(prev => ({ ...prev, reason: e.target.value }))}
                    placeholder="Enter reason or additional notes..."
                    className="w-full border border-gray-200 rounded-xl px-3.5 py-2 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-amber-400"
                  />
                </div>

                {/* Activity Log Audit Notice */}
                <div className="bg-amber-50/90 border border-amber-200 rounded-xl p-3.5 text-xs text-amber-950 flex items-start gap-2.5">
                  <ShieldAlert size={16} className="text-amber-600 shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <p className="font-bold text-amber-900">Recorded in Admin Activity Logs</p>
                    <p className="text-amber-800 text-[11px] leading-relaxed">
                      This {actionModal.action} will be permanently logged in the Admin Activity Log with your staff identity ({currentStaff?.name || 'Staff'}), timestamp, and inventory restocking details.
                    </p>
                  </div>
                </div>

                {/* Error Display */}
                {actionModal.error && (
                  <div className="bg-red-50 border border-red-200 text-red-600 px-3.5 py-2.5 rounded-xl text-xs flex items-center gap-2">
                    <AlertCircle size={14} className="shrink-0" />
                    <span>{actionModal.error}</span>
                  </div>
                )}
              </div>

              {/* Modal Footer Buttons — docked cleanly at bottom */}
              <div className="shrink-0 flex items-center justify-end gap-2.5 px-4 sm:px-6 py-3.5 border-t border-gray-100 bg-gray-50/80">
                <button
                  type="button"
                  onClick={closeActionModal}
                  disabled={actionModal.loading}
                  className="px-4 py-2.5 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-100 font-semibold text-xs transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionModal.loading}
                  className={`px-5 py-2.5 rounded-xl text-white font-bold text-xs transition-all shadow-sm flex items-center gap-2 cursor-pointer ${
                    actionModal.action === 'refund'
                      ? 'bg-red-600 hover:bg-red-500 active:scale-95'
                      : 'bg-blue-600 hover:bg-blue-500 active:scale-95'
                  }`}
                >
                  {actionModal.loading ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      {actionModal.action === 'refund' ? <RotateCcw size={14} /> : <RefreshCw size={14} />}
                      <span>{actionModal.action === 'refund' ? 'Confirm Refund' : 'Confirm Exchange'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
