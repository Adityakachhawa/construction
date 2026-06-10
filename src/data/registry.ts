import type { CalculatorConfig } from '../calculators/_types';

// Import calculator configs here as they are built:
// import { concreteSlab } from './calculators/concrete-slab';

export const calculatorRegistry: CalculatorConfig[] = [
  // calculators will be registered here
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
