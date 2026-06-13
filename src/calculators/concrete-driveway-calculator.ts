import type {
  CalculatorConfig,
  CalculatorInputMap,
  CalculatorOutputMap,
  UnitSystem,
} from './_types';
import { rectVolumeImperial, rectVolumeMetric } from './volume-engine';

function formula(inputs: CalculatorInputMap, unitSystem: UnitSystem): CalculatorOutputMap {
  if (unitSystem === 'imperial') {
    const vol         = rectVolumeImperial(inputs, 'thickness');
    const costPerYard = Number(inputs.cost_per_yard ?? 0);
    const cost        = costPerYard > 0 ? Math.round(vol.cubic_yards * costPerYard * 100) / 100 : 0;
    return {
      cubic_yards:  vol.cubic_yards,
      cubic_feet:   vol.cubic_feet,
      cubic_meters: vol.cubic_meters,
      cost,
    };
  } else {
    const vol       = rectVolumeMetric(inputs, 'thickness_mm');
    const costPerM3 = Number(inputs.cost_per_m3 ?? 0);
    const cost      = costPerM3 > 0 ? Math.round(vol.cubic_meters * costPerM3 * 100) / 100 : 0;
    return {
      cubic_meters: vol.cubic_meters,
      cubic_feet:   vol.cubic_feet,
      cubic_yards:  vol.cubic_yards,
      cost,
    };
  }
}

export const concreteDrivewayCalculator: CalculatorConfig = {
  slug: 'concrete-driveway-calculator',
  name: 'Concrete Driveway Calculator',
  category: 'concrete',
  description:
    'Calculate exactly how much concrete you need for a driveway. Enter length, width, and thickness to get cubic yards, cubic feet, cubic meters, and an optional cost estimate.',
  inputs: [
    // ── Imperial ──────────────────────────────────────
    {
      id: 'length_ft',
      label: 'Driveway Length',
      type: 'number',
      unit: 'ft',
      min: 0,
      max: 5000,
      step: 1,
      defaultValue: 20,
      required: true,
      onlyIn: 'imperial',
    },
    {
      id: 'length_in',
      label: 'Driveway Length (in)',
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
      label: 'Driveway Width',
      type: 'number',
      unit: 'ft',
      min: 0,
      max: 500,
      step: 1,
      defaultValue: 12,
      required: true,
      onlyIn: 'imperial',
      helpText: 'Single car: 9–12 ft. Double: 18–24 ft.',
    },
    {
      id: 'width_in',
      label: 'Driveway Width (in)',
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
      label: 'Thickness',
      type: 'number',
      unit: 'in',
      min: 1,
      max: 24,
      step: 0.5,
      defaultValue: 4,
      required: true,
      onlyIn: 'imperial',
      helpText: 'Standard driveways: 4 in residential, 6 in for trucks or RVs.',
    },
    {
      id: 'cost_per_yard',
      label: 'Concrete Cost (optional)',
      type: 'number',
      unit: '$/yd³',
      min: 0,
      max: 2000,
      step: 5,
      defaultValue: 0,
      onlyIn: 'imperial',
      helpText: 'Ready-mix typically costs $130–$180 per cubic yard. Leave 0 to skip.',
    },
    // ── Metric ────────────────────────────────────────
    {
      id: 'length_m',
      label: 'Driveway Length',
      type: 'number',
      unit: 'm',
      min: 0,
      max: 1500,
      step: 0.1,
      defaultValue: 6,
      defaultValueMetric: 6,
      required: true,
      onlyIn: 'metric',
    },
    {
      id: 'width_m',
      label: 'Driveway Width',
      type: 'number',
      unit: 'm',
      min: 0,
      max: 150,
      step: 0.1,
      defaultValue: 3,
      defaultValueMetric: 3,
      required: true,
      onlyIn: 'metric',
      helpText: 'Single car: 2.7–3.5 m. Double: 5.5–7 m.',
    },
    {
      id: 'thickness_mm',
      label: 'Thickness',
      type: 'number',
      unit: 'mm',
      min: 25,
      max: 600,
      step: 5,
      defaultValue: 100,
      defaultValueMetric: 100,
      required: true,
      onlyIn: 'metric',
      helpText: 'Standard driveways: 100 mm residential, 150 mm for trucks.',
    },
    {
      id: 'cost_per_m3',
      label: 'Concrete Cost (optional)',
      type: 'number',
      unit: '$/m³',
      min: 0,
      max: 2000,
      step: 5,
      defaultValue: 0,
      onlyIn: 'metric',
      helpText: 'Ready-mix typically costs $120–$200 per cubic meter. Leave 0 to skip.',
    },
  ],
  outputs: [
    {
      id: 'cubic_yards',
      label: 'Cubic Yards',
      unit: 'yd³',
      format: 'volume',
      primary: true,
      description: 'Standard US ready-mix order unit',
    },
    {
      id: 'cubic_feet',
      label: 'Cubic Feet',
      unit: 'ft³',
      format: 'volume',
    },
    {
      id: 'cubic_meters',
      label: 'Cubic Meters',
      unit: 'm³',
      format: 'volume',
      description: 'Standard metric concrete order unit',
    },
    {
      id: 'cost',
      label: 'Estimated Concrete Cost',
      unit: '$',
      format: 'currency',
      description: 'Material cost only — does not include labour or finishing',
    },
  ],
  formula,
  unitSystems: ['imperial', 'metric'],
  relatedCalculators: [
    'concrete-slab-calculator',
    'concrete-block-calculator',
    'concrete-column-calculator',
    'rebar-calculator',
  ],
  seo: {
    title: 'Concrete Driveway Calculator — Cubic Yards & Cost Estimate',
    description:
      'Free concrete driveway calculator — enter length, width, and thickness to get cubic yards, cubic feet, cubic meters, and an optional material cost estimate for your driveway pour.',
    h1: 'Concrete Driveway Calculator',
    focusKeyword: 'concrete driveway calculator',
  },
  schema: {
    appType: 'Construction Calculator',
    features: [
      'Calculate concrete volume in cubic yards',
      'Calculate concrete volume in cubic feet and cubic meters',
      'Optional material cost estimate',
      'Feet and inches input support',
      'Metric (meters and millimeters) support',
      'Standard and heavy-duty thickness presets',
    ],
  },
  formulaSteps: [
    {
      label: 'Convert thickness to feet',
      formula: 'Thickness (ft) = Thickness (in) ÷ 12',
      description: 'All three dimensions must share the same unit before multiplying',
    },
    {
      label: 'Calculate volume in cubic feet',
      formula: 'Volume (ft³) = Length (ft) × Width (ft) × Thickness (ft)',
    },
    {
      label: 'Convert to cubic yards',
      formula: 'Volume (yd³) = Volume (ft³) ÷ 27',
      description: 'There are 27 cubic feet in one cubic yard — the standard US ready-mix order unit',
    },
    {
      label: 'Convert to cubic meters (optional)',
      formula: 'Volume (m³) = Volume (ft³) × 0.0283168',
    },
    {
      label: 'Estimate concrete cost (optional)',
      formula: 'Cost = Volume (yd³) × Price per cubic yard',
      description: 'Leave the price field at 0 to skip the cost output',
    },
  ],
  faq: [
    {
      question: 'How thick should a concrete driveway be?',
      answer:
        '4 inches (100 mm) is the standard thickness for residential driveways used by passenger vehicles. Increase to 5–6 inches (125–150 mm) if the driveway will see heavy vehicles such as delivery trucks, RVs, or trailers. Thicker concrete in high-traffic or freeze-thaw climates significantly reduces cracking over time.',
    },
    {
      question: 'How much concrete do I need for a 2-car driveway?',
      answer:
        'A typical 2-car driveway is 20 ft wide × 20 ft long × 4 in thick = 400 ft² × (4/12) ft = 133 ft³ ÷ 27 = 4.94 cubic yards. With the recommended 10% overage, order 5.5 cubic yards. Use this calculator to get the exact figure for your dimensions.',
    },
    {
      question: 'How much does a concrete driveway cost?',
      answer:
        'Ready-mix concrete costs $130–$180 per cubic yard (2025 US average). A standard single-car driveway (10 ft × 20 ft × 4 in) needs about 2.5 yards — roughly $325–$450 in material. Total installed cost including labour, forming, and finishing typically runs $4–$8 per square foot, or $800–$1,600 for that same single-car driveway.',
    },
    {
      question: 'Should I add rebar to a concrete driveway?',
      answer:
        'Rebar (#3 or #4) is recommended for driveways subject to heavy loads or vehicles over 10,000 lbs. For standard residential driveways, welded wire mesh (6×6-W1.4×W1.4) placed in the middle third of the slab is a common and cost-effective alternative. Both reinforcement types do not change concrete volume — calculate your concrete first, then plan reinforcement separately.',
    },
    {
      question: 'How do I calculate concrete for an L-shaped or curved driveway?',
      answer:
        'Break the driveway into rectangular sections. Calculate the volume for each rectangle using this calculator and add the totals. For curved edges or aprons, use the widest measurement to get a conservative overestimate, or split the curve into several small rectangles and sum them. Always order 5–10% extra to account for irregular subgrade and formwork variation.',
    },
    {
      question: 'How much overage should I order for a concrete driveway?',
      answer:
        'Order 5–10% more than your calculated volume. Concrete volume is sensitive to subgrade unevenness — a high spot or low spot of just 1 inch across a 20-foot width adds 0.3 cubic yards of variance. Running short mid-pour is costly (emergency loads, cold joints), while a small amount of leftover can be used for walkway repairs or disposed of.',
    },
    {
      question: 'What PSI concrete should I use for a driveway?',
      answer:
        'Use 4,000 PSI (28 MPa) minimum for driveways. In freeze-thaw climates, 4,500 PSI with air entrainment (5–7%) is strongly recommended — the air bubbles give water expansion room during freezing, dramatically reducing surface scaling. 3,000 PSI is only adequate for interior slabs not exposed to weather or vehicle loads.',
    },
    {
      question: 'How long does a concrete driveway take to cure?',
      answer:
        'Concrete reaches initial set in 24–48 hours — you can walk on it. Wait 7 days before driving passenger vehicles on it. Full design strength (typically 4,000 PSI) is reached at 28 days. Avoid heavy vehicles, deicing salts, and pressure washing for the first 30 days. Keep the surface moist during the first week (wet curing) to maximise final strength.',
    },
  ],
};
