import { TrackingView } from '@/components/shop/TrackingView';

export const dynamic = 'force-dynamic';
// The page shows a delivery address: keep it out of search engines.
export const metadata = { title: 'Sigue tu pedido — Vitrina', robots: { index: false, follow: false } };

/** Public tracking page: whoever has the link (the customer, or the store that shares it) follows the order. */
export default async function TrackingPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  return <TrackingView code={code} />;
}
