/* ATM Labs: theme toggle, directory search and category filters, and honest no-cors reachability.
   An opaque response means the host answered. It is not an uptime figure. */
(function () {
  'use strict';

  var TIMEOUT_MS = 4500;
  var CACHE_MS = 5 * 60 * 1000;
  var category = 'all';

  function ready(fn) {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn);
    else fn();
  }
  function $(id) { return document.getElementById(id); }
  function each(list, fn) { Array.prototype.forEach.call(list, fn); }

  /* Theme: same contract as charts (html[data-theme], saved choice wins over the OS). */
  function theme() {
    var button = $('themeToggle');
    if (!button) return;
    function sync() { button.setAttribute('aria-pressed', document.documentElement.getAttribute('data-theme') === 'light' ? 'true' : 'false'); }
    sync();
    button.addEventListener('click', function () {
      var next = document.documentElement.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', next);
      try { localStorage.setItem('atm_theme', next); } catch (e) {}
      sync();
    });
  }

  /* Language menu closes on Escape or an outside click. */
  function langMenu() {
    var menu = $('langNav');
    if (!menu) return;
    document.addEventListener('click', function (e) { if (menu.open && !menu.contains(e.target)) menu.open = false; });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && menu.open) { menu.open = false; menu.querySelector('summary').focus(); }
    });
  }

  function labels(grid) {
    return {
      pending: grid.getAttribute('data-l-pending'),
      checking: grid.getAttribute('data-l-checking'),
      online: grid.getAttribute('data-l-online'),
      down: grid.getAttribute('data-l-down'),
      count: grid.getAttribute('data-l-count') || '{n}',
      one: grid.getAttribute('data-l-one')
    };
  }

  function setState(host, state, text) {
    each(document.querySelectorAll('.status[data-host="' + host + '"]'), function (node) {
      node.setAttribute('data-state', state);
      var label = node.querySelector('.js-label');
      if (label && text) label.textContent = text;
    });
  }

  function cached(host) {
    try {
      var raw = sessionStorage.getItem('labs_probe:' + host);
      if (!raw) return null;
      var hit = JSON.parse(raw);
      return Date.now() - hit.t < CACHE_MS ? hit.s : null;
    } catch (e) { return null; }
  }
  function remember(host, state) {
    try { sessionStorage.setItem('labs_probe:' + host, JSON.stringify({ s: state, t: Date.now() })); } catch (e) {}
  }

  function probe(host, l) {
    var safe = window.ATMFilter ? window.ATMFilter.probeHost(host) : host;
    if (!safe) return;
    var hit = cached(safe);
    if (hit) { setState(safe, hit, l[hit]); return; }
    setState(safe, 'checking', l.checking);
    var done = false;
    var ctrl = typeof AbortController === 'function' ? new AbortController() : null;
    var timer = setTimeout(function () {
      if (done) return;
      done = true;
      if (ctrl) ctrl.abort();
      remember(safe, 'down');
      setState(safe, 'down', l.down);
    }, TIMEOUT_MS);
    fetch('https://' + safe + '/robots.txt', { method: 'HEAD', mode: 'no-cors', cache: 'no-store', signal: ctrl ? ctrl.signal : undefined })
      .then(function () {
        if (done) return;
        done = true; clearTimeout(timer);
        remember(safe, 'online');
        setState(safe, 'online', l.online);
      })
      .catch(function () {
        if (done) return;
        done = true; clearTimeout(timer);
        remember(safe, 'down');
        setState(safe, 'down', l.down);
      });
  }

  function probes(l) {
    var seen = {};
    each(document.querySelectorAll('.status[data-host]'), function (node) {
      var host = node.getAttribute('data-host');
      if (host && !seen[host]) { seen[host] = 1; probe(host, l); }
    });
  }

  function directory(grid, l) {
    var search = $('projectSearch');
    var clear = $('clearSearch');
    var count = $('catalogCount');
    var empty = $('noResults');
    var emptyQuery = $('noResultsQuery');
    var cards = grid.querySelectorAll('[data-id]');
    var chips = document.querySelectorAll('.chip[data-category]');
    if (!search) return;

    function apply() {
      var q = search.value.trim().toLowerCase();
      var shown = 0;
      each(cards, function (card) {
        var okCat = category === 'all' || card.getAttribute('data-category') === category;
        var blob = (card.getAttribute('data-keywords') || '').toLowerCase();
        var ok = okCat && (!q || blob.indexOf(q) !== -1);
        card.hidden = !ok;
        if (ok) shown++;
      });
      if (clear) clear.hidden = !search.value;
      if (count) count.textContent = shown === 1 && l.one ? l.one : l.count.replace('{n}', String(shown));
      if (empty) {
        empty.hidden = shown !== 0;
        if (emptyQuery) emptyQuery.textContent = search.value.trim() || (document.querySelector('.chip[aria-pressed="true"]') || {}).textContent || '';
      }
    }

    search.addEventListener('input', apply);
    search.form.addEventListener('submit', function (e) { e.preventDefault(); apply(); });
    if (clear) clear.addEventListener('click', function () { search.value = ''; apply(); search.focus(); });
    each(chips, function (chip) {
      chip.addEventListener('click', function () {
        category = chip.getAttribute('data-category');
        each(chips, function (c) { c.setAttribute('aria-pressed', c === chip ? 'true' : 'false'); });
        apply();
      });
    });
    var reset = $('btnResetFilters');
    if (reset) reset.addEventListener('click', function () {
      search.value = ''; category = 'all';
      each(chips, function (c) { c.setAttribute('aria-pressed', c.getAttribute('data-category') === 'all' ? 'true' : 'false'); });
      apply(); search.focus();
    });
    document.addEventListener('keydown', function (e) {
      if ((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K')) { e.preventDefault(); search.focus(); search.select(); }
      else if (e.key === 'Escape' && document.activeElement === search && search.value) { search.value = ''; apply(); }
    });
    var params = new URLSearchParams(location.search);
    if (params.get('q')) { search.value = params.get('q'); apply(); }
  }

  ready(function () {
    theme();
    langMenu();
    var grid = $('hub') || $('servicesGrid');
    if (!grid) return;
    var l = labels(grid);
    directory(grid, l);
    probes(l);
  });
})();
