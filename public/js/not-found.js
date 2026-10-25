/* 404 diagnostics: real host, path, and time. Language follows the URL prefix or the saved choice. */
(function () {
  'use strict';

  function choice() {
    var path = location.pathname || '/';
    if (path === '/en' || path.indexOf('/en/') === 0) return 'en';
    if (path === '/ca' || path.indexOf('/ca/') === 0) return 'ca';
    try {
      var saved = localStorage.getItem('atm_lang_choice');
      if (saved === 'en' || saved === 'ca' || saved === 'es') return saved;
    } catch (e) {}
    return 'es';
  }

  function pack() {
    var all = window.ATM_COPY || {};
    var lang = choice();
    return { lang: lang, copy: all[lang] || all.es || {} };
  }

  function text(id, value) {
    var node = document.getElementById(id);
    if (node && value) node.textContent = value;
  }

  function homePath(lang) {
    return lang === 'es' ? '/' : '/' + lang + '/';
  }

  function applyChrome(lang, copy) {
    var ui = copy.notFound || {};
    document.documentElement.lang = lang;
    text('pageTitle', ui.title);
    var title = document.querySelector('title');
    if (title && ui.title) title.textContent = ui.title;
    text('skipLink', copy.skip);
    text('navDirectory', copy.directory);
    text('errorTitle', ui.h1);
    text('errorDesc', ui.desc);
    text('labelHost', ui.host);
    text('labelPath', ui.path);
    text('labelTime', ui.time);
    text('labelStatus', ui.status);
    text('copyBtnText', ui.copy);
    text('btnBack', ui.back);
    text('homeLink', ui.home);
    text('servicesTitle', ui.services);
    text('servicesLead', ui.servicesLead);
    var brand = document.getElementById('brandLink');
    if (brand) brand.setAttribute('href', homePath(lang));
    var directory = document.getElementById('navDirectory');
    if (directory) directory.setAttribute('href', homePath(lang) + '#directorio');
    var home = document.getElementById('homeLink');
    if (home) home.setAttribute('href', homePath(lang));
    var back = document.getElementById('btnBack');
    if (back) back.setAttribute('data-home', homePath(lang));
    document.querySelectorAll('#langNav a[data-lang-switch]').forEach(function (link) {
      var current = link.getAttribute('data-lang-switch') === lang;
      if (current) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    });
    var grid = document.getElementById('servicesGrid');
    if (grid) {
      if (copy.pending) grid.setAttribute('data-l-pending', copy.pending);
      if (copy.checking) grid.setAttribute('data-l-checking', copy.checking);
      if (copy.online) grid.setAttribute('data-l-online', copy.online);
      if (copy.offline) grid.setAttribute('data-l-down', copy.offline);
    }
    var descriptions = copy.descriptions || {};
    document.querySelectorAll('[data-i18n-desc]').forEach(function (node) {
      var id = node.getAttribute('data-i18n-desc');
      if (descriptions[id]) node.textContent = descriptions[id];
    });
    var categories = copy.categories || {};
    document.querySelectorAll('[data-cat]').forEach(function (node) {
      var id = node.getAttribute('data-cat');
      if (categories[id]) node.textContent = categories[id];
    });
    document.querySelectorAll('.open').forEach(function (node) {
      if (copy.open && node.firstChild && node.firstChild.nodeType === 3) node.firstChild.nodeValue = copy.open;
    });
    document.querySelectorAll('.muted-note').forEach(function (node) {
      if (copy.noLink) node.textContent = copy.noLink;
    });
    document.querySelectorAll('.status').forEach(function (cell) {
      var state = cell.getAttribute('data-state');
      var label = cell.querySelector('.js-label');
      if (!label) return;
      if (state === 'repo' && copy.repo) label.textContent = copy.repo;
      else if (state === 'pending' && copy.pending) label.textContent = copy.pending;
      else if (state === 'checking' && copy.checking) label.textContent = copy.checking;
      else if (state === 'online' && copy.online) label.textContent = copy.online;
      else if (state === 'down' && copy.offline) label.textContent = copy.offline;
    });
  }

  function diagnostics(ui) {
    var host = location.hostname || 'labs.trujillomingorance.com';
    var path = location.pathname || '/';
    var stamp = new Date().toISOString();
    text('teleHost', host);
    text('telePath', path);
    text('teleTime', stamp);
    text('teleStatus', 'HTTP 404');
    var button = document.getElementById('btnCopyDiag');
    if (!button) return;
    button.addEventListener('click', function () {
      var lines = [
        'ATM Labs',
        (ui.host || 'Host') + ': ' + host,
        (ui.path || 'Path') + ': ' + path,
        (ui.status || 'Status') + ': HTTP 404',
        (ui.time || 'Time') + ': ' + new Date().toISOString()
      ];
      if (!navigator.clipboard || !navigator.clipboard.writeText) return;
      navigator.clipboard.writeText(lines.join('\n')).then(function () {
        var label = document.getElementById('copyBtnText');
        if (!label) return;
        var original = ui.copy || label.textContent;
        label.textContent = ui.copied || original;
        setTimeout(function () { label.textContent = original; }, 2500);
      }).catch(function () {});
    });
  }

  function goBack() {
    var button = document.getElementById('btnBack');
    if (!button) return;
    button.addEventListener('click', function () {
      if (window.history.length > 1) window.history.back();
      else location.href = button.getAttribute('data-home') || '/';
    });
  }

  var state = pack();
  applyChrome(state.lang, state.copy);
  diagnostics(state.copy.notFound || {});
  goBack();
})();
