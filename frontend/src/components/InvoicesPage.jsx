import React, { useState } from 'react';
import {
  Search, FileText, Eye, Printer, Download, MessageCircle,
  Calendar, Filter, ChevronDown, X
} from 'lucide-react';
import { formatCurrency, formatDate } from '../data.js';
import BillPreview from './BillPreview.jsx';

export default function InvoicesPage({ bills }) {
  const [search, setSearch] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all'); // 'all' | 'tax_invoice' | 'quotation'
  const [selectedBill, setSelectedBill] = useState(null);

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
      if (typeFilter === 'tax_invoice') return !isQuote;
      if (typeFilter === 'quotation') return isQuote;
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

  const totalRevenue = filtered
    .filter(b => !isQuotationBill(b))
    .reduce((s, b) => s + (b.totalAmount ?? b.finalTotal ?? 0), 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Invoices & Quotations</h1>
        <p className="text-gray-400 text-sm mt-1">View and manage all generated tax invoices and rough quotations</p>
      </div>

      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by invoice no, customer name or mobile..."
              className="w-full border border-gray-200 bg-gray-50 rounded-xl pl-11 pr-4 py-2.5 text-gray-800 text-sm
                placeholder-gray-400 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all"
            />
          </div>

          {/* Type Filter Pills */}
          <div className="flex gap-1.5 p-1 bg-gray-100 rounded-xl border border-gray-200 self-start sm:self-auto">
            {[
              { key: 'all', label: 'All Bills' },
              { key: 'tax_invoice', label: 'Tax Invoices' },
              { key: 'quotation', label: 'Rough Bills' },
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
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <p className="text-gray-500 text-xs">
            Showing <strong className="text-gray-700">{filtered.length}</strong> record{filtered.length !== 1 ? 's' : ''}
          </p>
          <p className="text-amber-600 font-bold text-sm">
            Total Revenue (Tax Invoices): {formatCurrency(totalRevenue)}
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
          {filtered.map(bill => (
            <div
              key={bill._id || bill.id}
              className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-5 hover:shadow-md hover:border-amber-200 transition-all group shadow-xs"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[minmax(220px,2fr)_minmax(180px,1.5fr)_minmax(120px,1fr)_minmax(140px,1.2fr)_auto] items-center gap-4">
                {/* 1. Customer */}
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white font-bold text-base shrink-0 shadow-xs">
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

                {/* 2. Invoice Meta */}
                <div className="min-w-0 flex flex-col justify-center">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-gray-800 font-mono text-sm font-bold tracking-tight">
                      {bill.invoiceNumber}
                    </p>
                    {isQuotationBill(bill) ? (
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
                  <p className="text-gray-400 text-xs mt-0.5">
                    {formatDate(bill.createdAt)}
                  </p>
                </div>

                {/* 3. Billed By Staff */}
                <div className="hidden lg:flex flex-col justify-center min-w-0">
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                    Staff
                  </span>
                  <p className="text-xs font-semibold text-gray-700 truncate mt-0.5">
                    {bill.staffName || 'System Admin'}
                  </p>
                </div>

                {/* 4. Amount & Payment */}
                <div className="flex flex-col sm:items-end justify-center min-w-0">
                  <p className="text-amber-600 font-bold text-base sm:text-lg font-mono leading-tight">
                    {formatCurrency(bill.totalAmount ?? bill.finalTotal)}
                  </p>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-semibold ${
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
                <div className="flex justify-end shrink-0">
                  <button
                    onClick={() => setSelectedBill(bill)}
                    className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-95 text-white text-xs sm:text-sm font-semibold transition-all shadow-xs"
                  >
                    <Eye size={14} />
                    <span>View</span>
                  </button>
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
    </div>
  );
}
