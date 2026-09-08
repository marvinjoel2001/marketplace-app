'use client';

import React, { useState } from 'react';
import { useDataMode } from '@/context/DataModeContext';
import { Sparkles, Database, HelpCircle, CheckCircle2 } from 'lucide-react';

export function DataModeToggle({ variant = 'compact' }: { variant?: 'compact' | 'full' }) {
  const { dataMode, setDataMode, isRealMode } = useDataMode();
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className="relative inline-flex items-center">
      <div
        className="inline-flex items-center p-0.5 rounded-full bg-slate-100 border border-slate-200/80 shadow-2xs text-[11px] font-bold"
        title="Alternar entre catálogo de demostración (mockups) y datos reales de la base de datos"
      >
        <button
          type="button"
          onClick={() => setDataMode('demo')}
          className={`flex items-center space-x-1 px-2.5 py-1 rounded-full transition-all ${
            !isRealMode
              ? 'bg-white text-emerald-800 shadow-xs font-black'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Sparkles className="w-3 h-3 text-amber-500" />
          <span>Demo</span>
        </button>

        <button
          type="button"
          onClick={() => setDataMode('real')}
          className={`flex items-center space-x-1 px-2.5 py-1 rounded-full transition-all ${
            isRealMode
              ? 'bg-emerald-600 text-white shadow-xs font-black'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Database className="w-3 h-3 text-emerald-200" />
          <span>Real</span>
        </button>
      </div>

      {/* Info button with hover explanation */}
      <div className="relative ml-1 hidden sm:block">
        <button
          type="button"
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
          onClick={() => setShowTooltip(!showTooltip)}
          aria-label="Información sobre los modos Demo y Real"
          className="p-1 text-slate-400 hover:text-slate-600 rounded-full transition-colors"
        >
          <HelpCircle className="w-3.5 h-3.5" />
        </button>

        {showTooltip && (
          <div className="absolute right-0 top-full mt-2 w-72 p-3 bg-slate-900 text-white text-[11px] rounded-2xl shadow-xl z-50 animate-in fade-in zoom-in-95 border border-slate-700 pointer-events-none">
            <div className="font-bold text-emerald-400 mb-1 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Modos de Vitrina Market</span>
            </div>
            <p className="text-slate-300 leading-relaxed mb-2">
              <strong className="text-white">🎭 Modo Demo:</strong> Muestra el catálogo de vitrina con tiendas y productos de ejemplo para presentaciones.
            </p>
            <p className="text-slate-300 leading-relaxed">
              <strong className="text-white">⚡ Modo Real:</strong> Conectado a la base de datos local SQLite. Muestra <span className="text-emerald-300 font-bold">únicamente</span> tus tiendas registradas y tus productos creados.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
