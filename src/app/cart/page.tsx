'use client';

import Link from 'next/link';
import { Trash2, Store as StoreIcon } from 'lucide-react';
import { groupByStore, useCart } from '@/context/CartContext';
import { formatBs } from '@/lib/utils';
import { QuantityStepper } from '@/components/shop/BuyBox';

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity } = useCart();
  const groups = groupByStore(cart);

  if (cart.length === 0) {
    return (
      <div className="mx-auto my-8 max-w-xl rounded-[2rem] border border-white/80 bg-white/80 p-8 text-center shadow-[0_20px_50px_rgba(0,0,0,0.06)] backdrop-blur-2xl sm:p-12">
        <h1 className="type-sign text-2xl font-extrabold">Tu carrito está vacío</h1>
        <p className="mt-2 text-muted">Agrega productos desde el inicio, las ofertas o un live.</p>
        <Link href="/" className="btn btn-primary mt-6">
          Ver productos
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-5">
      <h1 className="type-sign text-2xl font-extrabold">Carrito</h1>
      {groups.length > 1 && (
        <p className="text-sm text-ink-soft">
          Tienes productos de {groups.length} tiendas. Cada tienda entrega por separado, así que haces un pedido por tienda.
        </p>
      )}

      {groups.map((group) => {
        const subtotal = group.items.reduce((s, it) => s + it.unitPrice * it.quantity, 0);
        return (
          <section key={group.storeId} className="panel overflow-hidden" aria-label={`Productos de ${group.storeName}`}>
            <h2 className="flex items-center gap-2 border-b border-line px-4 py-3 font-bold">
              <StoreIcon className="h-4 w-4 text-verde" />
              {group.storeName}
            </h2>
            <ul className="divide-y divide-line">
              {group.items.map((item) => (
                <li key={item.productOfferId} className="flex gap-3 p-4">
                  <Link href={`/product/${item.productSlug}`} className="h-20 w-20 shrink-0 overflow-hidden rounded-lg border border-line bg-paper">
                    {item.productImage && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.productImage} alt="" className="h-full w-full object-cover" />
                    )}
                  </Link>
                  <div className="flex min-w-0 flex-1 flex-col gap-2">
                    <div className="flex items-start justify-between gap-2">
                      <p className="line-clamp-2 text-sm font-medium">{item.productTitle}</p>
                      <button
                        type="button"
                        onClick={() => removeFromCart(item.productOfferId)}
                        className="-mr-1 -mt-1 rounded-full p-1.5 text-muted hover:text-danger"
                        aria-label={`Quitar ${item.productTitle}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <QuantityStepper
                        value={item.quantity}
                        onChange={(v) => updateQuantity(item.productOfferId, v)}
                        max={Math.min(item.stock ?? 99, 99)}
                        label={`Cantidad de ${item.productTitle}`}
                      />
                      <span className="type-sign font-extrabold tabular-nums">{formatBs(item.unitPrice * item.quantity)}</span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            <div className="flex items-center justify-between gap-3 border-t border-line bg-paper/60 px-4 py-3">
              <div>
                <p className="text-sm text-muted">Productos</p>
                <p className="type-sign text-lg font-extrabold tabular-nums">{formatBs(subtotal)}</p>
              </div>
              <Link href={`/checkout?store=${group.storeId}`} className="btn btn-primary">
                Hacer pedido
              </Link>
            </div>
          </section>
        );
      })}
      <p className="text-center text-xs text-muted">El costo de envío se calcula con tu dirección en el siguiente paso.</p>
    </div>
  );
}
