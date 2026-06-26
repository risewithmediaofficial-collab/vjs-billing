import React from 'react';
import {
  TrendingUp, ShoppingBag, Package, IndianRupee,
  ArrowUpRight, Clock, Users, Gem, BarChart3
} from 'lucide-react';
import { formatCurrency, formatDate } from '../data.js';

function StatCard({ title, value, subtitle, icon: Icon, color, trend }) {
  return (
    <div className="bg-white/5 border border-purple-900/30 rounded-2xl p-6 hover:bg-white/8 transition-all duration-200 group">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color} shadow-lg`}>
          <Icon size={22} className="text-white" />
        </div>
        {trend && (
          <span className="flex items-center gap-1 text-emerald-400 text-sm font-medium">
            <ArrowUpRight size={14} />
            {trend}
          </span>
        )}
      </div>
      <p className="text-3xl font-bold text-white mb-1">{value}</p>
      <p className="text-sm text-purple-300 font-medium">{title}</p>
      {subtitle && <p className="text-xs text-purple-500 mt-1">{subtitle}</p>}
    </div>
  );
}

export default function Dashboard({ bills, products, staff }) {
  const today = new Date().toDateString();
  const todayBills = bills.filter(b => new Date(b.createdAt).toDateString() === today);
  const todayRevenue = todayBills.reduce((sum, b) => sum + b.finalTotal, 0);
  const totalRevenue = bills.reduce((sum, b) => sum + b.finalTotal, 0);
  const lowStock = products.filter(p => p.stock <= 2);
  const recentBills = [...bills].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);

  // Revenue by category
  const categoryMap = {};
  bills.forEach(bill => {
    bill.items.forEach(item => {
      categoryMap[item.category] = (categoryMap[item.category] || 0) + item.finalTotal;
    });
  });
  const topCategories = Object.entries(categoryMap).sort((a, b) => b[1] - a[1]).slice(0, 5);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-purple-400 text-sm mt-1">{new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
        <div className="bg-amber-400/10 border border-amber-400/30 rounded-xl px-4 py-2">
          <span className="text-amber-400 font-semibold text-sm">Gold Rate: ₹8,500/g</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          title="Today's Revenue"
          value={formatCurrency(todayRevenue)}
          subtitle={`${todayBills.length} bills today`}
          icon={IndianRupee}
          color="bg-gradient-to-br from-amber-500 to-orange-600"
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
          color="bg-gradient-to-br from-purple-500 to-violet-600"
        />
        <StatCard
          title="Staff Members"
          value={staff.length}
          subtitle="Active staff"
          icon={Users}
          color="bg-gradient-to-br from-blue-500 to-cyan-600"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Recent Bills */}
        <div className="xl:col-span-2 bg-white/5 border border-purple-900/30 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-white font-semibold text-lg flex items-center gap-2">
              <Clock size={18} className="text-purple-400" />
              Recent Transactions
            </h2>
            <span className="text-xs text-purple-400 bg-purple-900/30 px-3 py-1 rounded-full">{bills.length} total</span>
          </div>
          {recentBills.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingBag size={40} className="text-purple-700 mx-auto mb-3" />
              <p className="text-purple-400">No bills generated yet</p>
              <p className="text-purple-600 text-sm mt-1">Create your first bill to see it here</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentBills.map(bill => (
                <div key={bill.id} className="flex items-center gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/8 transition-all border border-purple-900/20">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
                    {bill.customerName.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium text-sm truncate">{bill.customerName}</p>
                    <p className="text-purple-400 text-xs">{bill.invoiceNumber} • {formatDate(bill.createdAt)}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-white font-semibold text-sm">{formatCurrency(bill.finalTotal)}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${bill.paymentMethod === 'Cash' ? 'bg-emerald-900/40 text-emerald-400' :
                        bill.paymentMethod === 'UPI' ? 'bg-blue-900/40 text-blue-400' :
                          'bg-amber-900/40 text-amber-400'
                      }`}>
                      {bill.paymentMethod}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top Categories */}
        <div className="bg-white/5 border border-purple-900/30 rounded-2xl p-6">
          <h2 className="text-white font-semibold text-lg flex items-center gap-2 mb-5">
            <BarChart3 size={18} className="text-purple-400" />
            Top Categories
          </h2>
          {topCategories.length === 0 ? (
            <div className="text-center py-12">
              <Gem size={40} className="text-purple-700 mx-auto mb-3" />
              <p className="text-purple-400 text-sm">No sales data yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {topCategories.map(([cat, amount], i) => {
                const maxAmount = topCategories[0][1];
                const pct = Math.round((amount / maxAmount) * 100);
                return (
                  <div key={cat}>
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="text-purple-300 font-medium">{cat}</span>
                      <span className="text-white font-semibold">{formatCurrency(amount)}</span>
                    </div>
                    <div className="h-2 bg-purple-900/40 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-purple-500 to-amber-500 rounded-full transition-all duration-700"
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
            <div className="mt-6 p-4 bg-red-900/20 border border-red-800/40 rounded-xl">
              <p className="text-red-400 font-semibold text-sm mb-2">⚠ Low Stock Alert</p>
              {lowStock.map(p => (
                <p key={p.id} className="text-red-300 text-xs">• {p.name} ({p.stock} left)</p>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
