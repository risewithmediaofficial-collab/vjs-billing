import React, { useState, useMemo } from 'react';
import {
  ShieldCheck,
  Search,
  RotateCcw,
  RefreshCw,
  Clock,
  User,
  Filter,
  Calendar,
  FileText,
  Package,
  Lock,
  Download,
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  X,
  History,
  TrendingDown,
  Sparkles
} from 'lucide-react';
import { formatCurrency, formatDate } from '../data.js';

export default function AuditTrailPage({
  activityLogs = [],
  currentStaff,
  staff = [],
  onRefreshData,
}) {
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('all');
  const [staffFilter, setStaffFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [refreshing, setRefreshing] = useState(false);

  // Trigger data refresh
  const handleRefresh = async () => {
    if (!onRefreshData) return;
    setRefreshing(true);
    try {
      await onRefreshData();
    } finally {
      setTimeout(() => setRefreshing(false), 500);
    }
  };

  // Quick stats calculation
  const stats = useMemo(() => {
    let refunds = 0;
    let exchanges = 0;
    let edits = 0;
    const staffSet = new Set();

    activityLogs.forEach((log) => {
      const act = (log.action || '').toLowerCase();
      if (act.includes('refund')) refunds++;
      else if (act.includes('exchange')) exchanges++;
      else if (act.includes('edit')) edits++;

      if (log.staffName) staffSet.add(log.staffName);
    });

    return {
      total: activityLogs.length,
      refunds,
      exchanges,
      edits,
      activeStaffCount: staffSet.size,
    };
  }, [activityLogs]);

  // Unique staff names for filter dropdown
  const uniqueStaffNames = useMemo(() => {
    const set = new Set();
    activityLogs.forEach((log) => {
      if (log.staffName) set.add(log.staffName);
    });
    return Array.from(set);
  }, [activityLogs]);

  // Date filter logic
  const filterByDate = (log) => {
    if (dateFilter === 'all') return true;
    const d = new Date(log.createdAt);
    const now = new Date();
    if (dateFilter === 'today') {
      return d.toDateString() === now.toDateString();
    }
    if (dateFilter === 'week') {
      return now - d < 7 * 24 * 60 * 60 * 1000;
    }
    if (dateFilter === 'month') {
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }
    return true;
  };

  // Filtered activity logs
  const filteredLogs = useMemo(() => {
    return activityLogs
      .filter(filterByDate)
      .filter((log) => {
        if (actionFilter === 'all') return true;
        const act = (log.action || '').toLowerCase();
        if (actionFilter === 'refund') return act.includes('refund');
        if (actionFilter === 'exchange') return act.includes('exchange');
        if (actionFilter === 'edit') return act.includes('edit');
        if (actionFilter === 'product') return act.includes('product') || act.includes('stock');
        if (actionFilter === 'vault') return act.includes('vault') || act.includes('security');
        return true;
      })
      .filter((log) => {
        if (staffFilter === 'all') return true;
        return log.staffName === staffFilter;
      })
      .filter((log) => {
        if (!search.trim()) return true;
        const q = search.toLowerCase();
        const staffName = (log.staffName || '').toLowerCase();
        const action = (log.action || '').toLowerCase();
        const details = (log.details || '').toLowerCase();
        return staffName.includes(q) || action.includes(q) || details.includes(q);
      });
  }, [activityLogs, actionFilter, staffFilter, dateFilter, search]);

  // Action badge configuration
  const getActionBadge = (action = '') => {
    const act = action.toLowerCase();
    if (act.includes('refund')) {
      return {
        bg: 'bg-red-50 text-red-700 border-red-200',
        icon: RotateCcw,
        label: action || 'Refund',
      };
    }
    if (act.includes('exchange')) {
      return {
        bg: 'bg-blue-50 text-blue-700 border-blue-200',
        icon: RefreshCw,
        label: action || 'Exchange',
      };
    }
    if (act.includes('edit')) {
      return {
        bg: 'bg-amber-50 text-amber-800 border-amber-300',
        icon: FileText,
        label: action || 'Bill Edit',
      };
    }
    if (act.includes('product') || act.includes('stock')) {
      return {
        bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        icon: Package,
        label: action || 'Inventory',
      };
    }
    if (act.includes('vault') || act.includes('security')) {
      return {
        bg: 'bg-purple-50 text-purple-700 border-purple-200',
        icon: Lock,
        label: action || 'Security',
      };
    }
    return {
      bg: 'bg-gray-100 text-gray-700 border-gray-200',
      icon: History,
      label: action || 'Activity',
    };
  };

  // Export to CSV
  const handleExportCSV = () => {
    if (filteredLogs.length === 0) return;
    const headers = ['Timestamp', 'Staff Name', 'Action', 'Details'];
    const rows = filteredLogs.map((log) => [
      new Date(log.createdAt).toLocaleString('en-IN'),
      `"${(log.staffName || '').replace(/"/g, '""')}"`,
      `"${(log.action || '').replace(/"/g, '""')}"`,
      `"${(log.details || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `Audit_Trail_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Helper for humanized relative time
  const getRelativeTime = (dateString) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays === 1) return 'Yesterday';
      if (diffDays < 7) return `${diffDays}d ago`;
      return date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
    } catch {
      return '';
    }
  };

  return (
    <div className="space-y-5 animate-fade-in max-w-full">
      {/* ── Top Header Bar ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-2xl border border-gray-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-white shadow-sm shadow-amber-200">
              <ShieldCheck size={22} className="stroke-[2.2]" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-800 font-display">
                Staff Activity Audit Trail
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                Permanent audit log of administrative actions, refunds, exchanges, bill edits, and stock movements.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-bold transition-all active:scale-95 shadow-xs cursor-pointer disabled:opacity-50"
            title="Refresh logs from server"
          >
            <RefreshCw size={13} className={`${refreshing ? 'animate-spin' : ''}`} />
            <span>{refreshing ? 'Refreshing...' : 'Refresh Logs'}</span>
          </button>

          {filteredLogs.length > 0 && (
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300 text-xs font-bold transition-all active:scale-95 shadow-xs cursor-pointer"
              title="Download audit trail as CSV"
            >
              <Download size={13} />
              <span className="hidden sm:inline">Export CSV</span>
            </button>
          )}
        </div>
      </div>

      {/* ── Metric Stat Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total Events</span>
            <span className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <History size={16} />
            </span>
          </div>
          <p className="text-xl sm:text-2xl font-black text-gray-900 font-mono mt-2">{stats.total}</p>
          <p className="text-[11px] text-gray-400 mt-0.5">Logged actions</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Refunds</span>
            <span className="w-8 h-8 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
              <RotateCcw size={16} />
            </span>
          </div>
          <p className="text-xl sm:text-2xl font-black text-red-600 font-mono mt-2">{stats.refunds}</p>
          <p className="text-[11px] text-gray-400 mt-0.5">Invoices refunded</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Exchanges</span>
            <span className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <RefreshCw size={16} />
            </span>
          </div>
          <p className="text-xl sm:text-2xl font-black text-blue-600 font-mono mt-2">{stats.exchanges}</p>
          <p className="text-[11px] text-gray-400 mt-0.5">Item exchanges</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Bill Edits</span>
            <span className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
              <FileText size={16} />
            </span>
          </div>
          <p className="text-xl sm:text-2xl font-black text-amber-700 font-mono mt-2">{stats.edits}</p>
          <p className="text-[11px] text-gray-400 mt-0.5">Corrected invoices</p>
        </div>
      </div>

      {/* ── Filters & Search Control Bar ── */}
      <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by staff name, invoice #, action, or details..."
              className="w-full border border-gray-200 rounded-xl pl-10 pr-9 py-2 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all bg-gray-50/60"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Action Type Filter */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 no-scrollbar">
            {[
              { key: 'all', label: 'All Actions' },
              { key: 'refund', label: 'Refunds' },
              { key: 'exchange', label: 'Exchanges' },
              { key: 'edit', label: 'Bill Edits' },
              { key: 'product', label: 'Inventory' },
              { key: 'vault', label: 'Security' },
            ].map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActionFilter(tab.key)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  actionFilter === tab.key
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Secondary Filters: Staff Dropdown & Date Filter */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2.5 border-t border-gray-100 text-xs">
          <div className="flex items-center gap-3 flex-wrap">
            {/* Staff Filter Dropdown */}
            <div className="flex items-center gap-1.5">
              <span className="text-gray-500 font-medium flex items-center gap-1">
                <User size={13} className="text-amber-500" />
                Staff:
              </span>
              <select
                value={staffFilter}
                onChange={(e) => setStaffFilter(e.target.value)}
                className="bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1 text-xs font-semibold text-gray-700 focus:outline-none focus:border-amber-400"
              >
                <option value="all">All Staff Members</option>
                {uniqueStaffNames.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </div>

            {/* Date Filter */}
            <div className="flex items-center gap-1">
              {[
                { key: 'all', label: 'All Time' },
                { key: 'today', label: 'Today' },
                { key: 'week', label: 'This Week' },
                { key: 'month', label: 'This Month' },
              ].map((df) => (
                <button
                  key={df.key}
                  type="button"
                  onClick={() => setDateFilter(df.key)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    dateFilter === df.key
                      ? 'bg-amber-100 text-amber-800 font-bold border border-amber-300'
                      : 'text-gray-500 hover:text-gray-800 hover:bg-gray-100'
                  }`}
                >
                  {df.label}
                </button>
              ))}
            </div>
          </div>

          <div className="text-gray-500 text-[11px] font-medium">
            Showing <strong className="text-gray-800">{filteredLogs.length}</strong> of{' '}
            <strong className="text-gray-800">{activityLogs.length}</strong> entries
          </div>
        </div>
      </div>

      {/* ── Activity Logs List ── */}
      {filteredLogs.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center shadow-xs">
          <Clock size={42} className="text-gray-300 mx-auto mb-3" />
          <p className="text-gray-700 font-bold text-sm">No activity logs found</p>
          <p className="text-gray-400 text-xs mt-1">
            {activityLogs.length === 0
              ? 'Activity logs will automatically appear here when bills are edited, refunded, or exchanged.'
              : 'Try clearing your search query or adjusting filter parameters.'}
          </p>
          {(search || actionFilter !== 'all' || staffFilter !== 'all' || dateFilter !== 'all') && (
            <button
              onClick={() => {
                setSearch('');
                setActionFilter('all');
                setStaffFilter('all');
                setDateFilter('all');
              }}
              className="mt-3 px-3 py-1.5 rounded-xl bg-amber-50 text-amber-700 hover:bg-amber-100 text-xs font-bold border border-amber-200 transition-all cursor-pointer"
            >
              Reset Filters
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-2.5">
          {filteredLogs.map((log) => {
            const badge = getActionBadge(log.action);
            const BadgeIcon = badge.icon;
            const logDate = new Date(log.createdAt);

            return (
              <div
                key={log._id || log.id}
                className="bg-white border border-gray-200 hover:border-amber-300 rounded-2xl p-4 sm:p-4.5 shadow-xs transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 group"
              >
                <div className="flex items-start gap-3.5 flex-1 min-w-0">
                  {/* Staff Avatar */}
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-xs">
                    {(log.staffName || 'S').charAt(0).toUpperCase()}
                  </div>

                  {/* Main Details */}
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-sm text-gray-900">
                        {log.staffName || 'System Admin'}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-lg border shadow-2xs ${badge.bg}`}
                      >
                        <BadgeIcon size={11} className="stroke-[2.2]" />
                        <span>{badge.label}</span>
                      </span>
                      <span className="text-[11px] text-gray-400 sm:hidden">
                        • {getRelativeTime(log.createdAt)}
                      </span>
                    </div>

                    {/* Action description & notes */}
                    <p className="text-gray-700 text-xs leading-relaxed break-words font-medium">
                      {log.details || 'No additional details logged.'}
                    </p>
                  </div>
                </div>

                {/* Timestamp details */}
                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100 shrink-0 text-right">
                  <span className="text-xs font-bold text-gray-800 font-mono">
                    {logDate.toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                  <span className="text-[11px] text-gray-400">
                    {formatDate(log.createdAt)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
