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
  const alongLength = Math.ceil(lengthSpan / spacingClamped) + 1;
  const alongWidth  = Math.ceil(widthSpan  / spacingClamped) + 1;
  return alongLength * alongWidth;
}

function formula(inputs: CalculatorInputMap, unitSystem: UnitSystem): CalculatorOutputMap {
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
    // ── Imperial ──────────────────────────────────────
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
      helpText: 'Max distance between footings. Typically 6–8 ft for wood decks.',
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
      helpText: 'Typically 10–12 in for residential decks.',
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
      helpText: 'Must be below local frost line. Typically 36–48 in.',
    },
    // ── Metric ────────────────────────────────────────
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
      helpText: 'Max distance between footings. Typically 1.8–2.4 m.',
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
      helpText: 'Typically 250–300 mm for residential decks.',
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
      helpText: 'Must be below local frost line. Typically 900–1200 mm.',
    },
  ],
  outputs: [
    {
      id: 'footings',
      label: 'Total Footings',
      unit: 'footings',
      format: 'number',
      primary: true,
      description: 'Grid of posts along deck length × width',
    },
    {
      id: 'bags',
      label: 'Bags of Concrete',
      unit: 'bags',
      format: 'number',
      description: '80 lb bags (0.60 cu ft each) — rounds up',
    },
    {
      id: 'cubic_yards',
      label: 'Cubic Yards',
      unit: 'yd³',
      format: 'volume',
      description: 'Total concrete for all footings',
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
  relatedCalculators: ['concrete-slab-calculator', 'fence-post-calculator', 'gravel-calculator'],
  seo: {
    title: 'Deck Footing Calculator — How Many Footings Do I Need?',
    description:
      'Free deck footing calculator — enter deck size, footing spacing, diameter, and depth to calculate total footings needed, concrete volume, cubic yards, and bags of concrete.',
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
      formula: 'Posts per side = ⌈Deck Length ÷ Spacing⌉ + 1',
      description: 'Each dimension needs end posts plus one post per full span — partial spans round up',
    },
    {
      label: 'Calculate total footing count',
      formula: 'Footings = Posts along length × Posts along width',
      description: 'Footings form a grid across the deck footprint',
    },
    {
      label: 'Calculate volume of one cylindrical footing',
      formula: 'Volume (ft³) = π × (Diameter ÷ 2 ÷ 12)² × (Depth ÷ 12)',
      description: 'Diameter and depth are converted from inches to feet before applying the cylinder formula',
    },
    {
      label: 'Calculate total concrete',
      formula: 'Total (yd³) = (Volume per hole × Footings) ÷ 27',
    },
    {
      label: 'Calculate bags',
      formula: 'Bags = ⌈Total (ft³) ÷ 0.60⌉',
      description: 'One 80 lb bag of concrete mix yields 0.60 cubic feet — always round up',
    },
  ],
  faq: [
    {
      question: 'How many deck footings do I need?',
      answer:
        'The number of footings depends on your deck dimensions and post spacing. The formula is: footings = (ceil(length ÷ spacing) + 1) × (ceil(width ÷ spacing) + 1). A 12 × 16 ft deck with 8 ft spacing needs (ceil(16/8)+1) × (ceil(12/8)+1) = 3 × 2 = 6 footings. Use the calculator above for your exact dimensions.',
    },
    {
      question: 'How deep should deck footings be?',
      answer:
        'Deck footings must extend below the local frost line to prevent heaving. Frost depths range from 12 inches in the Deep South to 48+ inches in northern states and Canada. Check your local building code — most jurisdictions specify a minimum footing depth. A general rule is 36–42 inches for most of the continental US.',
    },
    {
      question: 'What size deck footings do I need?',
      answer:
        'Footing diameter depends on deck load and soil bearing capacity. For most residential decks (under 200 sq ft, one story), 10–12 inch diameter footings are standard. Larger decks, elevated decks, or poor soils may require 14–16 inch footings. Always check your local building code and consider a soil bearing test for large projects.',
    },
    {
      question: 'What is the standard deck footing spacing?',
      answer:
        'Standard footing spacing is 6–8 feet (1.8–2.4 m) for wood framed decks. The exact spacing depends on your beam size, joist span, and local load requirements. Larger beams and joists allow wider spacing. Never exceed the maximum span allowed for your lumber species and size as listed in the IRC span tables.',
    },
    {
      question: 'How do I calculate deck footing depth for my frost line?',
      answer:
        'Find your local frost depth using the USDA frost depth map or by contacting your local building department. Add 6 inches below the frost line for the footing itself, and add any above-grade height needed for your post anchor. For example, if your frost depth is 36 inches, your footing hole should be at least 42 inches deep.',
    },
    {
      question: 'How much concrete do I need per deck footing?',
      answer:
        'A 12-inch diameter hole at 42 inches deep holds about 3.3 cubic feet of concrete, which is roughly 6 bags of 80 lb Quikrete (each bag yields 0.60 cu ft). Use the calculator above to get the exact bag count for your footing diameter and depth. For large jobs, ordering ready-mix is more economical than bags.',
    },
    {
      question: 'Can I use tube forms (Sonotubes) for deck footings?',
      answer:
        'Yes — tube forms (cardboard concrete forms) are the standard method for cylindrical deck footings. They hold the concrete in a perfect cylinder, keep the sides of the hole from collapsing, and make it easy to set the top of the footing at the correct elevation. Common sizes are 8, 10, 12, and 16 inches in diameter.',
    },
    {
      question: 'Do deck footings need rebar?',
      answer:
        'Rebar is required in many jurisdictions for deck footings deeper than 24 inches or in seismic zones. A single #4 rebar (1/2 inch diameter) centered vertically in the footing is standard. Some codes also require horizontal rebar rings at the top and bottom. Check your local building code before pouring — inspections are typically required before the concrete is poured.',
    },
  ],
};
