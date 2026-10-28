import { NextResponse } from 'next/server';

export const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';
export const SESSION_COOKIE = 'vitrina_session';
export const OAUTH_STATE_COOKIE = 'vitrina_oauth';

/** Only same-site paths are allowed as the place to come back to after signing in. */
export function safeReturnUrl(raw: string | null): string {
  return raw && raw.startsWith('/') && !raw.startsWith('//') ? raw : '/';
}

/** Calls the marketplace backend and turns its error body into a readable message. */
export async function backend(path: string, init: RequestInit = {}) {
  const res = await fetch(`${BACKEND_URL}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...(init.headers || {}) },
    cache: 'no-store',
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message = Array.isArray(data.message) ? data.message[0] : data.message || data.error;
    throw Object.assign(new Error(message || 'El servidor no respondió'), { status: res.status });
  }
  return data;
}

export function withSession(response: NextResponse, userId: string) {
  response.cookies.set(SESSION_COOKIE, userId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
  });
  return response;
}

export function errorResponse(err: unknown, fallback: string) {
  const error = err as { message?: string; status?: number };
  const status = error.status && error.status >= 400 && error.status < 500 ? error.status : 502;
  return NextResponse.json({ error: error.message || fallback }, { status });
}
