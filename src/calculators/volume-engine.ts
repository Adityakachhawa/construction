import { extraArea } from './project-sections';
import { ceilQuantity } from './rounding';
import type { CalculatorInputMap } from './_types';

// Conversion constants
const FT3_TO_YD3 = 1 / 27;
const FT3_TO_M3  = 0.3048 ** 3;
const M3_TO_FT3  = 1 / FT3_TO_M3;
const M3_TO_YD3  = M3_TO_FT3 / 27;

export interface RectVolume {
  cubic_yards:  number;
  cubic_feet:   number;
  cubic_meters: number;
}

/** Rectangular volume from imperial inputs (ft + optional in pairs, third dim in inches). */
export function rectVolumeImperial(inputs: CalculatorInputMap, thirdId: string): RectVolume {
  const length = Number(inputs.length_ft ?? 0) + Number(inputs.length_in ?? 0) / 12;
  const width  = Number(inputs.width_ft  ?? 0) + Number(inputs.width_in  ?? 0) / 12;
  const thirdFt = Number(inputs[thirdId] ?? 0) / 12;

  const ft3 = (length * width + extraArea(inputs.sections_ft)) * thirdFt;
  const yd3 = ft3 * FT3_TO_YD3;
  const m3  = ft3 * FT3_TO_M3;

  return {
    cubic_yards:  yd3,
    cubic_feet:   ft3,
    cubic_meters: m3 ,
  };
}

/** Rectangular volume from metric inputs (meters + third dim in millimeters). */
export function rectVolumeMetric(inputs: CalculatorInputMap, thirdId: string): RectVolume {
  const length = Number(inputs.length_m ?? 0);
  const width  = Number(inputs.width_m  ?? 0);
  const thirdM = Number(inputs[thirdId] ?? 0) / 1000;

  const m3  = (length * width + extraArea(inputs.sections_m)) * thirdM;
  const ft3 = m3 * M3_TO_FT3;
  const yd3 = m3 * M3_TO_YD3;

  return {
    cubic_meters: m3 ,
    cubic_feet:   ft3,
    cubic_yards:  yd3,
  };
}

export const tonsFromYards  = (yd3: number, density: number) => yd3 * density;
export const tonsFromMeters = (m3:  number, density: number) => m3  * density;
export const bagsFromFeet   = (ft3: number, bagSize: number) => ceilQuantity(ft3 / bagSize);

/** Rectangular volume from raw feet dimensions. */
export function rectVolFt3(lengthFt: number, widthFt: number, depthFt: number): RectVolume {
  const ft3 = lengthFt * widthFt * depthFt;
  return {
    cubic_feet:   ft3,
    cubic_yards:  ft3 * FT3_TO_YD3,
    cubic_meters: ft3 * FT3_TO_M3 ,
  };
}

/** Rectangular volume from raw meter dimensions. */
export function rectVolM3(lengthM: number, widthM: number, depthM: number): RectVolume {
  const m3 = lengthM * widthM * depthM;
  return {
    cubic_meters: m3,
    cubic_feet:   m3 * M3_TO_FT3,
    cubic_yards:  m3 * M3_TO_YD3,
  };
}

/** Volume of a single cylinder from imperial inputs (diameter in inches, depth in inches). */
export function cylVolumeImperial(diameterIn: number, depthIn: number): RectVolume {
  const radiusFt = (diameterIn / 2) / 12;
  const depthFt  = depthIn / 12;
  const ft3 = Math.PI * radiusFt * radiusFt * depthFt;
  const yd3 = ft3 * FT3_TO_YD3;
  const m3  = ft3 * FT3_TO_M3;
  return {
    cubic_yards:  yd3,
    cubic_feet:   ft3,
    cubic_meters: m3 ,
  };
}

/** Volume of a single cylinder from metric inputs (diameter in mm, depth in mm). */
export function cylVolumeMetric(diameterMm: number, depthMm: number): RectVolume {
  const radiusM = (diameterMm / 2) / 1000;
  const depthM  = depthMm / 1000;
  const m3  = Math.PI * radiusM * radiusM * depthM;
  const ft3 = m3 * M3_TO_FT3;
  const yd3 = m3 * M3_TO_YD3;
  return {
    cubic_meters: m3 ,
    cubic_feet:   ft3,
    cubic_yards:  yd3,
  };
}
