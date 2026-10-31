import { createHmac, timingSafeEqual } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';

export const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';
export const SESSION_COOKIE = 'vitrina_session';
export const OAUTH_STATE_COOKIE = 'vitrina_oauth';

/** Signs cookies. Required in production; development falls back to a fixed key so `npm run dev` works untouched. */
function sessionSecret() {
  const secret = process.env.SESSION_SECRET;
  if (secret) return secret;
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Falta la variable SESSION_SECRET en el servidor web');
  }
  return 'vitrina-dev-only-session-secret';
}

const sign = (value: string) => createHmac('sha256', sessionSecret()).update(value).digest('base64url');

/** Only same-site paths are allowed as the place to come back to after signing in. */
export function safeReturnUrl(raw: string | null): string {
  return raw && raw.startsWith('/') && !raw.startsWith('//') ? raw : '/';
}

/** Calls the marketplace backend and turns its error body into a readable message. */
export async function backend(path: string, init: RequestInit = {}, userId?: string) {
  const res = await fetch(`${BACKEND_URL}${path}`, {
    ...init,
    headers: sessionHeaders(userId, init.headers),
    cache: 'no-store',
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message = Array.isArray(data.message) ? data.message[0] : data.message || data.error;
    throw Object.assign(new Error(message || 'El servidor no respondió'), { status: res.status });
  }
  return data;
}

/**
 * Headers for calls to the backend from this server. AUTH_INTERNAL_KEY proves the call comes from here, so the backend
 * can trust `x-user-id`: the id of a session whose signed cookie this server already checked.
 */
export function sessionHeaders(userId?: string, extra?: HeadersInit): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    ...(process.env.AUTH_INTERNAL_KEY ? { 'x-internal-key': process.env.AUTH_INTERNAL_KEY } : {}),
    ...(userId ? { 'x-user-id': userId } : {}),
    ...Object.fromEntries(new Headers(extra).entries()),
  };
}

/** The session cookie is `userId.signature`: knowing a user id is not enough to act as that user. */
export function withSession(response: NextResponse, userId: string) {
  response.cookies.set(SESSION_COOKIE, `${userId}.${sign(userId)}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
  });
  return response;
}

/** The signed-in user id, or null for a missing, malformed or forged cookie. */
export function readSession(req: NextRequest): string | null {
  return verifySession(req.cookies.get(SESSION_COOKIE)?.value);
}

/** Same check for a raw cookie value (server components read it with `cookies()`). */
export function verifySession(raw: string | undefined): string | null {
  const dot = raw?.lastIndexOf('.') ?? -1;
  if (!raw || dot < 1) return null;
  const userId = raw.slice(0, dot);
  const given = Buffer.from(raw.slice(dot + 1));
  const expected = Buffer.from(sign(userId));
  return given.length === expected.length && timingSafeEqual(given, expected) ? userId : null;
}

export function errorResponse(err: unknown, fallback: string) {
  const error = err as { message?: string; status?: number };
  const status = error.status && error.status >= 400 && error.status < 500 ? error.status : 502;
  return NextResponse.json({ error: error.message || fallback }, { status });
}
