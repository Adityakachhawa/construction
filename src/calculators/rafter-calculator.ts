import type {
  CalculatorConfig,
  CalculatorInputMap,
  CalculatorOutputMap,
  UnitSystem,
} from './_types';

function formula(inputs: CalculatorInputMap, unitSystem: UnitSystem): CalculatorOutputMap {
  if (unitSystem === 'imperial') {
    const riseFt     = Number(inputs.rise_ft  ?? 6)  + Number(inputs.rise_in  ?? 0) / 12;
    const runFt      = Number(inputs.run_ft   ?? 12) + Number(inputs.run_in   ?? 0) / 12;
    const overhangFt = Number(inputs.overhang_ft ?? 0) + Number(inputs.overhang_in ?? 0) / 12;

    if (runFt <= 0) {
      return { rafter_length_ft: 0, rafter_length_m: 0, total_rafter_ft: 0, total_rafter_m: 0, overhang_rafter_ft: 0, overhang_rafter_m: 0, angle_deg: 0, slope_pct: 0, pitch_ratio: 0 };
    }

    const pitchDecimal   = riseFt / runFt;
    const pitch_ratio    = Math.round(pitchDecimal * 12 * 100) / 100;
    const angle_deg      = Math.round(Math.atan(pitchDecimal) * (180 / Math.PI) * 100) / 100;
    const slope_pct      = Math.round(pitchDecimal * 100 * 10) / 10;
    const rafter_length_ft = Math.round(Math.sqrt(riseFt ** 2 + runFt ** 2) * 100) / 100;

    // Overhang rafter extension: overhang is horizontal, so overhang rafter = √(overhang² + (overhang × pitch)²)
    const overhangRise   = overhangFt * pitchDecimal;
    const overhang_rafter_ft = overhangFt > 0
      ? Math.round(Math.sqrt(overhangFt ** 2 + overhangRise ** 2) * 100) / 100
      : 0;
    const total_rafter_ft = Math.round((rafter_length_ft + overhang_rafter_ft) * 100) / 100;

    return {
      rafter_length_ft,
      rafter_length_m: Math.round(rafter_length_ft * 0.3048 * 100) / 100,
      total_rafter_ft,
      total_rafter_m: Math.round(total_rafter_ft * 0.3048 * 100) / 100,
      overhang_rafter_ft,
      overhang_rafter_m: Math.round(overhang_rafter_ft * 0.3048 * 100) / 100,
      angle_deg, slope_pct, pitch_ratio,
    };
  } else {
    const riseM     = Number(inputs.rise_m  ?? 1.8);
    const runM      = Number(inputs.run_m   ?? 3.6);
    const overhangM = Number(inputs.overhang_m ?? 0);

    if (runM <= 0) {
      return { rafter_length_ft: 0, rafter_length_m: 0, total_rafter_ft: 0, total_rafter_m: 0, overhang_rafter_ft: 0, overhang_rafter_m: 0, angle_deg: 0, slope_pct: 0, pitch_ratio: 0 };
    }

    const pitchDecimal   = riseM / runM;
    const pitch_ratio    = Math.round(pitchDecimal * 12 * 100) / 100;
    const angle_deg      = Math.round(Math.atan(pitchDecimal) * (180 / Math.PI) * 100) / 100;
    const slope_pct      = Math.round(pitchDecimal * 100 * 10) / 10;
    const rafter_length_m = Math.round(Math.sqrt(riseM ** 2 + runM ** 2) * 100) / 100;

    const overhangRise    = overhangM * pitchDecimal;
    const overhang_rafter_m = overhangM > 0
      ? Math.round(Math.sqrt(overhangM ** 2 + overhangRise ** 2) * 100) / 100
      : 0;
    const total_rafter_m  = Math.round((rafter_length_m + overhang_rafter_m) * 100) / 100;

    return {
      rafter_length_m,
      rafter_length_ft: Math.round(rafter_length_m / 0.3048 * 100) / 100,
      total_rafter_m,
      total_rafter_ft: Math.round(total_rafter_m / 0.3048 * 100) / 100,
      overhang_rafter_m,
      overhang_rafter_ft: Math.round(overhang_rafter_m / 0.3048 * 100) / 100,
      angle_deg, slope_pct, pitch_ratio,
    };
  }
}

export const rafterCalculator: CalculatorConfig = {
  slug: 'rafter-calculator',
  name: 'Rafter Calculator',
  category: 'framing',
  description:
    'Calculate rafter length, total rafter length with overhang, roof angle, and slope percentage from rise and run. Instant results for any roof framing project — imperial and metric.',
  inputs: [
    // ── Imperial ──────────────────────────────────────
    {
      id: 'rise_ft',
      label: 'Roof Rise',
      type: 'number',
      unit: 'ft',
      min: 0,
      max: 100,
      step: 1,
      defaultValue: 6,
      required: true,
      onlyIn: 'imperial',
      helpText: 'Vertical height from the top plate to the ridge.',
    },
    {
      id: 'rise_in',
      label: 'Roof Rise (in)',
      type: 'number',
      unit: 'in',
      min: 0,
      max: 11,
      step: 1,
      defaultValue: 0,
      onlyIn: 'imperial',
      groupWith: 'rise_ft',
    },
    {
      id: 'run_ft',
      label: 'Roof Run',
      type: 'number',
      unit: 'ft',
      min: 0,
      max: 200,
      step: 1,
      defaultValue: 12,
      required: true,
      onlyIn: 'imperial',
      helpText: 'Horizontal distance from the wall to directly below the ridge (half the span).',
    },
    {
      id: 'run_in',
      label: 'Roof Run (in)',
      type: 'number',
      unit: 'in',
      min: 0,
      max: 11,
      step: 1,
      defaultValue: 0,
      onlyIn: 'imperial',
      groupWith: 'run_ft',
    },
    {
      id: 'overhang_ft',
      label: 'Eave Overhang',
      type: 'number',
      unit: 'ft',
      min: 0,
      max: 10,
      step: 1,
      defaultValue: 1,
      onlyIn: 'imperial',
      helpText: 'Horizontal distance the rafter extends beyond the wall (eave/fascia). Enter 0 for no overhang.',
    },
    {
      id: 'overhang_in',
      label: 'Eave Overhang (in)',
      type: 'number',
      unit: 'in',
      min: 0,
      max: 11,
      step: 1,
      defaultValue: 0,
      onlyIn: 'imperial',
      groupWith: 'overhang_ft',
    },
    // ── Metric ────────────────────────────────────────
    {
      id: 'rise_m',
      label: 'Roof Rise',
      type: 'number',
      unit: 'm',
      min: 0,
      max: 30,
      step: 0.1,
      defaultValue: 1.8,
      defaultValueMetric: 1.8,
      required: true,
      onlyIn: 'metric',
      helpText: 'Vertical height from the top plate to the ridge.',
    },
    {
      id: 'run_m',
      label: 'Roof Run',
      type: 'number',
      unit: 'm',
      min: 0,
      max: 60,
      step: 0.1,
      defaultValue: 3.6,
      defaultValueMetric: 3.6,
      required: true,
      onlyIn: 'metric',
      helpText: 'Horizontal distance from the wall to directly below the ridge.',
    },
    {
      id: 'overhang_m',
      label: 'Eave Overhang',
      type: 'number',
      unit: 'm',
      min: 0,
      max: 3,
      step: 0.05,
      defaultValue: 0.3,
      defaultValueMetric: 0.3,
      onlyIn: 'metric',
      helpText: 'Horizontal eave overhang beyond the wall. Enter 0 for no overhang.',
    },
  ],
  outputs: [
    {
      id: 'rafter_length_ft',
      label: 'Rafter Length',
      unit: 'ft',
      format: 'length',
      primary: true,
      description: 'Structural rafter from wall plate to ridge — does not include overhang',
    },
    {
      id: 'rafter_length_m',
      label: 'Rafter Length',
      unit: 'm',
      format: 'length',
      description: 'Structural rafter from wall plate to ridge (metric)',
    },
    {
      id: 'total_rafter_ft',
      label: 'Total Rafter (with overhang)',
      unit: 'ft',
      format: 'length',
      description: 'Full cut length including the eave overhang extension',
    },
    {
      id: 'total_rafter_m',
      label: 'Total Rafter (with overhang)',
      unit: 'm',
      format: 'length',
    },
    {
      id: 'overhang_rafter_ft',
      label: 'Overhang Rafter Extension',
      unit: 'ft',
      format: 'length',
      description: 'Sloped rafter length of the eave overhang only',
    },
    {
      id: 'overhang_rafter_m',
      label: 'Overhang Rafter Extension',
      unit: 'm',
      format: 'length',
    },
    {
      id: 'pitch_ratio',
      label: 'Pitch Ratio (X:12)',
      unit: ':12',
      format: 'number',
      description: 'Rise in inches per 12 inches of horizontal run',
    },
    {
      id: 'angle_deg',
      label: 'Roof Angle',
      unit: '°',
      format: 'number',
      description: 'Angle of the roof slope in degrees',
    },
    {
      id: 'slope_pct',
      label: 'Slope Percentage',
      unit: '%',
      format: 'number',
      description: 'Rise as a percentage of run (rise ÷ run × 100)',
    },
  ],
  formula,
  unitSystems: ['imperial', 'metric'],
  relatedCalculators: [
    'roof-pitch-calculator',
    'roofing-calculator',
    'plywood-calculator',
    'stud-calculator',
  ],
  seo: {
    title: 'Rafter Calculator – Length, Roof Angle & Framing',
    description:
      'Free rafter calculator — enter rise, run, and eave overhang to get rafter length, total cut length, roof angle in degrees, and slope percentage instantly for any roof framing project.',
    h1: 'Rafter Calculator',
    focusKeyword: 'rafter calculator',
  },
  schema: {
    appType: 'Construction Calculator',
    features: [
      'Calculate structural rafter length from rise and run',
      'Calculate total rafter cut length including eave overhang',
      'Calculate roof angle in degrees',
      'Calculate slope percentage',
      'Calculate pitch ratio (X:12)',
      'Imperial and metric support',
    ],
  },
  formulaSteps: [
    {
      label: 'Calculate rise/run ratio (pitch)',
      formula: 'Pitch (X:12) = (Rise ÷ Run) × 12',
      description:
        'The pitch ratio defines the steepness. A 6:12 pitch rises 6 inches for every 12 inches of horizontal run. This ratio drives both the angle and the rafter length multiplier.',
    },
    {
      label: 'Calculate roof angle in degrees',
      formula: 'Angle (°) = arctan(Rise ÷ Run) × (180 ÷ π)',
      description:
        'Convert the pitch to degrees using the inverse tangent. A 6:12 pitch equals approximately 26.57°. Used for saw blade bevel settings when cutting bird\'s-mouth and plumb cuts.',
    },
    {
      label: 'Calculate structural rafter length',
      formula: 'Rafter = √(Rise² + Run²)',
      description:
        'Apply the Pythagorean theorem to the right triangle formed by the rise (vertical leg), run (horizontal leg), and rafter (hypotenuse). This is the length from the wall plate to the ridge — before overhang.',
    },
    {
      label: 'Calculate overhang rafter extension',
      formula: 'Overhang rise = Overhang × (Rise ÷ Run)   |   Overhang rafter = √(Overhang² + Overhang rise²)',
      description:
        'The eave overhang extends the rafter past the wall at the same slope. Its sloped length is also calculated with the Pythagorean theorem using the horizontal overhang and its corresponding rise.',
    },
    {
      label: 'Calculate total rafter cut length',
      formula: 'Total rafter = Rafter length + Overhang rafter extension',
      description:
        'Add the structural length and overhang extension to get the full board length to cut. Order lumber at least this long — standard lengths are 10, 12, 14, 16, 18, 20 ft. Round up to the next standard length and add a few inches for the bird\'s-mouth and ridge cuts.',
    },
  ],
  faq: [
    {
      question: 'How do I calculate rafter length from rise and run?',
      answer:
        'Use the Pythagorean theorem: rafter length = √(rise² + run²). For a 6:12 pitch over a 12-foot run with a 6-foot rise: √(6² + 12²) = √(36 + 144) = √180 ≈ 13.42 ft. This gives the structural length from the wall plate to the ridge center. Add your eave overhang length separately using the same formula applied to the overhang dimensions.',
    },
    {
      question: 'What is the difference between run and span?',
      answer:
        'The span is the full horizontal width of the building from outside wall to outside wall. The run is half the span — the horizontal distance from the wall to directly below the ridge. For a 24-foot wide building, the run is 12 feet. This calculator uses run, not span — enter half your building width if you\'re working from a total building dimension.',
    },
    {
      question: 'How do I include the eave overhang in rafter length?',
      answer:
        'The overhang extends the rafter horizontally past the wall at the same slope. Its additional rafter length is calculated the same way as the main rafter: overhang rafter = √(overhang² + (overhang × pitch/12)²). For a 1-foot overhang at 6:12: rise = 1 × 0.5 = 0.5 ft; overhang rafter = √(1² + 0.5²) = √1.25 ≈ 1.118 ft. This calculator handles the math automatically.',
    },
    {
      question: 'What is a bird\'s-mouth cut and where does it go?',
      answer:
        'A bird\'s-mouth is a notch cut near the bottom of the rafter where it sits on the wall top plate. It has two cuts: a plumb cut (vertical, parallel to the ridge) and a seat cut (horizontal, parallel to the top plate). The bird\'s-mouth notch typically equals the width of the top plate — about 3.5 inches (one stud width). The rafter length in this calculator runs from the ridge plumb cut to the wall plumb cut at the bird\'s-mouth, not to the fascia end.',
    },
    {
      question: 'How do I find the rafter angle for saw cuts?',
      answer:
        'The roof angle in degrees is the number to set your circular saw or miter saw bevel for plumb cuts (ridge and bird\'s-mouth). For a 6:12 pitch, the angle is arctan(6/12) ≈ 26.57°. Set your saw to 26.57°. The seat cut (horizontal) is the complement: 90° − 26.57° = 63.43°. Always test on scrap lumber before cutting your full run of rafters.',
    },
    {
      question: 'What lumber size should I use for rafters?',
      answer:
        'Rafter sizing depends on span, spacing, species, and load. Common residential sizing: 2×6 for spans up to about 12–14 ft at 16" OC; 2×8 up to 16–18 ft; 2×10 up to 20–22 ft; 2×12 for longer spans. These are rough guides — always consult span tables (IRC Table R802.4 or equivalent) and your local building code. Most jurisdictions require an engineer\'s stamp for unusual spans or heavy snow loads.',
    },
    {
      question: 'How many rafters do I need?',
      answer:
        'Rafter count depends on your ridge length and spacing. At 16" OC: count = ⌈(ridge length / spacing)⌉ + 1, then × 2 for both sides. A 20-foot ridge at 16" OC: (20 × 12 / 16) + 1 = 16 rafters per side × 2 sides = 32 rafters. Add two for the gable-end rafters. This calculator focuses on rafter length — for total count, divide ridge length by spacing and add end rafters.',
    },
    {
      question: 'What is the difference between common, hip, and valley rafters?',
      answer:
        'Common rafters run perpendicular from the wall plate to the ridge — this calculator calculates common rafter length. Hip rafters run at 45° from a corner to the ridge end on hip roofs — their length is longer: hip rafter = √(run² + run² + rise²) = √(2 × run² + rise²). Valley rafters occupy re-entrant corners on L-shaped roofs and use the same formula as hip rafters. Jack rafters are shortened common rafters that frame into hip or valley rafters rather than the ridge.',
    },
  ],
};
