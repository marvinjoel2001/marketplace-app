'use client';

import { Plus } from 'lucide-react';
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

export function QuickAdd({ product, offer }: { product: Product; offer: Offer }) {
  const { addToCart } = useCart();
  const toast = useToast();
  return (
    <button
      type="button"
      onClick={() => {
        addToCart(toCartItem(product, offer));
        toast(`Agregaste ${product.title}`);
      }}
      aria-label={`Agregar ${product.title} al carrito`}
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-verde text-white hover:bg-verde-dark active:scale-95"
    >
      <Plus className="h-5 w-5" strokeWidth={2.5} />
    </button>
  );
}
