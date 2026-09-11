'use client';

import React, { useState } from 'react';
import { ShoppingCart, CheckCircle2, Loader2, Check } from 'lucide-react';
import { useCart, CartItem } from '@/context/CartContext';

interface AddToCartButtonProps {
  item: CartItem;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  showIcon?: boolean;
  variant?: 'pill' | 'icon';
}

export function AddToCartButton({
  item,
  className = '',
  size = 'md',
  text = 'Añadir al carrito',
  showIcon = true,
  variant = 'pill',
}: AddToCartButtonProps) {
  const { addToCart } = useCart();
  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle');

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (status !== 'idle') return;

    setStatus('loading');

    // Smooth microinteraction timing: 300ms spinner -> success checkmark -> back to idle
    setTimeout(() => {
      addToCart(item);
      setStatus('success');

      setTimeout(() => {
        setStatus('idle');
      }, 1600);
    }, 320);
  };

  // Icon-only variant (matching reference image bottom-right product card icon)
  if (variant === 'icon') {
    return (
      <button
        type="button"
        onClick={handleClick}
        disabled={status === 'loading'}
        aria-label={`Añadir al carrito - ${item.productTitle}`}
        className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl flex items-center justify-center transition-all duration-200 active:scale-90 shadow-sm ${
          status === 'success'
            ? 'bg-emerald-600 text-white shadow-md scale-105'
            : status === 'loading'
            ? 'bg-slate-100 text-slate-400 cursor-wait'
            : 'bg-[#5B4DF0] hover:bg-[#4E3FE0] text-white shadow-indigo-500/20 hover:scale-105'
        } ${className}`}
      >
        {status === 'loading' && <Loader2 className="w-4 h-4 animate-spin text-white" />}
        {status === 'success' && <Check className="w-4 h-4 animate-badge-pop stroke-[2.5] text-white" />}
        {status === 'idle' && <ShoppingCart className="w-4 h-4 text-white" />}
      </button>
    );
  }

  const sizeClasses = {
    sm: 'py-1.5 px-3 text-[11px]',
    md: 'py-2 px-4 text-xs',
    lg: 'py-3 px-6 text-sm',
  }[size];

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={status === 'loading'}
      aria-label={`${text} - ${item.productTitle}`}
      className={`relative w-full rounded-full font-black flex items-center justify-center space-x-1.5 transition-all duration-200 shadow-xs active:scale-95 select-none ${sizeClasses} ${
        status === 'success'
          ? 'bg-emerald-700 text-white border border-emerald-800 shadow-md ring-2 ring-emerald-300'
          : status === 'loading'
          ? 'bg-gray-800 text-gray-200 cursor-wait'
          : 'bg-[#4F46E5] hover:bg-[#4338CA] text-white active:bg-indigo-900'
      } ${className}`}
    >
      {status === 'loading' && (
        <>
          <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
          <span>Añadiendo...</span>
        </>
      )}

      {status === 'success' && (
        <span className="flex items-center space-x-1 animate-badge-pop">
          <CheckCircle2 className="w-3.5 h-3.5 text-white stroke-[2.5]" />
          <span>¡Añadido!</span>
        </span>
      )}

      {status === 'idle' && (
        <>
          {showIcon && <ShoppingCart className="w-3.5 h-3.5" />}
          <span>{text}</span>
        </>
      )}
    </button>
  );
}
