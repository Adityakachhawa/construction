import type {
  CalculatorConfig,
  CalculatorInputMap,
  CalculatorOutputMap,
  UnitSystem,
} from './_types';
import { rectVolumeImperial, rectVolumeMetric, tonsFromYards, tonsFromMeters } from './volume-engine';

const DENSITY_IMPERIAL = 1.4;   // tons/yd³
const DENSITY_METRIC   = 1.52;  // tonnes/m³

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

export const gravelCalculator: CalculatorConfig = {
  slug: 'gravel-calculator',
  name: 'Gravel Calculator',
  category: 'excavation',
  description:
    'Calculate how much gravel you need for driveways, paths, and landscaping. Get cubic yards, cubic feet, cubic meters, and tons of gravel instantly.',
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
      min: 1,
      max: 36,
      step: 0.5,
      defaultValue: 4,
      required: true,
      onlyIn: 'imperial',
      helpText: 'Driveways: 4–6 in. Paths: 2–4 in. Decorative: 2–3 in.',
    },
    {
      id: 'density',
      label: 'Material Density',
      type: 'number',
      unit: 'tons/yd³',
      min: 0.1,
      max: 5,
      step: 0.01,
      defaultValue: 1.4,
      onlyIn: 'imperial',
      helpText: 'Default is 1.4 tons/yd³. Actual density varies by moisture and material type.',
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
      min: 25,
      max: 900,
      step: 5,
      defaultValue: 100,
      defaultValueMetric: 100,
      required: true,
      onlyIn: 'metric',
      helpText: 'Driveways: 100–150 mm. Paths: 50–100 mm.',
    },
    {
      id: 'density',
      label: 'Material Density',
      type: 'number',
      unit: 't/m³',
      min: 0.1,
      max: 5,
      step: 0.01,
      defaultValue: 1.52,
      defaultValueMetric: 1.52,
      onlyIn: 'metric',
      helpText: 'Default is 1.52 t/m³. Actual density varies by moisture and material type.',
    }
  ],
  outputs: [
    {
      id: 'cubic_yards',
      label: 'Cubic Yards',
      unit: 'yd³',
      format: 'volume',
      primary: true,
      description: 'Standard US gravel order unit',
    },
    {
      id: 'tons',
      label: 'Tons of Gravel',
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
  relatedCalculators: ['mulch-calculator', 'sand-calculator', 'concrete-slab-calculator'],
  seo: {
    title: 'Gravel Calculator — Cubic Yards & Tons',
    description:
      'Free gravel calculator — enter length, width, and depth to instantly calculate cubic yards, cubic feet, cubic meters, and tons of gravel for driveways, paths, and landscaping.',
    h1: 'Gravel Calculator',
    focusKeyword: 'gravel calculator',
  },
  schema: {
    appType: 'Construction Calculator',
    features: [
      'Calculate gravel in cubic yards',
      'Calculate tons of gravel needed',
      'Calculate gravel in cubic feet and cubic meters',
      'Feet and inches input support',
      'Metric (meters and millimeters) support',
      'Gravel depth guide for driveways and paths',
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
      description: 'There are 27 cubic feet in one cubic yard — the standard US gravel order unit',
    },
    {
      label: 'Calculate tons of gravel',
      formula: 'Tons = Cubic Yards × Density',
      description: 'Tonnage depends on material density, which varies by moisture and exact material type.',
    },
  ],
  faq: [
    {
      question: 'How much gravel do I need for a driveway?',
      answer:
        'For a standard gravel driveway, you need 4–6 inches of depth. Enter your driveway length and width above with a 4-inch depth as a starting point. A 100 ft × 12 ft driveway at 4 inches deep requires approximately 14.8 cubic yards (about 21 tons) of gravel.',
    },
    {
      question: 'How many tons are in a cubic yard of gravel?',
      answer:
        'Standard gravel weighs approximately 2,800 lbs per cubic yard, which equals 1.4 US short tons. This varies by gravel type: pea gravel is slightly lighter (~1.25 tons/yd³), while crushed stone can be heavier (~1.5 tons/yd³).',
    },
    {
      question: 'What depth of gravel should I use?',
      answer:
        'Recommended depths: driveways 4–6 inches, walkways and paths 2–4 inches, decorative landscaping 2–3 inches, drainage base layers 6–12 inches. Thicker layers resist displacement and last longer but cost more.',
    },
    {
      question: 'How do I calculate gravel for an irregular area?',
      answer:
        'Break the area into rectangles, run this calculator for each section, then add the results together. For circular areas, use π × r² for the area, then multiply by depth. For L-shaped areas, split into two rectangles.',
    },
    {
      question: 'What type of gravel should I use for a driveway?',
      answer:
        'Crushed stone (#57 stone) is the most popular driveway gravel — it packs well and drains effectively. Pea gravel looks attractive but shifts under traffic. Road base (crusher run) provides excellent stability for a base layer. Always use 3 layers: a 6-inch base of road base, 4 inches of #57 stone, and 2 inches of pea gravel or #10 screenings on top.',
    },
    {
      question: 'How do I convert cubic yards of gravel to tons?',
      answer:
        'Multiply cubic yards by 1.4 to get US short tons (e.g., 10 yd³ × 1.4 = 14 tons). For metric, multiply cubic meters by 1.52 to get metric tonnes. Gravel suppliers typically sell by the ton, so this conversion is essential when ordering.',
    },
    {
      question: 'Should I add extra gravel when ordering?',
      answer:
        'Yes — order 10–15% extra to account for compaction, uneven ground, and delivery variation. Gravel compacts roughly 20–30% after installation, so your finished layer will be shallower than the loose depth.',
    },
    {
      question: 'How much does a cubic yard of gravel cost?',
      answer:
        'Gravel costs $15–$75 per cubic yard depending on type and location. Pea gravel runs $15–$30/yd³, crushed stone $20–$40/yd³, and specialty decorative gravels up to $75/yd³. Delivery typically adds $50–$150 depending on distance.',
    },
  ],
  orderCallout: true,
  wasteFactor: {
    default: 10,
    range: '10–15%',
    notes: 'Gravel compacts and settles after spreading. Add 10–15% to reach your target finished depth.',
  },
  costRange: {
    low: 15,
    high: 75,
    unit: 'per cubic yard (material only)',
  },
};
