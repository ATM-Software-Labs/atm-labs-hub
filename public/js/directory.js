/* Directory search, category filters, and honest no-cors reachability.
   An opaque response means the host answered. It is not an uptime figure. */
(function () {
  'use strict';

  var TIMEOUT_MS = 4500;
  var category = 'all';

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

  function probe(host) {
    var controller = new AbortController();
    var timer = setTimeout(function () { controller.abort(); }, TIMEOUT_MS);
    return fetch('https://' + host + '/', {
      method: 'HEAD',
      mode: 'no-cors',
      cache: 'no-store',
      redirect: 'follow',
      credentials: 'omit',
      referrerPolicy: 'no-referrer',
      signal: controller.signal
    }).then(
      function () { clearTimeout(timer); return true; },
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
    if (!table || !input) return;
    var q = (input.value || '').trim().toLowerCase();
    var shown = 0;
    rows(table).forEach(function (row) {
      var blob = ((row.innerText || '') + ' ' + (row.getAttribute('data-keywords') || '')).toLowerCase();
      var rowCat = row.getAttribute('data-category') || '';
      var okCat = category === 'all' || rowCat === category;
      var ok = okCat && (!q || blob.indexOf(q) !== -1);
      row.hidden = !ok;
      if (ok) shown += 1;
    });
    if (empty) empty.hidden = shown !== 0;
    if (scroll) scroll.hidden = shown === 0;
    if (queryEl) queryEl.textContent = input.value.trim();
    if (clearBtn) clearBtn.hidden = !q;
    if (kbd) kbd.hidden = !!q;
    if (count) {
      var template = copy().count || '{n}';
      count.textContent = fill(template, { n: shown });
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
        applyQuery();
        if (input) input.focus();
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
