import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const calculatorsCollection = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/calculators' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    category: z.string(),
    lastUpdated: z.string(),
    featured: z.boolean().default(false),
    difficulty: z.enum(['beginner', 'intermediate', 'advanced']).default('beginner'),
    faqCount: z.number().int().min(0).default(0),
  }),
});

const blogCollection = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    publishedAt: z.string(),
    updatedAt: z.string().optional(),
    author: z.string().default('ConstructCalc Team'),
    tags: z.array(z.string()).default([]),
    featuredImage: z.string().optional(),
    relatedCalculators: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
  }),
});

const guidesCollection = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/guides' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    publishedAt: z.string(),
    updatedAt: z.string().optional(),
    author: z.string().default('ConstructCalc Team'),
    tags: z.array(z.string()).default([]),
    featuredImage: z.string().optional(),
    relatedCalculators: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
    readingTime: z.number().optional(),
  }),
});

const categoriesCollection = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/categories' }),
  schema: z.object({
    slug: z.string(),
    name: z.string(),
    description: z.string(),
    icon: z.string(),
    featuredCalculators: z.array(z.string()).default([]),
    order: z.number().int().default(99),
  }),
});

export const collections = {
  calculators: calculatorsCollection,
  blog: blogCollection,
  guides: guidesCollection,
  categories: categoriesCollection,
};
