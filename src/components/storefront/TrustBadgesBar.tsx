'use client';

import React from 'react';
import { Truck, RotateCcw, ShieldCheck, Headphones } from 'lucide-react';

export function TrustBadgesBar() {
  const badges = [
    {
      icon: Truck,
      title: 'Envíos Gratis OpenDSP',
      subtitle: 'En compras mayores a Bs. 150',
    },
    {
      icon: RotateCcw,
      title: 'Garantía de Devolución',
      subtitle: '7 días de satisfacción total',
    },
    {
      icon: ShieldCheck,
      title: 'Pagos 100% Seguros',
      subtitle: 'QR Simple, Tarjetas y SIN',
    },
    {
      icon: Headphones,
      title: 'Atención al Cliente',
      subtitle: 'Soporte personalizado 24/7',
    },
  ];

  return (
    <section className="mt-12 mb-8 pt-8 border-t border-slate-100">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {badges.map((b, idx) => {
          const Icon = b.icon;
          return (
            <div
              key={idx}
              className="flex items-center space-x-3.5 p-3 rounded-2xl bg-white border border-slate-100/80 shadow-2xs hover:shadow-card hover:-translate-y-0.5 transition-all duration-200"
            >
              <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 shadow-2xs">
                <Icon className="w-5 h-5 stroke-[2]" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">
                  {b.title}
                </h4>
                <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                  {b.subtitle}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
