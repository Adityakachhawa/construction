import type {
  CalculatorConfig,
  CalculatorInputMap,
  CalculatorOutputMap,
  UnitSystem,
} from './_types';

// Rafter factor: actual slope length per unit of horizontal run
// factor = √(1 + (pitch/12)²)
const PITCH_FACTORS: Record<string, number> = {
  '0':  1.000,  // flat
  '2':  1.014,
  '3':  1.031,
  '4':  1.054,
  '5':  1.083,
  '6':  1.118,
  '7':  1.158,
  '8':  1.202,
  '9':  1.250,
  '10': 1.302,
  '12': 1.414,
  '14': 1.537,
  '16': 1.667,
};

// 1 roofing square = 100 ft²; 1 m² = 10.7639 ft²
const SQFT_PER_SQM   = 10.7639;
const SQFT_PER_SQUARE = 100;
const BUNDLES_PER_SQUARE = 3;  // standard 3-tab or architectural shingles

function getPitchFactor(pitchKey: string): number {
  return PITCH_FACTORS[pitchKey] ?? 1.118; // default 6:12
}

function formula(inputs: CalculatorInputMap, unitSystem: UnitSystem): CalculatorOutputMap {
  const pitchKey  = String(inputs.pitch ?? '6');
  const wastePct  = Number(inputs.waste_pct ?? 10) / 100;
  const pitchFactor = getPitchFactor(pitchKey);

  if (unitSystem === 'imperial') {
    const lengthFt = Number(inputs.length_ft ?? 40) + Number(inputs.length_in ?? 0) / 12;
    const widthFt  = Number(inputs.width_ft  ?? 30) + Number(inputs.width_in  ?? 0) / 12;

    const footprint_sqft    = Math.round(lengthFt * widthFt * 10) / 10;
    const roof_area_sqft    = Math.round(footprint_sqft * pitchFactor * 10) / 10;
    const material_area_sqft = Math.round(roof_area_sqft * (1 + wastePct) * 10) / 10;
    const squares           = Math.round(material_area_sqft / SQFT_PER_SQUARE * 100) / 100;
    const bundles           = Math.ceil(squares * BUNDLES_PER_SQUARE);
    const underlayment_sqft = material_area_sqft;

    return {
      roof_area_sqft,
      material_area_sqft,
      squares,
      bundles,
      underlayment_sqft,
      pitch_factor: Math.round(pitchFactor * 1000) / 1000,
    };
  } else {
    const lengthM = Number(inputs.length_m ?? 12);
    const widthM  = Number(inputs.width_m  ?? 9);

    const footprint_sqm    = Math.round(lengthM * widthM * 100) / 100;
    const roof_area_sqm    = Math.round(footprint_sqm * pitchFactor * 100) / 100;
    const material_area_sqm = Math.round(roof_area_sqm * (1 + wastePct) * 100) / 100;
    // Convert to ft² for square/bundle calculation (roofing square is always 100 ft²)
    const materialSqFt     = material_area_sqm * SQFT_PER_SQM;
    const squares          = Math.round(materialSqFt / SQFT_PER_SQUARE * 100) / 100;
    const bundles          = Math.ceil(squares * BUNDLES_PER_SQUARE);
    const underlayment_sqm = material_area_sqm;

    return {
      roof_area_sqm,
      material_area_sqm,
      squares,
      bundles,
      underlayment_sqm,
      pitch_factor: Math.round(pitchFactor * 1000) / 1000,
    };
  }
}

const PITCH_OPTIONS = [
  { value: '0',  label: 'Flat / 0:12' },
  { value: '2',  label: '2:12 — low slope' },
  { value: '3',  label: '3:12' },
  { value: '4',  label: '4:12' },
  { value: '5',  label: '5:12' },
  { value: '6',  label: '6:12 — common (default)' },
  { value: '7',  label: '7:12' },
  { value: '8',  label: '8:12' },
  { value: '9',  label: '9:12' },
  { value: '10', label: '10:12' },
  { value: '12', label: '12:12 — steep' },
  { value: '14', label: '14:12' },
  { value: '16', label: '16:12 — very steep' },
];

export const roofingCalculator: CalculatorConfig = {
  slug: 'roofing-calculator',
  name: 'Roofing Calculator',
  category: 'framing',
  description:
    'Calculate roofing squares, shingle bundles, and material area for any roof. Enter length, width, pitch, and waste percentage to get exact shingle quantities for your project.',
  inputs: [
    // ── Imperial ──────────────────────────────────────
    {
      id: 'length_ft',
      label: 'Roof Length',
      type: 'number',
      unit: 'ft',
      min: 0,
      max: 1000,
      step: 1,
      defaultValue: 40,
      required: true,
      onlyIn: 'imperial',
      helpText: 'Horizontal length of the roof (ridge length for a gable).',
    },
    {
      id: 'length_in',
      label: 'Roof Length (in)',
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
      id: 'width_ft',
      label: 'Roof Width',
      type: 'number',
      unit: 'ft',
      min: 0,
      max: 500,
      step: 1,
      defaultValue: 30,
      required: true,
      onlyIn: 'imperial',
      helpText: 'Full horizontal width of the building (both sides combined).',
    },
    {
      id: 'width_in',
      label: 'Roof Width (in)',
      type: 'number',
      unit: 'in',
      min: 0,
      max: 11,
      step: 1,
      defaultValue: 0,
      onlyIn: 'imperial',
      groupWith: 'width_ft',
    },
    // ── Metric ────────────────────────────────────────
    {
      id: 'length_m',
      label: 'Roof Length',
      type: 'number',
      unit: 'm',
      min: 0,
      max: 300,
      step: 0.1,
      defaultValue: 12,
      defaultValueMetric: 12,
      required: true,
      onlyIn: 'metric',
      helpText: 'Horizontal length of the roof (ridge length for a gable).',
    },
    {
      id: 'width_m',
      label: 'Roof Width',
      type: 'number',
      unit: 'm',
      min: 0,
      max: 150,
      step: 0.1,
      defaultValue: 9,
      defaultValueMetric: 9,
      required: true,
      onlyIn: 'metric',
      helpText: 'Full horizontal width of the building (both sides combined).',
    },
    // ── Shared (pitch + waste) ─────────────────────────
    {
      id: 'pitch',
      label: 'Roof Pitch',
      type: 'select',
      options: PITCH_OPTIONS,
      defaultValue: '6',
      required: true,
      helpText: 'Steeper pitches increase actual surface area above the footprint.',
    },
    {
      id: 'waste_pct',
      label: 'Waste %',
      type: 'number',
      unit: '%',
      min: 0,
      max: 30,
      step: 1,
      defaultValue: 10,
      helpText: '10% for simple gable roofs; 15% for hip or complex roofs.',
    },
  ],
  outputs: [
    {
      id: 'squares',
      label: 'Roofing Squares',
      unit: 'squares',
      format: 'number',
      primary: true,
      description: '1 square = 100 ft² of roof surface (includes pitch adjustment and waste)',
    },
    {
      id: 'bundles',
      label: 'Shingle Bundles',
      unit: 'bundles',
      format: 'number',
      description: 'Standard shingles — 3 bundles per square',
    },
    {
      id: 'roof_area_sqft',
      label: 'Roof Area',
      unit: 'ft²',
      format: 'area',
      description: 'Actual sloped roof surface area after pitch adjustment',
    },
    {
      id: 'roof_area_sqm',
      label: 'Roof Area',
      unit: 'm²',
      format: 'area',
    },
    {
      id: 'material_area_sqft',
      label: 'Material Area (with waste)',
      unit: 'ft²',
      format: 'area',
      description: 'Roof area plus waste factor — use this to order underlayment and ice-and-water shield',
    },
    {
      id: 'material_area_sqm',
      label: 'Material Area (with waste)',
      unit: 'm²',
      format: 'area',
    },
    {
      id: 'underlayment_sqft',
      label: 'Underlayment Area',
      unit: 'ft²',
      format: 'area',
      description: 'Same as material area — used to calculate felt or synthetic underlayment rolls needed',
    },
    {
      id: 'underlayment_sqm',
      label: 'Underlayment Area',
      unit: 'm²',
      format: 'area',
    },
    {
      id: 'pitch_factor',
      label: 'Pitch Adjustment Factor',
      unit: '×',
      format: 'number',
      description: 'Multiplier applied to the footprint area to get true sloped surface area',
    },
  ],
  formula,
  unitSystems: ['imperial', 'metric'],
  relatedCalculators: [
    'roof-pitch-calculator',
    'plywood-calculator',
    'stud-calculator',
  ],
  seo: {
    title: 'Roofing Calculator – Shingles, Squares & Bundles',
    description:
      'Free roofing calculator — enter roof length, width, pitch, and waste percentage to get roofing squares, shingle bundle count, and total material area for any residential or commercial roof.',
    h1: 'Roofing Calculator',
    focusKeyword: 'roofing calculator',
  },
  schema: {
    appType: 'Construction Calculator',
    features: [
      'Calculate roofing squares from length and width',
      'Automatic pitch adjustment for true sloped area',
      'Calculate shingle bundle count (3 bundles per square)',
      'Calculate underlayment area',
      'Adjustable waste percentage',
      'Supports all common roof pitches from flat to 16:12',
      'Imperial and metric support',
    ],
  },
  formulaSteps: [
    {
      label: 'Calculate roof footprint area',
      formula: 'Footprint (ft²) = Length (ft) × Width (ft)',
      description:
        'This is the horizontal projected area — the same as the ceiling area below. It does not account for slope.',
    },
    {
      label: 'Apply pitch adjustment factor',
      formula: 'Pitch factor = √(1 + (Pitch ÷ 12)²)',
      description:
        'The rafter factor converts footprint to actual sloped surface. A 6:12 pitch gives √(1 + 0.25) ≈ 1.118 — so the roof surface is 11.8% larger than the ceiling.',
    },
    {
      label: 'Calculate actual roof surface area',
      formula: 'Roof Area (ft²) = Footprint × Pitch factor',
      description:
        'This is the true sloped surface area that needs to be covered with shingles and underlayment.',
    },
    {
      label: 'Apply waste factor and calculate squares',
      formula: 'Material Area = Roof Area × (1 + Waste %)   |   Squares = Material Area ÷ 100',
      description:
        'One roofing square = 100 sq ft. Add 10% for simple gable roofs and 15% for hip or complex roofs with more diagonal cuts.',
    },
    {
      label: 'Calculate shingle bundles',
      formula: 'Bundles = ⌈Squares × 3⌉',
      description:
        'Standard 3-tab and most architectural shingles are sold in bundles covering approximately 33 ft² each — 3 bundles per square. Always round up to a whole bundle.',
    },
  ],
  faq: [
    {
      question: 'What is a roofing square?',
      answer:
        'A roofing square is a unit of area equal to 100 square feet of roof surface. It is the standard quantity used by roofing contractors and material suppliers when estimating shingles, underlayment, and other roofing materials. A 2,000 sq ft roof equals 20 squares. Knowing your square count lets you compare quotes from multiple contractors on equal terms.',
    },
    {
      question: 'How many bundles of shingles do I need per square?',
      answer:
        'Standard 3-tab asphalt shingles and most architectural/dimensional shingles require 3 bundles per square. Each bundle covers approximately 33 sq ft, so three bundles cover 100 sq ft (1 square). Some premium architectural shingles are heavier and come 4 bundles per square — always check the manufacturer\'s spec sheet for the specific product you are buying. This calculator uses the 3-bundle standard.',
    },
    {
      question: 'Why does roof pitch change the amount of shingles needed?',
      answer:
        'The footprint area (ceiling below) is not the same as the actual roof surface. A steep pitch creates a longer slope — more surface to cover with shingles. A 6:12 pitch adds about 11.8% more area than the footprint; a 12:12 pitch adds 41.4% more. This calculator applies the correct pitch adjustment factor (√(1 + (pitch/12)²)) so your material estimate is based on the true sloped area, not just the floor plan.',
    },
    {
      question: 'How much waste should I add for shingles?',
      answer:
        'Add 10% for simple rectangular gable roofs. Use 15% for hip roofs, which have diagonal cuts at all four corners. Use 15–20% for complex roofs with multiple valleys, dormers, or irregular geometry. Starter strips, ridge cap shingles, and waste from cutting around chimneys, skylights, and vents all consume additional material. It is far cheaper to order one extra bundle upfront than to make a second trip for a partial order.',
    },
    {
      question: 'Do I need the same amount of underlayment as shingles?',
      answer:
        'Yes — underlayment covers the same sloped roof area as shingles. Order the same number of squares of underlayment as your shingle estimate. Standard #15 felt comes in 4-square rolls; synthetic underlayment rolls vary (10 squares is common). Add 10% overlap between rolls when calculating how many rolls you need — most manufacturers specify 2–4 inch horizontal overlaps and 6-inch head-lap at vertical seams.',
    },
    {
      question: 'How do I measure a roof without getting on it?',
      answer:
        'Measure the building footprint from the ground (length and width). Use a pitch gauge, smartphone app, or the 12-inch level method to determine the pitch (see the Roof Pitch Calculator). Multiply footprint area by the pitch factor to get roof area. For a gable roof with two equal slopes, the full width × full length gives the total footprint. For hip roofs, the same formula works — the pitch factor accounts for the slope regardless of roof shape.',
    },
    {
      question: 'What is the difference between 3-tab and architectural shingles?',
      answer:
        '3-tab shingles are flat with cutouts giving three equal tabs per strip — lighter, thinner, and cheaper. Architectural (dimensional) shingles have a thicker, layered appearance that mimics wood shake or slate — heavier, longer-lasting (typically 30-year vs 20-year warranty), and the industry standard for new construction. Both use 3 bundles per square at standard coverage. Architectural shingles cost 20–30% more per square but offer better wind resistance and curb appeal.',
    },
    {
      question: 'How much does a roofing project cost?',
      answer:
        'Material costs for architectural asphalt shingles run $100–$160 per square (3 bundles × $35–$55 per bundle). A 20-square roof is $2,000–$3,200 in shingles alone. Add underlayment ($15–$25 per square), nails, ridge cap, and flashing. Professional installation adds $150–$350 per square for labor, bringing the total to $300–$500 per square installed. A 20-square roof: $6,000–$10,000 fully installed. Metal roofing runs $400–$900 per square installed. Always get three quotes — prices vary significantly by region and contractor.',
    },
  ],
};
