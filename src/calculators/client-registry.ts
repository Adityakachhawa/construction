import type { CalculatorConfig, CalculatorInputMap, CalculatorOutputMap, UnitSystem } from './_types';
import { concreteSlab } from './concrete-slab';
import { gravelCalculator } from './gravel-calculator';
import { mulchCalculator } from './mulch-calculator';
import { sandCalculator } from './sand-calculator';
import { fencePostCalculator } from './fence-post-calculator';
import { deckFootingCalculator } from './deck-footing-calculator';
import { retainingWallCalculator } from './retaining-wall-calculator';
import { paverBaseCalculator } from './paver-base-calculator';
import { rebarCalculator } from './rebar-calculator';
import { drywallCalculator } from './drywall-calculator';
import { asphaltCalculator } from './asphalt-calculator';
import { flooringCalculator } from './flooring-calculator';
import { concreteColumnCalculator } from './concrete-column-calculator';
import { topsoilCalculator } from './topsoil-calculator';
import { aggregateCalculator } from './aggregate-calculator';
import { concreteBlockCalculator } from './concrete-block-calculator';
import { concreteDrivewayCalculator } from './concrete-driveway-calculator';
import { concreteFootingCalculator } from './concrete-footing-calculator';
import { plywoodCalculator } from './plywood-calculator';
import { studCalculator } from './stud-calculator';
import { roofPitchCalculator } from './roof-pitch-calculator';
import { roofingCalculator } from './roofing-calculator';
import { rafterCalculator } from './rafter-calculator';
import { metalRoofingCalculator } from './metal-roofing-calculator';
import { lumberCalculator } from './lumber-calculator';
import { stairCalculator } from './stair-calculator';
import { sidingCalculator } from './siding-calculator';
import { boardFootCalculator } from './board-foot-calculator';
import { excavationCalculator } from './excavation-calculator';
import { squareFootageCalculator } from './square-footage-calculator';
import { frenchDrainCalculator } from './french-drain-calculator';
import { concreteBagsCalculator } from './concrete-bags-calculator';
import { insulationCalculator } from './insulation-calculator';
import { mortarCalculator } from './mortar-calculator';
import { groutCalculator } from './grout-calculator';
import { postHoleCalculator } from './post-hole-calculator';
import { concreteSlabRebarCalculator } from './concrete-slab-rebar-calculator';

export type FormulaFn = (
  inputs: CalculatorInputMap,
  unitSystem: UnitSystem
) => CalculatorOutputMap;

// Single source of truth — every calculator config that ships a formula.
// The formula registry is derived from this array so it can never drift out
// of sync with the page registry the way two hand-maintained lists would.
const all: CalculatorConfig[] = [
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
  concreteSlabRebarCalculator,
];

export const formulaRegistry: Record<string, FormulaFn> = Object.fromEntries(
  all.map((calc) => [calc.slug, calc.formula])
);
