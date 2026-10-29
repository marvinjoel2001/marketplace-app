import './live.css';

export default function Loading() {
  // Dark placeholders matching the live directory while lives load; `live-page` keeps the dark theme.
  return (
    <div className="live-page" style={{ display: 'block' }} aria-busy="true" aria-label="Cargando lives">
      <div className="mb-4 h-11 w-72 rounded-full bg-[#151e26] border border-[#253039] animate-pulse" />
      <div className="mb-6 h-48 rounded-[22px] bg-[#11191f] border border-[#202b32] animate-pulse" />
      <div className="grid gap-5 grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="rounded-[17px] bg-[#10171d] border border-[#26313a] overflow-hidden">
            <div className="aspect-[1.9] bg-[#182127] animate-pulse" />
            <div className="p-3 space-y-2">
              <div className="h-3.5 w-3/5 rounded bg-[#1f2a33] animate-pulse" />
              <div className="h-3 w-4/5 rounded bg-[#1a242c] animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
