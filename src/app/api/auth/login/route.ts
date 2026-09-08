import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { identifier, password, name } = await req.json();

    if (!identifier) {
      return NextResponse.json(
        { error: 'Ingresa tu correo electrónico o número de teléfono' },
        { status: 400 }
      );
    }

    const isPhone = /^\+?\d{7,12}$/.test(identifier.replace(/\s+/g, ''));
    const isEmail = identifier.includes('@');

    const cleanName = name?.trim() || (isEmail
      ? identifier.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase())
      : `Usuario ${identifier.slice(-4)}`);

    const user = {
      id: `usr_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 7)}`,
      email: isEmail ? identifier.toLowerCase() : `${identifier.replace(/\D/g, '')}@vitrinamarket.bo`,
      name: cleanName,
      phone: isPhone ? identifier.replace(/\D/g, '').slice(-8) : undefined,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(cleanName)}`,
      provider: isPhone ? 'PHONE' : 'EMAIL',
      city: 'Santa Cruz de la Sierra',
      zone: 'Equipetrol',
      address: undefined,
      addressReference: undefined,
      nitOrCi: undefined,
      createdAt: new Date().toISOString(),
    };

    const isProfileComplete = Boolean(user.phone && user.address);

    const response = NextResponse.json({
      success: true,
      user,
      isProfileComplete,
    });

    response.cookies.set('chiringuito_auth_token', user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 30,
    });

    return response;
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Error al iniciar sesión' },
      { status: 500 }
    );
  }
}
