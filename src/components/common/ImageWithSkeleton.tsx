'use client';

import React, { useState } from 'react';
import { ImageOff } from 'lucide-react';

interface ImageWithSkeletonProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  className?: string;
  containerClassName?: string;
  skeletonClassName?: string;
  fallbackSrc?: string;
}

export function ImageWithSkeleton({
  src,
  alt,
  className = '',
  containerClassName = '',
  skeletonClassName = '',
  fallbackSrc,
  ...rest
}: ImageWithSkeletonProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const handleLoad = () => {
    setIsLoaded(true);
  };

  const handleError = () => {
    setHasError(true);
    setIsLoaded(true);
  };

  return (
    <div className={`relative overflow-hidden ${containerClassName}`}>
      {/* Shimmer Skeleton Placeholder */}
      {!isLoaded && !hasError && (
        <div
          className={`absolute inset-0 w-full h-full shimmer z-10 ${skeletonClassName}`}
          aria-hidden="true"
        />
      )}

      {/* Error Fallback */}
      {hasError ? (
        fallbackSrc ? (
          <img
            src={fallbackSrc}
            alt={alt}
            className={`w-full h-full object-contain ${className}`}
            {...rest}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-slate-100 text-slate-400 p-4 text-center">
            <ImageOff className="w-6 h-6 mb-1 opacity-50" />
            <span className="text-[10px] font-medium truncate max-w-full">Imagen no disponible</span>
          </div>
        )
      ) : (
        /* Actual Image with Progressive Smooth Reveal */
        <img
          src={src}
          alt={alt}
          onLoad={handleLoad}
          onError={handleError}
          className={`transition-all duration-500 ease-out ${
            isLoaded ? 'opacity-100 scale-100 blur-0' : 'opacity-0 scale-105 blur-sm'
          } ${className}`}
          {...rest}
        />
      )}
    </div>
  );
}
