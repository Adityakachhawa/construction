import type {
  CalculatorConfig,
  CalculatorInputMap,
  CalculatorOutputMap,
  UnitSystem,
} from './_types';
import { rectVolumeImperial, rectVolumeMetric, tonsFromYards, tonsFromMeters } from './volume-engine';

const DENSITY_IMPERIAL = 1.35;  // tons/yd³
const DENSITY_METRIC   = 1.46;  // tonnes/m³

function formula(inputs: CalculatorInputMap, unitSystem: UnitSystem): CalculatorOutputMap {
  if (unitSystem === 'imperial') {
    const vol = rectVolumeImperial(inputs, 'depth');
    return { ...vol, tons: tonsFromYards(vol.cubic_yards, DENSITY_IMPERIAL) };
  } else {
    const vol = rectVolumeMetric(inputs, 'depth_mm');
    return { ...vol, tons: tonsFromMeters(vol.cubic_meters, DENSITY_METRIC) };
  }
}

export const sandCalculator: CalculatorConfig = {
  slug: 'sand-calculator',
  name: 'Sand Calculator',
  category: 'excavation',
  description:
    'Calculate how much sand you need for leveling, paver bases, sandboxes, and construction. Get cubic yards, cubic feet, cubic meters, and tons of sand instantly.',
  inputs: [
    // ── Imperial ──────────────────────────────────────
    {
      id: 'length_ft',
      label: 'Length',
      type: 'number',
      unit: 'ft',
      min: 0,
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
      min: 0,
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
      min: 0.5,
      max: 24,
      step: 0.5,
      defaultValue: 2,
      required: true,
      onlyIn: 'imperial',
      helpText: 'Paver base: 1 in. Leveling: 0.5–1 in. Sandbox: 6–12 in.',
    },
    // ── Metric ────────────────────────────────────────
    {
      id: 'length_m',
      label: 'Length',
      type: 'number',
      unit: 'm',
      min: 0,
      max: 3000,
      step: 0.01,
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
      min: 0,
      max: 3000,
      step: 0.01,
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
      min: 10,
      max: 600,
      step: 5,
      defaultValue: 50,
      defaultValueMetric: 50,
      required: true,
      onlyIn: 'metric',
      helpText: 'Paver base: 25 mm. Leveling: 10–25 mm. Sandbox: 150–300 mm.',
    },
  ],
  outputs: [
    {
      id: 'cubic_yards',
      label: 'Cubic Yards',
      unit: 'yd³',
      format: 'volume',
      primary: true,
      description: 'Standard US sand order unit',
    },
    {
      id: 'tons',
      label: 'Tons of Sand',
      unit: 'tons',
      format: 'weight',
      description: 'Based on ~1.35 tons per cubic yard (dry loose sand)',
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
  relatedCalculators: ['gravel-calculator', 'mulch-calculator', 'concrete-slab-calculator'],
  seo: {
    title: 'Sand Calculator — Cubic Yards & Tons',
    description:
      'Free sand calculator — enter length, width, and depth to instantly calculate cubic yards, cubic feet, cubic meters, and tons of sand for paver bases, leveling, sandboxes, and construction.',
    h1: 'Sand Calculator',
    focusKeyword: 'sand calculator',
  },
  schema: {
    appType: 'Construction Calculator',
    features: [
      'Calculate sand in cubic yards',
      'Calculate tons of sand needed',
      'Calculate sand in cubic feet and cubic meters',
      'Feet and inches input support',
      'Metric (meters and millimeters) support',
      'Sand depth guide for paver bases, leveling, and sandboxes',
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
      description: 'There are 27 cubic feet in one cubic yard — the standard US sand order unit',
    },
    {
      label: 'Calculate tons of sand',
      formula: 'Tons = Cubic Yards × 1.35',
      description: 'Dry loose sand weighs approximately 2,700 lbs per cubic yard (1.35 short tons)',
    },
  ],
  faq: [
    {
      question: 'How much sand do I need for a paver base?',
      answer:
        'Paver installation requires 1 inch of compacted sand as the bedding layer on top of a compacted gravel base. For a 200 sq ft patio, that is 200 × (1/12) = 16.7 cubic feet, or about 0.62 cubic yards (roughly 0.84 tons). Enter your patio dimensions above with a 1-inch depth to get the exact amount.',
    },
    {
      question: 'How many tons are in a cubic yard of sand?',
      answer:
        'Dry loose sand weighs approximately 2,700 lbs per cubic yard, which equals 1.35 US short tons. Wet or compacted sand is heavier — up to 1.5 tons/yd³. Mason sand and fine play sand are on the lighter end; coarse construction sand is on the heavier end.',
    },
    {
      question: 'What depth of sand should I use for a paver base?',
      answer:
        'Use exactly 1 inch of sand as the bedding layer for pavers — this is the industry standard. Too much sand (over 1.5 inches) causes pavers to shift and sink. The depth your calculator should include is: 6 inches of compacted gravel base + 1 inch of sand + paver thickness.',
    },
    {
      question: 'How much sand do I need for a sandbox?',
      answer:
        'Most children sandboxes need 6–12 inches of play sand depth. A 4 ft × 6 ft sandbox at 6 inches deep requires 12 cubic feet or about 0.44 cubic yards. Use washed play sand (not construction sand) in sandboxes — it is rounded, dust-free, and safe for children.',
    },
    {
      question: 'What is the difference between play sand and construction sand?',
      answer:
        'Play sand is washed, rounded, and dust-reduced — safe for children and ideal for sandboxes. Construction sand (sharp sand, concrete sand) has angular particles that interlock and compact — used for paver bases, mortar, and drainage. Mason sand is finer and used for tuck-pointing and smooth mortar. Never use construction sand in a sandbox.',
    },
    {
      question: 'How do I convert cubic yards of sand to tons?',
      answer:
        'Multiply cubic yards by 1.35 to get US short tons (e.g., 5 yd³ × 1.35 = 6.75 tons). For metric, multiply cubic meters by 1.46 to get metric tonnes. Sand is often sold by the ton for large orders and by the bag for small projects.',
    },
    {
      question: 'Should I add extra sand when ordering?',
      answer:
        'Yes — order 10–15% extra. Sand compacts after installation, especially when wet, and some is always lost to spillage and uneven distribution. For paver bases, compact the sand before laying pavers, which will reduce the depth by 10–20%.',
    },
    {
      question: 'How much does a ton of sand cost?',
      answer:
        'Bulk sand costs $10–$40 per ton depending on type and location. Play sand costs the most ($25–$40/ton), masonry sand runs $15–$30/ton, and fill sand is the cheapest ($10–$20/ton). Bagged sand costs significantly more per cubic foot — typically $5–$8 per 50-lb bag.',
    },
  ],
};
