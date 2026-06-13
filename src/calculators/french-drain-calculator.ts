import type {
  CalculatorConfig,
  CalculatorInputMap,
  CalculatorOutputMap,
  UnitSystem,
} from './_types';

function formula(inputs: CalculatorInputMap, unitSystem: UnitSystem): CalculatorOutputMap {
  const gravelPct = Math.max(0, Math.min(1, Number(inputs.gravel_pct ?? 90) / 100));
  const wastePct  = Math.max(0, Math.min(0.3, Number(inputs.waste_pct  ?? 10) / 100));

  if (unitSystem === 'imperial') {
    const lengthFt   = Number(inputs.length_ft ?? 0) + Number(inputs.length_in ?? 0) / 12;
    const widthFt    = Number(inputs.width_ft  ?? 0) + Number(inputs.width_in  ?? 0) / 12;
    const depthFt    = Number(inputs.depth_ft  ?? 0) + Number(inputs.depth_in  ?? 0) / 12;

    if (lengthFt <= 0 || widthFt <= 0 || depthFt <= 0) {
      return {
        gravel_cuyd: 0, gravel_cuft: 0, gravel_cum: 0,
        pipe_length_ft: 0,
        fabric_sqft: 0, fabric_sqm: 0,
        excavation_cuyd: 0, excavation_cuft: 0, trench_cuyd: 0,
      };
    }

    // Trench volume (bank)
    const trench_cuft = lengthFt * widthFt * depthFt;
    const trench_cuyd = trench_cuft / 27;

    // Gravel volume
    const gravel_net_cuft = trench_cuft * gravelPct;
    const gravel_cuft  = Math.round(gravel_net_cuft * (1 + wastePct) * 100) / 100;
    const gravel_cuyd  = Math.round(gravel_cuft / 27 * 100) / 100;
    const gravel_cum   = Math.round(gravel_cuft * 0.0283168 * 1000) / 1000;

    // Pipe length
    const pipe_length_ft = Math.round(lengthFt * (1 + wastePct) * 10) / 10;

    // Filter fabric area: (width + 2×depth) × length × waste factor
    const fabric_sqft = Math.round((widthFt + 2 * depthFt) * lengthFt * (1 + wastePct) * 100) / 100;
    const fabric_sqm  = Math.round(fabric_sqft * 0.092903 * 100) / 100;

    // Excavation volume with over-dig
    const excavation_cuyd = Math.round(trench_cuyd * (1 + wastePct) * 100) / 100;
    const excavation_cuft = Math.round(trench_cuft * (1 + wastePct) * 100) / 100;

    return {
      gravel_cuyd,
      gravel_cuft,
      gravel_cum,
      pipe_length_ft,
      fabric_sqft,
      fabric_sqm,
      excavation_cuyd,
      excavation_cuft,
      trench_cuyd: Math.round(trench_cuyd * 100) / 100,
    };
  } else {
    const lengthM = Number(inputs.length_m ?? 0);
    const widthM  = Number(inputs.width_m  ?? 0);
    const depthM  = Number(inputs.depth_m  ?? 0);

    if (lengthM <= 0 || widthM <= 0 || depthM <= 0) {
      return {
        gravel_cuyd: 0, gravel_cuft: 0, gravel_cum: 0,
        pipe_length_m: 0,
        fabric_sqft: 0, fabric_sqm: 0,
        excavation_cuyd: 0, excavation_cuft: 0, trench_cuyd: 0,
      };
    }

    // Trench volume
    const trench_cum  = lengthM * widthM * depthM;
    const trench_cuyd = trench_cum * 1.30795;

    // Gravel volume
    const gravel_net_cum = trench_cum * gravelPct;
    const gravel_cum  = Math.round(gravel_net_cum * (1 + wastePct) * 1000) / 1000;
    const gravel_cuyd = Math.round(gravel_cum * 1.30795 * 100) / 100;
    const gravel_cuft = Math.round(gravel_cum * 35.3147 * 100) / 100;

    // Pipe length
    const pipe_length_m = Math.round(lengthM * (1 + wastePct) * 10) / 10;

    // Filter fabric area
    const fabric_sqm  = Math.round((widthM + 2 * depthM) * lengthM * (1 + wastePct) * 100) / 100;
    const fabric_sqft = Math.round(fabric_sqm * 10.7639 * 100) / 100;

    // Excavation volume with over-dig
    const excavation_cum  = Math.round(trench_cum * (1 + wastePct) * 1000) / 1000;
    const excavation_cuyd = Math.round(excavation_cum * 1.30795 * 100) / 100;
    const excavation_cuft = Math.round(excavation_cum * 35.3147 * 100) / 100;

    return {
      gravel_cuyd,
      gravel_cuft,
      gravel_cum,
      pipe_length_m,
      fabric_sqft,
      fabric_sqm,
      excavation_cuyd,
      excavation_cuft,
      trench_cuyd: Math.round(trench_cuyd * 100) / 100,
    };
  }
}

export const frenchDrainCalculator: CalculatorConfig = {
  slug: 'french-drain-calculator',
  name: 'French Drain Calculator',
  category: 'excavation',
  description:
    'Calculate gravel, perforated pipe, filter fabric, and trench excavation for a French drain system. Accounts for pipe displacement and waste factor so you order the right amounts.',
  inputs: [
    // ── Imperial ──────────────────────────────────────
    {
      id: 'length_ft',
      label: 'Length',
      type: 'number',
      unit: 'ft',
      min: 5,
      max: 1000,
      step: 1,
      defaultValue: 50,
      required: true,
      onlyIn: 'imperial',
      helpText: 'Total run of the French drain trench.',
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
      min: 0.5,
      max: 10,
      step: 0.5,
      defaultValue: 1.5,
      required: true,
      onlyIn: 'imperial',
      helpText: 'Inside trench width. Typically 1–2 ft for residential drains.',
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
      id: 'depth_ft',
      label: 'Depth',
      type: 'number',
      unit: 'ft',
      min: 0.5,
      max: 10,
      step: 0.5,
      defaultValue: 2,
      required: true,
      onlyIn: 'imperial',
      helpText: 'Trench depth from grade to bottom. Minimum 18″ recommended.',
    },
    {
      id: 'depth_in',
      label: 'Depth (in)',
      type: 'number',
      unit: 'in',
      min: 0,
      max: 11,
      step: 1,
      defaultValue: 0,
      onlyIn: 'imperial',
      groupWith: 'depth_ft',
    },
    {
      id: 'pipe_diameter_in',
      label: 'Pipe Diameter',
      type: 'number',
      unit: 'in',
      min: 2,
      max: 12,
      step: 0.5,
      defaultValue: 4,
      onlyIn: 'imperial',
      helpText: 'Standard perforated pipe: 4″ (residential), 6″ (commercial).',
    },
    {
      id: 'gravel_pct',
      label: 'Gravel Coverage',
      type: 'number',
      unit: '%',
      min: 50,
      max: 100,
      step: 5,
      defaultValue: 90,
      onlyIn: 'imperial',
      helpText: 'Gravel fills the trench minus the pipe cross-section. 90% is a good default.',
    },
    {
      id: 'waste_pct',
      label: 'Waste Factor',
      type: 'number',
      unit: '%',
      min: 0,
      max: 30,
      step: 5,
      defaultValue: 10,
      onlyIn: 'imperial',
      helpText: 'Add 10% waste for gravel and fabric spillage and over-dig.',
    },
    // ── Metric ────────────────────────────────────────
    {
      id: 'length_m',
      label: 'Length',
      type: 'number',
      unit: 'm',
      min: 1.5,
      max: 300,
      step: 0.5,
      defaultValue: 15,
      defaultValueMetric: 15,
      required: true,
      onlyIn: 'metric',
      helpText: 'Total trench run in metres.',
    },
    {
      id: 'width_m',
      label: 'Width',
      type: 'number',
      unit: 'm',
      min: 0.15,
      max: 3,
      step: 0.05,
      defaultValue: 0.45,
      defaultValueMetric: 0.45,
      required: true,
      onlyIn: 'metric',
      helpText: 'Inside trench width. Typically 0.3–0.6 m for residential.',
    },
    {
      id: 'depth_m',
      label: 'Depth',
      type: 'number',
      unit: 'm',
      min: 0.15,
      max: 3,
      step: 0.05,
      defaultValue: 0.6,
      defaultValueMetric: 0.6,
      required: true,
      onlyIn: 'metric',
      helpText: 'Trench depth from grade to bottom. Minimum 450 mm recommended.',
    },
    {
      id: 'pipe_diameter_mm',
      label: 'Pipe Diameter',
      type: 'number',
      unit: 'mm',
      min: 50,
      max: 300,
      step: 10,
      defaultValue: 100,
      onlyIn: 'metric',
      helpText: 'Standard perforated pipe: 100 mm (residential), 150 mm (commercial).',
    },
    {
      id: 'gravel_pct',
      label: 'Gravel Coverage',
      type: 'number',
      unit: '%',
      min: 50,
      max: 100,
      step: 5,
      defaultValue: 90,
      onlyIn: 'metric',
      helpText: 'Gravel fills the trench minus the pipe cross-section. 90% is a good default.',
    },
    {
      id: 'waste_pct',
      label: 'Waste Factor',
      type: 'number',
      unit: '%',
      min: 0,
      max: 30,
      step: 5,
      defaultValue: 10,
      onlyIn: 'metric',
      helpText: 'Add 10% waste for gravel and fabric spillage and over-dig.',
    },
  ],
  outputs: [
    {
      id: 'gravel_cuyd',
      label: 'Gravel Required',
      unit: 'yd³',
      format: 'volume',
      primary: true,
      description: 'Trench volume × gravel coverage % × waste factor',
    },
    {
      id: 'gravel_cuft',
      label: 'Gravel Required',
      unit: 'ft³',
      format: 'volume',
    },
    {
      id: 'gravel_cum',
      label: 'Gravel Required',
      unit: 'm³',
      format: 'volume',
    },
    {
      id: 'pipe_length_ft',
      label: 'Pipe Length',
      unit: 'ft',
      format: 'length',
      description: 'Drain length + waste allowance',
    },
    {
      id: 'pipe_length_m',
      label: 'Pipe Length',
      unit: 'm',
      format: 'length',
    },
    {
      id: 'fabric_sqft',
      label: 'Filter Fabric',
      unit: 'ft²',
      format: 'area',
      description: '(Width + 2 × Depth) × Length × waste factor',
    },
    {
      id: 'fabric_sqm',
      label: 'Filter Fabric',
      unit: 'm²',
      format: 'area',
    },
    {
      id: 'excavation_cuyd',
      label: 'Excavation Volume',
      unit: 'yd³',
      format: 'volume',
      description: 'Full trench volume with over-dig allowance',
    },
    {
      id: 'excavation_cuft',
      label: 'Excavation Volume',
      unit: 'ft³',
      format: 'volume',
    },
  ],
  formula,
  unitSystems: ['imperial', 'metric'],
  relatedCalculators: [
    'excavation-calculator',
    'gravel-calculator',
    'topsoil-calculator',
    'concrete-footing-calculator',
  ],
  seo: {
    title: 'French Drain Calculator – Gravel, Pipe & Fabric Estimator',
    description:
      'Calculate gravel, perforated pipe, filter fabric, and trench volume for French drain installations.',
    h1: 'French Drain Calculator',
    focusKeyword: 'french drain calculator',
  },
  schema: {
    appType: 'Construction Calculator',
    features: [
      'Calculate gravel volume in cubic yards, cubic feet, and cubic metres',
      'Estimate perforated pipe length with waste allowance',
      'Calculate filter fabric area for full trench wrap',
      'Compute excavation volume with over-dig factor',
      'Adjustable gravel coverage and waste percentages',
      'Imperial and metric unit systems',
    ],
  },
  formulaSteps: [
    {
      label: 'Calculate trench volume',
      formula: 'Trench Volume = Length × Width × Depth',
      description:
        'Bank (in-place) volume is the full rectangle of soil removed. Measure length along the drain run, width at the inside face of the trench walls, and depth from grade to the bottom. This is the baseline for all other estimates. An over-dig allowance (waste factor) is added to the final excavation figure to account for sloughing and uneven cutting.',
    },
    {
      label: 'Calculate gravel volume',
      formula: 'Gravel Volume = Trench Volume × Gravel Coverage % × (1 + Waste %)',
      description:
        'Gravel fills the trench around and above the pipe. The default 90% coverage accounts for the pipe\'s cross-sectional area displacing some fill. A 10% waste factor covers gravel lost to over-spill, compaction voids, and minor over-dig. Use angular crushed stone (3/4″ clean) for best drainage; avoid pea gravel in clay soils because it migrates under load. Gravel is typically sold by the ton — 1 yd³ of 3/4″ clean stone weighs approximately 1.4 tons.',
    },
    {
      label: 'Determine pipe length',
      formula: 'Pipe Length = Drain Length × (1 + Waste %)',
      description:
        'Standard 4″ corrugated perforated pipe is the most common choice for residential French drains. Sock-wrapped pipe (pre-fitted with a geotextile sleeve) reduces fine migration into the pipe in sandy soils but can clog faster in clay — in those cases rely on the fabric lining the trench instead. The pipe must slope at least 1% (⅛″ per foot) toward the outlet; a laser level makes it easy to maintain consistent grade over long runs.',
    },
    {
      label: 'Calculate filter fabric area',
      formula: 'Fabric Area = (Width + 2 × Depth) × Length × (1 + Waste %)',
      description:
        'Geotextile filter fabric lines the trench on three sides — both walls and the floor — forming a sock that keeps fine soil particles out of the gravel envelope. The formula adds one width and two depths to get the cross-sectional perimeter of the three lined faces, then multiplies by length. The waste factor covers overlap at seams and excess folded over the top of the gravel before backfilling. Use non-woven geotextile (4 oz/yd² minimum) for drainage applications; woven fabric passes less water.',
    },
    {
      label: 'Convert between units',
      formula: '1 yd³ = 27 ft³ = 0.7646 m³   |   1 ft² = 0.0929 m²',
      description:
        'Gravel suppliers typically sell by the ton or by the cubic yard. For 3/4″ clean crushed stone, 1 yd³ weighs approximately 1.4 tons; for river rock it is closer to 1.35 tons. Multiply your cubic yards by the density to get the tonnage for your order. Fabric is sold by the roll in square feet or square metres — divide your fabric area by the roll width to get the linear footage needed.',
    },
  ],
  faq: [
    {
      question: 'What is a French drain and how does it work?',
      answer:
        'A French drain is a gravel-filled trench containing a perforated pipe that redirects surface and groundwater away from an area. Water infiltrates through the gravel envelope, enters the perforated pipe through small holes or slots, and flows by gravity to a daylight outlet, dry well, or storm drain. The filter fabric surrounding the gravel prevents fine soil particles from clogging the system over time. French drains are commonly used to relieve hydrostatic pressure against basement walls, drain waterlogged yards, and divert roof runoff.',
    },
    {
      question: 'How much gravel does a French drain need?',
      answer:
        'Gravel volume depends on trench dimensions and coverage percentage. For a 50 ft long drain that is 1.5 ft wide and 2 ft deep: trench volume = 50 × 1.5 × 2 = 150 ft³ = 5.56 yd³. At 90% gravel coverage and 10% waste: gravel needed ≈ 5.0 yd³ × 1.1 ≈ 5.5 yd³. This calculator handles the math automatically for any dimensions. Gravel is sold by the ton — multiply cubic yards by approximately 1.4 to get tons for 3/4″ clean crushed stone.',
    },
    {
      question: 'What size pipe should I use for a French drain?',
      answer:
        '4-inch perforated pipe is standard for residential French drains handling normal yard drainage. Use 6-inch pipe for high-flow situations such as large roof areas, heavy clay soils, or commercial applications. Both corrugated HDPE (flexible, easy to handle) and Schedule 40 PVC (rigid, better flow capacity) are common choices. Sock-wrapped pipe adds a fabric sleeve that filters fines before they enter the pipe — useful in sandy soils, though it requires replacement sooner in silt-heavy conditions.',
    },
    {
      question: 'What type of gravel is best for a French drain?',
      answer:
        '3/4-inch clean crushed stone (also called clean angular gravel or drainage stone) is the preferred material. The angular shape creates larger void spaces for water movement, and the absence of fines means it does not compact into a solid mass over time. River rock and washed pea gravel also work but are less effective in heavy clay because the rounded particles can shift and reduce permeability. Avoid crusher run, bank-run gravel, or any product containing fines — they will clog the fabric and reduce drainage performance.',
    },
    {
      question: 'Do I need filter fabric for a French drain?',
      answer:
        'Yes, in most installations. Without filter fabric, fine soil particles migrate into the gravel envelope and eventually clog the system. Non-woven geotextile (4 oz/yd² or heavier) is the standard choice — it allows water through while blocking sediment. Line all three sides of the trench (both walls and the floor), fill with gravel and pipe, then fold the fabric over the top of the gravel before backfilling with soil. The only exception is extremely coarse, clean sand where migration is not a concern, though fabric is still recommended as cheap insurance.',
    },
    {
      question: 'How deep should a French drain be installed?',
      answer:
        'A minimum depth of 18–24 inches is recommended for most residential drains. In cold climates, the pipe should be installed below the frost line to prevent ice blockages — this can be 36–48 inches in northern regions. For interior perimeter drains designed to relieve basement hydrostatic pressure, the pipe typically sits 6 inches below the basement floor slab. For exterior foundation drains, the pipe should be at or slightly below footing level. The outlet must be lower than the inlet to maintain the minimum 1% slope.',
    },
    {
      question: 'How much does a French drain cost to install?',
      answer:
        'Professional installation typically runs $20–$100 per linear foot depending on trench depth, soil conditions, access, and outlet type. A 50 ft residential drain averages $1,000–$3,000 installed. Costs increase significantly for rock or hard clay, deep installations, and complex outlet structures (dry wells, sump connections). DIY installation saves 50–70% on labor — the main expenses are gravel (roughly $40–$60/ton), perforated pipe ($1–$3/ft), and geotextile fabric ($0.10–$0.25/ft²). Rent a trencher for $200–$350/day to avoid hand-digging.',
    },
    {
      question: 'How do I calculate the slope for a French drain?',
      answer:
        'A minimum slope of 1% is required — that equals 1 inch of drop per 8 feet of run, or roughly 1/8 inch per foot. For a 50 ft drain, the outlet must be at least 6 inches lower than the inlet. More slope (up to 2–3%) improves flow capacity and reduces sediment buildup. Use a laser level or a water level to set grade stakes before digging. Mark the bottom of the trench at intervals with stakes at the correct elevation so you can check as you dig. The outlet must daylight to a slope, a ditch, a dry well, or a storm drain — never terminate in a closed low spot.',
    },
  ],
};
