import type {
  CalculatorConfig,
  CalculatorInputMap,
  CalculatorOutputMap,
  UnitSystem,
} from './_types';
import { rectVolumeImperial, rectVolumeMetric, bagsFromFeet } from './volume-engine';

const BAG_CUBIC_FEET = 2;

function formula(inputs: CalculatorInputMap, unitSystem: UnitSystem): CalculatorOutputMap {
  if (unitSystem === 'imperial') {
    const vol = rectVolumeImperial(inputs, 'depth');
    return { ...vol, bags: bagsFromFeet(vol.cubic_feet, BAG_CUBIC_FEET) };
  } else {
    const vol = rectVolumeMetric(inputs, 'depth_mm');
    return { ...vol, bags: bagsFromFeet(vol.cubic_feet, BAG_CUBIC_FEET) };
  }
}

export const mulchCalculator: CalculatorConfig = {
  slug: 'mulch-calculator',
  name: 'Mulch Calculator',
  category: 'excavation',
  description:
    'Calculate how much mulch you need for garden beds and landscaping. Get cubic yards, cubic feet, cubic meters, and bags of mulch for any area.',
  inputs: [
    // ── Imperial ──────────────────────────────────────
    {
      id: 'length_ft',
      label: 'Length',
      type: 'number',
      unit: 'ft',
      min: 0,
      max: 10000,
      step: 1,
      defaultValue: 10,
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
      min: 0,
      max: 10000,
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
      id: 'depth',
      label: 'Depth',
      type: 'number',
      unit: 'in',
      min: 1,
      max: 12,
      step: 0.5,
      defaultValue: 3,
      required: true,
      onlyIn: 'imperial',
      helpText: 'New beds: 3–4 in. Refresh: 1–2 in. Weed suppression: 4 in.',
    },
    // ── Metric ────────────────────────────────────────
    {
      id: 'length_m',
      label: 'Length',
      type: 'number',
      unit: 'm',
      min: 0,
      max: 3000,
      step: 0.01,
      defaultValue: 3,
      defaultValueMetric: 3,
      required: true,
      onlyIn: 'metric',
    },
    {
      id: 'width_m',
      label: 'Width',
      type: 'number',
      unit: 'm',
      min: 0,
      max: 3000,
      step: 0.01,
      defaultValue: 3,
      defaultValueMetric: 3,
      required: true,
      onlyIn: 'metric',
    },
    {
      id: 'depth_mm',
      label: 'Depth',
      type: 'number',
      unit: 'mm',
      min: 25,
      max: 300,
      step: 5,
      defaultValue: 75,
      defaultValueMetric: 75,
      required: true,
      onlyIn: 'metric',
      helpText: 'New beds: 75–100 mm. Refresh: 25–50 mm.',
    },
  ],
  outputs: [
    {
      id: 'cubic_yards',
      label: 'Cubic Yards',
      unit: 'yd³',
      format: 'volume',
      primary: true,
      description: 'Standard bulk mulch order unit',
    },
    {
      id: 'bags',
      label: 'Bags Required',
      unit: 'bags',
      format: 'number',
      description: 'Standard 2 cu ft bags (rounds up to whole bags)',
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
      description: 'Standard metric order unit',
    },
  ],
  formula,
  unitSystems: ['imperial', 'metric'],
  relatedCalculators: ['gravel-calculator', 'sand-calculator', 'concrete-slab-calculator'],
  seo: {
    title: 'Mulch Calculator — Cubic Yards & Bags',
    description:
      'Free mulch calculator — enter length, width, and depth to instantly calculate cubic yards, cubic feet, cubic meters, and bags of mulch needed for garden beds and landscaping.',
    h1: 'Mulch Calculator',
    focusKeyword: 'mulch calculator',
  },
  schema: {
    appType: 'Landscaping Calculator',
    features: [
      'Calculate mulch in cubic yards',
      'Calculate number of mulch bags needed',
      'Calculate mulch in cubic feet and cubic meters',
      'Feet and inches input support',
      'Metric (meters and millimeters) support',
      'Mulch depth guide for garden beds',
    ],
  },
  formulaSteps: [
    {
      label: 'Convert depth to feet',
      formula: 'Depth (ft) = Depth (in) ÷ 12',
      description: 'All dimensions must share the same unit before multiplying',
    },
    {
      label: 'Calculate volume in cubic feet',
      formula: 'Volume (ft³) = Length (ft) × Width (ft) × Depth (ft)',
    },
    {
      label: 'Convert to cubic yards',
      formula: 'Volume (yd³) = Volume (ft³) ÷ 27',
      description: 'There are 27 cubic feet in one cubic yard — the standard bulk mulch order unit',
    },
    {
      label: 'Calculate bags required',
      formula: 'Bags = ⌈Volume (ft³) ÷ 2⌉',
      description: 'Standard mulch bags hold 2 cubic feet — always round up to whole bags',
    },
  ],
  faq: [
    {
      question: 'How much mulch do I need for my garden beds?',
      answer:
        'For new garden beds, apply 3–4 inches of mulch. For refreshing existing beds, 1–2 inches is typically enough. A 100 sq ft bed at 3-inch depth requires approximately 0.93 cubic yards or 14 bags of mulch. Enter your exact dimensions above for a precise calculation.',
    },
    {
      question: 'How many bags of mulch are in a cubic yard?',
      answer:
        'One cubic yard equals 27 cubic feet. Since standard mulch bags hold 2 cubic feet, you need 13.5 bags per cubic yard — so plan on 14 bags per cubic yard. Buying in bulk (by the cubic yard) is almost always cheaper than bags for areas larger than 50 square feet.',
    },
    {
      question: 'What depth of mulch should I apply?',
      answer:
        'Recommended depths: 2–3 inches for established beds and maintenance, 3–4 inches for new beds and weed suppression, 4–6 inches around trees and shrubs. Avoid "mulch volcanoes" — never pile mulch against tree trunks, as this causes rot and pest problems.',
    },
    {
      question: 'Should I buy mulch in bags or in bulk?',
      answer:
        'Buy in bulk (cubic yards) when you need more than 2–3 cubic yards — it costs 30–50% less than bags and is delivered loose. Choose bagged mulch for small areas, tight access, or precision work. Budget roughly $25–$50/yd³ for bulk and $3–$8 per bag at retail.',
    },
    {
      question: 'What type of mulch is best for landscaping?',
      answer:
        'Shredded hardwood bark is the most popular all-purpose mulch — it decomposes slowly, resists blowing, and looks clean. Cedar mulch repels insects. Pine straw is excellent for acid-loving plants. Black or dyed mulch provides strong visual contrast but can fade. Rubber mulch lasts longest but does not improve soil.',
    },
    {
      question: 'Does mulch need to be replaced every year?',
      answer:
        'Organic mulches (wood, bark, straw) decompose and need refreshing every 1–2 years. Check the depth in spring — if it is less than 2 inches, top it off. Do not remove old mulch before adding new; it has become beneficial organic matter. Inorganic mulches (gravel, rubber) rarely need replacement.',
    },
    {
      question: 'How does mulch depth affect weed control?',
      answer:
        'A 3-inch mulch layer blocks 90% of annual weeds by preventing seed germination. Going to 4 inches provides even better suppression. Below 2 inches, weeds push through easily. For maximum weed suppression, lay landscape fabric first and add 3–4 inches of mulch on top.',
    },
    {
      question: 'How do I calculate mulch for a circular bed?',
      answer:
        'For a circular bed, calculate the area first: Area = π × radius². Then multiply by your desired depth. For example, a 10-foot diameter circle (5-foot radius) has an area of 78.5 sq ft. At 3 inches deep, that is 19.6 cubic feet, or 0.73 cubic yards (about 10 bags).',
    },
  ],
};
