import type { APIRoute } from 'astro';
import { calculatorRegistry } from '../data/registry';
import { categories } from '../data/categories';
import { getCollection } from 'astro:content';

const SITE_URL = 'https://constructcalc.com';

function xmlEntry(url: string, lastmod: string, changefreq: string, priority: string) {
  return `  <url>
    <loc>${url}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
}

export const GET: APIRoute = async () => {
  const today = new Date().toISOString().split('T')[0];
  // Stable date for pages without a real change date, so lastmod doesn't churn every build.
  const STABLE = '2026-06-14';

  const posts = await getCollection('blog', ({ data }) => !data.draft);
  const guides = await getCollection('guides', ({ data }) => !data.draft);

  const staticPages = [
    xmlEntry(`${SITE_URL}/`, today, 'weekly', '1.0'),
    xmlEntry(`${SITE_URL}/calculators/`, today, 'weekly', '0.9'),
    xmlEntry(`${SITE_URL}/blog/`, today, 'weekly', '0.7'),
    xmlEntry(`${SITE_URL}/about/`, STABLE, 'monthly', '0.5'),
    xmlEntry(`${SITE_URL}/methodology/`, STABLE, 'monthly', '0.6'),
    xmlEntry(`${SITE_URL}/contact/`, STABLE, 'yearly', '0.4'),
    xmlEntry(`${SITE_URL}/privacy/`, STABLE, 'yearly', '0.3'),
  ];
  // Only advertise /guides/ when at least one published guide exists.
  if (guides.length > 0) {
    staticPages.push(xmlEntry(`${SITE_URL}/guides/`, today, 'weekly', '0.7'));
  }

  const calculatorPages = calculatorRegistry.map((calc) =>
    xmlEntry(`${SITE_URL}/calculators/${calc.slug}/`, calc.lastUpdated ?? STABLE, 'monthly', '0.9')
  );

  const categoryPages = categories.map((cat) =>
    xmlEntry(`${SITE_URL}/category/${cat.slug}/`, STABLE, 'weekly', '0.8')
  );

  const blogPages = posts.map((post) => {
    const slug = post.id.replace(/\.[^.]+$/, '');
    const lastmod = (post.data.updatedAt ?? post.data.publishedAt ?? today) as string;
    return xmlEntry(`${SITE_URL}/blog/${slug}/`, lastmod, 'weekly', '0.7');
  });

  // Blog tag pages — unique tags across all published posts (mirrors blog/tag/[tag] route).
  const tags = [...new Set(posts.flatMap((p) => (p.data.tags as string[]) ?? []))];
  const tagPages = tags.map((tag) =>
    xmlEntry(`${SITE_URL}/blog/tag/${tag}/`, today, 'weekly', '0.5')
  );

  const guidePages = guides.map((guide) => {
    const slug = guide.id.replace(/\.[^.]+$/, '');
    const lastmod = (guide.data.updatedAt ?? guide.data.publishedAt ?? today) as string;
    return xmlEntry(`${SITE_URL}/guides/${slug}/`, lastmod, 'monthly', '0.6');
  });

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${[...staticPages, ...calculatorPages, ...categoryPages, ...blogPages, ...tagPages, ...guidePages].join('\n')}
</urlset>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};
