import type {
  CalculatorConfig,
  CalculatorInputMap,
  CalculatorOutputMap,
  UnitSystem,
} from './_types';

function formula(inputs: CalculatorInputMap, unitSystem: UnitSystem): CalculatorOutputMap {
  if (unitSystem === 'imperial') {
    const totalRiseFt   = Number(inputs.total_rise_ft ?? 9) + Number(inputs.total_rise_in ?? 0) / 12;
    const desiredRiserIn = Number(inputs.riser_height_in ?? 7.5);
    const treadDepthIn  = Number(inputs.tread_depth_in ?? 10);

    if (totalRiseFt <= 0 || desiredRiserIn <= 0 || treadDepthIn <= 0) {
      return { risers: 0, treads: 0, actual_riser_in: 0, actual_riser_mm: 0, total_run_ft: 0, total_run_m: 0, stair_angle_deg: 0, stringer_length_ft: 0, stringer_length_m: 0 };
    }

    const totalRiseIn    = totalRiseFt * 12;
    const risers         = Math.ceil(totalRiseIn / desiredRiserIn);
    const actual_riser_in = Math.round((totalRiseIn / risers) * 1000) / 1000;
    const treads         = risers - 1;
    const total_run_in   = treads * treadDepthIn;
    const total_run_ft   = Math.round(total_run_in / 12 * 100) / 100;
    const stair_angle_deg = total_run_in > 0 ? Math.round(Math.atan(totalRiseIn / total_run_in) * (180 / Math.PI) * 100) / 100 : 90;
    // Stringer = √(total_rise² + total_run²) in inches, then convert to ft
    const stringer_length_ft = Math.round(Math.sqrt(totalRiseIn ** 2 + total_run_in ** 2) / 12 * 100) / 100;

    return {
      risers, treads,
      actual_riser_in,
      actual_riser_mm: Math.round(actual_riser_in * 25.4),
      total_run_ft,
      total_run_m: Math.round(total_run_ft * 0.3048 * 100) / 100,
      stair_angle_deg,
      stringer_length_ft,
      stringer_length_m: Math.round(stringer_length_ft * 0.3048 * 100) / 100,
    };
  } else {
    const totalRiseM    = Number(inputs.total_rise_m ?? 2.7);
    const desiredRiserMm = Number(inputs.riser_height_mm ?? 190);
    const treadDepthMm  = Number(inputs.tread_depth_mm ?? 250);

    if (totalRiseM <= 0 || desiredRiserMm <= 0 || treadDepthMm <= 0) {
      return { risers: 0, treads: 0, actual_riser_in: 0, actual_riser_mm: 0, total_run_ft: 0, total_run_m: 0, stair_angle_deg: 0, stringer_length_ft: 0, stringer_length_m: 0 };
    }

    const totalRiseMm    = totalRiseM * 1000;
    const risers         = Math.ceil(totalRiseMm / desiredRiserMm);
    const actual_riser_mm = Math.round(totalRiseMm / risers);
    const treads         = risers - 1;
    const total_run_mm   = treads * treadDepthMm;
    const total_run_m    = Math.round(total_run_mm / 1000 * 100) / 100;
    const stair_angle_deg = total_run_mm > 0 ? Math.round(Math.atan(totalRiseMm / total_run_mm) * (180 / Math.PI) * 100) / 100 : 90;
    const stringer_length_m = Math.round(Math.sqrt(totalRiseMm ** 2 + total_run_mm ** 2) / 1000 * 100) / 100;

    return {
      risers, treads,
      actual_riser_mm,
      actual_riser_in: Math.round(actual_riser_mm / 25.4 * 1000) / 1000,
      total_run_m,
      total_run_ft: Math.round(total_run_m / 0.3048 * 100) / 100,
      stair_angle_deg,
      stringer_length_m,
      stringer_length_ft: Math.round(stringer_length_m / 0.3048 * 100) / 100,
    };
  }
}

export const stairCalculator: CalculatorConfig = {
  slug: 'stair-calculator',
  name: 'Stair Calculator',
  category: 'framing',
  description:
    'Calculate stair rise, run, number of steps, stringer length, and stair angle for any staircase. Enter total rise, desired riser height, and tread depth to get code-compliant stair dimensions.',
  inputs: [
    // ── Imperial ──────────────────────────────────────
    {
      id: 'total_rise_ft',
      label: 'Total Rise',
      type: 'number',
      unit: 'ft',
      min: 0,
      max: 40,
      step: 1,
      defaultValue: 9,
      required: true,
      onlyIn: 'imperial',
      helpText: 'Vertical height from finished floor to finished floor (or ground to landing).',
    },
    {
      id: 'total_rise_in',
      label: 'Total Rise (in)',
      type: 'number',
      unit: 'in',
      min: 0,
      max: 11,
      step: 1,
      defaultValue: 0,
      onlyIn: 'imperial',
      groupWith: 'total_rise_ft',
    },
    {
      id: 'riser_height_in',
      label: 'Desired Riser Height',
      type: 'number',
      unit: 'in',
      min: 4,
      max: 10,
      step: 0.125,
      defaultValue: 7.5,
      required: true,
      onlyIn: 'imperial',
      helpText: 'IRC code: max 7¾ in per riser, min 4 in. Ideal range: 7–7¾ in.',
    },
    {
      id: 'tread_depth_in',
      label: 'Tread Depth',
      type: 'number',
      unit: 'in',
      min: 8,
      max: 18,
      step: 0.25,
      defaultValue: 10,
      required: true,
      onlyIn: 'imperial',
      helpText: 'Horizontal depth of each tread (nosing to nosing). IRC code: min 10 in.',
    },
    // ── Metric ────────────────────────────────────────
    {
      id: 'total_rise_m',
      label: 'Total Rise',
      type: 'number',
      unit: 'm',
      min: 0,
      max: 12,
      step: 0.01,
      defaultValue: 2.7,
      defaultValueMetric: 2.7,
      required: true,
      onlyIn: 'metric',
      helpText: 'Vertical height from finished floor to finished floor.',
    },
    {
      id: 'riser_height_mm',
      label: 'Desired Riser Height',
      type: 'number',
      unit: 'mm',
      min: 100,
      max: 220,
      step: 5,
      defaultValue: 190,
      defaultValueMetric: 190,
      required: true,
      onlyIn: 'metric',
      helpText: 'Building code (most jurisdictions): max 190–200 mm per riser.',
    },
    {
      id: 'tread_depth_mm',
      label: 'Tread Depth',
      type: 'number',
      unit: 'mm',
      min: 200,
      max: 450,
      step: 5,
      defaultValue: 250,
      defaultValueMetric: 250,
      required: true,
      onlyIn: 'metric',
      helpText: 'Horizontal tread depth nosing to nosing. Min 250 mm in most codes.',
    },
  ],
  outputs: [
    {
      id: 'risers',
      label: 'Number of Risers',
      unit: 'risers',
      format: 'number',
      primary: true,
      description: 'Total vertical steps — always one more than the number of treads',
    },
    {
      id: 'treads',
      label: 'Number of Treads',
      unit: 'treads',
      format: 'number',
      description: 'Number of horizontal tread boards needed (risers − 1)',
    },
    {
      id: 'actual_riser_in',
      label: 'Actual Riser Height',
      unit: 'in',
      format: 'number',
      description: 'Exact riser height after dividing total rise evenly (may differ from desired)',
    },
    {
      id: 'actual_riser_mm',
      label: 'Actual Riser Height',
      unit: 'mm',
      format: 'number',
    },
    {
      id: 'total_run_ft',
      label: 'Total Run',
      unit: 'ft',
      format: 'length',
      description: 'Total horizontal distance the staircase occupies (treads × tread depth)',
    },
    {
      id: 'total_run_m',
      label: 'Total Run',
      unit: 'm',
      format: 'length',
    },
    {
      id: 'stringer_length_ft',
      label: 'Stringer Length',
      unit: 'ft',
      format: 'length',
      description: 'Diagonal length of the stair stringer board — √(total rise² + total run²)',
    },
    {
      id: 'stringer_length_m',
      label: 'Stringer Length',
      unit: 'm',
      format: 'length',
    },
    {
      id: 'stair_angle_deg',
      label: 'Stair Angle',
      unit: '°',
      format: 'number',
      description: 'Angle of the stringer from horizontal — arctan(total rise ÷ total run)',
    },
  ],
  formula,
  unitSystems: ['imperial', 'metric'],
  relatedCalculators: [
    'lumber-calculator',
    'rafter-calculator',
    'deck-footing-calculator',
    'concrete-slab-calculator',
  ],
  seo: {
    title: 'Stair Calculator – Stringer Length, Rise, Run & Steps',
    description:
      'Free stair calculator — enter total rise, desired riser height, and tread depth to get number of steps, actual riser height, total run, stringer length, and stair angle for any staircase.',
    h1: 'Stair Calculator',
    focusKeyword: 'stair calculator',
  },

  disclaimer: 'Construction estimate only: Results are based on the dimensions and assumptions entered. This calculator does not perform structural engineering or guarantee local building-code compliance. Verify project-specific requirements with your local building department or a qualified professional.',
  schema: {
    appType: 'Construction Calculator',
    features: [
      'Calculate number of risers and treads',
      'Calculate actual riser height (evenly divided)',
      'Calculate total stair run',
      'Calculate stringer length using Pythagorean theorem',
      'Calculate stair angle in degrees',
      'IRC code reference for riser and tread limits',
      'Imperial and metric support',
    ],
  },
  formulaSteps: [
    {
      label: 'Calculate number of risers',
      formula: 'Risers = ⌈Total Rise ÷ Desired Riser Height⌉',
      description:
        'Always round up — you cannot have a fractional riser. If total rise is 108 in and desired riser is 7.5 in: 108 ÷ 7.5 = 14.4, rounded up to 15 risers. IRC code limits risers to a max of 7¾ in and requires all risers in a flight to be within ⅜ in of each other.',
    },
    {
      label: 'Calculate actual riser height',
      formula: 'Actual Riser = Total Rise ÷ Risers',
      description:
        'Divide the total rise evenly across all risers. For 108 in ÷ 15 risers = 7.2 in per riser. This is the dimension you will cut — it may be slightly different from the desired riser height you entered.',
    },
    {
      label: 'Calculate number of treads and total run',
      formula: 'Treads = Risers − 1   |   Total Run = Treads × Tread Depth',
      description:
        'There is always one fewer tread than risers — the top landing is not counted as a tread. For 15 risers with 10 in treads: 14 treads × 10 in = 140 in = 11.67 ft of horizontal run.',
    },
    {
      label: 'Calculate stair angle',
      formula: 'Stair Angle (°) = arctan(Total Rise ÷ Total Run)',
      description:
        'The angle of the stringer from horizontal. Comfortable residential stairs are typically 30–37°. Steeper angles (above 45°) are generally not permitted for primary residential stairs by building codes.',
    },
    {
      label: 'Calculate stringer length',
      formula: 'Stringer Length = √(Total Rise² + Total Run²)',
      description:
        'Apply the Pythagorean theorem to the right triangle formed by the total rise (vertical leg) and total run (horizontal leg). Add 12–18 in to the calculated stringer length when purchasing lumber to account for the top and bottom bearing cuts.',
    },
  ],
  faq: [
    {
      question: 'What are the standard stair dimensions for residential stairs?',
      answer:
        'The International Residential Code (IRC) specifies: maximum riser height of 7¾ inches, minimum tread depth of 10 inches (measured nosing to nosing), minimum stair width of 36 inches, and maximum variation between any two risers in a flight of ⅜ inch. These are minimums — comfortable everyday stairs typically use 7 to 7½ inch risers with 10 to 11 inch treads. The 17–18 inch rule of thumb (riser + tread = 17–18 inches) produces an ergonomic staircase.',
    },
    {
      question: 'How do I calculate the number of stairs I need?',
      answer:
        'Divide your total rise (floor-to-floor height) by your desired riser height and round up to a whole number. That is your riser count. For a 9-foot floor height (108 inches) with 7.5-inch desired risers: 108 ÷ 7.5 = 14.4, rounded up to 15 risers. The number of treads is always one less: 14 treads. This calculator handles the rounding and gives you the adjusted actual riser height automatically.',
    },
    {
      question: 'What is a stair stringer and how long should it be?',
      answer:
        'A stair stringer is the diagonal structural board that supports the treads and risers along each side of the staircase. Its length is the hypotenuse of the right triangle formed by the total rise and total run: stringer = √(rise² + run²). For a staircase with 108 in total rise and 140 in total run: √(108² + 140²) = √(11,664 + 19,600) = √31,264 ≈ 176.8 in ≈ 14.7 ft. Buy lumber at least 16 ft long to allow for the top and bottom cuts.',
    },
    {
      question: 'What is a good stair angle?',
      answer:
        'Comfortable residential stairs fall between 30° and 37°. The IRC allows up to about 38° (from the 7¾ in riser / 10 in tread limits). Angles below 30° produce very shallow stairs that feel like a ramp. Angles above 40° start to feel uncomfortably steep. Spiral staircases, ship ladders, and attic access stairs can legally exceed 45° with specific code allowances, but are not suited to everyday family use.',
    },
    {
      question: 'Why does the actual riser height differ from my desired riser?',
      answer:
        'Because you must use a whole number of risers — you cannot cut a fractional step. The calculator rounds up the riser count to the nearest whole number, then divides the total rise evenly across that count. For example, 9 ft 4 in (112 in) ÷ 7.5 in = 14.93 → rounds to 15 risers. Actual riser = 112 ÷ 15 = 7.467 in. Building code requires all risers in a flight to be within ⅜ in of each other, so all 15 risers must be cut to this single dimension.',
    },
    {
      question: 'How deep should stair treads be?',
      answer:
        'The IRC minimum is 10 inches measured nosing to nosing (the horizontal projection). Most comfortable residential treads are 10 to 11 inches. Wider treads feel more comfortable but increase the total run of the staircase — for a 14-tread staircase, going from 10 in to 11 in treads adds 14 inches (over a foot) to the floor space required. Outdoor stairs and deck stairs often use wider treads (11–12 in) for a more leisurely feel.',
    },
    {
      question: 'What are the stair requirements for commercial buildings?',
      answer:
        'The IBC (International Building Code) governs commercial stairs and has slightly different requirements from the IRC: max riser 7 inches (not 7¾ in), min tread 11 inches (not 10 in), min width 44 inches (36 in for low-occupancy areas), and nosing projection of ¾–1¼ inches. Handrails are required on both sides for widths over 44 inches. Egress stairs have additional fire rating and landing requirements. Always confirm with your local Authority Having Jurisdiction (AHJ) — local amendments to the IBC are common.',
    },
    {
      question: 'How do I convert stair measurements to metric?',
      answer:
        'Multiply imperial inches by 25.4 to get millimetres. Standard metric residential stairs use risers of 150–190 mm and treads of 250–300 mm. The comfort formula in metric is: 2 × riser + tread = 600–650 mm. A 190 mm riser with 250 mm tread gives 2×190 + 250 = 630 mm — within the comfortable range. This calculator accepts metric inputs directly and outputs total run in metres and stringer length in metres.',
    },
  ],
};
