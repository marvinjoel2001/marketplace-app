import { NextRequest, NextResponse } from 'next/server';
import { authConfig } from '@/lib/authConfig';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ provider: string }> }
) {
  const { provider } = await params;
  const provLower = provider.toLowerCase();
  const searchParams = req.nextUrl.searchParams;
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  if (error || !code) {
    return NextResponse.redirect(new URL(`/?auth_error=${encodeURIComponent(error || 'no_code')}`, req.url));
  }

  try {
    let profile = {
      email: '',
      name: '',
      avatar: '',
      provider: provLower.toUpperCase(),
    };

    if (provLower === 'google') {
      // Exchange code for Google Access Token
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

      if (!tokenRes.ok) {
        throw new Error('Error al intercambiar token de Google');
      }

      const tokenData = await tokenRes.json();
      const userRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
      });

      if (!userRes.ok) {
        throw new Error('Error al obtener perfil de Google');
      }

      const googleUser = await userRes.json();
      profile = {
        email: googleUser.email,
        name: googleUser.name || googleUser.email.split('@')[0],
        avatar: googleUser.picture,
        provider: 'GOOGLE',
      };
    } else if (provLower === 'tiktok') {
      // Exchange code for TikTok Access Token
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

      if (!tokenRes.ok) {
        throw new Error('Error al intercambiar token de TikTok');
      }

      const tokenData = await tokenRes.json();
      const userRes = await fetch('https://open.tiktokapis.com/v2/user/info/?fields=open_id,union_id,avatar_url,display_name', {
        headers: { Authorization: `Bearer ${tokenData.data?.access_token}` },
      });

      const tiktokUser = await userRes.json();
      const userInfo = tiktokUser.data?.user || {};
      profile = {
        email: `${userInfo.open_id || 'user'}@tiktok.bo`,
        name: userInfo.display_name || 'Usuario TikTok',
        avatar: userInfo.avatar_url,
        provider: 'TIKTOK',
      };
    }

    // Save and redirect
    const user = {
      id: `usr_${Date.now().toString(36)}`,
      ...profile,
      city: 'Santa Cruz de la Sierra',
      zone: 'Equipetrol',
    };

    const redirectUrl = new URL('/?auth_success=true', req.url);
    const response = NextResponse.redirect(redirectUrl);

    response.cookies.set('chiringuito_auth_token', user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 30,
    });

    return response;
  } catch (err: any) {
    console.error('OAuth Callback Error:', err);
    return NextResponse.redirect(new URL(`/?auth_error=${encodeURIComponent(err.message)}`, req.url));
  }
}
