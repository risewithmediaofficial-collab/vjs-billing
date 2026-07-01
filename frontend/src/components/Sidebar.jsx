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
  { id: 'inventory', label: 'Inventory', icon: Package },
  { id: 'staff', label: 'Staff', icon: Users, adminOnly: true },
  { id: 'settings', label: 'Settings', icon: Settings, adminOnly: true },
];

export default function Sidebar({ activeTab, setActiveTab, currentStaff, onLogout, collapsed, setCollapsed }) {
  return (
    <>
      {/* Mobile overlay */}
      {!collapsed && (
        <div
          className="fixed inset-0 bg-black/40 z-20 lg:hidden"
          onClick={() => setCollapsed(true)}
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 h-full z-30 flex flex-col
          bg-white border-r border-gray-200
          transition-all duration-300 ease-in-out shadow-lg
          ${collapsed ? '-translate-x-full lg:translate-x-0 lg:w-20' : 'translate-x-0 w-72'}
        `}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-gray-100">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shrink-0 shadow-md shadow-amber-300/50">
            <Gem size={20} className="text-white" />
          </div>
          {!collapsed && (
            <div className="animate-fade-in overflow-hidden">
              <p className="font-display text-lg font-bold text-gray-800 leading-tight">VJS</p>
              <p className="text-xs text-amber-600 font-semibold tracking-widest">JEWELLERY</p>
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="ml-auto lg:flex hidden text-gray-400 hover:text-gray-700 transition-colors"
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
                w-full flex items-center gap-3 px-3 py-2.5 rounded-xl
                transition-all duration-200 group relative
                ${activeTab === id
                  ? 'bg-amber-50 text-amber-700 border border-amber-200 shadow-sm'
                  : 'text-gray-500 hover:bg-gray-100 hover:text-gray-800'
                }
              `}
            >
              <Icon size={20} className={`shrink-0 ${activeTab === id ? 'text-amber-600' : ''}`} />
              {!collapsed && (
                <span className={`font-medium text-sm animate-fade-in ${activeTab === id ? 'text-amber-700' : ''}`}>{label}</span>
              )}
              {activeTab === id && !collapsed && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-amber-500" />
              )}
              {/* Tooltip for collapsed state */}
              {collapsed && (
                <div className="absolute left-full ml-3 px-3 py-1.5 bg-gray-800 text-white text-sm rounded-lg
                  opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50
                  border border-gray-700 shadow-xl transition-opacity">
                  {label}
                </div>
              )}
            </button>
          ))}
        </nav>

        {/* Staff Info */}
        {currentStaff && (
          <div className="p-3 border-t border-gray-100">
            <div className={`flex items-center gap-3 px-3 py-3 rounded-xl bg-gray-50 border border-gray-200`}>
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shrink-0 text-white font-bold text-sm shadow-sm">
                {currentStaff.name.charAt(0)}
              </div>
              {!collapsed && (
                <div className="flex-1 min-w-0 animate-fade-in">
                  <p className="text-gray-800 text-sm font-semibold truncate">{currentStaff.name}</p>
                  <p className="text-gray-400 text-xs truncate">{currentStaff.role}</p>
                </div>
              )}
              {!collapsed && (
                <button
                  onClick={onLogout}
                  className="text-gray-400 hover:text-red-500 transition-colors"
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
        className="fixed top-4 left-4 z-40 lg:hidden w-10 h-10 rounded-xl bg-white border border-gray-200 text-gray-600 flex items-center justify-center shadow-md"
      >
        <Menu size={20} />
      </button>
    </>
  );
}
