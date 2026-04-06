import type { LineItem } from '@/types/database';

export interface CertificationBadge {
  label: string;
  description: string;
}

export interface QuoteTemplate {
  id: string;
  name: string;
  icon: string;
  certificationBadge?: CertificationBadge;
  lineItems: LineItem[];
  defaultNotes: string;
}

function makeLineItem(description: string): LineItem {
  return { description, quantity: 1, unit: 'ea', unit_price: 0, total: 0 };
}

const BUILT_IN_TEMPLATES: QuoteTemplate[] = [
  {
    id: 'builtin-gaf-hdz',
    name: 'GAF Timberline HDZ Shingle Roof',
    icon: '🏠',
    certificationBadge: {
      label: 'GAF Certified Contractor',
      description:
        'This project is backed by GAF\'s manufacturer warranty program. As a GAF Certified Contractor, Big Dog Roofing meets strict standards for installation quality, proper licensing, and adequate insurance coverage.',
    },
    lineItems: [
      makeLineItem('Complete tear-off of existing roofing materials down to the deck'),
      makeLineItem('Deck inspection and repair of any damaged or deteriorated sheathing'),
      makeLineItem('Installation of GAF FeltBuster synthetic underlayment'),
      makeLineItem('Installation of GAF WeatherWatch ice and water shield at all eaves, valleys, and penetrations'),
      makeLineItem('Installation of GAF Timberline HDZ architectural shingles (Lifetime Limited Warranty)'),
      makeLineItem('Installation of GAF TimberTex premium ridge cap shingles'),
      makeLineItem('Installation of GAF Cobra Snow Country Advanced ridge vent'),
      makeLineItem('Installation of new step flashing, counter flashing, and drip edge'),
      makeLineItem('Complete cleanup, magnetic nail sweep, and haul-away of all debris'),
    ],
    defaultNotes:
      'This project includes GAF\'s Golden Pledge Limited Warranty when installed by a GAF Certified Contractor. All materials are GAF-manufactured and carry the full GAF system warranty.',
  },
  {
    id: 'builtin-metal-roof',
    name: 'Metal Roofing',
    icon: '🔩',
    certificationBadge: {
      label: 'Metal Roofing Alliance Certified',
      description:
        'Big Dog Roofing is certified by the Metal Roofing Alliance, ensuring proper installation techniques and adherence to manufacturer specifications for standing seam metal roof systems.',
    },
    lineItems: [
      makeLineItem('Complete tear-off of existing roofing materials down to the deck'),
      makeLineItem('Deck inspection and repair of any damaged or deteriorated sheathing'),
      makeLineItem('Installation of high-temp synthetic underlayment rated for metal'),
      makeLineItem('Installation of ice and water shield at all eaves, valleys, and penetrations'),
      makeLineItem('Installation of standing seam metal roofing panels with concealed fastener system'),
      makeLineItem('Installation of metal ridge cap and ventilation system'),
      makeLineItem('Installation of custom-formed metal flashing at all penetrations, walls, and transitions'),
      makeLineItem('Installation of metal drip edge and gutter apron'),
      makeLineItem('Complete cleanup and haul-away of all debris'),
    ],
    defaultNotes:
      'Standing seam metal roofing provides superior weather protection with a 40+ year lifespan. Panels are available in multiple colors and profiles. All materials carry manufacturer warranty.',
  },
  {
    id: 'builtin-gutter-5in',
    name: '5-Inch Gutter Installation',
    icon: '🌧️',
    lineItems: [
      makeLineItem('Removal and disposal of existing gutters and downspouts (if applicable)'),
      makeLineItem('Installation of 5-inch seamless aluminum gutters'),
      makeLineItem('Installation of 2x3-inch aluminum downspouts'),
      makeLineItem('Installation of hidden hangers every 24 inches'),
      makeLineItem('Installation of gutter end caps and miters'),
      makeLineItem('Sealing of all joints and connections'),
      makeLineItem('Complete cleanup and haul-away of debris'),
    ],
    defaultNotes:
      'Seamless aluminum gutters are custom-fabricated on-site for a perfect fit. All materials and workmanship are warranted.',
  },
  {
    id: 'builtin-gutter-6in',
    name: '6-Inch Gutter Installation',
    icon: '💧',
    lineItems: [
      makeLineItem('Removal and disposal of existing gutters and downspouts (if applicable)'),
      makeLineItem('Installation of 6-inch seamless aluminum gutters (oversized for high-volume drainage)'),
      makeLineItem('Installation of 3x4-inch aluminum downspouts'),
      makeLineItem('Installation of hidden hangers every 24 inches'),
      makeLineItem('Installation of gutter end caps and miters'),
      makeLineItem('Sealing of all joints and connections'),
      makeLineItem('Complete cleanup and haul-away of debris'),
    ],
    defaultNotes:
      'Oversized 6-inch seamless aluminum gutters handle high-volume water flow for larger roofs and heavy rainfall areas. All materials and workmanship are warranted.',
  },
];

export function getBuiltInTemplates(): QuoteTemplate[] {
  return BUILT_IN_TEMPLATES;
}
