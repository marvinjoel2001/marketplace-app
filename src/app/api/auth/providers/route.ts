import { NextResponse } from 'next/server';
import { authConfig } from '@/lib/authConfig';

export async function GET() {
  const status = authConfig.getProviderStatus();
  return NextResponse.json({
    success: true,
    providers: status,
    appUrl: authConfig.appUrl,
  });
}
