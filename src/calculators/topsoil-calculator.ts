import type {
  CalculatorConfig,
  CalculatorInputMap,
  CalculatorOutputMap,
  UnitSystem,
} from './_types';
import { rectVolumeImperial, rectVolumeMetric, tonsFromYards, tonsFromMeters } from './volume-engine';

// Topsoil density: ~1.1 tons/yd³ (loose screened topsoil ~1,800 lbs/yd³)
const DENSITY_IMPERIAL = 1.1;
// Metric: ~1.2 tonnes/m³
const DENSITY_METRIC   = 1.2;

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

export const topsoilCalculator: CalculatorConfig = {
  slug: 'topsoil-calculator',
  name: 'Topsoil Calculator',
  category: 'excavation',
  description:
    'Calculate how much topsoil you need for a garden bed, lawn, or landscaping project. Enter length, width, and depth to get cubic yards, cubic feet, cubic meters, and tons of topsoil.',
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
      defaultValue: 6,
      required: true,
      onlyIn: 'imperial',
      helpText: 'New lawn: 4–6 in. Raised garden bed: 8–12 in. Topdressing: 1–2 in.',
    },
    {
      id: 'density',
      label: 'Material Density',
      type: 'number',
      unit: 'tons/yd³',
      min: 0.1,
      max: 5,
      step: 0.01,
      defaultValue: 1.1,
      onlyIn: 'imperial',
      helpText: 'Default is 1.1 tons/yd³. Actual density varies by moisture and material type.',
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
      step: 10,
      defaultValue: 150,
      defaultValueMetric: 150,
      required: true,
      onlyIn: 'metric',
      helpText: 'New lawn: 100–150 mm. Raised garden bed: 200–300 mm. Topdressing: 25–50 mm.',
    },
    {
      id: 'density',
      label: 'Material Density',
      type: 'number',
      unit: 't/m³',
      min: 0.1,
      max: 5,
      step: 0.01,
      defaultValue: 1.2,
      defaultValueMetric: 1.2,
      onlyIn: 'metric',
      helpText: 'Default is 1.2 t/m³. Actual density varies by moisture and material type.',
    }
  ],
  outputs: [
    {
      id: 'cubic_yards',
      label: 'Cubic Yards',
      unit: 'yd³',
      format: 'volume',
      primary: true,
      description: 'Standard US topsoil order unit',
    },
    {
      id: 'tons',
      label: 'Tons of Topsoil',
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
  relatedCalculators: ['gravel-calculator', 'mulch-calculator', 'sand-calculator'],
  seo: {
    title: 'Topsoil Calculator — Cubic Yards, Tons & Cost Estimator',
    description:
      'Free topsoil calculator — enter length, width, and depth to calculate cubic yards, cubic feet, cubic meters, and tons of topsoil needed for lawns, garden beds, and landscaping.',
    h1: 'Topsoil Calculator',
    focusKeyword: 'topsoil calculator',
  },
  schema: {
    appType: 'Construction Calculator',
    features: [
      'Calculate topsoil in cubic yards',
      'Calculate tons of topsoil needed',
      'Calculate topsoil in cubic feet and cubic meters',
      'Depth guide for lawns, garden beds, and topdressing',
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
      description: 'Topsoil is typically sold by the cubic yard in the US',
    },
    {
      label: 'Calculate weight in tons',
      formula: 'Tons = Cubic Yards × Density',
      description: 'Screened topsoil weighs approximately 2,200 lbs per cubic yard (1.1 short tons)',
    },
  ],
  faq: [
    {
      question: 'How much topsoil do I need?',
      answer:
        'Multiply the length × width × depth (all in feet) to get cubic feet, then divide by 27 to get cubic yards. For a 10 × 10 ft garden bed at 6-inch depth: 10 × 10 × 0.5 = 50 ft³ ÷ 27 = 1.85 yd³. Most landscapers round up to the nearest half-yard. The calculator above handles the math — just enter your dimensions.',
    },
    {
      question: 'How deep should I put topsoil?',
      answer:
        'Recommended depths: lawn establishment or overseeding 4–6 inches (100–150 mm), vegetable and flower garden beds 8–12 inches (200–300 mm), raised beds 12–18 inches (300–450 mm), lawn topdressing 1–2 inches (25–50 mm). Deeper topsoil produces better root development and retains moisture longer, but increases material cost. For most lawn projects, 4–6 inches is the sweet spot.',
    },
    {
      question: 'How many cubic yards of topsoil do I need for a garden bed?',
      answer:
        'For a standard 4 × 8 ft raised garden bed at 12-inch depth: 4 × 8 × 1 = 32 ft³ ÷ 27 = 1.19 yd³ — order 1.5 yards to account for settling. For a 10 × 20 ft garden at 8-inch depth: 10 × 20 × 0.667 = 133 ft³ ÷ 27 = 4.9 yd³ — order 5 yards. Enter your exact dimensions in the calculator above for a precise estimate.',
    },
    {
      question: 'How much does topsoil weigh per cubic yard?',
      answer:
        'Screened, loose topsoil weighs approximately 1,800–2,200 lbs per cubic yard (about 1.0–1.1 US short tons). Clay-heavy soils weigh more — up to 2,500 lbs/yd³ (1.25 tons). Sandy loam is lighter — around 1,600 lbs/yd³ (0.8 tons). This calculator uses 1.1 tons per cubic yard as a standard estimate for screened topsoil.',
    },
    {
      question: 'How many bags of topsoil equal a cubic yard?',
      answer:
        'A standard 40 lb bag of topsoil contains about 0.75 cubic feet. One cubic yard = 27 cubic feet, so you need 27 ÷ 0.75 = 36 bags per cubic yard. A 1-cubic-foot bag takes 27 bags per yard. For small projects, bagged topsoil is convenient; for anything over 2–3 cubic yards, ordering bulk topsoil by the truckload is significantly cheaper.',
    },
    {
      question: 'How much topsoil do I need for a lawn?',
      answer:
        'For a new lawn, apply 4–6 inches of topsoil over the entire area. For a 1,000 sq ft lawn at 4-inch depth: 1,000 × (4/12) = 333 ft³ ÷ 27 = 12.3 yd³. For overseeding or topdressing an existing lawn, 1–2 inches is sufficient: 1,000 × (1.5/12) = 125 ft³ ÷ 27 = 4.6 yd³. Use the calculator above and set your area dimensions accordingly.',
    },
    {
      question: 'What is the difference between topsoil and garden soil?',
      answer:
        'Topsoil is the upper 2–8 inches of native soil, screened to remove rocks and debris. It contains mineral particles but may have low organic matter. Garden soil is a blend of topsoil, compost, and other organic amendments formulated for planting — it has higher nutrient content and better drainage. For filling a new bed or building grade, use bulk topsoil. For planting, mix topsoil with 25–30% compost.',
    },
    {
      question: 'How much does topsoil cost?',
      answer:
        'Bulk topsoil costs $12–$55 per cubic yard depending on quality, screened vs. unscreened, and region. Screened topsoil runs $20–$35/yd³; premium blended garden soil $35–$55/yd³. Delivery adds $50–$150. A 40 lb bag at a garden centre runs $3–$8 (equivalent to $80–$200+ per cubic yard). Use the cost estimator in the calculator above to see your project cost at your local price.',
    },
  ],
};
