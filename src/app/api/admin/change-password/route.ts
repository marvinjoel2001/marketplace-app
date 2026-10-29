import { NextRequest, NextResponse } from 'next/server';
import { adminBackend, relayError, withAdminSession } from '@/lib/server/admin';

export async function POST(req: NextRequest) {
  try {
    const { res, data } = await adminBackend(req, 'auth/change-password', { method: 'POST', body: JSON.stringify(await req.json()) });
    if (!res.ok) return relayError(data, res.status);
    return withAdminSession(NextResponse.json({ admin: data.admin }), data.token, data.expiresAt);
  } catch {
    return NextResponse.json({ error: 'No pudimos contactar al servidor' }, { status: 502 });
  }
}
