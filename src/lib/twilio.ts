import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const messagingServiceSid = process.env.TWILIO_MESSAGING_SERVICE_SID;
const fromNumber = process.env.TWILIO_PHONE_NUMBER;

/**
 * Send an SMS via Twilio.
 * Prefers TWILIO_MESSAGING_SERVICE_SID (required for A2P 10DLC),
 * falls back to TWILIO_PHONE_NUMBER.
 */
export async function sendSms(to: string, body: string) {
  if (!accountSid || !authToken) {
    throw new Error('Twilio credentials not configured');
  }
  if (!messagingServiceSid && !fromNumber) {
    throw new Error('No Twilio sender configured (need TWILIO_MESSAGING_SERVICE_SID or TWILIO_PHONE_NUMBER)');
  }

  const client = twilio(accountSid, authToken);

  // Normalize to E.164 format (+1XXXXXXXXXX for US numbers)
  const digits = to.replace(/\D/g, '');
  const toNumber = digits.startsWith('1') ? `+${digits}` : `+1${digits}`;

  const message = await client.messages.create({
    body,
    ...(messagingServiceSid ? { messagingServiceSid } : { from: fromNumber }),
    to: toNumber,
  });

  return message;
}
