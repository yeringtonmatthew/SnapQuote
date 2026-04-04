import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { rateLimit } from '@/lib/rate-limit';
import { generatePropertyReport } from '@/lib/property-intel';

export async function POST(req: NextRequest) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Rate limit: 20 per hour per user
  if (!(await rateLimit(`property_report_${user.id}`, 20, 60 * 60 * 1000))) {
    return NextResponse.json(
      { error: 'Rate limit exceeded. Maximum 20 property reports per hour.' },
      { status: 429 },
    );
  }

  const body = await req.json();
  const { client_id, address } = body;

  if (!client_id || !address) {
    return NextResponse.json({ error: 'client_id and address are required' }, { status: 400 });
  }

  // Verify client belongs to this user
  const { data: client, error: clientError } = await supabase
    .from('clients')
    .select('id, notes')
    .eq('id', client_id)
    .eq('user_id', user.id)
    .single();

  if (clientError || !client) {
    return NextResponse.json({ error: 'Client not found' }, { status: 404 });
  }

  // Get trade type from user profile
  const { data: profile } = await supabase.from('users').select('trade_type').eq('id', user.id).single();
  const report = await generatePropertyReport(address, profile?.trade_type);

  if (!report) {
    return NextResponse.json({ error: 'Failed to generate report. Check API key configuration.' }, { status: 500 });
  }

  // Prepend report to existing notes
  const timestamp = new Date().toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
  const header = `[${timestamp} - Property Intelligence]`;
  const existingNotes = client.notes || '';
  const newNotes = existingNotes
    ? `${header}\n${report}\n\n---\n${existingNotes}`
    : `${header}\n${report}`;

  const { error: updateError } = await supabase
    .from('clients')
    .update({ notes: newNotes })
    .eq('id', client_id);

  if (updateError) {
    return NextResponse.json({ error: 'Failed to save report' }, { status: 500 });
  }

  return NextResponse.json({ success: true, report });
}
