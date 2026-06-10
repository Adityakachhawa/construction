import type { APIRoute } from 'astro';
import { calculatorRegistry } from '../data/registry';
import { categories } from '../data/categories';

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

  const staticPages = [
    xmlEntry(`${SITE_URL}/`, today, 'weekly', '1.0'),
    xmlEntry(`${SITE_URL}/calculators/`, today, 'weekly', '0.9'),
    xmlEntry(`${SITE_URL}/blog/`, today, 'weekly', '0.7'),
    xmlEntry(`${SITE_URL}/guides/`, today, 'weekly', '0.7'),
  ];

  const calculatorPages = calculatorRegistry.map((calc) =>
    xmlEntry(`${SITE_URL}/calculators/${calc.slug}/`, today, 'monthly', '0.9')
  );

  const categoryPages = categories.map((cat) =>
    xmlEntry(`${SITE_URL}/category/${cat.slug}/`, today, 'weekly', '0.8')
  );

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${[...staticPages, ...calculatorPages, ...categoryPages].join('\n')}
</urlset>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};
