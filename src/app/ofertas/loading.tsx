import { Bone, ProductGridSkeleton } from '@/components/shop/Skeleton';

export default function Loading() {
  return (
    <div className="space-y-5" aria-busy="true" aria-label="Cargando ofertas">
      <Bone className="h-10 w-40" />
      <ProductGridSkeleton />
    </div>
  );
}