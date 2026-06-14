import type {
  CalculatorConfig,
  CalculatorInputMap,
  CalculatorOutputMap,
  UnitSystem,
} from './_types';

// Roof pitch classification thresholds (pitch = rise/run as decimal)
function classifyPitch(pitchDecimal: number): string {
  if (pitchDecimal < 1 / 12)  return 'Flat (< 1:12)';
  if (pitchDecimal < 4 / 12)  return 'Low slope (1:12 – 3:12)';
  if (pitchDecimal < 9 / 12)  return 'Conventional (4:12 – 8:12)';
  if (pitchDecimal < 19 / 12) return 'Steep (9:12 – 18:12)';
  return 'Very steep (≥ 19:12)';
}

// Encode classification string as a numeric index so the output map (Record<string,number>) stays type-safe.
// The CalculatorWidget renders it via the description field; we store index and expose the label separately.
// Instead: store as a second output we don't render numerically — but CalculatorOutputMap is Record<string,number>.
// Workaround: store a hash index 0-4 and map to label in the outputs description.
// Actually the cleanest approach that matches existing calculators: skip the classification as a numeric output
// and include it in the formula steps / description instead.
// We include pitch_ratio (e.g. 6.0 = 6:12) as the primary numeric, angle, slope_pct, rafter_length.

function formula(inputs: CalculatorInputMap, unitSystem: UnitSystem): CalculatorOutputMap {
  if (unitSystem === 'imperial') {
    const riseFt  = Number(inputs.rise_ft  ?? 6) + Number(inputs.rise_in  ?? 0) / 12;
    const runFt   = Number(inputs.run_ft   ?? 12) + Number(inputs.run_in  ?? 0) / 12;

    if (runFt <= 0) {
      return { pitch_ratio: 0, angle_deg: 0, slope_pct: 0, rafter_length_ft: 0, rafter_length_m: 0 };
    }

    const pitchDecimal   = riseFt / runFt;
    const pitch_ratio    = Math.round(pitchDecimal * 12 * 100) / 100; // rise per 12" run
    const angle_deg      = Math.round(Math.atan(pitchDecimal) * (180 / Math.PI) * 100) / 100;
    const slope_pct      = Math.round(pitchDecimal * 100 * 10) / 10;
    // Rafter length = √(rise² + run²), in feet
    const rafter_length_ft = Math.round(Math.sqrt(riseFt ** 2 + runFt ** 2) * 100) / 100;

    return { pitch_ratio, angle_deg, slope_pct, rafter_length_ft, rafter_length_m: Math.round(rafter_length_ft * 0.3048 * 100) / 100 };
  } else {
    const riseM  = Number(inputs.rise_m  ?? 1.8);
    const runM   = Number(inputs.run_m   ?? 3.6);

    if (runM <= 0) {
      return { pitch_ratio: 0, angle_deg: 0, slope_pct: 0, rafter_length_ft: 0, rafter_length_m: 0 };
    }

    const pitchDecimal   = riseM / runM;
    const pitch_ratio    = Math.round(pitchDecimal * 12 * 100) / 100;
    const angle_deg      = Math.round(Math.atan(pitchDecimal) * (180 / Math.PI) * 100) / 100;
    const slope_pct      = Math.round(pitchDecimal * 100 * 10) / 10;
    const rafter_length_m = Math.round(Math.sqrt(riseM ** 2 + runM ** 2) * 100) / 100;

    return { pitch_ratio, angle_deg, slope_pct, rafter_length_m, rafter_length_ft: Math.round(rafter_length_m / 0.3048 * 100) / 100 };
  }
}

export const roofPitchCalculator: CalculatorConfig = {
  slug: 'roof-pitch-calculator',
  name: 'Roof Pitch Calculator',
  category: 'framing',
  description:
    'Calculate roof pitch ratio (X:12), angle in degrees, slope percentage, and rafter length from rise and run. Instant results for any roofing or framing project.',
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
  ],
  outputs: [
    {
      id: 'pitch_ratio',
      label: 'Pitch Ratio (X:12)',
      unit: ':12',
      format: 'number',
      primary: true,
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
    {
      id: 'rafter_length_ft',
      label: 'Rafter Length',
      unit: 'ft',
      format: 'length',
      description: 'Diagonal rafter length from wall to ridge (imperial)',
    },
    {
      id: 'rafter_length_m',
      label: 'Rafter Length',
      unit: 'm',
      format: 'length',
      description: 'Diagonal rafter length from wall to ridge (metric)',
    },
  ],
  formula,
  unitSystems: ['imperial', 'metric'],
  relatedCalculators: [
    'stud-calculator',
    'plywood-calculator',
  ],
  seo: {
    title: 'Roof Pitch Calculator — Rise, Run & Rafter Length',
    description:
      'Free roof pitch calculator — enter rise and run to get pitch ratio (X:12), roof angle in degrees, slope percentage, and rafter length instantly for any roofing or framing project.',
    h1: 'Roof Pitch Calculator',
    focusKeyword: 'roof pitch calculator',
  },
  schema: {
    appType: 'Construction Calculator',
    features: [
      'Calculate roof pitch ratio (X:12)',
      'Calculate roof angle in degrees',
      'Calculate slope percentage',
      'Calculate rafter length from rise and run',
      'Roof pitch classification (flat to very steep)',
      'Imperial and metric support',
    ],
  },
  formulaSteps: [
    {
      label: 'Calculate pitch ratio',
      formula: 'Pitch (X:12) = (Rise ÷ Run) × 12',
      description:
        'Pitch is expressed as inches of rise per 12 inches of horizontal run. A 6:12 pitch rises 6 inches for every 12 inches of run.',
    },
    {
      label: 'Calculate roof angle',
      formula: 'Angle (°) = arctan(Rise ÷ Run) × (180 ÷ π)',
      description:
        'Convert the pitch to degrees using the inverse tangent. A 6:12 pitch equals approximately 26.57°.',
    },
    {
      label: 'Calculate slope percentage',
      formula: 'Slope (%) = (Rise ÷ Run) × 100',
      description:
        'Slope percentage is common in civil engineering and drainage specifications. A 6:12 pitch = 50% slope.',
    },
    {
      label: 'Calculate rafter length',
      formula: 'Rafter = √(Rise² + Run²)',
      description:
        'Apply the Pythagorean theorem. This gives the structural rafter length before adding any overhang or eave allowance.',
    },
    {
      label: 'Classify the pitch',
      formula: 'Flat < 1:12 | Low 1–3:12 | Conventional 4–8:12 | Steep 9–18:12 | Very steep ≥ 19:12',
      description:
        'Classification determines suitable roofing materials and drainage requirements. Flat and low-slope roofs require membrane systems; conventional and steep slopes suit asphalt shingles and metal panels.',
    },
  ],
  faq: [
    {
      question: 'What does roof pitch mean?',
      answer:
        'Roof pitch is the ratio of vertical rise to horizontal run, expressed as X:12. A 6:12 pitch means the roof rises 6 inches for every 12 inches of horizontal run. It determines the steepness of the roof, the roofing materials you can use, and the structural loads the framing must carry. Higher pitches shed rain and snow more effectively but require more material and labour to frame.',
    },
    {
      question: 'What is a standard or common roof pitch?',
      answer:
        'The most common residential roof pitches in North America are 4:12 to 9:12. A 6:12 pitch is the single most common — it provides good drainage, is relatively easy to walk on for maintenance, and suits most asphalt shingles. Low-slope roofs (1:12 to 3:12) require special underlayment or membrane systems. Pitches above 12:12 (45°) are considered steep slope and need safety equipment to work on.',
    },
    {
      question: 'What is the difference between roof pitch and roof slope?',
      answer:
        'Roof pitch and roof slope describe the same steepness from different angles. Pitch (X:12) is used by carpenters and framers — rise per 12 inches of run. Slope percentage (rise ÷ run × 100) is used in civil engineering and drainage. Angle in degrees is used in structural calculations and by roofers working with metal panels and solar installations. All three can be converted from each other; this calculator outputs all three.',
    },
    {
      question: 'How do I measure roof pitch from the ground?',
      answer:
        'Use a level and a tape measure. Hold a 12-inch level horizontally against the roof from the ridge side. Mark 12 inches along the level, then measure straight down from that mark to the roof surface — that vertical distance is your rise, giving you a direct X:12 reading. Alternatively, measure the full rise (ridge height minus wall height) and the full run (half the building width), then enter those values here.',
    },
    {
      question: 'How do I calculate rafter length from pitch?',
      answer:
        'Rafter length equals the square root of (rise² + run²) — the Pythagorean theorem applied to the right triangle formed by the rise, run, and rafter. For a 6:12 pitch over a 12-foot run, rafter = √(6² + 12²) = √(36 + 144) = √180 ≈ 13.42 ft. Add your eave overhang to this to get the cut length. This calculator gives the structural rafter length; add overhang separately.',
    },
    {
      question: 'What roof pitch is too steep to walk on safely?',
      answer:
        'Most roofers consider pitches above 7:12 (about 30°) to require fall protection — harnesses, roof jacks, or scaffolding. Above 12:12 (45°), walking on the roof without anchor points and proper PPE is extremely dangerous. Always check your local occupational health and safety regulations before accessing any roof. Low-slope roofs (under 4:12) are generally walkable but can be slippery when wet.',
    },
    {
      question: 'What roofing materials work with low-slope roofs?',
      answer:
        'Pitches below 3:12 require roofing materials rated for low slope: TPO, EPDM, or modified bitumen membranes are standard. Between 2:12 and 4:12, some manufacturers allow asphalt shingles with double underlayment — check the product data sheet for the minimum slope. Metal standing-seam panels can work down to about 1:12 with sealant. Conventional asphalt shingles are rated for 4:12 and above.',
    },
    {
      question: 'How does roof pitch affect the amount of roofing material needed?',
      answer:
        'A steeper pitch increases the actual roof surface area relative to the floor plan footprint. A flat roof (1:12) covers almost exactly the same area as the ceiling below it. A 6:12 pitch multiplies the floor area by about 1.118 (the rafter factor = rafter length ÷ run). A 12:12 pitch multiplies by √2 ≈ 1.414. To get total roof area, calculate the footprint area and multiply by the rafter factor for your pitch. Add 10–15% for waste and overlap.',
    },
  ],
};
