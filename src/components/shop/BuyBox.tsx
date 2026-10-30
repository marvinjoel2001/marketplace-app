'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Minus, Plus } from 'lucide-react';
import type { Offer, Product } from '@/lib/api';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/context/ToastContext';
import { parseVariants } from '@/lib/variants';
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

/** Chips for the product's options (sizes, numbers, voltages, ...); sold-out ones stay visible but disabled. */
export function VariantPicker({ offer, value, onChange, dark = false }: { offer: Offer; value: string; onChange: (label: string) => void; dark?: boolean }) {
  const variants = parseVariants(offer);
  if (!variants.length) return null;
  const axis = offer.variantAxis || 'Opción';
  return (
    <fieldset>
      <legend className={`mb-2 text-sm font-semibold ${dark ? 'text-white' : ''}`}>{axis}{value && <span className={`ml-1.5 font-normal ${dark ? 'text-white/70' : 'text-muted'}`}>{value}</span>}</legend>
      <div className="flex flex-wrap gap-2">
        {variants.map((v) => (
          <button
            key={v.label}
            type="button"
            className={`chip !min-h-10 !px-4 disabled:cursor-not-allowed disabled:line-through disabled:opacity-45 ${dark ? '!border-white/20 !bg-white/10 !text-white aria-pressed:!bg-white aria-pressed:!text-ink' : ''}`}
            aria-pressed={value === v.label}
            disabled={v.stock <= 0}
            onClick={() => onChange(v.label)}
            aria-label={v.stock > 0 ? `${axis} ${v.label}` : `${axis} ${v.label}, agotado`}
          >
            {v.label}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

export function BuyBox({ product, offer }: { product: Product; offer: Offer }) {
  const [qty, setQty] = useState(1);
  const variants = parseVariants(offer);
  const [variant, setVariant] = useState(() => (variants.filter((v) => v.stock > 0).length === 1 ? variants.find((v) => v.stock > 0)!.label : ''));
  const chosen = variants.find((v) => v.label === variant);
  const available = variants.length ? chosen?.stock ?? 0 : offer.stock;
  const { addToCart } = useCart();
  const toast = useToast();
  const router = useRouter();

  if (offer.stock <= 0) {
    return <p className="panel px-4 py-3 font-semibold text-ink-soft">Agotado por ahora.</p>;
  }

  const missing = variants.length > 0 && !chosen;
  const add = () => addToCart(toCartItem(product, offer, Math.min(qty, available), variant || undefined));

  return (
    <div className="flex flex-col gap-3">
      <VariantPicker offer={offer} value={variant} onChange={(label) => { setVariant(label); setQty(1); }} />
      <div className="flex items-center justify-between">
        <QuantityStepper value={qty} onChange={setQty} max={Math.max(1, Math.min(available, 99))} label="Cantidad" />
        <span className="text-sm text-muted">{missing ? `Elige ${(offer.variantAxis || 'una opción').toLowerCase()}` : available <= 5 ? (available === 1 ? 'Queda 1' : `Quedan ${available}`) : 'Disponible'}</span>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          className="btn btn-ghost"
          disabled={missing}
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
          disabled={missing}
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
