import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';

export async function POST(request: Request) {
  // Use the session-based client to verify the user is authenticated
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

  // Use service-role client to bypass RLS for data deletion
  const admin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  try {
    // Delete user's data in order (respecting foreign keys)
    // 1. Delete follow-ups (references quotes)
    await admin.from('follow_ups').delete().eq('contractor_id', user.id);
    // 2. Delete payments (references quotes/invoices)
    await admin.from('payments').delete().eq('contractor_id', user.id);
    // 3. Delete invoices (references quotes)
    await admin.from('invoices').delete().eq('contractor_id', user.id);
    // 4. Delete reviews (references contractor)
    await admin.from('reviews').delete().eq('contractor_id', user.id);
    // 5. Delete quotes (references clients)
    await admin.from('quotes').delete().eq('contractor_id', user.id);
    // 6. Delete clients
    await admin.from('clients').delete().eq('user_id', user.id);
    // 7. Delete calendar events
    await admin.from('events').delete().eq('contractor_id', user.id);
    // 8. Delete notifications
    await admin.from('notifications').delete().eq('user_id', user.id);
    // 9. Delete quote templates
    await admin.from('quote_templates').delete().eq('contractor_id', user.id);
    // 10. Delete lead sources
    await admin.from('lead_sources').delete().eq('contractor_id', user.id);
    // 11. Delete team members
    await admin.from('team_members').delete().eq('owner_id', user.id);
    // 12. Delete user profile
    await admin.from('users').delete().eq('id', user.id);

    // 13. Delete the auth user (required by Apple App Store guidelines)
    const { error: authDeleteError } = await admin.auth.admin.deleteUser(user.id);
    if (authDeleteError) {
      console.error('Failed to delete auth user:', authDeleteError.message);
    }

    // Sign the user out of the current session
    await supabase.auth.signOut();

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to delete account' },
      { status: 500 }
    );
  }
}
