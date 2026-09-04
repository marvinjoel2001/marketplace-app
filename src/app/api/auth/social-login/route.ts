import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, name, avatar, provider = 'TIKTOK', visitorId, interestProfile, cart } = body;

    if (!email || !name) {
      return NextResponse.json(
        { error: 'Email y nombre son requeridos para la autenticación' },
        { status: 400 }
      );
    }

    // 1. Intentar registrar en el backend NestJS si está activo
    try {
      const backendRes = await fetch(`${BACKEND_URL}/auth/social-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        cache: 'no-store',
      });

      if (backendRes.ok) {
        const backendData = await backendRes.json();
        const response = NextResponse.json({
          success: true,
          ...backendData,
        });

        // Set session cookie
        response.cookies.set('chiringuito_auth_token', backendData.user.id, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          path: '/',
          maxAge: 60 * 60 * 24 * 30, // 30 días
        });

        return response;
      }
    } catch {
      // Backend no disponible, proceder con gestión autónoma de Next.js
    }

    // 2. Fallback autónomo en Next.js (Turnkey / Standalone)
    const normalizedUser = {
      id: `usr_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 7)}`,
      email: email.toLowerCase(),
      name: name.trim(),
      avatar: avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`,
      provider: provider.toUpperCase(),
      phone: body.phone || undefined,
      city: body.city || 'Santa Cruz de la Sierra',
      zone: body.zone || 'Equipetrol',
      address: body.address || undefined,
      addressReference: body.addressReference || undefined,
      nitOrCi: body.nitOrCi || undefined,
      interestProfile: interestProfile || null,
      createdAt: new Date().toISOString(),
    };

    const isProfileComplete = Boolean(normalizedUser.phone && normalizedUser.address);

    const response = NextResponse.json({
      success: true,
      user: normalizedUser,
      isProfileComplete,
      isNewUser: true,
    });

    response.cookies.set('chiringuito_auth_token', normalizedUser.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 30,
    });

    return response;
  } catch (err: any) {
    console.error('Error in /api/auth/social-login:', err);
    return NextResponse.json(
      { error: err.message || 'Error en autenticación' },
      { status: 500 }
    );
  }
}
