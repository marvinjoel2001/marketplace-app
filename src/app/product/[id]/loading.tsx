import { Bone } from '@/components/shop/Skeleton';

export default function Loading() {
  return (
    <div className="rounded-[2.5rem] bg-white/80 backdrop-blur-2xl border border-white/80 p-4 sm:p-8 grid gap-6 md:grid-cols-2 md:gap-10" aria-busy="true" aria-label="Cargando producto">
      <Bone className="aspect-square w-full rounded-[2rem]" />
      <div className="space-y-4">
        <Bone className="h-6 w-32 rounded-full" />
        <Bone className="h-10 w-4/5" />
        <Bone className="h-9 w-36" />
        <Bone className="h-12 w-full rounded-full" />
        <Bone className="h-24 w-full rounded-2xl" />
      </div>
    </div>
  );
}