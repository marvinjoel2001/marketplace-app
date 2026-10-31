'use client';

import { useEffect } from 'react';
import Link from 'next/link';

// Anything that breaks while rendering a page (usually the backend not answering) lands here instead of a blank screen.
export default function Error({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto my-8 max-w-xl rounded-[2rem] border border-white/80 bg-white/80 p-8 text-center shadow-[0_20px_50px_rgba(0,0,0,0.06)] backdrop-blur-2xl sm:p-12">
      <h1 className="type-sign text-2xl font-extrabold">Algo no cargó bien</h1>
      <p className="mt-2 text-muted">Puede ser tu conexión o nuestro servidor. Inténtalo otra vez en un momento.</p>
      <div className="mt-6 flex justify-center gap-3">
        <button type="button" className="btn btn-primary" onClick={() => retry()}>
          Reintentar
        </button>
        <Link href="/" className="btn btn-ghost">
          Ir al inicio
        </Link>
      </div>
    </div>
  );
}
