export interface GlossaryTerm {
  slug: string;
  term: string;
  shortDefinition: string;
  fullDefinition: string;
  relatedTerms: string[];
  category: 'materials' | 'structure' | 'insurance' | 'business' | 'techniques';
  metaDescription: string;
}

export const glossaryTerms: GlossaryTerm[] = [
  {
    slug: 'roofing-square',
    term: 'Roofing Square',
    category: 'business',
    shortDefinition: 'A unit of measurement equal to 100 square feet of roof surface.',
    metaDescription: 'What is a roofing square? Definition, how to calculate, and why roofers use squares instead of square feet.',
    fullDefinition:
      'A roofing square is the standard unit of measurement in the roofing industry. One square equals 100 square feet of roof surface area. Roofers use squares instead of square feet because most materials — shingles, underlayment, ice and water shield — are priced and packaged per square. A typical residential roof in the US is between 15 and 35 squares. Always measure actual roof surface (not house footprint) to get the correct square count, since pitch adds surface area beyond the footprint.',
    relatedTerms: ['pitch', 'shingle-bundle', 'underlayment'],
  },
  {
    slug: 'pitch',
    term: 'Roof Pitch',
    category: 'structure',
    shortDefinition: 'The steepness of a roof expressed as a ratio of vertical rise to horizontal run.',
    metaDescription: 'What is roof pitch? Definition, how to measure, and the common pitch ratios in residential roofing.',
    fullDefinition:
      "Roof pitch is the steepness of a roof, expressed as the ratio of vertical rise to horizontal run. A 6/12 pitch means the roof rises 6 inches for every 12 inches of horizontal distance. Pitch can also be expressed in degrees or percentage. Most residential homes in the US use pitches between 4/12 and 8/12, with 6/12 being the most common. Pitch matters for estimating because steeper roofs have more actual surface area than their footprint — a 12/12 pitch has 41% more surface than its footprint. Pitch also affects material compatibility: low-slope roofs (under 2/12) require membrane roofing instead of shingles.",
    relatedTerms: ['roofing-square', 'underlayment', 'rafter'],
  },
  {
    slug: 'underlayment',
    term: 'Roofing Underlayment',
    category: 'materials',
    shortDefinition: 'A water-resistant layer installed between the roof deck and the shingles.',
    metaDescription: 'What is roofing underlayment? Types (synthetic vs felt), purpose, and installation basics.',
    fullDefinition:
      'Roofing underlayment is a water-resistant or waterproof layer installed between the roof deck and the shingles. It serves as a secondary barrier against water infiltration if the shingles fail or are damaged. The two main types are felt underlayment (traditional asphalt-saturated paper) and synthetic underlayment (polymer-based sheets). Synthetic has largely replaced felt in modern roofing because it is lighter, stronger, tear-resistant, and lasts longer when exposed. Underlayment is required by building code on almost all sloped roofs.',
    relatedTerms: ['ice-and-water-shield', 'deck', 'shingle'],
  },
  {
    slug: 'ice-and-water-shield',
    term: 'Ice and Water Shield',
    category: 'materials',
    shortDefinition: 'A self-adhering waterproof membrane installed in areas prone to ice dams and leaks.',
    metaDescription: 'What is ice and water shield? Where to install it, how much to use, and when it is required by code.',
    fullDefinition:
      'Ice and water shield is a self-adhering, rubberized waterproof membrane installed in roof areas prone to leaks from ice dams or water intrusion. Common installation areas include eaves (typically 6 feet up from the roof edge), valleys, around penetrations (pipes, chimneys, skylights), and anywhere water tends to accumulate. Most cold-climate building codes require ice and water shield to extend from the eave to at least 2 feet past the exterior wall line.',
    relatedTerms: ['underlayment', 'ice-dam', 'valley'],
  },
  {
    slug: 'drip-edge',
    term: 'Drip Edge',
    category: 'materials',
    shortDefinition: 'A metal flashing installed at the edges of a roof to direct water away from the fascia.',
    metaDescription: 'What is drip edge? Purpose, installation, and code requirements for drip edge flashing.',
    fullDefinition:
      'Drip edge is a metal flashing installed along the eaves and rakes of a roof. Its job is to direct water running off the roof away from the fascia and into the gutter, preventing rot and water damage. Drip edge is typically required by building code in most US jurisdictions and is installed under the shingles at the eave and over the underlayment at the rake. It comes in various profiles (Type C, Type D, Type F) to match different roof configurations.',
    relatedTerms: ['flashing', 'eave', 'rake', 'fascia'],
  },
  {
    slug: 'flashing',
    term: 'Flashing',
    category: 'materials',
    shortDefinition: 'Metal sheeting installed at roof transitions and penetrations to prevent water infiltration.',
    metaDescription: 'What is roof flashing? Types, where to install, and why flashing is the #1 cause of roof leaks when done wrong.',
    fullDefinition:
      'Flashing is metal sheeting (usually aluminum or galvanized steel) installed at roof transitions, penetrations, and intersections to prevent water infiltration. Common types include step flashing (along walls and chimneys), apron flashing (at horizontal transitions), valley flashing, pipe flashing (around penetrations), and drip edge (along eaves). Poorly installed or missing flashing is the #1 cause of roof leaks — more than aging shingles. Proper flashing installation is what separates a quality roof job from a cheap one.',
    relatedTerms: ['drip-edge', 'valley', 'step-flashing'],
  },
  {
    slug: 'ridge-cap',
    term: 'Ridge Cap',
    category: 'materials',
    shortDefinition: 'Specialized shingles or metal that cover the peak of a roof.',
    metaDescription: 'What is a ridge cap? Shingle vs metal options and proper installation at the roof peak.',
    fullDefinition:
      "Ridge cap is the specialized shingle or metal cap installed along the ridge (peak) of a roof where two roof planes meet. It provides the final seal against water infiltration and gives the roof its finished look. Ridge cap can be pre-formed architectural ridge shingles or cut from standard 3-tab shingles. Most ridge caps cover 30 linear feet of ridge per bundle. Some ridge caps include ventilation slots underneath to provide attic airflow.",
    relatedTerms: ['ridge-vent', 'hip', 'shingle'],
  },
  {
    slug: 'ridge-vent',
    term: 'Ridge Vent',
    category: 'materials',
    shortDefinition: 'Continuous ventilation installed along the ridge of a roof to exhaust hot attic air.',
    metaDescription: 'What is a ridge vent? Purpose, installation, and why attic ventilation matters for roof longevity.',
    fullDefinition:
      "A ridge vent is a continuous vent installed along the peak (ridge) of a roof that allows hot, humid attic air to escape. It works together with soffit vents (intake) to create airflow through the attic space. Proper attic ventilation is critical for roof longevity — poor ventilation leads to ice dams in winter, heat damage to shingles in summer, and condensation issues year-round. Ridge vents are typically covered by ridge cap shingles to maintain a finished appearance.",
    relatedTerms: ['ridge-cap', 'attic-ventilation', 'soffit-vent'],
  },
  {
    slug: 'valley',
    term: 'Valley',
    category: 'structure',
    shortDefinition: 'The internal angle where two roof planes meet and water flows toward the eave.',
    metaDescription: 'What is a roof valley? Types (open, closed, woven), leak risks, and installation best practices.',
    fullDefinition:
      "A valley is the internal angle where two roof planes meet, forming a channel that water flows down toward the eave. Valleys are high-water-volume areas and are therefore high-risk for leaks if not properly installed. Common valley treatments include open valleys (exposed metal valley liner), closed valleys (shingles woven across the valley), and California valleys (a hybrid approach). Ice and water shield should always be installed in valleys regardless of region.",
    relatedTerms: ['flashing', 'ice-and-water-shield', 'hip'],
  },
  {
    slug: 'hip',
    term: 'Hip',
    category: 'structure',
    shortDefinition: 'The external angle where two roof planes meet, sloping down from the ridge.',
    metaDescription: 'What is a hip on a roof? Definition and how hip roofs differ from gable roofs.',
    fullDefinition:
      "A hip is the external angle where two roof planes meet, sloping downward from the ridge to the eave. A hip roof has slopes on all four sides (rather than the gable ends of a simpler roof). Hip roofs are more stable in high winds than gable roofs but have more complex framing and more linear feet of ridge/hip cap to install. Hip cap material is essentially the same as ridge cap.",
    relatedTerms: ['ridge-cap', 'valley', 'gable'],
  },
  {
    slug: 'gable',
    term: 'Gable',
    category: 'structure',
    shortDefinition: 'The triangular wall section at the end of a pitched roof.',
    metaDescription: 'What is a gable? Definition, types of gable roofs, and how gables differ from hip roofs.',
    fullDefinition:
      "A gable is the triangular wall section formed at the end of a pitched roof where two sloping roof planes meet at the top (ridge) and spread apart at the bottom (eaves). A gable roof is the most common roof style in residential construction because it is simple to frame, sheds water and snow effectively, and provides good attic space. Gable roofs are more vulnerable to wind damage than hip roofs.",
    relatedTerms: ['hip', 'rake', 'eave'],
  },
  {
    slug: 'eave',
    term: 'Eave',
    category: 'structure',
    shortDefinition: 'The lower horizontal edge of a roof that overhangs the exterior wall.',
    metaDescription: 'What is a roof eave? Purpose, overhang requirements, and why eaves matter for water drainage.',
    fullDefinition:
      'The eave is the lower horizontal edge of a roof that overhangs the exterior wall. Eaves serve two main purposes: they direct water runoff away from the exterior walls, and they provide shade for the wall and windows below. Eaves typically have fascia (vertical trim) on the edge and soffit (horizontal underside) beneath. In cold climates, ice and water shield is required on the first 6 feet of the roof measured from the eave.',
    relatedTerms: ['rake', 'fascia', 'soffit', 'drip-edge'],
  },
  {
    slug: 'rake',
    term: 'Rake',
    category: 'structure',
    shortDefinition: 'The sloped edge of a gable roof that runs from the eave to the ridge.',
    metaDescription: 'What is a rake on a roof? Definition and how rake differs from eave.',
    fullDefinition:
      'The rake is the sloped edge of a gable roof that runs from the eave up to the ridge along the gable end. Unlike the eave, which is horizontal and typically has gutters, the rake is angled and runs parallel to the roof pitch. Drip edge is installed along the rake over the underlayment (versus under the underlayment at the eave). Rake trim and rake shingles finish the appearance of the gable end.',
    relatedTerms: ['eave', 'gable', 'drip-edge'],
  },
  {
    slug: 'fascia',
    term: 'Fascia',
    category: 'structure',
    shortDefinition: 'The vertical trim board attached to the ends of the roof rafters at the eave.',
    metaDescription: 'What is fascia? Definition, maintenance, and how fascia connects to the gutter system.',
    fullDefinition:
      'Fascia is the vertical trim board attached to the ends of the roof rafters where the eave meets the exterior wall. It provides a finished look to the roof edge, supports the gutter system, and protects the roof structure from water intrusion. Fascia is typically made of wood, composite, or aluminum and is sometimes wrapped in aluminum for low maintenance.',
    relatedTerms: ['soffit', 'eave', 'gutter'],
  },
  {
    slug: 'soffit',
    term: 'Soffit',
    category: 'structure',
    shortDefinition: 'The horizontal underside of the roof overhang, between the fascia and the exterior wall.',
    metaDescription: 'What is a soffit? Purpose, ventilation role, and soffit material options.',
    fullDefinition:
      "The soffit is the horizontal underside of a roof overhang, between the fascia board and the exterior wall. Soffits serve two main purposes: they provide a finished appearance to the roof overhang, and they contain soffit vents that allow fresh air into the attic space. Proper soffit ventilation is critical for attic airflow — when combined with ridge vents, it prevents heat buildup, ice dams, and moisture damage. Soffits are typically made of wood, vinyl, or aluminum.",
    relatedTerms: ['fascia', 'ridge-vent', 'attic-ventilation'],
  },
  {
    slug: 'deck',
    term: 'Roof Deck',
    category: 'structure',
    shortDefinition: "The structural layer of plywood or OSB that shingles are installed on.",
    metaDescription: 'What is a roof deck? Materials, thickness requirements, and when to replace.',
    fullDefinition:
      'The roof deck is the structural base layer of a roof — the plywood or OSB (oriented strand board) sheathing that shingles and underlayment are installed on top of. Modern roofs typically use 1/2 inch or 5/8 inch thick plywood or OSB. When a roof is torn off for replacement, any rotten or damaged deck sheets must be replaced before the new roof is installed. Deck replacement is usually priced per sheet and is a common supplemental line item on insurance claims.',
    relatedTerms: ['rafter', 'underlayment', 'sheathing'],
  },
  {
    slug: 'rafter',
    term: 'Rafter',
    category: 'structure',
    shortDefinition: 'The structural framing members that support the roof deck from the wall top plate to the ridge.',
    metaDescription: 'What is a roof rafter? Rafters vs trusses and how they support the roof structure.',
    fullDefinition:
      'Rafters are the structural framing members that run from the top of the exterior wall up to the ridge of the roof, supporting the roof deck. Rafters are typically 2x6 or 2x8 lumber spaced 16 or 24 inches on center. Modern construction often uses prefabricated roof trusses instead of stick-framed rafters because trusses are faster to install and more efficient to engineer.',
    relatedTerms: ['deck', 'truss', 'ridge'],
  },
  {
    slug: 'shingle',
    term: 'Shingle',
    category: 'materials',
    shortDefinition: 'The individual roofing unit that covers the roof surface and sheds water.',
    metaDescription: 'What is a shingle? Types (3-tab, architectural, premium) and how shingles are installed.',
    fullDefinition:
      "A shingle is an individual roofing unit — typically an asphalt or composite panel — that covers the roof surface in overlapping rows to shed water. Modern asphalt shingles come in several types: 3-tab (basic, flat profile, usually 25-year warranty), architectural or dimensional (thicker, layered, 30-50 year warranty), and premium/designer (heaviest, textured profiles, 50-year+ warranty). Shingles are packaged in bundles (typically 3 bundles per roofing square) and installed in overlapping courses starting from the eave.",
    relatedTerms: ['shingle-bundle', 'architectural-shingle', 'three-tab-shingle'],
  },
  {
    slug: 'shingle-bundle',
    term: 'Shingle Bundle',
    category: 'materials',
    shortDefinition: "A packaged stack of shingles. Most standard shingles come 3 bundles per roofing square.",
    metaDescription: 'What is a shingle bundle? Coverage per bundle and how to calculate bundles needed.',
    fullDefinition:
      "A shingle bundle is a packaged stack of shingles sold as a single unit. For standard 3-tab and architectural shingles, 3 bundles cover 1 roofing square (100 sq ft). Heavier premium shingles are sometimes packaged at 4 bundles per square. Always check the wrapper for the actual coverage specification, as it varies by manufacturer. A typical bundle weighs 60-80 pounds for 3-tab shingles and up to 100 pounds for heavy architectural shingles.",
    relatedTerms: ['shingle', 'roofing-square', 'waste-factor'],
  },
  {
    slug: 'architectural-shingle',
    term: 'Architectural Shingle',
    category: 'materials',
    shortDefinition: 'A multi-layer, dimensional asphalt shingle that mimics the look of wood shake or slate.',
    metaDescription: 'What is an architectural shingle? Benefits over 3-tab, typical warranty, and cost comparison.',
    fullDefinition:
      'An architectural shingle (also called dimensional or laminated shingle) is a multi-layer asphalt shingle that has more visual depth and a longer lifespan than basic 3-tab shingles. Architectural shingles are now the dominant choice in the US residential market, outselling 3-tab shingles by a wide margin. They typically carry 30-50 year manufacturer warranties, weigh more (240-350 pounds per square), and cost about 20-30% more than 3-tab shingles.',
    relatedTerms: ['three-tab-shingle', 'shingle', 'shingle-bundle'],
  },
  {
    slug: 'three-tab-shingle',
    term: '3-Tab Shingle',
    category: 'materials',
    shortDefinition: "The traditional single-layer asphalt shingle with three tabs per piece.",
    metaDescription: 'What is a 3-tab shingle? Differences from architectural, cost, and when to still use them.',
    fullDefinition:
      "A 3-tab shingle is the traditional single-layer asphalt shingle, named for the three exposed tabs visible on each piece when installed. 3-tab shingles are the most affordable option but have a shorter lifespan (20-25 years typical) and a flatter appearance than architectural shingles. They are rarely used on new builds or high-end remodels today, but remain common on rental properties, budget installs, and insurance-driven repairs where matching existing shingles matters.",
    relatedTerms: ['architectural-shingle', 'shingle'],
  },
  {
    slug: 'tear-off',
    term: 'Tear-Off',
    category: 'techniques',
    shortDefinition: 'The process of removing the existing roofing before installing new shingles.',
    metaDescription: 'What is a roof tear-off? When it is required vs a lay-over, and labor cost factors.',
    fullDefinition:
      "A tear-off is the process of removing the existing roofing material (shingles, underlayment, flashings) before installing a new roof. A full tear-off exposes the roof deck, allows inspection and replacement of damaged deck, and is the preferred method for a long-lasting new roof. The alternative is a lay-over (installing new shingles over existing ones), which is faster and cheaper but usually prohibited by code after two layers and not recommended for quality installations.",
    relatedTerms: ['deck', 'layover', 'dump-fee'],
  },
  {
    slug: 'ice-dam',
    term: 'Ice Dam',
    category: 'techniques',
    shortDefinition: 'A ridge of ice that forms at the eave of a roof, preventing melting snow from draining.',
    metaDescription: 'What is an ice dam? Causes, damage, and how proper ventilation and ice shield prevent them.',
    fullDefinition:
      "An ice dam is a ridge of ice that forms at the eave of a roof, blocking melting snow from draining off. Water then backs up under the shingles and into the attic or ceiling, causing leaks and structural damage. Ice dams form when heat escapes from the attic, melts snow on the upper roof, and the water refreezes when it hits the cold eave. Prevention involves proper attic insulation, adequate ventilation (soffit + ridge vents), and ice and water shield at the eaves.",
    relatedTerms: ['ice-and-water-shield', 'attic-ventilation', 'eave'],
  },
  {
    slug: 'attic-ventilation',
    term: 'Attic Ventilation',
    category: 'structure',
    shortDefinition: 'The system of intake and exhaust vents that circulate air through the attic space.',
    metaDescription: 'Why attic ventilation matters, how to calculate required vent area, and common ventilation mistakes.',
    fullDefinition:
      "Attic ventilation is the system of intake vents (typically soffit vents) and exhaust vents (typically ridge vents) that circulate air through the attic space. Proper ventilation is critical for roof longevity. Benefits include preventing ice dams in winter, reducing heat buildup that damages shingles in summer, preventing moisture accumulation that leads to mold, and lowering energy costs. Building codes typically require 1 square foot of ventilation per 150 square feet of attic floor, split 50/50 between intake and exhaust.",
    relatedTerms: ['ridge-vent', 'soffit', 'ice-dam'],
  },
  {
    slug: 'pitch-multiplier',
    term: 'Pitch Multiplier',
    category: 'business',
    shortDefinition: 'The factor used to convert roof footprint to actual surface area based on pitch.',
    metaDescription: 'How to calculate the roof pitch multiplier and why it matters for material estimates.',
    fullDefinition:
      "The pitch multiplier is the factor used to convert a roof's footprint (the area of the ground it covers) into its actual surface area. A flat roof has a multiplier of 1.0. A 6/12 pitch has a multiplier of approximately 1.118. A 12/12 pitch is 1.414. You calculate it with the formula: multiplier = √(rise² + run²) / run. Missing the pitch adjustment is one of the most common estimating errors because it always causes you to under-order materials and under-bid the job.",
    relatedTerms: ['pitch', 'roofing-square'],
  },
  {
    slug: 'waste-factor',
    term: 'Waste Factor',
    category: 'business',
    shortDefinition: 'The percentage of extra material added to an order to account for cuts, overlaps, and mistakes.',
    metaDescription: 'What is waste factor in roofing? Typical percentages by roof complexity and why it matters.',
    fullDefinition:
      'Waste factor is the percentage of extra material added to a roofing material order to account for cuts, overlaps, damaged pieces, and installation mistakes. Standard simple gable roofs use a 10% waste factor. Complex roofs with multiple valleys, hips, dormers, and penetrations need 15-20%. Steep roofs also require more waste because of harder cuts and more frequent replacements of damaged pieces. Always order with waste factor included — running short mid-job costs far more than the extra bundles.',
    relatedTerms: ['shingle-bundle', 'roofing-square'],
  },
  {
    slug: 'pipe-jack',
    term: 'Pipe Jack',
    category: 'materials',
    shortDefinition: 'A flashing assembly that seals around a vent pipe penetrating the roof.',
    metaDescription: 'What is a pipe jack? Components, installation, and why failed pipe jacks are a common leak source.',
    fullDefinition:
      'A pipe jack (also called a pipe flashing or pipe boot) is a flashing assembly that seals around a vent pipe where it penetrates the roof. It consists of a metal base flange and a rubber or neoprene collar that fits tightly around the pipe. Pipe jacks typically last 10-15 years before the rubber collar cracks and leaks. Failed pipe jacks are one of the most common sources of roof leaks and should be inspected during every roof replacement.',
    relatedTerms: ['flashing', 'vent'],
  },
  {
    slug: 'step-flashing',
    term: 'Step Flashing',
    category: 'materials',
    shortDefinition: 'L-shaped metal flashing pieces installed where a roof meets a vertical wall.',
    metaDescription: 'What is step flashing? Installation best practices and why it matters for leak prevention.',
    fullDefinition:
      'Step flashing is a series of L-shaped metal flashing pieces installed where a roof plane meets a vertical wall, such as where a roof meets a dormer or chimney. Each piece overlaps the one below and interlocks with the shingle course, creating a stepped pattern that directs water away from the wall/roof junction. Proper step flashing is one of the most important details in leak prevention and is often the difference between a roof that lasts 30 years and one that leaks in year 5.',
    relatedTerms: ['flashing', 'chimney-flashing'],
  },
  {
    slug: 'chimney-flashing',
    term: 'Chimney Flashing',
    category: 'materials',
    shortDefinition: 'The flashing system that seals around a chimney where it penetrates the roof.',
    metaDescription: 'What is chimney flashing? Components, installation, and repair cost considerations.',
    fullDefinition:
      "Chimney flashing is the flashing system installed where a chimney penetrates the roof. It consists of several components: step flashing on the sides, apron flashing on the front (downhill side), cricket flashing on the back (uphill side) to divert water around the chimney, and counterflashing that embeds into the chimney mortar joints above the other flashings. Chimney flashing is one of the most complex and failure-prone details on a roof and should be replaced or inspected during every roof replacement.",
    relatedTerms: ['step-flashing', 'flashing', 'cricket'],
  },
  {
    slug: 'cricket',
    term: 'Cricket',
    category: 'structure',
    shortDefinition: 'A small peaked structure built on the uphill side of a chimney to divert water.',
    metaDescription: 'What is a chimney cricket? When it is required by code and why larger chimneys need one.',
    fullDefinition:
      "A cricket (also called a saddle) is a small peaked structure built on the uphill side of a chimney to divert water and debris around the chimney rather than letting it pool against the back wall. Building codes typically require a cricket on any chimney wider than 30 inches. Crickets are framed with lumber and covered with the same roofing material as the main roof, with proper flashing at every transition.",
    relatedTerms: ['chimney-flashing', 'flashing', 'valley'],
  },
];

export function getGlossaryTerm(slug: string): GlossaryTerm | undefined {
  return glossaryTerms.find((t) => t.slug === slug);
}

export function getAllGlossaryTerms(): GlossaryTerm[] {
  return [...glossaryTerms].sort((a, b) => a.term.localeCompare(b.term));
}
