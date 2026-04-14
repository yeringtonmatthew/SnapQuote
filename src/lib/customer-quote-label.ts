import type { LineItem, TradeType } from '@/types/database';

interface QuoteLabelInput {
  tradeType?: TradeType | null;
  scopeOfWork?: string | null;
  aiDescription?: string | null;
  lineItems?: Pick<LineItem, 'description'>[] | null;
}

const tradeDefaults: Record<TradeType, string> = {
  roofing: 'Roofing',
  plumber: 'Plumbing',
  hvac: 'HVAC',
  electrician: 'Electrical',
  general: 'Project',
  painter: 'Painting',
  landscaper: 'Landscaping',
  other: 'Project',
};

function normalizeText({
  scopeOfWork,
  aiDescription,
  lineItems,
}: QuoteLabelInput) {
  return [
    scopeOfWork || '',
    aiDescription || '',
    ...(lineItems || []).map((item) => item.description || ''),
  ]
    .join(' ')
    .toLowerCase();
}

export function getCustomerQuoteKind(input: QuoteLabelInput): string {
  const text = normalizeText(input);

  if (/\bgutter|downspout|leaf guard|gutter guard|seamless gutter\b/.test(text)) {
    return 'Gutter';
  }

  if (/\bsiding|soffit|fascia\b/.test(text)) {
    return 'Exterior';
  }

  if (/\broof repair|repair leak|roof leak|patch\b/.test(text)) {
    return 'Roof Repair';
  }

  if (/\broof|shingle|ridge vent|flashing|underlayment|tear-?off|decking\b/.test(text)) {
    return 'Roofing';
  }

  if (input.tradeType) {
    return tradeDefaults[input.tradeType] || 'Project';
  }

  return 'Project';
}

export function getCustomerQuoteLabel(input: QuoteLabelInput): string {
  return `${getCustomerQuoteKind(input)} Quote`;
}
