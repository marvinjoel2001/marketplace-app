import { NextRequest, NextResponse } from 'next/server';
import { authConfig } from '@/lib/authConfig';
import { backend, OAUTH_STATE_COOKIE, safeReturnUrl, withSession } from '@/lib/server/session';

async function googleProfile(code: string) {
  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: authConfig.googleClientId,
      client_secret: authConfig.googleClientSecret,
      redirect_uri: `${authConfig.appUrl}/api/auth/callback/google`,
      grant_type: 'authorization_code',
    }),
  });
  if (!tokenRes.ok) throw new Error('Google no aceptó el inicio de sesión');
  const { access_token } = await tokenRes.json();
  const userRes = await fetch('https://openidconnect.googleapis.com/v1/userinfo', {
    headers: { Authorization: `Bearer ${access_token}` },
  });
  if (!userRes.ok) throw new Error('No pudimos leer tu perfil de Google');
  const g = await userRes.json();
  return { email: g.email, name: g.name || g.email.split('@')[0], avatar: g.picture, provider: 'GOOGLE' };
}

async function tiktokProfile(code: string) {
  const tokenRes = await fetch('https://open.tiktokapis.com/v2/oauth/token/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_key: authConfig.tiktokClientKey,
      client_secret: authConfig.tiktokClientSecret,
      code,
      grant_type: 'authorization_code',
      redirect_uri: `${authConfig.appUrl}/api/auth/callback/tiktok`,
    }),
  });
  if (!tokenRes.ok) throw new Error('TikTok no aceptó el inicio de sesión');
  const token = await tokenRes.json();
  const userRes = await fetch('https://open.tiktokapis.com/v2/user/info/?fields=open_id,avatar_url,display_name', {
    headers: { Authorization: `Bearer ${token.access_token ?? token.data?.access_token}` },
  });
  const info = (await userRes.json()).data?.user ?? {};
  if (!info.open_id) throw new Error('No pudimos leer tu perfil de TikTok');
  // TikTok doesn't share an email; the open_id identifies the account.
  return {
    email: `${info.open_id}@tiktok.vitrina.bo`,
    name: info.display_name || 'Cliente TikTok',
    avatar: info.avatar_url,
    provider: 'TIKTOK',
  };
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ provider: string }> }) {
  const { provider } = await params;
  const code = req.nextUrl.searchParams.get('code');
  const state = req.nextUrl.searchParams.get('state');
  let saved: { state?: string; returnUrl?: string } = {};
  try {
    saved = JSON.parse(req.cookies.get(OAUTH_STATE_COOKIE)?.value ?? '{}');
  } catch {}
  const returnUrl = safeReturnUrl(saved.returnUrl ?? null);
  const fail = (reason: string) => {
    const url = new URL(returnUrl, req.url);
    url.searchParams.set('login_error', reason);
    return NextResponse.redirect(url);
  };

  if (!code || !state || state !== saved.state) return fail('No se pudo confirmar el inicio de sesión. Intenta de nuevo.');

  try {
    const profile = provider === 'google' ? await googleProfile(code) : provider === 'tiktok' ? await tiktokProfile(code) : null;
    if (!profile) return fail('Proveedor no válido');
    const data = await backend('/auth/social-login', { method: 'POST', body: JSON.stringify(profile) });
    const response = withSession(NextResponse.redirect(new URL(returnUrl, req.url)), data.user.id);
    response.cookies.delete(OAUTH_STATE_COOKIE);
    return response;
  } catch (err) {
    return fail((err as Error).message || 'No se pudo iniciar sesión');
  }
}
