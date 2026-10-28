'use client';

import React, { createContext, useCallback, useContext, useRef, useState } from 'react';
import { CheckCircle2, AlertCircle, Bell } from 'lucide-react';

type Tone = 'ok' | 'error' | 'info';
interface Toast {
  id: number;
  text: string;
  tone: Tone;
}

const ToastContext = createContext<((text: string, tone?: Tone) => void) | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const next = useRef(1);

  const show = useCallback((text: string, tone: Tone = 'ok') => {
    const id = next.current++;
    setToasts((prev) => [...prev.slice(-2), { id, text, tone }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), tone === 'info' ? 7000 : 3500);
  }, []);

  return (
    <ToastContext.Provider value={show}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 top-3 z-[60] flex flex-col items-center gap-2 px-4" aria-live="polite">
        {toasts.map((t) => {
          const Icon = t.tone === 'error' ? AlertCircle : t.tone === 'info' ? Bell : CheckCircle2;
          return (
            <div
              key={t.id}
              role={t.tone === 'error' ? 'alert' : 'status'}
              className="animate-toast-in pointer-events-auto flex max-w-md items-start gap-2.5 rounded-xl bg-ink px-4 py-3 text-sm font-medium text-white shadow-lg"
            >
              <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${t.tone === 'error' ? 'text-red-300' : 'text-tag'}`} />
              <span>{t.text}</span>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within a ToastProvider');
  return context;
}
