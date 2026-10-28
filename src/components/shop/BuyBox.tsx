'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Minus, Plus } from 'lucide-react';
import type { Offer, Product } from '@/lib/api';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/context/ToastContext';
import { toCartItem } from './QuickAdd';

export function QuantityStepper({
  value,
  onChange,
  max,
  label,
}: {
  value: number;
  onChange: (v: number) => void;
  max: number;
  label: string;
}) {
  return (
    <div className="inline-flex items-center rounded-full border border-line bg-surface" role="group" aria-label={label}>
      <button type="button" className="p-2.5 text-ink-soft disabled:opacity-40" onClick={() => onChange(value - 1)} disabled={value <= 1} aria-label="Quitar uno">
        <Minus className="h-4 w-4" />
      </button>
      <span className="min-w-8 text-center font-bold tabular-nums" aria-live="polite">
        {value}
      </span>
      <button type="button" className="p-2.5 text-ink-soft disabled:opacity-40" onClick={() => onChange(value + 1)} disabled={value >= max} aria-label="Agregar uno">
        <Plus className="h-4 w-4" />
      </button>
    </div>
  );
}

export function BuyBox({ product, offer }: { product: Product; offer: Offer }) {
  const [qty, setQty] = useState(1);
  const { addToCart } = useCart();
  const toast = useToast();
  const router = useRouter();

  if (offer.stock <= 0) {
    return <p className="panel px-4 py-3 font-semibold text-ink-soft">Agotado por ahora.</p>;
  }

  const add = () => addToCart(toCartItem(product, offer, qty));

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <QuantityStepper value={qty} onChange={setQty} max={Math.min(offer.stock, 99)} label="Cantidad" />
        <span className="text-sm text-muted">{offer.stock <= 5 ? `Quedan ${offer.stock}` : 'Disponible'}</span>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          className="btn btn-ghost"
          onClick={() => {
            add();
            toast('Agregado al carrito');
          }}
        >
          Agregar al carrito
        </button>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => {
            add();
            router.push(`/checkout?store=${offer.storeId}`);
          }}
        >
          Comprar ahora
        </button>
      </div>
    </div>
  );
}
