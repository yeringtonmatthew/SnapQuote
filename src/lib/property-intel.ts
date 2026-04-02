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
      max_tokens: 2000,
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

PROPERTY SIZE ESTIMATES
• Estimated Home Sq Ft: [Estimate typical home size for this neighborhood/era, e.g. "1,800 - 2,200 sq ft"]
• Estimated Roof Area: [Calculate from home size — typically 1.2x to 1.5x the footprint depending on pitch. Give a range, e.g. "22 - 28 squares (2,200 - 2,800 sq ft)"]
• Likely Roof Pitch: [Common pitch for homes of this era/style in this region, e.g. "6/12 to 8/12"]
• Likely Stories: [1-story ranch, 2-story colonial, split-level, etc. based on era and region]
• Estimated Waste Factor: [Percentage based on roof complexity — simple gable vs. complex hip/valley]

CONSTRUCTION NOTES
• [2-3 bullet points about likely construction methods, materials, and building codes for the era and region]
• [Include likely roof type/material (architectural shingles, 3-tab, tile, metal), decking type, siding, foundation]
• [Note any regional-specific building requirements or code updates]
• [If built before certain years, note potential hazards: asbestos shingles pre-1980, lead paint pre-1978, etc.]

COMPARABLE PRICING & MARKET DATA
• Typical ${trade} job cost in this area: [Give a realistic price range for the most common job type for this trade in this region, e.g. "Full roof replacement: $8,500 - $14,000 for this size home"]
• Material costs trending: [Note if material costs are higher/lower in this region]
• Average price per square (roofing) or per sq ft: [Regional average, e.g. "$350 - $450 per square installed"]
• [Note if this is a higher-end or budget-conscious neighborhood — affects pricing expectations]

PERMIT & REGULATION NOTES
• [Is a permit typically required for this type of work in this city/county?]
• [Typical permit cost range for this jurisdiction]
• [Any local requirements: ice & water shield, specific underlayment, wind rating codes, etc.]
• [HOA likelihood based on neighborhood type — and what that typically means for material/color restrictions]

WHAT TO LOOK FOR ON-SITE
• [3-5 specific things to inspect based on property age and trade type]
• [Common issues for this type/age of property in this region]
• [Red flags specific to the trade type: number of existing layers, sagging decking, flashing condition, etc.]
• [Access considerations: steep pitch, multi-story, tree coverage, tight lot, power lines]

⚠️ Note: This report is AI-generated. Sq ft, pricing, and roof measurements are estimates based on typical properties in this area. Verify all details during on-site inspection. For exact measurements, use aerial measurement tools (EagleView, Hover, etc.).

Keep the entire report under 500 words. Be specific and practical, not generic. Use real regional data where possible. Focus on what a ${trade} actually needs to know before showing up. All pricing should reflect current 2024-2025 market rates.`,
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
