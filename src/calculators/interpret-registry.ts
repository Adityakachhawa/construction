import { ceilQuantity } from './rounding';
import type { CalculatorOutputMap, CalculatorInputMap, UnitSystem } from './_types';

export type InterpretFn = (
  outputs: CalculatorOutputMap,
  inputs: CalculatorInputMap,
  unitSystem: UnitSystem
) => string[];

function fmt(n: number, decimals = 2): string {
  if (!Number.isFinite(n) || n < 0) return '0';
  return n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: decimals });
}

const STANDARD_LUMBER_LENGTHS = [8, 10, 12, 14, 16, 18, 20, 22, 24];

function nextLumberLength(ft: number): number {
  return STANDARD_LUMBER_LENGTHS.find((l) => l >= ft) ?? ceilQuantity(ft / 2) * 2;
}

export const interpretRegistry: Record<string, InterpretFn> = {
  'concrete-slab-calculator': (outputs, _inputs, _unit) => {
    const yd3 = outputs.cubic_yards ?? 0;
    const ft3 = outputs.cubic_feet ?? 0;
    const bags80 = ceilQuantity(ft3 / 0.60);
    const lines: string[] = [];
    lines.push(
      `You'll need approximately ${fmt(yd3)} cubic yard${yd3 !== 1 ? 's' : ''} of concrete for this slab.`
    );
    if (yd3 < 1) {
      lines.push(
        'This is a small pour — bagged concrete mix is likely more economical than ordering ready-mix.'
      );
    } else if (yd3 < 3) {
      lines.push(
        `A pour this size may incur a short-load fee from ready-mix suppliers (typically $50–$150 for loads under 3 yd³). Bagged concrete or a mixer rental is worth comparing.`
      );
    } else if (yd3 >= 7) {
      lines.push(
        'This pour qualifies for a full ready-mix truck load (typically 8–10 yd³), giving you the best per-yard pricing.'
      );
    }
    if (bags80 > 0) {
      lines.push(`That's equivalent to approximately ${fmt(bags80, 0)} bags of 80 lb concrete mix.`);
    }
    return lines;
  },

  'concrete-footing-calculator': (outputs, _inputs, _unit) => {
    const yd3 = outputs.cubic_yards ?? 0;
    const ft3 = outputs.cubic_feet ?? 0;
    const bags80 = ceilQuantity(ft3 / 0.60);
    return [
      `This footing requires approximately ${fmt(yd3)} cubic yard${yd3 !== 1 ? 's' : ''} of concrete.`,
      bags80 > 0
        ? `Equivalent to approximately ${fmt(bags80, 0)} bags of 80 lb mix.`
        : '',
      'Footings must bear on undisturbed soil and be poured at or below your local frost depth. Verify depth requirements before setting forms.',
    ].filter(Boolean);
  },

  'concrete-driveway-calculator': (outputs, _inputs, _unit) => {
    const yd3 = outputs.cubic_yards ?? 0;
    const lines: string[] = [
      `Your driveway requires approximately ${fmt(yd3)} cubic yard${yd3 !== 1 ? 's' : ''} of concrete.`,
    ];
    if (yd3 >= 3) {
      lines.push(
        'Ready-mix delivery is the most practical option for this pour size. Have your forms, rebar, and screed boards ready before the truck arrives — most drivers allow only 5–7 minutes per yard for discharge.'
      );
    }
    lines.push(
      'A 4,000 PSI mix with fiber reinforcement at 4–6" thickness is the standard recommendation for residential driveways.'
    );
    return lines;
  },

  'concrete-bags-calculator': (outputs) => [
    `Order ${fmt(outputs.bags_required ?? 0, 0)} bags at the selected yield; this includes the entered waste allowance.`,
  ],

  'rafter-calculator': (outputs, _inputs, _unit) => {
    const totalFt = outputs.total_rafter_ft ?? 0;
    const angleDeg = outputs.angle_deg ?? 0;
    const pitchRatio = outputs.pitch_ratio ?? 0;
    if (totalFt <= 0) return [];
    const nextLen = nextLumberLength(totalFt);
    return [
      `Order ${nextLen}-foot lumber — the next standard length above your ${fmt(totalFt)} ft total rafter.`,
      `At a ${fmt(pitchRatio, 2)}:12 pitch, the roof rises ${fmt(angleDeg, 1)}° above horizontal. Use your project details for cut references.`,
    ];
  },

  'stud-calculator': (outputs, _inputs, _unit) => {
    const total = outputs.total_studs ?? 0;
    const field = outputs.field_studs ?? 0;
    const corner = outputs.corner_studs ?? 0;
    const opening = outputs.opening_framing ?? 0;
    if (total <= 0) return [];
    return [
      `Framing breakdown: ${fmt(field, 0)} field studs, ${fmt(corner, 0)} extra end/corner pieces, and ${fmt(opening, 0)} opening pieces.`,
      'Group short cuts by stock length before ordering boards.',
    ];
  },

  'roofing-calculator': (outputs, _inputs, _unit) => {
    const squares = outputs.squares ?? 0;
    const bundles = outputs.bundles ?? 0;
    if (squares <= 0) return [];
    return [
      `Your roof requires approximately ${fmt(squares)} roofing squares (${fmt(squares * 100, 0)} sq ft including waste).`,
      bundles > 0
        ? `That's approximately ${fmt(bundles, 0)} bundles of standard architectural shingles (3 bundles per square).`
        : '',
      'Simple gable roofs: add 10% waste. Hip or complex roofs: add 15–20%.',
    ].filter(Boolean);
  },

  'metal-roofing-calculator': (outputs, _inputs, _unit) => {
    const panels = outputs.panels ?? 0;
    const sqft = outputs.roof_area_sqft ?? outputs.area_sqft ?? 0;
    if (sqft <= 0 && panels <= 0) return [];
    const lines: string[] = [];
    if (sqft > 0) lines.push(`Your metal roof covers approximately ${fmt(sqft, 0)} sq ft.`);
    if (panels > 0) lines.push(`You'll need approximately ${fmt(panels, 0)} panels. Add 10% for cuts at ridges and hips.`);
    return lines;
  },

  'drywall-calculator': (outputs, _inputs, _unit) => {
    const sheets = outputs.sheets_with_waste ?? 0;
    if (sheets <= 0) return [];
    return [
      `You need approximately ${fmt(ceilQuantity(sheets), 0)} drywall sheets for this project.`,
      'A standard 4×8 sheet weighs about 57 lbs (5/8") — plan for at least two people for lifting and hanging.',
    ];
  },

  'lumber-calculator': (outputs, _inputs, _unit) => {
    const bf = outputs.board_feet ?? 0;
    if (bf <= 0) return [];
    return [
      `This project requires approximately ${fmt(bf)} board feet of lumber.`,
      'The selected waste allowance is already included in the board count.',
    ];
  },

  'plywood-calculator': (outputs, _inputs, _unit) => {
    const sheets = outputs.sheets_waste ?? 0;
    if (sheets <= 0) return [];
    return [
      `You need approximately ${fmt(ceilQuantity(sheets), 0)} sheets of plywood.`,
      'A standard 4×8 sheet covers 32 sq ft. The selected waste allowance is already included.',
    ];
  },

  'gravel-calculator': (outputs, _inputs, _unit) => {
    const tons = outputs.tons ?? 0;
    const yd3 = outputs.cubic_yards ?? 0;
    if (tons <= 0) return [];
    const lines = [
      `This project requires approximately ${fmt(tons)} tons of gravel (${fmt(yd3)} cubic yards).`,
    ];
    if (tons < 5) {
      lines.push('Small loads can be purchased in bulk bags from home improvement stores or via a mini-dump delivery.');
    } else {
      lines.push(`A standard dump truck carries 10–14 tons. You'll need approximately ${ceilQuantity(tons / 12)} truck load${ceilQuantity(tons / 12) !== 1 ? 's' : ''}.`);
    }
    return lines;
  },

  'excavation-calculator': (outputs, _inputs, _unit) => {
    const yd3 = outputs.cubic_yards ?? 0;
    const tons = outputs.tons ?? 0;
    if (yd3 <= 0) return [];
    return [
      `This excavation removes approximately ${fmt(yd3)} cubic yards of soil.`,
      tons > 0
        ? `That weighs approximately ${fmt(tons)} tons — factor this into your hauling and disposal plan.`
        : '',
      'Excavated soil expands 10–30% when loaded (swell factor). Plan for proportionally more truck trips than the bank-measure volume suggests.',
    ].filter(Boolean);
  },

  'insulation-calculator': (outputs, _inputs, _unit) => {
    const sqft = outputs.area_sqft ?? outputs.coverage_sqft ?? 0;
    const bags = outputs.rolls_required ?? 0;
    if (sqft <= 0 && bags <= 0) return [];
    const lines: string[] = [];
    if (sqft > 0) lines.push(`This project covers approximately ${fmt(sqft, 0)} sq ft of insulation.`);
    if (bags > 0) lines.push(`You'll need approximately ${fmt(ceilQuantity(bags), 0)} packages for this coverage area.`);
    return lines;
  },

  'mortar-calculator': (outputs, _inputs, _unit) => {
    const bags = outputs.bags_required ?? 0;
    const ft3 = outputs.mortar_cuft ?? 0;
    if (bags <= 0 && ft3 <= 0) return [];
    const lines: string[] = [];
    if (bags > 0) lines.push(`Illustrative estimate: ${fmt(ceilQuantity(bags), 0)} bags under the entered factor and yield; verify product coverage before ordering.`);
    lines.push('Follow the selected product instructions for mixing and working time.');
    return lines;
  },

  'flooring-calculator': (outputs, _inputs, _unit) => {
    const sqft = outputs.area_sqft ?? outputs.material_sqft ?? 0;
    const boxes = outputs.boxes ?? 0;
    if (sqft <= 0) return [];
    const lines: string[] = [
      `Your floor requires approximately ${fmt(sqft, 0)} sq ft of flooring material.`,
    ];
    if (boxes > 0) lines.push(`That's approximately ${fmt(ceilQuantity(boxes), 0)} boxes based on the coverage per box.`);
    lines.push('Diagonal or herringbone installations require 15% waste instead of 10%.');
    return lines;
  },

  'board-foot-calculator': (outputs, _inputs, _unit) => {
    const bf = outputs.board_feet ?? 0;
    if (bf <= 0) return [];
    return [
      `This board measures ${fmt(bf)} board feet.`,
      'Board feet (BF) is the standard lumber volume unit: 1 BF = 1 ft × 1 ft × 1 in thick.',
    ];
  },

  'asphalt-calculator': (outputs, _inputs, _unit) => {
    const tons = outputs.tons ?? 0;
    if (tons <= 0) return [];
    return [
      `This paving project requires approximately ${fmt(tons)} tons of asphalt.`,
      tons > 10
        ? `A standard paving truck carries 20–25 tons. Plan for ${ceilQuantity(tons / 22)} truck load${ceilQuantity(tons / 22) !== 1 ? 's' : ''}.`
        : 'Small areas can be patched with bag asphalt mix available at home improvement stores.',
    ];
  },
};
