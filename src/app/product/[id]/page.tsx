import React from 'react';
import Link from 'next/link';
import { ShoppingBag, ArrowLeft } from 'lucide-react';
import { marketplaceApi } from '@/lib/api';
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

  if (!product) {
    return (
      <div className="max-w-xl mx-auto my-16 p-8 bg-white/80 backdrop-blur-2xl rounded-3xl border border-slate-200/80 text-center shadow-card">
        <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-4 border border-slate-200">
          <ShoppingBag className="w-8 h-8 text-slate-400" />
        </div>
        <span className="inline-flex items-center px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-bold mb-3">
          Modo Real: Base de Datos
        </span>
        <h1 className="text-2xl font-black text-slate-900 mb-2">Producto no encontrado</h1>
        <p className="text-xs text-slate-500 mb-6 max-w-sm mx-auto leading-relaxed">
          El producto con identificador o enlace &quot;{id}&quot; no existe en la base de datos real. Solo se muestran los productos que registres en tu tienda.
        </p>
        <Link
          href="/"
          className="inline-flex items-center space-x-2 px-6 py-2.5 rounded-full bg-[#5B4DF0] hover:bg-[#4E3FE0] text-white text-xs font-bold transition-all shadow-md active:scale-95"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver a la tienda</span>
        </Link>
      </div>
    );
  }

  return <PriceComparisonView product={product as any} />;
}
