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
    var n = grid.querySelectorAll('a.hub-card').length;
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

  function renderServices(projects, copy) {
    var grid = document.getElementById('servicesGrid');
    if (!grid || !projects.length) return;
    var known = {};
    Array.prototype.forEach.call(grid.querySelectorAll('[data-id]'), function (card) {
      known[card.getAttribute('data-id')] = card.closest('li');
    });
    var frag = document.createDocumentFragment();
    projects.forEach(function (project) {
      if (!project || !project.id) return;
      var li = known[project.id];
      if (li) {
        delete known[project.id];
      } else if (project.url) {
        li = document.createElement('li');
        var link = document.createElement('a');
        link.className = 'hub-card';
        link.href = project.url;
        link.setAttribute('data-id', project.id);
        var host = document.createElement('span');
        host.className = 'hub-host';
        host.textContent = project.domain || '';
        var name = document.createElement('span');
        name.className = 'hub-name';
        name.textContent = project.title || project.id;
        var desc = document.createElement('span');
        desc.className = 'hub-desc';
        var translated = copy.descriptions && copy.descriptions[project.id];
        desc.textContent = translated || project.description || '';
        link.appendChild(host);
        link.appendChild(name);
        link.appendChild(desc);
        li.appendChild(link);
      }
      if (li) frag.appendChild(li);
    });
    Object.keys(known).forEach(function (id) {
      if (known[id] && known[id].parentNode) known[id].parentNode.removeChild(known[id]);
    });
    grid.appendChild(frag);
    paintCount(copy);
  }

  var state = pack();
  applyChrome(state.lang, state.copy);
  diagnostics(state.copy.notFound || {});
  goBack();

  fetch('/api/projects', { headers: { Accept: 'application/json' } })
    .then(function (res) {
      if (!res.ok) throw new Error('status');
      return res.json();
    })
    .then(function (data) {
      var projects = (data && Array.isArray(data.projects) ? data.projects : []).filter(function (project) {
        return window.ATMFilter && window.ATMFilter.isOwnProject(project);
      });
      renderServices(projects, state.copy);
    })
    .catch(function () {});
})();
