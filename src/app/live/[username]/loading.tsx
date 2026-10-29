import '../live.css';

export default function Loading() {
  return (
    <div className="live-page" style={{ display: 'block' }} aria-busy="true" aria-label="Entrando al live">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.45fr)_minmax(340px,1fr)] lg:rounded-[28px] lg:border lg:border-[#1f2a33] lg:bg-[#0b1117] lg:p-5">
        <div>
          <div className="mb-3 flex items-center gap-3">
            <div className="h-11 w-11 rounded-full bg-[#1f2a33] animate-pulse" />
            <div className="space-y-2">
              <div className="h-4 w-48 rounded bg-[#1f2a33] animate-pulse" />
              <div className="h-3 w-28 rounded bg-[#1a242c] animate-pulse" />
            </div>
          </div>
          <div className="h-[72dvh] max-h-[680px] min-h-[420px] rounded-[22px] bg-[#11191f] animate-pulse" />
        </div>
        <div className="space-y-3 rounded-[22px] border border-[#1f2a33] bg-[#10171d] p-3 lg:border-0 lg:bg-transparent">
          <div className="h-11 rounded-full bg-[#1f2a33] animate-pulse" />
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 rounded-2xl bg-[#151e26] animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  );
}
