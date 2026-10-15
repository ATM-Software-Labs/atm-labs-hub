'use strict';

const fs = require('fs');
const path = require('path');
const assert = require('node:assert/strict');
const test = require('node:test');

const root = path.join(__dirname, '..');

function read(file) {
  return fs.readFileSync(path.join(root, file), 'utf8');
}

require(path.join(root, 'public/js/lang.js'));
const filter = require(path.join(root, 'public/js/filter.js'));

const pages = {
  es: 'public/index.html',
  en: 'public/en/index.html',
  ca: 'public/ca/index.html'
};

test('language paths remember the hub switcher contract', function () {
  const swap = globalThis.ATMLang.swapPath;
  assert.equal(globalThis.ATMLang.choiceKey, 'atm_lang_choice');
  assert.equal(swap('/', 'en'), '/en/');
  assert.equal(swap('/', 'ca'), '/ca/');
  assert.equal(swap('/en/missing', 'es'), '/missing');
  assert.equal(swap('/en/missing', 'ca'), '/ca/missing');
  assert.equal(swap('/ca/', 'es'), '/');
  assert.equal(swap('/foo/', 'en'), '/en/foo');
});

test('client filter keeps ecosystem hosts and drops pages.dev', function () {
  assert.equal(filter.professionalHost('https://ai.trujillomingorance.com/x'), 'ai.trujillomingorance.com');
  assert.equal(filter.professionalHost('https://demo.pages.dev'), '');
  assert.equal(filter.probeHost('https://github.com/ATM-Software-Labs/open-sentinel'), '');
  assert.equal(filter.probeHost('https://guides.trujillomingorance.com'), 'guides.trujillomingorance.com');
  assert.equal(filter.isOwnProject({ id: 'x', repo: 'https://github.com/ATM-Software-Labs/x' }), true);
  assert.equal(filter.isOwnProject({ domain: 'evil.example' }), false);
  assert.equal(filter.matches({ title: 'Rewrite AI', description: '', keywords: 'nlp', domain: 'rewrite.trujillomingorance.com' }, 'nlp'), true);
  assert.equal(filter.matches({ title: 'Rewrite AI', description: '', keywords: '', domain: '' }, 'savings'), false);
});

test('published catalog stays on owned hosts', function () {
  const data = JSON.parse(read('data/services.json'));
  const items = data.services;
  const ids = items.map(function (item) { return item.id; });
  ['alberto-portfolio', 'trujillo-ai-studio', 'rewrite-ai', 'focusguard', 'trujillo-guides', 'invest-platform', 'savings-runway', 'atm-tools', 'nutrifit', 'open-sentinel', 'api-gateway', 'labs', 'apex'].forEach(function (id) {
    assert.ok(ids.includes(id), id);
  });
  assert.equal(ids.includes('neurolock'), false);
  assert.equal(ids.includes('rocky-setter'), false);
  items.forEach(function (item) {
    assert.match(item.url, /^https:\/\//);
    const host = item.url.replace(/^https:\/\//, '').split('/')[0];
    assert.ok(host === 'github.com' || host === 'trujillomingorance.com' || host.endsWith('.trujillomingorance.com'), item.url);
  });
  const api = read('functions/api/projects.js');
  assert.match(api, /data\/services\.json/);
  assert.match(api, /repoPublic !== true/);
  assert.doesNotMatch(api, /repo\.html_url/);
});

test('github links follow the confirmed public mapping', function () {
  const data = JSON.parse(read('data/services.json'));
  const linked = {};
  data.services.forEach(function (service) {
    if (service.repoPublic === true) {
      assert.equal(typeof service.repo, 'string', service.id);
      linked[service.repo] = service;
    } else {
      assert.equal(service.repo, null, service.id);
    }
  });
  ['atm-labs-hub', 'domain-root', 'trujillo-guides', 'trujillo-ai-studio', 'nutrifit', 'invest-platform', 'focusguard-saas', 'atm-tools', 'open-sentinel', 'portfolio'].forEach(function (repo) {
    assert.ok(linked[repo], repo);
  });
  assert.equal(linked['rewrite-ai'], undefined);
  assert.equal(linked['savings-runway'], undefined);
  const html = read('public/index.html');
  Object.keys(linked).forEach(function (repo) {
    assert.match(html, new RegExp('https://github.com/ATM-Software-Labs/' + repo.replace(/[.]/g, '\\.')));
  });
  assert.doesNotMatch(html, /github\.com\/ATM-Software-Labs\/rewrite-ai/);
  assert.doesNotMatch(html, /github\.com\/ATM-Software-Labs\/savings-runway/);
  assert.equal(data.unlinked.some(function (row) { return row.repo === 'rewrite-ai' && row.public === true && row.linked === false; }), true);
  assert.equal(data.unlinked.some(function (row) { return row.repo === 'savings-runway' && row.public === false; }), true);
});

test('tokens match the published brand sheet and keep labs aliases', function () {
  const css = read('public/css/tokens.css');
  assert.match(css, /https:\/\/trujillomingorance\.com\/brand\/tokens\.css/);
  assert.match(css, /--atm-bg:\s*#07080b/);
  assert.match(css, /neutral greys/);
  assert.match(css, /--atm-emerald:\s*#e6e8ec/);
  assert.match(css, /--atm-cyan:\s*#c8cdd4/);
  assert.match(css, /--atm-soon:\s*#9aa3ae/);
  assert.match(css, /--atm-text:\s*#f4f7fb/);
  assert.doesNotMatch(css, /#8fe8c4|#9ad7e6|#e4d2b0/);
  assert.match(css, /--bg:\s*var\(--atm-bg\)/);
  assert.match(css, /--cyan:\s*var\(--atm-cyan\)/);
  assert.match(css, /color-scheme:\s*dark/);
  assert.doesNotMatch(css, /data-theme="light"/);
});

function pngSize(file) {
  const buf = fs.readFileSync(path.join(root, file));
  assert.equal(buf.subarray(0, 8).toString('hex'), '89504e470d0a1a0a', file);
  return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
}

test('labs brand files are local copies of the published mark', function () {
  const favicon = read('public/favicon.svg');
  const lockup = read('public/assets/lockup.svg');
  assert.match(favicon, /aria-label="ATM"/);
  assert.match(favicon, /#ffffff/);
  assert.doesNotMatch(favicon, /#9ad7e6|#8fe8c4/);
  assert.match(lockup, /aria-label="ATM Software Labs\. Labs"/);
  assert.match(lockup, /#ffffff/);
  assert.doesNotMatch(lockup, /#9ad7e6|#8fe8c4/);
  assert.equal(fs.statSync(path.join(root, 'public/favicon.ico')).size > 0, true);
  assert.deepEqual(pngSize('public/apple-touch-icon.png'), { width: 180, height: 180 });
  assert.deepEqual(pngSize('public/icon-192.png'), { width: 192, height: 192 });
  assert.deepEqual(pngSize('public/icon-512.png'), { width: 512, height: 512 });
  assert.deepEqual(pngSize('public/assets/og.png'), { width: 1200, height: 630 });
  assert.equal(fs.existsSync(path.join(root, 'public/assets/banner.png')), true);
  assert.equal(fs.existsSync(path.join(root, 'public/assets/og-labs.png')), false);
  const manifest = JSON.parse(read('public/site.webmanifest'));
  const srcs = manifest.icons.map(function (icon) { return icon.src; });
  ['/favicon.svg?v=20261015f', '/assets/favicon.ico?v=20261015f', '/icon-192.png?v=20261015f', '/icon-512.png?v=20261015f', '/apple-touch-icon.png?v=20261015f'].forEach(function (src) {
    assert.ok(srcs.includes(src), src);
  });
  const notFound = read('public/404.html');
  assert.match(notFound, /src="\/assets\/lockup\.svg\?v=20261015f"/);
  assert.match(notFound, /href="\/favicon\.svg\?v=20261015f"/);
  const css = read('public/css/labs.css');
  assert.doesNotMatch(css, /#9ad7e6|#8fe8c4|#12343c|154,\s*215,\s*230|143,\s*232,\s*196|var\(--cyan\)|var\(--emerald\)/);
});

test('motion is reduced-motion aware', function () {
  const css = read('public/css/labs.css');
  assert.match(css, /prefers-reduced-motion:\s*no-preference/);
  assert.match(css, /prefers-reduced-motion:\s*reduce/);
  assert.match(css, /@keyframes pulse/);
  assert.doesNotMatch(css, /@keyframes blink/);
  assert.match(css, /JetBrains Mono/);
  assert.match(css, /inter-latin-400-normal\.woff2/);
});

test('each locale has hreflang, hub header, footer, and translated meta', function () {
  const expect = {
    es: {
      href: 'https://trujillomingorance.com/',
      h1: 'Servicios en producción',
      locale: 'es_ES',
      canonical: 'https://labs.trujillomingorance.com/',
      github: 'Repositorio en GitHub',
      clear: 'Limpiar búsqueda'
    },
    en: {
      href: 'https://trujillomingorance.com/en/',
      h1: 'Services in production',
      locale: 'en_US',
      canonical: 'https://labs.trujillomingorance.com/en/',
      github: 'Repository on GitHub',
      clear: 'Clear search'
    },
    ca: {
      href: 'https://trujillomingorance.com/ca/',
      h1: 'Serveis en producció',
      locale: 'ca_ES',
      canonical: 'https://labs.trujillomingorance.com/ca/',
      github: 'Repositori a GitHub',
      clear: 'Netejar la cerca'
    }
  };
  Object.keys(pages).forEach(function (id) {
    const html = read(pages[id]);
    const spec = expect[id];
    assert.match(html, new RegExp('<html lang="' + id + '">'));
    assert.match(html, new RegExp('rel="canonical" href="' + spec.canonical.replace(/[.]/g, '\\.') + '"'));
    assert.match(html, /hreflang="es"/);
    assert.match(html, /hreflang="en"/);
    assert.match(html, /hreflang="ca"/);
    assert.match(html, /hreflang="x-default"/);
    assert.match(html, new RegExp('property="og:locale" content="' + spec.locale + '"'));
    assert.match(html, new RegExp('property="og:title" content="[^"]+' + (id === 'en' ? 'ecosystem' : 'Ecosistema') ));
    assert.match(html, new RegExp('<h1 id="identidad">' + spec.h1 + '</h1>'));
    assert.match(html, new RegExp('class="brand" id="brandLink" href="' + spec.href.replace(/[.]/g, '\\.') + '"'));
    assert.match(html, /src="\/assets\/lockup\.svg\?v=20261015f"/);
    assert.match(html, /og:image" content="https:\/\/labs\.trujillomingorance\.com\/assets\/og\.png\?v=20261015f"/);
    assert.match(html, /twitter:image" content="https:\/\/labs\.trujillomingorance\.com\/assets\/og\.png\?v=20261015f"/);
    assert.match(html, /href="\/favicon\.svg\?v=20261015f"/);
    assert.match(html, /href="\/assets\/favicon\.ico\?v=20261015f"/);
    assert.match(html, /href="\/apple-touch-icon\.png\?v=20261015f"/);
    assert.match(html, /class="search-clear"/);
    assert.match(html, /data-category="ai"/);
    assert.doesNotMatch(html, /atm@labs/);
    assert.doesNotMatch(html, /term-prompt/);
    assert.doesNotMatch(html, /grid-overlay/);
    assert.doesNotMatch(html, /og-labs\.png/);
    assert.doesNotMatch(html, /trujillomingorance\.com\/brand\//);
    assert.match(html, /data-lang-switch="es"/);
    assert.match(html, /data-lang-switch="en"/);
    assert.match(html, /data-lang-switch="ca"/);
    assert.match(html, /https:\/\/github\.com\/ATM-Software-Labs/);
    assert.match(html, /https:\/\/www\.linkedin\.com\/in\/alberto-trujillo-mingorance-288237266/);
    assert.match(html, /© 2026 ATM Software Labs · Alberto Trujillo Mingorance/);
    assert.match(html, /id="projectSearch"/);
    assert.match(html, /https:\/\/ai\.trujillomingorance\.com/);
    assert.match(html, /API Gateway/);
    assert.doesNotMatch(html, /href="https:\/\/api\.trujillomingorance\.com\/?"/);
    assert.match(html, /https:\/\/github\.com\/ATM-Software-Labs\/open-sentinel/);
    assert.doesNotMatch(html, /translate\.googleapis/);
    assert.doesNotMatch(html, /flagcdn/);
    assert.doesNotMatch(html, /Edge Network/);
    assert.doesNotMatch(html, /theme-btn/);
    assert.match(html, new RegExp('aria-label="' + spec.github + '"'));
    assert.match(html, new RegExp('aria-label="' + spec.clear + '"'));
    assert.doesNotMatch(html, new RegExp('>' + spec.clear + '<'));
    assert.doesNotMatch(html, /fonts\.googleapis/);
  });
});

test('404 keeps the shell, a real diagnostic, and the directory', function () {
  const html = read('public/404.html');
  assert.match(html, /noindex, nofollow/);
  assert.match(html, /data-page="404"/);
  assert.match(html, /id="teleHost"/);
  assert.match(html, /id="telePath"/);
  assert.match(html, /HTTP 404/);
  assert.match(html, /id="servicesGrid"/);
  assert.match(html, /© 2026 ATM Software Labs · Alberto Trujillo Mingorance/);
  assert.doesNotMatch(html, /Live Edge Telemetry/);
  assert.doesNotMatch(html, /Global Anycast/);
});

test('shipped pages do not carry client secrets or the old machine translator', function () {
  const files = [];
  function walk(dir) {
    fs.readdirSync(dir).forEach(function (name) {
      const full = path.join(dir, name);
      if (fs.statSync(full).isDirectory()) walk(full);
      else if (/\.(html|js|css|json|txt|xml)$/.test(name)) files.push(full);
    });
  }
  walk(path.join(root, 'public'));
  const blob = files.map(function (file) { return fs.readFileSync(file, 'utf8'); }).join('\n');
  ['apps.googleusercontent.com', 'NF94WVVIT1', 'BEGIN PRIVATE KEY', 'AKIA', 'translate.googleapis.com', 'flagcdn.com'].forEach(function (needle) {
    assert.equal(blob.includes(needle), false, needle);
  });
});

test('security policy allows same-origin assets and ecosystem probes only', function () {
  const headers = read('public/_headers');
  const middleware = read('functions/_middleware.js');
  [headers, middleware].forEach(function (source) {
    assert.match(source, /connect-src 'self' https:\/\/trujillomingorance\.com https:\/\/\*\.trujillomingorance\.com/);
    assert.doesNotMatch(source, /translate\.googleapis/);
    assert.doesNotMatch(source, /fonts\.googleapis/);
  });
});
