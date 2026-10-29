import { Bone, PanelSkeleton } from '@/components/shop/Skeleton';

export default function Loading() {
  return (
    <div className="mx-auto max-w-xl space-y-4" aria-busy="true" aria-label="Cargando pedido">
      <Bone className="h-6 w-28 rounded-md" />
      <Bone className="h-8 w-3/4" />
      <PanelSkeleton lines={4} />
      <PanelSkeleton lines={3} />
    </div>
  );
}