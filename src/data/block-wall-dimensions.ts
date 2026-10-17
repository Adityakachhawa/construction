export interface BlockWallMetrics {
  heightFt: number;
  lengthFt: number;
  areaSqFt: number;
  coursesHigh: number;
  unitsPerCourse: number;
  netBlocks: number;
  totalBlocksWithWaste: number;
  mortarBags: number; // 80-lb Type S / N mortar bags (~33 blocks/bag)
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
  mortarBags: number;
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

export function getBlockWallMetrics(heightFt: number, lengthFt: number): BlockWallMetrics {
  const areaSqFt = heightFt * lengthFt;
  const coursesHigh = Math.round(heightFt * 1.5 * 10) / 10;
  const unitsPerCourse = Math.round(lengthFt * 0.75 * 10) / 10;
  const netBlocks = Math.round(areaSqFt * 1.125 * 10) / 10;
  const totalBlocksWithWaste = Math.ceil(netBlocks * 1.05);
  const mortarBags = Math.ceil(totalBlocksWithWaste / 33);
  const groutCuFtSolid = Math.round(netBlocks * 0.28 * 100) / 100;
  const groutCuYdsSolid = Math.round((groutCuFtSolid / 27) * 100) / 100;
  const groutCuYdsReinforced32 = Math.round((groutCuYdsSolid * 0.40) * 100) / 100;
  const reinforcedJoints = Math.floor(coursesHigh / 2);
  const ladderWireLinFt = reinforcedJoints * lengthFt;
  const ladderWirePieces = Math.ceil(ladderWireLinFt / 10);
  const verticalRebarBars32 = Math.ceil((lengthFt * 12) / 32) + 1;
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
      mortarBags: Math.ceil(m.totalBlocksWithWaste / 38),
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
      mortarBags: Math.ceil(m.totalBlocksWithWaste / 26),
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
    notes: 'A 4 ft high by 10 ft long concrete block wall (40 sq ft) creates an ideal garden planter or terrace retaining wall. Laid 6 courses high with 7.5 blocks per course, it requires 48 standard 8×8×16 blocks (with 5% waste) and 2 bags of Type S mortar. At 4 ft, backfill drainage with 4" perforated drain tile behind the wall is essential to relieve hydrostatic pressure.',
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
    notes: 'A 4 ft high by 20 ft long block wall (80 sq ft) is a popular dimension for hillside terracing, front yard grade transitions, and decorative courtyard boundaries. Requiring 95 standard CMU blocks and 3 bags of 80-lb Type S mortar, this 6-course wall should feature vertical #4 rebar dowels anchored into the poured concrete footing every 32 inches.',
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
    notes: 'A 6 ft high by 20 ft long masonry wall (120 sq ft) provides complete sightline privacy and sound dampening between neighboring patios or pool areas. Built 9 courses high with 142 total blocks and 5 bags of mortar, municipal codes require continuous footing embedment below local frost line with vertical reinforcement in grouted cores.',
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
    notes: 'A 6×50 ft concrete block perimeter fence (300 sq ft) represents a standard suburban residential boundary wall. With 9 courses tall and 37.5 blocks per course, you need 355 blocks (8×8×16) and 11 bags of mortar. A continuous bond beam course at the top with two #4 horizontal rebar bars tied together adds essential lateral stiffness against wind loading.',
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
    notes: 'A 100-foot long, 6-foot high CMU wall (600 sq ft) is the gold standard for long subdivision perimeter walls, commercial sound barriers, and security enclosures. Requiring 709 standard blocks and 22 bags of Type S mortar, control joints (CJ) should be placed every 20 to 25 linear feet with backer rod and elastomeric sealant to prevent temperature cracking.',
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
    notes: 'An 8 ft high by 10 ft long block wall (80 sq ft) forms an 8-ft ceiling partition inside a garage, workshop, or masonry garden shed. Requiring 12 courses of CMU (95 blocks with 5% waste) and 3 bags of mortar, it provides a 2-hour fire resistance rating when cores are grouted solid.',
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
    notes: 'An 8×20 ft block wall (160 sq ft) constitutes the rear or side wall of a standard single-car garage or detached workshop. Building this 12-course wall requires 189 standard 8×8×16 blocks, 6 bags of Type S mortar, and 6 vertical rebar dowels tied to footing steel per TMS 402 masonry design code.',
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
    notes: 'Measuring 8 ft high by 24 ft long (192 sq ft), this dimension matches the full depth of a standard two-car attached or detached garage. Running 18 blocks per course across 12 vertical courses, it needs 227 blocks, 7 bags of mortar, and ~2.2 cubic yards of core grout if fully filled, or 0.72 cu yd when grouted at 32" o.c.',
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
    notes: 'An 8 ft high by 40 ft long CMU wall (320 sq ft) serves as a heavy structural load-bearing wall for commercial storage buildings, livestock barns, and auto service bays. Needing 378 blocks and 12 mortar bags, horizontal joint reinforcement (truss or ladder wire) is placed every 16 inches (every 2nd course) to prevent shrinkage cracking.',
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
    notes: 'A 10 ft high by 40 ft long block wall (400 sq ft) represents a commercial high-bay industrial partition or warehouse perimeter wall. Standing 15 courses tall with 30 blocks per course, the project requires 473 blocks, 15 bags of mortar, and 16 vertical #5 rebar dowels at 32" centers with a continuous top bond beam.',
    adjacentSizes: { prev: '8x40' },
  },
];
