import type { CalculatorInputMap, UnitSystem } from './_types';
import { ceilQuantity } from './rounding';

export function fenceRuns(inputs: CalculatorInputMap, unit: UnitSystem, length: number, spacing: number) {
  const key = unit === 'imperial' ? 'gate_layout_ft' : 'gate_layout_m';
  const text = String(inputs[key] || '');
  if (!text) return [];
  const runs: { start: number; end: number; sections: number }[] = [];
  let start = 0;
  for (const pair of text.split(',')) {
    const [position, width] = pair.trim().split(/[xX]/).map(Number);
    runs.push({ start, end: position, sections: ceilQuantity((position - start) / spacing) });
    start = position + width;
  }
  runs.push({ start, end: length, sections: ceilQuantity((length - start) / spacing) });
  return runs;
}
