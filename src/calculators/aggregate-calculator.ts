import type {
  CalculatorConfig,
  CalculatorInputMap,
  CalculatorOutputMap,
  UnitSystem,
} from './_types';
import { rectVolumeImperial, rectVolumeMetric, tonsFromYards, tonsFromMeters } from './volume-engine';

// Crushed stone / aggregate density: ~1.5 tons/yd³ (varies by type)
const DENSITY_IMPERIAL = 1.5;
// Metric: ~1.63 tonnes/m³
const DENSITY_METRIC   = 1.63;

function formula(inputs: CalculatorInputMap, unitSystem: UnitSystem): CalculatorOutputMap {
  if (unitSystem === 'imperial') {
    const vol = rectVolumeImperial(inputs, 'depth');
    const density = Number(inputs.density ?? DENSITY_IMPERIAL);
    return { ...vol, tons: tonsFromYards(vol.cubic_yards, density) };
  } else {
    const vol = rectVolumeMetric(inputs, 'depth_mm');
    const density = Number(inputs.density ?? DENSITY_METRIC);
    return { ...vol, tons: tonsFromMeters(vol.cubic_meters, density) };
  }
}

export const aggregateCalculator: CalculatorConfig = {
  slug: 'aggregate-calculator',
  name: 'Aggregate Calculator',
  category: 'excavation',
  description:
    'Calculate how much crushed stone or aggregate you need for driveways, drainage, base layers, and landscaping. Enter length, width, and depth to get cubic yards, cubic feet, cubic meters, and tons.',
  inputs: [
    // ── Imperial ──────────────────────────────────────
    {
      id: 'length_ft',
      label: 'Length',
      type: 'number',
      unit: 'ft',
      min: 1,
      max: 10000,
      step: 1,
      defaultValue: 10,
      required: true,
      onlyIn: 'imperial',
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
      id: 'width_ft',
      label: 'Width',
      type: 'number',
      unit: 'ft',
      min: 1,
      max: 10000,
      step: 1,
      defaultValue: 10,
      required: true,
      onlyIn: 'imperial',
    },
    {
      id: 'width_in',
      label: 'Width (in)',
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
      id: 'depth',
      label: 'Depth',
      type: 'number',
      unit: 'in',
      min: 1,
      max: 36,
      step: 0.5,
      defaultValue: 4,
      required: true,
      onlyIn: 'imperial',
      helpText: 'Driveway base: 4–6 in. Drainage layer: 6–12 in. Path: 2–4 in.',
    },
    {
      id: 'density',
      label: 'Material Density',
      type: 'number',
      unit: 'tons/yd³',
      min: 0.1,
      max: 5,
      step: 0.01,
      defaultValue: 1.5,
      onlyIn: 'imperial',
      helpText: 'Default is 1.5 tons/yd³. Actual density varies by moisture and material type.',
    },
    // ── Metric ────────────────────────────────────────
    {
      id: 'length_m',
      label: 'Length',
      type: 'number',
      unit: 'm',
      min: 0.1,
      max: 3000,
      step: 0.1,
      defaultValue: 3,
      defaultValueMetric: 3,
      required: true,
      onlyIn: 'metric',
    },
    {
      id: 'width_m',
      label: 'Width',
      type: 'number',
      unit: 'm',
      min: 0.1,
      max: 3000,
      step: 0.1,
      defaultValue: 3,
      defaultValueMetric: 3,
      required: true,
      onlyIn: 'metric',
    },
    {
      id: 'depth_mm',
      label: 'Depth',
      type: 'number',
      unit: 'mm',
      min: 25,
      max: 900,
      step: 5,
      defaultValue: 100,
      defaultValueMetric: 100,
      required: true,
      onlyIn: 'metric',
      helpText: 'Driveway base: 100–150 mm. Drainage: 150–300 mm. Path: 50–100 mm.',
    },
    {
      id: 'density',
      label: 'Material Density',
      type: 'number',
      unit: 't/m³',
      min: 0.1,
      max: 5,
      step: 0.01,
      defaultValue: 1.63,
      defaultValueMetric: 1.63,
      onlyIn: 'metric',
      helpText: 'Default is 1.63 t/m³. Actual density varies by moisture and material type.',
    }
  ],
  outputs: [
    {
      id: 'cubic_yards',
      label: 'Cubic Yards',
      unit: 'yd³',
      format: 'volume',
      primary: true,
      description: 'Standard US aggregate order unit',
    },
    {
      id: 'tons',
      label: 'Tons of Aggregate',
      unit: 'tons',
      format: 'weight',
      description: 'Calculated using the provided material density',
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
      description: 'Standard metric order unit',
    },
  ],
  formula,
  unitSystems: ['imperial', 'metric'],
  relatedCalculators: ['gravel-calculator', 'asphalt-calculator', 'concrete-slab-calculator'],
  seo: {
    title: 'Aggregate Calculator — Crushed Stone Tonnage & Volume',
    description:
      'Free aggregate calculator — enter length, width, and depth to calculate cubic yards, tons, and cubic meters of crushed stone or aggregate for driveways, drainage, and base layers.',
    h1: 'Aggregate Calculator',
    focusKeyword: 'aggregate calculator',
  },
  schema: {
    appType: 'Construction Calculator',
    features: [
      'Calculate aggregate in cubic yards',
      'Calculate tons of crushed stone needed',
      'Calculate aggregate in cubic feet and cubic meters',
      'Depth guide for driveways, drainage, and paths',
      'Based on standard crushed stone density',
      'Imperial and metric support',
      'Cost estimator',
    ],
  },
  formulaSteps: [
    {
      label: 'Convert depth to feet',
      formula: 'Depth (ft) = Depth (in) ÷ 12',
      description: 'All dimensions must share the same unit before multiplying',
    },
    {
      label: 'Calculate volume in cubic feet',
      formula: 'Volume (ft³) = Length (ft) × Width (ft) × Depth (ft)',
    },
    {
      label: 'Convert to cubic yards',
      formula: 'Volume (yd³) = Volume (ft³) ÷ 27',
      description: 'Aggregate is typically sold by the cubic yard or ton in the US',
    },
    {
      label: 'Calculate weight in tons',
      formula: 'Tons = Cubic Yards × Density',
      description: 'Crushed stone weighs approximately 2,700–3,000 lbs per cubic yard (1.35–1.5 short tons). This calculator uses 1.5 tons/yd³ as a conservative estimate.',
    },
  ],
  faq: [
    {
      question: 'How do I calculate how much aggregate I need?',
      answer:
        'Multiply length × width × depth (in feet) to get cubic feet, divide by 27 for cubic yards, then multiply by 1.5 for tons. For a 10 × 10 ft area at 4-inch depth: 10 × 10 × 0.333 = 33.3 ft³ ÷ 27 = 1.23 yd³ × 1.5 = 1.85 tons. Use the calculator above for any size — it handles the conversions automatically.',
    },
    {
      question: 'How many tons of crushed stone do I need?',
      answer:
        'Crushed stone weighs approximately 1.35–1.5 short tons per cubic yard, depending on the stone type and grading. #57 crushed limestone runs about 1.4–1.5 tons/yd³; crusher run (compacted base material) is slightly heavier at 1.5–1.6 tons/yd³. This calculator uses 1.5 tons/yd³ as a standard estimate. Multiply your cubic yards by 1.5 to get tons.',
    },
    {
      question: 'What depth of aggregate do I need for a driveway base?',
      answer:
        'A properly built driveway needs a compacted aggregate base of at least 4 inches (100 mm) for light vehicles and 6 inches (150 mm) for heavy vehicles or soft soils. The aggregate base goes under asphalt or gravel surfacing. For new construction over clay or poor soil, increase to 8–12 inches (200–300 mm) and compact in 4-inch lifts.',
    },
    {
      question: 'What is the difference between aggregate and gravel?',
      answer:
        'Gravel refers to naturally rounded stones formed by erosion. Aggregate is a broader term for crushed or screened stone used in construction — it includes crushed limestone, crushed granite, crusher run, #57 stone, and pea gravel. Crushed aggregate has angular edges that interlock and compact better than round gravel, making it preferable for load-bearing base applications. Both are calculated the same way using this calculator.',
    },
    {
      question: 'What size aggregate should I use?',
      answer:
        '#57 stone (¾-inch crushed): best for driveways, drainage, and concrete mix. #21A / Crusher run: compactable base for driveways and pads. #4 stone (1.5-inch): large drainage applications, French drains. #89 stone (⅜-inch): small drainage, septic fields. Pea gravel (⅜-inch round): decorative paths, playgrounds. The size affects compaction and drainage — use the right stone for your application.',
    },
    {
      question: 'How much does crushed stone cost?',
      answer:
        'Crushed stone costs $15–$50 per ton depending on stone type and region. Common prices: #57 limestone $20–$35/ton, crusher run $15–$25/ton, decorative crushed granite $30–$50/ton. Delivery typically adds $50–$150. For a 10 × 10 ft area at 4-inch depth needing 1.85 tons at $25/ton, material cost is about $46 plus delivery. Use the cost estimator in the calculator above to get your project total.',
    },
    {
      question: 'How much aggregate do I need for drainage?',
      answer:
        'For a French drain or drainage trench, use #57 stone at 6–12 inches (150–300 mm) deep surrounding the perforated pipe. For a dry well (soakaway pit), fill the hole with clean stone. Calculate the volume of the trench or pit using length × width × depth, then convert to tons. Drainage applications typically use more aggregate depth than driveways — 8–12 inches is common.',
    },
    {
      question: 'Should I add extra when ordering aggregate?',
      answer:
        'Order 5–10% extra for compaction loss, uneven ground, and delivery variation. Aggregate compacts approximately 15–25% after installation and traffic, so your finished layer will be shallower than the loose depth measured before compaction. If your calculation gives 5 tons, order 5.5 tons. The cost of the extra material is far less than the cost of a second delivery.',
    },
  ],
};
