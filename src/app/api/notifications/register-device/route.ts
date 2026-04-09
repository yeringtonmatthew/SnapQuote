import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { token, platform } = await request.json();
  if (!token) return NextResponse.json({ error: 'Token required' }, { status: 400 });

  // Store device token for push notifications
  const { error } = await supabase
    .from('users')
    .update({ device_token: token, device_platform: platform || 'ios' })
    .eq('id', user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
