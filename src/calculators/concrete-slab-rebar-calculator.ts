import type {
  CalculatorConfig,
  CalculatorInputMap,
  CalculatorOutputMap,
  UnitSystem,
} from './_types';
import { rectVolumeImperial, rectVolumeMetric } from './volume-engine';
import { REBAR_SIZES, REBAR_SIZE_OPTIONS_IMPERIAL, REBAR_SIZE_OPTIONS_METRIC } from './rebar-data';

function formula(inputs: CalculatorInputMap, unitSystem: UnitSystem): CalculatorOutputMap {
  if (unitSystem === 'imperial') {
    const vol = rectVolumeImperial(inputs, 'thickness');

    const lengthFt  = Number(inputs.length_ft ?? 10) + Number(inputs.length_in ?? 0) / 12;
    const widthFt   = Number(inputs.width_ft  ?? 10) + Number(inputs.width_in  ?? 0) / 12;
    const spacingIn = Number(inputs.spacing   ?? 12);
    const wastePct  = Number(inputs.waste_pct ?? 10) / 100;
    const rebarSizeId = String(inputs.rebar_size ?? '4');
    const rebarSize   = REBAR_SIZES[rebarSizeId] ?? REBAR_SIZES['4'];

    const spacingFt = spacingIn / 12;
    if (spacingFt <= 0 || lengthFt <= 0 || widthFt <= 0) {
      return {
        cubic_yards: vol.cubic_yards, cubic_feet: vol.cubic_feet, cubic_meters: vol.cubic_meters,
        rebar_linear_ft: 0, rebar_linear_m: 0, rebar_grid_bars: 0,
        rebar_weight_lbs: 0, rebar_weight_kg: 0,
      };
    }
    const rowCount     = Math.floor(lengthFt / spacingFt) + 1;
    const colCount     = Math.floor(widthFt  / spacingFt) + 1;
    const rebar_grid_bars = rowCount + colCount;
    const rebarLinFt   = Math.round((rowCount * widthFt + colCount * lengthFt) * (1 + wastePct) * 10) / 10;
    const rebarWtLbs   = Math.round(rebarLinFt * rebarSize.weight_lb_per_ft * 10) / 10;

    return {
      cubic_yards: vol.cubic_yards,
      cubic_feet:  vol.cubic_feet,
      cubic_meters: vol.cubic_meters,
      rebar_linear_ft: rebarLinFt,
      rebar_linear_m:  Math.round(rebarLinFt * 0.3048 * 10) / 10,
      rebar_grid_bars: rebar_grid_bars,
      rebar_weight_lbs: rebarWtLbs,
      rebar_weight_kg:  Math.round(rebarWtLbs * 0.453592 * 10) / 10,
    };
  } else {
    const vol = rectVolumeMetric(inputs, 'thickness_mm');

    const lengthM   = Number(inputs.length_m   ?? 3);
    const widthM    = Number(inputs.width_m    ?? 3);
    const spacingMm = Number(inputs.spacing_mm ?? 300);
    const wastePct  = Number(inputs.waste_pct ?? 10) / 100;
    const rebarSizeId = String(inputs.rebar_size ?? '4');
    const rebarSize   = REBAR_SIZES[rebarSizeId] ?? REBAR_SIZES['4'];

    const spacingM = spacingMm / 1000;
    if (spacingM <= 0 || lengthM <= 0 || widthM <= 0) {
      return {
        cubic_yards: vol.cubic_yards, cubic_feet: vol.cubic_feet, cubic_meters: vol.cubic_meters,
        rebar_linear_ft: 0, rebar_linear_m: 0, rebar_grid_bars: 0,
        rebar_weight_lbs: 0, rebar_weight_kg: 0,
      };
    }
    const rowCount    = Math.floor(lengthM / spacingM) + 1;
    const colCount    = Math.floor(widthM  / spacingM) + 1;
    const rebar_grid_bars = rowCount + colCount;
    const rebarLinM   = Math.round((rowCount * widthM + colCount * lengthM) * (1 + wastePct) * 10) / 10;
    const rebarWtKg   = Math.round(rebarLinM * rebarSize.weight_kg_per_m * 10) / 10;

    return {
      cubic_yards:  vol.cubic_yards,
      cubic_feet:   vol.cubic_feet,
      cubic_meters: vol.cubic_meters,
      rebar_linear_ft: Math.round(rebarLinM / 0.3048 * 10) / 10,
      rebar_linear_m:  rebarLinM,
      rebar_grid_bars: rebar_grid_bars,
      rebar_weight_lbs: Math.round(rebarWtKg / 0.453592 * 10) / 10,
      rebar_weight_kg:  rebarWtKg,
    };
  }
}

export const concreteSlabRebarCalculator: CalculatorConfig = {
  slug: 'concrete-slab-rebar-calculator',
  name: 'Concrete Slab + Rebar Calculator',
  category: 'concrete',
  description:
    'Combined slab and rebar calculator. Enter slab dimensions, thickness, and rebar spacing to get concrete volume in cubic yards plus total linear feet of rebar and weight in one step.',
  inputs: [
    // ── Imperial ─────────────────────────────────────────
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
      id: 'thickness',
      label: 'Slab Thickness',
      type: 'number',
      unit: 'in',
      min: 1,
      max: 72,
      step: 0.5,
      defaultValue: 4,
      required: true,
      onlyIn: 'imperial',
      helpText: 'Standard residential slabs are 4 in thick.',
    },
    {
      id: 'spacing',
      label: 'Rebar Spacing',
      type: 'number',
      unit: 'in',
      min: 3,
      max: 24,
      step: 1,
      defaultValue: 12,
      required: true,
      onlyIn: 'imperial',
      helpText: 'Common spacing: 12 in residential, 6–8 in driveways.',
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
    // ── Metric ───────────────────────────────────────────
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
      id: 'thickness_mm',
      label: 'Slab Thickness',
      type: 'number',
      unit: 'mm',
      min: 25,
      max: 1800,
      step: 1,
      defaultValue: 100,
      defaultValueMetric: 100,
      required: true,
      onlyIn: 'metric',
      helpText: 'Standard residential slabs are 100 mm thick.',
    },
    {
      id: 'spacing_mm',
      label: 'Rebar Spacing',
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
      id: 'cubic_yards',
      label: 'Cubic Yards',
      unit: 'yd³',
      unitMetric: 'm³',
      format: 'volume',
      primary: true,
      description: 'Concrete volume — standard US order unit',
    },
    {
      id: 'cubic_feet',
      label: 'Cubic Feet',
      unit: 'ft³',
      unitMetric: 'ft³',
      format: 'volume',
    },
    {
      id: 'cubic_meters',
      label: 'Cubic Meters',
      unit: 'm³',
      unitMetric: 'm³',
      format: 'volume',
    },
    {
      id: 'rebar_linear_ft',
      label: 'Rebar Linear Ft',
      unit: 'ft',
      unitMetric: 'm',
      format: 'length',
      description: 'Total rebar needed (includes waste)',
    },
    {
      id: 'rebar_grid_bars',
      label: 'Grid Bars / Lines',
      unit: 'bars',
      unitMetric: 'bars',
      format: 'number',
      description: 'This is the number of straight bars/lines in the reinforcement grid. Actual stock-length purchasing depends on bar lengths, cuts, laps, bends, and project details.',
    },
    {
      id: 'rebar_weight_lbs',
      label: 'Rebar Weight',
      unit: 'lbs',
      unitMetric: 'kg',
      format: 'weight',
      description: 'Calculated using the selected rebar size',
    },
  ],
  formula,
  unitSystems: ['imperial', 'metric'],
  relatedCalculators: ['concrete-slab-calculator', 'rebar-calculator', 'concrete-bags-calculator'],
  orderCallout: {
    hint: 'Order 5–10% extra concrete and 10% extra rebar to account for waste, cuts, and overlaps.',
  },
  seo: {
    title: 'Concrete Slab + Rebar Calculator',
    description:
      'Combined concrete slab and rebar calculator. Enter dimensions, thickness, and bar spacing to get cubic yards of concrete plus rebar linear footage and weight in one step.',
    h1: 'Concrete Slab + Rebar Calculator',
    focusKeyword: 'concrete slab rebar calculator',
  },

  disclaimer: 'Construction estimate only: Results are based on the dimensions and assumptions entered. This calculator does not perform structural engineering or guarantee local building-code compliance. Verify project-specific requirements with your local building department or a qualified professional.',
  schema: {
    appType: 'Construction Calculator',
    features: [
      'Calculate concrete volume in cubic yards',
      'Calculate rebar linear footage',
      'Calculate rebar piece count',
      'Calculate rebar weight',
      'Adjustable rebar spacing',
      'Configurable waste percentage',
      'Imperial and metric support',
    ],
  },
  formulaSteps: [
    {
      label: 'Calculate concrete volume',
      formula: 'Volume (yd³) = Length × Width × (Thickness ÷ 12) ÷ 27',
      description: 'Length and width in feet, thickness converted from inches to feet',
    },
    {
      label: 'Count rebar rows (bars along width)',
      formula: 'Rows = ⌊Length ÷ Spacing⌋ + 1',
    },
    {
      label: 'Count rebar columns (bars along length)',
      formula: 'Columns = ⌊Width ÷ Spacing⌋ + 1',
    },
    {
      label: 'Total rebar linear footage (with waste)',
      formula: 'Linear ft = (Rows × Width + Columns × Length) × (1 + Waste %)',
    },
    {
      label: 'Rebar weight',
      formula: 'Weight (lbs) = Linear ft × (Weight per ft)',
      description: 'Weight is dynamically calculated based on selected rebar size',
    },
  ],
  faq: [
    {
      question: 'Why use a combined slab and rebar calculator?',
      answer:
        'Every reinforced slab requires both concrete and rebar — calculating them separately from the same dimensions wastes time and creates room for entry errors. This combined calculator uses your slab dimensions once and returns both material quantities in a single step.',
    },
    {
      question: 'What rebar spacing should I use for a concrete slab?',
      answer:
        '12 inches (300 mm) on center is standard for residential slabs, patios, and sidewalks. Use 6–8 inches for driveways and garage floors. Structural engineers specify spacing for load-bearing applications. Closer spacing increases material cost but significantly improves crack resistance.',
    },
    {
      question: 'Should I order extra concrete and rebar?',
      answer:
        'Yes. Order 5–10% extra concrete for driveways and slabs — running short mid-pour is expensive and causes cold joints. Order 10% extra rebar to account for overlap splices (typically 12–18 inches) and edge cuts.',
    },
  ],
};
