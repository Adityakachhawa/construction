export interface GravelMetrics {
  depthInches: number;
  cuFt: number;
  cuYds: number;
  cuYdsWithWaste: number;
  tonsCrushedStone: number; // ~1.4 tons/yd³
  tonsCrusherRun: number;   // ~1.5 tons/yd³
  tonsPeaGravel: number;    // ~1.35 tons/yd³
}

export interface GravelDimension {
  slug: string;
  name: string;
  length: number;
  width: number;
  areaSqFt: number;
  useCase: string;
  category: 'driveway' | 'parking-pad' | 'shed-patio';
  recommendedDepth: 4 | 6;
  notes: string;
  truckloads: string;
  adjacentSizes: { prev?: string; next?: string };
}

export function getGravelMetrics(length: number, width: number, depthInches: number): GravelMetrics {
  const sqft = length * width;
  const cuFt = sqft * (depthInches / 12);
  const cuYds = cuFt / 27;
  const cuYdsWithWaste = cuYds * 1.10; // 10% compaction & grade variation allowance

  return {
    depthInches,
    cuFt: Math.round(cuFt * 100) / 100,
    cuYds: Math.round(cuYds * 100) / 100,
    cuYdsWithWaste: Math.round(cuYdsWithWaste * 100) / 100,
    tonsCrushedStone: Math.round(cuYdsWithWaste * 1.40 * 10) / 10,
    tonsCrusherRun: Math.round(cuYdsWithWaste * 1.50 * 10) / 10,
    tonsPeaGravel: Math.round(cuYdsWithWaste * 1.35 * 10) / 10,
  };
}

export function getGravelDepthTable(length: number, width: number): GravelMetrics[] {
  return [2, 3, 4, 6, 8].map((d) => getGravelMetrics(length, width, d));
}

export const gravelDimensions: GravelDimension[] = [
  {
    slug: '8x10',
    name: '8×10',
    length: 10,
    width: 8,
    areaSqFt: 80,
    useCase: 'Small Shed Base / Walkway Pad',
    category: 'shed-patio',
    recommendedDepth: 4,
    truckloads: '1 pickup truck bed or local landscaping trailer (under 2 tons)',
    notes: 'An 8×10 gravel pad (80 sq ft) creates a free-draining foundation for small tool sheds or garden pathways. A 4" layer of compacted crushed run (#411) over non-woven geotextile fabric prevents mud migration and keeps wooden shed runners rot-free.',
    adjacentSizes: { next: '10x10' },
  },
  {
    slug: '10x10',
    name: '10×10',
    length: 10,
    width: 10,
    areaSqFt: 100,
    useCase: 'Patio Base / Fire Pit Area',
    category: 'shed-patio',
    recommendedDepth: 4,
    truckloads: '1 small utility trailer or 1 single-axle dump load (~2.3 tons)',
    notes: 'A 10×10 gravel area (100 sq ft) is the benchmark footprint for backyard fire pit patios, gazebo bases, and grill pads. For decorative seating, install a 3" to 4" layer of washed #57 stone or pea gravel bounded by timber or metal edging.',
    adjacentSizes: { prev: '8x10', next: '10x12' },
  },
  {
    slug: '10x12',
    name: '10×12',
    length: 12,
    width: 10,
    areaSqFt: 120,
    useCase: 'Storage Shed Gravel Pad',
    category: 'shed-patio',
    recommendedDepth: 4,
    truckloads: '1 single-axle dump truck load (~2.7 tons at 4")',
    notes: 'A 10×12 pad (120 sq ft) accommodates standard 8×10 and 10×12 storage sheds, leaving a clean 1-foot gravel perimeter that catches roof runoff and stops backsplash from dirtying shed siding. Excavate 4" to 6" deep, lay commercial geotextile fabric, and compact in two lifts.',
    adjacentSizes: { prev: '10x10', next: '10x20' },
  },
  {
    slug: '10x20',
    name: '10×20',
    length: 20,
    width: 10,
    areaSqFt: 200,
    useCase: 'Single Car Parking Pad',
    category: 'parking-pad',
    recommendedDepth: 6,
    truckloads: '1 single-axle or small tandem dump truck (~5.7 tons at 6")',
    notes: 'A 10×20 pad (200 sq ft) is sized for single-car parking or trailer storage. Because vehicle tires produce concentrated wheel track pressure, install a minimum 6" total gravel depth (4" of dense #4 ballast stone topped by 2" of compacted crusher run).',
    adjacentSizes: { prev: '10x12', next: '12x20' },
  },
  {
    slug: '12x20',
    name: '12×20',
    length: 20,
    width: 12,
    areaSqFt: 240,
    useCase: 'RV / Boat Parking Pad',
    category: 'parking-pad',
    recommendedDepth: 6,
    truckloads: '1 tandem-axle dump truck load (~6.9 tons at 6")',
    notes: 'A 12×20 pad (240 sq ft) provides extra side clearance for opening motorhome slides and trailer doors. Heavy tandem-axle travel trailers require a sturdy 6" to 8" compacted subbase to avoid sinking during wet spring freeze-thaw periods.',
    adjacentSizes: { prev: '10x20', next: '20x20' },
  },
  {
    slug: '20x20',
    name: '20×20',
    length: 20,
    width: 20,
    areaSqFt: 400,
    useCase: 'Two-Car Gravel Parking Pad',
    category: 'parking-pad',
    recommendedDepth: 6,
    truckloads: '1 standard tri-axle dump truck load (~11.4 tons at 6")',
    notes: 'A 20×20 area (400 sq ft) fits two full-size passenger vehicles side-by-side. Grade the pad with a 1% to 2% crown (high center tapering toward edges) so stormwater sheds quickly instead of forming standing water puddles.',
    adjacentSizes: { prev: '12x20', next: '24x24' },
  },
  {
    slug: '24x24',
    name: '24×24',
    length: 24,
    width: 24,
    areaSqFt: 576,
    useCase: 'Garage / Pole Barn Subbase Pad',
    category: 'parking-pad',
    recommendedDepth: 6,
    truckloads: '1 tri-axle or quad-axle dump truck load (~16.5 tons at 6")',
    notes: 'A 24×24 pad (576 sq ft) serves as an oversized parking turnaround or subbase gravel pad beneath pole barns and workshops. Compacting 6" of crusher run or road base with a 1-ton roller creates a rock-solid, non-yielding building pad.',
    adjacentSizes: { prev: '20x20', next: '10x50' },
  },
  {
    slug: '10x50',
    name: '10×50',
    length: 50,
    width: 10,
    areaSqFt: 500,
    useCase: '50-Foot Single-Lane Driveway',
    category: 'driveway',
    recommendedDepth: 4,
    truckloads: '1 tri-axle dump truck (~9.5 tons at 4", or ~14.3 tons at 6")',
    notes: 'A 10×50 driveway (500 sq ft) is a common length connecting residential roads to set-back carports. A 4" top-dress requires ~9.5 tons of crushed aggregate, while a full new installation over soft soil requires 6" (~14.3 tons).',
    adjacentSizes: { prev: '24x24', next: '12x50' },
  },
  {
    slug: '12x50',
    name: '12×50',
    length: 50,
    width: 12,
    areaSqFt: 600,
    useCase: '50-Foot Standard Gravel Driveway',
    category: 'driveway',
    recommendedDepth: 4,
    truckloads: '1 tri-axle dump truck load (~11.4 tons at 4", or ~17.1 tons at 6")',
    notes: 'A 12×50 driveway (600 sq ft) provides comfortable 12-foot travel width for SUVs and delivery trucks. Maintain roadside drainage ditches and install a crown in the roadbed to keep water flowing toward swales.',
    adjacentSizes: { prev: '10x50', next: '10x100' },
  },
  {
    slug: '10x100',
    name: '10×100',
    length: 100,
    width: 10,
    areaSqFt: 1000,
    useCase: '100-Foot Single-Lane Driveway',
    category: 'driveway',
    recommendedDepth: 4,
    truckloads: '1 to 2 tri-axle dump truck loads (~19.0 tons at 4", or ~28.5 tons at 6")',
    notes: 'A 100-foot rural or suburban driveway lane covers 1,000 sq ft. Ordering in full tri-axle loads (typically 12 to 14 tons per truck) maximizes material savings and minimizes hauling trip fees.',
    adjacentSizes: { prev: '12x50', next: '12x100' },
  },
  {
    slug: '12x100',
    name: '12×100',
    length: 100,
    width: 12,
    areaSqFt: 1200,
    useCase: '100-Foot Standard Gravel Driveway',
    category: 'driveway',
    recommendedDepth: 4,
    truckloads: '2 tri-axle dump truck loads (~22.8 tons at 4", or ~34.2 tons at 6")',
    notes: 'A 12×100 gravel driveway (1,200 sq ft) is one of the most frequently constructed residential driveway dimensions. A 4" resurfacing coat requires ~23 tons of #57 crushed limestone, while new driveway construction typically requires a multi-lift installation totalling 34+ tons.',
    adjacentSizes: { prev: '10x100', next: '12x200' },
  },
  {
    slug: '12x200',
    name: '12×200',
    length: 200,
    width: 12,
    areaSqFt: 2400,
    useCase: '200-Foot Rural Gravel Driveway',
    category: 'driveway',
    recommendedDepth: 4,
    truckloads: '3 to 4 tri-axle dump truck loads (~45.6 tons at 4", or ~68.4 tons at 6")',
    notes: 'A 200-foot rural driveway covers 2,400 sq ft. For long country driveways, professional "tailgate spreading" by the dump truck driver saves hours of grading labor. Always install culvert pipes at ditch crossings before laying stone.',
    adjacentSizes: { prev: '12x100' },
  },
];

export function getGravelDimension(slug: string): GravelDimension | undefined {
  return gravelDimensions.find((g) => g.slug === slug);
}
