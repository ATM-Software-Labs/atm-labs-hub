#!/usr/bin/env node
'use strict';

const fs = require('fs');
// Critical CSS is inlined so the first paint does not wait on two stylesheet requests (public/css stays the source).
const INLINE_CSS = ['tokens.css', 'labs.css', 'atm-net.css'].map(function (f) { return require('fs').readFileSync(require('path').join(__dirname, '..', 'public', 'css', f), 'utf8'); }).join('\n').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s*\n\s*/g, '\n');
const path = require('path');
const { atmNet } = require('./atm-net.cjs');
const LEGAL = { es: ['https://trujillomingorance.com/privacy', 'https://trujillomingorance.com/terms'], en: ['https://trujillomingorance.com/en/privacy/', 'https://trujillomingorance.com/en/terms/'], ca: ['https://trujillomingorance.com/ca/privacy/', 'https://trujillomingorance.com/ca/terms/'] };

const ROOT = path.join(__dirname, '..');
const VERSION = '20261018a';
const ORIGIN = 'https://labs.trujillomingorance.com';
const GITHUB = 'https://github.com/ATM-Software-Labs';
const LINKEDIN = 'https://www.linkedin.com/in/alberto-trujillo-mingorance-288237266';

const CATALOG = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/services.json'), 'utf8'));
const SERVICES = CATALOG.services.slice().sort(function (a, b) { return a.rank - b.rank; });

const GITHUB_ICON = '<svg class="mark" viewBox="0 0 16 16" width="16" height="16" aria-hidden="true" focusable="false"><path fill="currentColor" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92-.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8z"></path></svg>';
const CLEAR_ICON = '<svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true" focusable="false"><path fill="currentColor" d="M3.72 3.72a.75.75 0 0 1 1.06 0L8 6.94l3.22-3.22a.75.75 0 1 1 1.06 1.06L9.06 8l3.22 3.22a.75.75 0 1 1-1.06 1.06L8 9.06l-3.22 3.22a.75.75 0 0 1-1.06-1.06L6.94 8 3.72 4.78a.75.75 0 0 1 0-1.06Z"></path></svg>';

const CATEGORY_ORDER = ['all', 'ai', 'finance', 'security', 'docs', 'tools', 'platform', 'profile'];

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
    kicker: 'Catálogo',
    h1: 'Servicios en producción',
    statement: 'IA, reescritura, finanzas familiares, documentación y seguridad perimetral en el dominio trujillomingorance.com.',
    h2: 'Servicios',
    lead: 'En línea: el host contestó. Sin respuesta: no contestó a tiempo. No es una cifra de disponibilidad.',
    searchLabel: 'Buscar un servicio',
    placeholder: 'Buscar un servicio…',
    clear: 'Limpiar búsqueda',
    filtersLabel: 'Categorías',
    categories: {
      all: 'Todos',
      ai: 'IA',
      finance: 'Finanzas',
      security: 'Seguridad',
      docs: 'Documentación',
      tools: 'Herramientas',
      platform: 'Plataforma',
      profile: 'Perfil'
    },
    cols: {
      status: 'Estado',
      service: 'Servicio',
      host: 'Host',
      category: 'Categoría',
      stack: 'Stack',
      actions: 'Acciones'
    },
    open: 'Abrir',
    noLink: 'Sin enlace',
    githubLabel: 'Repositorio en GitHub',
    count: '{n} servicios',
    emptyTitle: 'Sin resultados',
    emptyBefore: 'Nada coincide con “',
    emptyAfter: '”.',
    reset: 'Ver el directorio',
    hint: 'Con el foco en un servicio, las flechas mueven la selección.',
    noscript: 'Sin JavaScript el directorio estático sigue disponible. La comprobación de alcance no se ejecuta.',
    footerLabel: 'Perfiles',
    newTab: 'se abre en una pestaña nueva',
    hubLabel: 'ATM Software Labs, hub',
    pending: 'pendiente',
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
    kicker: 'Catalog',
    h1: 'Services in production',
    statement: 'AI, rewriting, household finance, documentation, and perimeter security on trujillomingorance.com.',
    h2: 'Services',
    lead: 'Online: the host answered. No response: it did not answer in time. This is not an availability figure.',
    searchLabel: 'Search services',
    placeholder: 'Search services…',
    clear: 'Clear search',
    filtersLabel: 'Categories',
    categories: {
      all: 'All',
      ai: 'AI',
      finance: 'Finance',
      security: 'Security',
      docs: 'Documentation',
      tools: 'Tools',
      platform: 'Platform',
      profile: 'Profile'
    },
    cols: {
      status: 'Status',
      service: 'Service',
      host: 'Host',
      category: 'Category',
      stack: 'Stack',
      actions: 'Actions'
    },
    open: 'Open',
    noLink: 'No link',
    githubLabel: 'Repository on GitHub',
    count: '{n} services',
    emptyTitle: 'No results',
    emptyBefore: 'Nothing matches “',
    emptyAfter: '”.',
    reset: 'Show the directory',
    hint: 'With a service focused, the arrow keys move the selection.',
    noscript: 'Without JavaScript the static directory stays available. The reachability check does not run.',
    footerLabel: 'Profiles',
    newTab: 'opens in a new tab',
    hubLabel: 'ATM Software Labs, hub',
    pending: 'pending',
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
    kicker: 'Catàleg',
    h1: 'Serveis en producció',
    statement: 'IA, reescriptura, finances familiars, documentació i seguretat perimetral al domini trujillomingorance.com.',
    h2: 'Serveis',
    lead: 'En línia: l’amfitrió ha respost. Sense resposta: no ha respost a temps. No és una xifra de disponibilitat.',
    searchLabel: 'Cercar un servei',
    placeholder: 'Cercar un servei…',
    clear: 'Netejar la cerca',
    filtersLabel: 'Categories',
    categories: {
      all: 'Tots',
      ai: 'IA',
      finance: 'Finances',
      security: 'Seguretat',
      docs: 'Documentació',
      tools: 'Eines',
      platform: 'Plataforma',
      profile: 'Perfil'
    },
    cols: {
      status: 'Estat',
      service: 'Servei',
      host: 'Host',
      category: 'Categoria',
      stack: 'Stack',
      actions: 'Accions'
    },
    open: 'Obre',
    noLink: 'Sense enllaç',
    githubLabel: 'Repositori a GitHub',
    count: '{n} serveis',
    emptyTitle: 'Sense resultats',
    emptyBefore: 'Res no coincideix amb «',
    emptyAfter: '».',
    reset: 'Veure el directori',
    hint: 'Amb el focus en un servei, les fletxes mouen la selecció.',
    noscript: 'Sense JavaScript el directori estàtic continua disponible. La comprovació d’abast no s’executa.',
    footerLabel: 'Perfils',
    newTab: 's’obre en una pestanya nova',
    hubLabel: 'ATM Software Labs, hub',
    pending: 'pendent',
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

function repoUrl(service) {
  if (!service || service.repoPublic !== true || !service.repo) return '';
  return GITHUB + '/' + service.repo;
}

function rows(localeId) {
  const t = LOCALES[localeId];
  return SERVICES.map(function (service) {
    const repo = repoUrl(service);
    const state = service.probe ? 'pending' : 'repo';
    const stateLabel = service.probe ? t.pending : t.repo;
    const open = service.linkable
      ? '<a class="act act-open" data-hub-item href="' + esc(service.url) + '"><span class="act-label">' + esc(t.open) + '</span><span class="visually-hidden"> ' + esc(service.title) + '</span></a>'
      : '<span class="act act-muted"><span class="act-label">' + esc(t.noLink) + '</span></span>';
    const git = repo
      ? '<a class="act act-git repo-link" href="' + esc(repo) + '" rel="noopener noreferrer" target="_blank" aria-label="' + esc(t.githubLabel) + '">' + GITHUB_ICON + '<span class="visually-hidden"> (' + esc(t.newTab) + ')</span></a>'
      : '';
    const tags = (service.stack || []).map(function (tag) {
      return '<span class="tag">' + esc(tag) + '</span>';
    }).join('');
    const hubItem = service.linkable ? '' : ' data-hub-item tabindex="0"';
    return [
      '            <tr data-id="' + esc(service.id) + '" data-category="' + esc(service.category) + '" data-keywords="' + esc(service.keywords) + '" data-host="' + esc(service.probe ? service.host : '') + '" data-probe="' + (service.probe ? '1' : '0') + '"' + hubItem + '>',
      '              <td class="svc-status" data-state="' + state + '"><span class="dot" aria-hidden="true"></span><span class="js-label">' + esc(stateLabel) + '</span></td>',
      '              <td class="svc-main"><span class="svc-name">' + esc(service.title) + '</span><span class="svc-desc" data-i18n-desc="' + esc(service.id) + '">' + esc(service.desc[localeId]) + '</span></td>',
      '              <td class="svc-host">' + esc(service.host) + '</td>',
      '              <td class="svc-cat" data-cat="' + esc(service.category) + '">' + esc(t.categories[service.category] || service.category) + '</td>',
      '              <td class="svc-stack">' + tags + '</td>',
      '              <td class="svc-actions">' + open + git + '</td>',
      '            </tr>'
    ].join('\n');
  }).join('\n');
}

function chips(locale) {
  return CATEGORY_ORDER.map(function (id) {
    const pressed = id === 'all' ? 'true' : 'false';
    return '<button class="chip" type="button" data-category="' + id + '" aria-pressed="' + pressed + '">' + esc(locale.categories[id]) + '</button>';
  }).join('');
}

function table(locale, tableId) {
  return [
    '        <div class="catalog-scroll">',
    '          <div class="loadbar" aria-hidden="true"></div>',
    '          <table class="catalog" id="' + tableId + '" aria-describedby="hub-hint" aria-busy="false">',
    '            <caption class="visually-hidden">' + esc(locale.h2) + '</caption>',
    '            <thead>',
    '              <tr>',
    '                <th scope="col" id="colStatus">' + esc(locale.cols.status) + '</th>',
    '                <th scope="col" id="colService">' + esc(locale.cols.service) + '</th>',
    '                <th scope="col" id="colHost">' + esc(locale.cols.host) + '</th>',
    '                <th scope="col" id="colCategory">' + esc(locale.cols.category) + '</th>',
    '                <th scope="col" id="colStack">' + esc(locale.cols.stack) + '</th>',
    '                <th scope="col" id="colActions">' + esc(locale.cols.actions) + '</th>',
    '              </tr>',
    '            </thead>',
    '            <tbody>',
    rows(locale.id),
    '            </tbody>',
    '          </table>',
    '        </div>'
  ].join('\n');
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
    '  <header class="site-header">',
    '    <div class="wrap header-row">',
    '      <a class="brand" id="brandLink" href="' + esc(locale.hub) + '" aria-label="' + esc(locale.hubLabel) + '">',
    '        <span class="brand-name" data-notranslate>ATM Labs</span>',
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
    '    </div>',
    '    ' + atmNet('labs', locale.id, LEGAL[locale.id][0], LEGAL[locale.id][1]),
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
    '  <link rel="icon" href="/favicon.svg?v=' + VERSION + '" type="image/svg+xml">',
    '  <link rel="icon" href="/favicon.ico?v=' + VERSION + '" sizes="any">',
    '  <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png?v=' + VERSION + '">',
    '  <link rel="icon" href="/assets/favicon.ico?v=' + VERSION + '" sizes="16x16 32x32 48x48">',
    '  <link rel="apple-touch-icon" href="/apple-touch-icon.png?v=' + VERSION + '">',
    '  <link rel="manifest" href="/site.webmanifest?v=' + VERSION + '">',
    '  <link rel="preload" href="/assets/fonts/inter-latin-400-normal.woff2" as="font" type="font/woff2" crossorigin>',
    '  <link rel="preload" href="/assets/fonts/jetbrains-mono-latin-400-normal.woff2" as="font" type="font/woff2" crossorigin>',
    '  <style>' + INLINE_CSS + '</style>',
    '  <meta http-equiv="Content-Security-Policy" content="default-src &#39;self&#39;; script-src &#39;self&#39; &#39;unsafe-inline&#39; https://static.cloudflareinsights.com; style-src &#39;self&#39; &#39;unsafe-inline&#39;; img-src &#39;self&#39; data:; font-src &#39;self&#39;; connect-src &#39;self&#39; https://trujillomingorance.com https://*.trujillomingorance.com https://cloudflareinsights.com; base-uri &#39;self&#39;; form-action &#39;self&#39;; object-src &#39;none&#39;">',
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
  return [
    head(locale),
    '<body>',
    header(locale, locale.id),
    '  <main id="contenido">',
    '    <section class="hero wrap" aria-labelledby="identidad">',
    '      <div class="hero-brand">',
    '        <img class="hero-avatar" src="/assets/avatar-112.webp?v=' + VERSION + '" alt="ATM Software Labs" width="56" height="56">',
    '        <div class="hero-copy">',
    '          <p class="eyebrow">' + esc(locale.kicker) + '</p>',
    '          <h1 id="identidad">' + esc(locale.h1) + '</h1>',
    '        </div>',
    '      </div>',
    '      <p class="statement">' + esc(locale.statement) + '</p>',
    '    </section>',
    '    <section class="directory wrap" aria-labelledby="directorio-titulo">',
    '      <h2 id="directorio-titulo" class="visually-hidden">' + esc(locale.h2) + '</h2>',
    '      <div class="toolbar" id="directorio">',
    '        <form class="search" role="search" action="#directorio">',
    '          <label class="visually-hidden" for="projectSearch">' + esc(locale.searchLabel) + '</label>',
    '          <input class="search-field" type="search" id="projectSearch" name="q" placeholder="' + esc(locale.placeholder) + '" autocomplete="off" spellcheck="false">',
    '          <kbd class="search-kbd" aria-hidden="true">Ctrl K</kbd>',
    '          <button id="clearSearch" class="search-clear" type="button" hidden aria-label="' + esc(locale.clear) + '">' + CLEAR_ICON + '</button>',
    '        </form>',
    '        <div class="filters" role="toolbar" aria-label="' + esc(locale.filtersLabel) + '">',
    '          ' + chips(locale),
    '        </div>',
    '        <p class="count" id="catalogCount" aria-live="polite">' + esc(locale.count.replace('{n}', String(SERVICES.length))) + '</p>',
    '      </div>',
    '      <p class="status-note">' + esc(locale.lead) + '</p>',
    '      <p class="visually-hidden" id="hub-hint">' + esc(locale.hint) + '</p>',
    table(locale, 'hub'),
    '      <div id="noResults" class="empty" hidden>',
    '        <h3>' + esc(locale.emptyTitle) + '</h3>',
    '        <p>' + esc(locale.emptyBefore) + '<span id="noResultsQuery"></span>' + esc(locale.emptyAfter) + '</p>',
    '        <button class="btn" id="btnResetFilters" type="button">' + esc(locale.reset) + '</button>',
    '      </div>',
    '      <noscript><p class="note">' + esc(locale.noscript) + '</p></noscript>',
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
    '  <link rel="icon" href="/favicon.svg?v=' + VERSION + '" type="image/svg+xml">',
    '  <link rel="icon" href="/favicon.ico?v=' + VERSION + '" sizes="any">',
    '  <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png?v=' + VERSION + '">',
    '  <link rel="icon" href="/assets/favicon.ico?v=' + VERSION + '" sizes="16x16 32x32 48x48">',
    '  <link rel="apple-touch-icon" href="/apple-touch-icon.png?v=' + VERSION + '">',
    '  <style>' + INLINE_CSS + '</style>',
    '  <meta http-equiv="Content-Security-Policy" content="default-src &#39;self&#39;; script-src &#39;self&#39; &#39;unsafe-inline&#39; https://static.cloudflareinsights.com; style-src &#39;self&#39; &#39;unsafe-inline&#39;; img-src &#39;self&#39; data:; font-src &#39;self&#39;; connect-src &#39;self&#39; https://trujillomingorance.com https://*.trujillomingorance.com https://cloudflareinsights.com; base-uri &#39;self&#39;; form-action &#39;self&#39;; object-src &#39;none&#39;">',
    '</head>',
    '<body data-page="404">',
    header(locale, '404'),
    '  <main id="contenido">',
    '    <section class="hero wrap" id="diagnostico" aria-labelledby="errorTitle">',
    '      <p class="eyebrow"><span>404</span> ATM Labs</p>',
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
    '    <section class="directory wrap" id="directorio" aria-labelledby="servicesTitle">',
    '      <h2 id="servicesTitle">' + esc(ui.services) + '</h2>',
    '      <p class="status-note" id="servicesLead">' + esc(ui.servicesLead) + '</p>',
    '      <p class="count" id="servicesCount">' + esc(ui.count.replace('{n}', String(SERVICES.length))) + '</p>',
    '      <p class="visually-hidden" id="hub-hint">' + esc(locale.hint) + '</p>',
    table(locale, 'servicesGrid'),
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
      checking: locale.checking,
      online: locale.online,
      offline: locale.offline,
      pending: locale.pending,
      repo: locale.repo,
      open: locale.open,
      noLink: locale.noLink,
      githubLabel: locale.githubLabel,
      categories: locale.categories,
      count: locale.count,
      descriptions: descriptions[id],
      notFound: locale.notFound,
      skip: locale.skip,
      navLabel: locale.navLabel,
      langLabel: locale.langLabel,
      directory: locale.directory,
      footerLabel: locale.footerLabel,
      hub: locale.hub,
      hubLabel: locale.hubLabel,
      cols: locale.cols
    };
  });
  return [
    '/* Generated by scripts/build-pages.js. Locale copy for the directory. */',
    'window.ATM_COPY = ' + json(payload) + ';',
    ''
  ].join('\n');
}

function write(file, contents) {
  const target = path.join(ROOT, file);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, contents);
}

function bumpManifest() {
  const file = path.join(ROOT, 'public/site.webmanifest');
  const manifest = fs.readFileSync(file, 'utf8').replace(/\?v=\d{8}[a-z0-9]*/g, '?v=' + VERSION);
  fs.writeFileSync(file, manifest);
}

write('public/index.html', page(LOCALES.es));
write('public/en/index.html', page(LOCALES.en));
write('public/ca/index.html', page(LOCALES.ca));
write('public/404.html', notFound());
write('public/js/copy.js', copyScript());
bumpManifest();

console.log('Wrote es, en, ca, 404, and copy.js (' + SERVICES.length + ' services)');
