import Anthropic from '@anthropic-ai/sdk';

const getClient = () => {
  const key = process.env.SNAPQUOTE_ANTHROPIC_KEY || process.env.ANTHROPIC_API_KEY;
  if (!key) return null;
  return new Anthropic({ apiKey: key });
};

export async function generatePropertyReport(address: string, tradeType?: string): Promise<string | null> {
  const client = getClient();
  if (!client) return null;

  const trade = tradeType || 'general contractor';

  try {
    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1500,
      messages: [{
        role: 'user',
        content: `You are a property intelligence analyst helping a ${trade} prepare for a job site visit. Given this property address, generate a concise pre-inspection intelligence report.

Address: ${address}

Generate a report with these sections. Use what you can reasonably infer from the address location, neighborhood characteristics, and regional data. Be honest about what's estimated vs known. Keep it practical and useful for a contractor.

Format the report EXACTLY like this (plain text, no markdown):

═══ PROPERTY INTELLIGENCE REPORT ═══

📍 Address: [formatted address]
🏠 Property Type: [Single-family home / Multi-family / Commercial / etc - infer from address]
📅 Estimated Build Period: [Decade range based on neighborhood development patterns]
🌤️ Climate Zone: [IECC climate zone and what it means practically]

CONSTRUCTION NOTES
• [2-3 bullet points about likely construction methods, materials, and building codes for the era and region]
• [Include likely roof type, siding, foundation based on regional norms]
• [Note any regional-specific building requirements]

WEATHER & ENVIRONMENTAL FACTORS
• [Annual weather patterns affecting the property - rain, snow, wind, hail, UV exposure]
• [Common weather-related damage patterns for this region]
• [Seasonal considerations for scheduling work]

WHAT TO LOOK FOR ON-SITE
• [3-5 specific things to inspect based on property age, climate, and trade type]
• [Common issues for this type/age of property in this region]
• [Red flags specific to the trade type]

LOCAL MARKET CONTEXT
• [General area/neighborhood characterization]
• [Any relevant local regulations, HOA likelihood, permit requirements]

⚠️ Note: This report is AI-generated based on address analysis. Verify all details during on-site inspection.

Keep the entire report under 400 words. Be specific and practical, not generic. Focus on what a ${trade} actually needs to know before showing up.`,
      }],
    });

    const text = response.content[0];
    if (text.type === 'text') return text.text;
    return null;
  } catch (err) {
    console.error('[property-intel] AI generation error:', err);
    return null;
  }
}

export async function generatePropertyReportForClient(
  supabase: { from: (table: string) => any },
  clientId: string,
  address: string,
  userId: string,
) {
  // Get trade type from user profile
  const { data: profile } = await supabase.from('users').select('trade_type').eq('id', userId).single();
  const report = await generatePropertyReport(address, profile?.trade_type);
  if (!report) return;

  const { data: client } = await supabase.from('clients').select('notes').eq('id', clientId).single();
  const timestamp = new Date().toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
  const header = `[${timestamp} - Property Intelligence]`;
  const existingNotes = client?.notes || '';
  const newNotes = existingNotes
    ? `${header}\n${report}\n\n---\n${existingNotes}`
    : `${header}\n${report}`;

  await supabase.from('clients').update({ notes: newNotes }).eq('id', clientId);
}
