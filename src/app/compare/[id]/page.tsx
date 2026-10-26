import React from 'react';
import Link from 'next/link';
import { marketplaceApi } from '@/lib/api';
import { PriceComparisonView } from '@/components/compare/PriceComparisonView';
import { Scale, ArrowRight } from 'lucide-react';

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
    product = null;
  }

  // If product not found in the database, show a clean not-found state
  if (!product) {
    return (
      <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200/80 text-center max-w-xl mx-auto my-8">
        <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-4 border border-slate-200">
          <Scale className="w-8 h-8 text-slate-400" />
        </div>
        <h3 className="text-xl font-black text-slate-900 mb-2">Producto no encontrado</h3>
        <p className="text-xs text-slate-500 mb-6 max-w-md mx-auto leading-relaxed">
          El producto que buscas no está disponible en el marketplace. Es posible que haya sido eliminado o aún no haya sido publicado.
        </p>
        <Link
          href="/compare"
          className="inline-flex items-center space-x-2 px-6 py-3 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-md active:scale-95"
        >
          <span>Ver Comparador</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return <PriceComparisonView product={product as any} />;
}
