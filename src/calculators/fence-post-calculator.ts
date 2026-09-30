import type {
  CalculatorConfig,
  CalculatorInputMap,
  CalculatorOutputMap,
  UnitSystem,
} from './_types';

// Minimum post depth: 1/3 of post height above ground, or local frost depth.
// Rule of thumb: depth = fence height × 0.33, min 24 in (610 mm).
const MIN_DEPTH_IN  = 24;
const MIN_DEPTH_MM  = 610;

function formula(inputs: CalculatorInputMap, unitSystem: UnitSystem): CalculatorOutputMap {
  if (unitSystem === 'imperial') {
    const fenceLengthFt = Number(inputs.fence_length_ft ?? 100);
    const fenceLengthIn = Number(inputs.fence_length_in ?? 0);
    const spacingFt     = Number(inputs.post_spacing_ft ?? 8);
    const spacingIn     = Number(inputs.post_spacing_in ?? 0);
    const postDepthIn   = Number(inputs.post_depth ?? 24);
    const gates         = Number(inputs.gates ?? 0);

    const totalLengthFt = fenceLengthFt + fenceLengthIn / 12;
    const spacingFtFull = spacingFt + spacingIn / 12;

    const spacingClamped = Math.max(spacingFtFull, 0.5);
    // Posts = sections + 1 (corner/end posts), then add one post per gate opening
    const sections  = Math.ceil(totalLengthFt / spacingClamped);
    const posts     = sections + 1 + gates;
    const postHoles = posts;
    const recDepth  = Math.max(postDepthIn, MIN_DEPTH_IN);

    return {
      posts,
      post_holes: postHoles,
      sections,
      rec_depth: recDepth,
    };
  } else {
    const fenceLengthM  = Number(inputs.fence_length_m ?? 30);
    const spacingM      = Number(inputs.post_spacing_m ?? 2.4);
    const postDepthMm   = Number(inputs.post_depth_mm ?? 610);
    const gates         = Number(inputs.gates ?? 0);

    const spacingClamped = Math.max(spacingM, 0.1);
    const sections  = Math.ceil(fenceLengthM / spacingClamped);
    const posts     = sections + 1 + gates;
    const postHoles = posts;
    const recDepth  = Math.max(postDepthMm, MIN_DEPTH_MM);

    return {
      posts,
      post_holes: postHoles,
      sections,
      rec_depth: recDepth,
    };
  }
}

export const fencePostCalculator: CalculatorConfig = {
  slug: 'fence-post-calculator',
  name: 'Fence Post Calculator',
  category: 'fencing',
  description:
    'Calculate how many fence posts you need, post hole count, recommended post depth, and number of fence sections. Supports any fence length and post spacing.',
  inputs: [
    // ── Imperial ──────────────────────────────────────
    {
      id: 'fence_length_ft',
      label: 'Fence Length',
      type: 'number',
      unit: 'ft',
      min: 1,
      max: 10000,
      step: 1,
      defaultValue: 100,
      required: true,
      onlyIn: 'imperial',
    },
    {
      id: 'fence_length_in',
      label: 'Fence Length (in)',
      type: 'number',
      unit: 'in',
      min: 0,
      max: 11,
      step: 1,
      defaultValue: 0,
      onlyIn: 'imperial',
      groupWith: 'fence_length_ft',
    },
    {
      id: 'post_spacing_ft',
      label: 'Post Spacing',
      type: 'number',
      unit: 'ft',
      min: 1,
      max: 20,
      step: 1,
      defaultValue: 8,
      required: true,
      onlyIn: 'imperial',
      helpText: 'Standard spacing: 8 ft for wood, 10 ft for chain-link.',
    },
    {
      id: 'post_spacing_in',
      label: 'Post Spacing (in)',
      type: 'number',
      unit: 'in',
      min: 0,
      max: 11,
      step: 1,
      defaultValue: 0,
      onlyIn: 'imperial',
      groupWith: 'post_spacing_ft',
    },
    {
      id: 'post_depth',
      label: 'Post Hole Depth',
      type: 'number',
      unit: 'in',
      min: 12,
      max: 60,
      step: 1,
      defaultValue: 24,
      required: true,
      onlyIn: 'imperial',
      helpText: 'Min 24 in, or 1/3 of total post length. Go below frost line.',
    },
    {
      id: 'gates',
      label: 'Number of Gates',
      type: 'number',
      unit: '',
      min: 0,
      max: 50,
      step: 1,
      defaultValue: 0,
      onlyIn: 'imperial',
      helpText: 'Each gate opening adds one extra post.',
    },
    // ── Metric ────────────────────────────────────────
    {
      id: 'fence_length_m',
      label: 'Fence Length',
      type: 'number',
      unit: 'm',
      min: 0.5,
      max: 3000,
      step: 0.1,
      defaultValue: 30,
      defaultValueMetric: 30,
      required: true,
      onlyIn: 'metric',
    },
    {
      id: 'post_spacing_m',
      label: 'Post Spacing',
      type: 'number',
      unit: 'm',
      min: 0.3,
      max: 6,
      step: 0.1,
      defaultValue: 2.4,
      defaultValueMetric: 2.4,
      required: true,
      onlyIn: 'metric',
      helpText: 'Standard spacing: 2.4 m for wood, 3 m for chain-link.',
    },
    {
      id: 'post_depth_mm',
      label: 'Post Hole Depth',
      type: 'number',
      unit: 'mm',
      min: 300,
      max: 1500,
      step: 50,
      defaultValue: 610,
      defaultValueMetric: 610,
      required: true,
      onlyIn: 'metric',
      helpText: 'Min 600 mm, or 1/3 of total post length.',
    },
    {
      id: 'gates',
      label: 'Number of Gates',
      type: 'number',
      unit: '',
      min: 0,
      max: 50,
      step: 1,
      defaultValue: 0,
      onlyIn: 'metric',
      helpText: 'Each gate opening adds one extra post.',
    },
  ],
  outputs: [
    {
      id: 'posts',
      label: 'Total Posts Required',
      unit: 'posts',
      format: 'number',
      primary: true,
      description: 'Includes end posts and one post per gate opening',
    },
    {
      id: 'post_holes',
      label: 'Post Holes',
      unit: 'holes',
      format: 'number',
      description: 'One hole per post',
    },
    {
      id: 'sections',
      label: 'Fence Sections',
      unit: 'sections',
      format: 'number',
      description: 'Number of panel or rail spans between posts',
    },
    {
      id: 'rec_depth',
      label: 'Hole Depth',
      unit: 'in',
      unitMetric: 'mm',
      format: 'length',
      description: 'Recommended minimum post hole depth',
    },
  ],
  formula,
  unitSystems: ['imperial', 'metric'],
  relatedCalculators: ['concrete-slab-calculator', 'gravel-calculator'],
  seo: {
    title: 'Fence Post Calculator — Posts, Spacing & Hole Depth',
    description:
      'Free fence post calculator — enter fence length and post spacing to instantly calculate total posts needed, post holes, fence sections, and recommended hole depth.',
    h1: 'Fence Post Calculator',
    focusKeyword: 'fence post calculator',
  },

  disclaimer: 'Construction estimate only: Results are based on the dimensions and assumptions entered. This calculator does not perform structural engineering or guarantee local building-code compliance. Verify project-specific requirements with your local building department or a qualified professional.',
  schema: {
    appType: 'Construction Calculator',
    features: [
      'Calculate total fence posts needed',
      'Calculate post hole count',
      'Calculate recommended post hole depth',
      'Calculate number of fence sections',
      'Gate opening support',
      'Imperial and metric units',
    ],
  },
  formulaSteps: [
    {
      label: 'Calculate fence sections',
      formula: 'Sections = ⌈Fence Length ÷ Post Spacing⌉',
      description: 'Always round up — a partial span still needs a full section and post',
    },
    {
      label: 'Calculate total posts',
      formula: 'Posts = Sections + 1 + Gates',
      description: 'A fence with N sections needs N+1 posts; each gate opening adds one extra post',
    },
    {
      label: 'Verify post hole depth',
      formula: 'Hole Depth = max(entered depth, 24 in)',
      description: 'Never less than 24 inches — check local frost depth for your region',
    },
  ],
  faq: [
    {
      question: 'How many fence posts do I need?',
      answer:
        'The formula is: Posts = (Fence Length ÷ Post Spacing) + 1. For a 100-foot fence with 8-foot spacing, that is (100 ÷ 8) + 1 = 13.5, rounded up to 14 posts. Add one extra post for each gate opening. Use the calculator above to get the exact count for your fence.',
    },
    {
      question: 'What is the standard fence post spacing?',
      answer:
        'Standard post spacing is 8 feet (2.4 m) for wood privacy fences and picket fences. Chain-link fences typically use 10-foot (3 m) spacing. Rail fences often use 8–10 feet. Closer spacing (6 feet) adds strength in windy areas or for tall fences over 6 feet.',
    },
    {
      question: 'How deep should fence post holes be?',
      answer:
        'Post holes should be at least 1/3 of the total post length, with a minimum of 24 inches (610 mm). For a 6-foot fence using 8-foot posts, dig at least 2 feet deep (1/3 of 8 ft). In cold climates, always dig below the local frost line — which can be 36–48 inches in northern regions.',
    },
    {
      question: 'What is the fence post hole depth calculator formula?',
      answer:
        'The rule of thumb is: Hole Depth = Total Post Length × 0.33. A 8-foot post needs a 2.6-foot (32-inch) hole. Always check your local frost line depth and use the greater of the two values. Posts set above the frost line will heave and lean over time.',
    },
    {
      question: 'How do I calculate fence post spacing?',
      answer:
        'Divide your total fence length by your desired section width to get the number of sections, then add 1 for the final end post. To space posts evenly, divide total length by the number of sections. For example, a 97-foot fence ideally divided into 8-foot sections needs 13 sections (97 ÷ 8 = 12.1, rounded up to 13), with posts at every 7.46 feet for even spacing.',
    },
    {
      question: 'How wide should fence post holes be?',
      answer:
        'Fence post holes should be 3 times the diameter of the post. For a standard 4×4 post (3.5 inches actual), dig a hole 10–12 inches wide. For a 6×6 post, use a 14–16 inch diameter hole. Wider holes allow more concrete to surround the post for better anchoring.',
    },
    {
      question: 'How much concrete do I need per fence post?',
      answer:
        'A typical fence post hole (12 inches diameter × 24 inches deep) needs about 0.2 cubic feet of concrete, or roughly one 50-lb bag of fast-setting concrete mix. Larger holes need proportionally more — use the concrete slab calculator to compute the exact volume for your hole dimensions.',
    },
    {
      question: 'Should I set fence posts in concrete or gravel?',
      answer:
        'Concrete provides the strongest, most stable anchor — recommended for privacy fences, tall fences, and any fence in high-wind areas. Gravel drainage is an alternative for areas with poor drainage or where post rot is a concern — it lets the post breathe and moisture drain. Many professionals use a gravel base (6 inches) with concrete on top for the best of both.',
    },
  ],
};
