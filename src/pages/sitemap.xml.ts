import type { APIRoute } from 'astro';
import { calculatorRegistry } from '../data/registry';
import { categories } from '../data/categories';
import { getCollection } from 'astro:content';
import { slabDimensions } from '../data/slab-dimensions';
import { gravelDimensions } from '../data/gravel-dimensions';
import { pierDimensions } from '../data/pier-dimensions';

const SITE_URL = 'https://buildbymath.com';

function xmlEntry(url: string, lastmod: string, changefreq: string, priority: string) {
  return `  <url>
    <loc>${url}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
}

export const GET: APIRoute = async () => {
  // Current build date for fresh crawl freshness
  const CURRENT_DATE = new Date().toISOString().split('T')[0];

  const posts = await getCollection('blog', ({ data }) => !data.draft);

  const staticPages = [
    xmlEntry(`${SITE_URL}/`, CURRENT_DATE, 'weekly', '1.0'),
    xmlEntry(`${SITE_URL}/calculators/`, CURRENT_DATE, 'weekly', '0.9'),
    xmlEntry(`${SITE_URL}/blog/`, CURRENT_DATE, 'weekly', '0.7'),
    xmlEntry(`${SITE_URL}/about/`, CURRENT_DATE, 'monthly', '0.5'),
    xmlEntry(`${SITE_URL}/methodology/`, CURRENT_DATE, 'monthly', '0.6'),
    xmlEntry(`${SITE_URL}/contact/`, CURRENT_DATE, 'yearly', '0.4'),
    xmlEntry(`${SITE_URL}/privacy/`, CURRENT_DATE, 'yearly', '0.3'),
  ];

  // Methodology child pages — each has a real .astro route under src/pages/methodology/.
  const methodologyPages = [
    xmlEntry(`${SITE_URL}/methodology/concrete/`, CURRENT_DATE, 'monthly', '0.6'),
    xmlEntry(`${SITE_URL}/methodology/excavation/`, CURRENT_DATE, 'monthly', '0.6'),
    xmlEntry(`${SITE_URL}/methodology/framing/`, CURRENT_DATE, 'monthly', '0.6'),
    xmlEntry(`${SITE_URL}/methodology/masonry/`, CURRENT_DATE, 'monthly', '0.6'),
    xmlEntry(`${SITE_URL}/methodology/roofing/`, CURRENT_DATE, 'monthly', '0.6'),
  ];

  // Real hand-built guide pages under src/pages/guides/ (not collection-driven).
  const guidePages = [
    xmlEntry(`${SITE_URL}/guides/`, CURRENT_DATE, 'monthly', '0.7'),
    xmlEntry(`${SITE_URL}/guides/frost-depth/`, CURRENT_DATE, 'monthly', '0.6'),
    xmlEntry(`${SITE_URL}/guides/compare-concrete-mixes/`, CURRENT_DATE, 'monthly', '0.6'),
  ];

  const calculatorPages = calculatorRegistry.map((calc) =>
    xmlEntry(`${SITE_URL}/calculators/${calc.slug}/`, calc.lastUpdated ?? CURRENT_DATE, 'monthly', '0.9')
  );

  // Programmatic exact-dimension concrete slab calculator pages (15 sizes)
  const slabSizePages = slabDimensions.map((slab) =>
    xmlEntry(
      `${SITE_URL}/calculators/concrete-slab-calculator/${slab.slug}/`,
      CURRENT_DATE,
      'monthly',
      '0.8'
    )
  );

  // Programmatic exact-dimension gravel calculator pages (12 sizes)
  const gravelSizePages = gravelDimensions.map((gravel) =>
    xmlEntry(
      `${SITE_URL}/calculators/gravel-calculator/${gravel.slug}/`,
      CURRENT_DATE,
      'monthly',
      '0.8'
    )
  );

  // Programmatic exact-diameter Sonotube / pier calculator pages (7 diameters)
  const pierSizePages = pierDimensions.map((pier) =>
    xmlEntry(
      `${SITE_URL}/calculators/concrete-column-calculator/${pier.slug}/`,
      CURRENT_DATE,
      'monthly',
      '0.8'
    )
  );

  const categoryPages = categories.map((cat) =>
    xmlEntry(`${SITE_URL}/category/${cat.slug}/`, CURRENT_DATE, 'weekly', '0.8')
  );

  const blogPages = posts.map((post) => {
    const slug = post.id.replace(/\.[^.]+$/, '');
    const lastmod = (post.data.updatedAt ?? post.data.publishedAt ?? CURRENT_DATE) as string;
    return xmlEntry(`${SITE_URL}/blog/${slug}/`, lastmod, 'weekly', '0.7');
  });

  // Blog tag pages (/blog/tag/*) are intentionally excluded from the sitemap.
  // They are noindex,follow navigation pages and should not be submitted to Google.

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${[...staticPages, ...methodologyPages, ...guidePages, ...calculatorPages, ...slabSizePages, ...gravelSizePages, ...pierSizePages, ...categoryPages, ...blogPages].join('\n')}
</urlset>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};