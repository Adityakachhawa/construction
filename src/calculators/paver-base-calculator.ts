import type {
  CalculatorConfig,
  CalculatorInputMap,
  CalculatorOutputMap,
  UnitSystem,
} from './_types';
import { rectVolFt3, rectVolM3 } from './volume-engine';

function formula(inputs: CalculatorInputMap, unitSystem: UnitSystem): CalculatorOutputMap {
  if (unitSystem === 'imperial') {
    const lengthFt   = Number(inputs.length_ft ?? 12) + Number(inputs.length_in ?? 0) / 12;
    const widthFt    = Number(inputs.width_ft  ?? 10) + Number(inputs.width_in  ?? 0) / 12;
    const baseDepIn  = Number(inputs.base_depth  ?? 4);
    const sandDepIn  = Number(inputs.sand_depth  ?? 1);

    const gravel = rectVolFt3(lengthFt, widthFt, baseDepIn / 12);
    const sand   = rectVolFt3(lengthFt, widthFt, sandDepIn / 12);

    return {
      gravel_cubic_yards:  gravel.cubic_yards,
      gravel_cubic_feet:   gravel.cubic_feet,
      gravel_cubic_meters: gravel.cubic_meters,
      sand_cubic_yards:    sand.cubic_yards,
      sand_cubic_feet:     sand.cubic_feet,
      sand_cubic_meters:   sand.cubic_meters,
    };
  } else {
    const lengthM    = Number(inputs.length_m ?? 3.6);
    const widthM     = Number(inputs.width_m  ?? 3.0);
    const baseDepMm  = Number(inputs.base_depth_mm ?? 100);
    const sandDepMm  = Number(inputs.sand_depth_mm ?? 25);

    const gravel = rectVolM3(lengthM, widthM, baseDepMm / 1000);
    const sand   = rectVolM3(lengthM, widthM, sandDepMm / 1000);

    return {
      gravel_cubic_meters: gravel.cubic_meters,
      gravel_cubic_feet:   gravel.cubic_feet,
      gravel_cubic_yards:  gravel.cubic_yards,
      sand_cubic_meters:   sand.cubic_meters,
      sand_cubic_feet:     sand.cubic_feet,
      sand_cubic_yards:    sand.cubic_yards,
    };
  }
}

export const paverBaseCalculator: CalculatorConfig = {
  slug: 'paver-base-calculator',
  name: 'Paver Base Calculator',
  category: 'masonry',
  description:
    'Calculate gravel base and sand bedding volumes for paver patios, driveways, and walkways. Get cubic yards, cubic feet, and cubic meters for both materials.',
  inputs: [
    // ── Imperial ──────────────────────────────────────
    {
      id: 'length_ft',
      label: 'Length',
      type: 'number',
      unit: 'ft',
      min: 1,
      max: 1000,
      step: 1,
      defaultValue: 12,
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
      max: 1000,
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
      id: 'base_depth',
      label: 'Gravel Base Depth',
      type: 'number',
      unit: 'in',
      min: 2,
      max: 18,
      step: 0.5,
      defaultValue: 4,
      required: true,
      onlyIn: 'imperial',
      helpText: 'Patios & walkways: 4–6 in. Driveways: 6–8 in.',
    },
    {
      id: 'sand_depth',
      label: 'Sand Bedding Depth',
      type: 'number',
      unit: 'in',
      min: 0.5,
      max: 2,
      step: 0.25,
      defaultValue: 1,
      required: true,
      onlyIn: 'imperial',
      helpText: 'Standard bedding layer: 1 in. Never exceed 1.5 in.',
    },
    // ── Metric ────────────────────────────────────────
    {
      id: 'length_m',
      label: 'Length',
      type: 'number',
      unit: 'm',
      min: 0.3,
      max: 300,
      step: 0.1,
      defaultValue: 3.6,
      defaultValueMetric: 3.6,
      required: true,
      onlyIn: 'metric',
    },
    {
      id: 'width_m',
      label: 'Width',
      type: 'number',
      unit: 'm',
      min: 0.3,
      max: 300,
      step: 0.1,
      defaultValue: 3.0,
      defaultValueMetric: 3.0,
      required: true,
      onlyIn: 'metric',
    },
    {
      id: 'base_depth_mm',
      label: 'Gravel Base Depth',
      type: 'number',
      unit: 'mm',
      min: 50,
      max: 450,
      step: 5,
      defaultValue: 100,
      defaultValueMetric: 100,
      required: true,
      onlyIn: 'metric',
      helpText: 'Patios: 100–150 mm. Driveways: 150–200 mm.',
    },
    {
      id: 'sand_depth_mm',
      label: 'Sand Bedding Depth',
      type: 'number',
      unit: 'mm',
      min: 10,
      max: 50,
      step: 5,
      defaultValue: 25,
      defaultValueMetric: 25,
      required: true,
      onlyIn: 'metric',
      helpText: 'Standard bedding layer: 25 mm.',
    },
  ],
  outputs: [
    {
      id: 'gravel_cubic_yards',
      label: 'Gravel Base',
      unit: 'yd³',
      format: 'volume',
      primary: true,
      description: 'Compacted crushed stone base layer',
    },
    {
      id: 'gravel_cubic_feet',
      label: 'Gravel Base',
      unit: 'ft³',
      format: 'volume',
    },
    {
      id: 'gravel_cubic_meters',
      label: 'Gravel Base',
      unit: 'm³',
      format: 'volume',
    },
    {
      id: 'sand_cubic_yards',
      label: 'Bedding Sand',
      unit: 'yd³',
      format: 'volume',
      description: 'Fine sand leveling layer under pavers',
    },
    {
      id: 'sand_cubic_feet',
      label: 'Bedding Sand',
      unit: 'ft³',
      format: 'volume',
    },
    {
      id: 'sand_cubic_meters',
      label: 'Bedding Sand',
      unit: 'm³',
      format: 'volume',
    },
  ],
  formula,
  unitSystems: ['imperial', 'metric'],
  relatedCalculators: ['sand-calculator', 'gravel-calculator', 'retaining-wall-calculator'],
  seo: {
    title: 'Paver Base Calculator — Gravel & Sand for Patios',
    description:
      'Free paver base calculator — enter patio length, width, and base depth to calculate gravel base and sand bedding volumes in cubic yards, cubic feet, and cubic meters.',
    h1: 'Paver Base Calculator',
    focusKeyword: 'paver base calculator',
  },
  schema: {
    appType: 'Construction Calculator',
    features: [
      'Calculate paver gravel base volume',
      'Calculate sand bedding volume',
      'Cubic yards, cubic feet, and cubic meters',
      'Imperial and metric support',
      'Patio, driveway, and walkway base depths',
    ],
  },
  formulaSteps: [
    {
      label: 'Calculate gravel base volume',
      formula: 'Gravel (ft³) = Length (ft) × Width (ft) × Base Depth (ft)',
      description: 'Base depth is entered in inches and converted to feet',
    },
    {
      label: 'Calculate sand bedding volume',
      formula: 'Sand (ft³) = Length (ft) × Width (ft) × Sand Depth (ft)',
    },
    {
      label: 'Convert to cubic yards',
      formula: 'Volume (yd³) = Volume (ft³) ÷ 27',
    },
  ],
  faq: [
    {
      question: 'How much paver base do I need?',
      answer:
        'For a paver patio or walkway, use 4–6 inches of compacted crushed stone base plus 1 inch of sand bedding. A 12 × 10 ft patio with a 4-inch base needs 12 × 10 × (4/12) = 40 cubic feet (1.48 yd³) of gravel, and 12 × 10 × (1/12) = 10 cubic feet (0.37 yd³) of sand. Use the calculator above for your exact dimensions.',
    },
    {
      question: 'How deep should the paver base be?',
      answer:
        'Recommended paver base depths: foot traffic patios and walkways 4–6 inches (100–150 mm), light vehicle driveways 6–8 inches (150–200 mm), heavy vehicle areas 8–12 inches (200–300 mm). Always compact the base in 2–3 inch lifts using a plate compactor for best results.',
    },
    {
      question: 'What type of gravel is used for a paver base?',
      answer:
        'Use compactable crushed stone — also called road base, crusher run, or Class II base. Avoid rounded pea gravel or washed stone, which will not compact properly and allows pavers to shift. Crushed stone locks together when compacted to create a rigid, stable base.',
    },
    {
      question: 'How thick should the sand bedding layer be under pavers?',
      answer:
        'The sand bedding layer should be exactly 1 inch (25 mm) — no more, no less. Thicker sand allows pavers to rock and sink. The sand bedding is a leveling layer, not a structural base — it fine-tunes elevation after the compacted gravel base is in place. Use coarse concrete sand or bedding sand, not fine play sand.',
    },
    {
      question: 'Do I need to compact the paver base?',
      answer:
        'Yes — compaction is essential. An uncompacted base will settle unevenly after installation, causing pavers to tip and crack. Compact the gravel base in 2–3 inch lifts using a plate compactor. After the final lift, compact until no movement is visible. Do not compact the sand bedding layer — screed it flat and lay pavers directly.',
    },
    {
      question: 'What is the difference between paver base and paver sand?',
      answer:
        'Paver base (crushed stone) is the structural layer that carries load and prevents settling — it should be 4–8 inches thick. Paver sand is the thin bedding layer (1 inch) that levels the surface and allows minor adjustments when setting pavers. Together they form the two-layer system required for a stable paver installation.',
    },
    {
      question: 'How do I calculate gravel for a circular paver patio?',
      answer:
        'For a circular patio, calculate the area using: Area = π × radius². Then multiply by the base depth. For example, a 12-foot diameter circle (6-foot radius) has an area of 113 sq ft. At 4-inch base depth: 113 × (4/12) = 37.7 cubic feet (1.40 yd³) of gravel.',
    },
    {
      question: 'Should I use landscape fabric under a paver base?',
      answer:
        'Place landscape fabric at the bottom of the excavation before adding gravel — it separates the base material from native soil, preventing fines from migrating up into the base over time. Do NOT place fabric between the gravel base and sand layer, as this prevents proper compaction and causes the sand to shift.',
    },
  ],
};
