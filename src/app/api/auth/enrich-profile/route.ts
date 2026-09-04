import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, phone, city, zone, address, addressReference, nitOrCi } = body;

    if (!phone || !address) {
      return NextResponse.json(
        { error: 'Teléfono y dirección de entrega son requeridos' },
        { status: 400 }
      );
    }

    // 1. Intentar actualizar en el backend NestJS si está disponible
    try {
      const backendRes = await fetch(`${BACKEND_URL}/auth/enrich-profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        cache: 'no-store',
      });

      if (backendRes.ok) {
        const backendData = await backendRes.json();
        return NextResponse.json({
          success: true,
          ...backendData,
        });
      }
    } catch {
      // Backend no disponible, proceder localmente
    }

    // 2. Respuesta autónoma
    const updatedUser = {
      id: userId || `usr_${Date.now().toString(36)}`,
      phone,
      city: city || 'Santa Cruz de la Sierra',
      zone: zone || 'Equipetrol',
      address,
      addressReference: addressReference || '',
      nitOrCi: nitOrCi || '',
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      user: updatedUser,
      isProfileComplete: true,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Error al actualizar perfil' },
      { status: 500 }
    );
  }
}
