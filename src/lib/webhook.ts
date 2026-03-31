/**
 * Fire a webhook notification to the user's configured webhook URL.
 * This is fire-and-forget — failures are silently ignored so they
 * never block the main request flow.
 *
 * Payloads are Zapier / Make / n8n friendly: flat top-level keys
 * with a consistent { event, timestamp, data } envelope.
 */
export async function fireWebhook(
  supabase: any,
  userId: string,
  event: string,
  data: Record<string, unknown>
) {
  try {
    const { data: user } = await supabase
      .from('users')
      .select('webhook_url')
      .eq('id', userId)
      .single();

    if (!user?.webhook_url) return;

    fetch(user.webhook_url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event,
        timestamp: new Date().toISOString(),
        data,
      }),
    }).catch(() => {});
  } catch {
    // Never throw — webhook failures must not affect the main flow
  }
}
