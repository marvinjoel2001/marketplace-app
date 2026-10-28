import { Suspense } from 'react';
import { Checkout } from '@/components/shop/Checkout';

export const metadata = { title: 'Tu pedido — Vitrina' };

export default function CheckoutPage() {
  return (
    <Suspense fallback={<p className="py-10 text-center text-muted">Cargando tu pedido…</p>}>
      <Checkout />
    </Suspense>
  );
}
