import { NextRequest, NextResponse } from 'next/server';

// This file is kept for backwards compatibility.
// The new Account Links flow redirects directly to /settings?stripe=connected
// after onboarding completes, so no callback processing is needed.

export async function GET(_request: NextRequest) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (!appUrl) {
    console.error('[stripe/callback] NEXT_PUBLIC_APP_URL is not configured');
    return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 });
  }
  return NextResponse.redirect(`${appUrl}/settings?stripe=connected`);
}
