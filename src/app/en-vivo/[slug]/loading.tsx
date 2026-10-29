import { Bone, ProductGridSkeleton } from '@/components/shop/Skeleton';

export default function Loading() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Cargando tienda">
      <div className="flex items-center gap-4">
        <Bone className="h-16 w-16 rounded-full" />
        <div className="space-y-2">
          <Bone className="h-7 w-48" />
          <Bone className="h-4 w-56" />
        </div>
      </div>
      <ProductGridSkeleton count={4} />
    </div>
  );
}