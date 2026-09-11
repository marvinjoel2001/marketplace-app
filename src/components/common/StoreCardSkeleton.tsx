'use client';

import React from 'react';

export function StoreCardSkeleton({ className = '' }: { className?: string }) {
  return (
    <div
      className={`rounded-3xl bg-white/85 backdrop-blur-xl border border-white/80 overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.04)] flex flex-col justify-between ${className}`}
    >
      {/* Banner Shimmer */}
      <div className="relative aspect-[16/9] w-full bg-slate-200 shimmer">
        <div className="absolute top-3 right-3 h-5 w-16 bg-slate-300 rounded-full shimmer" />
      </div>

      {/* Store Info */}
      <div className="p-4 sm:p-5 space-y-3">
        <div className="flex items-center space-x-3 -mt-8 relative z-10">
          <div className="w-14 h-14 rounded-2xl bg-slate-200 border-2 border-white shadow-md shimmer shrink-0" />
          <div className="space-y-1.5 flex-1 pt-4">
            <div className="h-4 w-32 bg-slate-200 rounded-md shimmer" />
            <div className="h-3 w-24 bg-slate-100 rounded-md shimmer" />
          </div>
        </div>

        <div className="space-y-1.5 pt-1">
          <div className="h-3 w-full bg-slate-100 rounded shimmer" />
          <div className="h-3 w-4/5 bg-slate-100 rounded shimmer" />
        </div>

        {/* Action Button */}
        <div className="pt-2">
          <div className="h-9 w-full bg-slate-200 rounded-full shimmer" />
        </div>
      </div>
    </div>
  );
}
