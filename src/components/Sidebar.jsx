import React from 'react';
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  FileText,
  Users,
  Settings,
  Gem,
  ChevronRight,
  LogOut,
  Menu,
  X,
  Wallet,
} from 'lucide-react';

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'billing', label: 'New Bill', icon: ShoppingCart },
  { id: 'invoices', label: 'Invoices', icon: FileText },
  { id: 'loans', label: 'Gold Loans', icon: Wallet },
  { id: 'inventory', label: 'Inventory', icon: Package, adminOnly: true },
  { id: 'staff', label: 'Staff', icon: Users, adminOnly: true },
  { id: 'settings', label: 'Settings', icon: Settings, adminOnly: true },
];

export default function Sidebar({ activeTab, setActiveTab, currentStaff, onLogout, collapsed, setCollapsed }) {
  return (
    <>
      {/* Mobile overlay */}
      {!collapsed && (
        <div
          className="fixed inset-0 bg-black/60 z-20 lg:hidden"
          onClick={() => setCollapsed(true)}
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 h-full z-30 flex flex-col
          bg-gradient-to-b from-[#0f0c1e] to-[#1a1232]
          border-r border-purple-900/40
          transition-all duration-300 ease-in-out
          ${collapsed ? '-translate-x-full lg:translate-x-0 lg:w-20' : 'translate-x-0 w-72'}
        `}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-6 border-b border-purple-900/40">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shrink-0 shadow-lg shadow-amber-500/30">
            <Gem size={20} className="text-white" />
          </div>
          {!collapsed && (
            <div className="animate-fade-in overflow-hidden">
              <p className="font-display text-lg font-bold text-white leading-tight">VJS</p>
              <p className="text-xs text-purple-300 font-medium tracking-widest">JEWELLERY</p>
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="ml-auto lg:flex hidden text-purple-400 hover:text-white transition-colors"
          >
            {collapsed ? <ChevronRight size={18} /> : <X size={18} />}
          </button>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {navItems.filter(item => !item.adminOnly || (currentStaff && (currentStaff.role === 'Admin' || currentStaff.role === 'Manager'))).map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`
                w-full flex items-center gap-3 px-3 py-3 rounded-xl
                transition-all duration-200 group relative
                ${activeTab === id
                  ? 'bg-gradient-to-r from-purple-600 to-violet-600 text-white shadow-lg shadow-purple-900/50'
                  : 'text-purple-300 hover:bg-purple-900/30 hover:text-white'
                }
              `}
            >
              <Icon size={20} className="shrink-0" />
              {!collapsed && (
                <span className="font-medium text-sm animate-fade-in">{label}</span>
              )}
              {activeTab === id && !collapsed && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-amber-400" />
              )}
              {/* Tooltip for collapsed state */}
              {collapsed && (
                <div className="absolute left-full ml-3 px-3 py-1.5 bg-gray-900 text-white text-sm rounded-lg
                  opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50
                  border border-purple-800/50 shadow-xl transition-opacity">
                  {label}
                </div>
              )}
            </button>
          ))}
        </nav>

        {/* Staff Info */}
        {currentStaff && (
          <div className="p-3 border-t border-purple-900/40">
            <div className={`flex items-center gap-3 px-3 py-3 rounded-xl bg-purple-900/20`}>
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center shrink-0 text-white font-bold text-sm">
                {currentStaff.name.charAt(0)}
              </div>
              {!collapsed && (
                <div className="flex-1 min-w-0 animate-fade-in">
                  <p className="text-white text-sm font-semibold truncate">{currentStaff.name}</p>
                  <p className="text-purple-400 text-xs truncate">{currentStaff.role}</p>
                </div>
              )}
              {!collapsed && (
                <button
                  onClick={onLogout}
                  className="text-purple-400 hover:text-red-400 transition-colors"
                  title="Logout"
                >
                  <LogOut size={16} />
                </button>
              )}
            </div>
          </div>
        )}
      </aside>

      {/* Mobile toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="fixed top-4 left-4 z-40 lg:hidden w-10 h-10 rounded-xl bg-purple-800 text-white flex items-center justify-center shadow-lg"
      >
        <Menu size={20} />
      </button>
    </>
  );
}
