#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const VERSION = '20261015d';
const ORIGIN = 'https://labs.trujillomingorance.com';
const GITHUB = 'https://github.com/ATM-Software-Labs';
const LINKEDIN = 'https://www.linkedin.com/in/alberto-trujillo-mingorance-288237266';

const ICONS = {
  person: '<g fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="3.2"/><path d="M5.5 19.2a6.5 6.5 0 0 1 13 0"/></g>',
  gateway: '<g fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="3.5" width="7" height="7" rx="1"/><rect x="13.5" y="3.5" width="7" height="7" rx="1"/><rect x="3.5" y="13.5" width="7" height="7" rx="1"/><path d="M17 13.5v7M13.5 17h7"/></g>',
  spark: '<g fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3.2l1.5 4.8 4.8 1.5-4.8 1.5L12 16.8l-1.5-4.8L5.7 10.5l4.8-1.5z"/></g>',
  pen: '<g fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20h4L18.2 9.8 14.2 5.8 4 16z"/><path d="M13 7.2l3.8 3.8"/></g>',
  bars: '<g fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5V10"/><path d="M10 19.5V5"/><path d="M16 19.5v-6.5"/><path d="M3.5 19.5h17"/></g>',
  card: '<g fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="6.5" width="18" height="12" rx="2"/><path d="M3 10.5h18"/><path d="M16 14.6h.1"/></g>',
  shield: '<g fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3.2l7.5 2.8v5.6c0 4.6-3.1 7.4-7.5 8.6-4.4-1.2-7.5-4-7.5-8.6V6z"/></g>',
  book: '<g fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5 5.2A2.2 2.2 0 0 1 7.2 3H20v15.2H7.2A2.2 2.2 0 0 0 5 20.4z"/><path d="M5 5.2A2.2 2.2 0 0 1 7.2 7.4H20"/></g>',
  wrench: '<g fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.4a3.6 3.6 0 0 0-5 5L4.2 16.9 7.1 19.8l5.5-5.5a3.6 3.6 0 0 0 5-5L15.2 11.7 12.3 8.8z"/></g>',
  leaf: '<g fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5 19.2C5 11.5 11.2 5 20 4c-1 8.5-7.2 15.2-15 15.2z"/><path d="M8.2 16.2c2-2.2 4.2-5 7.2-8"/></g>',
  sentinel: '<g fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M2.8 12S6.2 6.5 12 6.5 21.2 12 21.2 12 17.8 17.5 12 17.5 2.8 12 2.8 12z"/></g>',
  generic: '<g fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="4" width="16" height="16" rx="2"/><path d="M8 12h8"/></g>'
};

const SERVICES = [
  { id: 'alberto-portfolio', title: 'Portfolio Profesional', host: 'alberto.trujillomingorance.com', url: 'https://alberto.trujillomingorance.com', icon: 'person', keywords: 'portfolio alberto sysadmin security', desc: { es: 'SysAdmin & Security', en: 'SysAdmin and security.', ca: 'SysAdmin i seguretat.' } },
  { id: 'api-gateway', title: 'API Gateway', host: 'api.trujillomingorance.com', url: 'https://api.trujillomingorance.com', icon: 'gateway', keywords: 'api gateway proxy perimeter', desc: { es: 'Perímetro / Proxy Central', en: 'Perimeter / central proxy.', ca: 'Perímetre / proxy central.' } },
  { id: 'trujillo-ai-studio', title: 'Trujillo AI Studio', host: 'ai.trujillomingorance.com', url: 'https://ai.trujillomingorance.com', icon: 'spark', keywords: 'ia ai groq studio multimodal', desc: { es: 'Multimodal LPU', en: 'Multimodal LPU.', ca: 'LPU multimodal.' } },
  { id: 'rewrite-ai', title: 'Rewrite AI', host: 'rewrite.trujillomingorance.com', url: 'https://rewrite.trujillomingorance.com', icon: 'pen', keywords: 'rewrite nlp groq lpu', desc: { es: 'NLP / Groq LPU', en: 'NLP / Groq LPU.', ca: 'NLP / Groq LPU.' } },
  { id: 'invest-platform', title: 'INVEST Terminal', host: 'invest.trujillomingorance.com', url: 'https://invest.trujillomingorance.com', icon: 'bars', keywords: 'invest cuantitativa fintech', desc: { es: 'Fintech Cuantitativa', en: 'Quantitative fintech.', ca: 'Fintech quantitativa.' } },
  { id: 'savings-runway', title: 'Savings & Runway', host: 'savings.trujillomingorance.com', url: 'https://savings.trujillomingorance.com', icon: 'card', keywords: 'savings finanzas zero-knowledge', desc: { es: 'Finanzas Zero-Knowledge', en: 'Zero-knowledge finance.', ca: 'Finances zero-knowledge.' } },
  { id: 'focusguard', title: 'FocusGuard & AdShield', host: 'focusguard.trujillomingorance.com', url: 'https://focusguard.trujillomingorance.com', icon: 'shield', keywords: 'focusguard adshield dns zero-trust', desc: { es: 'DoH Zero-Trust', en: 'Zero-Trust DoH.', ca: 'DoH Zero-Trust.' } },
  { id: 'trujillo-guides', title: 'Engineering Guides', host: 'guides.trujillomingorance.com', url: 'https://guides.trujillomingorance.com', icon: 'book', keywords: 'guias guides runbooks devops', desc: { es: 'Runbooks DevOps', en: 'DevOps runbooks.', ca: 'Runbooks de DevOps.' } },
  { id: 'atm-tools', title: 'ATM Tools', host: 'tools.trujillomingorance.com', url: 'https://tools.trujillomingorance.com', icon: 'wrench', keywords: 'tools herramientas utilities', desc: { es: 'Utilidades Web', en: 'Web utilities.', ca: 'Utilitats web.' } },
  { id: 'nutrifit', title: 'NutriFit PWA', host: 'nutri.trujillomingorance.com', url: 'https://nutri.trujillomingorance.com', icon: 'leaf', keywords: 'nutri fitness salud pwa vision', desc: { es: 'Salud / Visión IA', en: 'Health / vision AI.', ca: 'Salut / visió IA.' } },
  { id: 'open-sentinel', title: 'Open Sentinel', host: 'github.com/ATM-Software-Labs/open-sentinel', url: 'https://github.com/ATM-Software-Labs/open-sentinel', icon: 'sentinel', keywords: 'open sentinel sdk security', desc: { es: 'SDK Ciberseguridad', en: 'Security SDK.', ca: 'SDK de ciberseguretat.' } }
];

const LOCALES = {
  es: {
    id: 'es',
    path: '/',
    htmlLang: 'es',
    ogLocale: 'es_ES',
    inLanguage: 'es',
    hub: 'https://trujillomingorance.com/',
    title: 'ATM Labs · Ecosistema Trujillo Mingorance',
    description: 'Directorio de servicios en producción: IA, reescritura, finanzas familiares, documentación y seguridad perimetral.',
    ogAlt: 'Directorio de servicios en producción de ATM Labs.',
    skip: 'Saltar al contenido',
    navLabel: 'Secciones',
    langLabel: 'Idioma',
    directory: 'Directorio',
    kicker: 'Directorio',
    h1: 'Servicios en producción',
    statement: 'IA, reescritura, finanzas familiares, documentación y seguridad perimetral en el dominio trujillomingorance.com.',
    phrases: ['directorio del ecosistema', 'servicios en producción', 'herramientas que se pueden operar'],
    stackLabel: 'Ámbitos',
    stack: ['IA', 'Documentación', 'Finanzas', 'Seguridad'],
    h2: 'Servicios',
    lead: 'El listado sale del catálogo publicado. En línea: el host contestó. Sin respuesta: no contestó a tiempo. No es una cifra de disponibilidad.',
    searchLabel: 'Buscar un servicio',
    placeholder: 'Buscar un servicio…',
    clear: 'Limpiar búsqueda',
    emptyTitle: 'Sin resultados',
    emptyBefore: 'Nada coincide con “',
    emptyAfter: '”.',
    reset: 'Ver principales',
    hint: 'Con el foco en una ficha, las flechas mueven la selección.',
    noscript: 'Sin JavaScript el directorio estático sigue disponible. La comprobación de alcance no se ejecuta.',
    footerLabel: 'Perfiles',
    newTab: 'se abre en una pestaña nueva',
    hubLabel: 'ATM Software Labs, hub',
    checking: 'comprobando',
    online: 'en línea',
    offline: 'sin respuesta',
    repo: 'repositorio',
    notFound: {
      title: 'Ruta no encontrada · ATM Labs',
      h1: 'Ruta no encontrada',
      desc: 'No hay un servicio publicado en esta ruta de labs.trujillomingorance.com.',
      host: 'Host',
      path: 'Ruta',
      time: 'Fecha',
      status: 'Estado',
      copy: 'Copiar diagnóstico',
      copied: 'Copiado',
      back: 'Volver atrás',
      home: 'Ir al directorio',
      services: 'Servicios publicados',
      servicesLead: 'Los mismos destinos que el directorio.',
      count: '{n} servicios publicados'
    }
  },
  en: {
    id: 'en',
    path: '/en/',
    htmlLang: 'en',
    ogLocale: 'en_US',
    inLanguage: 'en',
    hub: 'https://trujillomingorance.com/en/',
    title: 'ATM Labs · Trujillo Mingorance ecosystem',
    description: 'Directory of services in production: AI, rewriting, household finance, documentation, and perimeter security.',
    ogAlt: 'ATM Labs directory of services in production.',
    skip: 'Skip to content',
    navLabel: 'Sections',
    langLabel: 'Language',
    directory: 'Directory',
    kicker: 'Directory',
    h1: 'Services in production',
    statement: 'AI, rewriting, household finance, documentation, and perimeter security on trujillomingorance.com.',
    phrases: ['ecosystem directory', 'services in production', 'tools that can be operated'],
    stackLabel: 'Areas',
    stack: ['AI', 'Documentation', 'Finance', 'Security'],
    h2: 'Services',
    lead: 'The list comes from the published catalog. Online: the host answered. No response: it did not answer in time. This is not an availability figure.',
    searchLabel: 'Search services',
    placeholder: 'Search services…',
    clear: 'Clear search',
    emptyTitle: 'No results',
    emptyBefore: 'Nothing matches “',
    emptyAfter: '”.',
    reset: 'Show the directory',
    hint: 'With a card focused, the arrow keys move the selection.',
    noscript: 'Without JavaScript the static directory stays available. The reachability check does not run.',
    footerLabel: 'Profiles',
    newTab: 'opens in a new tab',
    hubLabel: 'ATM Software Labs, hub',
    checking: 'checking',
    online: 'online',
    offline: 'no response',
    repo: 'repository',
    notFound: {
      title: 'Route not found · ATM Labs',
      h1: 'Route not found',
      desc: 'No published service exists at this labs.trujillomingorance.com route.',
      host: 'Host',
      path: 'Path',
      time: 'Time',
      status: 'Status',
      copy: 'Copy diagnostic',
      copied: 'Copied',
      back: 'Go back',
      home: 'Back to the directory',
      services: 'Published services',
      servicesLead: 'The same destinations as the directory.',
      count: '{n} published services'
    }
  },
  ca: {
    id: 'ca',
    path: '/ca/',
    htmlLang: 'ca',
    ogLocale: 'ca_ES',
    inLanguage: 'ca',
    hub: 'https://trujillomingorance.com/ca/',
    title: 'ATM Labs · Ecosistema Trujillo Mingorance',
    description: 'Directori de serveis en producció: IA, reescriptura, finances familiars, documentació i seguretat perimetral.',
    ogAlt: 'Directori de serveis en producció d’ATM Labs.',
    skip: 'Salta al contingut',
    navLabel: 'Seccions',
    langLabel: 'Idioma',
    directory: 'Directori',
    kicker: 'Directori',
    h1: 'Serveis en producció',
    statement: 'IA, reescriptura, finances familiars, documentació i seguretat perimetral al domini trujillomingorance.com.',
    phrases: ['directori de l’ecosistema', 'serveis en producció', 'eines que es poden operar'],
    stackLabel: 'Àmbits',
    stack: ['IA', 'Documentació', 'Finances', 'Seguretat'],
    h2: 'Serveis',
    lead: 'La llista surt del catàleg publicat. En línia: l’amfitrió ha respost. Sense resposta: no ha respost a temps. No és una xifra de disponibilitat.',
    searchLabel: 'Cercar un servei',
    placeholder: 'Cercar un servei…',
    clear: 'Netejar la cerca',
    emptyTitle: 'Sense resultats',
    emptyBefore: 'Res no coincideix amb «',
    emptyAfter: '».',
    reset: 'Veure el directori',
    hint: 'Amb el focus en una fitxa, les fletxes mouen la selecció.',
    noscript: 'Sense JavaScript el directori estàtic continua disponible. La comprovació d’abast no s’executa.',
    footerLabel: 'Perfils',
    newTab: 's’obre en una pestanya nova',
    hubLabel: 'ATM Software Labs, hub',
    checking: 'comprovant',
    online: 'en línia',
    offline: 'sense resposta',
    repo: 'repositori',
    notFound: {
      title: 'Ruta no trobada · ATM Labs',
      h1: 'Ruta no trobada',
      desc: 'No hi ha cap servei publicat en aquesta ruta de labs.trujillomingorance.com.',
      host: 'Amfitrió',
      path: 'Ruta',
      time: 'Data',
      status: 'Estat',
      copy: 'Copiar el diagnòstic',
      copied: 'Copiat',
      back: 'Tornar enrere',
      home: 'Anar al directori',
      services: 'Serveis publicats',
      servicesLead: 'Les mateixes destinacions que el directori.',
      count: '{n} serveis publicats'
    }
  }
};

function esc(value) {
  return String(value).replace(/[&<>"']/g, function (char) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char];
  });
}

function json(value) {
  return JSON.stringify(value).replace(/</g, '\\u003c');
}

function icon(name) {
  return '<svg class="hub-icon" viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" focusable="false">' + (ICONS[name] || ICONS.generic) + '</svg>';
}

function linkable(url) {
  // The gateway root answers HTTP 404. Keep the service in the directory and do not link it.
  return url !== 'https://api.trujillomingorance.com' && url !== 'https://api.trujillomingorance.com/';
}

function cards(locale) {
  return SERVICES.map(function (service) {
    var open = linkable(service.url)
      ? '<a class="hub-card" data-hub-item data-id="' + esc(service.id) + '" data-keywords="' + esc(service.keywords) + '" href="' + esc(service.url) + '">'
      : '<div class="hub-card" data-hub-item data-id="' + esc(service.id) + '" data-keywords="' + esc(service.keywords) + '" tabindex="0">';
    var close = linkable(service.url) ? '</a>' : '</div>';
    return [
      '          <li>',
      '            ' + open,
      '              <span class="hub-top">' + icon(service.icon) + '<span class="hub-host">' + esc(service.host) + '</span></span>',
      '              <span class="hub-name">' + esc(service.title) + '</span>',
      '              <span class="hub-desc" data-i18n-desc="' + esc(service.id) + '">' + esc(service.desc[locale]) + '</span>',
      '            ' + close,
      '          </li>'
    ].join('\n');
  }).join('\n');
}

function langNav(current) {
  return ['es', 'en', 'ca'].map(function (id) {
    const locale = LOCALES[id];
    const label = id === 'es' ? 'Español' : id === 'en' ? 'English' : 'Català';
    const currentAttr = id === current ? ' aria-current="page"' : '';
    return '<a href="' + locale.path + '" hreflang="' + id + '" lang="' + id + '" data-lang-switch="' + id + '"' + currentAttr + '>' + id.toUpperCase() + '<span class="visually-hidden"> ' + label + '</span></a>';
  }).join('');
}

function header(locale, current) {
  var directoryHref = current === '404' ? '/#directorio' : '#directorio';
  return [
    '  <a class="skip" id="skipLink" href="#contenido">' + esc(locale.skip) + '</a>',
    '  <div class="grid-overlay" aria-hidden="true"></div>',
    '  <header class="site-header">',
    '    <div class="wrap header-row">',
    '      <a class="brand" id="brandLink" href="' + esc(locale.hub) + '" aria-label="' + esc(locale.hubLabel) + '">',
    '        <img class="brand-lockup" src="/assets/lockup.svg?v=' + VERSION + '" alt="" width="351" height="168">',
    '      </a>',
    '      <div class="header-tools">',
    '        <nav class="site-nav" id="siteNav" aria-label="' + esc(locale.navLabel) + '">',
    '          <a id="navDirectory" href="' + directoryHref + '">' + esc(locale.directory) + '</a>',
    '        </nav>',
    '        <nav class="lang" id="langNav" aria-label="' + esc(locale.langLabel) + '">' + langNav(current === '404' ? 'es' : locale.id) + '</nav>',
    '      </div>',
    '    </div>',
    '  </header>'
  ].join('\n');
}

function footer(locale) {
  return [
    '  <footer class="site-footer">',
    '    <div class="wrap">',
    '      <nav class="footer-nav" id="footerNav" aria-label="' + esc(locale.footerLabel) + '">',
    '        <a href="' + GITHUB + '" rel="me noopener noreferrer" target="_blank">GitHub<span class="visually-hidden"> (' + esc(locale.newTab) + ')</span></a>',
    '        <a href="' + LINKEDIN + '" rel="me noopener noreferrer" target="_blank">LinkedIn<span class="visually-hidden"> (' + esc(locale.newTab) + ')</span></a>',
    '      </nav>',
    '      <p class="credits">© 2026 ATM Software Labs · Alberto Trujillo Mingorance</p>',
    '    </div>',
    '  </footer>'
  ].join('\n');
}

function head(locale) {
  const canonical = ORIGIN + (locale.path === '/' ? '/' : locale.path);
  const boot = locale.id === 'es'
    ? '  <script>(function(){try{var h=location.hostname;if(h!=="labs.trujillomingorance.com"&&h!=="www.labs.trujillomingorance.com")return;var p=location.pathname;if(p!=="/"&&p!=="/index.html")return;if(localStorage.getItem("atm_lang_choice")||localStorage.getItem("atm_lang_auto"))return;var n=(navigator.language||"").toLowerCase();var w=n.indexOf("en")===0?"en":n.indexOf("ca")===0?"ca":"es";var ua=navigator.userAgent||"";var bot=navigator.webdriver||/bot|crawl|spider|slurp|lighthouse|headless/i.test(ua);localStorage.setItem("atm_lang_auto",w);if(bot||w==="es")return;location.replace(w==="en"?"/en/":"/ca/");}catch(e){}})();</script>\n'
    : '';
  return [
    '<!DOCTYPE html>',
    '<html lang="' + locale.htmlLang + '">',
    '<head>',
    '  <meta charset="UTF-8">',
    '  <meta name="viewport" content="width=device-width, initial-scale=1.0">',
    '  <title>' + esc(locale.title) + '</title>',
    '  <meta name="description" content="' + esc(locale.description) + '">',
    '  <meta name="author" content="Alberto Trujillo Mingorance">',
    '  <meta name="color-scheme" content="dark">',
    '  <meta name="theme-color" content="#07080b">',
    '  <meta name="robots" content="index, follow">',
    '  <link rel="canonical" href="' + canonical + '">',
    '  <link rel="alternate" hreflang="es" href="' + ORIGIN + '/">',
    '  <link rel="alternate" hreflang="en" href="' + ORIGIN + '/en/">',
    '  <link rel="alternate" hreflang="ca" href="' + ORIGIN + '/ca/">',
    '  <link rel="alternate" hreflang="x-default" href="' + ORIGIN + '/">',
    '  <meta property="og:type" content="website">',
    '  <meta property="og:locale" content="' + locale.ogLocale + '">',
    '  <meta property="og:locale:alternate" content="es_ES">',
    '  <meta property="og:locale:alternate" content="en_US">',
    '  <meta property="og:locale:alternate" content="ca_ES">',
    '  <meta property="og:site_name" content="ATM Software Labs">',
    '  <meta property="og:title" content="' + esc(locale.title) + '">',
    '  <meta property="og:description" content="' + esc(locale.description) + '">',
    '  <meta property="og:url" content="' + canonical + '">',
    '  <meta property="og:image" content="' + ORIGIN + '/assets/og.png?v=' + VERSION + '">',
    '  <meta property="og:image:width" content="1200">',
    '  <meta property="og:image:height" content="630">',
    '  <meta property="og:image:alt" content="' + esc(locale.ogAlt) + '">',
    '  <meta name="twitter:card" content="summary_large_image">',
    '  <meta name="twitter:title" content="' + esc(locale.title) + '">',
    '  <meta name="twitter:description" content="' + esc(locale.description) + '">',
    '  <meta name="twitter:image" content="' + ORIGIN + '/assets/og.png?v=' + VERSION + '">',
    '  <link rel="icon" href="/favicon.ico?v=' + VERSION + '" sizes="32x32">',
    '  <link rel="icon" href="/favicon.svg?v=' + VERSION + '" type="image/svg+xml">',
    '  <link rel="apple-touch-icon" href="/apple-touch-icon.png?v=' + VERSION + '">',
    '  <link rel="manifest" href="/site.webmanifest?v=' + VERSION + '">',
    '  <link rel="preload" href="/assets/fonts/inter-latin-400-normal.woff2" as="font" type="font/woff2" crossorigin>',
    '  <link rel="preload" href="/assets/fonts/jetbrains-mono-latin-400-normal.woff2" as="font" type="font/woff2" crossorigin>',
    '  <link rel="stylesheet" href="/css/tokens.css?v=' + VERSION + '">',
    '  <link rel="stylesheet" href="/css/labs.css?v=' + VERSION + '">',
    '  <meta http-equiv="Content-Security-Policy" content="default-src &#39;self&#39;; script-src &#39;self&#39; &#39;unsafe-inline&#39;; style-src &#39;self&#39; &#39;unsafe-inline&#39;; img-src &#39;self&#39; data:; font-src &#39;self&#39;; connect-src &#39;self&#39; https://trujillomingorance.com https://*.trujillomingorance.com; base-uri &#39;self&#39;; form-action &#39;self&#39;; object-src &#39;none&#39;">',
    boot.trimEnd(),
    '  <script type="application/ld+json">',
    json({
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'Organization',
          name: 'ATM Software Labs',
          url: 'https://trujillomingorance.com/',
          inLanguage: locale.inLanguage,
          sameAs: [GITHUB]
        },
        {
          '@type': 'WebSite',
          name: 'ATM Labs',
          url: canonical,
          inLanguage: locale.inLanguage,
          publisher: { '@type': 'Organization', name: 'ATM Software Labs', url: 'https://trujillomingorance.com/' }
        }
      ]
    }),
    '  </script>',
    '</head>'
  ].filter(function (line) { return line !== ''; }).join('\n');
}

function page(locale) {
  const stack = locale.stack.map(function (item) { return '        <li>' + esc(item) + '</li>'; }).join('\n');
  return [
    head(locale),
    '<body>',
    header(locale, locale.id),
    '  <main id="contenido">',
    '    <section class="hero wrap" aria-labelledby="identidad">',
    '      <p class="kicker"><span>01</span>' + esc(locale.kicker) + '</p>',
    '      <h1 id="identidad">' + esc(locale.h1) + '</h1>',
    '      <p class="statement">' + esc(locale.statement) + '</p>',
    '      <p class="term" aria-hidden="true"><span class="term-prompt">atm@labs:~$</span> <span id="term-line"></span><span class="caret"></span></p>',
    '      <ul class="stack" aria-label="' + esc(locale.stackLabel) + '">',
    stack,
    '      </ul>',
    '      <form class="search-row" role="search" action="#directorio">',
    '        <label class="visually-hidden" for="projectSearch">' + esc(locale.searchLabel) + '</label>',
    '        <input class="search-field" type="search" id="projectSearch" name="q" placeholder="' + esc(locale.placeholder) + '" autocomplete="off" spellcheck="false">',
    '        <button id="clearSearch" class="btn" type="button" hidden>' + esc(locale.clear) + '</button>',
    '      </form>',
    '    </section>',
    '    <section class="block" id="directorio" aria-labelledby="directorio-titulo">',
    '      <div class="wrap">',
    '        <p class="section-kicker"><span>02</span>' + esc(locale.kicker) + '</p>',
    '        <h2 id="directorio-titulo">' + esc(locale.h2) + '</h2>',
    '        <p class="section-lead">' + esc(locale.lead) + '</p>',
    '        <p class="visually-hidden" id="hub-hint">' + esc(locale.hint) + '</p>',
    '        <ul class="hub-grid" id="hub" aria-describedby="hub-hint">',
    cards(locale.id),
    '        </ul>',
    '        <div id="noResults" class="empty" hidden>',
    '          <h3>' + esc(locale.emptyTitle) + '</h3>',
    '          <p>' + esc(locale.emptyBefore) + '<span id="noResultsQuery"></span>' + esc(locale.emptyAfter) + '</p>',
    '          <button class="btn" id="btnResetFilters" type="button">' + esc(locale.reset) + '</button>',
    '        </div>',
    '        <noscript><p class="note">' + esc(locale.noscript) + '</p></noscript>',
    '      </div>',
    '    </section>',
    '  </main>',
    footer(locale),
    '  <script src="/js/copy.js?v=' + VERSION + '" defer></script>',
    '  <script src="/js/filter.js?v=' + VERSION + '" defer></script>',
    '  <script src="/js/lang.js?v=' + VERSION + '" defer></script>',
    '  <script src="/js/directory.js?v=' + VERSION + '" defer></script>',
    '</body>',
    '</html>',
    ''
  ].join('\n');
}

function notFound() {
  const locale = LOCALES.es;
  const ui = locale.notFound;
  return [
    '<!DOCTYPE html>',
    '<html lang="es">',
    '<head>',
    '  <meta charset="UTF-8">',
    '  <meta name="viewport" content="width=device-width, initial-scale=1.0">',
    '  <title id="pageTitle">' + esc(ui.title) + '</title>',
    '  <meta name="robots" content="noindex, nofollow">',
    '  <meta name="color-scheme" content="dark">',
    '  <meta name="theme-color" content="#07080b">',
    '  <link rel="icon" href="/favicon.ico?v=' + VERSION + '" sizes="32x32">',
    '  <link rel="icon" href="/favicon.svg?v=' + VERSION + '" type="image/svg+xml">',
    '  <link rel="apple-touch-icon" href="/apple-touch-icon.png?v=' + VERSION + '">',
    '  <link rel="stylesheet" href="/css/tokens.css?v=' + VERSION + '">',
    '  <link rel="stylesheet" href="/css/labs.css?v=' + VERSION + '">',
    '  <meta http-equiv="Content-Security-Policy" content="default-src &#39;self&#39;; script-src &#39;self&#39; &#39;unsafe-inline&#39;; style-src &#39;self&#39; &#39;unsafe-inline&#39;; img-src &#39;self&#39; data:; font-src &#39;self&#39;; connect-src &#39;self&#39; https://trujillomingorance.com https://*.trujillomingorance.com; base-uri &#39;self&#39;; form-action &#39;self&#39;; object-src &#39;none&#39;">',
    '</head>',
    '<body data-page="404">',
    header(locale, '404'),
    '  <main id="contenido">',
    '    <section class="hero wrap" id="diagnostico" aria-labelledby="errorTitle">',
    '      <p class="kicker"><span>404</span>ATM Labs</p>',
    '      <h1 id="errorTitle">' + esc(ui.h1) + '</h1>',
    '      <p class="statement" id="errorDesc">' + esc(ui.desc) + '</p>',
    '      <dl class="facts">',
    '        <div><dt id="labelHost">' + esc(ui.host) + '</dt><dd id="teleHost">labs.trujillomingorance.com</dd></div>',
    '        <div><dt id="labelPath">' + esc(ui.path) + '</dt><dd id="telePath">/</dd></div>',
    '        <div><dt id="labelTime">' + esc(ui.time) + '</dt><dd id="teleTime">—</dd></div>',
    '        <div><dt id="labelStatus">' + esc(ui.status) + '</dt><dd id="teleStatus">HTTP 404</dd></div>',
    '      </dl>',
    '      <div class="actions">',
    '        <a class="btn" id="homeLink" href="/">' + esc(ui.home) + '</a>',
    '        <button id="btnCopyDiag" class="btn" type="button"><span id="copyBtnText">' + esc(ui.copy) + '</span></button>',
    '        <button id="btnBack" class="btn" type="button" data-home="/">' + esc(ui.back) + '</button>',
    '      </div>',
    '    </section>',
    '    <section class="block" id="directorio" aria-labelledby="servicesTitle">',
    '      <div class="wrap">',
    '        <p class="section-kicker"><span>02</span>' + esc(locale.directory) + '</p>',
    '        <h2 id="servicesTitle">' + esc(ui.services) + '</h2>',
    '        <p class="section-lead" id="servicesLead">' + esc(ui.servicesLead) + '</p>',
    '        <p class="note" id="servicesCount">' + esc(ui.count.replace('{n}', String(SERVICES.length))) + '</p>',
    '        <ul class="hub-grid" id="servicesGrid">',
    cards('es'),
    '        </ul>',
    '      </div>',
    '    </section>',
    '  </main>',
    footer(locale),
    '  <script src="/js/copy.js?v=' + VERSION + '" defer></script>',
    '  <script src="/js/filter.js?v=' + VERSION + '" defer></script>',
    '  <script src="/js/lang.js?v=' + VERSION + '" defer></script>',
    '  <script src="/js/not-found.js?v=' + VERSION + '" defer></script>',
    '</body>',
    '</html>',
    ''
  ].join('\n');
}

function copyScript() {
  const descriptions = {};
  ['es', 'en', 'ca'].forEach(function (id) {
    descriptions[id] = {};
    SERVICES.forEach(function (service) {
      descriptions[id][service.id] = service.desc[id];
    });
  });
  const payload = {};
  ['es', 'en', 'ca'].forEach(function (id) {
    const locale = LOCALES[id];
    payload[id] = {
      phrases: locale.phrases,
      checking: locale.checking,
      online: locale.online,
      offline: locale.offline,
      repo: locale.repo,
      descriptions: descriptions[id],
      notFound: locale.notFound,
      skip: locale.skip,
      navLabel: locale.navLabel,
      langLabel: locale.langLabel,
      directory: locale.directory,
      footerLabel: locale.footerLabel,
      hub: locale.hub,
      hubLabel: locale.hubLabel
    };
  });
  const iconMap = { generic: ICONS.generic };
  SERVICES.forEach(function (service) { iconMap[service.id] = ICONS[service.icon]; });
  return [
    '/* Generated by scripts/build-pages.js. Locale copy and card icons. */',
    'window.ATM_COPY = ' + json(payload) + ';',
    'window.ATM_ICONS = ' + json(iconMap) + ';',
    ''
  ].join('\n');
}

function write(file, contents) {
  const target = path.join(ROOT, file);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, contents);
}

write('public/index.html', page(LOCALES.es));
write('public/en/index.html', page(LOCALES.en));
write('public/ca/index.html', page(LOCALES.ca));
write('public/404.html', notFound());
write('public/js/copy.js', copyScript());

console.log('Wrote es, en, ca, 404, and copy.js');
