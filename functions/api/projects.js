/**
 * GET /api/projects
 * Autodiscovery of Cloudflare Pages projects with Edge cache (s-maxage=3600).
 */

const ACCOUNT_ID = 'YOUR_CLOUDFLARE_ACCOUNT_ID';

const CATALOG = {
  'nutrifit': {
    id: 'nutrifit',
    title: 'NutriFit PWA',
    description: 'Salud / Visión IA',
    url: 'https://nutri.trujillomingorance.com',
    domain: 'nutri.trujillomingorance.com',
    alt: '',
    category: 'apps',
    keywords: 'nutri fitness salud pwa vision',
    stack: ['PWA', 'Visión IA'],
    cta: 'Abrir', repo: ''
  },
  'api-gateway': {
    id: 'api-gateway',
    title: 'API Gateway',
    description: 'Perímetro / Proxy Central',
    url: 'https://api.trujillomingorance.com',
    domain: 'api.trujillomingorance.com',
    alt: '',
    category: 'security',
    keywords: 'api gateway proxy perimeter',
    stack: ['Proxy Central', 'Perímetro'],
    cta: 'API', repo: ''
  },
  'focusguard': {
    id: 'focusguard',
    title: 'FocusGuard & AdShield',
    description: 'DoH Zero-Trust',
    url: 'https://focusguard.trujillomingorance.com',
    domain: 'focusguard.trujillomingorance.com',
    alt: '',
    category: 'security',
    keywords: 'focusguard adshield dns zero-trust',
    stack: ['Zero-Trust', 'DoH'],
    cta: 'Abrir', repo: 'https://github.com/ATM-Software-Labs/focusguard-saas'
  },
  'invest-platform': {
    id: 'invest-platform',
    title: 'INVEST Terminal',
    description: 'Fintech Cuantitativa',
    url: 'https://invest.trujillomingorance.com',
    domain: 'invest.trujillomingorance.com',
    alt: '',
    category: 'finance',
    keywords: 'invest cuantitativa fintech',
    stack: ['Fintech', 'Scoring'],
    cta: 'Abrir', repo: 'https://github.com/ATM-Software-Labs/invest-platform'
  },
  'rewrite-ai': {
    id: 'rewrite-ai',
    title: 'Rewrite AI',
    description: 'NLP / Groq LPU',
    url: 'https://rewrite.trujillomingorance.com',
    domain: 'rewrite.trujillomingorance.com',
    alt: '',
    category: 'ai',
    keywords: 'rewrite nlp groq lpu',
    stack: ['Groq LPU', 'NLP'],
    cta: 'Abrir', repo: 'https://github.com/ATM-Software-Labs/rewrite-ai'
  },
  'trujillo-ai-studio': {
    id: 'trujillo-ai-studio',
    title: 'Trujillo AI Studio',
    description: 'Multimodal LPU',
    url: 'https://ai.trujillomingorance.com',
    domain: 'ai.trujillomingorance.com',
    alt: '',
    category: 'ai',
    keywords: 'ia ai groq studio multimodal',
    stack: ['Multimodal', 'LPU'],
    cta: 'Abrir', repo: 'https://github.com/ATM-Software-Labs/trujillo-ai-studio'
  },
  'trujillo-guides': {
    id: 'trujillo-guides',
    title: 'Engineering Guides',
    description: 'Runbooks DevOps',
    url: 'https://guides.trujillomingorance.com',
    domain: 'guides.trujillomingorance.com',
    alt: '',
    category: 'engineering',
    keywords: 'guias guides runbooks devops',
    stack: ['DevOps', 'Runbooks'],
    cta: 'Abrir', repo: 'https://github.com/ATM-Software-Labs/trujillo-guides'
  },
  'savings-runway': {
    id: 'savings-runway',
    title: 'Savings & Runway',
    description: 'Finanzas Zero-Knowledge',
    url: 'https://savings.trujillomingorance.com',
    domain: 'savings.trujillomingorance.com',
    alt: '',
    category: 'finance',
    keywords: 'savings finanzas zero-knowledge',
    stack: ['ZK', 'Finanzas'],
    cta: 'Abrir', repo: 'https://github.com/ATM-Software-Labs/savings-runway'
  },
  'atm-tools': {
    id: 'atm-tools',
    title: 'ATM Tools',
    description: 'Utilidades Web',
    url: 'https://tools.trujillomingorance.com',
    domain: 'tools.trujillomingorance.com',
    alt: '',
    category: 'engineering',
    keywords: 'tools herramientas utilities',
    stack: ['Utilities', 'Web'],
    cta: 'Abrir', repo: 'https://github.com/ATM-Software-Labs/atm-tools'
  },
  'alberto-portfolio': {
    id: 'alberto-portfolio',
    title: 'Portfolio Profesional',
    description: 'SysAdmin & Security',
    url: 'https://alberto.trujillomingorance.com',
    domain: 'alberto.trujillomingorance.com',
    alt: '',
    category: 'engineering',
    keywords: 'portfolio alberto sysadmin security',
    stack: ['SysAdmin', 'Security'],
    cta: 'Abrir', repo: 'https://github.com/ATM-Software-Labs/portfolio'
  }
};
const HIDDEN = new Set(['neurolock', 'manual-de-bloqueo', 'domain-root', 'rocky-setter', 'atm-labs-hub']);
const FEATURED_ORDER = [
  'alberto-portfolio', 'api-gateway', 'trujillo-ai-studio', 'rewrite-ai', 
  'invest-platform', 'savings-runway', 'focusguard', 'trujillo-guides', 
  'atm-tools', 'nutrifit'
];


function ownHost(value) {
  if (!value) return '';
  const host = String(value).replace(/^https?:\/\//i, '').split('/')[0].toLowerCase();
  if (!host || host.includes('pages.dev') || /\.dev$/i.test(host)) return '';
  if (host === 'trujillomingorance.com' || host.endsWith('.trujillomingorance.com')) return host;
  return '';
}

function pickCustomDomain(project) {
  const domains = Array.isArray(project.domains) ? project.domains : [];
  for (const d of domains) {
    const host = ownHost(d);
    if (host) return host;
  }
  return '';
}

function rankOf(id) {
  const index = FEATURED_ORDER.indexOf(id);
  return index === -1 ? 100 : index;
}

function polish(item) {
  if (!item || HIDDEN.has(item.id)) return null;
  const domain = ownHost(item.domain || item.url);
  if (!domain) return null;
  
  const rank = rankOf(item.id);
  return Object.assign({}, item, {
    domain,
    url: item.url && ownHost(item.url) ? item.url : ('https://' + domain),
    alt: '',
    featured: rank < 100 || !!item.featured,
    rank
  });
}

function byRank(a, b) {
  const ra = typeof a.rank === 'number' ? a.rank : 100;
  const rb = typeof b.rank === 'number' ? b.rank : 100;
  return ra - rb;
}

function mergeProject(cfProject) {
  const name = cfProject.name || '';
  if (HIDDEN.has(name)) return null;
  const known = CATALOG[name] || {};
  const domain = ownHost(known.domain) || pickCustomDomain(cfProject);
  if (!domain) return null;
  return polish({
    id: name,
    title: known.title || name,
    description: known.description || 'Servicio del ecosistema trujillomingorance.com.',
    url: known.url || ('https://' + domain),
    domain,
    alt: '',
    featured: FEATURED_ORDER.indexOf(name) !== -1 || !!known.featured,
    category: known.category || 'apps',
    keywords: known.keywords || name,
    stack: known.stack || ['Cloudflare Pages'],
    cta: known.cta || 'Abrir',
    current: !!known.current,
    source: 'cloudflare'
  });
}

function fallbackCatalog() {
  return Object.values(CATALOG).map(polish).filter(Boolean).map(function (item) {
    return Object.assign({ source: 'fallback' }, item);
  }).sort(byRank);
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
  const { request, env } = context;
  const cache = caches.default;
  const cacheKey = new Request(new URL(request.url), { method: 'GET' });

  const cached = await cache.match(cacheKey);
  if (cached) return cached;

  const projects = fallbackCatalog();
  const source = 'catalog';

  const response = jsonResponse({
    success: true,
    source,
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










