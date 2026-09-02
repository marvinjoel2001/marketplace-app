import React from 'react';
import { notFound } from 'next/navigation';
import { marketplaceApi } from '@/lib/api';
import { PriceComparisonView } from '@/components/compare/PriceComparisonView';

export const dynamic = 'force-dynamic';

export default async function ComparePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let product: any = null;
  try {
    product = await marketplaceApi.getProduct(id);
  } catch {
    try {
      product = await marketplaceApi.getProduct('chompa-oversize-beige-talla-m');
    } catch {
      notFound();
    }
  }

  if (!product) {
    notFound();
  }

  return <PriceComparisonView product={product as any} />;
}
