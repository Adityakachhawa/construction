import { SITE_URL, SITE_NAME } from './constants';

const ORGANIZATION_NAME = SITE_NAME;

export interface BreadcrumbItem {
  name: string;
  href: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export function buildOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: ORGANIZATION_NAME,
    url: SITE_URL,
    logo: {
      '@type': 'ImageObject',
      url: `${SITE_URL}/favicon.svg`,
    },
  };
}

export function buildWebSiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: SITE_URL,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/calculators/?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

export function buildWebAppSchema(opts: {
  name: string;
  description: string;
  url: string;
  appType: string;
  features: string[];
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: opts.name,
    description: opts.description,
    url: opts.url,
    applicationCategory: 'UtilitiesApplication',
    applicationSubCategory: opts.appType,
    isAccessibleForFree: true,
    operatingSystem: 'Web Browser',
    featureList: opts.features,
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    provider: buildOrganizationSchema(),
  };
}

export function buildArticleSchema(opts: {
  title: string;
  description: string;
  url: string;
  imageUrl: string;
  publishedAt: string;
  updatedAt?: string;
  authorName?: string;
  type?: 'Article' | 'TechArticle';
}) {
  return {
    '@context': 'https://schema.org',
    '@type': opts.type ?? 'Article',
    headline: opts.title,
    description: opts.description,
    url: opts.url,
    image: {
      '@type': 'ImageObject',
      url: opts.imageUrl,
    },
    datePublished: opts.publishedAt,
    dateModified: opts.updatedAt ?? opts.publishedAt,
    author: {
      '@type': 'Person',
      name: opts.authorName ?? 'ConstructCalc Team',
    },
    publisher: {
      '@type': 'Organization',
      name: ORGANIZATION_NAME,
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_URL}/favicon.svg`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': opts.url,
    },
  };
}

export function buildBreadcrumbList(items: BreadcrumbItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.href.startsWith('http') ? item.href : `${SITE_URL}${item.href}`,
    })),
  };
}

export function buildFaqSchema(items: FaqItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };
}

function stripMarkdown(text: string): string {
  return text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/_([^_]+)_/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .trim();
}

export function parseFaqFromMarkdown(body: string): FaqItem[] {
  const faqMarker = '## Frequently Asked Questions';
  const faqStart = body.indexOf(faqMarker);
  if (faqStart === -1) return [];

  let faqSection = body.slice(faqStart + faqMarker.length);

  // Stop before the --- separator (methodology link we append)
  const separatorIdx = faqSection.indexOf('\n---');
  if (separatorIdx !== -1) {
    faqSection = faqSection.slice(0, separatorIdx);
  }

  const items: FaqItem[] = [];
  const blocks = faqSection.split(/\n(?=\*\*)/);

  for (const block of blocks) {
    const qMatch = block.match(/^\*\*([^*]+)\*\*\s*\n([\s\S]+)/);
    if (!qMatch) continue;
    const question = qMatch[1].trim();
    const answer = stripMarkdown(qMatch[2].trim());
    if (question && answer) {
      items.push({ question, answer });
    }
  }

  return items;
}

export function buildCollectionPageSchema(opts: {
  name: string;
  description: string;
  url: string;
  parts?: Array<{ name: string; url: string; description?: string }>;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: opts.name,
    description: opts.description,
    url: opts.url,
    isPartOf: {
      '@type': 'WebSite',
      name: SITE_NAME,
      url: SITE_URL,
    },
    ...(opts.parts?.length ? {
      hasPart: opts.parts.map(p => ({
        '@type': 'WebApplication',
        name: p.name,
        url: p.url,
        ...(p.description ? { description: p.description } : {}),
        applicationCategory: 'UtilitiesApplication',
        isAccessibleForFree: true,
      })),
    } : {}),
  };
}
