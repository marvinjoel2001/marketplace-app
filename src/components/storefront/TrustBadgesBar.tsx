'use client';

import React from 'react';
import { Truck, RotateCcw, ShieldCheck, Headphones } from 'lucide-react';

export function TrustBadgesBar() {
  const badges = [
    {
      icon: Truck,
      title: 'Free Shipping',
      subtitle: 'On orders over $99 (OpenDSP)',
    },
    {
      icon: RotateCcw,
      title: '30-Day Returns',
      subtitle: 'Money back guarantee',
    },
    {
      icon: ShieldCheck,
      title: 'Secure Payment',
      subtitle: '100% secure checkout (QR Simple)',
    },
    {
      icon: Headphones,
      title: '24/7 Support',
      subtitle: 'Friendly customer support',
    },
  ];

  return (
    <section className="mt-14 mb-8 pt-8 border-t border-slate-100">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {badges.map((b, idx) => {
          const Icon = b.icon;
          return (
            <div key={idx} className="flex items-center space-x-3.5 p-2">
              <div className="w-11 h-11 rounded-2xl bg-indigo-50 text-[#4F46E5] flex items-center justify-center shrink-0">
                <Icon className="w-5 h-5 stroke-[2]" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">
                  {b.title}
                </h4>
                <p className="text-[11px] text-slate-400 font-medium mt-0.5">
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
