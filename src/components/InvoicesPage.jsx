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
  const [selectedBill, setSelectedBill] = useState(null);

  const filterDate = (bill) => {
    const d = new Date(bill.createdAt);
    const now = new Date();
    if (dateFilter === 'today') return d.toDateString() === now.toDateString();
    if (dateFilter === 'week') return (now - d) < 7 * 24 * 60 * 60 * 1000;
    if (dateFilter === 'month') return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    return true;
  };

  const filtered = bills
    .filter(filterDate)
    .filter(b => {
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        b.invoiceNumber.toLowerCase().includes(q) ||
        b.customerName.toLowerCase().includes(q) ||
        b.customerMobile.includes(q)
      );
    })
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const totalRevenue = filtered.reduce((s, b) => s + b.finalTotal, 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-white">Invoices</h1>
        <p className="text-purple-400 text-sm mt-1">View and manage all generated bills</p>
      </div>

      {/* Filters */}
      <div className="bg-white/5 border border-purple-900/30 rounded-2xl p-5">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by invoice no, customer name or mobile..."
              className="w-full bg-white/5 border border-purple-800/40 rounded-xl pl-11 pr-4 py-2.5 text-white text-sm
                placeholder-purple-500 focus:outline-none focus:border-amber-400/60 transition-all"
            />
          </div>
          <div className="flex gap-2">
            {[
              { key: 'all', label: 'All' },
              { key: 'today', label: 'Today' },
              { key: 'week', label: 'This Week' },
              { key: 'month', label: 'This Month' },
            ].map(f => (
              <button
                key={f.key}
                onClick={() => setDateFilter(f.key)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap
                  ${dateFilter === f.key
                    ? 'bg-purple-600 text-white'
                    : 'bg-white/5 text-purple-400 border border-purple-800/40 hover:border-purple-600'
                  }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Summary row */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-purple-900/20">
          <p className="text-purple-400 text-sm">{filtered.length} invoice{filtered.length !== 1 ? 's' : ''} found</p>
          <p className="text-amber-400 font-semibold text-sm">Total: {formatCurrency(totalRevenue)}</p>
        </div>
      </div>

      {/* Invoice List */}
      {filtered.length === 0 ? (
        <div className="bg-white/5 border border-purple-900/30 rounded-2xl p-16 text-center">
          <FileText size={48} className="text-purple-700 mx-auto mb-4" />
          <p className="text-purple-400 font-medium">No invoices found</p>
          <p className="text-purple-600 text-sm mt-1">
            {bills.length === 0 ? 'Generate your first bill to see it here' : 'Try adjusting filters'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(bill => (
            <div
              key={bill.id}
              className="bg-white/5 border border-purple-900/30 rounded-2xl p-5 hover:bg-white/8 transition-all group"
            >
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                {/* Customer */}
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center text-white font-bold text-lg shrink-0">
                    {bill.customerName.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-white font-semibold truncate">{bill.customerName}</p>
                    <p className="text-purple-400 text-xs">{bill.customerMobile}</p>
                    {bill.customerAddress && <p className="text-purple-500 text-xs truncate">{bill.customerAddress}</p>}
                  </div>
                </div>

                {/* Invoice Meta */}
                <div className="flex flex-col sm:items-end gap-1">
                  <p className="text-purple-300 font-mono text-sm font-medium">{bill.invoiceNumber}</p>
                  <p className="text-purple-500 text-xs">{formatDate(bill.createdAt)}</p>
                </div>

                {/* Items summary */}
                <div className="hidden lg:block max-w-xs">
                  <p className="text-purple-300 text-xs truncate">
                    {bill.items.map(i => `${i.name}${i.quantity > 1 ? ` x${i.quantity}` : ''}`).join(', ')}
                  </p>
                  <p className="text-purple-500 text-xs">Staff: {bill.staffName}</p>
                </div>

                {/* Amount & Payment */}
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <p className="text-amber-400 font-bold text-lg">{formatCurrency(bill.finalTotal)}</p>
                  <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                    bill.paymentMethod === 'Cash' ? 'bg-emerald-900/40 text-emerald-400' :
                    bill.paymentMethod === 'UPI' ? 'bg-blue-900/40 text-blue-400' :
                    bill.paymentMethod === 'Card' ? 'bg-purple-900/40 text-purple-400' :
                    'bg-amber-900/40 text-amber-400'
                  }`}>
                    {bill.paymentMethod}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => setSelectedBill(bill)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium transition-all"
                  >
                    <Eye size={14} />
                    View
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
