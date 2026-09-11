'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, Truck, ShieldCheck, Store, Lock } from 'lucide-react';
import { useCart, CartItem } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { formatBs } from '@/lib/utils';
import { ImageWithSkeleton } from '@/components/common/ImageWithSkeleton';

export function CartDrawer() {
  const router = useRouter();
  const { isAuthenticated, openAuthModal } = useAuth();
  const {
    cart,
    isCartDrawerOpen,
    setIsCartDrawerOpen,
    removeFromCart,
    updateQuantity,
    subtotal,
    shippingFee,
    totalAmount,
    totalItems,
  } = useCart();

  if (!isCartDrawerOpen) return null;

  // Group items by store
  const itemsByStore = cart.reduce((groups, item) => {
    const store = item.storeName || 'Tienda Oficial';
    if (!groups[store]) {
      groups[store] = [];
    }
    groups[store].push(item);
    return groups;
  }, {} as Record<string, CartItem[]>);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={() => setIsCartDrawerOpen(false)}
        className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-200">
          {/* Header */}
          <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/70">
            <div className="flex items-center space-x-2">
              <ShoppingBag className="w-5 h-5 text-amber-500" />
              <h2 className="text-base font-bold text-gray-900">
                Tu Carrito ({totalItems} {totalItems === 1 ? 'producto' : 'productos'})
              </h2>
            </div>
            <button
              onClick={() => setIsCartDrawerOpen(false)}
              className="p-1.5 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-200/60"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Items List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 divide-y divide-gray-100">
            {cart.length === 0 ? (
              <div className="text-center py-16 flex flex-col items-center justify-center">
                <div className="w-20 h-20 rounded-full bg-amber-50 flex items-center justify-center text-4xl mb-4 text-amber-400">
                  🛒
                </div>
                <h3 className="text-base font-bold text-gray-800 mb-1">Tu carrito está vacío</h3>
                <p className="text-xs text-gray-500 max-w-xs mb-6">
                  Explora nuestras ofertas relámpago o compra directamente en las transmisiones de TikTok Live.
                </p>
                <button
                  onClick={() => setIsCartDrawerOpen(false)}
                  className="px-6 py-2.5 bg-black text-white text-xs font-bold rounded-full hover:bg-gray-800 transition-all shadow-md"
                >
                  Continuar Comprando
                </button>
              </div>
            ) : (
              Object.entries(itemsByStore).map(([storeName, storeItems]) => (
                <div key={storeName} className="pt-3 first:pt-0 space-y-3">
                  {/* Store Header Badge */}
                  <div className="flex items-center justify-between bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200/60">
                    <div className="flex items-center space-x-1.5 text-xs font-bold text-gray-800">
                      <Store className="w-3.5 h-3.5 text-amber-500" />
                      <span>{storeName}</span>
                    </div>
                    <span className="text-[10px] bg-green-100 text-green-800 font-semibold px-2 py-0.5 rounded-full">
                      Despacho Express OpenDSP
                    </span>
                  </div>

                  {/* Products inside this store */}
                  {storeItems.map((item) => (
                    <div
                      key={item.productOfferId || item.productId}
                      className="flex space-x-3 bg-white p-2.5 rounded-xl border border-gray-100 hover:border-gray-200 transition-all hover-card-3d"
                    >
                      <div className="w-16 h-16 rounded-lg bg-gray-50 border border-gray-100 overflow-hidden relative shrink-0">
                        <ImageWithSkeleton
                          src={item.productImage || 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=200'}
                          alt={item.productTitle}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-gray-900 truncate">{item.productTitle}</p>
                        <p className="text-sm font-extrabold text-gray-900 mt-0.5">{formatBs(item.unitPrice)}</p>

                        <div className="flex items-center justify-between mt-2">
                          {/* Quantity selector */}
                          <div className="flex items-center border border-gray-200 rounded-full bg-gray-50 px-1 py-0.5">
                            <button
                              onClick={() =>
                                updateQuantity(item.productOfferId || item.productId, item.quantity - 1)
                              }
                              className="p-1 text-gray-600 hover:text-black"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="px-2 text-xs font-bold text-gray-800">{item.quantity}</span>
                            <button
                              onClick={() =>
                                updateQuantity(item.productOfferId || item.productId, item.quantity + 1)
                              }
                              className="p-1 text-gray-600 hover:text-black"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>

                          {/* Remove button */}
                          <button
                            onClick={() => removeFromCart(item.productOfferId || item.productId)}
                            className="text-gray-400 hover:text-red-500 p-1"
                            title="Eliminar producto"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ))
            )}
          </div>

          {/* Footer / Summary */}
          {cart.length > 0 && (
            <div className="p-4 border-t border-gray-100 bg-gray-50/50 space-y-3">
              <div className="space-y-1.5 text-xs text-gray-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-gray-900">{formatBs(subtotal)}</span>
                </div>
                <div className="flex justify-between items-center text-green-700">
                  <span className="flex items-center">
                    <Truck className="w-3.5 h-3.5 mr-1" /> Envío OpenDSP
                  </span>
                  <span className="font-semibold">
                    {shippingFee === 0 ? '¡Gratis!' : formatBs(shippingFee)}
                  </span>
                </div>
                <div className="border-t border-gray-200 pt-2 flex justify-between text-sm font-bold text-gray-900">
                  <span>Total a pagar</span>
                  <span className="text-lg font-black text-gray-900">{formatBs(totalAmount)}</span>
                </div>
              </div>

              <div className="flex items-center text-[10px] text-gray-500 space-x-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-green-600" />
                <span>Pago seguro con QR Simple, Tarjeta o Billetera Móvil.</span>
              </div>

              <button
                type="button"
                onClick={() => {
                  setIsCartDrawerOpen(false);
                  if (!isAuthenticated) {
                    openAuthModal({
                      onComplete: () => {
                        router.push('/checkout');
                      },
                    });
                  } else {
                    router.push('/checkout');
                  }
                }}
                className="w-full py-3.5 bg-amber-400 hover:bg-amber-500 text-black font-extrabold text-sm rounded-full flex items-center justify-center space-x-2 transition-all shadow-md active:scale-98"
              >
                <span>Proceder al Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
