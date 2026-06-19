import type {
  CalculatorConfig,
  CalculatorInputMap,
  CalculatorOutputMap,
  UnitSystem,
} from './_types';

// #4 rebar (1/2 in): 0.668 lbs/ft — most common residential grade
const REBAR_LBS_PER_FT  = 0.668;
// Metric: 12mm rebar ≈ 0.888 kg/m
const REBAR_KG_PER_M    = 0.888;

function formula(inputs: CalculatorInputMap, unitSystem: UnitSystem): CalculatorOutputMap {
  if (unitSystem === 'imperial') {
    const lengthFt   = Number(inputs.length_ft  ?? 10) + Number(inputs.length_in  ?? 0) / 12;
    const widthFt    = Number(inputs.width_ft   ?? 10) + Number(inputs.width_in   ?? 0) / 12;
    const spacingIn  = Number(inputs.spacing    ?? 12);
    const wastePct   = Number(inputs.waste_pct  ?? 10) / 100;

    const spacingFt  = spacingIn / 12;
    if (spacingFt <= 0 || lengthFt <= 0 || widthFt <= 0) {
      return { pieces: 0, linear_ft: 0, linear_m: 0, weight_lbs: 0, weight_kg: 0 };
    }
    // Rows run along width, spaced along length; columns run along length, spaced along width
    const rowCount  = Math.floor(lengthFt / spacingFt) + 1;
    const colCount  = Math.floor(widthFt  / spacingFt) + 1;
    const pieces    = rowCount + colCount;
    const linearFt  = Math.round((rowCount * widthFt + colCount * lengthFt) * (1 + wastePct) * 10) / 10;
    const weightLbs = Math.round(linearFt * REBAR_LBS_PER_FT * 10) / 10;

    return {
      pieces,
      linear_ft: linearFt,
      linear_m: Math.round(linearFt * 0.3048 * 10) / 10,
      weight_lbs: weightLbs,
      weight_kg: Math.round(weightLbs * 0.453592 * 10) / 10,
    };
  } else {
    const lengthM   = Number(inputs.length_m   ?? 3);
    const widthM    = Number(inputs.width_m    ?? 3);
    const spacingMm = Number(inputs.spacing_mm ?? 300);
    const wastePct  = Number(inputs.waste_pct  ?? 10) / 100;

    const spacingM  = spacingMm / 1000;
    if (spacingM <= 0 || lengthM <= 0 || widthM <= 0) {
      return { pieces: 0, linear_ft: 0, linear_m: 0, weight_lbs: 0, weight_kg: 0 };
    }
    const rowCount  = Math.floor(lengthM / spacingM) + 1;
    const colCount  = Math.floor(widthM  / spacingM) + 1;
    const pieces    = rowCount + colCount;
    const linearM   = Math.round((rowCount * widthM + colCount * lengthM) * (1 + wastePct) * 10) / 10;
    const weightKg  = Math.round(linearM * REBAR_KG_PER_M * 10) / 10;

    return {
      pieces,
      linear_m: linearM,
      linear_ft: Math.round(linearM / 0.3048 * 10) / 10,
      weight_kg: weightKg,
      weight_lbs: Math.round(weightKg / 0.453592 * 10) / 10,
    };
  }
}

export const rebarCalculator: CalculatorConfig = {
  slug: 'rebar-calculator',
  name: 'Rebar Calculator',
  category: 'concrete',
  description:
    'Calculate how much rebar you need for a concrete slab. Enter slab dimensions and bar spacing to get total linear feet, number of pieces, and estimated weight.',
  inputs: [
    // ── Imperial ──────────────────────────────────────
    {
      id: 'length_ft',
      label: 'Slab Length',
      type: 'number',
      unit: 'ft',
      min: 1,
      max: 500,
      step: 1,
      defaultValue: 10,
      required: true,
      onlyIn: 'imperial',
    },
    {
      id: 'length_in',
      label: 'Slab Length (in)',
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
      label: 'Slab Width',
      type: 'number',
      unit: 'ft',
      min: 1,
      max: 500,
      step: 1,
      defaultValue: 10,
      required: true,
      onlyIn: 'imperial',
    },
    {
      id: 'width_in',
      label: 'Slab Width (in)',
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
      id: 'spacing',
      label: 'Bar Spacing',
      type: 'number',
      unit: 'in',
      min: 3,
      max: 24,
      step: 1,
      defaultValue: 12,
      required: true,
      onlyIn: 'imperial',
      helpText: 'Common spacing: 12 in residential, 6–8 in driveways, 6 in structural.',
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
      onlyIn: 'imperial',
      helpText: 'Add 10% for cuts and overlaps.',
    },
    // ── Metric ────────────────────────────────────────
    {
      id: 'length_m',
      label: 'Slab Length',
      type: 'number',
      unit: 'm',
      min: 0.5,
      max: 150,
      step: 0.1,
      defaultValue: 3,
      defaultValueMetric: 3,
      required: true,
      onlyIn: 'metric',
    },
    {
      id: 'width_m',
      label: 'Slab Width',
      type: 'number',
      unit: 'm',
      min: 0.5,
      max: 150,
      step: 0.1,
      defaultValue: 3,
      defaultValueMetric: 3,
      required: true,
      onlyIn: 'metric',
    },
    {
      id: 'spacing_mm',
      label: 'Bar Spacing',
      type: 'number',
      unit: 'mm',
      min: 75,
      max: 600,
      step: 25,
      defaultValue: 300,
      defaultValueMetric: 300,
      required: true,
      onlyIn: 'metric',
      helpText: 'Common spacing: 300 mm residential, 150–200 mm driveways.',
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
      onlyIn: 'metric',
      helpText: 'Add 10% for cuts and overlaps.',
    },
  ],
  outputs: [
    {
      id: 'linear_ft',
      label: 'Total Linear Feet',
      unit: 'ft',
      format: 'length',
      primary: true,
      description: 'Includes waste factor — order this amount',
    },
    {
      id: 'linear_m',
      label: 'Total Linear Meters',
      unit: 'm',
      format: 'length',
    },
    {
      id: 'pieces',
      label: 'Rebar Pieces',
      unit: 'bars',
      format: 'number',
      description: 'Total rows + columns in the grid',
    },
    {
      id: 'weight_lbs',
      label: 'Estimated Weight',
      unit: 'lbs',
      format: 'weight',
      description: 'Based on #4 rebar (1/2 in, 0.668 lbs/ft)',
    },
    {
      id: 'weight_kg',
      label: 'Estimated Weight',
      unit: 'kg',
      format: 'weight',
    },
  ],
  formula,
  unitSystems: ['imperial', 'metric'],
  relatedCalculators: ['concrete-slab-calculator', 'deck-footing-calculator', 'retaining-wall-calculator'],
  seo: {
    title: 'Rebar Calculator — Linear Feet, Pieces & Weight',
    description:
      'Free rebar calculator — enter slab length, width, and bar spacing to calculate total linear feet of rebar, number of pieces, and estimated weight for your concrete project.',
    h1: 'Rebar Calculator',
    focusKeyword: 'rebar calculator',
  },
  schema: {
    appType: 'Construction Calculator',
    features: [
      'Calculate total rebar linear footage',
      'Calculate number of rebar pieces',
      'Calculate rebar weight',
      'Adjustable bar spacing',
      'Configurable waste percentage',
      'Imperial and metric support',
    ],
  },
  formulaSteps: [
    {
      label: 'Count rows (bars running along width)',
      formula: 'Rows = ⌊Length ÷ Spacing⌋ + 1',
      description: 'One bar at each spacing interval plus one at the far edge',
    },
    {
      label: 'Count columns (bars running along length)',
      formula: 'Columns = ⌊Width ÷ Spacing⌋ + 1',
    },
    {
      label: 'Calculate total linear footage',
      formula: 'Linear ft = (Rows × Width + Columns × Length) × (1 + Waste %)',
      description: 'Each row spans the full width; each column spans the full length',
    },
    {
      label: 'Calculate weight',
      formula: 'Weight (lbs) = Linear ft × 0.668',
      description: '#4 rebar (most common) weighs 0.668 lbs per linear foot',
    },
  ],
  faq: [
    {
      question: 'How much rebar do I need for a concrete slab?',
      answer:
        'For a 10 × 10 ft slab with 12-inch spacing, you need (⌊10/1⌋+1) rows × 10 ft + (⌊10/1⌋+1) columns × 10 ft = 11 × 10 + 11 × 10 = 220 linear feet of rebar (plus 10% waste = 242 ft). The formula counts bars in both directions — use the calculator above for any slab size and spacing.',
    },
    {
      question: 'What is the standard rebar spacing for a concrete slab?',
      answer:
        'Standard rebar spacing depends on the application: residential slabs and patios 12 inches (300 mm), garage floors and driveways 6–8 inches (150–200 mm), structural slabs 6 inches (150 mm) or less as specified by an engineer. Closer spacing adds strength but increases material cost significantly.',
    },
    {
      question: 'What size rebar should I use for a concrete slab?',
      answer:
        '#4 rebar (1/2 inch diameter) is the most common choice for residential slabs, driveways, and patios. #3 rebar (3/8 inch) is used for light-duty applications. #5 (5/8 inch) or larger is used for structural slabs, footings, and walls. This calculator uses #4 rebar for weight estimates — adjust if you are using a different size.',
    },
    {
      question: 'How do I calculate rebar spacing for a concrete slab?',
      answer:
        'Divide the slab length by the desired spacing to get the number of sections, then add 1 for the starting bar. For a 10-foot slab with 12-inch spacing: 10 ÷ 1 = 10 sections + 1 = 11 bars. Repeat for the other direction. The result is the bar count for a bidirectional grid. This calculator handles both directions automatically.',
    },
    {
      question: 'Do I need rebar in a concrete slab?',
      answer:
        'Rebar is strongly recommended for most slabs. A plain concrete slab will crack under load and temperature changes — rebar holds the pieces together and maintains structural integrity after cracking. Exceptions: very small slabs (under 4 × 4 ft) and garden paths with no vehicle traffic may use wire mesh or fiber reinforcement instead.',
    },
    {
      question: 'How much waste should I add when ordering rebar?',
      answer:
        'Add 10% waste to account for bar overlaps (typically 12–18 inches at splices), cuts at edges, and any measurement errors. For slabs with many cut bars at irregular edges, increase to 15%. This calculator applies your chosen waste percentage automatically — the default is 10%.',
    },
    {
      question: 'How much does rebar weigh per foot?',
      answer:
        '#3 rebar: 0.376 lbs/ft (0.560 kg/m). #4 rebar: 0.668 lbs/ft (0.994 kg/m). #5 rebar: 1.043 lbs/ft (1.552 kg/m). #6 rebar: 1.502 lbs/ft (2.235 kg/m). This calculator uses #4 rebar weight for estimates. For other sizes, multiply your total linear footage by the weight per foot listed here.',
    },
    {
      question: 'What depth should rebar be placed in a concrete slab?',
      answer:
        'Rebar should be placed at the middle to lower-middle of the slab depth. For a 4-inch slab, center the rebar at 2 inches from the bottom (providing 2-inch cover). Use rebar chairs or dobies to hold the bars at the correct height — never lay rebar on the ground before pouring, as it will end up at the bottom with no concrete cover.',
    },
  ],
  orderCallout: true,
  wasteFactor: {
    default: 10,
    range: '10–15%',
    notes: 'Simple grids: 10%. Complex layouts with many short pieces, hooks, or L-bars: 15%.',
  },
  references: [
    {
      title: 'ACI 318 – Building Code Requirements for Structural Concrete (Reinforcement)',
      organization: 'American Concrete Institute',
      url: 'https://www.concrete.org/',
    },
    {
      title: 'CRSI Design Handbook',
      organization: 'Concrete Reinforcing Steel Institute',
      url: 'https://www.crsi.org/',
    },
  ],
};
