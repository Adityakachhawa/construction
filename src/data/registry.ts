import type { CalculatorConfig } from '../calculators/_types';
import { concreteSlab } from '../calculators/concrete-slab';
import { gravelCalculator } from '../calculators/gravel-calculator';
import { mulchCalculator } from '../calculators/mulch-calculator';
import { sandCalculator } from '../calculators/sand-calculator';
import { fencePostCalculator } from '../calculators/fence-post-calculator';
import { deckFootingCalculator } from '../calculators/deck-footing-calculator';
import { retainingWallCalculator } from '../calculators/retaining-wall-calculator';
import { paverBaseCalculator } from '../calculators/paver-base-calculator';
import { rebarCalculator } from '../calculators/rebar-calculator';
import { drywallCalculator } from '../calculators/drywall-calculator';
import { asphaltCalculator } from '../calculators/asphalt-calculator';
import { flooringCalculator } from '../calculators/flooring-calculator';
import { concreteColumnCalculator } from '../calculators/concrete-column-calculator';
import { topsoilCalculator } from '../calculators/topsoil-calculator';
import { aggregateCalculator } from '../calculators/aggregate-calculator';
import { concreteBlockCalculator } from '../calculators/concrete-block-calculator';
import { concreteDrivewayCalculator } from '../calculators/concrete-driveway-calculator';
import { concreteFootingCalculator } from '../calculators/concrete-footing-calculator';
import { plywoodCalculator } from '../calculators/plywood-calculator';
import { studCalculator } from '../calculators/stud-calculator';
import { roofPitchCalculator } from '../calculators/roof-pitch-calculator';
import { roofingCalculator } from '../calculators/roofing-calculator';
import { rafterCalculator } from '../calculators/rafter-calculator';
import { metalRoofingCalculator } from '../calculators/metal-roofing-calculator';
import { lumberCalculator } from '../calculators/lumber-calculator';
import { stairCalculator } from '../calculators/stair-calculator';
import { sidingCalculator } from '../calculators/siding-calculator';
import { boardFootCalculator } from '../calculators/board-foot-calculator';
import { excavationCalculator } from '../calculators/excavation-calculator';
import { squareFootageCalculator } from '../calculators/square-footage-calculator';
import { frenchDrainCalculator } from '../calculators/french-drain-calculator';
import { concreteBagsCalculator } from '../calculators/concrete-bags-calculator';
import { insulationCalculator } from '../calculators/insulation-calculator';
import { mortarCalculator } from '../calculators/mortar-calculator';
import { groutCalculator } from '../calculators/grout-calculator';
import { postHoleCalculator } from '../calculators/post-hole-calculator';

const _registry: CalculatorConfig[] = [
  concreteSlab,
  gravelCalculator,
  mulchCalculator,
  sandCalculator,
  fencePostCalculator,
  deckFootingCalculator,
  retainingWallCalculator,
  paverBaseCalculator,
  rebarCalculator,
  drywallCalculator,
  asphaltCalculator,
  flooringCalculator,
  concreteColumnCalculator,
  topsoilCalculator,
  aggregateCalculator,
  concreteBlockCalculator,
  concreteDrivewayCalculator,
  concreteFootingCalculator,
  plywoodCalculator,
  studCalculator,
  roofPitchCalculator,
  roofingCalculator,
  rafterCalculator,
  metalRoofingCalculator,
  lumberCalculator,
  stairCalculator,
  sidingCalculator,
  boardFootCalculator,
  excavationCalculator,
  squareFootageCalculator,
  frenchDrainCalculator,
  concreteBagsCalculator,
  insulationCalculator,
  mortarCalculator,
  groutCalculator,
  postHoleCalculator,
];

const relatedMap: Record<string, string[]> = {
  'concrete-slab-calculator':     ['concrete-bags-calculator', 'concrete-footing-calculator', 'rebar-calculator'],
  'concrete-bags-calculator':     ['concrete-slab-calculator', 'concrete-footing-calculator', 'concrete-column-calculator'],
  'concrete-footing-calculator':  ['concrete-slab-calculator', 'rebar-calculator', 'concrete-column-calculator', 'post-hole-calculator'],
  'concrete-column-calculator':   ['concrete-footing-calculator', 'concrete-bags-calculator', 'rebar-calculator'],
  'concrete-driveway-calculator': ['concrete-slab-calculator', 'concrete-bags-calculator', 'asphalt-calculator'],
  'concrete-block-calculator':    ['mortar-calculator', 'grout-calculator', 'retaining-wall-calculator'],
  'rebar-calculator':             ['concrete-slab-calculator', 'concrete-footing-calculator', 'retaining-wall-calculator'],
  'mortar-calculator':            ['concrete-block-calculator', 'grout-calculator', 'paver-base-calculator'],
  'grout-calculator':             ['mortar-calculator', 'concrete-block-calculator', 'flooring-calculator'],
  'gravel-calculator':            ['aggregate-calculator', 'sand-calculator', 'excavation-calculator', 'french-drain-calculator'],
  'sand-calculator':              ['gravel-calculator', 'aggregate-calculator', 'mortar-calculator'],
  'topsoil-calculator':           ['gravel-calculator', 'mulch-calculator', 'excavation-calculator'],
  'mulch-calculator':             ['topsoil-calculator', 'gravel-calculator', 'square-footage-calculator'],
  'aggregate-calculator':         ['gravel-calculator', 'sand-calculator', 'excavation-calculator'],
  'excavation-calculator':        ['gravel-calculator', 'topsoil-calculator', 'french-drain-calculator'],
  'french-drain-calculator':      ['gravel-calculator', 'excavation-calculator', 'post-hole-calculator'],
  'square-footage-calculator':    ['flooring-calculator', 'drywall-calculator', 'roofing-calculator'],
  'stud-calculator':              ['drywall-calculator', 'lumber-calculator', 'plywood-calculator'],
  'drywall-calculator':           ['stud-calculator', 'plywood-calculator', 'insulation-calculator'],
  'plywood-calculator':           ['stud-calculator', 'lumber-calculator', 'drywall-calculator'],
  'lumber-calculator':            ['stud-calculator', 'board-foot-calculator', 'rafter-calculator'],
  'board-foot-calculator':        ['lumber-calculator', 'stud-calculator', 'plywood-calculator'],
  'rafter-calculator':            ['roof-pitch-calculator', 'roofing-calculator', 'lumber-calculator'],
  'roof-pitch-calculator':        ['rafter-calculator', 'roofing-calculator', 'metal-roofing-calculator'],
  'roofing-calculator':           ['roof-pitch-calculator', 'rafter-calculator', 'metal-roofing-calculator'],
  'metal-roofing-calculator':     ['roofing-calculator', 'roof-pitch-calculator', 'rafter-calculator'],
  'siding-calculator':            ['stud-calculator', 'insulation-calculator', 'drywall-calculator'],
  'insulation-calculator':        ['drywall-calculator', 'siding-calculator', 'stud-calculator'],
  'stair-calculator':             ['lumber-calculator', 'rafter-calculator', 'square-footage-calculator'],
  'asphalt-calculator':           ['concrete-driveway-calculator', 'gravel-calculator', 'square-footage-calculator'],
  'flooring-calculator':          ['square-footage-calculator', 'grout-calculator', 'paver-base-calculator'],
  'deck-footing-calculator':      ['concrete-bags-calculator', 'concrete-footing-calculator', 'lumber-calculator'],
  'fence-post-calculator':        ['post-hole-calculator', 'concrete-bags-calculator', 'lumber-calculator'],
  'post-hole-calculator':         ['fence-post-calculator', 'concrete-bags-calculator', 'deck-footing-calculator'],
  'retaining-wall-calculator':    ['concrete-block-calculator', 'mortar-calculator', 'rebar-calculator'],
  'paver-base-calculator':        ['gravel-calculator', 'sand-calculator', 'flooring-calculator'],
};

// Unique on-page intro paragraph per calculator. Feeds calc.seo.intro, which the
// CalculatorLayout renders as the lead paragraph above the widget. Kept here (rather
// than in 36 files) so the content reads consistently and is easy to review/edit.
const introMap: Record<string, string> = {
  'concrete-slab-calculator':
    'Estimate the concrete volume for any slab, patio, or floor in cubic yards, cubic feet, and cubic meters. Enter your length, width, and thickness — the calculator handles the unit conversions and shows the exact ready-mix order quantity. Built for contractors pouring footings to driveways and DIYers planning a single patio.',
  'concrete-bags-calculator':
    'Find out exactly how many bags of pre-mixed concrete your project needs, in 40, 60, or 80 lb sizes. Enter the dimensions and the calculator converts volume to bag count using each bag\'s real yield, so you avoid the classic mistake of buying too few. Ideal for small pours where ordering ready-mix by the yard isn\'t worth it.',
  'concrete-footing-calculator':
    'Calculate concrete volume for continuous footings, pad footings, and grade beams. Enter footing length, width, and depth to get cubic yards plus a recommended order quantity with waste included. Footing dimensions should follow your local IRC frost-depth and bearing requirements.',
  'concrete-column-calculator':
    'Work out the concrete needed to fill round or square columns, piers, and tube forms. Enter the diameter (or side) and height and the calculator returns volume per column and for your full count. Useful for deck piers, porch posts, and Sonotube pours.',
  'concrete-driveway-calculator':
    'Estimate concrete volume and material cost for a driveway slab. Enter the driveway length, width, and thickness — typically 4 inches for cars and 5–6 inches for heavier vehicles — to get cubic yards and an order quantity with waste. Pair it with the rebar calculator for reinforcement planning.',
  'concrete-block-calculator':
    'Calculate how many concrete blocks (CMUs) you need for a wall, plus the mortar to lay them. Enter wall dimensions and block size to get block count, courses, and mortar volume. Works for standard 8×8×16 block and other common sizes.',
  'rebar-calculator':
    'Plan rebar for a concrete slab or footing: total linear feet, number of bars, and estimated weight. Enter the slab dimensions and your bar spacing — 12 in is typical for residential, 6–8 in for driveways — and the calculator lays out a bidirectional grid with a waste allowance. Weights are based on #4 (½ in) rebar.',
  'gravel-calculator':
    'Estimate gravel, crushed stone, or aggregate by volume and weight for driveways, paths, and drainage. Enter the area dimensions and depth to get cubic yards, cubic feet, and tons. Most loose gravel weighs roughly 1.4 tons per cubic yard, which the calculator uses to convert volume to delivery weight.',
  'sand-calculator':
    'Calculate how much sand you need for paver bedding, fill, or mixing, in volume and weight. Enter the area and depth to get cubic yards and tons. Handy for leveling layers under pavers and slabs where a consistent depth matters.',
  'aggregate-calculator':
    'Estimate aggregate volume and tonnage for base layers, backfill, and concrete mixing. Enter your dimensions and depth to convert to cubic yards and tons for ordering. Covers crushed stone, road base, and similar granular materials.',
  'topsoil-calculator':
    'Work out how much topsoil to order for gardens, lawns, and raised beds, in cubic yards and bags. Enter the bed area and the depth you want to add — 2–3 inches for overseeding, 6–12 inches for new beds — to get volume and an estimated delivery weight.',
  'mulch-calculator':
    'Calculate mulch by the cubic yard and by the bag for garden beds and landscaping. Enter the bed dimensions and mulch depth (2–4 inches is typical) to get total volume and how many 2 cu ft bags that equals. Avoids both under-ordering and the cost of hauling away extra.',
  'excavation-calculator':
    'Estimate excavation volume, hauled-away soil, and truckloads for basements, pools, trenches, and grading. Enter the dig dimensions plus a soil swell factor, because loose soil takes up more space than in-place ground. The calculator returns bank volume, expanded volume, and the number of truckloads to remove it.',
  'french-drain-calculator':
    'Plan a French drain: gravel volume, perforated pipe length, filter fabric area, and excavation. Enter the trench length, width, and depth to size every material at once. Built for yard drainage and foundation perimeter drains where getting the gravel quantity right is the hard part.',
  'post-hole-calculator':
    'Calculate the concrete needed per post hole and across your whole project. Enter the hole diameter and depth, the post size, and the number of holes to get bags or volume, with the post displacement already subtracted. Works for fence posts, deck footings, and mailbox posts.',
  'fence-post-calculator':
    'Work out fence posts, sections, and concrete for a straight run of fence. Enter the total fence length and your post spacing to get post count, number of sections, and the recommended hole depth. Pair it with the post hole calculator to size the concrete per hole.',
  'deck-footing-calculator':
    'Estimate the number of deck footings and the concrete to fill them. Enter your deck dimensions and beam/joist layout to get footing count and total concrete volume. Footing size and spacing should follow your local code and the loads your deck will carry.',
  'retaining-wall-calculator':
    'Calculate blocks, courses, gravel base, and backfill for a segmental retaining wall. Enter the wall length and height plus your block dimensions to size every component. For walls over about 4 feet, check whether your jurisdiction requires an engineered design.',
  'paver-base-calculator':
    'Size the gravel base and bedding sand under a paver patio, walkway, or driveway. Enter the area and your base and sand depths to get the volume of each layer in cubic yards. A proper compacted base is what keeps pavers from settling, so getting these depths right matters.',
  'stud-calculator':
    'Count the studs for a framed wall, including corners and openings. Enter the wall length and your stud spacing (16 or 24 in on center) to get field studs plus the extras for corners and each door or window. Built to match how walls are actually framed on site.',
  'lumber-calculator':
    'Estimate framing lumber: total boards, linear footage, board feet, and cost. Enter your board size, length, and quantity to get the full material and pricing picture. Useful for walls, joists, and any repetitive framing member.',
  'board-foot-calculator':
    'Calculate board feet for hardwood and rough lumber pricing. Enter thickness, width, and length and the calculator returns board feet — the volume unit lumberyards price by. Essential for buying rough-sawn or specialty lumber where boards aren\'t sold by the piece.',
  'plywood-calculator':
    'Work out how many sheets of plywood or OSB you need for floors, walls, or roofs. Enter the area to cover and your sheet size to get sheet count with a waste allowance. Covers sheathing, subfloor, and underlayment jobs.',
  'drywall-calculator':
    'Estimate drywall sheets, joint compound, and tape for a room or whole project. Enter wall and ceiling dimensions and your sheet size to get sheet count plus the mud and tape to finish it. Includes a waste factor for cuts and offcuts.',
  'insulation-calculator':
    'Calculate insulation coverage for walls, attics, and floors by area. Enter the space dimensions to get the square footage to insulate and how many batts or bags that takes. Helps you hit a target R-value without over-buying.',
  'siding-calculator':
    'Estimate siding material and panels for exterior walls, with window and door openings subtracted. Enter wall dimensions, openings, and panel coverage to get net area and panel count with waste. Works for lap, panel, and board siding.',
  'roofing-calculator':
    'Estimate roofing squares, shingle bundles, and underlayment for a pitched roof. Enter the footprint and roof pitch and the calculator applies the slope factor to get true roof area, then converts to squares and bundles. Roofing is sold by the square (100 sq ft), which this handles for you.',
  'metal-roofing-calculator':
    'Calculate metal roofing panels, fasteners, and material area for a standing-seam or exposed-fastener roof. Enter the roof dimensions, pitch, and panel coverage to get panel count by rows and columns plus screws. Built for ordering panels cut to the right run length.',
  'roof-pitch-calculator':
    'Convert between roof pitch, angle, and slope, and get rafter length from rise and run. Enter rise and run to see the X:12 pitch ratio, the angle in degrees, the slope percentage, and the rafter length. The reference tool for reading and communicating roof slope.',
  'rafter-calculator':
    'Calculate rafter length, overhang, roof angle, and slope from rise and run using the Pythagorean method. Enter rise, run, and any overhang to get the full rafter length to cut. Pairs with the roof pitch calculator for laying out a roof from scratch.',
  'stair-calculator':
    'Lay out a code-compliant staircase: number of risers and treads, exact riser height, total run, stringer length, and stair angle. Enter your total rise and preferred riser height and the calculator divides it into even steps. Default riser and tread targets follow common IRC limits (max 7¾ in riser, min 10 in tread).',
  'flooring-calculator':
    'Estimate flooring by area and by the box for any room. Enter the room dimensions and your box coverage to get square footage, the amount needed with waste, and how many boxes to buy. Works for laminate, hardwood, vinyl plank, and tile.',
  'square-footage-calculator':
    'Calculate the square footage of a room or area, with support for combining multiple rectangles. Enter length and width to get area in square feet and square meters. The starting point for flooring, paint, tiling, and most material estimates.',
  'asphalt-calculator':
    'Estimate hot-mix asphalt by weight for a driveway or lot, in tons. Enter the area and paving thickness and the calculator uses asphalt density to convert volume to tons for ordering. Compare it against the concrete driveway calculator when choosing a surface.',
  'mortar-calculator':
    'Calculate the mortar needed to lay brick or block, in bags and volume. Enter the wall area or unit count and the calculator estimates mortar based on typical joint sizes. Pairs with the concrete block and brick calculators for a full masonry order.',
  'grout-calculator':
    'Estimate tile grout by weight for floors and walls. Enter the tile size, joint width, and area, and the calculator returns the grout volume and bag weight needed to fill the joints. Accurate joint-fill math means fewer mid-job supply runs.',
};

export const calculatorRegistry: CalculatorConfig[] = _registry.map((calc) => ({
  ...calc,
  relatedCalculators: relatedMap[calc.slug] ?? calc.relatedCalculators,
  lastUpdated: calc.lastUpdated ?? '2026-06-14',
  seo: {
    ...calc.seo,
    intro: calc.seo.intro ?? introMap[calc.slug],
  },
}));

export function getCalculatorBySlug(slug: string): CalculatorConfig | undefined {
  return calculatorRegistry.find((c) => c.slug === slug);
}

export function getCalculatorsByCategory(category: string): CalculatorConfig[] {
  return calculatorRegistry.filter((c) => c.category === category);
}

export function getRelatedCalculators(slugs: string[]): CalculatorConfig[] {
  return slugs
    .map((slug) => getCalculatorBySlug(slug))
    .filter((c): c is CalculatorConfig => c !== undefined);
}

export function getAllCalculatorSlugs(): string[] {
  return calculatorRegistry.map((c) => c.slug);
}

export function getFeaturedCalculators(limit = 6): CalculatorConfig[] {
  return calculatorRegistry.slice(0, limit);
}
