import type {
  CalculatorConfig,
  CalculatorInputMap,
  CalculatorOutputMap,
  UnitSystem,
} from './_types';

// Nominal → actual dimensions in inches
const PRESET_SIZES: Record<string, { thickness: number; width: number }> = {
  '2x4':    { thickness: 1.5,  width: 3.5  },
  '2x6':    { thickness: 1.5,  width: 5.5  },
  '2x8':    { thickness: 1.5,  width: 7.25 },
  '2x10':   { thickness: 1.5,  width: 9.25 },
  '2x12':   { thickness: 1.5,  width: 11.25 },
  'custom': { thickness: 1.5,  width: 3.5  }, // overridden by inputs
};

function formula(inputs: CalculatorInputMap, unitSystem: UnitSystem): CalculatorOutputMap {
  const wastePct      = Number(inputs.waste_pct ?? 10) / 100;
  const costPerBoard  = Number(inputs.cost_per_board ?? 0);

  if (unitSystem === 'imperial') {
    const size         = String(inputs.lumber_size ?? '2x4');
    const preset       = PRESET_SIZES[size] ?? PRESET_SIZES['2x4'];
    const thicknessIn  = size === 'custom'
      ? Number(inputs.thickness_in ?? preset.thickness)
      : preset.thickness;
    const widthIn      = size === 'custom'
      ? Number(inputs.width_in ?? preset.width)
      : preset.width;
    const lengthFt     = Number(inputs.length_ft ?? 8) + Number(inputs.length_in ?? 0) / 12;
    const quantity     = Math.max(1, Math.round(Number(inputs.quantity ?? 10)));

    if (lengthFt <= 0) {
      return { total_boards: 0, linear_feet: 0, linear_m: 0, board_feet: 0, volume_cuft: 0, volume_m3: 0, cost: 0 };
    }

    const total_boards    = Math.ceil(quantity * (1 + wastePct));
    const linear_feet     = Math.round(total_boards * lengthFt * 10) / 10;
    // Board feet = (thickness_in × width_in × length_ft × boards) / 12
    const board_feet      = Math.round(thicknessIn * widthIn * lengthFt * total_boards / 12 * 100) / 100;
    const volume_cuft     = Math.round(board_feet / 12 * 1000) / 1000;
    const cost            = costPerBoard > 0 ? Math.round(total_boards * costPerBoard * 100) / 100 : 0;

    return {
      total_boards,
      linear_feet,
      linear_m: Math.round(linear_feet * 0.3048 * 10) / 10,
      board_feet,
      volume_cuft,
      volume_m3: Math.round(volume_cuft * 0.0283168 * 10000) / 10000,
      cost,
    };
  } else {
    const widthMm      = Number(inputs.width_mm ?? 89);   // 2×4 actual
    const thicknessMm  = Number(inputs.thickness_mm ?? 38);
    const lengthM      = Number(inputs.length_m ?? 2.4);
    const quantity     = Math.max(1, Math.round(Number(inputs.quantity ?? 10)));

    if (lengthM <= 0) {
      return { total_boards: 0, linear_feet: 0, linear_m: 0, board_feet: 0, volume_cuft: 0, volume_m3: 0, cost: 0 };
    }

    const total_boards = Math.ceil(quantity * (1 + wastePct));
    const linear_m     = Math.round(total_boards * lengthM * 10) / 10;
    // Board feet (universal): convert mm to inches first
    const thicknessIn  = thicknessMm / 25.4;
    const widthIn      = widthMm / 25.4;
    const lengthFt     = lengthM * 3.28084;
    const board_feet   = Math.round(thicknessIn * widthIn * lengthFt * total_boards / 12 * 100) / 100;
    const volume_m3    = Math.round((widthMm / 1000) * (thicknessMm / 1000) * lengthM * total_boards * 10000) / 10000;
    const cost         = costPerBoard > 0 ? Math.round(total_boards * costPerBoard * 100) / 100 : 0;

    return {
      total_boards,
      linear_m,
      linear_feet: Math.round(linear_m / 0.3048 * 10) / 10,
      board_feet,
      volume_m3,
      volume_cuft: Math.round(volume_m3 / 0.0283168 * 1000) / 1000,
      cost,
    };
  }
}

export const lumberCalculator: CalculatorConfig = {
  slug: 'lumber-calculator',
  name: 'Lumber Calculator',
  category: 'framing',
  description:
    'Calculate lumber quantities, board feet, linear feet, and project cost for any framing or carpentry project. Supports common sizes (2×4 through 2×12) and custom dimensions with adjustable waste percentage.',
  inputs: [
    // ── Imperial ──────────────────────────────────────
    {
      id: 'lumber_size',
      label: 'Lumber Size',
      type: 'select',
      options: [
        { value: '2x4',    label: '2×4 (1.5″ × 3.5″ actual)' },
        { value: '2x6',    label: '2×6 (1.5″ × 5.5″ actual)' },
        { value: '2x8',    label: '2×8 (1.5″ × 7.25″ actual)' },
        { value: '2x10',   label: '2×10 (1.5″ × 9.25″ actual)' },
        { value: '2x12',   label: '2×12 (1.5″ × 11.25″ actual)' },
        { value: 'custom', label: 'Custom dimensions' },
      ],
      defaultValue: '2x4',
      required: true,
      onlyIn: 'imperial',
      helpText: 'Nominal sizes — actual dimensions are smaller due to milling.',
    },
    {
      id: 'thickness_in',
      label: 'Thickness',
      type: 'number',
      unit: 'in',
      min: 0.5,
      max: 24,
      step: 0.25,
      defaultValue: 1.5,
      required: true,
      onlyIn: 'imperial',
      helpText: 'Actual (not nominal) thickness. Only used when "Custom" is selected.',
    },
    {
      id: 'width_in',
      label: 'Width',
      type: 'number',
      unit: 'in',
      min: 0.5,
      max: 24,
      step: 0.25,
      defaultValue: 3.5,
        required: true,
        onlyIn: 'imperial',
      helpText: 'Actual (not nominal) width. Only used when "Custom" is selected.',
    },
    {
      id: 'length_ft',
      label: 'Board Length',
      type: 'number',
      unit: 'ft',
      min: 1,
      max: 60,
      step: 1,
      defaultValue: 8,
      required: true,
      onlyIn: 'imperial',
      helpText: 'Standard lengths: 8, 10, 12, 14, 16, 20 ft.',
    },
    {
      id: 'length_in',
      label: 'Board Length (in)',
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
      label: 'Number of Boards',
      type: 'number',
      unit: 'boards',
      min: 1,
      max: 10000,
      step: 1,
      defaultValue: 10,
      required: true,
      onlyIn: 'imperial',
      helpText: 'Net boards needed before waste. The calculator adds your waste % on top.',
    },
    {
      id: 'waste_pct',
      label: 'Waste %',
      type: 'number',
      unit: '%',
      min: 0,
      max: 50,
      step: 1,
      defaultValue: 10,
      onlyIn: 'imperial',
      helpText: '10% for standard framing; 15–20% for diagonal or complex layouts.',
    },
    {
      id: 'cost_per_board',
      label: 'Cost per Board',
      type: 'number',
      unit: '$',
      min: 0,
      max: 10000,
      step: 0.01,
      defaultValue: 0,
      onlyIn: 'imperial',
      helpText: 'Optional. Enter the price per board to get a total material cost estimate.',
    },
    // ── Metric ────────────────────────────────────────
    {
      id: 'thickness_mm',
      label: 'Thickness',
      type: 'number',
      unit: 'mm',
      min: 10,
      max: 600,
      step: 1,
      defaultValue: 38,
      defaultValueMetric: 38,
      required: true,
      onlyIn: 'metric',
      helpText: 'Common: 38 mm (≈2″ nominal), 19 mm (≈1″ nominal).',
    },
    {
      id: 'width_mm',
      label: 'Width',
      type: 'number',
      unit: 'mm',
      min: 10,
      max: 600,
      step: 1,
      defaultValue: 89,
      defaultValueMetric: 89,
      required: true,
      onlyIn: 'metric',
      helpText: 'Common: 89 mm (≈2×4), 140 mm (≈2×6), 184 mm (≈2×8).',
    },
    {
      id: 'length_m',
      label: 'Board Length',
      type: 'number',
      unit: 'm',
      min: 0.3,
      max: 18,
      step: 0.1,
      defaultValue: 2.4,
      defaultValueMetric: 2.4,
      required: true,
      onlyIn: 'metric',
      helpText: 'Common: 2.4, 3.0, 3.6, 4.2, 4.8, 6.0 m.',
    },
    {
      id: 'quantity',
      label: 'Number of Boards',
      type: 'number',
      unit: 'boards',
      min: 1,
      max: 10000,
      step: 1,
      defaultValue: 10,
      required: true,
      onlyIn: 'metric',
      helpText: 'Net boards needed before waste.',
    },
    {
      id: 'waste_pct',
      label: 'Waste %',
      type: 'number',
      unit: '%',
      min: 0,
      max: 50,
      step: 1,
      defaultValue: 10,
      onlyIn: 'metric',
      helpText: '10% for standard framing; 15–20% for diagonal or complex layouts.',
    },
    {
      id: 'cost_per_board',
      label: 'Cost per Board',
      type: 'number',
      unit: '$',
      min: 0,
      max: 10000,
      step: 0.01,
      defaultValue: 0,
      onlyIn: 'metric',
      helpText: 'Optional. Enter the price per board to get a total material cost estimate.',
    },
  ],
  outputs: [
    {
      id: 'total_boards',
      label: 'Total Boards Required',
      unit: 'boards',
      format: 'number',
      primary: true,
      description: 'Quantity including waste factor — order this many boards',
    },
    {
      id: 'board_feet',
      label: 'Total Board Feet',
      unit: 'BF',
      format: 'number',
      description: 'Volume measure: (thickness_in × width_in × length_ft × boards) ÷ 12',
    },
    {
      id: 'linear_feet',
      label: 'Total Linear Feet',
      unit: 'ft',
      format: 'length',
      description: 'Total end-to-end board length if laid in a line',
    },
    {
      id: 'linear_m',
      label: 'Total Linear Metres',
      unit: 'm',
      format: 'length',
    },
    {
      id: 'volume_cuft',
      label: 'Lumber Volume',
      unit: 'ft³',
      format: 'volume',
      description: 'Total wood volume in cubic feet (board feet ÷ 12)',
    },
    {
      id: 'volume_m3',
      label: 'Lumber Volume',
      unit: 'm³',
      format: 'volume',
    },
    {
      id: 'cost',
      label: 'Estimated Cost',
      unit: '$',
      format: 'currency',
      description: 'Total boards × cost per board (only shown when cost per board is entered)',
    },
  ],
  formula,
  unitSystems: ['imperial', 'metric'],
  relatedCalculators: [
    'stud-calculator',
    'plywood-calculator',
    'rafter-calculator',
    'roofing-calculator',
  ],
  seo: {
    title: 'Lumber Calculator – Board Feet, Linear Feet & Cost Estimator',
    description:
      'Free lumber calculator — enter board size, length, and quantity to get total boards, board feet, linear feet, and project cost. Supports 2×4 through 2×12 and custom dimensions with waste factor.',
    h1: 'Lumber Calculator',
    focusKeyword: 'lumber calculator',
  },
  schema: {
    appType: 'Construction Calculator',
    features: [
      'Calculate board count with waste adjustment',
      'Calculate total board feet (volume measure)',
      'Calculate total linear feet',
      'Supports 2×4, 2×6, 2×8, 2×10, 2×12, and custom dimensions',
      'Optional project cost estimate',
      'Lumber volume in cubic feet and cubic meters',
      'Imperial and metric support',
    ],
  },
  formulaSteps: [
    {
      label: 'Apply waste factor to board count',
      formula: 'Total boards = ⌈Quantity × (1 + Waste %)⌉',
      description:
        'Always round up — you cannot buy a fraction of a board. Use 10% for straight cuts, 15–20% for diagonal layouts or complex framing with many short pieces.',
    },
    {
      label: 'Calculate total linear feet',
      formula: 'Linear feet = Total boards × Board length (ft)',
      description:
        'Linear feet measures length only — it ignores width and thickness. Used to compare prices when buying lumber by the linear foot rather than per board.',
    },
    {
      label: 'Calculate board feet',
      formula: 'Board feet = (Thickness (in) × Width (in) × Length (ft) × Boards) ÷ 12',
      description:
        'A board foot is 1 inch thick × 12 inches wide × 1 foot long = 144 cubic inches of wood. It is the standard volume unit used by lumber dealers. Use actual dimensions (not nominal) for accurate results.',
    },
    {
      label: 'Calculate lumber volume',
      formula: 'Volume (ft³) = Board feet ÷ 12   |   Volume (m³) = Volume (ft³) × 0.0283168',
      description:
        'Convert board feet to cubic feet or cubic metres for structural load calculations or when specifying quantities to a timber merchant who uses volume pricing.',
    },
    {
      label: 'Estimate project cost',
      formula: 'Cost = Total boards × Cost per board',
      description:
        'Multiply the waste-adjusted board count by your per-board price to get total material cost. For cost per board foot instead: Cost = Board feet × (price per BF). Lumber prices vary by species, grade, and region — always verify current local pricing.',
    },
  ],
  faq: [
    {
      question: 'What is a board foot of lumber?',
      answer:
        'A board foot (BF) is a volume measure equal to a piece of lumber 1 inch thick, 12 inches wide, and 1 foot long — or 144 cubic inches of wood. It is the standard unit used by lumber yards and timber merchants to price dimensional lumber. To calculate board feet: (thickness in inches × width in inches × length in feet) ÷ 12. A 2×4 that is 8 feet long contains (1.5 × 3.5 × 8) ÷ 12 = 3.5 board feet.',
    },
    {
      question: 'How many board feet are in a 2×4?',
      answer:
        'The board feet in a 2×4 depends on its length. Using actual dimensions (1.5″ × 3.5″): an 8-foot 2×4 = (1.5 × 3.5 × 8) ÷ 12 = 3.5 BF; a 10-footer = 4.375 BF; a 12-footer = 5.25 BF; a 16-footer = 7 BF. Note: some suppliers calculate board feet from nominal dimensions (2″ × 4″), giving slightly different results — a 2×4×8 would be (2 × 4 × 8) ÷ 12 = 5.33 BF. This calculator uses actual dimensions for accuracy.',
    },
    {
      question: 'What is the difference between board feet and linear feet?',
      answer:
        'Linear feet (LF) measures only the length of a board — it ignores width and thickness. Board feet (BF) is a volume measure that accounts for all three dimensions. Linear feet is used when pricing uniform stock (baseboards, trim, rails) where width and thickness are fixed. Board feet is used when comparing lumber of different sizes or buying in bulk from a timber yard. A 2×4 and a 2×12 that are both 10 feet long have the same linear footage (10 LF) but very different board footage (4.4 BF vs 12.5 BF).',
    },
    {
      question: 'Why are lumber dimensions different from their names?',
      answer:
        'Lumber is sold in nominal sizes (the name) but arrives at actual (smaller) dimensions due to milling and drying. A "2×4" is actually 1.5″ × 3.5″; a "2×6" is 1.5″ × 5.5″. The nominal size refers to the rough-sawn green lumber before it is dried and surfaced (S4S). This difference matters for board foot calculations — always use actual dimensions when calculating volume or board feet for ordering purposes.',
    },
    {
      question: 'How much waste should I add when ordering framing lumber?',
      answer:
        'Use 10% for standard wall framing with mostly straight cuts. Add 15% for floor framing with blocking, bridging, and end-joist layouts. Use 15–20% for roof framing (rafters, ridge, purlins) where every piece gets cut at an angle. Complex designs with multiple intersecting walls, bay windows, or built-up beams may need 20–25%. Running short of framing lumber mid-project is expensive — the extra cost of one or two boards is far less than a trip back to the yard.',
    },
    {
      question: 'How do I estimate framing lumber for a wall?',
      answer:
        'Use the Stud Calculator for wall-specific stud counts. For general framing lumber: (1) count your studs, plates, headers, and blocking; (2) choose the appropriate board length for each piece type (studs: precut lengths; plates: 8-foot or 16-foot for splicing; headers: match rough opening width + bearing); (3) enter totals by size into this calculator with 10–15% waste. A 12×9 ft wall at 16" OC needs roughly 19 studs + 3 plates runs × (40/12) + headers — use the Stud Calculator first, then price with this one.',
    },
    {
      question: 'What does lumber cost per board foot?',
      answer:
        'Lumber prices fluctuate significantly with market conditions. As of 2025, dimensional framing lumber (SPF or Doug-fir #2) typically runs $0.80–$1.50 per board foot at big-box stores and $0.60–$1.20 at lumber yards. Premium grades (select structural, #1) cost 20–40% more. Hardwoods are priced higher: oak and maple are $4–$8 per BF; walnut and cherry $8–$15 per BF. Prices vary by region and can swing 30–50% with housing market cycles. Always get current pricing from your local supplier before budgeting.',
    },
    {
      question: 'How do I convert board feet to metric?',
      answer:
        'The metric equivalent of a board foot is roughly 0.00236 cubic metres (2,360 cm³). To convert: 1 BF = 144 in³ = 2,359.7 cm³ ≈ 0.00236 m³. European timber merchants use cubic metres (m³) for volume pricing. To convert a lumber order: multiply total board feet by 0.00236 to get cubic metres. Alternatively, use actual metric dimensions (mm × mm × m) and multiply by quantity to get volume in m³ directly — this calculator does both.',
    },
  ],
  orderCallout: true,
  wasteFactor: {
    default: 15,
    range: '10–20%',
    notes: 'Dimensional framing lumber: 10–15%. Hardwood finish lumber with knot selection: 15–20%.',
  },
};
