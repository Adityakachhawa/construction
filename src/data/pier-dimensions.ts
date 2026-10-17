export interface PierDepthMetrics {
  depthInches: number;
  depthFeet: number;
  cuFtSingle: number;
  cuYdsSingle: number;
  bags80Single: number;
  bags60Single: number;
  bags80FourPiers: number;
  bags60FourPiers: number;
  bags80SixPiers: number;
  bags60SixPiers: number;
  bags80EightPiers: number;
  bags60EightPiers: number;
}

export interface PierDimension {
  slug: string;
  name: string;
  diameterInches: number;
  useCase: string;
  category: string;
  standardRebar: string;
  maxAxialLoadLbs: string;
  notes: string;
  adjacentSizes: { prev?: string; next?: string };
}

export function getPierMetrics(diameterInches: number, depthInches: number): PierDepthMetrics {
  const radiusFeet = (diameterInches / 2) / 12;
  const depthFeet = depthInches / 12;
  const areaSqFt = Math.PI * radiusFeet * radiusFeet;
  const cuFtSingle = areaSqFt * depthFeet;
  const cuYdsSingle = cuFtSingle / 27;

  // Standard Quikrete bag yields: 80-lb bag = 0.60 cu ft, 60-lb bag = 0.45 cu ft
  // Includes a 10% safety margin for hole bell-out and soil over-excavation
  const cuFtWithWaste = cuFtSingle * 1.10;

  return {
    depthInches,
    depthFeet,
    cuFtSingle: Math.round(cuFtSingle * 100) / 100,
    cuYdsSingle: Math.round(cuYdsSingle * 1000) / 1000,
    bags80Single: Math.ceil(cuFtWithWaste / 0.60),
    bags60Single: Math.ceil(cuFtWithWaste / 0.45),
    bags80FourPiers: Math.ceil((cuFtWithWaste * 4) / 0.60),
    bags60FourPiers: Math.ceil((cuFtWithWaste * 4) / 0.45),
    bags80SixPiers: Math.ceil((cuFtWithWaste * 6) / 0.60),
    bags60SixPiers: Math.ceil((cuFtWithWaste * 6) / 0.45),
    bags80EightPiers: Math.ceil((cuFtWithWaste * 8) / 0.60),
    bags60EightPiers: Math.ceil((cuFtWithWaste * 8) / 0.45),
  };
}

export function getPierDepthTable(diameterInches: number): PierDepthMetrics[] {
  return [24, 30, 36, 42, 48, 60].map((d) => getPierMetrics(diameterInches, d));
}

export const pierDimensions: PierDimension[] = [
  {
    slug: '6-inch',
    name: '6-Inch',
    diameterInches: 6,
    useCase: 'Fence Posts & Light Pergolas',
    category: 'Fencing & Light Structures',
    standardRebar: 'One central #4 vertical rebar or 2-3/8" steel pipe post embedded directly',
    maxAxialLoadLbs: '~2,500 – 4,000 lbs (soil dependent)',
    notes: 'A 6-inch Sonotube is ideal for tall privacy fence corner posts, mailbox piers, freestanding pergola leg pads, and light garden structures. Due to its narrow diameter, mechanical hand augers can drill clean 6-inch holes with minimal backfill disturbance.',
    adjacentSizes: { next: '8-inch' },
  },
  {
    slug: '8-inch',
    name: '8-Inch',
    diameterInches: 8,
    useCase: 'Small Decks, Steps & Privacy Fences',
    category: 'Decks & Stairs',
    standardRebar: 'Two #4 rebar tied vertically with 1.5" minimum concrete perimeter cover',
    maxAxialLoadLbs: '~5,000 – 7,500 lbs',
    notes: 'An 8-inch cylindrical form tube is the standard size for freestanding ground-level decks, external porch steps, and heavy gate posts. An 8" tube pier provides ample surface area to anchor 4×4 timber posts using Simpson Strong-Tie post bases.',
    adjacentSizes: { prev: '6-inch', next: '10-inch' },
  },
  {
    slug: '10-inch',
    name: '10-Inch',
    diameterInches: 10,
    useCase: 'Standard Residential Deck Footings',
    category: 'Residential Decks',
    standardRebar: 'Two to three #4 vertical rebar bars centered in the pier cage',
    maxAxialLoadLbs: '~8,000 – 12,000 lbs',
    notes: 'A 10-inch Sonotube is the most popular diameter for standard attached residential decks supporting 6×6 timber posts. It provides adequate concrete bearing area to distribute structural floor loads over 2,000 PSF bearing soil without needing a wider spread footing.',
    adjacentSizes: { prev: '8-inch', next: '12-inch' },
  },
  {
    slug: '12-inch',
    name: '12-Inch',
    diameterInches: 12,
    useCase: 'Large Decks, Porches & Gazebo Piers',
    category: 'Heavy Decks & Porches',
    standardRebar: 'Three or four #4 vertical rebar tied in a triangular or square cage with #3 circular stirrups',
    maxAxialLoadLbs: '~12,000 – 18,000 lbs',
    notes: 'A 12-inch diameter pier is standard for two-story elevated decks, covered screened porches, timber gazebos, and pedestrian bridges. The 12" diameter allows forgiving margin for centering 6×6 or 8×8 timber posts while maintaining required edge distances for anchor bolts.',
    adjacentSizes: { prev: '10-inch', next: '16-inch' },
  },
  {
    slug: '16-inch',
    name: '16-Inch',
    diameterInches: 16,
    useCase: 'Heavy Structural Piers & Carports',
    category: 'Heavy Piers & Carports',
    standardRebar: 'Four to five #5 vertical rebar tied with #3 wire ties spaced every 12 inches',
    maxAxialLoadLbs: '~20,000 – 30,000 lbs',
    notes: 'A 16-inch round pier carries heavy concentrated loads from timber frame carports, structural pergola cantilevers, and multi-tier decks. Often paired with a plastic bell footing base (such as Bigfoot Systems or Square Foot) to distribute load over low-bearing clay soils.',
    adjacentSizes: { prev: '12-inch', next: '18-inch' },
  },
  {
    slug: '18-inch',
    name: '18-Inch',
    diameterInches: 18,
    useCase: 'Pole Barns & Commercial Sign Bases',
    category: 'Commercial & Outbuildings',
    standardRebar: 'Six #5 rebar arranged in a circular cage with heavy #3 spiral ties',
    maxAxialLoadLbs: '~30,000 – 45,000 lbs',
    notes: 'An 18-inch tube pier is engineered for post-frame pole barn columns, solar panel ground-mount arrays, and highway commercial signs subject to heavy wind-uplift and overturning moments. Usually drilled with a tractor-mounted PTO or skid steer hydraulic auger.',
    adjacentSizes: { prev: '16-inch', next: '24-inch' },
  },
  {
    slug: '24-inch',
    name: '24-Inch',
    diameterInches: 24,
    useCase: 'Heavy Foundation Caissons & Bell Piers',
    category: 'Engineered Foundations',
    standardRebar: 'Six to eight #5 or #6 rebar with continuous spiral or welded wire cage',
    maxAxialLoadLbs: '~50,000 – 80,000+ lbs',
    notes: 'A 24-inch round pier functions as an engineered drilled caisson supporting residential room additions, heavy structural steel columns, and retaining wall end buttresses. Due to the high concrete volume (over 1/2 cubic yard per 3-ft hole), ready-mix concrete delivery is strongly advised.',
    adjacentSizes: { prev: '18-inch' },
  },
];

export function getPierDimension(slug: string): PierDimension | undefined {
  return pierDimensions.find((p) => p.slug === slug);
}
