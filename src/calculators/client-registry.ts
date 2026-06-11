import type { CalculatorInputMap, CalculatorOutputMap, UnitSystem } from './_types';
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

export type FormulaFn = (
  inputs: CalculatorInputMap,
  unitSystem: UnitSystem
) => CalculatorOutputMap;

export const formulaRegistry: Record<string, FormulaFn> = {
  [concreteSlab.slug]: concreteSlab.formula,
  [gravelCalculator.slug]: gravelCalculator.formula,
  [mulchCalculator.slug]: mulchCalculator.formula,
  [sandCalculator.slug]: sandCalculator.formula,
  [fencePostCalculator.slug]: fencePostCalculator.formula,
  [deckFootingCalculator.slug]: deckFootingCalculator.formula,
  [retainingWallCalculator.slug]: retainingWallCalculator.formula,
  [paverBaseCalculator.slug]: paverBaseCalculator.formula,
  [rebarCalculator.slug]: rebarCalculator.formula,
  [drywallCalculator.slug]: drywallCalculator.formula,
  [asphaltCalculator.slug]: asphaltCalculator.formula,
  [flooringCalculator.slug]: flooringCalculator.formula,
  [concreteColumnCalculator.slug]: concreteColumnCalculator.formula,
  [topsoilCalculator.slug]: topsoilCalculator.formula,
  [aggregateCalculator.slug]: aggregateCalculator.formula,
};
