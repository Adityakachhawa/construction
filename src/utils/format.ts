import type { UnitSystem } from '../calculators/_types';

export function formatNumber(
  value: number,
  decimals = 2,
  locale = 'en-US'
): string {
  if (!isFinite(value) || isNaN(value)) return '—';
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  }).format(value);
}

export function formatCurrency(
  value: number,
  currency = 'USD',
  locale = 'en-US'
): string {
  if (!isFinite(value) || isNaN(value)) return '—';
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatWithUnit(
  value: number,
  unit: string,
  decimals = 2
): string {
  return `${formatNumber(value, decimals)} ${unit}`;
}

// Unit conversion constants
const CONVERSIONS = {
  // Length
  ftToM: 0.3048,
  mToFt: 1 / 0.3048,
  inToCm: 2.54,
  cmToIn: 1 / 2.54,
  // Area
  sqFtToSqM: 0.3048 ** 2,
  sqMToSqFt: 1 / (0.3048 ** 2),
  // Volume
  cubicFtToCubicM: 0.3048 ** 3,
  cubicMToCubicFt: 1 / (0.3048 ** 3),
  cubicYdToCubicM: 0.9144 ** 3,
  cubicMToCubicYd: 1 / (0.9144 ** 3),
  // Weight
  lbsToKg: 0.45359237,
  kgToLbs: 1 / 0.45359237,
} as const;

export function convertLength(
  value: number,
  from: UnitSystem,
  to: UnitSystem
): number {
  if (from === to) return value;
  return from === 'imperial'
    ? value * CONVERSIONS.ftToM
    : value * CONVERSIONS.mToFt;
}

export function convertArea(
  value: number,
  from: UnitSystem,
  to: UnitSystem
): number {
  if (from === to) return value;
  return from === 'imperial'
    ? value * CONVERSIONS.sqFtToSqM
    : value * CONVERSIONS.sqMToSqFt;
}

export function convertVolumeCubicFt(
  value: number,
  from: UnitSystem,
  to: UnitSystem
): number {
  if (from === to) return value;
  return from === 'imperial'
    ? value * CONVERSIONS.cubicFtToCubicM
    : value * CONVERSIONS.cubicMToCubicFt;
}

export function convertWeight(
  value: number,
  from: UnitSystem,
  to: UnitSystem
): number {
  if (from === to) return value;
  return from === 'imperial'
    ? value * CONVERSIONS.lbsToKg
    : value * CONVERSIONS.kgToLbs;
}

export function getLengthUnit(system: UnitSystem): string {
  return system === 'imperial' ? 'ft' : 'm';
}

export function getAreaUnit(system: UnitSystem): string {
  return system === 'imperial' ? 'sq ft' : 'm²';
}

export function getVolumeUnit(system: UnitSystem): string {
  return system === 'imperial' ? 'cu ft' : 'm³';
}

export function getWeightUnit(system: UnitSystem): string {
  return system === 'imperial' ? 'lbs' : 'kg';
}

export function roundTo(value: number, decimals: number): number {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}
