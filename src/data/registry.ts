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
