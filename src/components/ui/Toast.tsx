'use client';

import { createContext, useCallback, useContext, useState, useEffect, useRef } from 'react';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: number;
  message: string;
  type: ToastType;
  exiting: boolean;
}

interface ToastContextValue {
  toast: (opts: { message: string; type?: ToastType }) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

let nextId = 0;

const BORDER_COLOR: Record<ToastType, string> = {
  success: 'border-l-green-500',
  error: 'border-l-red-500',
  info: 'border-l-blue-500',
};

const ICON_COLOR: Record<ToastType, string> = {
  success: 'text-green-500',
  error: 'text-red-500',
  info: 'text-blue-500',
};

function ToastIcon({ type }: { type: ToastType }) {
  const color = ICON_COLOR[type];
  if (type === 'success') {
    return (
      <svg className={`h-5 w-5 shrink-0 ${color}`} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    );
  }
  if (type === 'error') {
    return (
      <svg className={`h-5 w-5 shrink-0 ${color}`} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
      </svg>
    );
  }
  return (
    <svg className={`h-5 w-5 shrink-0 ${color}`} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
    </svg>
  );
}

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: (id: number) => void }) {
  return (
    <div
      className={`pointer-events-auto flex w-full max-w-sm items-center gap-3 rounded-xl border-l-4 bg-white/95 px-4 py-3 shadow-lg backdrop-blur ${BORDER_COLOR[toast.type]} ${toast.exiting ? 'animate-toast-out' : 'animate-toast-in'}`}
      role="alert"
    >
      <ToastIcon type={toast.type} />
      <p className="flex-1 text-sm font-medium text-gray-800">{toast.message}</p>
      <button
        onClick={() => onRemove(toast.id)}
        className="shrink-0 rounded-lg p-1 text-gray-400 hover:text-gray-600"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timersRef = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map());

  const removeToast = useCallback((id: number) => {
    // Start exit animation
    setToasts((prev) => prev.map((t) => (t.id === id ? { ...t, exiting: true } : t)));
    // Remove after animation
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 200);
  }, []);

  const addToast = useCallback(
    ({ message, type = 'success' }: { message: string; type?: ToastType }) => {
      const id = ++nextId;
      setToasts((prev) => {
        // Keep max 3, remove oldest if needed
        const next = [...prev, { id, message, type, exiting: false }];
        if (next.length > 3) {
          const oldest = next[0];
          // Clear its timer
          const timer = timersRef.current.get(oldest.id);
          if (timer) clearTimeout(timer);
          timersRef.current.delete(oldest.id);
          return next.slice(1);
        }
        return next;
      });

      // Auto-dismiss after 3 seconds
      const timer = setTimeout(() => {
        removeToast(id);
        timersRef.current.delete(id);
      }, 3000);
      timersRef.current.set(id, timer);
    },
    [removeToast],
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      timersRef.current.forEach((timer) => clearTimeout(timer));
    };
  }, []);

  return (
    <ToastContext.Provider value={{ toast: addToast }}>
      {children}

      {/* Toast container — bottom center, above bottom nav */}
      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-[100] flex flex-col items-center gap-2 px-4 pb-20 sm:pb-6">
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onRemove={removeToast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within a ToastProvider');
  return ctx;
}
