import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { isAllowedWebhookUrl } from '@/lib/validate-url';

export async function POST() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from('users')
    .select('webhook_url')
    .eq('id', user.id)
    .single();

  if (!profile?.webhook_url) {
    return NextResponse.json(
      { error: 'No webhook URL configured' },
      { status: 400 }
    );
  }

  if (!isAllowedWebhookUrl(profile.webhook_url)) {
    return NextResponse.json(
      { error: 'Webhook URL must be a publicly reachable HTTP or HTTPS address' },
      { status: 400 }
    );
  }

  try {
    const res = await fetch(profile.webhook_url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event: 'test',
        timestamp: new Date().toISOString(),
        data: {
          message: 'This is a test webhook from SnapQuote.',
          quote_id: '00000000-0000-0000-0000-000000000000',
          customer_name: 'Test Customer',
          amount: 1500.0,
        },
      }),
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: `Webhook returned ${res.status}` },
        { status: 502 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Request failed' },
      { status: 502 }
    );
  }
}
