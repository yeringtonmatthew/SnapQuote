import { NextResponse } from 'next/server';

/**
 * Server-side fallback for before/after image generation.
 * Currently returns 501 — the client-side canvas approach is primary.
 * This endpoint can be implemented later for shareable URL-based generation
 * (e.g. using @vercel/og or sharp for server-side rendering).
 */
export async function GET() {
  return NextResponse.json(
    { error: 'Not implemented. Use client-side canvas generation.' },
    { status: 501 },
  );
}

export async function POST() {
  return NextResponse.json(
    { error: 'Not implemented. Use client-side canvas generation.' },
    { status: 501 },
  );
}
