import React from 'react';
import { SkeletonCard } from '@/components/common/SkeletonCard';

export default function GlobalLoading() {
  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Top ambient progress shimmer */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-emerald-400 to-indigo-500 z-50 animate-pulse" />

      {/* Hero Banner Skeleton */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-white/70 backdrop-blur-2xl border border-white/80 p-8 sm:p-12 shadow-[0_20px_50px_rgba(0,0,0,0.04)]">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-4">
            <div className="h-6 w-36 bg-indigo-100/70 rounded-full shimmer" />
            <div className="h-10 sm:h-12 w-4/5 bg-slate-200/80 rounded-2xl shimmer" />
            <div className="h-10 sm:h-12 w-3/5 bg-slate-200/80 rounded-2xl shimmer" />
            <div className="h-5 w-full max-w-md bg-slate-100 rounded-lg shimmer pt-1" />
            <div className="pt-4 flex items-center gap-3">
              <div className="h-12 w-40 bg-indigo-600/30 rounded-full shimmer" />
              <div className="h-12 w-32 bg-slate-200/60 rounded-full shimmer" />
            </div>
          </div>
          <div className="lg:col-span-5 flex items-center justify-center">
            <div className="w-64 h-64 sm:w-80 sm:h-80 rounded-3xl bg-slate-100/90 shimmer relative overflow-hidden flex items-center justify-center" />
          </div>
        </div>
      </div>

      {/* Category Pills Carousel Skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 sm:gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="bg-white/75 backdrop-blur-xl border border-white/80 rounded-2xl p-4 flex flex-col items-center justify-center text-center shimmer aspect-square sm:aspect-auto sm:py-6 space-y-2"
          >
            <div className="w-10 h-10 rounded-xl bg-slate-200/80 shimmer" />
            <div className="h-3 w-16 bg-slate-200/80 rounded-full shimmer" />
          </div>
        ))}
      </div>

      {/* Grid of Skeleton Product Cards with Staggered Delays */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <div className="h-7 w-48 bg-slate-200/80 rounded-xl shimmer" />
          <div className="h-4 w-28 bg-slate-100 rounded-full shimmer" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <SkeletonCard
              key={i}
              className={`animate-fade-in-up delay-${((i % 4) + 1) * 100}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
