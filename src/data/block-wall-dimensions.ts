import { blockMortar } from '../calculators/block-mortar';
import type { CalculatorInputMap } from '../calculators/_types';
import { ceilQuantity } from '../calculators/rounding';
export interface BlockWallMetrics {
  heightFt: number;
  lengthFt: number;
  areaSqFt: number;
  coursesHigh: number;
  unitsPerCourse: number;
  netBlocks: number;
  totalBlocksWithWaste: number;
  mortarBags: number | null;
  groutCuFtSolid: number;
  groutCuYdsSolid: number;
  groutCuYdsReinforced32: number; // Grouting reinforced cores @ 32" o.c. (~40% cores)
  ladderWireLinFt: number;
  ladderWirePieces: number; // 10-ft wire strips
  verticalRebarBars32: number; // Vertical bars @ 32" o.c.
  verticalRebarLinFt: number;
}

export interface BlockTypeComparison {
  nominalSize: string;
  actualDimensions: string;
  weightLbs: number;
  netBlocks: number;
  totalBlocks: number;
  coursesHigh: number;
  unitsPerCourse: number;
  mortarBags: number | null;
  groutCuYds100Pct: number;
  rebarSpec: string;
  primaryUse: string;
}

export interface BlockWallDimension {
  slug: string;
  name: string;
  height: number;
  length: number;
  areaSqFt: number;
  useCase: string;
  category: 'retaining-landscape' | 'perimeter-fence' | 'garage-structural' | 'commercial-highbay';
  notes: string;
  adjacentSizes: { prev?: string; next?: string };
}

export function getBlockWallMetrics(heightFt: number, lengthFt: number, material: CalculatorInputMap = {}): BlockWallMetrics {
  const areaSqFt = heightFt * lengthFt;
  const coursesHigh = Math.round(heightFt * 1.5 * 10) / 10;
  const unitsPerCourse = Math.round(lengthFt * 0.75 * 10) / 10;
  const netBlocks = Math.round(areaSqFt * 1.125 * 10) / 10;
  const totalBlocksWithWaste = ceilQuantity(netBlocks * 1.05);
  const mortar = blockMortar(totalBlocksWithWaste, material);
  const mortarBags = mortar.mortar_ready ? mortar.mortar_bags : null;
  const groutCuFtSolid = Math.round(netBlocks * 0.28 * 100) / 100;
  const groutCuYdsSolid = Math.round((groutCuFtSolid / 27) * 100) / 100;
  const groutCuYdsReinforced32 = Math.round((groutCuYdsSolid * 0.40) * 100) / 100;
  const reinforcedJoints = Math.floor(coursesHigh / 2);
  const ladderWireLinFt = reinforcedJoints * lengthFt;
  const ladderWirePieces = ceilQuantity(ladderWireLinFt / 10);
  const verticalRebarBars32 = ceilQuantity((lengthFt * 12) / 32) + 1;
  const verticalRebarLinFt = verticalRebarBars32 * (heightFt + 2);

  return {
    heightFt,
    lengthFt,
    areaSqFt,
    coursesHigh,
    unitsPerCourse,
    netBlocks,
    totalBlocksWithWaste,
    mortarBags,
    groutCuFtSolid,
    groutCuYdsSolid,
    groutCuYdsReinforced32,
    ladderWireLinFt,
    ladderWirePieces,
    verticalRebarBars32,
    verticalRebarLinFt,
  };
}

export function getBlockSizeComparison(heightFt: number, lengthFt: number): BlockTypeComparison[] {
  const m = getBlockWallMetrics(heightFt, lengthFt);
  return [
    {
      nominalSize: '6×8×16 CMU',
      actualDimensions: '5⅝" × 7⅝" × 15⅝"',
      weightLbs: 28,
      netBlocks: Math.round(m.netBlocks),
      totalBlocks: m.totalBlocksWithWaste,
      coursesHigh: m.coursesHigh,
      unitsPerCourse: m.unitsPerCourse,
      mortarBags: null,
      groutCuYds100Pct: Math.round(((m.netBlocks * 0.19) / 27) * 100) / 100,
      rebarSpec: '#4 bar @ 48" o.c. (light vertical reinforcing)',
      primaryUse: 'Interior non-bearing partitions, privacy screens, and low landscape garden walls up to 4 ft.',
    },
    {
      nominalSize: '8×8×16 CMU (Standard)',
      actualDimensions: '7⅝" × 7⅝" × 15⅝"',
      weightLbs: 38,
      netBlocks: Math.round(m.netBlocks),
      totalBlocks: m.totalBlocksWithWaste,
      coursesHigh: m.coursesHigh,
      unitsPerCourse: m.unitsPerCourse,
      mortarBags: m.mortarBags,
      groutCuYds100Pct: m.groutCuYdsSolid,
      rebarSpec: '#4 or #5 bar @ 32" o.c. + 9-ga ladder wire @ 16" vert',
      primaryUse: 'Standard exterior walls, residential basements, garage walls, and retaining walls up to 6–8 ft.',
    },
    {
      nominalSize: '12×8×16 CMU',
      actualDimensions: '11⅝" × 7⅝" × 15⅝"',
      weightLbs: 55,
      netBlocks: Math.round(m.netBlocks),
      totalBlocks: m.totalBlocksWithWaste,
      coursesHigh: m.coursesHigh,
      unitsPerCourse: m.unitsPerCourse,
      mortarBags: null,
      groutCuYds100Pct: Math.round(((m.netBlocks * 0.44) / 27) * 100) / 100,
      rebarSpec: '#5 or #6 bar @ 24" or 32" o.c. (high lateral load)',
      primaryUse: 'Deep basement foundation stem walls, commercial retaining walls (>8 ft), and warehouse blast/shear walls.',
    },
  ];
}

export const blockWallDimensions: BlockWallDimension[] = [
  {
    slug: '4x10',
    name: '4×10',
    height: 4,
    length: 10,
    areaSqFt: 40,
    useCase: 'Garden / Raised Planting Bed / Low Retaining Wall',
    category: 'retaining-landscape',
    notes: 'This 4 ft high by 10 ft long wall has 40 sq ft of face area. Quantities use the stated nominal block module and waste allowance; they do not establish a safe wall design, fire rating or reinforcement schedule. Obtain footing, drainage, reinforcement, grout and movement-joint details from approved plans and applicable requirements. Enter matching product coverage for mortar.',
    adjacentSizes: { next: '4x20' },
  },
  {
    slug: '4x20',
    name: '4×20',
    height: 4,
    length: 20,
    areaSqFt: 80,
    useCase: 'Landscape / Courtyard Retaining Wall',
    category: 'retaining-landscape',
    notes: 'This 4 ft high by 20 ft long wall has 80 sq ft of face area. Quantities use the stated nominal block module and waste allowance; they do not establish a safe wall design, fire rating or reinforcement schedule. Obtain footing, drainage, reinforcement, grout and movement-joint details from approved plans and applicable requirements. Enter matching product coverage for mortar.',
    adjacentSizes: { prev: '4x10', next: '6x20' },
  },
  {
    slug: '6x20',
    name: '6×20',
    height: 6,
    length: 20,
    areaSqFt: 120,
    useCase: 'Privacy / Perimeter Screen Wall',
    category: 'perimeter-fence',
    notes: 'This 6 ft high by 20 ft long wall has 120 sq ft of face area. Quantities use the stated nominal block module and waste allowance; they do not establish a safe wall design, fire rating or reinforcement schedule. Obtain footing, drainage, reinforcement, grout and movement-joint details from approved plans and applicable requirements. Enter matching product coverage for mortar.',
    adjacentSizes: { prev: '4x20', next: '6x50' },
  },
  {
    slug: '6x50',
    name: '6×50',
    height: 6,
    length: 50,
    areaSqFt: 300,
    useCase: '50-Foot Property Line Block Wall',
    category: 'perimeter-fence',
    notes: 'This 6 ft high by 50 ft long wall has 300 sq ft of face area. Quantities use the stated nominal block module and waste allowance; they do not establish a safe wall design, fire rating or reinforcement schedule. Obtain footing, drainage, reinforcement, grout and movement-joint details from approved plans and applicable requirements. Enter matching product coverage for mortar.',
    adjacentSizes: { prev: '6x20', next: '6x100' },
  },
  {
    slug: '6x100',
    name: '6×100',
    height: 6,
    length: 100,
    areaSqFt: 600,
    useCase: '100-Foot Perimeter Block Fence',
    category: 'perimeter-fence',
    notes: 'This 6 ft high by 100 ft long wall has 600 sq ft of face area. Quantities use the stated nominal block module and waste allowance; they do not establish a safe wall design, fire rating or reinforcement schedule. Obtain footing, drainage, reinforcement, grout and movement-joint details from approved plans and applicable requirements. Enter matching product coverage for mortar.',
    adjacentSizes: { prev: '6x50', next: '8x10' },
  },
  {
    slug: '8x10',
    name: '8×10',
    height: 8,
    length: 10,
    areaSqFt: 80,
    useCase: 'Small Shed / Interior Partition Wall',
    category: 'garage-structural',
    notes: 'This 8 ft high by 10 ft long wall has 80 sq ft of face area. Quantities use the stated nominal block module and waste allowance; they do not establish a safe wall design, fire rating or reinforcement schedule. Obtain footing, drainage, reinforcement, grout and movement-joint details from approved plans and applicable requirements. Enter matching product coverage for mortar.',
    adjacentSizes: { prev: '6x100', next: '8x20' },
  },
  {
    slug: '8x20',
    name: '8×20',
    height: 8,
    length: 20,
    areaSqFt: 160,
    useCase: 'Single Garage / Workshop Wall',
    category: 'garage-structural',
    notes: 'This 8 ft high by 20 ft long wall has 160 sq ft of face area. Quantities use the stated nominal block module and waste allowance; they do not establish a safe wall design, fire rating or reinforcement schedule. Obtain footing, drainage, reinforcement, grout and movement-joint details from approved plans and applicable requirements. Enter matching product coverage for mortar.',
    adjacentSizes: { prev: '8x10', next: '8x24' },
  },
  {
    slug: '8x24',
    name: '8×24',
    height: 8,
    length: 24,
    areaSqFt: 192,
    useCase: 'Standard Garage Side Wall',
    category: 'garage-structural',
    notes: 'This 8 ft high by 24 ft long wall has 192 sq ft of face area. Quantities use the stated nominal block module and waste allowance; they do not establish a safe wall design, fire rating or reinforcement schedule. Obtain footing, drainage, reinforcement, grout and movement-joint details from approved plans and applicable requirements. Enter matching product coverage for mortar.',
    adjacentSizes: { prev: '8x20', next: '8x40' },
  },
  {
    slug: '8x40',
    name: '8×40',
    height: 8,
    length: 40,
    areaSqFt: 320,
    useCase: 'Commercial / Barn Structural Wall',
    category: 'commercial-highbay',
    notes: 'This 8 ft high by 40 ft long wall has 320 sq ft of face area. Quantities use the stated nominal block module and waste allowance; they do not establish a safe wall design, fire rating or reinforcement schedule. Obtain footing, drainage, reinforcement, grout and movement-joint details from approved plans and applicable requirements. Enter matching product coverage for mortar.',
    adjacentSizes: { prev: '8x24', next: '10x40' },
  },
  {
    slug: '10x40',
    name: '10×40',
    height: 10,
    length: 40,
    areaSqFt: 400,
    useCase: 'High-Bay Shop / Warehouse Wall',
    category: 'commercial-highbay',
    notes: 'This 10 ft high by 40 ft long wall has 400 sq ft of face area. Quantities use the stated nominal block module and waste allowance; they do not establish a safe wall design, fire rating or reinforcement schedule. Obtain footing, drainage, reinforcement, grout and movement-joint details from approved plans and applicable requirements. Enter matching product coverage for mortar.',
    adjacentSizes: { prev: '8x40' },
  },
];
