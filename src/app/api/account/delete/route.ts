import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: { confirmation?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  if (body.confirmation !== 'DELETE') {
    return NextResponse.json({ error: 'Invalid confirmation' }, { status: 400 });
  }

  try {
    // Delete user's data in order (respecting foreign keys)
    // 1. Delete follow-ups (references quotes)
    await supabase.from('follow_ups').delete().eq('contractor_id', user.id);
    // 2. Delete payments (references quotes/invoices)
    await supabase.from('payments').delete().eq('contractor_id', user.id);
    // 3. Delete invoices (references quotes)
    await supabase.from('invoices').delete().eq('contractor_id', user.id);
    // 4. Delete reviews (references contractor)
    await supabase.from('reviews').delete().eq('contractor_id', user.id);
    // 5. Delete quotes (references clients)
    await supabase.from('quotes').delete().eq('contractor_id', user.id);
    // 6. Delete clients
    await supabase.from('clients').delete().eq('user_id', user.id);
    // 7. Delete calendar events
    await supabase.from('events').delete().eq('contractor_id', user.id);
    // 8. Delete notifications
    await supabase.from('notifications').delete().eq('user_id', user.id);
    // 9. Delete quote templates
    await supabase.from('quote_templates').delete().eq('contractor_id', user.id);
    // 10. Delete lead sources
    await supabase.from('lead_sources').delete().eq('contractor_id', user.id);
    // 11. Delete team members
    await supabase.from('team_members').delete().eq('owner_id', user.id);
    // 12. Delete user profile
    await supabase.from('users').delete().eq('id', user.id);

    // Sign the user out
    await supabase.auth.signOut();

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to delete account' },
      { status: 500 }
    );
  }
}
