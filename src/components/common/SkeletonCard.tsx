import React from 'react';

export function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-gray-200/80 p-4 shadow-2xs flex flex-col justify-between space-y-3">
      <div>
        {/* Image Shimmer Skeleton */}
        <div className="aspect-square w-full rounded-xl bg-gray-100 shimmer mb-3 flex items-center justify-center relative overflow-hidden" />

        {/* Vendor tag skeleton */}
        <div className="h-3 w-28 bg-gray-200 rounded-md shimmer mb-2" />

        {/* Title skeleton */}
        <div className="space-y-1.5 mb-3">
          <div className="h-4 w-full bg-gray-200 rounded-md shimmer" />
          <div className="h-4 w-3/4 bg-gray-200 rounded-md shimmer" />
        </div>

        {/* Rating skeleton */}
        <div className="flex items-center space-x-2 mb-3">
          <div className="h-3 w-12 bg-amber-100 rounded-md shimmer" />
          <div className="h-3 w-16 bg-gray-100 rounded-md shimmer" />
        </div>

        {/* Price skeleton */}
        <div className="h-6 w-24 bg-gray-200 rounded-md shimmer mb-1" />
        <div className="h-3 w-32 bg-green-100 rounded-md shimmer" />
      </div>

      {/* Button skeleton */}
      <div className="pt-2 border-t border-gray-100">
        <div className="h-8 w-full bg-gray-200 rounded-full shimmer" />
      </div>
    </div>
  );
}
