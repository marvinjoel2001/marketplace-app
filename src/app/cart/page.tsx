'use client';

import React from 'react';
import Link from 'next/link';
import { ShoppingBag, ArrowRight, Trash2, Plus, Minus, Truck, ShieldCheck, Store, ChevronRight } from 'lucide-react';
import { useCart, CartItem } from '@/context/CartContext';
import { formatBs } from '@/lib/utils';

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, subtotal, shippingFee, totalAmount, totalItems } = useCart();

  const itemsByStore = cart.reduce((groups, item) => {
    const store = item.storeName || 'Tienda Oficial';
    if (!groups[store]) {
      groups[store] = [];
    }
    groups[store].push(item);
    return groups;
  }, {} as Record<string, CartItem[]>);

  if (cart.length === 0) {
    return (
      <div className="bg-white rounded-3xl p-12 text-center max-w-2xl mx-auto border border-gray-200/70 shadow-2xs my-12">
        <div className="w-24 h-24 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center text-5xl mx-auto mb-4">
          🛒
        </div>
        <h2 className="text-2xl font-black text-gray-900 mb-2">Tu carrito está vacío</h2>
        <p className="text-xs text-gray-500 mb-6 max-w-md mx-auto">
          ¡Aprovecha nuestras ofertas relámpago, compara precios entre tiendas o únete a un TikTok Live para comprar en vivo!
        </p>
        <Link
          href="/"
          className="inline-flex items-center space-x-2 px-8 py-3.5 bg-amber-400 hover:bg-amber-500 text-black font-extrabold text-xs rounded-full transition-all shadow-md active:scale-95"
        >
          <span>Explorar Productos</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <nav className="flex items-center space-x-2 text-xs text-gray-500">
        <Link href="/" className="hover:text-black">Inicio</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-gray-900 font-bold">Carrito ({totalItems} productos)</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {Object.entries(itemsByStore).map(([storeName, storeItems]) => (
            <div key={storeName} className="bg-white rounded-3xl p-5 border border-gray-200/70 shadow-2xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <div className="flex items-center space-x-2">
                  <Store className="w-4 h-4 text-amber-500" />
                  <h3 className="font-extrabold text-sm text-gray-900">{storeName}</h3>
                </div>
                <span className="text-[10px] bg-green-100 text-green-800 font-bold px-2 py-0.5 rounded-full">
                  Despacho con OpenDSP
                </span>
              </div>

              {storeItems.map((item) => (
                <div key={item.productOfferId || item.productId} className="flex space-x-4 items-center">
                  <img
                    src={item.productImage}
                    alt={item.productTitle}
                    className="w-20 h-20 object-contain rounded-xl bg-gray-50 p-2 border border-gray-100"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-gray-900 truncate">{item.productTitle}</h4>
                    <p className="text-sm font-black text-gray-900 mt-1">{formatBs(item.unitPrice)}</p>

                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center border border-gray-200 rounded-full bg-gray-50 px-2 py-0.5">
                        <button
                          onClick={() => updateQuantity(item.productOfferId || item.productId, item.quantity - 1)}
                          className="p-1 text-gray-600 hover:text-black"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="px-3 text-xs font-bold text-gray-800">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.productOfferId || item.productId, item.quantity + 1)}
                          className="p-1 text-gray-600 hover:text-black"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <button
                        onClick={() => removeFromCart(item.productOfferId || item.productId)}
                        className="text-gray-400 hover:text-red-500 p-1.5"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>

        <div className="bg-white rounded-3xl p-6 border border-gray-200/70 shadow-2xs h-fit space-y-4">
          <h3 className="font-extrabold text-base text-gray-900 pb-3 border-b border-gray-100">
            Resumen de Compra
          </h3>

          <div className="space-y-2 text-xs text-gray-600">
            <div className="flex justify-between">
              <span>Subtotal ({totalItems} productos)</span>
              <span className="font-bold text-gray-900">{formatBs(subtotal)}</span>
            </div>
            <div className="flex justify-between text-green-700 font-bold">
              <span className="flex items-center">
                <Truck className="w-3.5 h-3.5 mr-1" /> Envío OpenDSP
              </span>
              <span>{shippingFee === 0 ? 'Gratis' : formatBs(shippingFee)}</span>
            </div>
            <div className="border-t border-gray-200 pt-3 flex justify-between text-base font-black text-gray-900">
              <span>Total</span>
              <span className="text-xl text-black">{formatBs(totalAmount)}</span>
            </div>
          </div>

          <Link
            href="/checkout"
            className="w-full py-3.5 bg-amber-400 hover:bg-amber-500 text-black font-extrabold text-sm rounded-full flex items-center justify-center space-x-2 transition-all shadow-md active:scale-95"
          >
            <span>Continuar al Checkout</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
