import { NextRequest, NextResponse } from 'next/server';
import { BACKEND_URL, readSession, sessionHeaders } from '@/lib/server/session';

// Same-origin proxy for everything that needs the signed-in user (seller panel, orders, photos): the browser never
// holds a backend credential; this server checks the session cookie and tells the backend who is asking.
async function handle(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  // Admin and identity endpoints have their own routes.
  if (path[0] === 'admin' || path[0] === 'auth') return NextResponse.json({ error: 'No permitido' }, { status: 404 });
  const userId = readSession(req);
  if (!userId) return NextResponse.json({ error: 'Inicia sesión para continuar' }, { status: 401 });

  try {
    const hasBody = req.method !== 'GET' && req.method !== 'DELETE';
    const res = await fetch(`${BACKEND_URL}/${path.map(encodeURIComponent).join('/')}${req.nextUrl.search}`, {
      method: req.method,
      headers: sessionHeaders(userId),
      ...(hasBody ? { body: await req.text() } : {}),
      cache: 'no-store',
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok) return NextResponse.json(data, { status: res.status });
    const message = Array.isArray(data.message) ? data.message[0] : data.message || data.error;
    return NextResponse.json({ error: message || 'El servidor no respondió' }, { status: res.status });
  } catch {
    return NextResponse.json({ error: 'No pudimos contactar al servidor' }, { status: 502 });
  }
}

export { handle as GET, handle as POST, handle as PUT, handle as PATCH, handle as DELETE };
