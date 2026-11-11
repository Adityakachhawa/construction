import { ceilQuantity } from './rounding';
import type {
  CalculatorConfig,
  CalculatorInputMap,
  CalculatorOutputMap,
  UnitSystem,
} from './_types';
import { cylVolumeImperial, cylVolumeMetric, bagsFromFeet } from './volume-engine';

// 80 lb bag of Quikrete = 0.60 cubic feet
const BAG_CUBIC_FEET = 0.60;

function footingGrid(lengthSpan: number, widthSpan: number, spacing: number): number {
  const spacingClamped = Math.max(spacing, 0.01);
  const alongLength = ceilQuantity(lengthSpan / spacingClamped) + 1;
  const alongWidth  = ceilQuantity(widthSpan  / spacingClamped) + 1;
  return alongLength * alongWidth;
}

export function formula(inputs: CalculatorInputMap, unitSystem: UnitSystem): CalculatorOutputMap {
  if (unitSystem === 'imperial') {
    const lengthFt   = Number(inputs.deck_length_ft ?? 12) + Number(inputs.deck_length_in ?? 0) / 12;
    const widthFt    = Number(inputs.deck_width_ft  ?? 10) + Number(inputs.deck_width_in  ?? 0) / 12;
    const spacingFt  = Number(inputs.footing_spacing_ft ?? 8) + Number(inputs.footing_spacing_in ?? 0) / 12;
    const diamIn     = Number(inputs.footing_diameter ?? 12);
    const depthIn    = Number(inputs.footing_depth   ?? 42);

    const footings   = footingGrid(lengthFt, widthFt, spacingFt);
    const perHole    = cylVolumeImperial(diamIn, depthIn);
    const totalFt3   = perHole.cubic_feet   * footings;
    const totalYd3   = perHole.cubic_yards  * footings;
    const totalM3    = perHole.cubic_meters * footings;
    const bags       = bagsFromFeet(totalFt3, BAG_CUBIC_FEET);

    return {
      footings,
      cubic_yards:  Math.round(totalYd3 * 100) / 100,
      cubic_feet:   Math.round(totalFt3 * 100) / 100,
      cubic_meters: Math.round(totalM3  * 1000) / 1000,
      bags,
    };
  } else {
    const lengthM    = Number(inputs.deck_length_m  ?? 3.6);
    const widthM     = Number(inputs.deck_width_m   ?? 3.0);
    const spacingM   = Number(inputs.footing_spacing_m ?? 2.4);
    const diamMm     = Number(inputs.footing_diameter_mm ?? 300);
    const depthMm    = Number(inputs.footing_depth_mm   ?? 1060);

    const footings   = footingGrid(lengthM, widthM, spacingM);
    const perHole    = cylVolumeMetric(diamMm, depthMm);
    const totalM3    = perHole.cubic_meters * footings;
    const totalFt3   = perHole.cubic_feet   * footings;
    const totalYd3   = perHole.cubic_yards  * footings;
    const bags       = bagsFromFeet(totalFt3, BAG_CUBIC_FEET);

    return {
      footings,
      cubic_meters: Math.round(totalM3  * 1000) / 1000,
      cubic_feet:   Math.round(totalFt3 * 100)  / 100,
      cubic_yards:  Math.round(totalYd3 * 100)  / 100,
      bags,
    };
  }
}

export const deckFootingCalculator: CalculatorConfig = {
  slug: 'deck-footing-calculator',
  name: 'Deck Footing Calculator',
  category: 'decking',
  description:
    'Calculate how many deck footings you need, concrete volume per hole, total cubic yards, and bags of concrete. Supports any deck size, footing spacing, diameter, and depth.',
  inputs: [
    // â”€â”€ Imperial â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    {
      id: 'deck_length_ft',
      label: 'Deck Length',
      type: 'number',
      unit: 'ft',
      min: 1,
      max: 500,
      step: 1,
      defaultValue: 12,
      required: true,
      onlyIn: 'imperial',
    },
    {
      id: 'deck_length_in',
      label: 'Deck Length (in)',
      type: 'number',
      unit: 'in',
      min: 0,
      max: 11,
      step: 1,
      defaultValue: 0,
      onlyIn: 'imperial',
      groupWith: 'deck_length_ft',
    },
    {
      id: 'deck_width_ft',
      label: 'Deck Width',
      type: 'number',
      unit: 'ft',
      min: 1,
      max: 500,
      step: 1,
      defaultValue: 10,
      required: true,
      onlyIn: 'imperial',
    },
    {
      id: 'deck_width_in',
      label: 'Deck Width (in)',
      type: 'number',
      unit: 'in',
      min: 0,
      max: 11,
      step: 1,
      defaultValue: 0,
      onlyIn: 'imperial',
      groupWith: 'deck_width_ft',
    },
    {
      id: 'footing_spacing_ft',
      label: 'Footing Spacing',
      type: 'number',
      unit: 'ft',
      min: 1,
      max: 20,
      step: 1,
      defaultValue: 8,
      required: true,
      onlyIn: 'imperial',
      helpText: 'Max distance between footings. Typically 6â€“8 ft for wood decks.',
    },
    {
      id: 'footing_spacing_in',
      label: 'Footing Spacing (in)',
      type: 'number',
      unit: 'in',
      min: 0,
      max: 11,
      step: 1,
      defaultValue: 0,
      onlyIn: 'imperial',
      groupWith: 'footing_spacing_ft',
    },
    {
      id: 'footing_diameter',
      label: 'Footing Diameter',
      type: 'number',
      unit: 'in',
      min: 6,
      max: 36,
      step: 1,
      defaultValue: 12,
      required: true,
      onlyIn: 'imperial',
      helpText: 'Typically 10â€“12 in for residential decks.',
    },
    {
      id: 'footing_depth',
      label: 'Footing Depth',
      type: 'number',
      unit: 'in',
      min: 12,
      max: 84,
      step: 1,
      defaultValue: 42,
      required: true,
      onlyIn: 'imperial',
      helpText: 'Must be below local frost line. Typically 36â€“48 in.',
    },
    // â”€â”€ Metric â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    {
      id: 'deck_length_m',
      label: 'Deck Length',
      type: 'number',
      unit: 'm',
      min: 0.5,
      max: 150,
      step: 0.1,
      defaultValue: 3.6,
      defaultValueMetric: 3.6,
      required: true,
      onlyIn: 'metric',
    },
    {
      id: 'deck_width_m',
      label: 'Deck Width',
      type: 'number',
      unit: 'm',
      min: 0.5,
      max: 150,
      step: 0.1,
      defaultValue: 3.0,
      defaultValueMetric: 3.0,
      required: true,
      onlyIn: 'metric',
    },
    {
      id: 'footing_spacing_m',
      label: 'Footing Spacing',
      type: 'number',
      unit: 'm',
      min: 0.3,
      max: 6,
      step: 0.1,
      defaultValue: 2.4,
      defaultValueMetric: 2.4,
      required: true,
      onlyIn: 'metric',
      helpText: 'Max distance between footings. Typically 1.8â€“2.4 m.',
    },
    {
      id: 'footing_diameter_mm',
      label: 'Footing Diameter',
      type: 'number',
      unit: 'mm',
      min: 150,
      max: 900,
      step: 25,
      defaultValue: 300,
      defaultValueMetric: 300,
      required: true,
      onlyIn: 'metric',
      helpText: 'Typically 250â€“300 mm for residential decks.',
    },
    {
      id: 'footing_depth_mm',
      label: 'Footing Depth',
      type: 'number',
      unit: 'mm',
      min: 300,
      max: 2100,
      step: 50,
      defaultValue: 1060,
      defaultValueMetric: 1060,
      required: true,
      onlyIn: 'metric',
      helpText: 'Must be below local frost line. Typically 900â€“1200 mm.',
    },
  ],
  outputs: [
    {
      id: 'footings',
      label: 'Total Footings',
      unit: 'footings',
      format: 'number',
      primary: true,
      description: 'Hypothetical full grid, including all perimeter supports; no ledger deduction',
    },
    {
      id: 'bags',
      label: 'Bags of Concrete',
      unit: 'bags',
      format: 'number',
      description: '80 lb bags (0.60 cu ft each) â€” rounds up',
    },
    {
      id: 'cubic_yards',
      label: 'Cubic Yards',
      unit: 'ydÂ³',
      format: 'volume',
      description: 'Total concrete for all footings',
    },
    {
      id: 'cubic_feet',
      label: 'Cubic Feet',
      unit: 'ftÂ³',
      format: 'volume',
    },
    {
      id: 'cubic_meters',
      label: 'Cubic Meters',
      unit: 'mÂ³',
      format: 'volume',
    },
  ],
  formula,
  unitSystems: ['imperial', 'metric'],
  relatedCalculators: ['concrete-slab-calculator', 'fence-post-calculator', 'gravel-calculator'],
  seo: {
    title: 'Deck Footing Calculator â€” How Many Footings Do I Need?',
    description:
      'Free deck footing calculator â€” enter deck size, footing spacing, diameter, and depth to calculate total footings needed, concrete volume, cubic yards, and bags of concrete.',
    h1: 'Deck Footing Calculator',
    focusKeyword: 'deck footing calculator',
  },

  disclaimer: 'Construction estimate only: Results are based on the dimensions and assumptions entered. This calculator does not perform structural engineering or guarantee local building-code compliance. Verify project-specific requirements with your local building department or a qualified professional.',
  schema: {
    appType: 'Construction Calculator',
    features: [
      'Calculate total deck footings needed',
      'Calculate concrete volume per hole and total',
      'Calculate cubic yards and cubic feet of concrete',
      'Calculate bags of concrete needed',
      'Imperial and metric support',
      'Footing depth and diameter inputs',
    ],
  },
  formulaSteps: [
    {
      label: 'Calculate footings along each dimension',
      formula: 'Posts per side = âŒˆDeck Length Ã· SpacingâŒ‰ + 1',
      description: 'Each dimension needs end posts plus one post per full span â€” partial spans round up',
    },
    {
      label: 'Calculate total footing count',
      formula: 'Footings = Posts along length Ã— Posts along width',
      description: 'Footings form a grid across the deck footprint',
    },
    {
      label: 'Calculate volume of one cylindrical footing',
      formula: 'Volume (ftÂ³) = Ï€ Ã— (Diameter Ã· 2 Ã· 12)Â² Ã— (Depth Ã· 12)',
      description: 'Diameter and depth are converted from inches to feet before applying the cylinder formula',
    },
    {
      label: 'Calculate total concrete',
      formula: 'Total (ydÂ³) = (Volume per hole Ã— Footings) Ã· 27',
    },
    {
      label: 'Calculate bags',
      formula: 'Bags = âŒˆTotal (ftÂ³) Ã· 0.60âŒ‰',
      description: 'One 80 lb bag of concrete mix yields 0.60 cubic feet â€” always round up',
    },
  ],
  faq: [
    {
      question: 'How many deck footings do I need?',
      answer:
        'The number of footings depends on your deck dimensions and post spacing. The formula is: footings = (ceil(length Ã· spacing) + 1) Ã— (ceil(width Ã· spacing) + 1). A 12 Ã— 16 ft deck with 8 ft spacing needs (ceil(16/8)+1) Ã— (ceil(12/8)+1) = 3 Ã— 3 = 9 footings in this full-grid model. An attached deck with a ledger and one beam, or a freestanding deck with two beam lines, has a different layout. Use an approved framing plan to choose the actual support count; this tool does not design it.',
    },
    {
      question: 'How deep should deck footings be?',
      answer:
        'Use the locally approved frost-protection and foundation detail. Regional depth estimates are not a project-specific footing-depth requirement.',
    },
    {
      question: 'What size deck footings do I need?',
      answer:
        'Use the footing diameter from the approved support schedule, based on loads, framing layout and allowable site bearing pressure. This calculator does not size footings.',
    },
    {
      question: 'What is the standard deck footing spacing?',
      answer:
        'Use the support spacing and beam/joist layout from the approved framing plan. This calculator only estimates a full rectangular support grid.',
    },
    {
      question: 'How do I calculate deck footing depth for my frost line?',
      answer:
        'Obtain required founding depth and footing thickness from the approved detail and local requirements. Do not automatically add six inches to a frost-depth estimate.',
    },
    {
      question: 'How much concrete do I need per deck footing?',
      answer:
        'A 12-inch diameter hole at 42 inches deep holds about 2.749 cubic feet of concrete, which is 5 bags before waste of 80 lb Quikrete (each bag yields 0.60 cu ft). Use the calculator above to get the exact bag count for your footing diameter and depth. For large jobs, ordering ready-mix is more economical than bags.',
    },
    {
      question: 'Can I use tube forms (Sonotubes) for deck footings?',
      answer:
        'Use tube forms according to the approved footing detail and manufacturer instructions. This calculator models cylindrical volume; it does not specify excavation support or construction methods.',
    },
    {
      question: 'Do deck footings need rebar?',
      answer:
        'Use the approved reinforcement schedule for bars, ties, cover and anchorage. This calculator does not determine reinforcement from footing depth.',
    },
  ],
  presets: [
    {
      label: '10Ã—10 Deck (10" Ã— 36")',
      values: { deck_length_ft: 10, deck_length_in: 0, deck_width_ft: 10, deck_width_in: 0, footing_spacing_ft: 8, footing_spacing_in: 0, footing_diameter: 10, footing_depth: 36 },
      unit: 'imperial',
    },
    {
      label: '12Ã—16 Attached Deck (12" Ã— 42")',
      values: { deck_length_ft: 16, deck_length_in: 0, deck_width_ft: 12, deck_width_in: 0, footing_spacing_ft: 8, footing_spacing_in: 0, footing_diameter: 12, footing_depth: 42 },
      unit: 'imperial',
    },
    {
      label: '16Ã—20 Large Deck (12" Ã— 42")',
      values: { deck_length_ft: 20, deck_length_in: 0, deck_width_ft: 16, deck_width_in: 0, footing_spacing_ft: 8, footing_spacing_in: 0, footing_diameter: 12, footing_depth: 42 },
      unit: 'imperial',
    },
    {
      label: '20Ã—20 Freestanding (12" Ã— 48")',
      values: { deck_length_ft: 20, deck_length_in: 0, deck_width_ft: 20, deck_width_in: 0, footing_spacing_ft: 8, footing_spacing_in: 0, footing_diameter: 12, footing_depth: 48 },
      unit: 'imperial',
    },
  ],
  referenceTable: {
    title: 'Deck Footing Count & Concrete Volume Reference',
    description: 'Illustrative full grid at maximum 8-foot spacing in both directions, 36-inch cylindrical depth, no waste. These are quantities, not approved layouts or frost depths:',
    headers: ['Deck Size (ft)', 'Hole Diameter', 'Footing Count', 'Cubic Yards', '80 lb Bags'],
    rows: [
      ['10â€² Ã— 10â€² Deck', '8"', '9', '0.35', '16'],
      ['10â€² Ã— 10â€² Deck', '10"', '9', '0.55', '25'],
      ['12â€² Ã— 12â€² Deck', '10"', '9', '0.55', '25'],
      ['12â€² Ã— 12â€² Deck', '12"', '9', '0.79', '36'],
      ['12â€² Ã— 16â€² Deck', '10"', '9', '0.55', '25'],
      ['12â€² Ã— 16â€² Deck', '12"', '9', '0.79', '36'],
      ['16â€² Ã— 20â€² Deck', '10"', '12', '0.73', '33'],
      ['16â€² Ã— 20â€² Deck', '12"', '12', '1.05', '48'],
      ['20â€² Ã— 20â€² Deck', '10"', '16', '0.97', '44'],
      ['20â€² Ã— 20â€² Deck', '12"', '16', '1.40', '63'],
    ],
  },
};
