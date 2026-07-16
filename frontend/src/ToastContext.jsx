import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X, Loader2 } from 'lucide-react';

const ToastContext = createContext(null);

let toastIdCounter = 0;

const ICONS = {
  success: CheckCircle2,
  error:   AlertCircle,
  warning: AlertTriangle,
  info:    Info,
  loading: Loader2,
};

const STYLES = {
  success: {
    wrap:  'bg-emerald-50 border-emerald-200 text-emerald-800',
    icon:  'text-emerald-500',
    close: 'text-emerald-400 hover:text-emerald-700',
    bar:   'bg-emerald-400',
  },
  error: {
    wrap:  'bg-red-50 border-red-200 text-red-800',
    icon:  'text-red-500',
    close: 'text-red-400 hover:text-red-700',
    bar:   'bg-red-400',
  },
  warning: {
    wrap:  'bg-amber-50 border-amber-200 text-amber-800',
    icon:  'text-amber-500',
    close: 'text-amber-400 hover:text-amber-700',
    bar:   'bg-amber-400',
  },
  info: {
    wrap:  'bg-blue-50 border-blue-200 text-blue-800',
    icon:  'text-blue-500',
    close: 'text-blue-400 hover:text-blue-700',
    bar:   'bg-blue-400',
  },
  loading: {
    wrap:  'bg-gray-50 border-gray-200 text-gray-800',
    icon:  'text-gray-500',
    close: 'text-gray-400 hover:text-gray-700',
    bar:   'bg-gray-400',
  },
};

// Duration in ms per type (0 = stays until dismissed manually)
const DURATIONS = {
  success: 3500,
  error:   5000,
  warning: 4500,
  info:    3500,
  loading: 0,
};

function ToastItem({ toast, onDismiss }) {
  const style = STYLES[toast.type] || STYLES.info;
  const Icon  = ICONS[toast.type] || Info;
  const duration = DURATIONS[toast.type];

  // Progress bar
  const [progress, setProgress] = useState(100);
  const rafRef = useRef(null);
  const startRef = useRef(null);

  useEffect(() => {
    if (!duration) return;
    startRef.current = performance.now();
    const tick = (now) => {
      const elapsed = now - startRef.current;
      const pct = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(pct);
      if (pct > 0) {
        rafRef.current = requestAnimationFrame(tick);
      }
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [duration]);

  return (
    <div
      className={`relative flex items-start gap-3 px-4 py-3 rounded-xl shadow-lg border max-w-sm w-full overflow-hidden animate-fade-in ${style.wrap}`}
      role="alert"
    >
      <Icon
        size={18}
        className={`shrink-0 mt-0.5 ${style.icon} ${toast.type === 'loading' ? 'animate-spin' : ''}`}
      />
      <div className="flex-1 min-w-0">
        {toast.title && (
          <p className="font-semibold text-sm leading-tight mb-0.5">{toast.title}</p>
        )}
        <p className="text-sm leading-snug">{toast.message}</p>
      </div>
      {toast.type !== 'loading' && (
        <button
          onClick={() => onDismiss(toast.id)}
          className={`shrink-0 mt-0.5 transition-colors ${style.close}`}
          aria-label="Dismiss"
        >
          <X size={15} />
        </button>
      )}
      {/* Progress bar */}
      {duration > 0 && (
        <div
          className={`absolute bottom-0 left-0 h-0.5 ${style.bar} transition-none`}
          style={{ width: `${progress}%` }}
        />
      )}
    </div>
  );
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const showToast = useCallback((message, type = 'success', title = null) => {
    const id = ++toastIdCounter;
    const duration = DURATIONS[type] || 3500;

    setToasts(prev => [...prev.slice(-4), { id, message, type, title }]);

    if (duration > 0) {
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, duration);
    }

    return id;
  }, []);

  // Convenience aliases
  const toast = {
    success: (msg, title) => showToast(msg, 'success', title),
    error:   (msg, title) => showToast(msg, 'error', title),
    warning: (msg, title) => showToast(msg, 'warning', title),
    info:    (msg, title) => showToast(msg, 'info', title),
    loading: (msg, title) => showToast(msg, 'loading', title),
    dismiss,
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}

      {/* Toast container — fixed bottom-right */}
      <div
        className="fixed bottom-5 right-5 z-[9999] flex flex-col-reverse gap-2 pointer-events-none"
        aria-live="polite"
      >
        {toasts.map(t => (
          <div key={t.id} className="pointer-events-auto">
            <ToastItem toast={t} onDismiss={dismiss} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>');
  return ctx;
}
