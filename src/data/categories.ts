export interface Category {
  slug: string;
  name: string;
  description: string;
  shortDescription: string;
  icon: string;
  color: string;
  featuredCalculators: string[];
  order: number;
}

export const categories: Category[] = [
  {
    slug: 'concrete',
    name: 'Concrete',
    shortDescription: 'Slabs, footings, columns, and mix ratios',
    description:
      'Calculate concrete volume, mix ratios, bag counts, and material costs for slabs, footings, columns, and walls.',
    icon: 'concrete',
    color: '#6b7280',
    featuredCalculators: ['concrete-slab-calculator'],
    order: 1,
  },
  {
    slug: 'decking',
    name: 'Decking',
    shortDescription: 'Footings, posts, joists, and decking boards',
    description:
      'Plan your deck project with calculators for footings, post spacing, joist spans, and total material estimates.',
    icon: 'decking',
    color: '#92400e',
    featuredCalculators: ['deck-footing-calculator'],
    order: 2,
  },
  {
    slug: 'fencing',
    name: 'Fencing',
    shortDescription: 'Post spacing, concrete, and panel counts',
    description:
      'Calculate fence post spacing, concrete needed per post, number of panels, and total material quantities.',
    icon: 'fencing',
    color: '#065f46',
    featuredCalculators: ['fence-post-calculator'],
    order: 3,
  },
  {
    slug: 'framing',
    name: 'Framing',
    shortDescription: 'Studs, headers, rafters, and beams',
    description:
      'Calculate lumber quantities for wall framing, roof rafters, floor joists, and structural headers.',
    icon: 'framing',
    color: '#7c3aed',
    featuredCalculators: [],
    order: 4,
  },
  {
    slug: 'excavation',
    name: 'Excavation',
    shortDescription: 'Dirt, gravel, and fill material volumes',
    description:
      'Calculate cut and fill volumes, gravel quantities, topsoil needs, and hauling requirements.',
    icon: 'excavation',
    color: '#b45309',
    featuredCalculators: [],
    order: 5,
  },
  {
    slug: 'masonry',
    name: 'Masonry',
    shortDescription: 'Bricks, blocks, mortar, and grout',
    description:
      'Calculate brick counts, block quantities, mortar volumes, and material costs for walls and structures.',
    icon: 'masonry',
    color: '#be185d',
    featuredCalculators: [],
    order: 6,
  },
];

export type CategorySlug = (typeof categories)[number]['slug'];

export function getCategoryBySlug(slug: string): Category | undefined {
  return categories.find((c) => c.slug === slug);
}
