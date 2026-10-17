export interface SlabMetrics {
  thicknessInches: number;
  cuFt: number;
  cuYds: number;
  cuYdsWithWaste: number;
  bags80Raw: number;
  bags80WithWaste: number;
  bags60Raw: number;
  bags60WithWaste: number;
}

export interface SlabDimension {
  slug: string;
  name: string;
  length: number;
  width: number;
  areaSqFt: number;
  useCase: string;
  category: string;
  recommendedThickness: 4 | 5 | 6;
  notes: string;
  reinforcement: string;
  subbase: string;
  controlJoints: string;
  readyMixVsBags: string;
  adjacentSizes: { prev?: string; next?: string };
}

export function getSlabMetrics(length: number, width: number, thicknessInches: number): SlabMetrics {
  const sqft = length * width;
  const cuFt = sqft * (thicknessInches / 12);
  const cuYds = (sqft * thicknessInches) / 324;
  const cuYdsWithWaste = cuYds * 1.10;
  const cuFtWithWaste = cuFt * 1.10;

  return {
    thicknessInches,
    cuFt: Math.round(cuFt * 100) / 100,
    cuYds: Math.round(cuYds * 100) / 100,
    cuYdsWithWaste: Math.round(cuYdsWithWaste * 100) / 100,
    bags80Raw: Math.ceil(cuFt / 0.60),
    bags80WithWaste: Math.ceil(cuFtWithWaste / 0.60),
    bags60Raw: Math.ceil(cuFt / 0.45),
    bags60WithWaste: Math.ceil(cuFtWithWaste / 0.45),
  };
}

export function getThicknessTable(length: number, width: number): SlabMetrics[] {
  return [4, 5, 6, 8].map((t) => getSlabMetrics(length, width, t));
}

export const slabDimensions: SlabDimension[] = [
  {
    slug: '8x8',
    name: '8×8',
    length: 8,
    width: 8,
    areaSqFt: 64,
    useCase: 'Small Shed / Hot Tub Pad',
    category: 'Patios & Sheds',
    recommendedThickness: 4,
    reinforcement: '6×6 W1.4/W1.4 welded wire mesh or macro-synthetic fibers for tool sheds; #4 rebar at 16" OC on 2" chairs for hot tub pads',
    subbase: '4" crushed aggregate (Item 4 or crusher run) compacted with a vibratory plate compactor',
    controlJoints: 'Cut a single cross joint at 4 ft in both directions (dividing into four 4×4 ft squares) or omit if unreinforced pad is under 8 ft',
    readyMixVsBags: 'Bagged concrete is practical: 40 bags (80-lb) or 53 bags (60-lb) at 4" thickness. Most ready-mix companies charge short-load fees for under 4–5 cubic yards.',
    notes: 'An 8×8 slab covers 64 sq ft, making it a very common size for modular resin garden sheds, trash enclosure pads, or outdoor hot tubs. When building for a hot tub holding 3,000–5,000 lbs, pour at 5" to 6" thickness with #4 rebar and 4,000 PSI concrete to avoid localized punching shear.',
    adjacentSizes: { next: '8x10' },
  },
  {
    slug: '8x10',
    name: '8×10',
    length: 10,
    width: 8,
    areaSqFt: 80,
    useCase: 'Garden Shed Pad',
    category: 'Patios & Sheds',
    recommendedThickness: 4,
    reinforcement: '6×6 welded wire mesh or #3 rebar at 24" on-center elevated on dobies',
    subbase: '4" compacted crushed gravel or road base over non-woven geotextile fabric',
    controlJoints: 'One transverse saw-cut joint across the center at 5 ft along the 10-ft length',
    readyMixVsBags: 'Borderline bagged project: 49 bags (80-lb) or 66 bags (60-lb) for 4". Rented electric mixer recommended. A volumetric mix-on-site truck is an efficient alternative if available.',
    notes: 'An 8×10 slab provides 80 sq ft of level foundation for standard pre-cut lumber and metal garden sheds. Ensure the top of the slab sits 2" to 4" above adjacent finished soil grade to prevent ground moisture and splashback from rotting shed sills.',
    adjacentSizes: { prev: '8x8', next: '10x10' },
  },
  {
    slug: '10x10',
    name: '10×10',
    length: 10,
    width: 10,
    areaSqFt: 100,
    useCase: 'Patio / Gazebo Pad',
    category: 'Patios & Outdoor Living',
    recommendedThickness: 4,
    reinforcement: '6×6 W1.4/W1.4 welded wire mesh elevated on rebar chairs at mid-depth (2" from bottom)',
    subbase: '4" to 6" of #57 washed crushed gravel or crusher run compacted to 95% Standard Proctor',
    controlJoints: 'Centered joint each way creating four equal 5×5 ft squares cut to 1" depth',
    readyMixVsBags: 'Mixing 62 bags (80-lb) by hand takes 3–4 hours for a 2-person crew. If ordering ready-mix, expect a minimum load fee or combine with a friend’s pour.',
    notes: 'A 10×10 slab (100 sq ft) is the benchmark standard for backyard grilling patios, fire pit seating areas, and gazebo pads. Pitch the surface 1/8" to 1/4" per foot (1.25" to 2.5" total across 10 ft) away from the house to ensure positive storm water drainage.',
    adjacentSizes: { prev: '8x10', next: '10x12' },
  },
  {
    slug: '10x12',
    name: '10×12',
    length: 12,
    width: 10,
    areaSqFt: 120,
    useCase: 'Storage Shed Foundation',
    category: 'Patios & Sheds',
    recommendedThickness: 4,
    reinforcement: '#4 rebar at 18" on-center or heavy welded wire fabric (6×6 W2.9/W2.9)',
    subbase: '4" crushed stone base compacted in 2" lifts',
    controlJoints: 'Transverse cut at 6 ft along the 12-ft side (two 6×10 ft panels)',
    readyMixVsBags: 'Ready-mix delivery recommended if within budget; hand-mixing 74 bags (80-lb) requires continuous work to avoid cold seams.',
    notes: 'A 10×12 slab (120 sq ft) is a very popular footprint for backyard workshops and lawn tractor storage. For monolithic slab-on-grade construction in non-frost regions, thicken edges to 8" deep by 12" wide with two continuous runs of #4 rebar around the perimeter.',
    adjacentSizes: { prev: '10x10', next: '10x20' },
  },
  {
    slug: '10x20',
    name: '10×20',
    length: 20,
    width: 10,
    areaSqFt: 200,
    useCase: 'Single Carport / Driveway Extension',
    category: 'Driveways & Carports',
    recommendedThickness: 5,
    reinforcement: '#4 rebar (1/2") in a 16" to 18" grid supported on 2" concrete adobes/chairs',
    subbase: '6" compacted road base gravel over firm, unyielding native subgrade',
    controlJoints: 'Transverse control joints saw-cut every 10 ft (two 10×10 ft sections) within 12 hours of pouring',
    readyMixVsBags: 'Ready-mix truck delivery strongly advised (~2.7 to 3.4 cubic yards with waste). Hand-mixing 120+ bags is prone to cold joints.',
    notes: 'A 10×20 slab (200 sq ft) accommodates a single vehicle, passenger car carport, or driveway turnaround extension. Pour at 4.5" to 5" thick using 4,000 PSI air-entrained concrete (5–7% air entrainment) to resist winter freeze-thaw cycles and deicing salt spalling.',
    adjacentSizes: { prev: '10x12', next: '12x12' },
  },
  {
    slug: '12x12',
    name: '12×12',
    length: 12,
    width: 12,
    areaSqFt: 144,
    useCase: 'Backyard Patio / Pergola Slab',
    category: 'Patios & Outdoor Living',
    recommendedThickness: 4,
    reinforcement: '6×6 welded wire mesh or #3 rebar grid at 18" on-center',
    subbase: '4" compacted crushed limestone or clean #57 stone',
    controlJoints: 'Center cut both directions forming four 6×6 ft quadrants',
    readyMixVsBags: 'Ready-mix delivery (order 2.0 to 2.25 yd³) is far faster and more consistent than mixing 88 bags of 80-lb concrete.',
    notes: 'A 12×12 slab (144 sq ft) comfortably seats 6 to 8 people with an outdoor dining set or fits a 12-foot timber pergola. Slope the slab 1.5" away from the home and apply a light broom finish for slip resistance when wet.',
    adjacentSizes: { prev: '10x20', next: '12x16' },
  },
  {
    slug: '12x16',
    name: '12×16',
    length: 16,
    width: 12,
    areaSqFt: 192,
    useCase: 'Workshop / Large Shed Slab',
    category: 'Workshops & Sheds',
    recommendedThickness: 5,
    reinforcement: '#4 rebar at 18" on-center grid throughout',
    subbase: '4" to 6" compacted aggregate base with 10-mil poly vapor retarder (ASTM E1745)',
    controlJoints: 'Transverse cut at 8 ft along the 16-ft span (creating two 12×8 ft panels)',
    readyMixVsBags: 'Ready-mix truck is required (order 2.75 to 3.0 yd³ for 4", or 4.0 yd³ for 5").',
    notes: 'A 12×16 slab (192 sq ft) is a premier size for dedicated home workshops, artist studios, and motorcycle garages. If installing heavy cast-iron table saws, planers, or machine tools, increase slab thickness to 5" and place rebar at 16" intervals.',
    adjacentSizes: { prev: '12x12', next: '12x20' },
  },
  {
    slug: '12x20',
    name: '12×20',
    length: 20,
    width: 12,
    areaSqFt: 240,
    useCase: 'Single-Car Garage / RV Pad',
    category: 'Garages & Vehicle Pads',
    recommendedThickness: 6,
    reinforcement: '#4 rebar (1/2") on 16" centers tied with wire and placed on 2.5" chairs',
    subbase: '6" crushed stone base compacted in two 3" lifts with plate compactor to 95% density',
    controlJoints: 'Saw-cut at 10 ft along the 20-ft length (two 12×10 ft sections)',
    readyMixVsBags: 'Ready-mix truck delivery required (order 4.9 to 5.0 cubic yards with 10% waste for a 6" slab).',
    notes: 'A 12×20 slab (240 sq ft) supports full-size pickup trucks, SUVs, or single-axle travel trailers. Pour at 5" to 6" thickness using 4,000 PSI compressive strength concrete per ACI 302.1R to prevent wheel cracking under sustained vehicle curb weights.',
    adjacentSizes: { prev: '12x16', next: '12x24' },
  },
  {
    slug: '12x24',
    name: '12×24',
    length: 24,
    width: 12,
    areaSqFt: 288,
    useCase: 'One-Car Garage / Boat Pad',
    category: 'Garages & Vehicle Pads',
    recommendedThickness: 6,
    reinforcement: '#4 rebar at 16" on-center each way with 2" minimum concrete cover',
    subbase: '6" compacted aggregate base course (#57 crushed stone or crusher run)',
    controlJoints: 'Saw-cut joints every 8 ft along the 24-ft length (three 12×8 ft sections)',
    readyMixVsBags: 'Ready-mix delivery required (order 5.9 to 6.0 cubic yards with 10% waste for a 6" slab).',
    notes: 'A 12×24 slab (288 sq ft) is standard for deep one-car garages and boat trailers needing room for trailer tongues and outboard motors. Specify 4,000 PSI mix and install a 10-mil poly vapor barrier underneath to prevent damp floor issues in enclosed garages.',
    adjacentSizes: { prev: '12x20', next: '15x15' },
  },
  {
    slug: '15x15',
    name: '15×15',
    length: 15,
    width: 15,
    areaSqFt: 225,
    useCase: 'Medium Patio Slab',
    category: 'Patios & Outdoor Living',
    recommendedThickness: 4,
    reinforcement: '6×6 W1.4/W1.4 wire mesh or synthetic fiber mesh with #4 rebar perimeter rim',
    subbase: '4" to 5" compacted crushed gravel or limestone screening',
    controlJoints: 'Saw-cut a 3×3 grid of 5×5 ft squares to prevent diagonal shrinkage cracks',
    readyMixVsBags: 'Ready-mix truck delivery required (order ~3.1 to 3.25 cubic yards for 4" with 10% waste).',
    notes: 'A 15×15 slab (225 sq ft) provides comfortable outdoor living space for patio dining, an outdoor kitchen counter, and lounge seating. Ensure 1/4" per foot slope away from building foundations and seal with a breathable silane/siloxane penetrant after curing.',
    adjacentSizes: { prev: '12x24', next: '16x20' },
  },
  {
    slug: '16x20',
    name: '16×20',
    length: 20,
    width: 16,
    areaSqFt: 320,
    useCase: 'Pavilion / Outbuilding Slab',
    category: 'Garages & Outbuildings',
    recommendedThickness: 5,
    reinforcement: '#4 rebar at 18" on-center both ways elevated on dobies',
    subbase: '4" to 6" compacted crushed rock subbase',
    controlJoints: 'Cut into four equal 8×10 ft quadrants within 12–24 hours of placement',
    readyMixVsBags: 'Ready-mix delivery mandatory (order ~4.4 yd³ for 4", or ~6.5 yd³ for 6" with waste).',
    notes: 'A 16×20 slab (320 sq ft) works well for two-bay golf cart garages, timber-frame covered pavilions, or detached utility sheds. For pavilions with heavy timber corner columns, cast J-bolt anchor posts or embed galvanized post bases directly into thickened corner piers.',
    adjacentSizes: { prev: '15x15', next: '20x20' },
  },
  {
    slug: '20x20',
    name: '20×20',
    length: 20,
    width: 20,
    areaSqFt: 400,
    useCase: 'Standard Two-Car Garage Slab',
    category: 'Two-Car Garages',
    recommendedThickness: 6,
    reinforcement: '#4 rebar at 16" to 18" on-center grid on 2.5" concrete chairs',
    subbase: '6" compacted aggregate base over undisturbed subsoil with 10-mil ASTM E1745 vapor retarder',
    controlJoints: 'Centered saw cuts in both directions dividing the slab into four 10×10 ft panels',
    readyMixVsBags: 'Ready-mix truck delivery required (order 5.5 yd³ for 4", or 8.25 yd³ for 6" with 10% waste).',
    notes: 'The 20×20 slab (400 sq ft) is the standard two-car residential garage footprint. While IRC R506 allows a 3.5" minimum thickness, engineering standards (ACI 302.1R / ACI 360R) strongly recommend 5" to 6" thickness with 4,000 PSI concrete to carry dual vehicle axle loads without crack displacement.',
    adjacentSizes: { prev: '16x20', next: '20x24' },
  },
  {
    slug: '20x24',
    name: '20×24',
    length: 24,
    width: 20,
    areaSqFt: 480,
    useCase: 'Oversized Two-Car Garage Slab',
    category: 'Two-Car Garages',
    recommendedThickness: 6,
    reinforcement: '#4 rebar (1/2") in an 18" grid throughout with perimeter thickened edge',
    subbase: '6" crushed stone base compacted to 95% density in 3" layers',
    controlJoints: 'Saw-cut joints dividing the 20×24 slab into six 10×8 ft panels',
    readyMixVsBags: 'Ready-mix delivery required (order 6.5 yd³ for 4", or 9.75 yd³ for 6" with 10% waste).',
    notes: 'A 20×24 slab (480 sq ft) provides room for two full-size trucks or SUVs plus 4 feet of front tool storage and workbench space. Place isolation joint strips along foundation stem walls and saw-cut contraction joints to a depth of 1.25" to 1.5" within 18 hours of placement.',
    adjacentSizes: { prev: '20x20', next: '24x24' },
  },
  {
    slug: '24x24',
    name: '24×24',
    length: 24,
    width: 24,
    areaSqFt: 576,
    useCase: 'Detached Garage / Shop Foundation',
    category: 'Two-Car Garages & Shops',
    recommendedThickness: 6,
    reinforcement: '#4 rebar at 16" on-center each way with two #5 continuous perimeter bars in turn-down edge',
    subbase: '6" to 8" compacted crushed stone over non-woven geotextile fabric with 15-mil vapor barrier',
    controlJoints: 'Cut into four 12×12 ft panels (saw joints at 12 ft along each axis)',
    readyMixVsBags: 'Ready-mix truck delivery required (order 7.8 yd³ for 4", or 11.75 yd³ for 6" with 10% waste). This pour requires two standard ready-mix trucks.',
    notes: 'A 24×24 slab (576 sq ft) is the premier detached garage and auto-enthusiast workshop size. At 6" thickness with 4,000 PSI concrete, this slab safely supports automotive lifts, floor jacks, and full-size work trucks. Ensure a 10-mil to 15-mil vapor barrier is taped continuously to prevent epoxy floor delamination.',
    adjacentSizes: { prev: '20x24', next: '30x40' },
  },
  {
    slug: '30x40',
    name: '30×40',
    length: 40,
    width: 30,
    areaSqFt: 1200,
    useCase: 'Pole Barn / Metal Building Slab',
    category: 'Pole Barns & Metal Buildings',
    recommendedThickness: 6,
    reinforcement: '#4 rebar at 16" on-center grid on 2.5" chairs, or #5 rebar under forklift/tractor traffic lanes',
    subbase: '6" to 8" compacted crusher run or #57 crushed rock over proof-rolled native subgrade',
    controlJoints: 'Saw-cut in a 3×4 grid creating twelve 10×10 ft panels; maximum joint spacing 10 to 12 ft',
    readyMixVsBags: 'Commercial ready-mix delivery required: order 16.5 yd³ for 4", or 24.5 yd³ for 6" with 10% waste (3 to 4 ready-mix trucks). Plan a dedicated pour crew with a power trowel.',
    notes: 'A 30×40 slab (1,200 sq ft) is the most sought-after size for agricultural pole barns, commercial shops, and barndominiums. Pouring this slab requires staging concrete delivery trucks in 30–45 minute intervals, screeding with a motorized truss screed or laser screed, and timing power trowel operations carefully to avoid surface crusting.',
    adjacentSizes: { prev: '24x24' },
  },
];

export function getSlabDimension(slug: string): SlabDimension | undefined {
  return slabDimensions.find((s) => s.slug === slug);
}
