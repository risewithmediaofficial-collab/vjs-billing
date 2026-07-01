import React from 'react';
import {
  TrendingUp, ShoppingBag, Package, IndianRupee,
  ArrowUpRight, Clock, Users, Gem, BarChart3, Lock
} from 'lucide-react';
import { formatCurrency, formatDate } from '../data.js';

function StatCard({ title, value, subtitle, icon: Icon, color, trend }) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-md transition-all duration-200 shadow-sm">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color} shadow-md`}>
          <Icon size={22} className="text-white" />
        </div>
        {trend && (
          <span className="flex items-center gap-1 text-emerald-600 text-sm font-semibold bg-emerald-50 border border-emerald-200 rounded-lg px-2 py-1">
            <ArrowUpRight size={13} />
            {trend}
          </span>
        )}
      </div>
      <p className="text-3xl font-bold text-gray-800 mb-1">{value}</p>
      <p className="text-sm text-gray-500 font-medium">{title}</p>
      {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
    </div>
  );
}

export default function Dashboard({ bills, products, staff, currentStaff }) {
  const isAdmin = currentStaff?.role === 'Admin';
  const today = new Date().toDateString();
  const todayBills = bills.filter(b => new Date(b.createdAt).toDateString() === today);
  const todayRevenue = todayBills.reduce((sum, b) => sum + (b.totalAmount ?? b.finalTotal ?? 0), 0);
  const totalRevenue = bills.reduce((sum, b) => sum + (b.totalAmount ?? b.finalTotal ?? 0), 0);
  const lowStock = products.filter(p => p.stock <= 2);
  const recentBills = [...bills].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);

  const categoryMap = {};
  bills.forEach(bill => {
    bill.items.forEach(item => {
      categoryMap[item.category] = (categoryMap[item.category] || 0) + item.finalTotal;
    });
  });
  const topCategories = Object.entries(categoryMap).sort((a, b) => b[1] - a[1]).slice(0, 5);

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

      {/* Admin stat cards */}
      {isAdmin && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard
            title="Today's Revenue"
            value={formatCurrency(todayRevenue)}
            subtitle={`${todayBills.length} bills today`}
            icon={IndianRupee}
            color="bg-gradient-to-br from-amber-400 to-orange-500"
            trend="+12%"
          />
          <StatCard
            title="Total Revenue"
            value={formatCurrency(totalRevenue)}
            subtitle={`${bills.length} total bills`}
            icon={TrendingUp}
            color="bg-gradient-to-br from-emerald-500 to-teal-600"
            trend="+8%"
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

      <div className={`grid grid-cols-1 ${isAdmin ? 'xl:grid-cols-3' : ''} gap-6`}>
        {/* Recent Transactions */}
        <div className={`${isAdmin ? 'xl:col-span-2' : ''} bg-white border border-gray-200 rounded-2xl p-6 shadow-sm`}>
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
                <div key={bill._id || bill.id} className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-all border border-gray-100">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
                    {(bill.customer?.name || 'W').charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-gray-800 font-semibold text-sm truncate">{bill.customer?.name || 'Walk-in Customer'}</p>
                    <p className="text-gray-400 text-xs">{bill.invoiceNumber} • {formatDate(bill.createdAt)}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-gray-800 font-bold text-sm">{formatCurrency(bill.totalAmount ?? bill.finalTotal)}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${bill.paymentMethod === 'Cash' ? 'bg-emerald-100 text-emerald-700' :
                        bill.paymentMethod === 'UPI' ? 'bg-blue-100 text-blue-700' :
                          'bg-amber-100 text-amber-700'
                      }`}>
                      {bill.paymentMethod}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top Categories — Admin only */}
        {isAdmin && (
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <h2 className="text-gray-800 font-bold text-base flex items-center gap-2 mb-5">
              <BarChart3 size={18} className="text-amber-500" />
              Top Categories
            </h2>
            {topCategories.length === 0 ? (
              <div className="text-center py-12">
                <Gem size={40} className="text-gray-300 mx-auto mb-3" />
                <p className="text-gray-400 text-sm">No sales data yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {topCategories.map(([cat, amount]) => {
                  const maxAmount = topCategories[0][1];
                  const pct = Math.round((amount / maxAmount) * 100);
                  return (
                    <div key={cat}>
                      <div className="flex justify-between text-sm mb-1.5">
                        <span className="text-gray-600 font-medium">{cat}</span>
                        <span className="text-gray-800 font-bold">{formatCurrency(amount)}</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full transition-all duration-700"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Low Stock Alert */}
            {lowStock.length > 0 && (
              <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-red-600 font-semibold text-sm mb-2">⚠ Low Stock Alert</p>
                {lowStock.map(p => (
                  <p key={p.id} className="text-red-500 text-xs">• {p.name} ({p.stock} left)</p>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
