import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="mx-auto max-w-md py-12 text-center">
      <h1 className="type-sign text-2xl font-extrabold">No encontramos esta página</h1>
      <p className="mt-2 text-muted">Puede que el producto o la tienda ya no estén publicados.</p>
      <Link href="/" className="btn btn-primary mt-6">
        Ir al inicio
      </Link>
    </div>
  );
}
