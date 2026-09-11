'use client';

import React from 'react';

export function SkeletonCard({ className = '' }: { className?: string }) {
  return (
    <div
      className={`rounded-3xl bg-white/85 backdrop-blur-xl border border-white/80 p-4 sm:p-5 shadow-[0_10px_30px_rgba(0,0,0,0.04)] flex flex-col justify-between space-y-3.5 relative overflow-hidden ${className}`}
    >
      <div>
        {/* Product Image Shimmer Container */}
        <div className="aspect-square w-full rounded-2xl bg-slate-100 shimmer mb-3.5 relative overflow-hidden flex items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-white/50" />
        </div>

        {/* Store & Category Tag */}
        <div className="flex items-center justify-between mb-2">
          <div className="h-3.5 w-24 bg-slate-200 rounded-full shimmer" />
          <div className="h-3.5 w-12 bg-indigo-100 rounded-full shimmer" />
        </div>

        {/* Title Lines */}
        <div className="space-y-2 mb-3">
          <div className="h-4 w-full bg-slate-200 rounded-lg shimmer" />
          <div className="h-4 w-2/3 bg-slate-200 rounded-lg shimmer" />
        </div>

        {/* Rating and Reviews */}
        <div className="flex items-center space-x-2 mb-3.5">
          <div className="h-3 w-10 bg-amber-100 rounded-md shimmer" />
          <div className="h-3 w-20 bg-slate-100 rounded-md shimmer" />
        </div>

        {/* Price & Discount */}
        <div className="flex items-baseline space-x-2 mb-1">
          <div className="h-6 w-28 bg-slate-200 rounded-lg shimmer" />
          <div className="h-4 w-16 bg-slate-100 rounded-lg shimmer" />
        </div>
        <div className="h-3 w-36 bg-emerald-100 rounded-full shimmer mt-1.5" />
      </div>

      {/* Action Button */}
      <div className="pt-3 border-t border-slate-100/80">
        <div className="h-9 w-full bg-slate-200 rounded-full shimmer" />
      </div>
    </div>
  );
}
