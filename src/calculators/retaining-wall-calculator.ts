import type {
  CalculatorConfig,
  CalculatorInputMap,
  CalculatorOutputMap,
  UnitSystem,
} from './_types';
import { rectVolFt3, rectVolM3 } from './volume-engine';

const WASTE_FACTOR = 1.10; // 10% waste

function formula(inputs: CalculatorInputMap, unitSystem: UnitSystem): CalculatorOutputMap {
  if (unitSystem === 'imperial') {
    const wallLenFt   = Number(inputs.wall_length_ft ?? 20) + Number(inputs.wall_length_in ?? 0) / 12;
    const wallHtFt    = Number(inputs.wall_height_ft ?? 3)  + Number(inputs.wall_height_in  ?? 0) / 12;
    const blockLenIn  = Number(inputs.block_length   ?? 12);
    const blockHtIn   = Number(inputs.block_height   ?? 6);
    const blockDepIn  = Number(inputs.block_depth    ?? 6);
    const gravelDepIn = Number(inputs.gravel_depth   ?? 6);
    const backfillIn  = Number(inputs.backfill_depth ?? 12);

    const courses        = blockHtIn > 0 ? Math.ceil((wallHtFt * 12) / blockHtIn) : 0;
    const blocksPerCourse = blockLenIn > 0 ? Math.ceil((wallLenFt * 12) / blockLenIn) : 0;
    const blocksNet      = courses * blocksPerCourse;
    const blocks         = Math.ceil(blocksNet * WASTE_FACTOR);

    const gravel   = rectVolFt3(wallLenFt, blockDepIn / 12, gravelDepIn / 12);
    const backfill = rectVolFt3(wallLenFt, wallHtFt, backfillIn / 12);

    return {
      blocks,
      courses,
      gravel_cubic_yards:  gravel.cubic_yards,
      gravel_cubic_feet:   gravel.cubic_feet,
      gravel_cubic_meters: gravel.cubic_meters,
      backfill_cubic_yards:  backfill.cubic_yards,
      backfill_cubic_feet:   backfill.cubic_feet,
      backfill_cubic_meters: backfill.cubic_meters,
    };
  } else {
    const wallLenM    = Number(inputs.wall_length_m  ?? 6);
    const wallHtM     = Number(inputs.wall_height_m  ?? 0.9);
    const blockLenMm  = Number(inputs.block_length_mm ?? 300);
    const blockHtMm   = Number(inputs.block_height_mm ?? 150);
    const blockDepMm  = Number(inputs.block_depth_mm  ?? 150);
    const gravelDepMm = Number(inputs.gravel_depth_mm ?? 150);
    const backfillMm  = Number(inputs.backfill_depth_mm ?? 300);

    const courses        = blockHtMm > 0 ? Math.ceil((wallHtM * 1000) / blockHtMm) : 0;
    const blocksPerCourse = blockLenMm > 0 ? Math.ceil((wallLenM * 1000) / blockLenMm) : 0;
    const blocksNet      = courses * blocksPerCourse;
    const blocks         = Math.ceil(blocksNet * WASTE_FACTOR);

    const gravel   = rectVolM3(wallLenM, blockDepMm / 1000, gravelDepMm / 1000);
    const backfill = rectVolM3(wallLenM, wallHtM,  backfillMm / 1000);

    return {
      blocks,
      courses,
      gravel_cubic_meters: gravel.cubic_meters,
      gravel_cubic_feet:   gravel.cubic_feet,
      gravel_cubic_yards:  gravel.cubic_yards,
      backfill_cubic_meters: backfill.cubic_meters,
      backfill_cubic_feet:   backfill.cubic_feet,
      backfill_cubic_yards:  backfill.cubic_yards,
    };
  }
}

export const retainingWallCalculator: CalculatorConfig = {
  slug: 'retaining-wall-calculator',
  name: 'Retaining Wall Calculator',
  category: 'masonry',
  description:
    'Calculate retaining wall blocks, gravel base volume, backfill material, and project cost. Enter wall dimensions and block size to get an accurate material estimate.',
  inputs: [
    // ── Imperial ─────────────────────────────────────────
    {
      id: 'wall_length_ft',
      label: 'Wall Length',
      type: 'number',
      unit: 'ft',
      min: 1,
      max: 2000,
      step: 1,
      defaultValue: 20,
      required: true,
      onlyIn: 'imperial',
    },
    {
      id: 'wall_length_in',
      label: 'Wall Length (in)',
      type: 'number',
      unit: 'in',
      min: 0,
      max: 11,
      step: 1,
      defaultValue: 0,
      onlyIn: 'imperial',
      groupWith: 'wall_length_ft',
    },
    {
      id: 'wall_height_ft',
      label: 'Wall Height',
      type: 'number',
      unit: 'ft',
      min: 0,
      max: 20,
      step: 1,
      defaultValue: 3,
      required: true,
      onlyIn: 'imperial',
    },
    {
      id: 'wall_height_in',
      label: 'Wall Height (in)',
      type: 'number',
      unit: 'in',
      min: 0,
      max: 11,
      step: 1,
      defaultValue: 0,
      onlyIn: 'imperial',
      groupWith: 'wall_height_ft',
    },
    {
      id: 'block_length',
      label: 'Block Length',
      type: 'number',
      unit: 'in',
      min: 4,
      max: 36,
      step: 0.5,
      defaultValue: 12,
      required: true,
      onlyIn: 'imperial',
      helpText: 'Standard retaining wall block: 12 in. Versa-Lok: 16 in.',
    },
    {
      id: 'block_height',
      label: 'Block Height',
      type: 'number',
      unit: 'in',
      min: 2,
      max: 18,
      step: 0.5,
      defaultValue: 6,
      required: true,
      onlyIn: 'imperial',
      helpText: 'Standard block height: 6 in.',
    },
    {
      id: 'block_depth',
      label: 'Block Depth',
      type: 'number',
      unit: 'in',
      min: 4,
      max: 24,
      step: 0.5,
      defaultValue: 6,
      required: true,
      onlyIn: 'imperial',
      helpText: 'Front-to-back depth. Standard: 6–8 in.',
    },
    {
      id: 'gravel_depth',
      label: 'Gravel Base Depth',
      type: 'number',
      unit: 'in',
      min: 2,
      max: 24,
      step: 1,
      defaultValue: 6,
      required: true,
      onlyIn: 'imperial',
      helpText: 'Compacted gravel under first course. Min 6 in.',
    },
    {
      id: 'backfill_depth',
      label: 'Backfill Depth',
      type: 'number',
      unit: 'in',
      min: 0,
      max: 60,
      step: 1,
      defaultValue: 12,
      required: true,
      onlyIn: 'imperial',
      helpText: 'How far behind the wall to backfill with gravel.',
    },
    // ── Metric ───────────────────────────────────────────
    {
      id: 'wall_length_m',
      label: 'Wall Length',
      type: 'number',
      unit: 'm',
      min: 0.3,
      max: 600,
      step: 0.1,
      defaultValue: 6,
      defaultValueMetric: 6,
      required: true,
      onlyIn: 'metric',
    },
    {
      id: 'wall_height_m',
      label: 'Wall Height',
      type: 'number',
      unit: 'm',
      min: 0.1,
      max: 6,
      step: 0.1,
      defaultValue: 0.9,
      defaultValueMetric: 0.9,
      required: true,
      onlyIn: 'metric',
    },
    {
      id: 'block_length_mm',
      label: 'Block Length',
      type: 'number',
      unit: 'mm',
      min: 100,
      max: 900,
      step: 5,
      defaultValue: 300,
      defaultValueMetric: 300,
      required: true,
      onlyIn: 'metric',
      helpText: 'Standard block: 300 mm.',
    },
    {
      id: 'block_height_mm',
      label: 'Block Height',
      type: 'number',
      unit: 'mm',
      min: 50,
      max: 450,
      step: 5,
      defaultValue: 150,
      defaultValueMetric: 150,
      required: true,
      onlyIn: 'metric',
    },
    {
      id: 'block_depth_mm',
      label: 'Block Depth',
      type: 'number',
      unit: 'mm',
      min: 100,
      max: 600,
      step: 5,
      defaultValue: 150,
      defaultValueMetric: 150,
      required: true,
      onlyIn: 'metric',
      helpText: 'Front-to-back depth. Standard: 150–200 mm.',
    },
    {
      id: 'gravel_depth_mm',
      label: 'Gravel Base Depth',
      type: 'number',
      unit: 'mm',
      min: 50,
      max: 600,
      step: 25,
      defaultValue: 150,
      defaultValueMetric: 150,
      required: true,
      onlyIn: 'metric',
      helpText: 'Compacted gravel under first course. Min 150 mm.',
    },
    {
      id: 'backfill_depth_mm',
      label: 'Backfill Depth',
      type: 'number',
      unit: 'mm',
      min: 0,
      max: 1500,
      step: 25,
      defaultValue: 300,
      defaultValueMetric: 300,
      required: true,
      onlyIn: 'metric',
      helpText: 'How far behind the wall to backfill with gravel.',
    },
  ],
  outputs: [
    {
      id: 'blocks',
      label: 'Blocks Required',
      unit: 'blocks',
      format: 'number',
      primary: true,
      description: 'Includes 10% waste factor',
    },
    {
      id: 'courses',
      label: 'Block Courses',
      unit: 'courses',
      format: 'number',
    },
    {
      id: 'gravel_cubic_yards',
      label: 'Gravel Base',
      unit: 'yd³',
      format: 'volume',
      description: 'Compacted gravel under first course',
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
      id: 'backfill_cubic_yards',
      label: 'Backfill',
      unit: 'yd³',
      format: 'volume',
      description: 'Gravel backfill behind wall',
    },
    {
      id: 'backfill_cubic_feet',
      label: 'Backfill',
      unit: 'ft³',
      format: 'volume',
    },
    {
      id: 'backfill_cubic_meters',
      label: 'Backfill',
      unit: 'm³',
      format: 'volume',
    },
  ],
  formula,
  unitSystems: ['imperial', 'metric'],
  relatedCalculators: ['gravel-calculator', 'concrete-slab-calculator', 'fence-post-calculator'],
  seo: {
    title: 'Retaining Wall Calculator – Blocks, Gravel & Cost Estimator',
    description:
      'Calculate retaining wall blocks, gravel base, backfill material, and project cost. Free retaining wall calculator with imperial and metric units.',
    h1: 'Retaining Wall Calculator',
    focusKeyword: 'retaining wall calculator',
  },
  schema: {
    appType: 'Construction Calculator',
    features: [
      'Calculate total retaining wall blocks needed',
      'Calculate block courses',
      'Calculate gravel base volume',
      'Calculate backfill volume',
      'Includes 10% material waste factor',
      'Imperial and metric support',
      'Cost estimator',
    ],
  },
  formulaSteps: [
    {
      label: 'Calculate block courses',
      formula: 'Courses = ⌈Wall Height (in) ÷ Block Height (in)⌉',
      description: 'Always round up — a partial course still requires a full row of blocks',
    },
    {
      label: 'Calculate blocks per course',
      formula: 'Blocks per course = ⌈Wall Length (in) ÷ Block Length (in)⌉',
    },
    {
      label: 'Apply waste factor',
      formula: 'Total Blocks = ⌈Courses × Blocks per course × 1.10⌉',
      description: '10% waste accounts for cuts, breakage, and alignment adjustments',
    },
    {
      label: 'Calculate gravel base volume',
      formula: 'Gravel (ft³) = Wall Length × Block Depth × Gravel Base Depth',
      description: 'The gravel base trench runs the full length of the wall at the block depth width',
    },
    {
      label: 'Calculate backfill volume',
      formula: 'Backfill (ft³) = Wall Length × Wall Height × Backfill Depth',
      description: 'Gravel backfill fills the zone directly behind the wall',
    },
  ],
  faq: [
    {
      question: 'How many retaining wall blocks do I need?',
      answer:
        'Divide your wall height by the block height to get the number of courses, then divide wall length by block length to get blocks per course. Multiply and add 10% for waste: Total blocks = ⌈(Wall Height ÷ Block Height) × (Wall Length ÷ Block Length) × 1.10⌉. For a 20 ft × 3 ft wall using standard 12 × 6 in blocks, that is (36/6) × (240/12) × 1.10 = 6 × 20 × 1.10 = 133 blocks.',
    },
    {
      question: 'How much gravel is needed under a retaining wall?',
      answer:
        'A retaining wall requires a compacted gravel base at least 6 inches (150 mm) deep. The gravel trench should be as wide as the block depth and run the full length of the wall. For a 20 ft wall with 6-in deep blocks and 6-in gravel base, you need 20 × 0.5 × 0.5 = 5 cubic feet (about 0.19 yd³) of compacted gravel. Use the calculator above for your exact dimensions.',
    },
    {
      question: 'How much backfill is required for a retaining wall?',
      answer:
        'Backfill volume depends on your wall height and how far behind the wall you are filling. The formula is: Backfill (ft³) = Wall Length × Wall Height × Backfill Depth. Use angular crushed stone (#57 stone) or gravel for the drainage zone directly behind the wall — never use clay or topsoil, which traps water and increases hydrostatic pressure.',
    },
    {
      question: 'What is the standard retaining wall block size?',
      answer:
        'The most common retaining wall block dimensions are 12 in long × 6 in high × 6 in deep (300 × 150 × 150 mm). Popular brands like Allan Block use 6 × 6 × 12 in dimensions. Versa-Lok standard blocks are 16 × 6 × 12 in. Always check the actual dimensions of the specific block you are purchasing before calculating.',
    },
    {
      question: 'How much does a retaining wall cost?',
      answer:
        'Retaining wall blocks cost $2–$10 each depending on size and style. A basic 20 ft × 3 ft wall with 130 blocks at $5 each is $650 in block material alone. Add $50–$150 for gravel base, $50–$100 for drainage fabric, and professional installation runs $15–$40 per sq ft. Use the cost estimator in the calculator above by entering your price per block.',
    },
    {
      question: 'How deep should the base be for a retaining wall?',
      answer:
        'The gravel base must be at least 6 inches (150 mm) deep and fully compacted. For walls over 3 feet tall, increase base depth to 8–12 inches and bury the first course of blocks below grade. The rule of thumb is to bury 1 inch of base course for every foot of finished wall height — so a 4-foot wall needs a 4-inch buried first course on top of the gravel base.',
    },
    {
      question: 'How much waste should I add for retaining wall blocks?',
      answer:
        'Add 10% waste to your block count to account for cuts at corners and ends, breakage during handling, and blocks used to adjust courses for level. For walls with many corners or curves, increase the waste factor to 15%. This calculator automatically applies a 10% waste factor to the total block count.',
    },
    {
      question: 'Can I build a retaining wall without gravel?',
      answer:
        'No — skipping the gravel base is the most common cause of retaining wall failure. The gravel base provides a level, compacted surface for the first course, allows water to drain away from the base, and distributes wall load across the soil. Without it, the wall will shift, settle unevenly, and can collapse under hydrostatic pressure from trapped water.',
    },
  ],
};
