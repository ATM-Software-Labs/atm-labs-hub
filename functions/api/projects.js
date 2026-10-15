/**
 * GET /api/projects
 * Curated directory from data/services.json.
 * Repository URLs are emitted only when that file marks the repo public
 * and the custom domain was confirmed in the repo's own deploy config.
 */

import catalog from '../../data/services.json';

const HIDDEN = new Set(['neurolock', 'manual-de-bloqueo', 'rocky-setter']);

function repoUrl(item) {
  if (!item || item.repoPublic !== true || !item.repo) return '';
  return 'https://github.com/ATM-Software-Labs/' + item.repo;
}

function polish(item) {
  if (!item || HIDDEN.has(item.id)) return null;
  const domain = item.host || '';
  return {
    id: item.id,
    title: item.title,
    description: item.desc && item.desc.es ? item.desc.es : '',
    url: item.url,
    domain: domain,
    alt: '',
    category: item.category,
    keywords: item.keywords || item.id,
    stack: item.stack || [],
    cta: 'Abrir',
    repo: repoUrl(item),
    linkable: item.linkable !== false,
    probe: item.probe === true,
    subdomain: item.subdomain || '',
    featured: true,
    rank: typeof item.rank === 'number' ? item.rank : 100,
    source: 'catalog'
  };
}

function byRank(a, b) {
  return a.rank - b.rank;
}

function fallbackCatalog() {
  return (catalog.services || []).map(polish).filter(Boolean).sort(byRank);
}

function jsonResponse(body, status) {
  return new Response(JSON.stringify(body), {
    status: status || 200,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800',
      'Access-Control-Allow-Origin': 'https://labs.trujillomingorance.com'
    }
  });
}

export async function onRequestGet(context) {
  const { request } = context;
  const cache = caches.default;
  const cacheKey = new Request(new URL(request.url), { method: 'GET' });

  const cached = await cache.match(cacheKey);
  if (cached) return cached;

  const projects = fallbackCatalog();
  const response = jsonResponse({
    success: true,
    source: 'catalog',
    count: projects.length,
    projects
  });

  context.waitUntil(cache.put(cacheKey, response.clone()));
  return response;
}

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': 'https://labs.trujillomingorance.com',
      'Access-Control-Allow-Methods': 'GET, OPTIONS'
    }
  });
}
