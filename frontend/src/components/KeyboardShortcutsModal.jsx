import React, { useState, useMemo } from 'react';
import {
  Keyboard,
  X,
  Search,
  ShoppingCart,
  Package,
  FileText,
  LayoutDashboard,
  Wallet,
  Sparkles,
  ShieldCheck,
  Users,
  Settings,
  HelpCircle,
  Command,
  ArrowRight,
} from 'lucide-react';
import useScrollLock from '../useScrollLock.js';

const SHORTCUT_CATEGORIES = [
  {
    id: 'billing',
    title: 'Billing & POS',
    icon: ShoppingCart,
    color: 'text-amber-600 bg-amber-50 border-amber-200',
    shortcuts: [
      { keys: ['Ctrl', 'Enter'], description: 'Generate Bill / Save Edited Invoice', badge: 'Primary Action' },
      { keys: ['Alt', 'S'], description: 'Focus Product Search / HUID Barcode' },
      { keys: ['/'], description: 'Quick Search (when not in input)' },
      { keys: ['Alt', 'C'], description: 'Jump to Customer Details (Name / Mobile)' },
      { keys: ['Alt', 'N'], description: 'Open Quick Add New Product Modal' },
      { keys: ['Alt', 'K'], description: 'Toggle Old Metal Exchange Section' },
      { keys: ['Alt', '1'], description: 'Select Payment: Cash' },
      { keys: ['Alt', '2'], description: 'Select Payment: UPI' },
      { keys: ['Alt', '3'], description: 'Select Payment: Card' },
      { keys: ['Alt', '4'], description: 'Select Payment: Split' },
      { keys: ['Esc'], description: 'Cancel Edit / Close Modal / Clear Search' },
    ],
  },
  {
    id: 'navigation',
    title: 'Navigation (Global)',
    icon: Command,
    color: 'text-blue-600 bg-blue-50 border-blue-200',
    shortcuts: [
      { keys: ['Alt', 'B'], description: 'Go to New Bill (POS)' },
      { keys: ['Alt', 'I'], description: 'Go to Inventory' },
      { keys: ['Alt', 'H'], description: 'Go to Invoices / Sales History' },
      { keys: ['Alt', 'D'], description: 'Go to Dashboard' },
      { keys: ['Alt', 'L'], description: 'Go to Jewel Loans' },
      { keys: ['Alt', 'G'], description: 'Go to Gold Schemes' },
      { keys: ['Alt', 'T'], description: 'Go to Audit Trail (Admin only)' },
      { keys: ['Alt', 'U'], description: 'Go to Staff Management (Admin only)' },
      { keys: ['Alt', 'E'], description: 'Go to Settings (Admin only)' },
    ],
  },
  {
    id: 'inventory',
    title: 'Inventory Management',
    icon: Package,
    color: 'text-emerald-600 bg-emerald-50 border-emerald-200',
    shortcuts: [
      { keys: ['Alt', 'N'], description: 'Open Add New Product Modal' },
      { keys: ['Alt', 'S'], description: 'Focus Inventory Search Bar' },
      { keys: ['Ctrl', 'Enter'], description: 'Save / Update Product inside Modal' },
      { keys: ['Esc'], description: 'Close Product Modal or Cancel Action' },
    ],
  },
  {
    id: 'general',
    title: 'General & Function Keys',
    icon: HelpCircle,
    color: 'text-purple-600 bg-purple-50 border-purple-200',
    shortcuts: [
      { keys: ['?'], description: 'Toggle Keyboard Shortcuts Cheatsheet' },
      { keys: ['F1'], description: 'Quick New Bill / Help' },
      { keys: ['F2'], description: 'Quick Inventory' },
      { keys: ['F3'], description: 'Quick Invoices History' },
      { keys: ['F4'], description: 'Quick Dashboard' },
      { keys: ['Esc'], description: 'Close any active popup, drawer or modal' },
    ],
  },
];

export default function KeyboardShortcutsModal({ isOpen, onClose }) {
  useScrollLock(isOpen);
  const [search, setSearch] = useState('');

  const filteredCategories = useMemo(() => {
    if (!search.trim()) return SHORTCUT_CATEGORIES;
    const q = search.toLowerCase();
    return SHORTCUT_CATEGORIES.map((cat) => {
      const filtered = cat.shortcuts.filter(
        (s) =>
          s.description.toLowerCase().includes(q) ||
          s.keys.some((k) => k.toLowerCase().includes(q))
      );
      return { ...cat, shortcuts: filtered };
    }).filter((cat) => cat.shortcuts.length > 0);
  }, [search]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white border border-gray-200 rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden text-gray-800">
        {/* Header */}
        <div className="px-5 sm:px-6 py-4 sm:py-5 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-amber-50/50 via-white to-orange-50/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-md shadow-amber-400/30">
              <Keyboard size={20} className="stroke-[2.2]" />
            </div>
            <div>
              <h2 className="text-gray-900 font-extrabold text-base sm:text-lg flex items-center gap-2">
                Keyboard Shortcuts
                <span className="text-[11px] font-bold text-amber-700 bg-amber-100/80 px-2 py-0.5 rounded-full">
                  Quick Access
                </span>
              </h2>
              <p className="text-gray-400 text-xs mt-0.5">
                Press <kbd className="px-1.5 py-0.5 text-[10px] font-mono font-bold bg-gray-100 border border-gray-300 rounded shadow-xs text-gray-700">Alt</kbd> + key to jump anywhere instantly
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-800 flex items-center justify-center transition-all"
            title="Close (Esc)"
          >
            <X size={18} />
          </button>
        </div>

        {/* Search Bar inside Modal */}
        <div className="px-5 sm:px-6 py-3 border-b border-gray-100 bg-gray-50/70 flex items-center gap-3">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              autoFocus
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search shortcut (e.g., 'bill', 'inventory', 'customer', 'ctrl')..."
              className="w-full bg-white border border-gray-200 rounded-xl pl-9 pr-3.5 py-2 text-xs sm:text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all"
            />
          </div>
          {search && (
            <button
              onClick={() => setSearch('')}
              className="text-xs font-semibold text-gray-500 hover:text-gray-700"
            >
              Clear
            </button>
          )}
        </div>

        {/* Shortcuts Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 overscroll-contain">
          {filteredCategories.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <Keyboard size={36} className="mx-auto mb-2 opacity-30" />
              <p className="font-semibold text-sm">No shortcuts found for "{search}"</p>
              <p className="text-xs text-gray-400 mt-1">Try searching for "bill", "search", or "alt"</p>
            </div>
          ) : (
            filteredCategories.map((category) => {
              const Icon = category.icon;
              return (
                <div key={category.id} className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className={`p-1.5 rounded-lg border ${category.color}`}>
                      <Icon size={14} className="stroke-[2.2]" />
                    </div>
                    <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                      {category.title}
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {category.shortcuts.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-gray-50/80 hover:bg-amber-50/40 border border-gray-150 hover:border-amber-200 transition-colors"
                      >
                        <span className="text-xs text-gray-700 font-medium truncate flex-1">
                          {item.description}
                        </span>

                        <div className="flex items-center gap-1 shrink-0">
                          {item.keys.map((key, kIdx) => (
                            <React.Fragment key={kIdx}>
                              <kbd className="min-w-[24px] text-center px-2 py-1 text-[11px] font-mono font-bold text-gray-800 bg-white border border-gray-300 rounded-lg shadow-xs">
                                {key}
                              </kbd>
                              {kIdx < item.keys.length - 1 && (
                                <span className="text-gray-400 text-xs font-semibold">+</span>
                              )}
                            </React.Fragment>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-5 sm:px-6 py-3.5 border-t border-gray-100 bg-gray-50 flex items-center justify-between text-xs text-gray-500">
          <span>
            Tip: Press <kbd className="px-1.5 py-0.5 text-[10px] font-mono font-bold bg-white border border-gray-300 rounded shadow-xs text-gray-700">?</kbd> anywhere to open this sheet
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl text-xs transition-all shadow-xs"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
}
