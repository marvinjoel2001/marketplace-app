import { randomBytes } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { authConfig } from '@/lib/authConfig';
import { OAUTH_STATE_COOKIE, safeReturnUrl } from '@/lib/server/session';

export async function GET(req: NextRequest, { params }: { params: Promise<{ provider: string }> }) {
  const { provider } = await params;
  const status = authConfig.getProviderStatus();
  const state = randomBytes(16).toString('hex');
  const returnUrl = safeReturnUrl(req.nextUrl.searchParams.get('returnUrl'));

  let target: string | null = null;
  if (provider === 'google' && status.google.enabled) target = authConfig.getGoogleOAuthUrl(state);
  if (provider === 'tiktok' && status.tiktok.enabled) target = authConfig.getTikTokOAuthUrl(state);
  if (!target) return NextResponse.redirect(new URL(`${returnUrl}`, req.url));

  const response = NextResponse.redirect(target);
  response.cookies.set(OAUTH_STATE_COOKIE, JSON.stringify({ state, returnUrl }), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 600,
  });
  return response;
}
