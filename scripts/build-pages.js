#!/usr/bin/env node
'use strict';
// Builds labs.trujillomingorance.com (es, en, ca and 404) in the charts visual system.
// public/css stays the source; the CSS is inlined so the first paint needs no stylesheet request.

const fs = require('fs');
const path = require('path');
const { atmNet } = require('./atm-net.cjs');

const ROOT = path.join(__dirname, '..');
const VERSION = '20261018a';       // brand icons (favicon, manifest): unchanged files
const ASSET_V = '20261025a';       // new site assets: og images, scripts
const BRAND_V = '20261020a';       // /brand/ copies of trujillomingorance.com/brand/logo
const INTERNAL_V = '20261022a';
const LASTMOD = '2026-10-25';
const ORIGIN = 'https://labs.trujillomingorance.com';
const APEX = 'https://trujillomingorance.com';
const GITHUB = 'https://github.com/ATM-Software-Labs';
const LINKEDIN = 'https://www.linkedin.com/in/alberto-trujillo-mingorance-288237266';
const CHARTS = 'https://charts.trujillomingorance.com';
const LEGAL = { es: [APEX + '/privacy', APEX + '/terms'], en: [APEX + '/en/privacy/', APEX + '/en/terms/'], ca: [APEX + '/ca/privacy/', APEX + '/ca/terms/'] };
const CSP = "default-src 'self'; script-src 'self' 'unsafe-inline' https://static.cloudflareinsights.com; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self' https://trujillomingorance.com https://*.trujillomingorance.com https://cloudflareinsights.com; base-uri 'self'; form-action 'self'; object-src 'none'";

const INLINE_CSS = ['tokens.css', 'labs.css', 'atm-net.css']
  .map(function (f) { return fs.readFileSync(path.join(ROOT, 'public', 'css', f), 'utf8'); })
  .join('\n').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s*\n\s*/g, '\n');

const CATALOG = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/services.json'), 'utf8'));
const SERVICES = CATALOG.services.slice().sort(function (a, b) { return a.rank - b.rank; });
const FEATURED = ['markets-briefing', 'invest-platform', 'trujillo-ai-studio', 'nutrifit'].map(function (id) {
  return SERVICES.find(function (s) { return s.id === id; });
});
const PUBLIC_REPOS = SERVICES.filter(function (s) { return s.repoPublic === true; }).length;
const CATEGORY_ORDER = ['all', 'ai', 'finance', 'security', 'docs', 'health', 'tools', 'platform', 'profile'];

// 24px stroke icons (Lucide-style paths).
const P = {
  chart: '<path d="M3 3v18h18"/><path d="m7 15 4-4 3 3 6-6"/>',
  trend: '<path d="m22 7-8.5 8.5-5-5L2 17"/><path d="M16 7h6v6"/>',
  spark: '<path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z"/><path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z"/>',
  leaf: '<path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.5 19 2c1 2 2 4.2 2 8 0 5.5-4.8 10-10 10Z"/><path d="M2 21c0-3 1.9-5.4 5.1-6"/>',
  pen: '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/>',
  wallet: '<path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2"/><path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4"/>',
  shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/>',
  server: '<rect x="2" y="3" width="20" height="8" rx="2"/><rect x="2" y="13" width="20" height="8" rx="2"/><path d="M6 7h.01M6 17h.01"/>',
  bell: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.9 1.9 0 0 0 3.4 0"/>',
  book: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V2H6.5A2.5 2.5 0 0 0 4 4.5z"/><path d="M4 19.5A2.5 2.5 0 0 0 6.5 22H20v-5"/>',
  wrench: '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.8-3.8a6 6 0 0 1-7.9 7.9l-6.9 6.9a2.1 2.1 0 0 1-3-3l6.9-6.9a6 6 0 0 1 7.9-7.9z"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
  grid: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
  globe: '<circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15 15 0 0 1 0 20a15 15 0 0 1 0-20"/>',
  arrow: '<path d="M7 17 17 7"/><path d="M8 7h9v9"/>',
  right: '<path d="M5 12h14"/><path d="m13 6 6 6-6 6"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/>',
  x: '<path d="M18 6 6 18M6 6l12 12"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
  moon: '<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/>',
  chev: '<path d="m6 9 6 6 6-6"/>',
  cloud: '<path d="M17.5 19H9a7 7 0 1 1 6.7-9h1.8a4.5 4.5 0 1 1 0 9Z"/>',
  code: '<path d="m16 18 6-6-6-6"/><path d="m8 6-6 6 6 6"/>',
  mail: '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 6L2 7"/>'
};
const ICON_FOR = { 'markets-briefing': 'chart', 'invest-platform': 'trend', 'trujillo-ai-studio': 'spark', nutrifit: 'leaf', 'rewrite-ai': 'pen', 'savings-runway': 'wallet', focusguard: 'shield', 'api-gateway': 'server', 'open-sentinel': 'bell', 'trujillo-guides': 'book', 'atm-tools': 'wrench', 'alberto-portfolio': 'user', labs: 'grid', apex: 'globe' };
function icon(name, cls) {
  return '<svg' + (cls ? ' class="' + cls + '"' : '') + ' viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' + P[name] + '</svg>';
}
const GITHUB_ICON = '<svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true" focusable="false"><path fill="currentColor" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92-.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8z"></path></svg>';

const LANGS = [['es', 'Español', 'es'], ['en', 'English', 'us'], ['ca', 'Català', 'ca']];

const LOCALES = {
  es: {
    id: 'es', path: '/', htmlLang: 'es', ogLocale: 'es_ES', og: '/assets/og.png',
    hub: APEX + '/', charts: CHARTS + '/', chartsSub: CHARTS + '/suscribirse',
    title: 'ATM Labs · Ecosistema de software de ATM Software Labs',
    description: 'Markets Briefing, INVEST, Trujillo AI, NutriFit y el resto de servicios en producción de ATM Software Labs, con su estado en directo.',
    ogAlt: 'ATM Labs: los proyectos en producción de ATM Software Labs.',
    skip: 'Saltar al contenido', navLabel: 'Navegación principal', langLabel: 'Idioma: español. Cambiar idioma',
    themeLabel: 'Cambiar tema claro u oscuro', homeLabel: 'ATM Labs · Inicio',
    nav: { featured: 'Destacados', directory: 'Servicios', how: 'Cómo se hace' },
    pill: '{n} servicios en producción',
    h1a: 'Software propio,', h1b: 'en producción.',
    lead: 'ATM Software Labs es el laboratorio de Alberto Trujillo Mingorance. Aquí están todos sus proyectos publicados bajo trujillomingorance.com: correo de mercados, análisis de inversión, IA y herramientas, con su estado comprobado desde tu navegador.',
    ctaDirectory: 'Ver los servicios', ctaCharts: 'Markets Briefing',
    facts: [['{n}', 'servicios'], ['{r}', 'repos públicos'], ['3', 'idiomas']],
    mail: { bar: 'charts.trujillomingorance.com', kicker: 'Destacado', badge: 'Gratis', title: 'Markets Briefing', text: 'El correo de bolsa del laboratorio. Cuatro envíos con cifras con fuente, en español o inglés.', slots: [['Morning', '09:00'], ['Midday', '15:00'], ['Close', '22:45'], ['Weekly', 'vie.']], tz: 'Hora de Madrid', tools: 'En la web', cta: 'Suscríbete gratis', open: 'Abrir charts' },
    featuredKicker: 'Destacados', featuredTitle: 'Los proyectos principales', featuredLead: 'Cuatro productos públicos: mercados, inversión, IA y nutrición.',
    dirKicker: 'Directorio', dirTitle: 'Todos los servicios', dirLead: 'En línea: el host contestó a tu navegador. Sin respuesta: no contestó a tiempo. Es una comprobación puntual, no una cifra de disponibilidad.',
    searchLabel: 'Buscar un servicio', placeholder: 'Buscar un servicio…', clear: 'Limpiar búsqueda', filtersLabel: 'Categorías',
    categories: { all: 'Todos', ai: 'IA', finance: 'Finanzas', security: 'Seguridad', docs: 'Documentación', health: 'Salud', tools: 'Herramientas', platform: 'Infraestructura', profile: 'Perfil' },
    open: 'Abrir', noLink: 'Sin página pública', githubLabel: 'Repositorio en GitHub', newTab: 'se abre en una pestaña nueva',
    count: '{n} servicios', countOne: '1 servicio', emptyTitle: 'Sin resultados', emptyBefore: 'Nada coincide con “', emptyAfter: '”.', reset: 'Ver todos los servicios',
    noscript: 'Sin JavaScript el directorio sigue completo; solo no se comprueba el estado.',
    pending: 'pendiente', checking: 'comprobando', online: 'en línea', offline: 'sin respuesta', repo: 'repositorio',
    howKicker: 'Cómo se hace', howTitle: 'Un dominio, un borde, código abierto',
    pillars: [
      ['globe', 'Un solo dominio', 'Cada proyecto vive en un subdominio de trujillomingorance.com, con la misma marca y el mismo pie de red.'],
      ['cloud', 'En el borde de Cloudflare', 'Los sitios se sirven con Cloudflare Pages y Workers: HTTPS, caché y cabeceras de seguridad en cada respuesta.'],
      ['code', 'Código en GitHub', '{r} repositorios públicos en la organización <a href="' + GITHUB + '">ATM-Software-Labs</a>.']
    ],
    ctaKicker: 'Markets Briefing', ctaTitle: 'Los mercados en tu correo, gratis', ctaText: 'Morning 09:00, Midday 15:00, Close 22:45 y Weekly el viernes (hora de Madrid). Te das de baja con un clic.', ctaPrimary: 'Suscribirme', ctaSecondary: 'Ver la hemeroteca', chartsArchive: CHARTS + '/briefings',
    footBlurb: 'Directorio de los proyectos de ATM Software Labs: qué hay en producción, dónde está y si responde.',
    footProjects: 'Proyectos', footProfiles: 'Perfiles', footLegal: 'Legal', privacy: 'Privacidad', terms: 'Términos', lockupTitle: 'ATM Labs es parte de ATM Software Labs', portfolio: 'Sobre Alberto',
    notFound: { title: 'Ruta no encontrada · ATM Labs', h1: 'Ruta no encontrada', desc: 'No hay un servicio publicado en esta ruta de labs.trujillomingorance.com.', host: 'Host', path: 'Ruta', time: 'Fecha', status: 'Estado', copy: 'Copiar diagnóstico', copied: 'Copiado', back: 'Volver atrás', home: 'Ir al directorio', services: 'Servicios publicados', servicesLead: 'Los mismos destinos que el directorio.' }
  },
  en: {
    id: 'en', path: '/en/', htmlLang: 'en', ogLocale: 'en_US', og: '/assets/og-en.png',
    hub: APEX + '/en/', charts: CHARTS + '/en/', chartsSub: CHARTS + '/en/subscribe',
    title: 'ATM Labs · The ATM Software Labs software ecosystem',
    description: 'Markets Briefing, INVEST, Trujillo AI, NutriFit and every other ATM Software Labs service in production, with live status.',
    ogAlt: 'ATM Labs: the ATM Software Labs projects in production.',
    skip: 'Skip to content', navLabel: 'Main navigation', langLabel: 'Language: English. Change language',
    themeLabel: 'Toggle light or dark theme', homeLabel: 'ATM Labs · Home',
    nav: { featured: 'Featured', directory: 'Services', how: 'How it is built' },
    pill: '{n} services in production',
    h1a: 'Our own software,', h1b: 'in production.',
    lead: 'ATM Software Labs is the lab of Alberto Trujillo Mingorance. These are all of its projects published under trujillomingorance.com: a markets email, investment research, AI and tools, with their status checked from your browser.',
    ctaDirectory: 'Browse services', ctaCharts: 'Markets Briefing',
    facts: [['{n}', 'services'], ['{r}', 'public repos'], ['3', 'languages']],
    mail: { bar: 'charts.trujillomingorance.com', kicker: 'Featured', badge: 'Free', title: 'Markets Briefing', text: 'The lab’s markets email. Four sends with sourced figures, in Spanish or English.', slots: [['Morning', '09:00'], ['Midday', '15:00'], ['Close', '22:45'], ['Weekly', 'Fri']], tz: 'Madrid time', tools: 'On the web', cta: 'Subscribe free', open: 'Open charts' },
    featuredKicker: 'Featured', featuredTitle: 'The main projects', featuredLead: 'Four public products: markets, investing, AI and nutrition.',
    dirKicker: 'Directory', dirTitle: 'Every service', dirLead: 'Online: the host answered your browser. No response: it did not answer in time. This is a one-off check, not an availability figure.',
    searchLabel: 'Search services', placeholder: 'Search services…', clear: 'Clear search', filtersLabel: 'Categories',
    categories: { all: 'All', ai: 'AI', finance: 'Finance', security: 'Security', docs: 'Documentation', health: 'Health', tools: 'Tools', platform: 'Infrastructure', profile: 'Profile' },
    open: 'Open', noLink: 'No public page', githubLabel: 'Repository on GitHub', newTab: 'opens in a new tab',
    count: '{n} services', countOne: '1 service', emptyTitle: 'No results', emptyBefore: 'Nothing matches “', emptyAfter: '”.', reset: 'Show every service',
    noscript: 'Without JavaScript the directory is still complete; only the status check does not run.',
    pending: 'pending', checking: 'checking', online: 'online', offline: 'no response', repo: 'repository',
    howKicker: 'How it is built', howTitle: 'One domain, one edge, open code',
    pillars: [
      ['globe', 'One domain', 'Every project lives on a subdomain of trujillomingorance.com, with the same brand and the same network footer.'],
      ['cloud', 'On the Cloudflare edge', 'Sites are served by Cloudflare Pages and Workers: HTTPS, caching and security headers on every response.'],
      ['code', 'Code on GitHub', '{r} public repositories in the <a href="' + GITHUB + '">ATM-Software-Labs</a> organization.']
    ],
    ctaKicker: 'Markets Briefing', ctaTitle: 'The markets in your inbox, free', ctaText: 'Morning 09:00, Midday 15:00, Close 22:45 and a Friday Weekly (Madrid time). Unsubscribe in one click.', ctaPrimary: 'Subscribe', ctaSecondary: 'Browse the archive', chartsArchive: CHARTS + '/en/briefings',
    footBlurb: 'Directory of the ATM Software Labs projects: what is in production, where it lives and whether it answers.',
    footProjects: 'Projects', footProfiles: 'Profiles', footLegal: 'Legal', privacy: 'Privacy', terms: 'Terms', lockupTitle: 'ATM Labs is part of ATM Software Labs', portfolio: 'About Alberto',
    notFound: { title: 'Page not found · ATM Labs', h1: 'Page not found', desc: 'No service is published at this path on labs.trujillomingorance.com.', host: 'Host', path: 'Path', time: 'Time', status: 'Status', copy: 'Copy diagnostics', copied: 'Copied', back: 'Go back', home: 'Go to the directory', services: 'Published services', servicesLead: 'The same destinations as the directory.' }
  },
  ca: {
    id: 'ca', path: '/ca/', htmlLang: 'ca', ogLocale: 'ca_ES', og: '/assets/og-ca.png',
    hub: APEX + '/ca/', charts: CHARTS + '/', chartsSub: CHARTS + '/suscribirse',
    title: 'ATM Labs · Ecosistema de programari d’ATM Software Labs',
    description: 'Markets Briefing, INVEST, Trujillo AI, NutriFit i la resta de serveis en producció d’ATM Software Labs, amb el seu estat en directe.',
    ogAlt: 'ATM Labs: els projectes en producció d’ATM Software Labs.',
    skip: 'Salta al contingut', navLabel: 'Navegació principal', langLabel: 'Idioma: català. Canviar l’idioma',
    themeLabel: 'Canviar el tema clar o fosc', homeLabel: 'ATM Labs · Inici',
    nav: { featured: 'Destacats', directory: 'Serveis', how: 'Com es fa' },
    pill: '{n} serveis en producció',
    h1a: 'Programari propi,', h1b: 'en producció.',
    lead: 'ATM Software Labs és el laboratori d’Alberto Trujillo Mingorance. Aquí hi ha tots els seus projectes publicats sota trujillomingorance.com: correu de mercats, anàlisi d’inversió, IA i eines, amb l’estat comprovat des del teu navegador.',
    ctaDirectory: 'Veure els serveis', ctaCharts: 'Markets Briefing',
    facts: [['{n}', 'serveis'], ['{r}', 'repos públics'], ['3', 'idiomes']],
    mail: { bar: 'charts.trujillomingorance.com', kicker: 'Destacat', badge: 'Gratis', title: 'Markets Briefing', text: 'El correu de borsa del laboratori. Quatre enviaments amb xifres amb font, en castellà o anglès.', slots: [['Morning', '09:00'], ['Midday', '15:00'], ['Close', '22:45'], ['Weekly', 'dv.']], tz: 'Hora de Madrid', tools: 'Al web', cta: 'Subscriu-t’hi gratis', open: 'Obrir charts' },
    featuredKicker: 'Destacats', featuredTitle: 'Els projectes principals', featuredLead: 'Quatre productes públics: mercats, inversió, IA i nutrició.',
    dirKicker: 'Directori', dirTitle: 'Tots els serveis', dirLead: 'En línia: l’amfitrió ha respost al teu navegador. Sense resposta: no ha respost a temps. És una comprovació puntual, no una xifra de disponibilitat.',
    searchLabel: 'Cercar un servei', placeholder: 'Cercar un servei…', clear: 'Netejar la cerca', filtersLabel: 'Categories',
    categories: { all: 'Tots', ai: 'IA', finance: 'Finances', security: 'Seguretat', docs: 'Documentació', health: 'Salut', tools: 'Eines', platform: 'Infraestructura', profile: 'Perfil' },
    open: 'Obrir', noLink: 'Sense pàgina pública', githubLabel: 'Repositori a GitHub', newTab: 's’obre en una pestanya nova',
    count: '{n} serveis', countOne: '1 servei', emptyTitle: 'Sense resultats', emptyBefore: 'Res no coincideix amb «', emptyAfter: '».', reset: 'Veure tots els serveis',
    noscript: 'Sense JavaScript el directori continua complet; només no se’n comprova l’estat.',
    pending: 'pendent', checking: 'comprovant', online: 'en línia', offline: 'sense resposta', repo: 'repositori',
    howKicker: 'Com es fa', howTitle: 'Un domini, una vora, codi obert',
    pillars: [
      ['globe', 'Un sol domini', 'Cada projecte viu en un subdomini de trujillomingorance.com, amb la mateixa marca i el mateix peu de xarxa.'],
      ['cloud', 'A la vora de Cloudflare', 'Els llocs se serveixen amb Cloudflare Pages i Workers: HTTPS, memòria cau i capçaleres de seguretat a cada resposta.'],
      ['code', 'Codi a GitHub', '{r} repositoris públics a l’organització <a href="' + GITHUB + '">ATM-Software-Labs</a>.']
    ],
    ctaKicker: 'Markets Briefing', ctaTitle: 'Els mercats al teu correu, gratis', ctaText: 'Morning 09:00, Midday 15:00, Close 22:45 i Weekly el divendres (hora de Madrid). Et dones de baixa amb un clic.', ctaPrimary: 'Subscriure’m', ctaSecondary: 'Veure l’hemeroteca', chartsArchive: CHARTS + '/briefings',
    footBlurb: 'Directori dels projectes d’ATM Software Labs: què hi ha en producció, on és i si respon.',
    footProjects: 'Projectes', footProfiles: 'Perfils', footLegal: 'Legal', privacy: 'Privacitat', terms: 'Termes', lockupTitle: 'ATM Labs forma part d’ATM Software Labs', portfolio: 'Sobre l’Alberto',
    notFound: { title: 'Ruta no trobada · ATM Labs', h1: 'Ruta no trobada', desc: 'No hi ha cap servei publicat en aquesta ruta de labs.trujillomingorance.com.', host: 'Amfitrió', path: 'Ruta', time: 'Data', status: 'Estat', copy: 'Copiar el diagnòstic', copied: 'Copiat', back: 'Tornar enrere', home: 'Anar al directori', services: 'Serveis publicats', servicesLead: 'Les mateixes destinacions que el directori.' }
  }
};

function esc(value) {
  return String(value).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; });
}
function json(value) { return JSON.stringify(value).replace(/</g, '\\u003c'); }
function fill(s) { return String(s).replace('{n}', String(SERVICES.length)).replace('{r}', String(PUBLIC_REPOS)); }
function repoUrl(s) { return s && s.repoPublic === true && s.repo ? GITHUB + '/' + s.repo : ''; }
function ext(t) { return '<span class="visually-hidden"> (' + esc(t.newTab) + ')</span>'; }

function status(s, t) {
  const state = s.probe ? 'pending' : 'repo';
  return '<span class="status" data-state="' + state + '"' + (s.probe ? ' data-host="' + esc(s.host) + '"' : '') + '><span class="dot" aria-hidden="true"></span><span class="js-label">' + esc(s.probe ? t.pending : t.repo) + '</span></span>';
}
function actions(s, t) {
  const repo = repoUrl(s);
  const open = s.linkable
    ? '<a class="open" href="' + esc(s.url) + '">' + esc(t.open) + icon('arrow') + '<span class="visually-hidden"> ' + esc(s.title) + '</span></a>'
    : '<span class="muted-note">' + esc(t.noLink) + '</span>';
  const git = repo ? '<a class="ghost repo-link" href="' + esc(repo) + '" rel="noopener noreferrer" target="_blank" aria-label="' + esc(t.githubLabel) + ': ' + esc(s.title) + ' (' + esc(t.newTab) + ')">' + GITHUB_ICON + '</a>' : '';
  return '<div class="card-actions">' + open + git + '</div>';
}
function tags(list) {
  return (list || []).map(function (x) { return '<span class="tag">' + esc(x) + '</span>'; }).join('');
}
function featuredCard(s, t, i) {
  const hl = (s.highlights && s.highlights[t.id]) || [];
  return [
    '        <article class="card feat' + (i === 0 ? ' is-main' : '') + '" data-id="' + esc(s.id) + '">',
    '          <div class="card-top"><span class="ico">' + icon(ICON_FOR[s.id] || 'grid') + '</span>' + status(s, t) + '</div>',
    '          <h3>' + esc(s.title) + '</h3>',
    '          <p class="card-host">' + esc(s.host || s.url.replace(/^https:\/\//, '')) + '</p>',
    '          <p class="card-desc">' + esc(s.desc[t.id]) + '</p>',
    hl.length ? '          <ul class="chips-list">' + hl.map(function (h) { return '<li class="tag hl">' + esc(h) + '</li>'; }).join('') + '</ul>' : '',
    '          ' + actions(s, t),
    '        </article>'
  ].filter(Boolean).join('\n');
}
function serviceCard(s, t) {
  return [
    '          <article class="card svc" data-id="' + esc(s.id) + '" data-category="' + esc(s.category) + '" data-keywords="' + esc(s.keywords + ' ' + s.title + ' ' + (s.host || '') + ' ' + s.desc[t.id]) + '">',
    '            <div class="card-top"><span class="ico">' + icon(ICON_FOR[s.id] || 'grid') + '</span>' + status(s, t) + '</div>',
    '            <h3>' + esc(s.title) + '</h3>',
    '            <p class="card-host">' + esc(s.host || s.url.replace(/^https:\/\//, '')) + ' · <span data-cat="' + esc(s.category) + '">' + esc(t.categories[s.category] || s.category) + '</span></p>',
    '            <p class="card-desc" data-i18n-desc="' + esc(s.id) + '">' + esc(s.desc[t.id]) + '</p>',
    '            <div class="chips-list">' + tags(s.stack) + '</div>',
    '            ' + actions(s, t),
    '          </article>'
  ].join('\n');
}
function grid(t, id) {
  return '        <div class="svc-grid" id="' + id + '" data-l-pending="' + esc(t.pending) + '" data-l-checking="' + esc(t.checking) + '" data-l-online="' + esc(t.online) + '" data-l-down="' + esc(t.offline) + '" data-l-count="' + esc(t.count) + '" data-l-one="' + esc(t.countOne) + '">\n' +
    SERVICES.map(function (s) { return serviceCard(s, t); }).join('\n') + '\n        </div>';
}
function chips(t) {
  return CATEGORY_ORDER.map(function (id) {
    return '<button class="chip" type="button" data-category="' + id + '" aria-pressed="' + (id === 'all') + '">' + esc(t.categories[id]) + '</button>';
  }).join('');
}

function langMenu(current) {
  const cur = LANGS.find(function (l) { return l[0] === current; });
  const t = LOCALES[current];
  const items = LANGS.map(function (l) {
    return '<a href="' + LOCALES[l[0]].path + '" hreflang="' + l[0] + '" lang="' + l[0] + '" data-lang-switch="' + l[0] + '"' + (l[0] === current ? ' aria-current="page"' : '') + '><img class="flag" src="/flags/' + l[2] + '.svg?v=' + ASSET_V + '" width="20" height="15" alt="" decoding="async"><span>' + l[1] + '</span><span class="ck" aria-hidden="true">✓</span></a>';
  }).join('');
  return '<details class="lang" id="langNav"><summary class="icon-btn" aria-label="' + esc(current.toUpperCase() + ' · ' + t.langLabel) + '"><img class="flag" src="/flags/' + cur[2] + '.svg?v=' + ASSET_V + '" width="20" height="15" alt="" decoding="async"><span class="lang-code">' + current + '</span>' + icon('chev') + '</summary><div class="menu">' + items + '</div></details>';
}
function header(t, is404) {
  const base = is404 ? t.path : '';
  return [
    '  <a class="skip" id="skipLink" href="#contenido">' + esc(t.skip) + '</a>',
    '  <header class="top">',
    '    <div class="wrap top-row">',
    '      <a class="brand" id="brandLink" href="' + t.path + '" title="' + esc(t.homeLabel) + '"><img src="/brand/symbol.svg?v=' + BRAND_V + '" width="28" height="28" alt=""><span>ATM Labs</span></a>',
    '      <nav class="nav" id="siteNav" aria-label="' + esc(t.navLabel) + '">',
    '        <a class="nav-link" href="' + base + '#destacados">' + esc(t.nav.featured) + '</a>',
    '        <a class="nav-link" id="navDirectory" href="' + base + '#directorio">' + esc(t.nav.directory) + '</a>',
    '        <a class="nav-link" href="' + t.charts + '">Markets Briefing</a>',
    '        ' + langMenu(t.id),
    '        <button class="icon-btn theme-toggle" id="themeToggle" type="button" aria-label="' + esc(t.themeLabel) + '">' + icon('moon', 'i-moon') + icon('sun', 'i-sun') + '</button>',
    '        <a class="cta" href="' + GITHUB + '" rel="noopener noreferrer" target="_blank" aria-label="GitHub (' + esc(t.newTab) + ')">' + GITHUB_ICON + '<span class="cta-label" aria-hidden="true">GitHub</span></a>',
    '      </nav>',
    '    </div>',
    '  </header>'
  ].join('\n');
}
function footer(t) {
  const proj = [['Markets Briefing', t.charts], ['INVEST', 'https://invest.trujillomingorance.com/'], ['Trujillo AI', 'https://ai.trujillomingorance.com/'], ['NutriFit', 'https://nutri.trujillomingorance.com/'], ['Rewrite', 'https://rewrite.trujillomingorance.com/'], ['ATM Tools', 'https://tools.trujillomingorance.com/']];
  const li = function (a) { return '<li><a href="' + esc(a[1]) + '"' + (a[2] ? ' rel="me noopener noreferrer" target="_blank"' : '') + '>' + esc(a[0]) + (a[2] ? ext(t) : '') + '</a></li>'; };
  return [
    '  <footer class="site-footer">',
    '    <div class="wrap foot-grid">',
    '      <div>',
    '        <p class="foot-brand"><img src="/brand/symbol.svg?v=' + BRAND_V + '" width="24" height="24" alt="" loading="lazy" decoding="async">ATM Labs</p>',
    '        <p class="foot-blurb">' + esc(t.footBlurb) + '</p>',
    '        <a class="lockup" href="' + t.hub + '" title="' + esc(t.lockupTitle) + '"><img class="on-dark" src="/brand/lockup-white.svg?v=' + BRAND_V + '" width="149" height="40" alt="ATM Software Labs" decoding="async"><img class="on-light" src="/brand/lockup-black.svg?v=' + BRAND_V + '" width="149" height="40" alt="ATM Software Labs" decoding="async"></a>',
    '      </div>',
    '      <div><p class="foot-h">' + esc(t.footProjects) + '</p><ul class="foot-list">' + proj.map(li).join('') + '</ul></div>',
    '      <div><p class="foot-h">' + esc(t.footProfiles) + '</p><ul class="foot-list" id="footerNav">' + [['GitHub', GITHUB, 1], ['LinkedIn', LINKEDIN, 1], [t.portfolio, 'https://alberto.trujillomingorance.com/']].map(li).join('') + '</ul>',
    '        <p class="foot-h" style="margin-top:1.5rem">' + esc(t.footLegal) + '</p><ul class="foot-list">' + [[t.privacy, LEGAL[t.id][0]], [t.terms, LEGAL[t.id][1]]].map(li).join('') + '</ul></div>',
    '    </div>',
    '    <div class="wrap"><div class="sep" aria-hidden="true"></div></div>',
    '    <div class="wrap copyright"><p>© 2026 ATM Software Labs · Alberto Trujillo Mingorance</p><p><a href="' + t.hub + '">trujillomingorance.com</a></p></div>',
    '    ' + atmNet('labs', t.id, false),
    '  </footer>'
  ].join('\n');
}

const THEME_BOOT = '<script>(function(){var d=document.documentElement,t;try{t=localStorage.getItem("atm_theme")}catch(e){}if(t!=="light"&&t!=="dark")t=window.matchMedia&&matchMedia("(prefers-color-scheme: light)").matches?"light":"dark";d.setAttribute("data-theme",t)})();</script>';
const LANG_BOOT = '<script>(function(){try{var h=location.hostname;if(h!=="labs.trujillomingorance.com"&&h!=="www.labs.trujillomingorance.com")return;var p=location.pathname;if(p!=="/"&&p!=="/index.html")return;if(localStorage.getItem("atm_lang_choice")||localStorage.getItem("atm_lang_auto"))return;var n=(navigator.language||"").toLowerCase();var w=n.indexOf("en")===0?"en":n.indexOf("ca")===0?"ca":"es";var ua=navigator.userAgent||"";var bot=navigator.webdriver||/bot|crawl|spider|slurp|lighthouse|headless/i.test(ua);localStorage.setItem("atm_lang_auto",w);if(bot||w==="es")return;location.replace(w==="en"?"/en/":"/ca/");}catch(e){}})();</script>';

function icons() {
  return [
    '  <link rel="icon" href="/favicon.svg?v=' + VERSION + '" type="image/svg+xml">',
    '  <link rel="icon" href="/assets/favicon.ico?v=' + VERSION + '" sizes="16x16 32x32 48x48">',
    '  <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png?v=' + VERSION + '">',
    '  <link rel="apple-touch-icon" href="/apple-touch-icon.png?v=' + VERSION + '">',
    '  <link rel="manifest" href="/site.webmanifest?v=' + VERSION + '">'
  ];
}
function headCommon(title) {
  return [
    '  <meta charset="UTF-8">',
    '  <meta name="viewport" content="width=device-width, initial-scale=1">',
    '  ' + THEME_BOOT,
    '  <title>' + esc(title) + '</title>',
    '  <meta name="color-scheme" content="dark light">',
    '  <meta name="theme-color" content="#07080b" media="(prefers-color-scheme: dark)">',
    '  <meta name="theme-color" content="#ffffff" media="(prefers-color-scheme: light)">',
    '  <meta http-equiv="Content-Security-Policy" content="' + esc(CSP) + '">'
  ];
}
function head(t) {
  const canonical = ORIGIN + t.path;
  const og = ORIGIN + t.og + '?v=' + ASSET_V;
  const ld = {
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': 'Organization', '@id': APEX + '/#org', name: 'ATM Software Labs', url: APEX + '/', logo: ORIGIN + '/icon-512.png', founder: { '@type': 'Person', name: 'Alberto Trujillo Mingorance', url: 'https://alberto.trujillomingorance.com/', sameAs: [LINKEDIN] }, sameAs: [GITHUB, LINKEDIN] },
      { '@type': 'WebSite', '@id': ORIGIN + '/#website', name: 'ATM Labs', url: ORIGIN + '/', inLanguage: ['es', 'en', 'ca'], publisher: { '@id': APEX + '/#org' } },
      { '@type': 'CollectionPage', '@id': canonical + '#page', url: canonical, name: t.title, description: t.description, inLanguage: t.htmlLang, isPartOf: { '@id': ORIGIN + '/#website' },
        mainEntity: { '@type': 'ItemList', numberOfItems: SERVICES.length, itemListElement: SERVICES.map(function (s, i) { return { '@type': 'ListItem', position: i + 1, name: s.title, url: s.url, description: s.desc[t.id] }; }) } }
    ]
  };
  return [
    '<!DOCTYPE html>',
    '<html lang="' + t.htmlLang + '" data-theme="dark">',
    '<head>'
  ].concat(headCommon(t.title), [
    '  <meta name="description" content="' + esc(t.description) + '">',
    '  <meta name="author" content="Alberto Trujillo Mingorance">',
    '  <meta name="robots" content="index, follow, max-image-preview:large">',
    '  <link rel="canonical" href="' + canonical + '">',
    '  <link rel="alternate" hreflang="es" href="' + ORIGIN + '/">',
    '  <link rel="alternate" hreflang="en" href="' + ORIGIN + '/en/">',
    '  <link rel="alternate" hreflang="ca" href="' + ORIGIN + '/ca/">',
    '  <link rel="alternate" hreflang="x-default" href="' + ORIGIN + '/">',
    '  <meta property="og:type" content="website">',
    '  <meta property="og:site_name" content="ATM Software Labs">',
    '  <meta property="og:locale" content="' + t.ogLocale + '">'
  ], ['es_ES', 'en_US', 'ca_ES'].filter(function (l) { return l !== t.ogLocale; }).map(function (l) { return '  <meta property="og:locale:alternate" content="' + l + '">'; }), [
    '  <meta property="og:title" content="' + esc(t.title) + '">',
    '  <meta property="og:description" content="' + esc(t.description) + '">',
    '  <meta property="og:url" content="' + canonical + '">',
    '  <meta property="og:image" content="' + og + '">',
    '  <meta property="og:image:type" content="image/png">',
    '  <meta property="og:image:width" content="1200">',
    '  <meta property="og:image:height" content="630">',
    '  <meta property="og:image:alt" content="' + esc(t.ogAlt) + '">',
    '  <meta name="twitter:card" content="summary_large_image">',
    '  <meta name="twitter:title" content="' + esc(t.title) + '">',
    '  <meta name="twitter:description" content="' + esc(t.description) + '">',
    '  <meta name="twitter:image" content="' + og + '">',
    '  <meta name="twitter:image:alt" content="' + esc(t.ogAlt) + '">'
  ], icons(), [
    '  <link rel="preload" href="/assets/fonts/inter-latin-400-normal.woff2" as="font" type="font/woff2" crossorigin>',
    '  <link rel="preload" href="/assets/fonts/inter-latin-700-normal.woff2" as="font" type="font/woff2" crossorigin>',
    '  <style>' + INLINE_CSS + '</style>',
    t.id === 'es' ? '  ' + LANG_BOOT : '',
    '  <script type="application/ld+json">' + json(ld) + '</script>',
    '</head>'
  ]).filter(Boolean).join('\n');
}

function scripts() {
  return [
    '  <script src="/js/filter.js?v=' + ASSET_V + '" defer></script>',
    '  <script src="/js/lang.js?v=' + ASSET_V + '" defer></script>',
    '  <script src="/js/directory.js?v=' + ASSET_V + '" defer></script>',
    '  <script src="/js/atm-internal.js?v=' + INTERNAL_V + '" defer></script>'
  ];
}

function page(t) {
  const m = t.mail;
  return [
    head(t),
    '<body>',
    header(t, false),
    '  <main id="contenido">',
    '    <section class="hero" aria-labelledby="identidad">',
    '      <div class="gridbg" aria-hidden="true"></div>',
    '      <div class="wrap hero-in">',
    '        <div class="hero-copy">',
    '          <p class="pill"><span class="dot" aria-hidden="true"></span>' + esc(fill(t.pill)) + '</p>',
    '          <h1 id="identidad">' + esc(t.h1a) + ' <span class="accent">' + esc(t.h1b) + '</span></h1>',
    '          <p class="lead">' + esc(t.lead) + '</p>',
    '          <div class="actions">',
    '            <a class="cta cta-lg" href="#directorio">' + esc(t.ctaDirectory) + icon('right') + '</a>',
    '            <a class="btn" href="' + t.charts + '">' + icon('chart') + esc(t.ctaCharts) + '</a>',
    '          </div>',
    '          <dl class="facts">' + t.facts.map(function (f) { return '<div><dt>' + esc(f[1]) + '</dt><dd>' + esc(fill(f[0])) + '</dd></div>'; }).join('') + '</dl>',
    '        </div>',
    '        <aside class="mail rise d2" aria-labelledby="mb-title">',
    '          <div class="mail-bar" aria-hidden="true"><span class="mail-dots"><i></i><i></i><i></i></span><span>' + esc(m.bar) + '</span></div>',
    '          <div class="mail-body">',
    '            <p class="mail-kicker"><span>' + esc(m.kicker) + ' · ATM Software Labs</span>' + status(SERVICES[0], t) + '</p>',
    '            <h2 id="mb-title">' + esc(m.title) + '</h2>',
    '            <p>' + esc(m.text) + '</p>',
    '            <ul class="slots">' + m.slots.map(function (s) { return '<li class="slot"><span>' + esc(s[0]) + '</span><span class="time">' + esc(s[1]) + '</span></li>'; }).join('') + '</ul>',
    '            <p class="mail-note" style="margin-top:.5rem">' + esc(m.tz) + '</p>',
    '            <div class="mail-tools"><span class="tag">' + esc(m.tools) + '</span><span class="tag">Heatmap</span><span class="tag">Drawdown</span><span class="tag">Cross-Asset Monitor</span><span class="tag">Briefings</span></div>',
    '            <div class="mail-foot"><a class="cta" href="' + t.chartsSub + '">' + icon('mail') + esc(m.cta) + '</a><a class="btn" style="height:2.25rem;font-size:13px" href="' + t.charts + '">' + esc(m.open) + icon('arrow') + '</a></div>',
    '          </div>',
    '        </aside>',
    '      </div>',
    '    </section>',
    '    <section class="section" id="destacados" aria-labelledby="destacados-titulo">',
    '      <div class="wrap">',
    '        <div class="sechead"><div><p class="kicker">' + esc(t.featuredKicker) + '</p><h2 id="destacados-titulo">' + esc(t.featuredTitle) + '</h2><p>' + esc(t.featuredLead) + '</p></div></div>',
    '        <div class="feat-grid">',
    FEATURED.map(function (s, i) { return featuredCard(s, t, i); }).join('\n'),
    '        </div>',
    '      </div>',
    '    </section>',
    '    <section class="section band" id="directorio" aria-labelledby="directorio-titulo">',
    '      <div class="wrap">',
    '        <div class="sechead"><div><p class="kicker">' + esc(t.dirKicker) + '</p><h2 id="directorio-titulo">' + esc(t.dirTitle) + '</h2><p>' + esc(t.dirLead) + '</p></div></div>',
    '        <div class="toolbar">',
    '          <form class="search" role="search" action="#directorio">',
    '            <label class="visually-hidden" for="projectSearch">' + esc(t.searchLabel) + '</label>',
    '            ' + icon('search', 's-ico'),
    '            <input class="search-field" type="search" id="projectSearch" name="q" placeholder="' + esc(t.placeholder) + '" autocomplete="off" spellcheck="false">',
    '            <button id="clearSearch" class="search-clear" type="button" hidden aria-label="' + esc(t.clear) + '">' + icon('x') + '</button>',
    '            <kbd class="search-kbd" aria-hidden="true">Ctrl K</kbd>',
    '          </form>',
    '          <div class="filters" role="toolbar" aria-label="' + esc(t.filtersLabel) + '">' + chips(t) + '</div>',
    '          <p class="count" id="catalogCount" aria-live="polite">' + esc(fill(t.count)) + '</p>',
    '        </div>',
    grid(t, 'hub'),
    '        <div id="noResults" class="empty" hidden><h3>' + esc(t.emptyTitle) + '</h3><p>' + esc(t.emptyBefore) + '<span id="noResultsQuery"></span>' + esc(t.emptyAfter) + '</p><button class="btn" id="btnResetFilters" type="button">' + esc(t.reset) + '</button></div>',
    '        <noscript><p class="note">' + esc(t.noscript) + '</p></noscript>',
    '      </div>',
    '    </section>',
    '    <section class="section" id="como" aria-labelledby="como-titulo">',
    '      <div class="wrap">',
    '        <div class="sechead"><div><p class="kicker">' + esc(t.howKicker) + '</p><h2 id="como-titulo">' + esc(t.howTitle) + '</h2></div></div>',
    '        <div class="pillars">' + t.pillars.map(function (p) { return '<div class="pillar"><span class="ico">' + icon(p[0]) + '</span><h3>' + esc(p[1]) + '</h3><p>' + fill(p[2]) + '</p></div>'; }).join('') + '</div>',
    '        <div class="dark-cta" style="margin-top:3rem">',
    '          <div><p class="kicker">' + esc(t.ctaKicker) + '</p><h2>' + esc(t.ctaTitle) + '</h2><p>' + esc(t.ctaText) + '</p></div>',
    '          <div class="dark-actions"><a class="white-btn" href="' + t.chartsSub + '">' + esc(t.ctaPrimary) + icon('right') + '</a><a class="ghost-dark" href="' + t.chartsArchive + '">' + esc(t.ctaSecondary) + '</a></div>',
    '        </div>',
    '      </div>',
    '    </section>',
    '  </main>',
    footer(t)
  ].concat(scripts(), ['</body>', '</html>', '']).join('\n');
}

function notFound() {
  const t = LOCALES.es;
  const ui = t.notFound;
  return [
    '<!DOCTYPE html>',
    '<html lang="es" data-theme="dark">',
    '<head>'
  ].concat(headCommon(ui.title).map(function (l) { return l.replace('<title>', '<title id="pageTitle">'); }), [
    '  <meta name="robots" content="noindex, nofollow">'
  ], icons(), [
    '  <style>' + INLINE_CSS + '</style>',
    '</head>',
    '<body data-page="404">',
    header(t, true),
    '  <main id="contenido">',
    '    <section class="hero" id="diagnostico" aria-labelledby="errorTitle">',
    '      <div class="gridbg" aria-hidden="true"></div>',
    '      <div class="wrap hero-in" style="grid-template-columns:1fr">',
    '        <div>',
    '          <p class="pill"><span class="dot" aria-hidden="true" style="background:var(--down)"></span>HTTP 404 · ATM Labs</p>',
    '          <h1 id="errorTitle">' + esc(ui.h1) + '</h1>',
    '          <p class="lead" id="errorDesc">' + esc(ui.desc) + '</p>',
    '          <dl class="diag">',
    '            <div><dt id="labelHost">' + esc(ui.host) + '</dt><dd id="teleHost">labs.trujillomingorance.com</dd></div>',
    '            <div><dt id="labelPath">' + esc(ui.path) + '</dt><dd id="telePath">/</dd></div>',
    '            <div><dt id="labelTime">' + esc(ui.time) + '</dt><dd id="teleTime">—</dd></div>',
    '            <div><dt id="labelStatus">' + esc(ui.status) + '</dt><dd id="teleStatus">HTTP 404</dd></div>',
    '          </dl>',
    '          <div class="actions">',
    '            <a class="cta cta-lg" id="homeLink" href="/">' + esc(ui.home) + '</a>',
    '            <button id="btnCopyDiag" class="btn" type="button"><span id="copyBtnText">' + esc(ui.copy) + '</span></button>',
    '            <button id="btnBack" class="btn" type="button" data-home="/">' + esc(ui.back) + '</button>',
    '          </div>',
    '        </div>',
    '      </div>',
    '    </section>',
    '    <section class="section band" id="directorio" aria-labelledby="servicesTitle">',
    '      <div class="wrap">',
    '        <div class="sechead"><div><p class="kicker">ATM Labs</p><h2 id="servicesTitle">' + esc(ui.services) + '</h2><p id="servicesLead">' + esc(ui.servicesLead) + '</p></div></div>',
    grid(t, 'servicesGrid'),
    '      </div>',
    '    </section>',
    '  </main>',
    footer(t),
    '  <script src="/js/copy.js?v=' + ASSET_V + '" defer></script>',
    '  <script src="/js/lang.js?v=' + ASSET_V + '" defer></script>',
    '  <script src="/js/not-found.js?v=' + ASSET_V + '" defer></script>',
    '  <script src="/js/directory.js?v=' + ASSET_V + '" defer></script>',
    '  <script src="/js/atm-internal.js?v=' + INTERNAL_V + '" defer></script>',
    '</body>',
    '</html>',
    ''
  ]).join('\n');
}

function copyScript() {
  const payload = {};
  Object.keys(LOCALES).forEach(function (id) {
    const t = LOCALES[id];
    const descriptions = {};
    SERVICES.forEach(function (s) { descriptions[s.id] = s.desc[id]; });
    payload[id] = { notFound: t.notFound, skip: t.skip, directory: t.nav.directory, featured: t.nav.featured, open: t.open, noLink: t.noLink, categories: t.categories, descriptions: descriptions, pending: t.pending, checking: t.checking, online: t.online, offline: t.offline, repo: t.repo };
  });
  return '/* Generated by scripts/build-pages.js. Locale copy for the 404 page. */\nwindow.ATM_COPY = ' + json(payload) + ';\n';
}

function sitemap() {
  const today = LASTMOD;
  const alts = '\n    <xhtml:link rel="alternate" hreflang="es" href="' + ORIGIN + '/"/>\n    <xhtml:link rel="alternate" hreflang="en" href="' + ORIGIN + '/en/"/>\n    <xhtml:link rel="alternate" hreflang="ca" href="' + ORIGIN + '/ca/"/>\n    <xhtml:link rel="alternate" hreflang="x-default" href="' + ORIGIN + '/"/>';
  return '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n' +
    ['/', '/en/', '/ca/'].map(function (p) { return '  <url>\n    <loc>' + ORIGIN + p + '</loc>\n    <lastmod>' + today + '</lastmod>' + alts + '\n  </url>'; }).join('\n') + '\n</urlset>\n';
}

function write(file, contents) {
  const target = path.join(ROOT, file);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, contents);
}
function bumpManifest() {
  const file = path.join(ROOT, 'public/site.webmanifest');
  const manifest = JSON.parse(fs.readFileSync(file, 'utf8'));
  manifest.description = 'Directorio de los proyectos en producción de ATM Software Labs.';
  manifest.icons.forEach(function (i) { i.src = i.src.replace(/\?v=\d{8}[a-z0-9]*/, '?v=' + VERSION); });
  fs.writeFileSync(file, JSON.stringify(manifest, null, 2) + '\n');
}

if (require.main === module) {
  write('public/index.html', page(LOCALES.es));
  write('public/en/index.html', page(LOCALES.en));
  write('public/ca/index.html', page(LOCALES.ca));
  write('public/404.html', notFound());
  write('public/js/copy.js', copyScript());
  if (!process.env.KEEP_SITEMAP) write('public/sitemap.xml', sitemap());
  bumpManifest();
  console.log('Wrote es, en, ca, 404, copy.js and sitemap (' + SERVICES.length + ' services)');
}
module.exports = { LOCALES, SERVICES, PUBLIC_REPOS };
