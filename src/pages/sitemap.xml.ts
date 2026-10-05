import type { APIRoute } from 'astro';
import { calculatorRegistry } from '../data/registry';
import { categories } from '../data/categories';
import { getCollection } from 'astro:content';

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
  // Stable date for pages without a real change date so lastmod doesn't churn every build.
  const STABLE = '2026-06-14';

  const posts = await getCollection('blog', ({ data }) => !data.draft);
  // Note: guides collection has no published items; real guide pages are hand-built routes below.

  const staticPages = [
    xmlEntry(`${SITE_URL}/`, STABLE, 'weekly', '1.0'),
    xmlEntry(`${SITE_URL}/calculators/`, STABLE, 'weekly', '0.9'),
    xmlEntry(`${SITE_URL}/blog/`, STABLE, 'weekly', '0.7'),
    xmlEntry(`${SITE_URL}/about/`, STABLE, 'monthly', '0.5'),
    xmlEntry(`${SITE_URL}/methodology/`, STABLE, 'monthly', '0.6'),
    xmlEntry(`${SITE_URL}/contact/`, STABLE, 'yearly', '0.4'),
    xmlEntry(`${SITE_URL}/privacy/`, STABLE, 'yearly', '0.3'),
  ];

  // Methodology child pages — each has a real .astro route under src/pages/methodology/.
  const methodologyPages = [
    xmlEntry(`${SITE_URL}/methodology/concrete/`, STABLE, 'monthly', '0.6'),
    xmlEntry(`${SITE_URL}/methodology/excavation/`, STABLE, 'monthly', '0.6'),
    xmlEntry(`${SITE_URL}/methodology/framing/`, STABLE, 'monthly', '0.6'),
    xmlEntry(`${SITE_URL}/methodology/masonry/`, STABLE, 'monthly', '0.6'),
    xmlEntry(`${SITE_URL}/methodology/roofing/`, STABLE, 'monthly', '0.6'),
  ];

  // Real hand-built guide pages under src/pages/guides/ (not collection-driven).
  // publishedAt sourced from each page's buildArticleMeta call (2026-06-01).
  const GUIDE_DATE = '2026-06-01';
  const guidePages = [
    xmlEntry(`${SITE_URL}/guides/`, STABLE, 'monthly', '0.7'),
    xmlEntry(`${SITE_URL}/guides/frost-depth/`, GUIDE_DATE, 'monthly', '0.6'),
    xmlEntry(`${SITE_URL}/guides/compare-concrete-mixes/`, GUIDE_DATE, 'monthly', '0.6'),
  ];

  const calculatorPages = calculatorRegistry.map((calc) =>
    xmlEntry(`${SITE_URL}/calculators/${calc.slug}/`, calc.lastUpdated ?? STABLE, 'monthly', '0.9')
  );

  const categoryPages = categories.map((cat) =>
    xmlEntry(`${SITE_URL}/category/${cat.slug}/`, STABLE, 'weekly', '0.8')
  );

  const blogPages = posts.map((post) => {
    const slug = post.id.replace(/\.[^.]+$/, '');
    const lastmod = (post.data.updatedAt ?? post.data.publishedAt ?? STABLE) as string;
    return xmlEntry(`${SITE_URL}/blog/${slug}/`, lastmod, 'weekly', '0.7');
  });

  // Blog tag pages (/blog/tag/*) are intentionally excluded from the sitemap.
  // They are noindex,follow navigation pages and should not be submitted to Google.

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${[...staticPages, ...methodologyPages, ...guidePages, ...calculatorPages, ...categoryPages, ...blogPages].join('\n')}
</urlset>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};