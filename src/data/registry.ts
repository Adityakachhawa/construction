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

export const calculatorRegistry: CalculatorConfig[] = [
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
];

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
