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
      const name = (b.customer?.name || b.customerName || '').toLowerCase();
      const phone = b.customer?.phone || b.customerMobile || '';
      return (
        b.invoiceNumber.toLowerCase().includes(q) ||
        name.includes(q) ||
        phone.includes(q)
      );
    })
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const totalRevenue = filtered.reduce((s, b) => s + (b.totalAmount ?? b.finalTotal ?? 0), 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Invoices</h1>
        <p className="text-gray-400 text-sm mt-1">View and manage all generated bills</p>
      </div>

      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-3">
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
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all whitespace-nowrap
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
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
          <p className="text-gray-500 text-sm">{filtered.length} invoice{filtered.length !== 1 ? 's' : ''} found</p>
          <p className="text-amber-600 font-bold text-sm">Total: {formatCurrency(totalRevenue)}</p>
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
              <div key={bill._id || bill.id}
              className="bg-white border border-gray-200 rounded-2xl p-5 hover:shadow-md transition-all group shadow-sm"
            >
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                {/* Customer */}
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white font-bold text-lg shrink-0">
                    {(bill.customer?.name || bill.customerName || 'W').charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-gray-800 font-semibold truncate">{bill.customer?.name || bill.customerName || 'Walk-in Customer'}</p>
                    <p className="text-gray-400 text-xs">{bill.customer?.phone || bill.customerMobile}</p>
                    {(bill.customer?.address || bill.customerAddress) && <p className="text-gray-400 text-xs truncate">{bill.customer?.address || bill.customerAddress}</p>}
                  </div>
                </div>

                {/* Invoice Meta */}
                <div className="flex flex-col sm:items-end gap-1">
                  <p className="text-gray-600 font-mono text-sm font-semibold">{bill.invoiceNumber}</p>
                  <p className="text-gray-400 text-xs">{formatDate(bill.createdAt)}</p>
                </div>

                {/* Items summary */}
                <div className="hidden lg:block max-w-xs">
                  <p className="text-gray-600 text-xs truncate">
                    {bill.items.map(i => `${i.name}${i.quantity > 1 ? ` x${i.quantity}` : ''}`).join(', ')}
                  </p>
                  <p className="text-gray-400 text-xs">Staff: {bill.staffName}</p>
                </div>

                {/* Amount & Payment */}
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <p className="text-amber-600 font-bold text-lg">{formatCurrency(bill.totalAmount ?? bill.finalTotal)}</p>
                  <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${
                    bill.paymentMethod === 'Cash' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                    bill.paymentMethod === 'UPI' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                    bill.paymentMethod === 'Card' ? 'bg-purple-50 text-purple-700 border border-purple-200' :
                    'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}>
                    {bill.paymentMethod}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => setSelectedBill(bill)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-white text-sm font-semibold transition-all shadow-sm"
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
