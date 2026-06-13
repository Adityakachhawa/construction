import type {
  CalculatorConfig,
  CalculatorInputMap,
  CalculatorOutputMap,
  UnitSystem,
} from './_types';

function formula(inputs: CalculatorInputMap, unitSystem: UnitSystem): CalculatorOutputMap {
  const quantity = Math.max(1, Math.round(Number(inputs.quantity ?? 1)));

  let thicknessIn: number;
  let widthIn: number;
  let lengthFt: number;

  if (unitSystem === 'imperial') {
    thicknessIn = Number(inputs.thickness_in ?? 1);
    widthIn     = Number(inputs.width_in ?? 6);
    lengthFt    = Number(inputs.length_ft ?? 8) + Number(inputs.length_in ?? 0) / 12;
  } else {
    thicknessIn = Number(inputs.thickness_mm ?? 25.4) / 25.4;
    widthIn     = Number(inputs.width_mm ?? 152.4) / 25.4;
    lengthFt    = Number(inputs.length_m ?? 2.4) * 3.28084;
  }

  if (thicknessIn <= 0 || widthIn <= 0 || lengthFt <= 0) {
    return { board_feet: 0, volume_cuft: 0, volume_m3: 0, linear_feet: 0, total_quantity: quantity };
  }

  // Board Feet = (T_in × W_in × L_ft × qty) ÷ 12
  const board_feet   = Math.round(thicknessIn * widthIn * lengthFt * quantity / 12 * 100) / 100;
  // 1 BF = 1/12 ft³  →  volume_cuft = board_feet / 12
  const volume_cuft  = Math.round(board_feet / 12 * 10000) / 10000;
  const volume_m3    = Math.round(volume_cuft * 0.0283168 * 100000) / 100000;
  const linear_feet  = Math.round(lengthFt * quantity * 10) / 10;

  return { board_feet, volume_cuft, volume_m3, linear_feet, total_quantity: quantity };
}

export const boardFootCalculator: CalculatorConfig = {
  slug: 'board-foot-calculator',
  name: 'Board Foot Calculator',
  category: 'framing',
  description:
    'Calculate board feet, lumber volume, and total wood quantity for woodworking, hardwood, framing, and timber projects. Enter exact thickness, width, and length to get board feet, cubic feet, cubic metres, and linear feet.',
  inputs: [
    // ── Imperial ──────────────────────────────────────
    {
      id: 'thickness_in',
      label: 'Thickness',
      type: 'number',
      unit: 'in',
      min: 0.125,
      max: 24,
      step: 0.125,
      defaultValue: 1,
      required: true,
      onlyIn: 'imperial',
      helpText: 'Use actual (surfaced) thickness — e.g. 0.75″ for ¾″ stock, 1.5″ for 2× dimensional lumber.',
    },
    {
      id: 'width_in',
      label: 'Width',
      type: 'number',
      unit: 'in',
      min: 0.5,
      max: 60,
      step: 0.125,
      defaultValue: 6,
      required: true,
      onlyIn: 'imperial',
      helpText: 'Actual width after milling. Hardwood is often sold in random widths — measure or specify your target width.',
    },
    {
      id: 'length_ft',
      label: 'Length',
      type: 'number',
      unit: 'ft',
      min: 1,
      max: 60,
      step: 1,
      defaultValue: 8,
      required: true,
      onlyIn: 'imperial',
      helpText: 'Board length in feet. Common lengths: 4, 6, 8, 10, 12, 16 ft.',
    },
    {
      id: 'length_in',
      label: 'Length (in)',
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
      id: 'quantity',
      label: 'Quantity',
      type: 'number',
      unit: 'pcs',
      min: 1,
      max: 10000,
      step: 1,
      defaultValue: 1,
      required: true,
      onlyIn: 'imperial',
      helpText: 'Number of boards or pieces of the same dimensions.',
    },
    // ── Metric ────────────────────────────────────────
    {
      id: 'thickness_mm',
      label: 'Thickness',
      type: 'number',
      unit: 'mm',
      min: 3,
      max: 600,
      step: 1,
      defaultValue: 25,
      defaultValueMetric: 25,
      required: true,
      onlyIn: 'metric',
      helpText: 'Actual thickness after surfacing. Common: 19 mm (¾″), 25 mm (1″), 38 mm (2× nominal).',
    },
    {
      id: 'width_mm',
      label: 'Width',
      type: 'number',
      unit: 'mm',
      min: 10,
      max: 1500,
      step: 1,
      defaultValue: 150,
      defaultValueMetric: 150,
      required: true,
      onlyIn: 'metric',
      helpText: 'Actual width in millimetres.',
    },
    {
      id: 'length_m',
      label: 'Length',
      type: 'number',
      unit: 'm',
      min: 0.3,
      max: 18,
      step: 0.1,
      defaultValue: 2.4,
      defaultValueMetric: 2.4,
      required: true,
      onlyIn: 'metric',
      helpText: 'Board length in metres. Common: 2.4, 3.0, 3.6, 4.2, 4.8 m.',
    },
    {
      id: 'quantity',
      label: 'Quantity',
      type: 'number',
      unit: 'pcs',
      min: 1,
      max: 10000,
      step: 1,
      defaultValue: 1,
      required: true,
      onlyIn: 'metric',
      helpText: 'Number of boards or pieces.',
    },
  ],
  outputs: [
    {
      id: 'board_feet',
      label: 'Total Board Feet',
      unit: 'BF',
      format: 'number',
      primary: true,
      description: '(Thickness ″ × Width ″ × Length ′ × Quantity) ÷ 12 — the standard lumber volume measure',
    },
    {
      id: 'volume_cuft',
      label: 'Total Volume',
      unit: 'ft³',
      format: 'volume',
      description: 'Board feet ÷ 12 — cubic feet of solid wood',
    },
    {
      id: 'volume_m3',
      label: 'Total Volume',
      unit: 'm³',
      format: 'volume',
      description: 'Volume in cubic metres (ft³ × 0.0283168)',
    },
    {
      id: 'linear_feet',
      label: 'Linear Feet',
      unit: 'ft',
      format: 'length',
      description: 'Total end-to-end length (length × quantity) — ignores cross-section',
    },
    {
      id: 'total_quantity',
      label: 'Total Pieces',
      unit: 'pcs',
      format: 'number',
      description: 'Confirmed piece count',
    },
  ],
  formula,
  unitSystems: ['imperial', 'metric'],
  relatedCalculators: [
    'lumber-calculator',
    'stud-calculator',
    'plywood-calculator',
    'roofing-calculator',
  ],
  seo: {
    title: 'Board Foot Calculator – Lumber Volume Estimator',
    description:
      'Calculate board feet, lumber volume, and wood quantity for woodworking, framing, and construction projects.',
    h1: 'Board Foot Calculator',
    focusKeyword: 'board foot calculator',
  },
  schema: {
    appType: 'Construction Calculator',
    features: [
      'Calculate board feet from thickness, width, and length',
      'Total lumber volume in cubic feet and cubic metres',
      'Linear feet output for length-based pricing',
      'Supports any board size including hardwood and timber',
      'Imperial and metric unit systems',
      'Multi-piece quantity calculation',
    ],
  },
  formulaSteps: [
    {
      label: 'Calculate board feet',
      formula: 'Board Feet = (Thickness (in) × Width (in) × Length (ft) × Quantity) ÷ 12',
      description:
        'A board foot is the volume of a piece 1 inch thick, 12 inches wide, and 1 foot long (144 in³). Dividing by 12 converts the inch-inch-foot product into that unit. Always use actual (surfaced) dimensions — nominal sizes like "2×4" are larger than the real piece.',
    },
    {
      label: 'Calculate volume in cubic feet',
      formula: 'Volume (ft³) = Board Feet ÷ 12',
      description:
        'Since a board foot equals 1/12 of a cubic foot, dividing board feet by 12 gives the true solid-wood volume. Useful for structural calculations, weight estimation (weight = volume × species density), and timber pricing by volume.',
    },
    {
      label: 'Convert to cubic metres',
      formula: 'Volume (m³) = Volume (ft³) × 0.0283168',
      description:
        'One cubic foot equals 0.0283168 cubic metres. European and international timber merchants commonly price by m³ — use this conversion when sourcing materials internationally.',
    },
    {
      label: 'Calculate linear feet',
      formula: 'Linear Feet = Length (ft) × Quantity',
      description:
        'Linear feet measures total end-to-end length only, ignoring width and thickness. Use it when comparing prices for trim, moulding, or any uniform stock sold by the lineal foot rather than by board foot or piece.',
    },
  ],
  faq: [
    {
      question: 'What is a board foot?',
      answer:
        'A board foot (BF or bd ft) is a unit of lumber volume equal to a piece of wood 1 inch thick, 12 inches wide, and 1 foot long — 144 cubic inches in total. It is the standard measure used by lumber dealers and hardwood suppliers to price dimensional lumber, hardwood slabs, and timber. To find board feet: multiply thickness (inches) × width (inches) × length (feet), then divide by 12. A single piece of 1″ × 6″ × 8′ lumber contains 4 board feet.',
    },
    {
      question: 'How is lumber priced by the board foot?',
      answer:
        'Hardwood dealers typically quote a price per board foot (e.g. $5.50/BF for 4/4 red oak). To estimate cost: multiply total board feet by the price per BF. Softwood framing lumber is more often priced per linear foot or per piece, but board feet pricing is common at sawmills and for specialty or appearance-grade stock. Always confirm whether the price is per nominal or actual board foot — some dealers use nominal (rough) thickness, which gives a higher BF count than actual (surfaced) dimensions.',
    },
    {
      question: 'How do I calculate board feet for hardwood?',
      answer:
        'Hardwood is commonly sold in 4/4 (1″), 5/4 (1.25″), 6/4 (1.5″), 8/4 (2″), and 12/4 (3″) thicknesses — these are rough-sawn (nominal) thicknesses. After surfacing, 4/4 finishes to about 13/16″ and 8/4 to about 1¾″. For board foot calculation, use rough (nominal) thickness when buying from a dealer who quotes BF on rough stock; use actual surfaced thickness when calculating yield from boards you already have. Enter your dimensions in this calculator and it will return the exact BF count.',
    },
    {
      question: 'How many board feet do I need to estimate for a project?',
      answer:
        'First list every part in your cut list with thickness, width, and length. Calculate the BF for each part, sum them, then add a waste factor: 10–15% for straight-grain, clear material with simple cuts; 20–30% for figured or knotty stock where you route around defects; 35–40% for wide slabs where grain matching drives significant drop. For furniture projects, a 20% waste allowance is a reliable starting point. Always buy a few extra boards — wood lots vary in color and figure, and a matching board may not be available later.',
    },
    {
      question: 'How do I convert board feet to metric?',
      answer:
        'One board foot equals 144 cubic inches = 2,359.7 cm³ ≈ 0.002360 m³. To convert a lumber order: multiply total board feet by 0.002360 to get cubic metres. If you are working entirely in metric, calculate volume directly: thickness (m) × width (m) × length (m) × quantity = volume (m³). This calculator performs both conversions automatically — enter metric dimensions and it returns BF alongside m³.',
    },
    {
      question: 'What are common lumber sizes and their board feet?',
      answer:
        '1×4×8: 2.67 BF | 1×6×8: 4 BF | 1×8×8: 5.33 BF | 2×4×8: 5.33 BF (nominal) / 3.5 BF (actual 1.5×3.5) | 2×6×8: 8 BF (nominal) / 5.5 BF (actual) | 2×8×8: 10.67 BF (nominal) / 7.25 BF (actual) | 4×4×8: 10.67 BF (nominal). The discrepancy between nominal and actual dimensions means actual BF is always less than nominal BF for dimensional lumber — use actual dimensions for accurate material estimates.',
    },
    {
      question: 'Should I add a waste factor when calculating board feet?',
      answer:
        'Yes for most projects. Raw board foot calculations assume 100% yield — no kerf, no defects, no off-cuts. In practice, add: 10% for clear, straight-grain softwood with minimal cross-cuts; 15–20% for hardwood projects with varied part sizes; 25–35% when working with knotty, figured, or live-edge slabs where you must route around defects; 40%+ for small parts from wide boards where the cut list leaves large unusable off-cuts. When buying multiple species or matching grain patterns, even more. This calculator gives you the net BF — apply your waste factor on top before ordering.',
    },
    {
      question: 'What is the difference between a board foot and a cubic foot?',
      answer:
        'A cubic foot is a standard volume unit: 12″ × 12″ × 12″ = 1,728 cubic inches. A board foot is a lumber-specific volume unit: 1″ × 12″ × 12″ = 144 cubic inches — exactly 1/12 of a cubic foot. So 12 board feet = 1 cubic foot. The board foot exists because lumber is almost always much thinner than it is wide and long, making cubic feet an inconveniently small number for typical boards. A 1×6×8 board contains 4 BF but only 0.33 ft³ — the BF number is more intuitive for estimating and pricing.',
    },
  ],
};
