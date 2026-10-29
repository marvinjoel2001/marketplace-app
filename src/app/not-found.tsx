import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="mx-auto my-8 max-w-xl rounded-[2rem] border border-white/80 bg-white/80 p-8 text-center shadow-[0_20px_50px_rgba(0,0,0,0.06)] backdrop-blur-2xl sm:p-12">
      <h1 className="type-sign text-2xl font-extrabold">No encontramos esta página</h1>
      <p className="mt-2 text-muted">Puede que el producto o la tienda ya no estén publicados.</p>
      <Link href="/" className="btn btn-primary mt-6">
        Ir al inicio
      </Link>
    </div>
  );
}
