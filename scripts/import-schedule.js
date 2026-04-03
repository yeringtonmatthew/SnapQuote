const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://idexddmnulfvhcjchtuo.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlkZXhkZG1udWxmdmhjamNodHVvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDczNjg5MiwiZXhwIjoyMDkwMzEyODkyfQ.h_PczytaQoTDSSkQVl2cdS0GBao2kMFXCYQoaljAmK8');
const CONTRACTOR_ID = 'dc160530-ccdf-4a93-be91-fddb3893f5f5';

const jobberEvents = [
  {"num":143,"status":"today","title":"Roof Inspection — Bradley Taylor","client":"Bradley Taylor","phone":"2603881134","jobStart":"2026-04-03T04:00:00Z","visitStart":"2026-04-03T21:00:00Z","visitEnd":"2026-04-03T23:00:00Z","allDay":false,"completed":null},
  {"num":144,"status":"late","title":"Roof Inspection — Beaux Riley","client":"Beaux Riley","phone":"2603559894","jobStart":"2026-04-02T04:00:00Z","visitStart":"2026-04-02T16:00:00Z","visitEnd":"2026-04-02T18:00:00Z","allDay":false,"completed":null},
  {"num":141,"status":"late","title":"Roof Inspection — Jason Doctor","client":"Jason Doctor","phone":"2603667363","jobStart":"2026-04-02T04:00:00Z","visitStart":"2026-04-02T18:00:00Z","visitEnd":"2026-04-02T20:00:00Z","allDay":false,"completed":null},
  {"num":146,"status":"today","title":"Roof Inspection — Betty Horn","client":"Betty Horn","phone":"2603752166","jobStart":"2026-04-03T04:00:00Z","visitStart":"2026-04-03T19:00:00Z","visitEnd":"2026-04-03T21:00:00Z","allDay":false,"completed":null},
  {"num":142,"status":"late","title":"Roof Inspection — Michael Steele","client":"Michael Steele","phone":"2605681301","jobStart":"2026-04-01T04:00:00Z","visitStart":"2026-04-01T19:00:00Z","visitEnd":"2026-04-01T21:00:00Z","allDay":false,"completed":null},
  {"num":158,"status":"archived","title":"Professional Shingle Roof Installation","client":"Chad Adamson","phone":"7656691894","jobStart":"2026-03-31T04:00:00Z","visitStart":"2026-03-31T13:48:00Z","visitEnd":"2026-03-31T13:48:00Z","allDay":false,"completed":"2026-03-31T13:48:09Z"},
  {"num":155,"status":"late","title":"Roof Inspection — Sarah Larocque","client":"Sarah Larocque","phone":"2605152902","jobStart":"2026-03-30T04:00:00Z","visitStart":"2026-03-30T15:00:00Z","visitEnd":"2026-03-30T16:00:00Z","allDay":false,"completed":null},
  {"num":154,"status":"late","title":"Roof Inspection — Joe Beeching","client":"Joe Beeching","phone":"2606097926","jobStart":"2026-03-30T04:00:00Z","visitStart":"2026-03-30T21:00:00Z","visitEnd":"2026-03-30T22:00:00Z","allDay":false,"completed":null},
  {"num":153,"status":"late","title":"Roof Inspection — Christopher Selig","client":"Christopher Selig","phone":"2605191579","jobStart":"2026-03-30T04:00:00Z","visitStart":"2026-03-30T17:00:00Z","visitEnd":"2026-03-30T18:00:00Z","allDay":false,"completed":null},
  {"num":152,"status":"late","title":"Roof Inspection — Craig Bernard","client":"Craig Bernard","phone":"2603443223","jobStart":"2026-03-30T04:00:00Z","visitStart":"2026-03-30T23:00:00Z","visitEnd":"2026-03-31T00:00:00Z","allDay":false,"completed":null},
  {"num":151,"status":"late","title":"Roof Inspection — Conchita Wesco","client":"Conchita Wesco","phone":"2604682021","jobStart":"2026-03-30T04:00:00Z","visitStart":"2026-03-30T17:00:00Z","visitEnd":"2026-03-30T18:00:00Z","allDay":false,"completed":null},
  {"num":150,"status":"late","title":"Roof Inspection — Paul Winkelman","client":"Paul Winkelman","phone":"2602240959","jobStart":"2026-03-30T04:00:00Z","visitStart":"2026-03-30T19:00:00Z","visitEnd":"2026-03-30T20:00:00Z","allDay":false,"completed":null},
  {"num":149,"status":"late","title":"Roof Inspection — Jeremy Shaw","client":"Jeremy Shaw","phone":"2603886520","jobStart":"2026-03-30T04:00:00Z","visitStart":"2026-03-30T22:00:00Z","visitEnd":"2026-03-30T23:00:00Z","allDay":false,"completed":null},
  {"num":148,"status":"late","title":"Roof Inspection — Levi Bell","client":"Levi Bell","phone":"2605190375","jobStart":"2026-03-30T04:00:00Z","visitStart":"2026-03-30T23:00:00Z","visitEnd":"2026-03-31T00:00:00Z","allDay":false,"completed":null},
  {"num":147,"status":"late","title":"Roof Inspection — Ted Johnson","client":"Ted Johnson","phone":"2602242949","jobStart":"2026-03-30T04:00:00Z","visitStart":"2026-03-30T18:00:00Z","visitEnd":"2026-03-30T19:00:00Z","allDay":false,"completed":null},
  {"num":145,"status":"late","title":"Roof Inspection — Cindy Hahn","client":"Cindy Hahn","phone":"4197500653","jobStart":"2026-03-31T04:00:00Z","visitStart":"2026-03-31T21:00:00Z","visitEnd":"2026-03-31T22:00:00Z","allDay":false,"completed":null},
  {"num":131,"status":"archived","title":"Professional Shingle Roof Installation","client":"Donna Nijak","phone":"2604034062","jobStart":"2026-02-16T05:00:00Z","visitStart":"2026-02-16T05:00:00Z","visitEnd":"2026-02-17T04:59:59Z","allDay":true,"completed":"2026-02-16T23:49:46Z"},
  {"num":127,"status":"requires_invoicing","title":"Professional Shingle Roof Installation","client":"Cindy Willis","jobStart":"2025-11-25T05:00:00Z","visitStart":"2025-11-25T05:00:00Z","visitEnd":"2025-11-26T04:59:59Z","allDay":true,"completed":"2025-11-25T20:09:28Z"},
  {"num":126,"status":"late","title":"Professional Roofing Quote","client":"Skylar Mahal","phone":"2096077630","jobStart":"2025-11-17T05:00:00Z","visitStart":"2025-11-17T05:00:00Z","visitEnd":"2025-11-18T04:59:59Z","allDay":true,"completed":null},
  {"num":68,"status":"archived","title":"Professional Roof Installation","client":"Joan Roberts","phone":"2602247350","jobStart":"2025-04-24T04:00:00Z","visitStart":"2025-04-24T04:00:00Z","visitEnd":"2025-04-25T03:59:59Z","allDay":true,"completed":"2025-04-24T14:44:03Z"},
  {"num":3,"status":"archived","title":"GAF Timberline HDZ Installation","client":"Jenifer Carmer","phone":"4199801033","jobStart":"2025-04-21T04:00:00Z","visitStart":"2025-04-22T02:32:00Z","visitEnd":"2025-04-22T02:32:00Z","allDay":false,"completed":"2025-04-22T02:32:41Z"},
  {"num":57,"status":"late","title":"Professional Shingle Roof Installation","client":"Dorthy Hagan","phone":"2604031875","jobStart":"2025-04-04T04:00:00Z","visitStart":"2025-04-04T17:00:00Z","visitEnd":"2025-04-04T19:00:00Z","allDay":false,"completed":null},
  {"num":49,"status":"requires_invoicing","title":"Nierman Roofing Project","client":"Lisa Nierman","phone":"+12607409603","jobStart":"2024-11-27T05:00:00Z","visitStart":null,"visitEnd":null,"allDay":false,"completed":null},
  {"num":64,"status":"late","title":"Sartin Roofing Project","client":"Michelle Feeley","phone":"2607152113","jobStart":"2025-04-08T04:00:00Z","visitStart":"2025-04-08T04:00:00Z","visitEnd":"2025-04-09T03:59:59Z","allDay":true,"completed":null},
  {"num":46,"status":"late","title":"Baker Roofing Project","client":"Kalee Baker","phone":"+12604416840","jobStart":"2024-11-13T05:00:00Z","visitStart":"2024-11-13T05:00:00Z","visitEnd":"2024-11-14T04:59:59Z","allDay":true,"completed":null},
  {"num":32,"status":"late","title":"Mowrer's Roofing Project","client":"Leonard Mowrer","phone":"5133847713","jobStart":"2024-09-05T04:00:00Z","visitStart":"2024-09-05T04:00:00Z","visitEnd":"2024-09-06T03:59:59Z","allDay":true,"completed":null},
  {"num":30,"status":"archived","title":"GAF Timberline HDZ Roofing System","client":"Tom Harrison","phone":"(574) 354-1976","jobStart":"2024-08-16T04:00:00Z","visitStart":"2024-08-16T04:00:00Z","visitEnd":"2024-08-17T03:59:59Z","allDay":true,"completed":"2024-08-17T00:30:56Z"},
  {"num":25,"status":"archived","title":"Roof Replacement, Board Replacment, Trim repair","client":"Gwen Turner","phone":"+12604184077","jobStart":"2024-08-01T04:00:00Z","visitStart":"2024-08-01T04:00:00Z","visitEnd":"2024-08-02T03:59:59Z","allDay":true,"completed":"2024-08-01T19:17:11Z"},
  {"num":18,"status":"archived","title":"GAF Timberline HDZ Full Shingle Roof Replacement","client":"Mint Soe","phone":"(260) 206-1031","jobStart":"2024-07-02T04:00:00Z","visitStart":"2024-07-02T18:08:00Z","visitEnd":"2024-07-02T18:08:00Z","allDay":false,"completed":"2024-07-02T18:08:51Z"},
  {"num":17,"status":"late","title":"GAF Rolled Roofing System","client":"Karlie Lowe","phone":"8147469982","jobStart":"2024-07-02T04:00:00Z","visitStart":"2024-07-02T04:00:00Z","visitEnd":"2024-07-03T03:59:59Z","allDay":true,"completed":null},
  {"num":16,"status":"late","title":"GAF Rolled Roofing System","client":"Karlie Lowe","phone":"8147469982","jobStart":"2024-07-02T04:00:00Z","visitStart":"2024-07-02T04:00:00Z","visitEnd":"2024-07-03T03:59:59Z","allDay":true,"completed":null},
  {"num":8,"status":"archived","title":"GAF Timberline HDZ Roofing System","client":"Nichole Walls","phone":"2604186267","jobStart":"2024-04-23T04:00:00Z","visitStart":"2024-04-23T13:54:00Z","visitEnd":"2024-04-23T13:54:00Z","allDay":false,"completed":"2024-04-23T13:54:54Z"},
  {"num":4,"status":"late","title":"RX4 Metal Roofing System","client":"Dave Anderson","phone":"2602103328","jobStart":"2024-03-23T04:00:00Z","visitStart":"2024-03-23T17:30:00Z","visitEnd":"2024-03-23T19:30:00Z","allDay":false,"completed":null},
  {"num":2,"status":"archived","title":"GAF Timberline HDZ Roofing System","client":"Adolph Turnage","phone":"2604316850","jobStart":"2024-03-20T04:00:00Z","visitStart":"2024-03-20T05:00:00Z","visitEnd":"2024-03-20T06:00:00Z","allDay":false,"completed":"2024-03-20T04:21:59Z"},
  {"num":1,"status":"requires_invoicing","title":"Ram Panel Pewter Metal Roofing Project","client":"Roger Mullins","phone":"5745278490","jobStart":"2024-03-17T04:00:00Z","visitStart":"2024-03-17T17:54:00Z","visitEnd":"2024-03-17T17:54:00Z","allDay":false,"completed":"2024-03-17T17:54:20Z"}
];

async function run() {
  // Get existing events to dedup
  const { data: existing } = await supabase.from('events').select('title, event_date').eq('contractor_id', CONTRACTOR_ID);
  const existingKeys = new Set(existing.map(e => e.title + '|' + e.event_date));

  // Get client lookup
  const { data: clients } = await supabase.from('clients').select('id, name').eq('user_id', CONTRACTOR_ID);
  const clientByName = new Map();
  clients.forEach(c => clientByName.set(c.name.trim().toLowerCase(), c.id));

  // Get quote lookup by customer_name for linking
  const { data: quotes } = await supabase.from('quotes').select('id, customer_name').eq('contractor_id', CONTRACTOR_ID);
  const quoteByName = new Map();
  quotes.forEach(q => quoteByName.set((q.customer_name || '').trim().toLowerCase(), q.id));

  let inserted = 0, skipped = 0;

  // Deduplicate jobber events (skip duplicate job #16 which is same as #17)
  const seen = new Set();

  for (const je of jobberEvents) {
    const dateStr = je.visitStart || je.jobStart;
    if (!dateStr) { skipped++; continue; }

    const date = new Date(dateStr);
    const eventDate = date.toISOString().split('T')[0];

    // Determine event type
    let eventType = 'job_scheduled';
    if (je.title.includes('Inspection')) eventType = 'estimate';
    else if (je.completed) eventType = 'production';

    const title = je.client;

    // Dedup key
    const key = title + '|' + eventDate;
    if (existingKeys.has(key) || seen.has(key)) { skipped++; continue; }
    seen.add(key);

    // Parse times
    let startTime = null, endTime = null;
    if (!je.allDay && je.visitStart) {
      startTime = new Date(je.visitStart).toTimeString().split(' ')[0];
      endTime = je.visitEnd ? new Date(je.visitEnd).toTimeString().split(' ')[0] : null;
    }

    const clientId = clientByName.get(je.client.trim().toLowerCase()) || null;
    const quoteId = quoteByName.get(je.client.trim().toLowerCase()) || null;

    const event = {
      contractor_id: CONTRACTOR_ID,
      title,
      event_type: eventType,
      event_date: eventDate,
      start_time: startTime,
      end_time: endTime,
      all_day: je.allDay || false,
      completed: !!je.completed,
      client_id: clientId,
      quote_id: quoteId,
      notes: je.title !== je.client ? je.title : null,
    };

    const { error } = await supabase.from('events').insert(event);
    if (error) {
      console.error('Failed:', je.client, eventDate, error.message);
    } else {
      inserted++;
    }
  }

  console.log('Schedule import: ' + inserted + ' inserted, ' + skipped + ' skipped (duplicates or no date)');

  // Final count
  const { data: final } = await supabase.from('events').select('*', { count: 'exact' }).eq('contractor_id', CONTRACTOR_ID);
  console.log('Total events now:', final?.length);
}

run().catch(console.error);
