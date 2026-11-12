import { NextRequest, NextResponse } from 'next/server';
import { ADMIN_COOKIE, adminBackend } from '@/lib/server/admin';
import { BACKEND_URL } from '@/lib/server/session';

export const dynamic = 'force-dynamic';

// Proxies the operator's TikTok session status/login so the browser never talks to the backend directly.
// Only a signed-in admin may see it or open the sign-in window on the operator's machine.
async function forward(req: NextRequest, path: string, init: RequestInit = {}) {
  if (!req.cookies.get(ADMIN_COOKIE)?.value) return NextResponse.json({ error: 'Inicia sesión como administrador' }, { status: 401 });
  try {
    const { res: me } = await adminBackend(req, 'auth/me');
    if (!me.ok) return NextResponse.json({ error: 'Inicia sesión como administrador' }, { status: 401 });

    const res = await fetch(`${BACKEND_URL}/tiktok-lives/session${path}`, { ...init, cache: 'no-store', signal: AbortSignal.timeout(8000) });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) {
      const message = Array.isArray(body.message) ? body.message.join(', ') : body.message;
      return NextResponse.json({ error: message || 'No se pudo consultar la sesión de TikTok' }, { status: res.status });
    }
    return NextResponse.json(body, { headers: { 'Cache-Control': 'no-store' } });
  } catch {
    return NextResponse.json({ error: 'El backend no responde' }, { status: 503 });
  }
}

export async function GET(req: NextRequest) {
  return forward(req, '');
}

export async function POST(req: NextRequest) {
  return forward(req, '/login', { method: 'POST' });
}
