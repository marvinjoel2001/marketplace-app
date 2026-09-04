import { NextRequest, NextResponse } from 'next/server';
import { authConfig } from '@/lib/authConfig';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ provider: string }> }
) {
  const { provider } = await params;
  const provLower = provider.toLowerCase();
  const searchParams = req.nextUrl.searchParams;
  const returnUrl = searchParams.get('returnUrl') || '/';

  const status = authConfig.getProviderStatus();

  if (provLower === 'google') {
    if (status.google.enabled) {
      const googleUrl = authConfig.getGoogleOAuthUrl();
      return NextResponse.redirect(googleUrl);
    } else {
      // Mock / Dev fallback when env vars are pending
      return NextResponse.redirect(
        new URL(`/?auth_notice=pending_google_keys&returnUrl=${encodeURIComponent(returnUrl)}`, req.url)
      );
    }
  }

  if (provLower === 'tiktok') {
    if (status.tiktok.enabled) {
      const tiktokUrl = authConfig.getTikTokOAuthUrl();
      return NextResponse.redirect(tiktokUrl);
    } else {
      return NextResponse.redirect(
        new URL(`/?auth_notice=pending_tiktok_keys&returnUrl=${encodeURIComponent(returnUrl)}`, req.url)
      );
    }
  }

  if (provLower === 'facebook') {
    if (status.facebook.enabled) {
      const fbUrl = authConfig.getFacebookOAuthUrl();
      return NextResponse.redirect(fbUrl);
    } else {
      return NextResponse.redirect(
        new URL(`/?auth_notice=pending_fb_keys&returnUrl=${encodeURIComponent(returnUrl)}`, req.url)
      );
    }
  }

  return NextResponse.json({ error: `Proveedor desconocido: ${provider}` }, { status: 400 });
}
