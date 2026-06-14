import type {
  CalculatorConfig,
  CalculatorInputMap,
  CalculatorOutputMap,
  UnitSystem,
} from './_types';

// Rafter/pitch factors: √(1 + (pitch/12)²)
const PITCH_FACTORS: Record<string, number> = {
  '0':  1.000,
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

// ~2 fasteners per sq ft is the standard for exposed-fastener metal roofing
const FASTENERS_PER_SQFT = 2;
const FASTENERS_PER_SQM  = FASTENERS_PER_SQFT / 0.092903;

function getPitchFactor(pitchKey: string): number {
  return PITCH_FACTORS[pitchKey] ?? 1.118;
}

function formula(inputs: CalculatorInputMap, unitSystem: UnitSystem): CalculatorOutputMap {
  const pitchKey    = String(inputs.pitch ?? '6');
  const wastePct    = Number(inputs.waste_pct ?? 10) / 100;
  const pitchFactor = getPitchFactor(pitchKey);

  if (unitSystem === 'imperial') {
    const lengthFt       = Number(inputs.length_ft ?? 40) + Number(inputs.length_in ?? 0) / 12;
    const widthFt        = Number(inputs.width_ft  ?? 30) + Number(inputs.width_in  ?? 0) / 12;
    const panelCoverIn   = Number(inputs.panel_cover_in ?? 36);   // coverage width in inches
    const panelLengthFt  = Number(inputs.panel_length_ft ?? 12) + Number(inputs.panel_length_in ?? 0) / 12;

    if (lengthFt <= 0 || widthFt <= 0 || panelCoverIn <= 0 || panelLengthFt <= 0) {
      return { panels: 0, panel_cols: 0, panel_rows: 0, roof_area_sqft: 0, roof_area_sqm: 0, material_area_sqft: 0, material_area_sqm: 0, fasteners: 0, pitch_factor: pitchFactor };
    }

    const footprint_sqft    = lengthFt * widthFt;
    const roof_area_sqft    = Math.round(footprint_sqft * pitchFactor * 10) / 10;
    const material_area_sqft = Math.round(roof_area_sqft * (1 + wastePct) * 10) / 10;

    // Slope-adjusted rafter length per panel run
    const slopeWidthFt   = (widthFt / 2) * pitchFactor; // one slope side
    const panelCoverFt   = panelCoverIn / 12;
    // Panels per slope: columns = ⌈length / panel_cover⌉, rows = ⌈slopeWidth / panel_length⌉
    const panelCols      = Math.ceil(lengthFt / panelCoverFt);
    const panelRows      = Math.ceil(slopeWidthFt / panelLengthFt);
    const panels         = panelCols * panelRows * 2; // × 2 for both slopes

    const fasteners      = Math.ceil(material_area_sqft * FASTENERS_PER_SQFT);

    return {
      panels,
      panel_cols: panelCols,
      panel_rows: panelRows,
      roof_area_sqft,
      roof_area_sqm: Math.round(roof_area_sqft * 0.092903 * 100) / 100,
      material_area_sqft,
      material_area_sqm: Math.round(material_area_sqft * 0.092903 * 100) / 100,
      fasteners,
      pitch_factor: Math.round(pitchFactor * 1000) / 1000,
    };
  } else {
    const lengthM       = Number(inputs.length_m ?? 12);
    const widthM        = Number(inputs.width_m  ?? 9);
    const panelCoverMm  = Number(inputs.panel_cover_mm ?? 914);  // ~36 in
    const panelLengthM  = Number(inputs.panel_length_m ?? 3.6);

    if (lengthM <= 0 || widthM <= 0 || panelCoverMm <= 0 || panelLengthM <= 0) {
      return { panels: 0, panel_cols: 0, panel_rows: 0, roof_area_sqft: 0, roof_area_sqm: 0, material_area_sqft: 0, material_area_sqm: 0, fasteners: 0, pitch_factor: pitchFactor };
    }

    const footprint_sqm    = lengthM * widthM;
    const roof_area_sqm    = Math.round(footprint_sqm * pitchFactor * 100) / 100;
    const material_area_sqm = Math.round(roof_area_sqm * (1 + wastePct) * 100) / 100;

    const slopeWidthM    = (widthM / 2) * pitchFactor;
    const panelCoverM    = panelCoverMm / 1000;
    const panelCols      = Math.ceil(lengthM / panelCoverM);
    const panelRows      = Math.ceil(slopeWidthM / panelLengthM);
    const panels         = panelCols * panelRows * 2;

    const fasteners      = Math.ceil(material_area_sqm * FASTENERS_PER_SQM);

    return {
      panels,
      panel_cols: panelCols,
      panel_rows: panelRows,
      roof_area_sqm,
      roof_area_sqft: Math.round(roof_area_sqm * 10.7639 * 10) / 10,
      material_area_sqm,
      material_area_sqft: Math.round(material_area_sqm * 10.7639 * 10) / 10,
      fasteners,
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

export const metalRoofingCalculator: CalculatorConfig = {
  slug: 'metal-roofing-calculator',
  name: 'Metal Roofing Calculator',
  category: 'framing',
  description:
    'Calculate metal roofing panel count, roof area, and fastener quantities. Enter roof dimensions, panel coverage width, panel length, pitch, and waste percentage for accurate metal roofing estimates.',
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
      helpText: 'Horizontal ridge length — the long dimension of the roof.',
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
      helpText: 'Full horizontal building width (both slopes combined).',
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
    {
      id: 'panel_cover_in',
      label: 'Panel Coverage Width',
      type: 'number',
      unit: 'in',
      min: 6,
      max: 72,
      step: 0.5,
      defaultValue: 36,
      required: true,
      onlyIn: 'imperial',
      helpText: 'The net coverage width of one panel after lapping. Common: 36 in (corrugated), 12–16 in (standing seam).',
    },
    {
      id: 'panel_length_ft',
      label: 'Panel Length',
      type: 'number',
      unit: 'ft',
      min: 1,
      max: 60,
      step: 1,
      defaultValue: 12,
      required: true,
      onlyIn: 'imperial',
      helpText: 'Length of each panel along the slope (eave to ridge direction).',
    },
    {
      id: 'panel_length_in',
      label: 'Panel Length (in)',
      type: 'number',
      unit: 'in',
      min: 0,
      max: 11,
      step: 1,
      defaultValue: 0,
      onlyIn: 'imperial',
      groupWith: 'panel_length_ft',
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
      helpText: 'Horizontal ridge length — the long dimension of the roof.',
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
      helpText: 'Full horizontal building width (both slopes combined).',
    },
    {
      id: 'panel_cover_mm',
      label: 'Panel Coverage Width',
      type: 'number',
      unit: 'mm',
      min: 150,
      max: 1800,
      step: 5,
      defaultValue: 914,
      defaultValueMetric: 914,
      required: true,
      onlyIn: 'metric',
      helpText: 'Net coverage width per panel after lapping. Common: 914 mm (corrugated), 300–400 mm (standing seam).',
    },
    {
      id: 'panel_length_m',
      label: 'Panel Length',
      type: 'number',
      unit: 'm',
      min: 0.3,
      max: 18,
      step: 0.1,
      defaultValue: 3.6,
      defaultValueMetric: 3.6,
      required: true,
      onlyIn: 'metric',
      helpText: 'Length of each panel along the slope.',
    },
    // ── Shared ────────────────────────────────────────
    {
      id: 'pitch',
      label: 'Roof Pitch',
      type: 'select',
      options: PITCH_OPTIONS,
      defaultValue: '6',
      required: true,
      helpText: 'Steeper pitches increase the true sloped area above the floor plan footprint.',
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
      helpText: '10% for simple gable roofs; 15% for hips, valleys, or complex layouts.',
    },
  ],
  outputs: [
    {
      id: 'panels',
      label: 'Panels Required',
      unit: 'panels',
      format: 'number',
      primary: true,
      description: 'Total panel count for both slopes including waste rows',
    },
    {
      id: 'panel_cols',
      label: 'Panels per Row (along ridge)',
      unit: 'panels',
      format: 'number',
      description: 'Number of panel columns running parallel to the ridge',
    },
    {
      id: 'panel_rows',
      label: 'Panel Rows (per slope)',
      unit: 'rows',
      format: 'number',
      description: 'Number of panel rows running eave-to-ridge on each slope',
    },
    {
      id: 'roof_area_sqft',
      label: 'Roof Area',
      unit: 'ft²',
      format: 'area',
      description: 'True sloped roof surface area after pitch adjustment',
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
      description: 'Roof area plus waste — use for ordering underlayment and trim',
    },
    {
      id: 'material_area_sqm',
      label: 'Material Area (with waste)',
      unit: 'm²',
      format: 'area',
    },
    {
      id: 'fasteners',
      label: 'Fasteners Required',
      unit: 'screws',
      format: 'number',
      description: 'Estimated screw count at 2 per sq ft for exposed-fastener panels',
    },
    {
      id: 'pitch_factor',
      label: 'Pitch Adjustment Factor',
      unit: '×',
      format: 'number',
      description: 'Multiplier converting footprint area to true sloped surface area',
    },
  ],
  formula,
  unitSystems: ['imperial', 'metric'],
  relatedCalculators: [
    'roofing-calculator',
    'roof-pitch-calculator',
    'rafter-calculator',
    'plywood-calculator',
  ],
  seo: {
    title: 'Metal Roofing Calculator – Panels, Area & Fasteners',
    description:
      'Free metal roofing calculator — enter roof length, width, panel coverage width, panel length, pitch, and waste percentage to get panel count, roof area, and fastener quantities for any metal roofing project.',
    h1: 'Metal Roofing Calculator',
    focusKeyword: 'metal roofing calculator',
  },
  schema: {
    appType: 'Construction Calculator',
    features: [
      'Calculate metal roofing panel count',
      'Automatic pitch adjustment for true sloped area',
      'Supports any panel coverage width (corrugated, standing seam, R-panel)',
      'Calculate panel columns and rows per slope',
      'Estimate fastener (screw) quantity',
      'Adjustable waste percentage',
      'Imperial and metric support',
    ],
  },
  formulaSteps: [
    {
      label: 'Calculate roof footprint area',
      formula: 'Footprint (ft²) = Length (ft) × Width (ft)',
      description:
        'The horizontal projected area — same as the ceiling below. Does not account for slope.',
    },
    {
      label: 'Apply pitch adjustment factor',
      formula: 'Pitch factor = √(1 + (Pitch ÷ 12)²)',
      description:
        'Converts footprint to true sloped surface. A 6:12 pitch gives √(1 + 0.25) ≈ 1.118 — the actual roof surface is 11.8% larger than the floor plan.',
    },
    {
      label: 'Calculate true roof area and material area',
      formula: 'Roof Area = Footprint × Pitch factor   |   Material Area = Roof Area × (1 + Waste %)',
      description:
        'Add 10% waste for simple gable roofs; 15% for hip roofs or layouts with valleys, dormers, and diagonal cuts.',
    },
    {
      label: 'Calculate panel count',
      formula: 'Cols = ⌈Length ÷ Panel coverage width⌉   |   Rows = ⌈Slope width ÷ Panel length⌉   |   Panels = Cols × Rows × 2',
      description:
        'Slope width = (Building width ÷ 2) × Pitch factor — the true sloped distance from eave to ridge on one side. Multiply columns × rows × 2 slopes for the total panel count.',
    },
    {
      label: 'Estimate fasteners',
      formula: 'Fasteners = ⌈Material Area (ft²) × 2⌉',
      description:
        'Standard exposed-fastener metal roofing uses approximately 2 screws per square foot through the panel ribs into the purlins. Add 10–15% for ridge cap, trim, and overlap fasteners.',
    },
  ],
  faq: [
    {
      question: 'How many metal roofing panels do I need?',
      answer:
        'Divide your ridge length by the panel coverage width to get the number of panel columns. Divide the sloped rafter length (run × pitch factor) by the panel length to get rows per slope. Multiply columns × rows × 2 for both slopes. For a 40 × 30 ft building at 6:12 pitch with 36-inch (3 ft) panels: columns = ⌈40 ÷ 3⌉ = 14, slope length = 15 × 1.118 = 16.77 ft, rows = ⌈16.77 ÷ 12⌉ = 2, panels = 14 × 2 × 2 = 56. This calculator handles all the pitch adjustment and rounding automatically.',
    },
    {
      question: 'What is panel coverage width and why does it matter?',
      answer:
        'Panel coverage width is the net width each panel covers after the overlap with the adjacent panel is accounted for. A 39-inch corrugated panel with a 1.5-inch overlap on each edge has a net coverage of about 36 inches. Standing seam panels typically cover 12–16 inches net. Using the gross panel width instead of the net coverage width will result in underordering — always check the manufacturer\'s stated coverage width, not the overall panel dimension.',
    },
    {
      question: 'What types of metal roofing panels are there?',
      answer:
        'The three most common residential and light-commercial types are: (1) Exposed-fastener corrugated or ribbed panels — screws visible through the panel face, 26–29 gauge steel, widest coverage, lowest cost. (2) Standing seam — hidden fasteners clipped to the structure, seams folded vertically between panels, premium look, best water resistance, longer lifespan. (3) R-panel or PBR panel — exposed fastener with a major rib profile, common for agricultural and commercial buildings. This calculator works for all panel types — enter the correct coverage width for your specific product.',
    },
    {
      question: 'How much pitch does metal roofing require?',
      answer:
        'Exposed-fastener corrugated panels require a minimum 3:12 pitch (some manufacturers allow 1:12 with extra sealant at laps). Standing seam panels can go as low as ½:12 to 1:12 with proper seaming and underlayment. Metal roofing generally performs well at lower pitches than asphalt shingles because the seams shed water mechanically rather than relying on gravity alone. Always consult the specific product\'s installation manual for minimum slope requirements.',
    },
    {
      question: 'How many screws does metal roofing use?',
      answer:
        'Exposed-fastener metal roofing typically uses 2 screws per square foot — one screw at each major rib or corrugation valley per purlin row. Purlin spacing determines how many rows of fasteners run across the slope. For a 1,000 sq ft roof: approximately 2,000 screws for the field panels, plus extras for ridge cap (about 1 screw per linear foot each side), trim, and overlap sealing. Order 10–15% extra screws — running short delays installation.',
    },
    {
      question: 'Do I need underlayment under metal roofing?',
      answer:
        'Yes — most manufacturers require or recommend underlayment under metal roofing for moisture and condensation control, sound dampening, and as a secondary water barrier. Use synthetic underlayment (not #15 felt) rated for metal roofing; felt can off-gas oils that corrode galvanized coatings. Self-adhering ice-and-water shield is required at eaves in cold climates (typically the first 24 inches past the interior wall line). Underlayment area equals the same square footage as your roof area calculation.',
    },
    {
      question: 'How long does metal roofing last?',
      answer:
        'Painted steel metal roofing typically carries a 40-year paint warranty and a 30–50 year structural warranty. Galvalume steel (aluminum-zinc alloy coating) lasts 40–70 years in most climates. Aluminum metal roofing lasts 50+ years and never rusts. Standing seam metal roofs regularly last 50–70 years with minimal maintenance. Compare this to 20–30 years for architectural asphalt shingles. The higher upfront cost of metal roofing is frequently offset by its longer lifespan and lower maintenance over the building\'s life.',
    },
    {
      question: 'How much does metal roofing cost per square?',
      answer:
        'Exposed-fastener corrugated or ribbed panels cost $75–$150 per square (100 ft²) for materials. Standing seam metal roofing runs $150–$350 per square in materials. Installed costs are higher: $200–$400 per square for corrugated, $400–$900 per square for standing seam, depending on region, pitch complexity, and contractor. A 20-square roof is $4,000–$18,000 installed depending on the product and location. Get at least three quotes — metal roofing pricing varies more than asphalt shingles.',
    },
  ],
};
