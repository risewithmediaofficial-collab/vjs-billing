import React, { useRef, useState, useEffect } from 'react';
import useScrollLock from '../useScrollLock.js';
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
  Sparkles,
  ShieldCheck,
} from 'lucide-react';

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, shortcut: 'Alt+D' },
  { id: 'billing', label: 'New Bill', icon: ShoppingCart, shortcut: 'Alt+B' },
  { id: 'invoices', label: 'Invoices', icon: FileText, shortcut: 'Alt+H' },
  { id: 'loans', label: 'Jewel Loans', icon: Wallet, shortcut: 'Alt+L' },
  { id: 'schemes', label: 'Schemes', icon: Sparkles, shortcut: 'Alt+G' },
  { id: 'inventory', label: 'Inventory', icon: Package, shortcut: 'Alt+I' },
  { id: 'audit-trail', label: 'Audit Trail', icon: ShieldCheck, adminOnly: true, shortcut: 'Alt+T' },
  { id: 'staff', label: 'Staff', icon: Users, adminOnly: true, shortcut: 'Alt+U' },
  { id: 'settings', label: 'Settings', icon: Settings, adminOnly: true, shortcut: 'Alt+E' },
];

function SidebarComponent({ activeTab, setActiveTab, currentStaff, onLogout, collapsed, setCollapsed, onHover }) {
  const sidebarRef = useRef(null);

  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth < 1024 : false
  );

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Disable screen scroll on mobile when side navbar is open
  useScrollLock(!collapsed && isMobile);

  return (
    <>
      {/* Mobile overlay backdrop: blocks background scroll & closes on tap */}
      {!collapsed && isMobile && (
        <div
          className="fixed inset-0 bg-black/40 z-20 lg:hidden transition-opacity"
          style={{ touchAction: 'none' }}
          onClick={() => setCollapsed(true)}
          onTouchMove={(e) => e.preventDefault()}
        />
      )}

      <aside
        ref={sidebarRef}
        onMouseEnter={() => collapsed && onHover && onHover(true)}
        onMouseLeave={() => onHover && onHover(false)}
        className={`
          fixed top-0 left-0 h-full z-30 flex flex-col
          bg-white border-r border-gray-200
          transition-[width,transform] duration-200 ease-out shadow-2xl
          ${collapsed ? '-translate-x-full lg:translate-x-0 lg:w-20' : 'translate-x-0 w-64'}
        `}
      >
        {/* Logo & Close Button */}
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
          {!collapsed && (
            <button
              onClick={() => setCollapsed(true)}
              className="ml-auto text-gray-400 hover:text-gray-700 transition-colors p-1.5 rounded-lg hover:bg-gray-100 lg:hidden"
              title="Close Sidebar"
            >
              <X size={20} />
            </button>
          )}
        </div>

        {/* Nav Items */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto overscroll-contain">
          {navItems.filter(item => !item.adminOnly || (currentStaff && (currentStaff.role === 'Admin' || currentStaff.role === 'Manager'))).map(({ id, label, icon: Icon, shortcut }) => (
            <button
              key={id}
              onClick={() => {
                setActiveTab(id);
                if (typeof window !== 'undefined' && window.innerWidth < 1024) {
                  setCollapsed(true);
                }
              }}
              className={`
                w-full flex items-center gap-3 px-3 py-2.5 rounded-xl
                transition-colors duration-150 group relative
                ${activeTab === id
                  ? 'bg-amber-50 text-amber-700 border border-amber-200 shadow-sm'
                  : 'text-gray-500 hover:bg-gray-100 hover:text-gray-800 border border-transparent'
                }
              `}
            >
              <Icon size={20} className={`shrink-0 ${activeTab === id ? 'text-amber-600' : ''}`} />
              {!collapsed && (
                <span className={`font-medium text-sm animate-fade-in truncate ${activeTab === id ? 'text-amber-700' : ''}`}>{label}</span>
              )}
              {!collapsed && shortcut && (
                <kbd className={`ml-auto text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded shadow-2xs border transition-colors ${
                  activeTab === id
                    ? 'bg-amber-100/70 border-amber-300 text-amber-800'
                    : 'bg-gray-100 group-hover:bg-white border-gray-200 text-gray-400 group-hover:text-gray-600'
                }`}>
                  {shortcut}
                </kbd>
              )}
              {/* Tooltip for collapsed state */}
              {collapsed && (
                <div className="absolute left-full ml-3 px-3 py-1.5 bg-gray-800 text-white text-xs rounded-lg
                  opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50
                  border border-gray-700 shadow-xl transition-opacity flex items-center gap-2">
                  <span>{label}</span>
                  {shortcut && <span className="text-amber-400 font-mono text-[10px] font-bold">{shortcut}</span>}
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
                  onClick={() => {
                    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
                      setCollapsed(true);
                    }
                    onLogout();
                  }}
                  className="text-gray-400 hover:text-red-500 transition-colors p-1 rounded-lg hover:bg-gray-100"
                  title="Logout"
                >
                  <LogOut size={16} />
                </button>
              )}
            </div>
          </div>
        )}
      </aside>
    </>
  );
}

export default React.memo(SidebarComponent);
