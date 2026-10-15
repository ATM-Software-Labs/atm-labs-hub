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

  function paintCount(copy) {
    var count = document.getElementById('servicesCount');
    var grid = document.getElementById('servicesGrid');
    var ui = copy.notFound || {};
    if (!count || !ui.count || !grid) return;
    var n = grid.querySelectorAll('tbody tr[data-id]').length;
    count.textContent = ui.count.replace('{n}', String(n));
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
    if (copy.cols) {
      text('colStatus', copy.cols.status);
      text('colService', copy.cols.service);
      text('colHost', copy.cols.host);
      text('colCategory', copy.cols.category);
      text('colStack', copy.cols.stack);
      text('colActions', copy.cols.actions);
    }
    var siteNav = document.getElementById('siteNav');
    if (siteNav && copy.navLabel) siteNav.setAttribute('aria-label', copy.navLabel);
    var langNav = document.getElementById('langNav');
    if (langNav && copy.langLabel) langNav.setAttribute('aria-label', copy.langLabel);
    var footerNav = document.getElementById('footerNav');
    if (footerNav && copy.footerLabel) footerNav.setAttribute('aria-label', copy.footerLabel);
    var brand = document.getElementById('brandLink');
    if (brand && copy.hub) {
      brand.setAttribute('href', copy.hub);
      if (copy.hubLabel) brand.setAttribute('aria-label', copy.hubLabel);
    }
    var directory = document.getElementById('navDirectory');
    if (directory) directory.setAttribute('href', homePath(lang) + '#directorio');
    var home = document.getElementById('homeLink');
    if (home) home.setAttribute('href', homePath(lang));
    var back = document.getElementById('btnBack');
    if (back) back.setAttribute('data-home', homePath(lang));
    document.querySelectorAll('.lang a[data-lang-switch]').forEach(function (link) {
      var current = link.getAttribute('data-lang-switch') === lang;
      if (current) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    });
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
    document.querySelectorAll('.act-open .act-label').forEach(function (node) {
      if (copy.open) node.textContent = copy.open;
    });
    document.querySelectorAll('.act-muted .act-label').forEach(function (node) {
      if (copy.noLink) node.textContent = copy.noLink;
    });
    document.querySelectorAll('.repo-link').forEach(function (node) {
      if (copy.githubLabel) node.setAttribute('aria-label', copy.githubLabel);
    });
    document.querySelectorAll('.svc-status').forEach(function (cell) {
      var state = cell.getAttribute('data-state');
      var label = cell.querySelector('.js-label');
      if (!label) return;
      if (state === 'repo' && copy.repo) label.textContent = copy.repo;
      else if (state === 'pending' && copy.pending) label.textContent = copy.pending;
      else if (state === 'checking' && copy.checking) label.textContent = copy.checking;
      else if (state === 'online' && copy.online) label.textContent = copy.online;
      else if (state === 'down' && copy.offline) label.textContent = copy.offline;
    });
    paintCount(copy);
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
