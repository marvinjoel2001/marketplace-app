import { NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

export const dynamic = 'force-dynamic';

// Proxies the operator's TikTok session status/login so the browser never talks to the backend directly.
async function forward(path: string, init: RequestInit = {}) {
  try {
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

export async function GET() {
  return forward('');
}

export async function POST() {
  return forward('/login', { method: 'POST' });
}
