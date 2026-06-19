import type {
  CalculatorConfig,
  CalculatorInputMap,
  CalculatorOutputMap,
  UnitSystem,
} from './_types';
import { rectVolumeImperial, rectVolumeMetric } from './volume-engine';

const FT3_PER_60LB_BAG = 0.45;
const FT3_PER_80LB_BAG = 0.60;

function formula(inputs: CalculatorInputMap, unitSystem: UnitSystem): CalculatorOutputMap {
  const vol = unitSystem === 'imperial'
    ? rectVolumeImperial(inputs, 'thickness')
    : rectVolumeMetric(inputs, 'thickness_mm');
  const ft3 = vol.cubic_feet;
  return {
    ...vol,
    bags_60lb: Math.ceil(ft3 / FT3_PER_60LB_BAG),
    bags_80lb: Math.ceil(ft3 / FT3_PER_80LB_BAG),
  };
}

export const concreteSlab: CalculatorConfig = {
  slug: 'concrete-slab-calculator',
  name: 'Concrete Slab Calculator',
  category: 'concrete',
  description:
    'Calculate exactly how much concrete you need for any slab. Enter length, width, and thickness to get cubic yards, cubic feet, and cubic meters instantly.',
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
      id: 'thickness',
      label: 'Thickness',
      type: 'number',
      unit: 'in',
      min: 1,
      max: 72,
      step: 0.5,
      defaultValue: 4,
      required: true,
      onlyIn: 'imperial',
      helpText: 'Standard residential slabs are 4 in thick',
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
      id: 'thickness_mm',
      label: 'Thickness',
      type: 'number',
      unit: 'mm',
      min: 25,
      max: 1800,
      step: 1,
      defaultValue: 100,
      defaultValueMetric: 100,
      required: true,
      onlyIn: 'metric',
      helpText: 'Standard residential slabs are 100 mm thick',
    },
  ],
  outputs: [
    {
      id: 'cubic_yards',
      label: 'Concrete Required',
      unit: 'yd³',
      format: 'volume',
      primary: true,
      description: 'Standard US ready-mix order unit',
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
      description: 'Standard metric concrete order unit',
    },
    {
      id: 'bags_60lb',
      label: '60 lb Bags',
      unit: 'bags',
      format: 'number',
      isEquivalent: true,
    },
    {
      id: 'bags_80lb',
      label: '80 lb Bags',
      unit: 'bags',
      format: 'number',
      isEquivalent: true,
    },
  ],
  formula,
  unitSystems: ['imperial', 'metric'],
  relatedCalculators: [],
  orderCallout: true,
  wasteFactor: {
    default: 10,
    range: '5–15%',
    notes: 'Simple rectangular slabs: 5–10% is adequate. Add 15% for complex shapes or uneven subgrade.',
  },
  costRange: {
    low: 100,
    high: 175,
    unit: 'per cubic yard (ready-mix)',
  },
  references: [
    {
      title: 'ACI 318 – Building Code Requirements for Structural Concrete',
      organization: 'American Concrete Institute',
      url: 'https://www.concrete.org/',
    },
    {
      title: 'Design and Control of Concrete Mixtures',
      organization: 'Portland Cement Association (PCA)',
      url: 'https://www.cement.org/',
    },
    {
      title: 'IRC R506 – Concrete Floors on Ground',
      organization: 'International Residential Code',
      url: 'https://codes.iccsafe.org/',
    },
  ],
  seo: {
    title: 'Concrete Slab Calculator',
    description:
      'Free concrete slab calculator — enter length, width, and thickness to instantly get cubic yards, cubic feet, and cubic meters for your project.',
    h1: 'Concrete Slab Calculator',
    focusKeyword: 'concrete slab calculator',
  },
  schema: {
    appType: 'Construction Calculator',
    features: [
      'Calculate concrete volume in cubic yards',
      'Calculate concrete volume in cubic feet',
      'Calculate concrete volume in cubic meters',
      'Feet and inches input support',
      'Metric (meters and millimeters) support',
    ],
  },
  formulaSteps: [
    {
      label: 'Convert thickness to feet',
      formula: 'Thickness (ft) = Thickness (in) ÷ 12',
      description:
        'Thickness is entered in inches but all three dimensions must share the same unit before multiplying',
    },
    {
      label: 'Calculate volume in cubic feet',
      formula: 'Volume (ft³) = Length (ft) × Width (ft) × Thickness (ft)',
    },
    {
      label: 'Convert to cubic yards',
      formula: 'Volume (yd³) = Volume (ft³) ÷ 27',
      description: 'There are 27 cubic feet in one cubic yard — the standard US ready-mix order unit',
    },
    {
      label: 'Convert to cubic meters (optional)',
      formula: 'Volume (m³) = Volume (ft³) × 0.0283168',
    },
  ],
  faq: [
    {
      question: 'How thick should a concrete slab be?',
      answer:
        'For most residential applications, 4 inches (100 mm) is standard. Driveways typically need 4–6 inches, garage floors 4–6 inches, and structural slabs can be 6–8 inches or more depending on load requirements.',
    },
    {
      question: 'How many bags of concrete do I need for my slab?',
      answer:
        'An 80 lb bag of concrete mix yields about 0.60 cubic feet. Divide your total cubic feet by 0.60 to get the bag count. For larger pours, ordering ready-mix concrete by the cubic yard is more economical than bags.',
    },
    {
      question: 'What is a cubic yard of concrete?',
      answer:
        'A cubic yard is 3 ft × 3 ft × 3 ft = 27 cubic feet. Ready-mix concrete in the US is ordered and priced by the cubic yard. One cubic yard weighs approximately 4,000 lbs (1,814 kg).',
    },
    {
      question: 'Should I order extra concrete?',
      answer:
        "Yes — most contractors recommend ordering 5–10% extra to account for spillage, uneven subgrade, and formwork variation. Running short mid-pour is far more costly than a little left over.",
    },
    {
      question: 'Do I need rebar or wire mesh?',
      answer:
        "Rebar or welded wire mesh is strongly recommended for slabs larger than 10 × 10 ft, driveways, and any slab subject to heavy loads. Reinforcement doesn't change concrete volume but significantly improves crack resistance.",
    },
    {
      question: 'How do I calculate concrete for an irregular shape?',
      answer:
        'Break the area into rectangles, run this calculator for each section, and add the volumes. For example, an L-shaped slab can be split into two rectangles.',
    },
  ],
};
