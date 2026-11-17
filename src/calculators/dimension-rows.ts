import type { InputField } from './_types';

export function listFields(name: string, imperial: string, metric: string, columns: number): InputField[] {
  return (['imperial','metric'] as const).map(unit => ({
    id: name + (unit === 'imperial' ? '_ft' : '_m'),
    label: unit === 'imperial' ? imperial : metric,
    onlyIn: unit, type: 'dimensions', defaultValue: '', columns,
    helpText: 'Separate dimensions with x and entries with commas. Use positive decimal dimensions.',
  }));
}

export function dimensionRows(value: unknown): number[][] {
  if (value === '' || value == null) return [];
  return String(value).split(',').map(row => row.trim().split(/[xX]/).map(cell => {
    const token = cell.trim();
    return /^\d+(?:\.\d+)?$/.test(token) ? Number(token) : NaN;
  }));
}
