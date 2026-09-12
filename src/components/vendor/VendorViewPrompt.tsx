'use client';

import React from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Store, ArrowRight, LayoutDashboard } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export function VendorViewPrompt() {
  const { user, isVendor } = useAuth();
  const searchParams = useSearchParams();
  const isExplicitMarketplaceView = searchParams.get('view') === 'marketplace';

  if (!isVendor) return null;

  return (
    <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-emerald-950 text-white px-4 py-3 rounded-2xl border border-emerald-500/30 shadow-md mb-6 flex flex-col sm:flex-row items-center justify-between gap-3 animate-in fade-in">
      <div className="flex items-center space-x-3">
        <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center shrink-0">
          <Store className="w-5 h-5 text-emerald-400" />
        </div>
        <div>
          <span className="text-xs font-black text-emerald-400 uppercase tracking-wider block">
            Sesión de Tienda Activa: {user?.activeStoreName || user?.name}
          </span>
          <p className="text-xs text-slate-300">
            {isExplicitMarketplaceView
              ? 'Estás explorando el Marketplace como Comprador. Puedes volver a tu Panel de Administración cuando desees.'
              : 'Recuerda que como tienda tienes a tu disposición tu Panel de Gestión (catálogo, TikTok Live, pedidos y arqueo).'}
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-2 shrink-0">
        <Link
          href="/vendor"
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl shadow-xs transition-all flex items-center space-x-1.5 active:scale-95"
        >
          <LayoutDashboard className="w-3.5 h-3.5" />
          <span>Ir a mi Panel de Tienda</span>
          <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
        </Link>
      </div>
    </div>
  );
}
