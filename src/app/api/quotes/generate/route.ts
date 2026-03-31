import Anthropic from '@anthropic-ai/sdk';
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import sharp from 'sharp';
import { DEFAULT_TERMS } from '@/lib/defaultTerms';

export async function POST(request: Request) {
  try {
    const apiKey = process.env.SNAPQUOTE_ANTHROPIC_KEY || process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'AI service not configured' }, { status: 500 });
    }

    const anthropic = new Anthropic({ apiKey });

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('users')
      .select('hourly_rate, trade_type')
      .eq('id', user.id)
      .single();

    // Read base64 images from JSON body (reliable in Next.js App Router)
    const body = await request.json();
    const { images, description } = body;

    if (!images || images.length === 0) {
      return NextResponse.json({ error: 'At least one photo is required' }, { status: 400 });
    }

    // Re-process with sharp to guarantee size is within Claude's 5MB limit
    const content: Anthropic.MessageParam['content'] = [];

    for (const b64 of images) {
      const inputBuffer = Buffer.from(b64, 'base64');

      const resized = await sharp(inputBuffer)
        .resize(1024, 1024, { fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: 80 })
        .toBuffer();

      content.push({
        type: 'image',
        source: { type: 'base64', media_type: 'image/jpeg', data: resized.toString('base64') },
      });
    }

    // Add text prompt
    const tradeLabel = profile?.trade_type || 'general contractor';
    const hourlyRate = profile?.hourly_rate || 125;

    let userText = `Trade type: ${tradeLabel}\nLabor rate: $${hourlyRate}/hr\n`;
    if (description) userText += `\nJob description from contractor: ${description}`;
    userText += '\n\nAnalyze the photos and generate an itemized quote.';

    content.push({ type: 'text', text: userText });

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 6000,
      system: `You are an expert trade contractor estimator and property inspector helping a contractor create professional, legally-sound quotes that close deals.

You have TWO jobs:
1. Generate an accurate, itemized quote
2. Create a professional property inspection report from the photos — identifying visible damage, wear, or issues that justify why the work is needed

CRITICAL PRICING RULES:
- If the contractor states a per-unit price (e.g. "$400/square for shingles", "$600/square for metal"), that price is ALL-INCLUSIVE (labor + materials combined). Create ONE line item for that work at that rate. Do NOT add separate labor line items for work already covered by a per-unit price.
- Only add separate labor line items (using $${hourlyRate}/hr) for tasks NOT covered by the contractor's stated per-unit pricing — e.g., chimney flashing, skylight work, specialty repairs.
- If no rates are given at all, use the provided labor rate of $${hourlyRate}/hr and current regional market pricing for materials as separate line items.
- NEVER double-charge: if contractor says $400/square installed, do not also add hours of installation labor.

INSPECTION REPORT RULES:
- Analyze EACH photo individually and identify specific visible issues (damage, wear, deterioration, safety concerns)
- For each finding, assign a severity: "critical" (immediate attention needed), "moderate" (should be addressed soon), or "minor" (cosmetic or preventative)
- Write a short, compelling urgency_message for each finding that explains to the homeowner WHY this needs to be fixed — focus on consequences of inaction (water damage, structural risk, energy loss, safety hazard, code violations, property value)
- Be specific about what you see: "Missing shingles exposing underlayment on south-facing slope" not just "roof damage"
- If a photo shows no issues, still include it with a minor finding noting the current condition
- photo_index is 0-based, matching the order photos were provided

OUTPUT REQUIREMENTS:
- Line item descriptions must be detailed and professional (brand, spec, size, grade) — e.g. "GAF Timberline HDZ Charcoal 30-yr Architectural Shingles (30 squares)" not just "shingles"
- Labor descriptions must describe the specific task, not just "labor"
- scope_of_work must be 3-5 sentences describing exactly what work will be performed, written as a contractor commitment to the customer
- notes must include: payment terms (deposit + balance due on completion), warranty information, and any material assumptions

Return ONLY valid JSON — no markdown, no code fences, no explanation:
{
  "job_summary": "One sentence describing the job",
  "scope_of_work": "Detailed 3-5 sentence description of all work to be performed, written as a professional commitment: what will be removed, installed, inspected, and cleaned up.",
  "line_items": [
    {"description": "Specific labor task with detail", "quantity": 1, "unit": "hr", "unit_price": ${hourlyRate}, "total": ${hourlyRate}},
    {"description": "Brand + spec + size material name", "quantity": 1, "unit": "square", "unit_price": 400, "total": 400}
  ],
  "inspection_findings": [
    {"photo_index": 0, "finding": "Specific description of what is visible in the photo — damage, wear, or condition", "severity": "critical", "urgency_message": "Short compelling reason this needs immediate attention — consequences of inaction"},
    {"photo_index": 1, "finding": "Description of issue in second photo", "severity": "moderate", "urgency_message": "Why this matters to the homeowner"}
  ],
  "estimated_duration": "X-Y days",
  "notes": "Payment terms: [deposit]% deposit required to schedule; balance due upon completion. Warranty: [specific warranty]. Includes: [what's included]. Excludes: [what's not included, e.g. permits unless otherwise arranged]."
}`,
      messages: [{ role: 'user', content }],
    });

    const textBlock = response.content.find((b): b is Anthropic.TextBlock => b.type === 'text');
    if (!textBlock) {
      return NextResponse.json({ error: 'No response from AI' }, { status: 500 });
    }

    let jsonText = textBlock.text.trim();
    if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
    }

    const parsed = JSON.parse(jsonText);
    // Always use default terms — AI-generated notes become job-specific details only
    if (!parsed.notes || parsed.notes.trim().length < 20) {
      parsed.notes = DEFAULT_TERMS;
    } else {
      // Append standard terms after any job-specific AI notes
      parsed.notes = parsed.notes.trim() + '\n\n' + DEFAULT_TERMS;
    }
    return NextResponse.json(parsed);

  } catch (error) {
    console.error('[generate] ERROR:', error);

    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: 'AI returned invalid JSON. Please try again.' }, { status: 500 });
    }
    if (error instanceof Anthropic.APIError) {
      return NextResponse.json(
        { error: `AI service error (${error.status}): ${error.message}` },
        { status: error.status || 500 }
      );
    }

    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: `Failed to generate quote: ${msg}` }, { status: 500 });
  }
}
