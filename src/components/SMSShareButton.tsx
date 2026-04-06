'use client';

interface SMSShareButtonProps {
  phone: string;
  message: string;
}

/**
 * Opens the native SMS app with the customer's number and a pre-filled
 * message containing the proposal link. One tap to send from their own phone.
 */
export function SMSShareButton({ phone, message }: SMSShareButtonProps) {
  // Normalize phone to digits only
  const digits = phone.replace(/\D/g, '');
  // sms: URI — ?body= is the standard format that works on both iOS and Android
  const smsUrl = `sms:${digits}?body=${encodeURIComponent(message)}`;

  return (
    <a
      href={smsUrl}
      className="flex items-center gap-1.5 rounded-xl bg-green-600 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-green-500 press-scale"
      title="Send via text message"
    >
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-11.25 5.25v-1.5c0-1.036.84-1.875 1.875-1.875h10.5c1.035 0 1.875.84 1.875 1.875v1.5m-14.25 0h14.25m-14.25 0v1.875c0 .621.504 1.125 1.125 1.125h12c.621 0 1.125-.504 1.125-1.125v-1.875" />
      </svg>
      SMS
    </a>
  );
}
