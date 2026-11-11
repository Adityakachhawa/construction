import type { CalculatorInputMap, CalculatorOutputMap, UnitSystem } from './_types';
import { formula as concreteSlab } from './concrete-slab';
import { formula as gravelCalculator } from './gravel-calculator';
import { formula as mulchCalculator } from './mulch-calculator';
import { formula as sandCalculator } from './sand-calculator';
import { formula as fencePostCalculator } from './fence-post-calculator';
import { formula as deckFootingCalculator } from './deck-footing-calculator';
import { formula as retainingWallCalculator } from './retaining-wall-calculator';
import { formula as paverBaseCalculator } from './paver-base-calculator';
import { formula as rebarCalculator } from './rebar-calculator';
import { formula as drywallCalculator } from './drywall-calculator';
import { formula as asphaltCalculator } from './asphalt-calculator';
import { formula as flooringCalculator } from './flooring-calculator';
import { formula as concreteColumnCalculator } from './concrete-column-calculator';
import { formula as topsoilCalculator } from './topsoil-calculator';
import { formula as aggregateCalculator } from './aggregate-calculator';
import { formula as concreteBlockCalculator } from './concrete-block-calculator';
import { formula as concreteDrivewayCalculator } from './concrete-driveway-calculator';
import { formula as concreteFootingCalculator } from './concrete-footing-calculator';
import { formula as plywoodCalculator } from './plywood-calculator';
import { formula as studCalculator } from './stud-calculator';
import { formula as roofPitchCalculator } from './roof-pitch-calculator';
import { formula as roofingCalculator } from './roofing-calculator';
import { formula as rafterCalculator } from './rafter-calculator';
import { formula as metalRoofingCalculator } from './metal-roofing-calculator';
import { formula as lumberCalculator } from './lumber-calculator';
import { formula as stairCalculator } from './stair-calculator';
import { formula as sidingCalculator } from './siding-calculator';
import { formula as boardFootCalculator } from './board-foot-calculator';
import { formula as excavationCalculator } from './excavation-calculator';
import { formula as squareFootageCalculator } from './square-footage-calculator';
import { formula as frenchDrainCalculator } from './french-drain-calculator';
import { formula as concreteBagsCalculator } from './concrete-bags-calculator';
import { formula as insulationCalculator } from './insulation-calculator';
import { formula as mortarCalculator } from './mortar-calculator';
import { formula as groutCalculator } from './grout-calculator';
import { formula as postHoleCalculator } from './post-hole-calculator';
import { formula as concreteSlabRebarCalculator } from './concrete-slab-rebar-calculator';

export type FormulaFn = (inputs: CalculatorInputMap, unitSystem: UnitSystem) => CalculatorOutputMap;

// Import functions directly so static page content is removed from the client bundle.
// Registry parity is checked by tests/accuracy.test.ts and calculators.test.ts.
export const formulaRegistry: Record<string, FormulaFn> = {
  'concrete-slab-calculator': concreteSlab,
  'gravel-calculator': gravelCalculator,
  'mulch-calculator': mulchCalculator,
  'sand-calculator': sandCalculator,
  'fence-post-calculator': fencePostCalculator,
  'deck-footing-calculator': deckFootingCalculator,
  'retaining-wall-calculator': retainingWallCalculator,
  'paver-base-calculator': paverBaseCalculator,
  'rebar-calculator': rebarCalculator,
  'drywall-calculator': drywallCalculator,
  'asphalt-calculator': asphaltCalculator,
  'flooring-calculator': flooringCalculator,
  'concrete-column-calculator': concreteColumnCalculator,
  'topsoil-calculator': topsoilCalculator,
  'aggregate-calculator': aggregateCalculator,
  'concrete-block-calculator': concreteBlockCalculator,
  'concrete-driveway-calculator': concreteDrivewayCalculator,
  'concrete-footing-calculator': concreteFootingCalculator,
  'plywood-calculator': plywoodCalculator,
  'stud-calculator': studCalculator,
  'roof-pitch-calculator': roofPitchCalculator,
  'roofing-calculator': roofingCalculator,
  'rafter-calculator': rafterCalculator,
  'metal-roofing-calculator': metalRoofingCalculator,
  'lumber-calculator': lumberCalculator,
  'stair-calculator': stairCalculator,
  'siding-calculator': sidingCalculator,
  'board-foot-calculator': boardFootCalculator,
  'excavation-calculator': excavationCalculator,
  'square-footage-calculator': squareFootageCalculator,
  'french-drain-calculator': frenchDrainCalculator,
  'concrete-bags-calculator': concreteBagsCalculator,
  'insulation-calculator': insulationCalculator,
  'mortar-calculator': mortarCalculator,
  'grout-calculator': groutCalculator,
  'post-hole-calculator': postHoleCalculator,
  'concrete-slab-rebar-calculator': concreteSlabRebarCalculator,
};
