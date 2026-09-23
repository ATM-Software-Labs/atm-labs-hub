/**
 * GET /api/projects
 * Autodiscovery of Cloudflare Pages projects with Edge cache (s-maxage=3600).
 */

const ACCOUNT_ID = '9c48e0ad7e36cf970f20839768fe8a64';

const CATALOG = {
  'trujillo-ai-studio': {
    id: 'trujillo-ai-studio',
    title: 'Trujillo AI Studio',
    description: 'Asistente multimodal de ultra-alta velocidad en Groq LPU. Visión, razonamiento de código y streaming en el Edge.',
    url: 'https://ai.trujillomingorance.com',
    domain: 'ai.trujillomingorance.com',
    alt: '',
    featured: false,
    category: 'ai',
    keywords: 'ia ai groq qwen vision chatbot studio multimodal',
    stack: ['Groq LPU', 'Qwen Vision', 'Cloudflare Worker'],
    cta: 'Abrir IA', repo: 'https://github.com/ATM-Software-Labs/trujillo-ai-studio'
  },
  'rewrite-ai': {
    id: 'rewrite-ai',
    title: 'Rewrite AI',
    description: 'Humanizador de texto 99.9% humano y corrector editorial. Proxy streaming en el Edge con calibración de estilo.',
    url: 'https://rewrite.trujillomingorance.com',
    domain: 'rewrite.trujillomingorance.com',
    alt: '',
    featured: false,
    category: 'ai',
    keywords: 'rewrite humanizer anti-ia turnitin groq',
    stack: ['Pages Functions', 'Groq LPU', 'Workers AI'],
    cta: 'Abrir Rewrite', repo: 'https://github.com/ATM-Software-Labs/rewrite-ai'
  },
  'focusguard': {
    id: 'focusguard',
    title: 'FocusGuard SaaS & AdShield',
    description: 'Filtrado DNS Zero-Trust. Bloquea anuncios, telemetría, malware y rastreadores a nivel de red.',
    url: 'https://focusguard.trujillomingorance.com',
    domain: 'focusguard.trujillomingorance.com',
    alt: '',
    featured: false,
    category: 'security',
    keywords: 'focusguard adshield dns adblock zero-trust',
    stack: ['DNS-over-HTTPS', 'Zero-Trust', 'D1 & KV'],
    cta: 'Abrir FocusGuard', repo: 'https://github.com/ATM-Software-Labs/focusguard-saas'
  },
  'alberto-portfolio': {
    id: 'alberto-portfolio',
    title: 'Portfolio Profesional',
    description: 'Perfil técnico de Alberto Trujillo. SysAdmin, seguridad, proyectos y contacto.',
    url: 'https://alberto.trujillomingorance.com',
    domain: 'alberto.trujillomingorance.com',
    alt: '',
    featured: false,
    category: 'engineering',
    keywords: 'portfolio alberto cv sysadmin devops',
    stack: ['Cloudflare Pages', 'Vanilla JS', 'Security Eng'],
    cta: 'Ver Portfolio', repo: 'https://github.com/ATM-Software-Labs/portfolio'
  },
  'trujillo-guides': {
    id: 'trujillo-guides',
    title: 'Trujillo Engineering Guides',
    description: 'Runbooks de producción, arquitecturas Edge y guías de sistemas.',
    url: 'https://guides.trujillomingorance.com',
    domain: 'guides.trujillomingorance.com',
    alt: '',
    featured: false,
    category: 'engineering',
    keywords: 'guias guides documentacion devops cloudflare',
    stack: ['Technical Docs', 'DevOps', 'Edge'],
    cta: 'Explorar Guías', repo: 'https://github.com/ATM-Software-Labs/trujillo-guides'
  },
  'atm-labs-hub': {
    id: 'atm-labs-hub',
    title: 'ATM Labs Hub (Portal Central)',
    description: 'Directorio vivo del ecosistema. Autodescubrimiento de proyectos en Cloudflare Pages.',
    url: 'https://labs.trujillomingorance.com',
    domain: 'labs.trujillomingorance.com',
    alt: 'trujillomingorance.com',
    category: 'engineering',
    keywords: 'labs atm hub central directorio',
    stack: ['Central Hub', 'Edge Gateway', 'Pages Functions'],
    cta: 'Estás aquí', repo: 'https://github.com/ATM-Software-Labs/atm-labs-hub',
    current: true
  },
  'domain-root': {
    id: 'domain-root',
    title: 'Apex Domain Gateway',
    description: 'Enrutador del dominio raíz y telemetría 404 para subdominios no asignados.',
    url: 'https://trujillomingorance.com',
    domain: 'trujillomingorance.com',
    alt: '',
    category: 'engineering',
    keywords: 'root apex gateway dns wildcard',
    stack: ['Pages', 'DNS', 'Edge'],
    cta: 'Abrir raíz'
  },
  'invest-platform': {
    id: 'invest-platform',
    title: 'INVEST Terminal',
    description: 'Mesa cuantitativa institucional: identificadores globales, normalización IFRS/US GAAP y scoring determinista Buffett/Burry/Dalio.',
    url: 'https://invest.trujillomingorance.com',
    domain: 'invest.trujillomingorance.com',
    alt: '',
    featured: false,
    category: 'finance',
    keywords: 'invest acciones crypto bonos scoring buffett burry dalio fintech',
    stack: ['Next.js 15', 'Cloudflare Pages', 'Scoring determinista'],
    cta: 'Abrir INVEST', repo: 'https://github.com/ATM-Software-Labs/invest-platform'
  },
  'savings-runway': {
    id: 'savings-runway',
    title: 'Savings & Runway Familiar',
    description: 'Auditoría privada de liquidez, colchón de supervivencia financiera y coste de oportunidad al 7%. Procesamiento 100% en RAM.',
    url: 'https://savings.trujillomingorance.com',
    domain: 'savings.trujillomingorance.com',
    alt: '',
    featured: false,
    category: 'finance',
    keywords: 'savings runway finanzas ahorro bancos extractos liquidez presupuesto',
    stack: ['React 19', 'Zero-Knowledge', 'RAM Volátil'],
    cta: 'Abrir Savings', repo: 'https://github.com/ATM-Software-Labs/savings-runway'
  },
  'atm-tools': {
    id: 'atm-tools',
    title: 'ATM Tools',
    description: 'Herramientas de productividad y utilidades de ingenieria para uso diario.',
    url: 'https://tools.trujillomingorance.com',
    domain: 'tools.trujillomingorance.com',
    alt: '',
    featured: false,
    category: 'engineering',
    keywords: 'tools herramientas utilities',
    stack: ['Vanilla JS', 'Edge'],
    cta: 'Abrir Tools', repo: 'https://github.com/ATM-Software-Labs/atm-tools'
  },
  'rocky-setter': {
    id: 'rocky-setter',
    title: 'Rocky setter',
    description: 'Pagina personal para mi perrete, Rocky.',
    url: 'https://rocky.trujillomingorance.com',
    domain: 'rocky.trujillomingorance.com',
    alt: '',
    featured: false,
    category: 'personal',
    keywords: 'rocky perro setter',
    stack: ['HTML', 'CSS'],
    cta: 'Visitar a Rocky', repo: 'https://github.com/ATM-Software-Labs/rocky-dog-website'
  },
};
const HIDDEN = new Set(['neurolock', 'manual-de-bloqueo', 'domain-root', 'rocky-setter', 'atm-labs-hub']);
const FEATURED_ORDER = ['alberto-portfolio', 'trujillo-ai-studio', 'rewrite-ai', 'invest-platform'];


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









