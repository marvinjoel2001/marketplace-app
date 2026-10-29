/** Loading placeholders in the storefront's glass style; the shimmer stops when motion is reduced. */

export function Bone({ className = '' }: { className?: string }) {
  return <div className={`shimmer rounded-xl ${className}`} aria-hidden />;
}

export function ProductCardSkeleton() {
  return (
    <div className="bg-white/90 rounded-[1.75rem] border border-white/80 p-3 sm:p-4 shadow-sm space-y-3" aria-hidden>
      <Bone className="aspect-[4/3] w-full rounded-[1.25rem]" />
      <Bone className="h-4 w-4/5" />
      <Bone className="h-3 w-1/2" />
      <div className="flex items-center justify-between pt-1">
        <Bone className="h-6 w-20" />
        <Bone className="h-9 w-9 rounded-xl" />
      </div>
    </div>
  );
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

/** Rows like the store panel lists (photo, two lines, value). */
export function ListSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="panel divide-y divide-slate-100 overflow-hidden" aria-busy="true" aria-label="Cargando">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 p-3.5">
          <Bone className="h-12 w-12 shrink-0" />
          <div className="flex-1 space-y-2">
            <Bone className="h-3.5 w-3/5" />
            <Bone className="h-3 w-2/5" />
          </div>
          <Bone className="h-4 w-14" />
        </div>
      ))}
    </div>
  );
}

/** A glass card with a title bar and a few text lines. */
export function PanelSkeleton({ lines = 3, className = '' }: { lines?: number; className?: string }) {
  return (
    <div className={`panel p-5 space-y-3 ${className}`} aria-busy="true" aria-label="Cargando">
      <Bone className="h-5 w-2/5" />
      {Array.from({ length: lines }).map((_, i) => (
        <Bone key={i} className={`h-3.5 ${i % 2 ? 'w-3/5' : 'w-4/5'}`} />
      ))}
    </div>
  );
}

/** Home while it loads: carousel, live + offers row, categories and products. */
export function HomeSkeleton() {
  return (
    <div className="w-full" aria-busy="true" aria-label="Cargando productos">
      <div className="rounded-[2.5rem] bg-white/80 backdrop-blur-2xl border border-white/80 shadow-[0_20px_50px_rgba(0,0,0,0.06)] p-6 sm:p-10 lg:p-14 mb-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        <div className="lg:col-span-7 space-y-4">
          <Bone className="h-7 w-36 rounded-full" />
          <Bone className="h-12 w-4/5" />
          <Bone className="h-12 w-3/5" />
          <Bone className="h-4 w-full max-w-md" />
          <Bone className="h-12 w-44 rounded-full" />
        </div>
        <Bone className="lg:col-span-5 aspect-4/3 sm:aspect-square w-full max-w-[420px] mx-auto rounded-3xl" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mb-10">
        <div className="lg:col-span-5 panel p-5 space-y-4">
          <Bone className="h-6 w-40" />
          <div className="flex gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Bone key={i} className="h-16 w-16 rounded-full shrink-0" />
            ))}
          </div>
        </div>
        <div className="lg:col-span-7 panel p-5 space-y-4">
          <Bone className="h-6 w-48" />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Bone key={i} className="aspect-square w-full rounded-2xl" />
            ))}
          </div>
        </div>
      </div>
      <ProductGridSkeleton />
    </div>
  );
}
