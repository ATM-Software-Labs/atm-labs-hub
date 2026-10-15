'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');
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
  let code = read('functions/api/projects.js');
  code = code.replace(/export async function onRequestGet[\s\S]*$/, '');
  const sandbox = {};
  vm.createContext(sandbox);
  vm.runInContext(code + '\nglobalThis.__fallback = fallbackCatalog();', sandbox);
  const items = sandbox.__fallback;
  const ids = items.map(function (item) { return item.id; });
  ['alberto-portfolio', 'trujillo-ai-studio', 'rewrite-ai', 'focusguard', 'trujillo-guides', 'invest-platform', 'savings-runway', 'atm-tools', 'nutrifit', 'open-sentinel', 'api-gateway'].forEach(function (id) {
    assert.ok(ids.includes(id), id);
  });
  assert.equal(ids.includes('neurolock'), false);
  assert.equal(ids.includes('rocky-setter'), false);
  items.forEach(function (item) {
    assert.match(item.url, /^https:\/\//);
    const host = item.url.replace(/^https:\/\//, '').split('/')[0];
    assert.ok(host === 'github.com' || host === 'trujillomingorance.com' || host.endsWith('.trujillomingorance.com'), item.url);
  });
});

test('tokens replicate the live hub palette and name the missing shared sheet', function () {
  const css = read('public/css/tokens.css');
  assert.match(css, /brand\/tokens\.css/);
  assert.match(css, /hub\.css/);
  assert.match(css, /--bg:\s*#07080b/);
  assert.match(css, /--emerald:\s*#8fe8c4/);
  assert.match(css, /--cyan:\s*#9ad7e6/);
  assert.match(css, /--text:\s*#f4f7fb/);
  assert.match(css, /color-scheme:\s*dark/);
  assert.doesNotMatch(css, /data-theme="light"/);
});

test('motion is reduced-motion aware', function () {
  const css = read('public/css/labs.css');
  assert.match(css, /prefers-reduced-motion:\s*no-preference/);
  assert.match(css, /prefers-reduced-motion:\s*reduce/);
  assert.match(css, /@keyframes blink/);
  assert.match(css, /JetBrains Mono/);
  assert.match(css, /inter-latin-400-normal\.woff2/);
});

test('each locale has hreflang, hub header, footer, and translated meta', function () {
  const expect = {
    es: {
      href: 'https://trujillomingorance.com/',
      h1: 'Servicios en producción',
      locale: 'es_ES',
      canonical: 'https://labs.trujillomingorance.com/'
    },
    en: {
      href: 'https://trujillomingorance.com/en/',
      h1: 'Services in production',
      locale: 'en_US',
      canonical: 'https://labs.trujillomingorance.com/en/'
    },
    ca: {
      href: 'https://trujillomingorance.com/ca/',
      h1: 'Serveis en producció',
      locale: 'ca_ES',
      canonical: 'https://labs.trujillomingorance.com/ca/'
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
    assert.match(html, /ATM<\/span>\s*<span>Software Labs<\/span>/);
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
