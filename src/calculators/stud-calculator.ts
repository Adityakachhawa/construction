import { dimensionRows } from './dimension-rows';
import { ceilQuantity } from './rounding';
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

export function formula(inputs: CalculatorInputMap, unitSystem: UnitSystem): CalculatorOutputMap {
  if (unitSystem === 'imperial') {
    const lengthFt      = Number(inputs.length_ft   ?? 12) + Number(inputs.length_in   ?? 0) / 12;
    const heightFt      = Number(inputs.height_ft   ?? 9)  + Number(inputs.height_in   ?? 0) / 12;
    const spacingIn     = SPACING_IN[String(inputs.spacing ?? '16')] ?? 16;
    const openingCount  = Math.max(0, Math.round(Number(inputs.openings ?? 1)));
    const openingWFt    = Number(inputs.opening_width_ft  ?? 3) + Number(inputs.opening_width_in  ?? 0) / 12;

    const spacingFt = spacingIn / 12;

    // Field studs: floor(length / spacing) + 1, then subtract studs displaced by openings
    const field_studs_gross = Math.floor(lengthFt / spacingFt) + 1;
    // Each opening displaces ⌊opening_width / spacing⌋ field studs
    const studs_per_opening = openingCount > 0 ? Math.floor(openingWFt / spacingFt) : 0;
    const positioned = dimensionRows(inputs.stud_openings_ft);
    const displaced = positioned.reduce((sum, [start, width]) =>
      sum + Math.max(0, Math.ceil((start + width) / spacingFt) - Math.floor(start / spacingFt) - 1), 0);
    const field_studs = Math.max(0, field_studs_gross - (positioned.length ? displaced : openingCount * studs_per_opening));

    // Corner studs: 2 per wall end (king + trimmer approach) = 4 extra per independent wall
    // Standard practice: 3-stud corner assembly = 2 extra beyond the last field stud
    const corner_studs = 4;

    // Per opening: 2 king studs + 2 jack/trimmer studs + cripple studs above header
    // Cripples above header = ⌊opening_width / spacing⌋ + 1
    const cripples_per_opening = openingCount > 0
      ? ceilQuantity(openingWFt / spacingFt) + 1
      : 0;
    const opening_framing = positioned.length
      ? positioned.reduce((sum, [, width]) => sum + 5 + ceilQuantity(width / spacingFt), 0)
      : openingCount * (4 + cripples_per_opening); // 2 king + 2 jack + cripples

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

    const spacingM = spacingMm / 1000;

    const field_studs_gross = Math.floor(lengthM / spacingM) + 1;
    const studs_per_opening = openingCount > 0 ? Math.floor(openingWM / spacingM) : 0;
    const positioned = dimensionRows(inputs.stud_openings_m);
    const displaced = positioned.reduce((sum, [start, width]) =>
      sum + Math.max(0, Math.ceil((start + width) / spacingM) - Math.floor(start / spacingM) - 1), 0);
    const field_studs = Math.max(0, field_studs_gross - (positioned.length ? displaced : openingCount * studs_per_opening));

    const corner_studs = 4;

    const cripples_per_opening = openingCount > 0
      ? ceilQuantity(openingWM / spacingM) + 1
      : 0;
    const opening_framing = positioned.length
      ? positioned.reduce((sum, [, width]) => sum + 5 + ceilQuantity(width / spacingM), 0)
      : openingCount * (4 + cripples_per_opening);

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
    { id:'stud_openings_ft', onlyIn:'imperial', type:'pairs', label:'Positioned openings (ft)', defaultValue:'', helpText:'Enter distance from wall start x opening width for each opening, in order. These positions replace the opening count and width. Height is shared.' },
    { id:'stud_openings_m', onlyIn:'metric', type:'pairs', label:'Positioned openings (m)', defaultValue:'', helpText:'Enter distance from wall start x opening width for each opening, in order. These positions replace the opening count and width. Height is shared.' },
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
      helpText: 'Use spacing from approved framing plans; this estimator does not design walls.',
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
      label: 'Opening Height (reference only)',
      helpText: 'Record the opening height for your cut list. This piece-count estimate uses opening width and spacing.',
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
      label: 'Opening Height (reference only)',
      helpText: 'Record the opening height for your cut list. This piece-count estimate uses opening width and spacing.',
      type: 'number',
      unit: 'm',
      min: 0,
      max: 4,
      step: 0.05,
      defaultValue: 2.1,
      defaultValueMetric: 2.1,
      onlyIn: 'metric',
    },
  ],
  outputs: [
    {
      id: 'total_studs',
      label: 'Estimated framing pieces',
      unit: 'pieces',
      format: 'number',
      primary: true,
      description: 'Includes four extra end/corner pieces per wall. Short opening pieces are counted individually; use your cut list to determine full-length stock.',
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
      label: 'End/corner allowance',
      unit: 'studs',
      format: 'number',
      description: '3-stud corner assembly at each end (4 total)',
    },
    {
      id: 'opening_framing',
      label: 'Opening pieces (including short cuts)',
      unit: 'pieces',
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
        'A 12-foot wall at 16" OC needs ⌊144 ÷ 16⌋ + 1 = 10 field studs, plus 4 corner studs = 14 studs for a wall with no openings. Add a standard door opening (3 ft rough): subtract 2 field studs displaced, add 2 king + 2 jack + 3 cripples = 7 opening studs. Total: 14 − 2 + 7 = 19 studs. This is the estimator convention, not a placement plan: floor(length/spacing)+1 can omit an end stud on a non-divisible span. Opening and corner allowances require layout review.',
    },
    {
      question: 'What is the standard stud spacing?',
      answer:
        'Select stud spacing from the approved framing specification, including loads, wall height, lumber grade and sheathing requirements. The available spacings are estimating options, not approval for a particular wall.',
    },
    {
      question: 'What is the difference between king studs, jack studs, and cripple studs?',
      answer:
        'King studs run full height from bottom plate to top plate on each side of an opening. Jack studs (also called trimmer studs) sit inside the king studs and support the header over the opening — they are shorter, cut to header height. Cripple studs fill the space between the header and the top plate, maintaining the OC spacing across the opening. All three types are counted in the Opening Framing output.',
    },
    {
      question: 'How do I frame a corner with studs?',
      answer:
        'The estimator adds four corner studs per wall as an allowance. Actual corner and backing details can require a different count; use the framing plan and do not treat this allowance as an assembly design.',
    },
    {
      question: 'Do I need double top plates?',
      answer:
        'Plate count and connection details must follow the approved framing plan and applicable building requirements. Plates are excluded from this stud estimator.',
    },
    {
      question: 'How much waste should I add for wall studs?',
      answer:
        'Add 10% for straightforward rectangular walls. Increase to 15% for walls with many corners, angled sections, or complex header situations. Miscuts, split lumber, and last-minute adjustments are common — running short of studs mid-frame is a project delay. Leftover studs are easily used elsewhere or returned to most lumber yards.',
    },
    {
      question: 'What length studs do I need for 9-foot ceilings?',
      answer:
        'Determine stud cut length from the specified wall assembly, plate thicknesses and finishes. A 104-5/8-inch stud plus 4-1/2 inches of plates totals 109-1/8 inches, not exactly 108 inches. Verify supplier precut dimensions against the plans.',
    },
    {
      question: 'How do I calculate studs for multiple walls?',
      answer:
        'Run this calculator once per wall, then add the totals. Shared corners between intersecting walls may let you reduce the count slightly — one wall\'s end studs can serve as the corner assembly for the adjacent wall. In practice, most framers calculate each wall independently and add 10% overall, since lumber is inexpensive relative to labour and a separate trip for a few extra studs costs far more than the boards themselves.',
    },
  ],
  wasteFactor: {
    default: 10,
    range: '10–15%',
    notes: 'Simple rectangular walls: 10%. Walls with many corners, angled runs, or complex header configurations: 15%.',
  },
  references: [
    {
      title: 'IRC R602 – Wood Wall Framing',
      organization: 'International Residential Code',
      url: 'https://codes.iccsafe.org/',
    },
    {
      title: 'Wood Frame Construction Manual (WFCM)',
      organization: 'American Wood Council (AWC)',
      url: 'https://www.awc.org/',
    },
  ],
  presets: [
    {
      label: '10 ft Partition Wall (16" OC)',
      values: { length_ft: 10, length_in: 0, height_ft: 8, height_in: 0, spacing: '16', openings: 0, opening_width_ft: 3, opening_width_in: 0 },
      unit: 'imperial',
    },
    {
      label: '12 ft Bedroom Wall (16" OC, 1 door)',
      values: { length_ft: 12, length_in: 0, height_ft: 8, height_in: 0, spacing: '16', openings: 1, opening_width_ft: 3, opening_width_in: 0 },
      unit: 'imperial',
    },
    {
      label: '20 ft Exterior Wall (16" OC, 2 windows)',
      values: { length_ft: 20, length_in: 0, height_ft: 9, height_in: 0, spacing: '16', openings: 2, opening_width_ft: 3, opening_width_in: 0 },
      unit: 'imperial',
    },
    {
      label: '24 ft Garage Wall (24" OC, 1 door)',
      values: { length_ft: 24, length_in: 0, height_ft: 9, height_in: 0, spacing: '24', openings: 1, opening_width_ft: 3, opening_width_in: 0 },
      unit: 'imperial',
    },
  ],
  referenceTable: {
    title: 'Stud Requirements by Wall Length and Spacing',
    description: 'Current estimator convention: floor(length/spacing)+1 field studs, no openings, plus 4 corner studs. Order includes 10% extra. This is not a placement plan; non-divisible end spans need layout review and plates are excluded:',
    headers: ['Wall Length', '16" OC Field Studs', '16" OC Recommended Order', '24" OC Field Studs', '24" OC Recommended Order'],
    rows: [
      ['8 ft', '7', '13', '5', '10'],
      ['10 ft', '8', '14', '6', '11'],
      ['12 ft', '10', '16', '7', '13'],
      ['16 ft', '13', '19', '9', '15'],
      ['20 ft', '16', '22', '11', '17'],
      ['24 ft', '19', '26', '13', '19'],
      ['40 ft', '31', '39', '21', '28'],
    ],
  },
};
