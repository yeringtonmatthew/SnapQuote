import { NextResponse } from 'next/server';
import { Resend } from 'resend';

export async function POST(request: Request) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    // Resend not configured — skip silently
    return NextResponse.json({
      success: true,
      skipped: true,
      message: 'Email not configured (no RESEND_API_KEY)',
    });
  }

  const { email, name } = (await request.json()) as {
    email: string;
    name?: string;
  };

  if (!email) {
    return NextResponse.json({ error: 'Email is required' }, { status: 400 });
  }

  const greeting = name ? `Welcome aboard, ${name}!` : 'Welcome!';

  const resend = new Resend(apiKey);

  const { error: emailError } = await resend.emails.send({
    from: 'SnapQuote <hello@snapquote.dev>',
    to: email,
    subject: 'Welcome to SnapQuote',
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 16px;">
        <div style="text-align: center; margin-bottom: 24px;">
          <div style="display: inline-block; background-color: #4f46e5; border-radius: 12px; padding: 12px; margin-bottom: 12px;">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z"/>
              <path d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z"/>
            </svg>
          </div>
          <h1 style="margin: 0; color: #111827; font-size: 22px; font-weight: 700;">SnapQuote</h1>
        </div>

        <h2 style="color: #111827; font-size: 20px; font-weight: 600; margin: 0 0 12px 0;">${greeting}</h2>

        <p style="color: #374151; font-size: 15px; line-height: 1.6; margin: 0 0 20px 0;">
          You're all set to start creating professional quotes in seconds. Snap a photo, let AI do the work, and send it to your customer.
        </p>

        <div style="text-align: center; margin: 28px 0;">
          <a href="https://snapquote.dev/dashboard" style="display: inline-block; background-color: #4f46e5; color: #ffffff; text-decoration: none; padding: 12px 32px; border-radius: 8px; font-weight: 600; font-size: 15px;">
            Create Your First Quote
          </a>
        </div>

        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 28px 0;" />

        <p style="color: #6b7280; font-size: 13px; line-height: 1.5; margin: 0;">
          Questions? Reply to this email or reach us at <a href="mailto:support@snapquote.dev" style="color: #4f46e5; text-decoration: none;">support@snapquote.dev</a>
        </p>
      </div>
    `,
  });

  if (emailError) {
    console.error('[welcome-email] Resend error:', emailError);
    return NextResponse.json(
      { success: false, error: emailError.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
