export const METHODOLOGY_SLUGS = ['concrete', 'framing', 'roofing', 'excavation', 'masonry'] as const;
export type MethodologySlug = (typeof METHODOLOGY_SLUGS)[number];

export interface MethodologyPageMeta {
  slug: MethodologySlug;
  title: string;
  description: string;
  label: string;
}

export const methodologyPages: MethodologyPageMeta[] = [
  {
    slug: 'concrete',
    title: 'Concrete Calculation Methodology',
    description: 'Formulas, ACI references, waste factors, and assumptions behind BuildByMath concrete calculators.',
    label: 'Concrete Methodology',
  },
  {
    slug: 'framing',
    title: 'Framing Calculation Methodology',
    description: 'Formulas, IRC references, span tables, and assumptions behind BuildByMath framing and lumber calculators.',
    label: 'Framing Methodology',
  },
  {
    slug: 'roofing',
    title: 'Roofing Calculation Methodology',
    description: 'Formulas, slope factors, IRC R905 references, and waste assumptions behind BuildByMath roofing calculators.',
    label: 'Roofing Methodology',
  },
  {
    slug: 'excavation',
    title: 'Excavation Calculation Methodology',
    description: 'Volume formulas, bulk density assumptions, OSHA references, and compaction factors for excavation calculators.',
    label: 'Excavation Methodology',
  },
  {
    slug: 'masonry',
    title: 'Masonry Calculation Methodology',
    description: 'Formulas, TMS references, mortar joint assumptions, and waste factors for masonry calculators.',
    label: 'Masonry Methodology',
  },
];

/** Category slug → methodology slug (direct matches) */
const CATEGORY_MAP: Partial<Record<string, MethodologySlug>> = {
  concrete:  'concrete',
  framing:   'framing',
  excavation: 'excavation',
  masonry:   'masonry',
};

/** Per-calculator overrides — when the category alone isn't specific enough */
const CALC_OVERRIDE_MAP: Record<string, MethodologySlug> = {
  'roof-pitch-calculator':     'roofing',
  'roofing-calculator':        'roofing',
  'metal-roofing-calculator':  'roofing',
};

/**
 * Returns the methodology page slug for a given calculator, or null if none exists.
 * Checks per-calculator overrides first, then falls back to category mapping.
 */
export function getMethodologySlug(calcSlug: string, categorySlug: string): MethodologySlug | null {
  return CALC_OVERRIDE_MAP[calcSlug] ?? CATEGORY_MAP[categorySlug] ?? null;
}

export function getMethodologyPage(methodologySlug: MethodologySlug): MethodologyPageMeta | undefined {
  return methodologyPages.find((p) => p.slug === methodologySlug);
}
