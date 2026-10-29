import { NextRequest, NextResponse } from 'next/server';
import { adminBackend, relayError } from '@/lib/server/admin';

// Same-origin proxy for every /admin endpoint of the backend: it adds the token from the httpOnly cookie.
async function handle(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  if (path[0] === 'auth') return NextResponse.json({ error: 'No permitido' }, { status: 404 });
  try {
    const hasBody = req.method !== 'GET' && req.method !== 'DELETE';
    const { res, data } = await adminBackend(req, `${path.map(encodeURIComponent).join('/')}${req.nextUrl.search}`, {
      method: req.method,
      ...(hasBody ? { body: await req.text() } : {}),
    });
    return res.ok ? NextResponse.json(data) : relayError(data, res.status);
  } catch {
    return NextResponse.json({ error: 'No pudimos contactar al servidor' }, { status: 502 });
  }
}

export { handle as GET, handle as POST, handle as PUT, handle as PATCH, handle as DELETE };
