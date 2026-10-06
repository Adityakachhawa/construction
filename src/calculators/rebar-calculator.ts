import type {
  CalculatorConfig,
  CalculatorInputMap,
  CalculatorOutputMap,
  UnitSystem,
} from './_types';
import { REBAR_SIZES, REBAR_SIZE_OPTIONS_IMPERIAL, REBAR_SIZE_OPTIONS_METRIC } from './rebar-data';

function formula(inputs: CalculatorInputMap, unitSystem: UnitSystem): CalculatorOutputMap {
  if (unitSystem === 'imperial') {
    const lengthFt   = Number(inputs.length_ft  ?? 10) + Number(inputs.length_in  ?? 0) / 12;
    const widthFt    = Number(inputs.width_ft   ?? 10) + Number(inputs.width_in   ?? 0) / 12;
    const spacingIn  = Number(inputs.spacing    ?? 12);
    const wastePct   = Number(inputs.waste_pct  ?? 10) / 100;
    const rebarSizeId = String(inputs.rebar_size ?? '4');
    const rebarSize   = REBAR_SIZES[rebarSizeId] ?? REBAR_SIZES['4'];

    const spacingFt  = spacingIn / 12;
    if (spacingFt <= 0 || lengthFt <= 0 || widthFt <= 0) {
      return { grid_bars: 0, linear_ft: 0, linear_m: 0, weight_lbs: 0, weight_kg: 0 };
    }
    // Rows run along width, spaced along length; columns run along length, spaced along width
    const rowCount  = Math.floor(lengthFt / spacingFt) + 1;
    const colCount  = Math.floor(widthFt  / spacingFt) + 1;
    const grid_bars    = rowCount + colCount;
    const linearFt  = Math.round((rowCount * widthFt + colCount * lengthFt) * (1 + wastePct) * 10) / 10;
    const weightLbs = Math.round(linearFt * rebarSize.weight_lb_per_ft * 10) / 10;

    return {
      grid_bars,
      linear_ft: linearFt,
      linear_m: Math.round(linearFt * 0.3048 * 10) / 10,
      weight_lbs: weightLbs,
      weight_kg: Math.round(weightLbs * 0.453592 * 10) / 10,
    };
  } else {
    const lengthM   = Number(inputs.length_m   ?? 3);
    const widthM    = Number(inputs.width_m    ?? 3);
    const spacingMm = Number(inputs.spacing_mm ?? 300);
    const wastePct   = Number(inputs.waste_pct  ?? 10) / 100;
    const rebarSizeId = String(inputs.rebar_size ?? '4');
    const rebarSize   = REBAR_SIZES[rebarSizeId] ?? REBAR_SIZES['4'];

    const spacingM  = spacingMm / 1000;
    if (spacingM <= 0 || lengthM <= 0 || widthM <= 0) {
      return { grid_bars: 0, linear_ft: 0, linear_m: 0, weight_lbs: 0, weight_kg: 0 };
    }
    const rowCount  = Math.floor(lengthM / spacingM) + 1;
    const colCount  = Math.floor(widthM  / spacingM) + 1;
    const grid_bars    = rowCount + colCount;
    const linearM   = Math.round((rowCount * widthM + colCount * lengthM) * (1 + wastePct) * 10) / 10;
    const weightKg  = Math.round(linearM * rebarSize.weight_kg_per_m * 10) / 10;

    return {
      grid_bars,
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
    'Calculate how much rebar you need for a concrete slab. Enter slab dimensions and bar spacing to get total linear feet, number of Grid Bars / Lines, and estimated weight.',
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
      id: 'rebar_size',
      label: 'Rebar Size',
      type: 'select',
      options: REBAR_SIZE_OPTIONS_IMPERIAL,
      defaultValue: '4',
      onlyIn: 'imperial',
      required: true,
      helpText: 'Standard residential is #4 (1/2 in).',
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
      id: 'rebar_size',
      label: 'Rebar Size',
      type: 'select',
      options: REBAR_SIZE_OPTIONS_METRIC,
      defaultValue: '4',
      onlyIn: 'metric',
      required: true,
      helpText: 'Standard residential is No. 13 (12.7 mm).',
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
      id: 'grid_bars',
      label: 'Grid Bars / Lines',
      unit: 'bars',
      format: 'number',
      description: 'This is the number of straight bars/lines in the reinforcement grid. Actual stock-length purchasing depends on bar lengths, cuts, laps, bends, and project details.',
    },
    {
      id: 'weight_lbs',
      label: 'Estimated Weight',
      unit: 'lbs',
      format: 'weight',
      description: 'Calculated using the selected rebar size',
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
    title: 'Rebar Calculator for Slabs | Spacing, Footage & Weight',
    description:
      'Use our free rebar calculator to estimate how much rebar you need for a concrete slab. Calculate total linear feet, rebar weight, and spacing layout.',
    h1: 'Rebar Calculator',
    focusKeyword: 'rebar calculator',
  },

  disclaimer: 'Construction estimate only: Results are based on the dimensions and assumptions entered. This calculator does not perform structural engineering or guarantee local building-code compliance. Verify project-specific requirements with your local building department or a qualified professional.',
  schema: {
    appType: 'Construction Calculator',
    features: [
      'Calculate total rebar linear footage',
      'Calculate number of Grid Bars / Lines',
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
      formula: 'Weight (lbs) = Linear ft × (Weight per ft)',
      description: 'Weight is dynamically calculated based on selected rebar size',
    },
  ],
  faq: [
    {
      question: 'How much rebar do I need?',
      answer:
        'The amount of rebar you need depends on your slab dimensions, bar spacing, chosen bar size, and waste percentage. A standard bidirectional grid requires rows and columns calculated by dividing the slab length and width by the spacing. Our calculator computes the total linear footage and estimated weight based on these factors.'
    },
    {
      question: 'How much rebar do I need for a concrete slab?',
      answer:
        'For a typical concrete slab, rebar is laid out in a grid pattern. To find the exact quantity, measure the length and width of the pour and determine the required bar spacing. For example, a 10×10 ft slab with 12-inch spacing requires 22 total grid bars and 242 linear feet of rebar (including 10% waste).'
    },
    {
      question: 'How much rebar do I need for a slab?',
      answer:
        'The exact amount is dictated by the grid layout. First, count the number of bars running the length, and the number of bars running the width. Multiply the number of rows by the width and columns by the length, add the two together, and include a waste factor (typically 10%).'
    },
    {
      question: 'What spacing should I use for rebar?',
      answer:
        'Common spacing and rebar sizes vary by project. Residential examples may use 12-inch spacing and #4 rebar, but actual reinforcement requirements depend on slab design, loads, site conditions, and applicable codes. Verify project-specific requirements with a qualified professional or local building authority.'
    },
    {
      question: 'How is rebar weight calculated?',
      answer:
        'Rebar weight is calculated by multiplying the total linear footage of the rebar grid by the specific weight per foot of the chosen rebar size. For example, standard #4 rebar weighs 0.668 pounds per foot. If you need 100 linear feet of #4 rebar, the total estimated weight is 66.8 pounds.'
    },
    {
      question: 'How much rebar do I need for a 30×40 slab?',
      answer:
        'For a 30×40 ft slab using 16-inch spacing and 10% waste, you will need 23 rows and 31 columns, resulting in 54 total grid bars. This equates to 2,035 total linear feet of rebar. If using #4 rebar, the estimated weight would be approximately 1,359.4 lbs.'
    },
    {
      question: 'Can I calculate rebar by square foot?',
      answer:
        'While some rough estimates use a fixed amount of rebar per square foot, it is not an accurate or safe method for purchasing material. The exact quantity needed can vary widely based on the dimensions of the slab, the required spacing, and the waste percentage. Our calculator uses the actual dimensions to provide a precise estimate.'
    },
    {
      question: 'What size rebar should I use?',
      answer:
        'Common spacing and rebar sizes vary by project. Residential examples may use 12-inch spacing and #4 rebar, but actual reinforcement requirements depend on slab design, loads, site conditions, and applicable codes. Verify project-specific requirements with a qualified professional or local building authority.'
    }
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
