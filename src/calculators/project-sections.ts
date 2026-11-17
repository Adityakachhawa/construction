import type { InputField } from './_types';

export const sectionFields: InputField[] = [
  { id: 'sections_ft', label: 'Additional rectangles / openings (ft)', onlyIn: 'imperial', type: 'rectangles', defaultValue: '', helpText: 'Enter length x width in decimal feet, separated by commas. Example: 4x5, -2x3 adds 20 ft² and deducts 6 ft². Use non-overlapping sections at the same depth.' },
  { id: 'sections_m', label: 'Additional rectangles / openings (m)', onlyIn: 'metric', type: 'rectangles', defaultValue: '', helpText: 'Enter length x width in metres, separated by commas. Example: 4x5, -2x3 adds 20 m² and deducts 6 m². Use non-overlapping sections at the same depth.' },
];

export function rectangleAreas(value: unknown): number[] {
  if (value === undefined || value === null || value === '') return [];
  return String(value).split(',').map(part => {
    const match = /^\s*([+-]?)\s*(\d+(?:\.\d+)?)\s*[xX]\s*(\d+(?:\.\d+)?)\s*$/.exec(part);
    if (!match) return NaN;
    const area = Number(match[2]) * Number(match[3]);
    return area > 0 && area <= 1e10 ? (match[1] === '-' ? -area : area) : NaN;
  });
}

export function extraArea(value: unknown): number {
  return rectangleAreas(value).reduce((sum, area) => sum + area, 0);
}
