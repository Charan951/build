import { next } from '@vercel/edge';

/**
 * This is a client-only SPA with no server-side rendering, so real
 * per-page <title>/description/OG/canonical tags only ever exist after
 * React (via react-helmet-async in SEOHead) mutates document.head at
 * runtime. Google renders JS before indexing, so it likely sees them -
 * but social-link-preview crawlers (Facebook, Twitter/X, LinkedIn,
 * WhatsApp, Slack, Telegram, Discord) never execute JS at all, so every
 * shared link on this site showed the same generic homepage preview with
 * no image. This middleware intercepts only requests from those bots and
 * returns a minimal, correctly-tagged HTML document instead of the SPA
 * shell - real visitors are completely unaffected (next() passes them
 * straight through to the normal app).
 */

export const config = {
  matcher: '/((?!assets/|favicon\\.ico|favicon\\.svg|logo\\.svg|robots\\.txt|sitemap\\.xml|.*\\.[\\w]+$).*)',
};

const BOT_REGEX =
  /bot|crawl|spider|slurp|facebookexternalhit|twitterbot|linkedinbot|whatsapp|telegrambot|discordbot|slackbot|pinterest|redditbot|applebot|embedly|quora link preview|skypeuripreview|vkshare|w3c_validator/i;

const API_BASE = 'https://build-4tdz.onrender.com/api/v1';
const SITE_URL = 'https://www.buildyourthougths.in';
const SITE_NAME = 'Build Your Thoughts';
const DEFAULT_DESCRIPTION =
  'Build enterprise software, mobile apps, AI solutions, and scalable digital products with Build Your Thoughts.';
const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80';

interface PageMeta {
  title: string;
  description: string;
  image: string;
  schema?: object;
}

const breadcrumb = (section: { name: string; path: string }, current: { name: string; url: string }) => ({
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL + '/' },
    { '@type': 'ListItem', position: 2, name: section.name, item: SITE_URL + section.path },
    { '@type': 'ListItem', position: 3, name: current.name, item: current.url },
  ],
});

const STATIC_PAGES: Record<string, Omit<PageMeta, 'image'>> = {
  '/': { title: 'Build Your Thoughts | Enterprise Software & AI Solutions Agency', description: DEFAULT_DESCRIPTION },
  '/about': { title: "About Build Your Thoughts | India's Premium Digital Engineering", description: DEFAULT_DESCRIPTION },
  '/services': { title: 'Services & Capabilities | Build Your Thoughts', description: DEFAULT_DESCRIPTION },
  '/projects': { title: 'Featured Projects | Build Your Thoughts', description: DEFAULT_DESCRIPTION },
  '/blogs': { title: 'Technical Blog & Articles | Build Your Thoughts', description: DEFAULT_DESCRIPTION },
  '/contact': { title: 'Contact & Consultation | Build Your Thoughts', description: DEFAULT_DESCRIPTION },
};

const escapeHtml = (value: string): string =>
  String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

async function fetchJson(url: string): Promise<any | null> {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(4000) });
    if (!res.ok) return null;
    const body = await res.json();
    return body?.data ?? null;
  } catch {
    return null;
  }
}

async function resolveMeta(pathname: string): Promise<PageMeta | null> {
  const staticPage = STATIC_PAGES[pathname];
  if (staticPage) return { ...staticPage, image: DEFAULT_IMAGE };

  const serviceMatch = pathname.match(/^\/services\/([^/]+)\/?$/);
  if (serviceMatch) {
    const data = await fetchJson(`${API_BASE}/services/${serviceMatch[1]}`);
    if (data) {
      const url = `${SITE_URL}${pathname}`;
      return {
        title: `${data.title} | ${SITE_NAME}`,
        description: data.shortDescription || DEFAULT_DESCRIPTION,
        image: DEFAULT_IMAGE,
        schema: {
          '@context': 'https://schema.org',
          '@graph': [
            {
              '@type': 'Service',
              name: data.title,
              description: data.shortDescription || data.fullDescription,
              provider: { '@type': 'Organization', name: SITE_NAME, url: SITE_URL },
              areaServed: 'Global',
            },
            breadcrumb({ name: 'Services', path: '/services' }, { name: data.title, url }),
          ],
        },
      };
    }
  }

  const projectMatch = pathname.match(/^\/projects\/([^/]+)\/?$/);
  if (projectMatch) {
    const data = await fetchJson(`${API_BASE}/projects/${projectMatch[1]}`);
    if (data) {
      const url = `${SITE_URL}${pathname}`;
      return {
        title: `${data.title} | ${SITE_NAME}`,
        description: data.summary || DEFAULT_DESCRIPTION,
        image: data.heroImage || DEFAULT_IMAGE,
        schema: {
          '@context': 'https://schema.org',
          '@graph': [
            {
              '@type': 'CreativeWork',
              name: data.title,
              description: data.summary,
              image: data.heroImage,
              creator: { '@type': 'Organization', name: SITE_NAME, url: SITE_URL },
              about: data.industry,
              genre: data.category,
            },
            breadcrumb({ name: 'Projects', path: '/projects' }, { name: data.title, url }),
          ],
        },
      };
    }
  }

  const blogMatch = pathname.match(/^\/blogs\/([^/]+)\/?$/);
  if (blogMatch) {
    const data = await fetchJson(`${API_BASE}/blogs/${blogMatch[1]}`);
    if (data) {
      const url = `${SITE_URL}${pathname}`;
      return {
        title: data.seoTitle || `${data.title} | ${SITE_NAME}`,
        description: data.seoDescription || data.excerpt || DEFAULT_DESCRIPTION,
        image: data.coverImage || DEFAULT_IMAGE,
        schema: {
          '@context': 'https://schema.org',
          '@graph': [
            {
              '@type': 'BlogPosting',
              headline: data.title,
              description: data.seoDescription || data.excerpt,
              image: data.coverImage,
              datePublished: data.publishedAt || data.createdAt,
              dateModified: data.updatedAt || data.publishedAt || data.createdAt,
              author: { '@type': 'Person', name: data.author?.name || SITE_NAME },
              publisher: {
                '@type': 'Organization',
                name: SITE_NAME,
                logo: { '@type': 'ImageObject', url: `${SITE_URL}/logo.svg` },
              },
              mainEntityOfPage: { '@type': 'WebPage', '@id': url },
            },
            breadcrumb({ name: 'Blog', path: '/blogs' }, { name: data.title, url }),
          ],
        },
      };
    }
  }

  return null;
}

const renderHtml = (meta: PageMeta, url: string): string => {
  const title = escapeHtml(meta.title);
  const description = escapeHtml(meta.description);
  const schemaScript = meta.schema
    ? `<script type="application/ld+json">${JSON.stringify(meta.schema).replace(/</g, '\\u003c')}</script>`
    : '';
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<title>${title}</title>
<meta name="description" content="${description}" />
<link rel="canonical" href="${url}" />
<meta property="og:site_name" content="${SITE_NAME}" />
<meta property="og:type" content="website" />
<meta property="og:title" content="${title}" />
<meta property="og:description" content="${description}" />
<meta property="og:image" content="${meta.image}" />
<meta property="og:url" content="${url}" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${title}" />
<meta name="twitter:description" content="${description}" />
<meta name="twitter:image" content="${meta.image}" />
${schemaScript}
</head>
<body></body>
</html>`;
};

export default async function middleware(request: Request) {
  const userAgent = request.headers.get('user-agent') || '';
  if (!BOT_REGEX.test(userAgent)) return next();

  const url = new URL(request.url);
  const meta = await resolveMeta(url.pathname);
  if (!meta) return next();

  return new Response(renderHtml(meta, `${SITE_URL}${url.pathname}`), {
    status: 200,
    headers: { 'content-type': 'text/html; charset=utf-8' },
  });
}
