import { NextRequest, NextResponse } from 'next/server';
import { ADMIN_COOKIE, adminBackend, relayError, withAdminSession } from '@/lib/server/admin';

export async function GET(req: NextRequest) {
  if (!req.cookies.get(ADMIN_COOKIE)?.value) return NextResponse.json({ admin: null });
  try {
    const { res, data } = await adminBackend(req, 'auth/me');
    return NextResponse.json({ admin: res.ok ? data : null });
  } catch {
    return NextResponse.json({ error: 'No pudimos contactar al servidor' }, { status: 502 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();
    const { res, data } = await adminBackend(req, 'auth/login', {
      method: 'POST',
      headers: { 'x-forwarded-for': req.headers.get('x-forwarded-for') ?? '' },
      body: JSON.stringify({ username, password }),
    });
    if (!res.ok) return relayError(data, res.status);
    return withAdminSession(NextResponse.json({ admin: data.admin }), data.token, data.expiresAt);
  } catch {
    return NextResponse.json({ error: 'No pudimos contactar al servidor' }, { status: 502 });
  }
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.delete(ADMIN_COOKIE);
  return response;
}
