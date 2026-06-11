import type {
  CalculatorConfig,
  CalculatorInputMap,
  CalculatorOutputMap,
  UnitSystem,
} from './_types';
import { cylVolumeImperial, cylVolumeMetric, bagsFromFeet } from './volume-engine';

// 80 lb bag yields ~0.60 ft³ of concrete
const BAG_CUBIC_FEET = 0.60;

function formula(inputs: CalculatorInputMap, unitSystem: UnitSystem): CalculatorOutputMap {
  if (unitSystem === 'imperial') {
    const diameterIn = Number(inputs.diameter_in ?? 10);
    const heightIn   = Number(inputs.height_ft   ?? 4) * 12 + Number(inputs.height_in ?? 0);
    const columns    = Math.max(1, Math.round(Number(inputs.columns ?? 1)));

    const single = cylVolumeImperial(diameterIn, heightIn);
    const bags   = bagsFromFeet(single.cubic_feet * columns, BAG_CUBIC_FEET);

    return {
      cubic_yards:  Math.round(single.cubic_yards  * columns * 1000) / 1000,
      cubic_feet:   Math.round(single.cubic_feet   * columns * 1000) / 1000,
      cubic_meters: Math.round(single.cubic_meters * columns * 1000) / 1000,
      bags,
    };
  } else {
    const diameterMm = Number(inputs.diameter_mm ?? 250);
    const heightMm   = Number(inputs.height_m    ?? 1.2) * 1000;
    const columns    = Math.max(1, Math.round(Number(inputs.columns ?? 1)));

    const single = cylVolumeMetric(diameterMm, heightMm);
    const bags   = bagsFromFeet(single.cubic_feet * columns, BAG_CUBIC_FEET);

    return {
      cubic_meters: Math.round(single.cubic_meters * columns * 1000) / 1000,
      cubic_feet:   Math.round(single.cubic_feet   * columns * 1000) / 1000,
      cubic_yards:  Math.round(single.cubic_yards  * columns * 1000) / 1000,
      bags,
    };
  }
}

export const concreteColumnCalculator: CalculatorConfig = {
  slug: 'concrete-column-calculator',
  name: 'Concrete Column Calculator',
  category: 'concrete',
  description:
    'Calculate how much concrete you need for round columns, piers, and sonotubes. Enter diameter, height, and number of columns to get cubic yards, cubic feet, cubic meters, and 80 lb bags.',
  inputs: [
    // ── Imperial ──────────────────────────────────────
    {
      id: 'diameter_in',
      label: 'Column Diameter',
      type: 'number',
      unit: 'in',
      min: 2,
      max: 120,
      step: 1,
      defaultValue: 10,
      required: true,
      onlyIn: 'imperial',
      helpText: 'Common sonotube sizes: 8 in, 10 in, 12 in, 16 in.',
    },
    {
      id: 'height_ft',
      label: 'Column Height',
      type: 'number',
      unit: 'ft',
      min: 0,
      max: 100,
      step: 1,
      defaultValue: 4,
      required: true,
      onlyIn: 'imperial',
    },
    {
      id: 'height_in',
      label: 'Column Height (in)',
      type: 'number',
      unit: 'in',
      min: 0,
      max: 11,
      step: 1,
      defaultValue: 0,
      onlyIn: 'imperial',
      groupWith: 'height_ft',
    },
    {
      id: 'columns',
      label: 'Number of Columns',
      type: 'number',
      unit: 'columns',
      min: 1,
      max: 500,
      step: 1,
      defaultValue: 1,
      required: true,
      onlyIn: 'imperial',
    },
    // ── Metric ────────────────────────────────────────
    {
      id: 'diameter_mm',
      label: 'Column Diameter',
      type: 'number',
      unit: 'mm',
      min: 50,
      max: 3000,
      step: 25,
      defaultValue: 250,
      defaultValueMetric: 250,
      required: true,
      onlyIn: 'metric',
      helpText: 'Common sizes: 200 mm, 250 mm, 300 mm, 400 mm.',
    },
    {
      id: 'height_m',
      label: 'Column Height',
      type: 'number',
      unit: 'm',
      min: 0.1,
      max: 30,
      step: 0.1,
      defaultValue: 1.2,
      defaultValueMetric: 1.2,
      required: true,
      onlyIn: 'metric',
    },
    {
      id: 'columns',
      label: 'Number of Columns',
      type: 'number',
      unit: 'columns',
      min: 1,
      max: 500,
      step: 1,
      defaultValue: 1,
      defaultValueMetric: 1,
      required: true,
      onlyIn: 'metric',
    },
  ],
  outputs: [
    {
      id: 'bags',
      label: '80 lb Bags Required',
      unit: 'bags',
      format: 'number',
      primary: true,
      description: 'Based on 0.60 ft³ yield per 80 lb bag',
    },
    {
      id: 'cubic_yards',
      label: 'Cubic Yards',
      unit: 'yd³',
      format: 'volume',
      description: 'Total for all columns combined',
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
  relatedCalculators: ['concrete-slab-calculator', 'deck-footing-calculator', 'rebar-calculator'],
  seo: {
    title: 'Concrete Column Calculator — Sonotube & Pier Estimator',
    description:
      'Free concrete column calculator — enter diameter, height, and number of columns to calculate cubic yards, cubic feet, cubic meters, and 80 lb bags needed for sonotubes, piers, and round footings.',
    h1: 'Concrete Column Calculator',
    focusKeyword: 'concrete column calculator',
  },
  schema: {
    appType: 'Construction Calculator',
    features: [
      'Calculate concrete for round columns and piers',
      'Sonotube concrete volume estimator',
      'Calculate cubic yards, feet, and meters',
      'Calculate 80 lb bags required',
      'Multiple columns supported',
      'Imperial and metric support',
      'Cost estimator',
    ],
  },
  formulaSteps: [
    {
      label: 'Calculate cross-sectional area',
      formula: 'Area (ft²) = π × (Diameter ÷ 2)²',
      description: 'Converts diameter in inches to radius in feet before squaring',
    },
    {
      label: 'Calculate volume of one column',
      formula: 'Volume (ft³) = Area × Height (ft)',
    },
    {
      label: 'Scale to all columns',
      formula: 'Total Volume = Volume per column × Number of columns',
    },
    {
      label: 'Calculate bags required',
      formula: 'Bags = ⌈Total ft³ ÷ 0.60⌉',
      description: 'One 80 lb bag of concrete yields approximately 0.60 cubic feet',
    },
  ],
  faq: [
    {
      question: 'How do I calculate concrete for a round column or sonotube?',
      answer:
        'Use the cylinder formula: Volume = π × r² × height. Convert diameter to radius (diameter ÷ 2), convert all measurements to feet, then multiply. For a 10-inch diameter, 4-foot tall sonotube: r = 10/2/12 = 0.417 ft, Volume = 3.14159 × 0.417² × 4 = 2.18 ft³. Divide by 0.60 to get bags: ⌈2.18 ÷ 0.60⌉ = 4 bags. This calculator does the math for any size.',
    },
    {
      question: 'What size sonotube do I need for a deck?',
      answer:
        'Deck pier sizing depends on load and local frost depth. Common residential deck footings use 10-inch (250 mm) sonotubes for interior posts and 12-inch (300 mm) for corner or heavily loaded posts. Your local building code specifies minimum diameter and depth requirements — depth must extend below the frost line, which ranges from 12 inches in warm climates to 60+ inches in cold northern regions.',
    },
    {
      question: 'How many 80 lb bags of concrete do I need for a sonotube?',
      answer:
        'An 80 lb bag of concrete yields approximately 0.60 cubic feet. Common sonotube volumes: 8 in × 3 ft deep = 1.05 ft³ = 2 bags; 10 in × 4 ft deep = 2.18 ft³ = 4 bags; 12 in × 4 ft deep = 3.14 ft³ = 6 bags; 16 in × 4 ft deep = 5.59 ft³ = 10 bags. For large projects, ordering ready-mix concrete is more economical than bags.',
    },
    {
      question: 'How deep should a concrete pier footing be?',
      answer:
        'Pier footings must extend below the local frost depth to prevent heaving. Minimum depths by region: Southern US (no frost) 12–18 inches, Mid-Atlantic 24–30 inches, Midwest 36–42 inches, Northern states and Canada 48–60+ inches. Check your local building code — many jurisdictions require engineered footings for decks and structures. The frost depth map from your local authority is the authoritative reference.',
    },
    {
      question: 'What is the difference between a concrete pier and a concrete footing?',
      answer:
        'A concrete footing is a horizontal pad that distributes load over a wide area of soil. A concrete pier (or column) is a vertical cylinder that transfers load down to below the frost line. Most deck and post construction uses a combination: a round sonotube pier that sits on a flared footing bell, or a simple cylindrical tube poured full depth. This calculator covers the cylindrical pier volume — add a separate calculation for any footing bell.',
    },
    {
      question: 'Can I use bagged concrete for sonotubes, or do I need ready-mix?',
      answer:
        'Bagged concrete is practical for up to about 10–15 bags per project. Mix one bag at a time in a wheelbarrow or use a small mixer. For larger projects (20+ bags or multiple large tubes), ready-mix concrete is faster, cheaper per cubic yard, and produces more consistent results. Ready-mix is typically sold in 1-yard minimum loads — use this calculator to see if your total volume justifies an order.',
    },
    {
      question: 'How much does it cost to fill a sonotube with concrete?',
      answer:
        'An 80 lb bag of concrete costs $5–$8. A 10-inch × 4-foot sonotube needs 4 bags at $6 each = $24 in material. For 8 deck piers of the same size: 32 bags = $192–$256 in concrete alone. Add sonotube forms ($8–$20 each), rebar or post-base hardware ($10–$30 per pier), and labor. Ready-mix at $150–$200 per yard becomes cost-competitive when total volume exceeds 0.5 cubic yards.',
    },
    {
      question: 'How do I calculate concrete for multiple columns?',
      answer:
        'Calculate the volume for a single column (π × r² × height) and multiply by the number of columns. Enter the count in the "Number of Columns" field above — the calculator handles the multiplication automatically and gives you the total bags and volume for the entire project in one step.',
    },
  ],
};
