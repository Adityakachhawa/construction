import type {
  CalculatorConfig,
  CalculatorInputMap,
  CalculatorOutputMap,
  UnitSystem,
} from './_types';

// Spacing options: key = select value, value = inches OC
const SPACING_IN: Record<string, number> = {
  '12': 12,
  '16': 16,
  '24': 24,
};
// Metric equivalents in mm
const SPACING_MM: Record<string, number> = {
  '305':  305,
  '400':  400,
  '600':  600,
};

function formula(inputs: CalculatorInputMap, unitSystem: UnitSystem): CalculatorOutputMap {
  if (unitSystem === 'imperial') {
    const lengthFt      = Number(inputs.length_ft   ?? 12) + Number(inputs.length_in   ?? 0) / 12;
    const heightFt      = Number(inputs.height_ft   ?? 9)  + Number(inputs.height_in   ?? 0) / 12;
    const spacingIn     = SPACING_IN[String(inputs.spacing ?? '16')] ?? 16;
    const openingCount  = Math.max(0, Math.round(Number(inputs.openings ?? 1)));
    const openingWFt    = Number(inputs.opening_width_ft  ?? 3) + Number(inputs.opening_width_in  ?? 0) / 12;
    const openingHFt    = Number(inputs.opening_height_ft ?? 6) + Number(inputs.opening_height_in ?? 8) / 12;

    const spacingFt = spacingIn / 12;

    // Field studs: floor(length / spacing) + 1, then subtract studs displaced by openings
    const field_studs_gross = Math.floor(lengthFt / spacingFt) + 1;
    // Each opening displaces ⌊opening_width / spacing⌋ field studs
    const studs_per_opening = openingCount > 0 ? Math.floor(openingWFt / spacingFt) : 0;
    const field_studs = Math.max(0, field_studs_gross - openingCount * studs_per_opening);

    // Corner studs: 2 per wall end (king + trimmer approach) = 4 extra per independent wall
    // Standard practice: 3-stud corner assembly = 2 extra beyond the last field stud
    const corner_studs = 4;

    // Per opening: 2 king studs + 2 jack/trimmer studs + cripple studs above header
    // Cripples above header = ⌊opening_width / spacing⌋ + 1
    const cripples_per_opening = openingCount > 0
      ? Math.ceil(openingWFt / spacingFt) + 1
      : 0;
    const opening_framing = openingCount * (4 + cripples_per_opening); // 2 king + 2 jack + cripples

    const total_studs = field_studs + corner_studs + opening_framing;

    const wall_area_sqft = Math.round(lengthFt * heightFt * 10) / 10;
    const wall_area_sqm  = Math.round(wall_area_sqft * 0.092903 * 100) / 100;

    return {
      total_studs,
      field_studs,
      corner_studs,
      opening_framing,
      wall_area_sqft,
      wall_area_sqm,
    };
  } else {
    const lengthM       = Number(inputs.length_m   ?? 3.6);
    const heightM       = Number(inputs.height_m   ?? 2.7);
    const spacingMm     = SPACING_MM[String(inputs.spacing ?? '400')] ?? 400;
    const openingCount  = Math.max(0, Math.round(Number(inputs.openings ?? 1)));
    const openingWM     = Number(inputs.opening_width_m  ?? 0.9);
    const openingHM     = Number(inputs.opening_height_m ?? 2.1);

    const spacingM = spacingMm / 1000;

    const field_studs_gross = Math.floor(lengthM / spacingM) + 1;
    const studs_per_opening = openingCount > 0 ? Math.floor(openingWM / spacingM) : 0;
    const field_studs = Math.max(0, field_studs_gross - openingCount * studs_per_opening);

    const corner_studs = 4;

    const cripples_per_opening = openingCount > 0
      ? Math.ceil(openingWM / spacingM) + 1
      : 0;
    const opening_framing = openingCount * (4 + cripples_per_opening);

    const total_studs = field_studs + corner_studs + opening_framing;

    const wall_area_sqm  = Math.round(lengthM * heightM * 100) / 100;
    const wall_area_sqft = Math.round(wall_area_sqm / 0.092903 * 10) / 10;

    return {
      total_studs,
      field_studs,
      corner_studs,
      opening_framing,
      wall_area_sqm,
      wall_area_sqft,
    };
  }
}

export const studCalculator: CalculatorConfig = {
  slug: 'stud-calculator',
  name: 'Stud Calculator',
  category: 'framing',
  description:
    'Calculate how many studs you need to frame a wall. Enter wall length, height, stud spacing, and number of openings to get total studs, corner framing, and opening framing counts.',
  inputs: [
    // ── Imperial ──────────────────────────────────────
    {
      id: 'length_ft',
      label: 'Wall Length',
      type: 'number',
      unit: 'ft',
      min: 0,
      max: 500,
      step: 1,
      defaultValue: 12,
      required: true,
      onlyIn: 'imperial',
    },
    {
      id: 'length_in',
      label: 'Wall Length (in)',
      type: 'number',
      unit: 'in',
      min: 0,
      max: 11,
      step: 1,
      defaultValue: 0,
      onlyIn: 'imperial',
      groupWith: 'length_ft',
    },
    {
      id: 'height_ft',
      label: 'Wall Height',
      type: 'number',
      unit: 'ft',
      min: 0,
      max: 30,
      step: 1,
      defaultValue: 9,
      required: true,
      onlyIn: 'imperial',
      helpText: 'Standard ceiling heights: 8 ft, 9 ft, 10 ft.',
    },
    {
      id: 'height_in',
      label: 'Wall Height (in)',
      type: 'number',
      unit: 'in',
      min: 0,
      max: 11,
      step: 1,
      defaultValue: 0,
      onlyIn: 'imperial',
      groupWith: 'height_ft',
    },
    {
      id: 'spacing',
      label: 'Stud Spacing',
      type: 'select',
      options: [
        { value: '12', label: '12" OC' },
        { value: '16', label: '16" OC (standard)' },
        { value: '24', label: '24" OC (advanced framing)' },
      ],
      defaultValue: '16',
      required: true,
      onlyIn: 'imperial',
      helpText: '16" OC is standard for most residential walls.',
    },
    {
      id: 'openings',
      label: 'Number of Openings',
      type: 'number',
      unit: 'openings',
      min: 0,
      max: 50,
      step: 1,
      defaultValue: 1,
      onlyIn: 'imperial',
      helpText: 'Windows and doors each count as one opening.',
    },
    {
      id: 'opening_width_ft',
      label: 'Opening Width',
      type: 'number',
      unit: 'ft',
      min: 0,
      max: 20,
      step: 1,
      defaultValue: 3,
      onlyIn: 'imperial',
      helpText: 'Rough opening width. Use average if openings vary.',
    },
    {
      id: 'opening_width_in',
      label: 'Opening Width (in)',
      type: 'number',
      unit: 'in',
      min: 0,
      max: 11,
      step: 1,
      defaultValue: 0,
      onlyIn: 'imperial',
      groupWith: 'opening_width_ft',
    },
    {
      id: 'opening_height_ft',
      label: 'Opening Height',
      type: 'number',
      unit: 'ft',
      min: 0,
      max: 12,
      step: 1,
      defaultValue: 6,
      onlyIn: 'imperial',
    },
    {
      id: 'opening_height_in',
      label: 'Opening Height (in)',
      type: 'number',
      unit: 'in',
      min: 0,
      max: 11,
      step: 1,
      defaultValue: 8,
      onlyIn: 'imperial',
      groupWith: 'opening_height_ft',
      helpText: 'Standard door RO: 6 ft 8 in. Standard window: varies.',
    },
    // ── Metric ────────────────────────────────────────
    {
      id: 'length_m',
      label: 'Wall Length',
      type: 'number',
      unit: 'm',
      min: 0,
      max: 150,
      step: 0.1,
      defaultValue: 3.6,
      defaultValueMetric: 3.6,
      required: true,
      onlyIn: 'metric',
    },
    {
      id: 'height_m',
      label: 'Wall Height',
      type: 'number',
      unit: 'm',
      min: 0,
      max: 9,
      step: 0.1,
      defaultValue: 2.7,
      defaultValueMetric: 2.7,
      required: true,
      onlyIn: 'metric',
      helpText: 'Standard ceiling heights: 2.4 m, 2.7 m, 3.0 m.',
    },
    {
      id: 'spacing',
      label: 'Stud Spacing',
      type: 'select',
      options: [
        { value: '305', label: '305 mm OC (12")' },
        { value: '400', label: '400 mm OC (16") — standard' },
        { value: '600', label: '600 mm OC (24") — advanced framing' },
      ],
      defaultValue: '400',
      required: true,
      onlyIn: 'metric',
    },
    {
      id: 'openings',
      label: 'Number of Openings',
      type: 'number',
      unit: 'openings',
      min: 0,
      max: 50,
      step: 1,
      defaultValue: 1,
      onlyIn: 'metric',
      helpText: 'Windows and doors each count as one opening.',
    },
    {
      id: 'opening_width_m',
      label: 'Opening Width',
      type: 'number',
      unit: 'm',
      min: 0,
      max: 6,
      step: 0.05,
      defaultValue: 0.9,
      defaultValueMetric: 0.9,
      onlyIn: 'metric',
      helpText: 'Rough opening width. Use average if openings vary.',
    },
    {
      id: 'opening_height_m',
      label: 'Opening Height',
      type: 'number',
      unit: 'm',
      min: 0,
      max: 4,
      step: 0.05,
      defaultValue: 2.1,
      defaultValueMetric: 2.1,
      onlyIn: 'metric',
      helpText: 'Standard door RO: 2.1 m. Window: varies.',
    },
  ],
  outputs: [
    {
      id: 'total_studs',
      label: 'Total Studs Required',
      unit: 'studs',
      format: 'number',
      primary: true,
      description: 'Field studs + corner assembly + opening framing',
    },
    {
      id: 'field_studs',
      label: 'Field Studs',
      unit: 'studs',
      format: 'number',
      description: 'Studs at regular OC spacing along the wall',
    },
    {
      id: 'corner_studs',
      label: 'Corner Studs',
      unit: 'studs',
      format: 'number',
      description: '3-stud corner assembly at each end (4 total)',
    },
    {
      id: 'opening_framing',
      label: 'Opening Framing Studs',
      unit: 'studs',
      format: 'number',
      description: 'King studs, jack studs, and cripples for all openings',
    },
    {
      id: 'wall_area_sqft',
      label: 'Wall Area',
      unit: 'ft²',
      format: 'area',
      description: 'Gross wall face area',
    },
    {
      id: 'wall_area_sqm',
      label: 'Wall Area',
      unit: 'm²',
      format: 'area',
    },
  ],
  formula,
  unitSystems: ['imperial', 'metric'],
  relatedCalculators: [
    'plywood-calculator',
    'drywall-calculator',
    'flooring-calculator',
  ],
  seo: {
    title: 'Stud Calculator — Wall Framing Stud Count at 16" OC',
    description:
      'Free stud calculator — enter wall length, height, stud spacing, and number of openings to get exact stud count including corner framing and header studs for any wall framing project.',
    h1: 'Stud Calculator',
    focusKeyword: 'stud calculator',
  },
  schema: {
    appType: 'Construction Calculator',
    features: [
      'Calculate wall framing stud count',
      'Supports 12", 16", and 24" OC spacing',
      'Accounts for window and door openings',
      'Calculates corner stud assemblies',
      'Calculates king, jack, and cripple studs per opening',
      'Imperial and metric support',
    ],
  },
  formulaSteps: [
    {
      label: 'Calculate field studs',
      formula: 'Field studs = ⌊Wall length ÷ Spacing⌋ + 1',
      description: 'One stud at each spacing interval plus one at the far end. Each opening removes ⌊opening width ÷ spacing⌋ field studs from this count.',
    },
    {
      label: 'Add corner stud assembly',
      formula: 'Corner studs = 4',
      description: 'Standard 3-stud corner: 2 king studs at each end plus the shared corner stud. This adds 4 studs beyond the field count.',
    },
    {
      label: 'Calculate opening framing per opening',
      formula: 'Opening studs = 2 king + 2 jack + (⌈opening width ÷ spacing⌉ + 1) cripples',
      description: 'Each opening requires 2 king studs, 2 jack/trimmer studs, and cripple studs above the header filling the space to the top plate.',
    },
    {
      label: 'Scale to all openings',
      formula: 'Total opening framing = Opening studs per opening × Number of openings',
    },
    {
      label: 'Sum all stud types',
      formula: 'Total studs = Field studs + Corner studs + Total opening framing',
      description: 'Add 10–15% waste for cuts and miscuts on complex walls',
    },
  ],
  faq: [
    {
      question: 'How many studs do I need for a 12-foot wall?',
      answer:
        'A 12-foot wall at 16" OC needs ⌊144 ÷ 16⌋ + 1 = 10 field studs, plus 4 corner studs = 14 studs for a wall with no openings. Add a standard door opening (3 ft rough): subtract 2 field studs displaced, add 2 king + 2 jack + 3 cripples = 7 opening studs. Total: 14 − 2 + 7 = 19 studs. Use this calculator for any wall length and opening count.',
    },
    {
      question: 'What is the standard stud spacing?',
      answer:
        '16 inches on center (OC) is the most common spacing for residential walls in North America. It accommodates standard 4×8 sheathing and drywall without mid-span seams. 24" OC (advanced framing) uses fewer studs and more insulation — code-compliant for many single-story applications but requires engineering review for load-bearing walls. 12" OC is used for tall walls, heavy loads, or seismic zones.',
    },
    {
      question: 'What is the difference between king studs, jack studs, and cripple studs?',
      answer:
        'King studs run full height from bottom plate to top plate on each side of an opening. Jack studs (also called trimmer studs) sit inside the king studs and support the header over the opening — they are shorter, cut to header height. Cripple studs fill the space between the header and the top plate, maintaining the OC spacing across the opening. All three types are counted in the Opening Framing output.',
    },
    {
      question: 'How do I frame a corner with studs?',
      answer:
        'The standard 3-stud corner uses two studs forming an L-shape at the corner, with a third stud providing a nailing surface for interior drywall. This adds 4 extra studs per wall (2 at each end). An alternative California corner uses only 2 studs with drywall clips — it saves one stud per corner and improves insulation continuity, but requires clips and a slightly different drywall installation sequence.',
    },
    {
      question: 'Do I need double top plates?',
      answer:
        'Yes — load-bearing walls require doubled top plates to transfer load across stud-to-stud gaps and create a continuous structural tie. The double plate is not included in the stud count but requires one additional run of lumber the full wall length. Non-load-bearing partition walls may use a single top plate in some jurisdictions — verify with your local building code.',
    },
    {
      question: 'How much waste should I add for wall studs?',
      answer:
        'Add 10% for straightforward rectangular walls. Increase to 15% for walls with many corners, angled sections, or complex header situations. Miscuts, split lumber, and last-minute adjustments are common — running short of studs mid-frame is a project delay. Leftover studs are easily used elsewhere or returned to most lumber yards.',
    },
    {
      question: 'What length studs do I need for 9-foot ceilings?',
      answer:
        'For 9-foot finished ceiling height, use 104-5/8 inch precut studs (standard 9-ft stud). With a double top plate (3 inches) and single bottom plate (1.5 inches), the total wall assembly is 9 ft exactly. For 8-foot ceilings, use 92-5/8 inch studs. Precut studs are sold in these lengths at most lumber yards and eliminate the need to cut each stud to length.',
    },
    {
      question: 'How do I calculate studs for multiple walls?',
      answer:
        'Run this calculator once per wall, then add the totals. Shared corners between intersecting walls may let you reduce the count slightly — one wall\'s end studs can serve as the corner assembly for the adjacent wall. In practice, most framers calculate each wall independently and add 10% overall, since lumber is inexpensive relative to labour and a separate trip for a few extra studs costs far more than the boards themselves.',
    },
  ],
};
