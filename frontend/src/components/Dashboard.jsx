import React from 'react';
import {
  TrendingUp, ShoppingBag, Package, IndianRupee,
  Clock, Users, Gem, BarChart3, Lock, ShoppingCart, Eye
} from 'lucide-react';
import { formatCurrency, formatDate } from '../data.js';

function StatCard({ title, value, subtitle, icon: Icon, color }) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-md transition-all duration-200 shadow-sm">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color} shadow-md`}>
          <Icon size={22} className="text-white" />
        </div>
      </div>
      <p className="text-3xl font-bold text-gray-800 mb-1">{value}</p>
      <p className="text-sm text-gray-500 font-medium">{title}</p>
      {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
    </div>
  );
}

export default function Dashboard({ bills, products, staff, currentStaff, onViewBill, activityLogs = [], onRefreshData }) {
  const isAdmin = currentStaff?.role === 'Admin';
  const today = new Date().toDateString();
  const todayBills = bills.filter(b => new Date(b.createdAt).toDateString() === today);
  const todayRevenue = todayBills.reduce((sum, b) => sum + (b.totalAmount ?? b.finalTotal ?? 0), 0);
  const totalRevenue = bills.reduce((sum, b) => sum + (b.totalAmount ?? b.finalTotal ?? 0), 0);
  const lowStock = products.filter(p => p.stock <= 2);
  const recentBills = [...bills].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);

  // ── Top Categories for TODAY only ───────────────────────────────────────
  const todayCategoryMap = {};
  todayBills.forEach(bill => {
    (bill.items || []).forEach(item => {
      const cat = item.category || 'Other';
      if (!todayCategoryMap[cat]) todayCategoryMap[cat] = { qty: 0, revenue: 0 };
      todayCategoryMap[cat].qty += item.quantity || 1;
      todayCategoryMap[cat].revenue += item.finalTotal ?? 0;
    });
  });
  const topCategories = Object.entries(todayCategoryMap)
    .sort((a, b) => b[1].qty - a[1].qty)   // sort by qty sold (highest first)
    .slice(0, 5);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-gray-400 text-sm mt-0.5">{new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
        {!isAdmin && (
          <div className="flex items-center gap-2 bg-gray-100 border border-gray-200 rounded-xl px-3 py-2">
            <Lock size={13} className="text-gray-400" />
            <span className="text-gray-400 text-xs font-medium">Some stats are admin-only</span>
          </div>
        )}
      </div>

      {/* Admin stat cards — NO trend badges */}
      {isAdmin && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard
            title="Today's Revenue"
            value={formatCurrency(todayRevenue)}
            subtitle={`${todayBills.length} bills today`}
            icon={IndianRupee}
            color="bg-gradient-to-br from-amber-400 to-orange-500"
          />
          <StatCard
            title="Total Revenue"
            value={formatCurrency(totalRevenue)}
            subtitle={`${bills.length} total bills`}
            icon={TrendingUp}
            color="bg-gradient-to-br from-emerald-500 to-teal-600"
          />
          <StatCard
            title="Total Products"
            value={products.length}
            subtitle={`${lowStock.length} low stock`}
            icon={Package}
            color="bg-gradient-to-br from-violet-500 to-purple-600"
          />
          <StatCard
            title="Staff Members"
            value={staff.length}
            subtitle="Active staff"
            icon={Users}
            color="bg-gradient-to-br from-blue-500 to-cyan-600"
          />
        </div>
      )}

      {/* Staff quick cards */}
      {!isAdmin && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <StatCard
            title="Today's Bills"
            value={todayBills.length}
            subtitle="Bills generated today"
            icon={ShoppingBag}
            color="bg-gradient-to-br from-amber-400 to-orange-500"
          />
          <StatCard
            title="Low Stock Items"
            value={lowStock.length}
            subtitle="Products need restocking"
            icon={Package}
            color="bg-gradient-to-br from-red-400 to-orange-500"
          />
        </div>
      )}

      {/* Recent Transactions */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-gray-800 font-bold text-base flex items-center gap-2">
            <Clock size={18} className="text-amber-500" />
            Recent Transactions
          </h2>
          <span className="text-xs text-gray-400 bg-gray-100 border border-gray-200 px-3 py-1 rounded-full">{bills.length} total</span>
        </div>
        {recentBills.length === 0 ? (
          <div className="text-center py-12">
            <ShoppingBag size={40} className="text-gray-300 mx-auto mb-3" />
            <p className="text-gray-400">No bills generated yet</p>
            <p className="text-gray-300 text-sm mt-1">Create your first bill to see it here</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentBills.map(bill => (
              <div key={bill._id || bill.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-gray-50 hover:bg-gray-100/75 transition-all border border-gray-200">
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
                    {(bill.customer?.name || 'W').charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-gray-800 font-semibold text-sm truncate">{bill.customer?.name || 'Walk-in Customer'}</p>
                    <p className="text-gray-400 text-xs">{bill.invoiceNumber} • {formatDate(bill.createdAt)}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between sm:justify-end gap-6 shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-gray-150">
                  <div className="text-left sm:text-right shrink-0">
                    <p className="text-gray-800 font-bold text-sm">{formatCurrency(bill.totalAmount ?? bill.finalTotal)}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${bill.paymentMethod === 'Cash' ? 'bg-emerald-100 text-emerald-700' :
                        bill.paymentMethod === 'UPI' ? 'bg-blue-100 text-blue-700' :
                          'bg-amber-100 text-amber-700'
                      }`}>
                      {bill.paymentMethod}
                    </span>
                  </div>
                  {onViewBill && (
                    <button
                      onClick={() => onViewBill(bill)}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-gray-300 text-amber-600 hover:text-amber-700 hover:bg-amber-50 hover:border-amber-400 font-semibold text-xs transition-all shadow-sm"
                      title="View bill details"
                    >
                      <Eye size={13} />
                      View Details
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Staff Activity Logs — ADMIN ONLY */}
      {isAdmin && (
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-gray-800 font-bold text-base flex items-center gap-2">
              <Users size={18} className="text-amber-500" />
              Staff Activity Audit Trail
            </h2>
            {onRefreshData && (
              <button
                onClick={onRefreshData}
                className="text-xs text-amber-600 hover:text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-xl font-bold transition-all shadow-sm flex items-center gap-1"
              >
                🔄 Refresh Logs
              </button>
            )}
          </div>

          {activityLogs.length === 0 ? (
            <div className="text-center py-10 text-gray-400">
              <Clock size={36} className="mx-auto mb-2 opacity-30" />
              <p className="font-semibold text-sm">No activity logs recorded yet</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 max-h-[350px] overflow-y-auto pr-2 space-y-3">
              {activityLogs.slice(0, 15).map(log => (
                <div key={log._id || log.id} className="pt-3 first:pt-0 flex items-start gap-3 text-xs">
                  <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-250 flex items-center justify-center shrink-0 text-amber-700 font-bold">
                    {log.staffName?.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-0.5">
                      <span className="font-bold text-gray-800">{log.staffName}</span>
                      <span className="text-[10px] text-gray-400">{new Date(log.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })} • {new Date(log.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="text-gray-650"><span className="font-bold text-amber-700">[{log.action}]</span> {log.details}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
