import { NextResponse } from 'next/server';
import { authConfig } from '@/lib/authConfig';

export async function GET() {
  return NextResponse.json({ providers: authConfig.getProviderStatus() });
}
