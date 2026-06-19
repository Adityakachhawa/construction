import type {
  CalculatorConfig,
  CalculatorInputMap,
  CalculatorOutputMap,
  UnitSystem,
} from './_types';
import { rectVolumeImperial, rectVolumeMetric, tonsFromYards, tonsFromMeters } from './volume-engine';

// Hot-mix asphalt (HMA) density: ~145 lbs/ft³ → ~2.025 tons/yd³
const DENSITY_IMPERIAL = 2.025; // tons/yd³
// Metric: ~2.4 tonnes/m³
const DENSITY_METRIC   = 2.4;   // tonnes/m³

function formula(inputs: CalculatorInputMap, unitSystem: UnitSystem): CalculatorOutputMap {
  if (unitSystem === 'imperial') {
    const vol = rectVolumeImperial(inputs, 'thickness');
    return { ...vol, tons: tonsFromYards(vol.cubic_yards, DENSITY_IMPERIAL) };
  } else {
    const vol = rectVolumeMetric(inputs, 'thickness_mm');
    return { ...vol, tons: tonsFromMeters(vol.cubic_meters, DENSITY_METRIC) };
  }
}

export const asphaltCalculator: CalculatorConfig = {
  slug: 'asphalt-calculator',
  name: 'Asphalt Calculator',
  category: 'excavation',
  description:
    'Calculate how much asphalt you need for a driveway, parking lot, or road. Enter length, width, and thickness to get cubic yards, cubic feet, cubic meters, and tons of hot-mix asphalt.',
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
      defaultValue: 20,
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
      defaultValue: 12,
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
      id: 'thickness',
      label: 'Thickness',
      type: 'number',
      unit: 'in',
      min: 1,
      max: 24,
      step: 0.5,
      defaultValue: 3,
      required: true,
      onlyIn: 'imperial',
      helpText: 'Residential driveways: 2–3 in. Parking lots: 3–4 in. Roads: 4–6 in.',
    },
    // ── Metric ────────────────────────────────────────
    {
      id: 'length_m',
      label: 'Length',
      type: 'number',
      unit: 'm',
      min: 0.5,
      max: 3000,
      step: 0.1,
      defaultValue: 6,
      defaultValueMetric: 6,
      required: true,
      onlyIn: 'metric',
    },
    {
      id: 'width_m',
      label: 'Width',
      type: 'number',
      unit: 'm',
      min: 0.5,
      max: 3000,
      step: 0.1,
      defaultValue: 3.6,
      defaultValueMetric: 3.6,
      required: true,
      onlyIn: 'metric',
    },
    {
      id: 'thickness_mm',
      label: 'Thickness',
      type: 'number',
      unit: 'mm',
      min: 25,
      max: 600,
      step: 5,
      defaultValue: 75,
      defaultValueMetric: 75,
      required: true,
      onlyIn: 'metric',
      helpText: 'Residential driveways: 50–75 mm. Parking lots: 75–100 mm. Roads: 100–150 mm.',
    },
  ],
  outputs: [
    {
      id: 'tons',
      label: 'Asphalt Tons',
      unit: 'tons',
      format: 'weight',
      primary: true,
      description: 'Based on hot-mix asphalt density ~145 lbs/ft³ (2.025 tons/yd³)',
    },
    {
      id: 'cubic_yards',
      label: 'Cubic Yards',
      unit: 'yd³',
      format: 'volume',
      description: 'Loose volume before compaction',
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
    },
  ],
  formula,
  unitSystems: ['imperial', 'metric'],
  relatedCalculators: ['gravel-calculator', 'concrete-slab-calculator', 'paver-base-calculator'],
  seo: {
    title: 'Asphalt Calculator — Tonnage & Volume Estimator',
    description:
      'Free asphalt calculator — enter length, width, and thickness to calculate asphalt tonnage, cubic yards, and cubic meters for driveways, parking lots, and roads.',
    h1: 'Asphalt Calculator',
    focusKeyword: 'asphalt calculator',
  },
  schema: {
    appType: 'Construction Calculator',
    features: [
      'Calculate asphalt tonnage',
      'Calculate cubic yards of asphalt',
      'Calculate cubic feet and cubic meters',
      'Thickness guide for driveways, parking lots, and roads',
      'Based on standard hot-mix asphalt density',
      'Imperial and metric support',
      'Cost estimator',
    ],
  },
  formulaSteps: [
    {
      label: 'Convert thickness to feet',
      formula: 'Thickness (ft) = Thickness (in) ÷ 12',
      description: 'All dimensions must share the same unit before multiplying',
    },
    {
      label: 'Calculate volume in cubic feet',
      formula: 'Volume (ft³) = Length (ft) × Width (ft) × Thickness (ft)',
    },
    {
      label: 'Convert to cubic yards',
      formula: 'Volume (yd³) = Volume (ft³) ÷ 27',
    },
    {
      label: 'Calculate asphalt tonnage',
      formula: 'Tons = Cubic Yards × 2.025',
      description: 'Hot-mix asphalt weighs ~145 lbs/ft³ or ~2.025 short tons per cubic yard',
    },
  ],
  faq: [
    {
      question: 'How do I calculate how much asphalt I need?',
      answer:
        'Multiply length × width × thickness (all in feet) to get cubic feet, divide by 27 for cubic yards, then multiply by 2.025 to get US short tons. For a 20 ft × 12 ft driveway at 3-inch thickness: 20 × 12 × 0.25 = 60 ft³ ÷ 27 = 2.22 yd³ × 2.025 = 4.5 tons. Use the calculator above to skip the math.',
    },
    {
      question: 'How thick should an asphalt driveway be?',
      answer:
        'Residential driveways should be 2–3 inches of compacted hot-mix asphalt over a properly prepared base. A 2-inch surface course is the minimum for light passenger vehicles; 3 inches handles heavier vehicles and provides better longevity. Always lay asphalt over a compacted 4–8 inch gravel base — the asphalt layer alone is not enough without a solid foundation.',
    },
    {
      question: 'How many tons of asphalt do I need per square foot?',
      answer:
        'At 1-inch thickness, asphalt weighs approximately 0.057 tons per square foot (about 114 lbs/ft²). Multiply your square footage by 0.057 and then by the thickness in inches to get tons. For a 240 sq ft driveway at 3 inches: 240 × 0.057 × 3 = 41 tons. This calculator does the math for any dimensions.',
    },
    {
      question: 'What is the density of asphalt?',
      answer:
        'Standard hot-mix asphalt (HMA) has a density of approximately 145 lbs per cubic foot, which equals about 2.025 US short tons per cubic yard or 2.4 metric tonnes per cubic meter. Density varies slightly by mix design: dense-graded mixes run 140–150 lbs/ft³, open-graded (porous) asphalt is lighter at 110–130 lbs/ft³. This calculator uses 145 lbs/ft³ as a standard estimate.',
    },
    {
      question: 'How much does an asphalt driveway cost?',
      answer:
        'Asphalt paving costs $3–$7 per square foot installed, or $1,500–$10,000 for a typical residential driveway. Material cost runs $80–$160 per ton depending on location and oil prices. A 400 sq ft driveway at 3-inch depth needs about 7.5 tons; at $120/ton that\'s $900 in material plus $600–$1,200 in labor and equipment. Use the cost estimator in the calculator above with your local asphalt price per ton.',
    },
    {
      question: 'How much asphalt do I need for a parking lot?',
      answer:
        'Commercial parking lots typically use 3–4 inches of asphalt. For a 100-space parking lot at 10 × 20 ft per space (20,000 sq ft) with 3.5-inch asphalt: 20,000 × (3.5/12) / 27 × 2.025 ≈ 431 tons. Enter your exact dimensions in the calculator above — just multiply length by width if you know the total area, or run it per section.',
    },
    {
      question: 'What is the difference between asphalt and blacktop?',
      answer:
        'Asphalt and blacktop both refer to hot-mix asphalt pavement, but contractors use the terms differently by region. "Asphalt" often refers to higher-quality mixes with more aggregate and lower bitumen content, used for roads and commercial applications. "Blacktop" often refers to a slightly softer, higher-bitumen mix used for driveways and residential applications. Both are calculated the same way — the density difference is negligible for estimating purposes.',
    },
    {
      question: 'How much asphalt do I need for a 2-car driveway?',
      answer:
        'A standard 2-car driveway is 20 ft wide × 20 ft long = 400 sq ft. At 3-inch thickness: 400 × (3/12) / 27 × 2.025 ≈ 7.5 tons of asphalt. For a longer 2-car driveway (20 × 40 ft = 800 sq ft): about 15 tons. Enter your actual dimensions above — driveway lengths vary widely from 20 ft to over 100 ft.',
    },
  ],
  orderCallout: true,
  wasteFactor: {
    default: 10,
    range: '10–15%',
    notes: 'Irregular edges, curves, and areas around drain grates need extra material. Steep grades also increase waste.',
  },
  costRange: {
    low: 100,
    high: 200,
    unit: 'per ton (material only)',
  },
};
