'use client';

import { ShoppingCart } from 'lucide-react';
import type { Offer, Product } from '@/lib/api';
import { offerPrice, productImages } from '@/lib/catalog';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/context/ToastContext';

export function toCartItem(product: Product, offer: Offer, quantity = 1) {
  return {
    productOfferId: offer.id,
    productId: product.id,
    productTitle: product.title,
    productSlug: product.slug,
    storeId: offer.storeId,
    storeName: offer.store?.name ?? 'Tienda',
    unitPrice: offerPrice(offer),
    quantity,
    productImage: productImages(product)[0] ?? '',
    stock: offer.stock,
  };
}

/** Indigo cart button of the product cards; `light` is the white variant used on the offer tiles. */
export function QuickAdd({ product, offer, light = false }: { product: Product; offer: Offer; light?: boolean }) {
  const { addToCart } = useCart();
  const toast = useToast();
  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        addToCart(toCartItem(product, offer));
        toast(`Agregaste ${product.title} al carrito`);
      }}
      aria-label={`Agregar ${product.title} al carrito`}
      className={
        light
          ? 'p-1.5 rounded-lg bg-white hover:bg-[#4F46E5] text-slate-700 hover:text-white border border-slate-200 shadow-2xs transition-colors cursor-pointer'
          : 'w-9 h-9 shrink-0 rounded-xl bg-[#5B4DF0] hover:bg-[#4E3FE0] text-white flex items-center justify-center shadow-md shadow-indigo-500/25 transition-all active:scale-90 cursor-pointer'
      }
    >
      <ShoppingCart className={light ? 'w-3.5 h-3.5' : 'w-4 h-4'} />
    </button>
  );
}
