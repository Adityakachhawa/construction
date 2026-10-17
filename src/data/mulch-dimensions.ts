export interface MulchDepthMetrics {
  depthInches: number;
  depthLabel: string;
  cuFt: number;
  cuYds: number;
  bags2cuft: number;
  bags1_5cuft: number;
  baggedCost: number; // Based on $4.25 per 2 cu ft bag
  bulkMaterialCost: number; // Based on $40 per cubic yard
  savingsBulk: number; // How much saved buying bulk vs bagged
}

export interface MulchDimension {
  slug: string;
  name: string;
  label: string;
  length: number;
  width: number;
  areaSqFt: number;
  useCase: string;
  category: 'flower-bed' | 'border-path' | 'large-garden' | 'playground-pad' | 'full-yard';
  recommendedDepth: 2 | 3;
  notes: string;
  adjacentSizes: { prev?: string; next?: string };
}

export function getMulchMetrics(areaSqFt: number, depthInches: number): MulchDepthMetrics {
  const cuFt = Math.round((areaSqFt * (depthInches / 12)) * 100) / 100;
  const cuYds = Math.round((cuFt / 27) * 100) / 100;
  const bags2cuft = Math.ceil(cuFt / 2);
  const bags1_5cuft = Math.ceil(cuFt / 1.5);
  const baggedCost = Math.round(bags2cuft * 4.25);
  const bulkMaterialCost = Math.round(cuYds * 40);
  const savingsBulk = baggedCost - bulkMaterialCost;

  let depthLabel = `${depthInches}" Depth`;
  if (depthInches === 1) depthLabel = '1" (Light Touch-Up)';
  else if (depthInches === 2) depthLabel = '2" (Annual Refresh)';
  else if (depthInches === 3) depthLabel = '3" (Standard Weed Suppression)';
  else if (depthInches === 4) depthLabel = '4" (Heavy Moisture Retention)';
  else if (depthInches === 6) depthLabel = '6" (Playground Safety Cushion)';

  return {
    depthInches,
    depthLabel,
    cuFt,
    cuYds,
    bags2cuft,
    bags1_5cuft,
    baggedCost,
    bulkMaterialCost,
    savingsBulk,
  };
}

export function getMulchDepthTable(areaSqFt: number): MulchDepthMetrics[] {
  return [1, 2, 3, 4, 6].map((depth) => getMulchMetrics(areaSqFt, depth));
}

export const mulchDimensions: MulchDimension[] = [
  {
    slug: '5x10',
    name: '5×10',
    label: '5×10 Ft',
    length: 10,
    width: 5,
    areaSqFt: 50,
    useCase: 'Front Porch Flower Bed / Entry Planter',
    category: 'flower-bed',
    recommendedDepth: 3,
    notes: 'A 5×10 ft flower bed (50 sq ft) typically frames a front porch or entrance walkway. At a standard 3-inch depth, it requires 0.46 cubic yards or 7 bags (2 cu ft each). Because the total volume is less than 1 yard, buying bagged mulch from a local garden center is far more convenient and avoids bulk minimum delivery surcharges.',
    adjacentSizes: { next: '5x20' },
  },
  {
    slug: '5x20',
    name: '5×20',
    label: '5×20 Ft',
    length: 20,
    width: 5,
    areaSqFt: 100,
    useCase: 'Foundation Border Bed / Side Yard Planting Strip',
    category: 'border-path',
    recommendedDepth: 3,
    notes: 'A 5×20 ft landscape strip (100 sq ft) runs along house foundations or garage sidewalls. A 3-inch application requires 0.93 cubic yards (13 bags of 2 cu ft mulch). For an annual spring refresh at 2 inches, 0.62 cubic yards (9 bags) will restore vibrant bark color and lock in root moisture.',
    adjacentSizes: { prev: '5x10', next: '4x50' },
  },
  {
    slug: '4x50',
    name: '4×50',
    label: '4×50 Ft',
    length: 50,
    width: 4,
    areaSqFt: 200,
    useCase: '50-Foot Fence Line Border / Shrub Hedgerow',
    category: 'border-path',
    recommendedDepth: 3,
    notes: 'A long 4×50 ft border (200 sq ft) beneath a privacy fence or property hedge prevents weed growth and simplifies lawn mowing. At 3 inches deep, you will need 1.85 cubic yards (25 bags of 2 cu ft). At this volume, bulk delivery becomes an attractive option if you have an open driveway drop zone.',
    adjacentSizes: { prev: '5x20', next: '10x10' },
  },
  {
    slug: '10x10',
    name: '10×10',
    label: '10×10 Ft',
    length: 10,
    width: 10,
    areaSqFt: 100,
    useCase: 'Tree Ring / Center Garden Island',
    category: 'flower-bed',
    recommendedDepth: 3,
    notes: 'A 10×10 ft square planting island or circular mulch ring around a mature shade tree (100 sq ft) protects trunk bark from weed trimmer damage. Needing 13 bags (2 cu ft) at 3 inches deep, keep mulch pulled back 3 to 4 inches from the root flare to prevent root rot and insect infestation.',
    adjacentSizes: { prev: '4x50', next: '10x20' },
  },
  {
    slug: '10x20',
    name: '10×20',
    label: '10×20 Ft',
    length: 20,
    width: 10,
    areaSqFt: 200,
    useCase: 'Backyard Landscape Bed / Patio Perimeter',
    category: 'flower-bed',
    recommendedDepth: 3,
    notes: 'A generous 10×20 ft bed (200 sq ft) wraps comfortably around an outdoor patio or fire pit seating zone. At 3 inches deep, it takes 1.85 cubic yards or 25 bags of 2 cu ft mulch ($106 bagged vs. $74 bulk). At 2 inches deep, 17 bags (1.23 cu yds) will provide uniform annual coverage.',
    adjacentSizes: { prev: '10x10', next: '10x30' },
  },
  {
    slug: '10x30',
    name: '10×30',
    label: '10×30 Ft',
    length: 30,
    width: 10,
    areaSqFt: 300,
    useCase: 'Large Shrub & Perennial Bed',
    category: 'large-garden',
    recommendedDepth: 3,
    notes: 'A 10×30 ft landscape feature (300 sq ft) accommodates layered plantings of ornamental grasses, dwarf evergreens, and perennial blooms. Requiring 2.78 cubic yards (38 bags of 2 cu ft) at 3 inches deep, ordering 3 cubic yards from a bulk supplier saves roughly $50 compared to retail bagging.',
    adjacentSizes: { prev: '10x20', next: '15x20' },
  },
  {
    slug: '15x20',
    name: '15×20',
    label: '15×20 Ft',
    length: 20,
    width: 15,
    areaSqFt: 300,
    useCase: 'Play Area / Backyard Playground Mulch Pad',
    category: 'playground-pad',
    recommendedDepth: 3,
    notes: 'A 15×20 ft backyard footprint (300 sq ft) serves as an outdoor playset safety surface or shaded swing pad. For standard landscaping, 3 inches requires 2.78 cubic yards. When using certified engineered wood fiber (EWF) for playground safety up to a 5-ft fall height per ASTM standards, a compacted 6-inch depth (5.56 cu yds or 75 bags) is recommended.',
    adjacentSizes: { prev: '10x30', next: '20x20' },
  },
  {
    slug: '20x20',
    name: '20×20',
    label: '20×20 Ft',
    length: 20,
    width: 20,
    areaSqFt: 400,
    useCase: 'Large Garden Plot / Vegetable Bed Walkways',
    category: 'large-garden',
    recommendedDepth: 3,
    notes: 'A 20×20 ft garden space (400 sq ft) accommodates raised beds surrounded by mulch walking lanes to suppress weeds and mud. At 3 inches deep, you will need 3.70 cubic yards (50 bags of 2 cu ft). Bulk delivery is highly recommended here, cutting cost from $213 bagged to $148 bulk material.',
    adjacentSizes: { prev: '15x20', next: '500-sq-ft' },
  },
  {
    slug: '500-sq-ft',
    name: '500 Sq Ft',
    label: '500 Sq Ft',
    length: 25,
    width: 20,
    areaSqFt: 500,
    useCase: '500 Sq Ft Multi-Bed Yard Project',
    category: 'full-yard',
    recommendedDepth: 3,
    notes: 'A 500 sq ft mulching project typically covers 3 to 4 combined flower beds and foundation borders across a residential property. At 3 inches deep, you need 4.63 cubic yards (63 bags of 2 cu ft). At 2 inches deep, you need 3.09 cubic yards (42 bags). Ordering 4.5 to 5 cubic yards in bulk delivers substantial cost savings and eliminates plastic bag waste.',
    adjacentSizes: { prev: '20x20', next: '1000-sq-ft' },
  },
  {
    slug: '1000-sq-ft',
    name: '1,000 Sq Ft',
    label: '1,000 Sq Ft',
    length: 50,
    width: 20,
    areaSqFt: 1000,
    useCase: '1,000 Sq Ft Full-Yard Landscape Refresh',
    category: 'full-yard',
    recommendedDepth: 3,
    notes: 'A 1,000 sq ft landscape overhaul refreshes all front, side, and backyard planting zones on an average suburban lot. At 3 inches deep, the project requires 9.26 cubic yards (125 bags of 2 cu ft). Buying in bulk saves over $260 compared to retail bags ($370 bulk vs. $531 bagged), and fits into a single delivery from a local landscape supply company.',
    adjacentSizes: { prev: '500-sq-ft' },
  },
];
