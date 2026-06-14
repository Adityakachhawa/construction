import { SITE_URL, SITE_NAME, DEFAULT_OG_IMAGE } from './constants';

export interface MetaProps {
  title: string;
  description: string;
  canonical: string;
  ogImage?: string;
  ogType?: 'website' | 'article';
  noindex?: boolean;
  publishedAt?: string;
  updatedAt?: string;
}

export function buildCalculatorMeta(opts: {
  title: string;
  description: string;
  slug: string;
  ogImage?: string;
}): MetaProps {
  return {
    title: `Free ${opts.title} | ${SITE_NAME}`,
    description: opts.description,
    canonical: buildCanonical(`/calculators/${opts.slug}/`),
    ogImage: opts.ogImage ?? DEFAULT_OG_IMAGE,
    ogType: 'website',
  };
}

export function buildCalculatorsIndexMeta(): MetaProps {
  return {
    title: `Free Construction Calculators — Concrete, Framing, Fencing & More | ${SITE_NAME}`,
    description:
      'Browse free construction calculators for concrete, gravel, drywall, flooring, fencing, and more. Instant material quantities and cost estimates across every trade.',
    canonical: buildCanonical('/calculators/'),
    ogImage: DEFAULT_OG_IMAGE,
    ogType: 'website',
  };
}

export function buildBlogIndexMeta(): MetaProps {
  return {
    title: `Construction Blog — Guides, Tips & Material Calculators | ${SITE_NAME}`,
    description:
      'Construction tips, material guides, cost breakdowns, and project planning advice for contractors and DIYers.',
    canonical: buildCanonical('/blog/'),
    ogImage: DEFAULT_OG_IMAGE,
    ogType: 'website',
  };
}

export function buildBlogTagMeta(tag: string, postCount: number): MetaProps {
  const label = tag.charAt(0).toUpperCase() + tag.slice(1);
  return {
    title: `${label} Articles (${postCount}) — ${SITE_NAME}`,
    description: `Browse ${postCount} construction article${postCount !== 1 ? 's' : ''} tagged "${tag}" — guides, tips, and material calculators.`,
    canonical: buildCanonical(`/blog/tag/${tag}/`),
    ogImage: DEFAULT_OG_IMAGE,
    ogType: 'website',
  };
}

export function buildArticleMeta(opts: {
  title: string;
  description: string;
  slug: string;
  section: 'blog' | 'guides';
  publishedAt?: string;
  updatedAt?: string;
  ogImage?: string;
}): MetaProps {
  return {
    title: `${opts.title} — ${SITE_NAME}`,
    description: opts.description,
    canonical: buildCanonical(`/${opts.section}/${opts.slug}/`),
    ogImage: opts.ogImage ?? DEFAULT_OG_IMAGE,
    ogType: 'article',
    publishedAt: opts.publishedAt,
    updatedAt: opts.updatedAt,
  };
}

export function buildCategoryMeta(opts: {
  name: string;
  description: string;
  slug: string;
  keywords?: string[];
  metaDescription?: string;
}): MetaProps {
  const keywordSuffix = opts.keywords?.length
    ? ` — ${opts.keywords.slice(0, 3).join(', ')}`
    : '';
  return {
    title: `Free ${opts.name} Calculators${keywordSuffix} | ${SITE_NAME}`,
    description: opts.metaDescription ?? opts.description,
    canonical: buildCanonical(`/category/${opts.slug}/`),
    ogImage: DEFAULT_OG_IMAGE,
    ogType: 'website',
  };
}

export function buildHomeMeta(): MetaProps {
  return {
    title: `Free Construction Calculators — ${SITE_NAME}`,
    description:
      'Accurate material estimates for concrete, framing, decking, fencing, and more. Free tools built for contractors and serious DIYers — no signup required.',
    canonical: buildCanonical('/'),
    ogImage: DEFAULT_OG_IMAGE,
    ogType: 'website',
  };
}

export function buildCanonical(path: string): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${SITE_URL}${normalizedPath}`;
}

export function buildPageTitle(title: string): string {
  return `${title} — ${SITE_NAME}`;
}

// Re-export for consumers that need the raw values
export { SITE_URL, SITE_NAME } from './constants';
