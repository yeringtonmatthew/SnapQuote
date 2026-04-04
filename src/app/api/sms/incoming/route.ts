/**
 * Twilio incoming SMS webhook handler.
 *
 * Handles STOP, HELP, and unknown inbound messages.
 * Twilio Messaging Services handle carrier-level opt-out automatically,
 * so STOP just gets an empty TwiML acknowledgement.
 */

import { validateRequest } from 'twilio';

function twiml(message?: string): Response {
  const body = message
    ? `<?xml version="1.0" encoding="UTF-8"?><Response><Message>${message}</Message></Response>`
    : '<?xml version="1.0" encoding="UTF-8"?><Response></Response>';

  return new Response(body, {
    headers: { 'Content-Type': 'text/xml' },
  });
}

export async function POST(request: Request) {
  const formData = await request.formData();

  // --- Twilio signature validation ---
  const authToken = process.env.TWILIO_AUTH_TOKEN;

  if (!authToken) {
    // In production, a missing auth token is a configuration error — reject all unauthenticated
    // requests rather than silently processing them.
    if (process.env.NODE_ENV === 'production') {
      console.error('[sms/incoming] TWILIO_AUTH_TOKEN is not set in production — rejecting request');
      return new Response('<?xml version="1.0" encoding="UTF-8"?><Response></Response>', {
        status: 403,
        headers: { 'Content-Type': 'text/xml' },
      });
    }
    console.warn('[sms/incoming] TWILIO_AUTH_TOKEN not set — skipping signature validation (dev mode only)');
  } else {
    const twilioSignature = request.headers.get('X-Twilio-Signature') ?? '';

    const appUrl = process.env.NEXT_PUBLIC_APP_URL;
    const webhookUrl = appUrl
      ? `${appUrl}/api/sms/incoming`
      : request.url;

    // Build a plain object of all form fields for validation
    const params: Record<string, string> = {};
    formData.forEach((value, key) => {
      params[key] = value as string;
    });

    const isValid = validateRequest(authToken, twilioSignature, webhookUrl, params);

    if (!isValid) {
      console.warn('[sms/incoming] Invalid Twilio signature — rejecting request');
      return new Response('<?xml version="1.0" encoding="UTF-8"?><Response></Response>', {
        status: 403,
        headers: { 'Content-Type': 'text/xml' },
      });
    }
  }
  // --- End signature validation ---

  const body = (formData.get('Body') as string || '').trim().toLowerCase();
  const from = formData.get('From') as string;

  if (body.includes('stop')) {
    console.warn(`[sms/incoming] STOP received from ${from}`);
    return twiml();
  }

  if (body.includes('help')) {
    console.warn(`[sms/incoming] HELP received from ${from}`);
    return twiml(
      'SnapQuote sends quotes from your contractor. For support, email support@snapquote.dev. Reply STOP to opt out.'
    );
  }

  console.warn(`[sms/incoming] Unhandled message from ${from}: ${body}`);
  return twiml(
    'This number is used for sending quotes only. For support, email support@snapquote.dev'
  );
}
