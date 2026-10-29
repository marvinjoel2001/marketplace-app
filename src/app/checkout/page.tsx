import { Suspense } from 'react';
import { Checkout } from '@/components/shop/Checkout';
import { PanelSkeleton } from '@/components/shop/Skeleton';

export const metadata = { title: 'Tu pedido — Vitrina' };

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-2xl space-y-4"><PanelSkeleton lines={3} /><PanelSkeleton lines={4} /></div>}>
      <Checkout />
    </Suspense>
  );
}
