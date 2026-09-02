import React from 'react';
import { SkeletonCard } from '@/components/common/SkeletonCard';

export default function GlobalLoading() {
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top progress bar hint */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-amber-400 z-50 animate-pulse" />

      {/* Hero Banner Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="md:col-span-2 h-64 rounded-3xl bg-gray-200/80 shimmer p-6" />
        <div className="h-64 rounded-3xl bg-gray-200/80 shimmer p-6" />
      </div>

      {/* Grid of Skeleton Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    </div>
  );
}
