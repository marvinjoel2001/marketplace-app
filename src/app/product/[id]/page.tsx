import React from 'react';
import { marketplaceApi } from '@/lib/api';
import { getMockProduct } from '@/lib/mockData';
import { PriceComparisonView } from '@/components/compare/PriceComparisonView';

export const dynamic = 'force-dynamic';

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let product: any = null;
  try {
    product = await marketplaceApi.getProduct(id);
  } catch {
    product = null;
  }

  // Resilient fallback: Never trigger 404
  if (!product) {
    product = getMockProduct(id);
  }

  return <PriceComparisonView product={product as any} />;
}
