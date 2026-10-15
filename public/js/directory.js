/* Directory search, keyboard grid, and honest no-cors reachability.
   An opaque response means the host answered. It is not an uptime figure. */
(function () {
  'use strict';

  var TIMEOUT_MS = 4500;

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

  function icon(id) {
    var icons = window.ATM_ICONS || {};
    var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('class', 'hub-icon');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('width', '22');
    svg.setAttribute('height', '22');
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('focusable', 'false');
    svg.innerHTML = icons[id] || icons.generic || '';
    return svg;
  }

  function columns(items) {
    if (items.length < 2) return 1;
    var top = items[0].getBoundingClientRect().top;
    var count = 1;
    for (var i = 1; i < items.length; i += 1) {
      if (Math.abs(items[i].getBoundingClientRect().top - top) > 8) break;
      count += 1;
    }
    return count;
  }

  function keyboard(hub) {
    hub.addEventListener('keydown', function (event) {
      var key = event.key;
      if (key !== 'ArrowRight' && key !== 'ArrowLeft' && key !== 'ArrowDown' && key !== 'ArrowUp' && key !== 'Home' && key !== 'End') return;
      var items = Array.prototype.filter.call(hub.querySelectorAll('[data-hub-item]'), function (item) {
        return !item.closest('li') || !item.closest('li').hidden;
      });
      var index = items.indexOf(document.activeElement);
      if (index < 0) return;
      var cols = columns(items);
      var next = index;
      if (key === 'ArrowRight') next = index + 1;
      else if (key === 'ArrowLeft') next = index - 1;
      else if (key === 'ArrowDown') next = index + cols;
      else if (key === 'ArrowUp') next = index - cols;
      else if (key === 'Home') next = 0;
      else if (key === 'End') next = items.length - 1;
      if (next < 0 || next >= items.length || next === index) return;
      event.preventDefault();
      items[next].focus();
    });
  }

  function typeLine(phrases) {
    var line = document.getElementById('term-line');
    if (!line || !phrases || !phrases.length) return;
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) {
      line.textContent = phrases.join('  ·  ');
      var caret = line.parentNode && line.parentNode.querySelector('.caret');
      if (caret) caret.remove();
      return;
    }
    var phrase = 0;
    var char = 0;
    var deleting = false;
    function tick() {
      var text = phrases[phrase];
      if (!deleting) {
        char += 1;
        line.textContent = text.slice(0, char);
        if (char >= text.length) {
          deleting = true;
          setTimeout(tick, 1100);
          return;
        }
        setTimeout(tick, 46);
        return;
      }
      char -= 1;
      line.textContent = text.slice(0, Math.max(char, 0));
      if (char <= 0) {
        deleting = false;
        phrase = (phrase + 1) % phrases.length;
        setTimeout(tick, 280);
        return;
      }
      setTimeout(tick, 28);
    }
    tick();
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

  function setState(card, state, label) {
    card.setAttribute('data-state', state);
    var el = card.querySelector('.js-label');
    if (!el) {
      el = document.createElement('span');
      el.className = 'hub-state';
      var dot = document.createElement('span');
      dot.className = 'dot';
      dot.setAttribute('aria-hidden', 'true');
      var text = document.createElement('span');
      text.className = 'js-label';
      el.appendChild(dot);
      el.appendChild(text);
      card.appendChild(el);
    }
    var labelEl = card.querySelector('.js-label');
    if (labelEl) labelEl.textContent = label;
    if (state === 'repo') {
      var dotEl = card.querySelector('.dot');
      if (dotEl) dotEl.remove();
    }
  }

  function statusFor(card, labels) {
    if (card.getAttribute('data-probed') === '1') return;
    card.setAttribute('data-probed', '1');
    var host = '';
    if (window.ATMFilter && card.getAttribute('href')) host = window.ATMFilter.probeHost(card.getAttribute('href'));
    if (!host) {
      setState(card, 'repo', labels.repo || '');
      return;
    }
    setState(card, 'checking', labels.checking || '');
    probe(host).then(function (ok) {
      setState(card, ok ? 'online' : 'down', ok ? (labels.online || '') : (labels.offline || ''));
    });
  }

  function startProbes(root) {
    var labels = copy();
    var run = function () {
      var cards = (root || document).querySelectorAll('a.hub-card[href]');
      Array.prototype.forEach.call(cards, function (card) { statusFor(card, labels); });
    };
    if (window.requestIdleCallback) window.requestIdleCallback(run, { timeout: 2500 });
    else window.addEventListener('load', function () { setTimeout(run, 1200); });
  }

  function canLink(url) {
    return !!url && url !== 'https://api.trujillomingorance.com' && url !== 'https://api.trujillomingorance.com/';
  }

  function buildCard(project, labels) {
    var li = document.createElement('li');
    var href = project.url || (project.domain ? 'https://' + project.domain : '');
    var card = document.createElement(canLink(href) ? 'a' : 'div');
    card.className = 'hub-card';
    card.setAttribute('data-hub-item', '');
    card.setAttribute('data-id', project.id || '');
    if (card.tagName === 'A') card.href = href;
    else card.tabIndex = 0;
    if (project.keywords) card.setAttribute('data-keywords', project.keywords);
    var top = document.createElement('span');
    top.className = 'hub-top';
    top.appendChild(icon(project.id));
    var host = document.createElement('span');
    host.className = 'hub-host';
    host.textContent = project.domain || '';
    top.appendChild(host);
    var name = document.createElement('span');
    name.className = 'hub-name';
    name.textContent = project.title || project.id || '';
    var desc = document.createElement('span');
    desc.className = 'hub-desc';
    var translated = labels.descriptions && labels.descriptions[project.id];
    desc.textContent = translated || project.description || '';
    card.appendChild(top);
    card.appendChild(name);
    card.appendChild(desc);
    li.appendChild(card);
    return li;
  }

  function render(projects) {
    var hub = document.getElementById('hub');
    if (!hub) return;
    var labels = copy();
    var known = {};
    Array.prototype.forEach.call(hub.querySelectorAll('[data-id]'), function (card) {
      known[card.getAttribute('data-id')] = card.closest('li') || card;
    });
    var frag = document.createDocumentFragment();
    projects.forEach(function (project) {
      var li = known[project.id];
      if (li) {
        delete known[project.id];
        var desc = li.querySelector('.hub-desc');
        if (desc && labels.descriptions && labels.descriptions[project.id]) {
          desc.textContent = labels.descriptions[project.id];
        }
        if (project.keywords) {
          var link = li.querySelector('.hub-card');
          if (link) link.setAttribute('data-keywords', project.keywords);
        }
      } else {
        li = buildCard(project, labels);
      }
      frag.appendChild(li);
    });
    Object.keys(known).forEach(function (id) {
      if (known[id].parentNode) known[id].parentNode.removeChild(known[id]);
    });
    hub.appendChild(frag);
  }

  function applyQuery() {
    var hub = document.getElementById('hub');
    var input = document.getElementById('projectSearch');
    var empty = document.getElementById('noResults');
    var queryEl = document.getElementById('noResultsQuery');
    var clearBtn = document.getElementById('clearSearch');
    if (!hub || !input) return;
    var q = (input.value || '').trim().toLowerCase();
    var shown = 0;
    Array.prototype.forEach.call(hub.children, function (li) {
      if (!li || li.tagName !== 'LI') return;
      var card = li.querySelector('.hub-card') || li;
      var blob = ((card.innerText || '') + ' ' + (card.getAttribute('data-keywords') || '')).toLowerCase();
      var ok = !q || blob.indexOf(q) !== -1;
      li.hidden = !ok;
      if (ok) shown += 1;
    });
    if (empty) empty.hidden = shown !== 0;
    if (queryEl) queryEl.textContent = input.value.trim();
    if (clearBtn) clearBtn.hidden = !q;
  }

  function load() {
    var hub = document.getElementById('hub');
    if (hub) hub.setAttribute('aria-busy', 'true');
    return fetch('/api/projects', { headers: { Accept: 'application/json' } })
      .then(function (res) {
        if (!res.ok) throw new Error('status');
        return res.json();
      })
      .then(function (data) {
        var projects = (data && Array.isArray(data.projects) ? data.projects : []).filter(function (project) {
          return window.ATMFilter && window.ATMFilter.isOwnProject(project);
        });
        if (projects.length) render(projects);
      })
      .catch(function () {})
      .then(function () {
        if (hub) hub.setAttribute('aria-busy', 'false');
        applyQuery();
        startProbes(hub || document);
      });
  }

  ready(function () {
    var labels = copy();
    var hub = document.getElementById('hub');
    if (hub) keyboard(hub);
    typeLine(labels.phrases || []);

    var input = document.getElementById('projectSearch');
    var clearBtn = document.getElementById('clearSearch');
    var resetBtn = document.getElementById('btnResetFilters');
    var form = document.querySelector('.search-row');
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
        applyQuery();
        if (input) input.focus();
      });
    }
    window.addEventListener('keydown', function (event) {
      if ((event.ctrlKey || event.metaKey) && (event.key || '').toLowerCase() === 'k') {
        if (!input) return;
        event.preventDefault();
        input.focus();
        input.select();
      }
    });
    load();
  });
})();
