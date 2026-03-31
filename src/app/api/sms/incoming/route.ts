/**
 * Twilio incoming SMS webhook handler.
 *
 * Handles STOP, HELP, and unknown inbound messages.
 * Twilio Messaging Services handle carrier-level opt-out automatically,
 * so STOP just gets an empty TwiML acknowledgement.
 */

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
  const body = (formData.get('Body') as string || '').trim().toLowerCase();
  const from = formData.get('From') as string;

  if (body.includes('stop')) {
    console.log(`[sms/incoming] STOP received from ${from}`);
    return twiml();
  }

  if (body.includes('help')) {
    console.log(`[sms/incoming] HELP received from ${from}`);
    return twiml(
      'SnapQuote sends quotes from your contractor. For support, email support@snapquote.dev. Reply STOP to opt out.'
    );
  }

  console.log(`[sms/incoming] Unhandled message from ${from}: ${body}`);
  return twiml(
    'This number is used for sending quotes only. For support, email support@snapquote.dev'
  );
}
