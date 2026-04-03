#!/usr/bin/env node
/**
 * Import Jobber data into SnapQuote's Supabase database.
 * - Inserts new clients that don't exist yet (dedup by name)
 * - Updates existing clients with missing phone/email/address from Jobber
 * - Imports quotes that don't exist yet
 */

const { createClient } = require('@supabase/supabase-js');
const jobberData = require('/Users/mattyerington/Downloads/jobber_export.json');

const supabase = createClient(
  'https://idexddmnulfvhcjchtuo.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlkZXhkZG1udWxmdmhjamNodHVvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDczNjg5MiwiZXhwIjoyMDkwMzEyODkyfQ.h_PczytaQoTDSSkQVl2cdS0GBao2kMFXCYQoaljAmK8'
);

const CONTRACTOR_ID = 'dc160530-ccdf-4a93-be91-fddb3893f5f5';

function normalizePhone(raw) {
  if (!raw) return null;
  const digits = raw.replace(/\D/g, '');
  if (digits.length === 10) return digits;
  if (digits.length === 11 && digits.startsWith('1')) return digits.slice(1);
  return digits || null;
}

function buildAddress(addr) {
  if (!addr) return null;
  const parts = [addr.street1, addr.street2, addr.city, addr.province, addr.postalCode].filter(Boolean);
  return parts.join(', ') || null;
}

function mapJobberStatus(qs) {
  const map = {
    'draft': 'draft',
    'awaiting_response': 'sent',
    'approved': 'approved',
    'converted': 'approved',
    'archived': 'cancelled',
    'changes_requested': 'sent',
  };
  return map[qs] || 'draft';
}

function mapPipelineStage(qs, jobStatus) {
  if (jobStatus === 'completed') return 'completed';
  if (jobStatus === 'in_progress') return 'in_progress';
  if (jobStatus === 'unscheduled' || jobStatus === 'scheduled') return 'job_scheduled';
  if (qs === 'approved' || qs === 'converted') return 'deposit_collected';
  if (qs === 'awaiting_response') return 'quote_sent';
  return 'quote_created';
}

async function run() {
  console.log('=== Jobber → SnapQuote Import ===');
  console.log(`Jobber data: ${jobberData.clients.length} clients, ${jobberData.quotes.length} quotes, ${jobberData.jobs.length} jobs`);

  // ── Step 1: Load existing SnapQuote clients ──
  const { data: existingClients, error: fetchErr } = await supabase
    .from('clients')
    .select('*')
    .eq('user_id', CONTRACTOR_ID);

  if (fetchErr) { console.error('Failed to fetch clients:', fetchErr); return; }
  console.log(`Existing SnapQuote clients: ${existingClients.length}`);

  // Build lookup by normalized name
  const clientByName = new Map();
  existingClients.forEach(c => {
    clientByName.set((c.name || '').trim().toLowerCase(), c);
  });

  // ── Step 2: Deduplicate Jobber clients (keep last occurrence per name) ──
  const dedupedJobber = new Map();
  jobberData.clients.forEach(jc => {
    const name = ((jc.firstName || '') + ' ' + (jc.lastName || '')).trim();
    if (!name || name.toLowerCase() === 'my by by to be') return; // skip garbage
    dedupedJobber.set(name.toLowerCase(), jc);
  });
  console.log(`Deduped Jobber clients: ${dedupedJobber.size}`);

  // ── Step 3: Insert new clients & update existing with missing data ──
  let inserted = 0, updated = 0, skipped = 0;

  for (const [normName, jc] of dedupedJobber) {
    const fullName = ((jc.firstName || '') + ' ' + (jc.lastName || '')).trim();
    const phone = normalizePhone(jc.phones?.[0]?.number);
    const email = jc.emails?.[0]?.address?.trim() || null;
    const address = buildAddress(jc.billingAddress);
    const company = jc.companyName || null;
    const tags = jc.isLead ? ['lead'] : ['active'];

    const existing = clientByName.get(normName);

    if (existing) {
      // Update if we have better data from Jobber
      const updates = {};
      if (!existing.phone && phone) updates.phone = phone;
      if (!existing.email && email) updates.email = email;
      if (!existing.address && address) updates.address = address;
      if (!existing.company && company) updates.company = company;
      if ((!existing.tags || existing.tags.length === 0) && tags.length > 0) updates.tags = tags;

      if (Object.keys(updates).length > 0) {
        const { error } = await supabase
          .from('clients')
          .update(updates)
          .eq('id', existing.id);
        if (error) {
          console.error(`  Failed to update ${fullName}:`, error.message);
        } else {
          updated++;
        }
      } else {
        skipped++;
      }
    } else {
      // Insert new client
      const { error } = await supabase.from('clients').insert({
        user_id: CONTRACTOR_ID,
        name: fullName,
        phone,
        email,
        address,
        company,
        tags,
      });
      if (error) {
        console.error(`  Failed to insert ${fullName}:`, error.message);
      } else {
        inserted++;
      }
    }
  }

  console.log(`\nClients: ${inserted} inserted, ${updated} updated, ${skipped} unchanged`);

  // ── Step 4: Reload clients to get IDs for quote linking ──
  const { data: allClients } = await supabase
    .from('clients')
    .select('id, name, phone, email')
    .eq('user_id', CONTRACTOR_ID);

  const clientLookup = new Map();
  allClients.forEach(c => {
    clientLookup.set((c.name || '').trim().toLowerCase(), c.id);
  });

  // ── Step 5: Import quotes ──
  const { data: existingQuotes } = await supabase
    .from('quotes')
    .select('id, quote_number, customer_name')
    .eq('contractor_id', CONTRACTOR_ID);

  const existingQuoteNumbers = new Set(existingQuotes.map(q => q.quote_number));
  const existingQuoteNames = new Set(existingQuotes.map(q => (q.customer_name || '').trim().toLowerCase()));

  let quotesInserted = 0, quotesSkipped = 0;

  // Build a map of jobber client IDs to jobs for pipeline stage detection
  const jobsByClient = new Map();
  jobberData.jobs.forEach(j => {
    const clientId = j.client?.id;
    if (clientId) {
      if (!jobsByClient.has(clientId)) jobsByClient.set(clientId, []);
      jobsByClient.get(clientId).push(j);
    }
  });

  for (const jq of jobberData.quotes) {
    const quoteNum = parseInt(jq.quoteNumber, 10);
    const clientName = ((jq.client?.firstName || '') + ' ' + (jq.client?.lastName || '')).trim();
    const clientEmail = jq.client?.emails?.[0]?.address || null;
    const clientPhone = normalizePhone(jq.client?.phones?.[0]?.number);

    // Skip if quote number already exists
    if (existingQuoteNumbers.has(quoteNum)) {
      quotesSkipped++;
      continue;
    }

    // Find matching client in SnapQuote
    const clientId = clientLookup.get(clientName.toLowerCase()) || null;

    // Build line items
    const lineItems = (jq.lineItems?.nodes || []).map(li => ({
      description: li.name || li.description?.substring(0, 100) || 'Service',
      quantity: li.quantity || 1,
      unit: 'each',
      unit_price: li.unitPrice || 0,
      total: li.totalPrice || 0,
    }));

    const subtotal = jq.amounts?.subtotal || 0;
    const total = jq.amounts?.total || 0;
    const status = mapJobberStatus(jq.quoteStatus);

    // Check if there's a related job for this client
    const relatedJob = jobsByClient.get(jq.client?.id)?.[0];
    const pipelineStage = mapPipelineStage(jq.quoteStatus, relatedJob?.jobStatus);

    const quoteData = {
      contractor_id: CONTRACTOR_ID,
      client_id: clientId,
      customer_name: clientName,
      customer_phone: clientPhone,
      customer_email: clientEmail,
      status,
      line_items: lineItems,
      subtotal,
      total,
      quote_number: quoteNum,
      pipeline_stage: pipelineStage,
      scope_of_work: jq.title || null,
      created_at: jq.createdAt || new Date().toISOString(),
    };

    if (status === 'sent') {
      quoteData.sent_at = jq.updatedAt || jq.createdAt;
    }
    if (status === 'approved') {
      quoteData.approved_at = jq.updatedAt || jq.createdAt;
    }

    const { error } = await supabase.from('quotes').insert(quoteData);
    if (error) {
      console.error(`  Failed to insert quote #${quoteNum} for ${clientName}:`, error.message);
    } else {
      quotesInserted++;
    }
  }

  console.log(`Quotes: ${quotesInserted} inserted, ${quotesSkipped} already existed`);
  console.log('\n=== Import Complete ===');
}

run().catch(console.error);
