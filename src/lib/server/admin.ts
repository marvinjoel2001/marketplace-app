import { NextRequest, NextResponse } from 'next/server';
import { BACKEND_URL } from './session';

export const ADMIN_COOKIE = 'vitrina_admin';

/** Keeps the admin token in an httpOnly cookie so page scripts never see it. */
export function withAdminSession(response: NextResponse, token: string, expiresAt: string) {
  response.cookies.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    expires: new Date(expiresAt),
  });
  return response;
}

/** Calls an /admin endpoint of the marketplace backend with the visitor's admin token and relays status and body. */
export async function adminBackend(req: NextRequest, path: string, init: RequestInit = {}) {
  const token = req.cookies.get(ADMIN_COOKIE)?.value;
  const res = await fetch(`${BACKEND_URL}/admin/${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...(init.headers || {}) },
    cache: 'no-store',
  });
  const data = await res.json().catch(() => ({}));
  return { res, data };
}

export function relayError(data: { message?: string | string[]; error?: string }, status: number) {
  const message = Array.isArray(data.message) ? data.message[0] : data.message || data.error;
  return NextResponse.json({ error: message || 'El servidor no respondió' }, { status });
}
