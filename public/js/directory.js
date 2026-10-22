/* Directory search, category filters, and honest no-cors reachability.
   An opaque response means the host answered. It is not an uptime figure. */
(function () {
  'use strict';

  var TIMEOUT_MS = 4500;
  var INITIAL_LIMIT = 6;
  var category = 'all';
  var isExpanded = false;

  function ready(fn) {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn);
    else fn();
  }

  function lang() {
    var value = (document.documentElement.lang || 'es').toLowerCase().slice(0, 2);
    if (value !== 'en' && value !== 'ca') return 'es';
    return value;
  }

  function copy() {
    var all = window.ATM_COPY || {};
    return all[lang()] || all.es || {};
  }

  function fill(template, map) {
    return String(template || '').replace(/\{(\w+)\}/g, function (_, key) {
      return map[key] == null ? '' : String(map[key]);
    });
  }

  function rows(table) {
    if (!table) return [];
    return Array.prototype.filter.call(table.querySelectorAll('tbody tr[data-id]'), function () { return true; });
  }

  function visibleItems(table) {
    return Array.prototype.filter.call(table.querySelectorAll('[data-hub-item]'), function (item) {
      var row = item.closest('tr');
      return row && !row.hidden;
    });
  }

  function keyboard(table) {
    table.addEventListener('keydown', function (event) {
      var key = event.key;
      if (key !== 'ArrowRight' && key !== 'ArrowLeft' && key !== 'ArrowDown' && key !== 'ArrowUp' && key !== 'Home' && key !== 'End') return;
      var items = visibleItems(table);
      var index = items.indexOf(document.activeElement);
      if (index < 0) return;
      var next = index;
      if (key === 'ArrowRight' || key === 'ArrowDown') next = index + 1;
      else if (key === 'ArrowLeft' || key === 'ArrowUp') next = index - 1;
      else if (key === 'Home') next = 0;
      else if (key === 'End') next = items.length - 1;
      if (next < 0 || next >= items.length || next === index) return;
      event.preventDefault();
      items[next].focus();
    });
  }

  // Comprobación ligera: HEAD a un archivo estático (no invoca Functions en los sitios de Pages)
  // y resultado guardado 5 minutos en sessionStorage para no repetir 13 peticiones en cada visita.
  var PROBE_PATH = '/favicon.svg';
  var PROBE_TTL = 5 * 60 * 1000;
  function cachedProbe(host) {
    try {
      var c = JSON.parse(sessionStorage.getItem('labs_probe:' + host) || 'null');
      if (c && Date.now() - c.t < PROBE_TTL) return c.ok;
    } catch (e) {}
    return null;
  }
  function rememberProbe(host, ok) {
    try { sessionStorage.setItem('labs_probe:' + host, JSON.stringify({ t: Date.now(), ok: ok })); } catch (e) {}
  }
  function probe(host) {
    var hit = cachedProbe(host);
    if (hit !== null) return Promise.resolve(hit);
    var controller = new AbortController();
    var timer = setTimeout(function () { controller.abort(); }, TIMEOUT_MS);
    return fetch('https://' + host + PROBE_PATH, {
      method: 'HEAD',
      mode: 'no-cors',
      redirect: 'follow',
      credentials: 'omit',
      referrerPolicy: 'no-referrer',
      signal: controller.signal
    }).then(
      function () { clearTimeout(timer); rememberProbe(host, true); return true; },
      function () { clearTimeout(timer); return false; }
    );
  }

  function setState(row, state, label) {
    var cell = row.querySelector('.svc-status');
    if (!cell) return;
    cell.setAttribute('data-state', state);
    var labelEl = cell.querySelector('.js-label');
    if (labelEl) labelEl.textContent = label;
  }

  function statusFor(row, labels) {
    if (row.getAttribute('data-probed') === '1') return Promise.resolve();
    row.setAttribute('data-probed', '1');
    var host = row.getAttribute('data-probe') === '1' ? (row.getAttribute('data-host') || '') : '';
    if (!host) {
      setState(row, 'repo', labels.repo || '');
      return Promise.resolve();
    }
    setState(row, 'checking', labels.checking || '');
    return probe(host).then(function (ok) {
      setState(row, ok ? 'online' : 'down', ok ? (labels.online || '') : (labels.offline || ''));
    });
  }

  function startProbes(table) {
    if (!table) return;
    var labels = copy();
    var pending = rows(table).filter(function (row) { return row.getAttribute('data-probe') === '1'; });
    if (!pending.length) return;
    table.setAttribute('aria-busy', 'true');
    var left = pending.length;
    pending.forEach(function (row) {
      statusFor(row, labels).then(function () {
        left -= 1;
        if (left <= 0) table.setAttribute('aria-busy', 'false');
      });
    });
  }

  function applyQuery() {
    var table = document.getElementById('hub');
    var input = document.getElementById('projectSearch');
    var empty = document.getElementById('noResults');
    var queryEl = document.getElementById('noResultsQuery');
    var clearBtn = document.getElementById('clearSearch');
    var kbd = document.querySelector('.search-kbd');
    var scroll = document.querySelector('.catalog-scroll');
    var count = document.getElementById('catalogCount');
    var moreWrap = document.getElementById('catalogMoreWrap');
    var moreBtn = document.getElementById('btnToggleCatalog');
    var moreText = document.getElementById('toggleCatalogText');
    var moreIcon = moreBtn ? moreBtn.querySelector('.btn-more-icon') : null;
    if (!table || !input) return;

    var q = (input.value || '').trim().toLowerCase();
    var isFiltered = !!q || category !== 'all';
    var matchedRows = [];

    rows(table).forEach(function (row) {
      var blob = ((row.innerText || '') + ' ' + (row.getAttribute('data-keywords') || '')).toLowerCase();
      var rowCat = row.getAttribute('data-category') || '';
      var okCat = category === 'all' || rowCat === category;
      var ok = okCat && (!q || blob.indexOf(q) !== -1);
      if (ok) matchedRows.push(row);
      else row.hidden = true;
    });

    var totalMatched = matchedRows.length;
    var visibleLimit = (isFiltered || isExpanded) ? totalMatched : INITIAL_LIMIT;

    matchedRows.forEach(function (row, index) {
      row.hidden = index >= visibleLimit;
    });

    if (empty) empty.hidden = totalMatched !== 0;
    if (scroll) scroll.hidden = totalMatched === 0;
    if (queryEl) queryEl.textContent = input.value.trim();
    if (clearBtn) clearBtn.hidden = !q;
    if (kbd) kbd.hidden = !q;

    if (count) {
      var template = copy().count || '{n}';
      count.textContent = fill(template, { n: totalMatched });
    }

    if (moreWrap && moreBtn && moreText) {
      var canExpand = !isFiltered && totalMatched > INITIAL_LIMIT;
      moreWrap.hidden = !canExpand;
      if (canExpand) {
        moreBtn.setAttribute('aria-expanded', isExpanded ? 'true' : 'false');
        var remaining = totalMatched - INITIAL_LIMIT;
        if (isExpanded) {
          moreText.textContent = copy().showLess || 'Mostrar menos';
          if (moreIcon) moreIcon.textContent = '↑';
        } else {
          var moreTemplate = copy().showMore || 'Mostrar más servicios (+{n})';
          moreText.textContent = fill(moreTemplate, { n: remaining });
          if (moreIcon) moreIcon.textContent = '↓';
        }
      }
    }
  }

  function setCategory(next) {
    category = next || 'all';
    Array.prototype.forEach.call(document.querySelectorAll('.chip'), function (chip) {
      chip.setAttribute('aria-pressed', chip.getAttribute('data-category') === category ? 'true' : 'false');
    });
  }

  ready(function () {
    var table = document.getElementById('hub');
    if (table) keyboard(table);

    var input = document.getElementById('projectSearch');
    var clearBtn = document.getElementById('clearSearch');
    var resetBtn = document.getElementById('btnResetFilters');
    var toggleBtn = document.getElementById('btnToggleCatalog');
    var form = document.querySelector('.search');

    if (form) form.addEventListener('submit', function (event) { event.preventDefault(); applyQuery(); });
    if (input) input.addEventListener('input', applyQuery);
    if (clearBtn) {
      clearBtn.addEventListener('click', function () {
        if (input) {
          input.value = '';
          input.focus();
        }
        applyQuery();
      });
    }
    if (resetBtn) {
      resetBtn.addEventListener('click', function () {
        if (input) input.value = '';
        setCategory('all');
        isExpanded = false;
        applyQuery();
        if (input) input.focus();
      });
    }
    if (toggleBtn) {
      toggleBtn.addEventListener('click', function () {
        isExpanded = !isExpanded;
        applyQuery();
        if (!isExpanded) {
          var dir = document.getElementById('directorio');
          if (dir && typeof dir.scrollIntoView === 'function') {
            dir.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }
      });
    }
    Array.prototype.forEach.call(document.querySelectorAll('.chip'), function (chip) {
      chip.addEventListener('click', function () {
        setCategory(chip.getAttribute('data-category') || 'all');
        applyQuery();
      });
    });
    window.addEventListener('keydown', function (event) {
      if ((event.ctrlKey || event.metaKey) && (event.key || '').toLowerCase() === 'k') {
        if (!input) return;
        event.preventDefault();
        input.focus();
        input.select();
      }
    });
    applyQuery();
    startProbes(table);
  });
})();
