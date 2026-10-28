export default function Loading() {
  return (
    <div className="grid grid-cols-2 gap-x-3 gap-y-6 sm:grid-cols-3 lg:grid-cols-5" aria-busy="true" aria-label="Cargando">
      {Array.from({ length: 10 }).map((_, i) => (
        <div key={i}>
          <div className="aspect-square animate-pulse rounded-[var(--radius-card)] bg-line/60" />
          <div className="mt-2 h-3.5 w-4/5 animate-pulse rounded bg-line/60" />
          <div className="mt-2 h-6 w-1/2 animate-pulse rounded bg-tag/40" />
        </div>
      ))}
    </div>
  );
}
