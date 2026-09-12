(function () {
  'use strict';

  function $(id) { return document.getElementById(id); }

  function h(tag, className, text) {
    var n = document.createElement(tag);
    if (className) n.className = className;
    if (text != null && text !== '') n.textContent = text;
    return n;
  }

  function clearNode(node) {
    while (node.firstChild) node.removeChild(node.firstChild);
  }

  var FEATURED = {
    'trujillo-ai-studio': 0,
    'rewrite-ai': 1,
    'trujillo-guides': 2,
    'savings-runway': 3,
    focusguard: 4,
    'alberto-portfolio': 5
  };

  var HIDDEN_HOSTS = {
    'trujillomingorance.com': 1,
    'labs.trujillomingorance.com': 1,
    'rocky.trujillomingorance.com': 1
  };

  var state = {
    projects: [],
    query: '',
    expanded: false
  };

  function professionalHost(value) {
    if (!value) return '';
    var host = String(value).replace(/^https?:\/\//i, '').split('/')[0].toLowerCase();
    if (!host || host.indexOf('pages.dev') !== -1) return '';
    if (host === 'trujillomingorance.com' || host.slice(-23) === '.trujillomingorance.com') return host;
    return '';
  }

  function isOwnProject(project) {
    var host = professionalHost(project && project.domain) || professionalHost(project && project.url);
    if (!host || HIDDEN_HOSTS[host]) return false;
    var id = project.id || '';
    if (id === 'domain-root' || id === 'atm-labs-hub' || id === 'rocky-setter') return false;
    return true;
  }

  function isFeatured(project) {
    if (project.featured) return true;
    return Object.prototype.hasOwnProperty.call(FEATURED, project.id);
  }

  function applyTheme(theme) {
    var next = theme === 'light' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    try { localStorage.setItem('trujillo_theme', next); } catch (e) {}
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', next === 'light' ? '#ffffff' : '#080c14');
    var btn = $('theme-btn');
    if (btn) {
      btn.setAttribute('aria-label', next === 'light' ? 'Cambiar a modo oscuro' : 'Cambiar a modo claro');
      btn.title = next === 'light' ? 'Modo oscuro' : 'Modo claro';
    }
  }

  function renderSkeletons(grid, count) {
    clearNode(grid);
    for (var i = 0; i < count; i++) {
      var card = h('article', 'app-card skeleton-card');
      card.appendChild(h('div', 'skeleton-line skeleton-wide'));
      card.appendChild(h('div', 'skeleton-line'));
      card.appendChild(h('div', 'skeleton-line skeleton-short'));
      grid.appendChild(card);
    }
  }

  function renderCard(project) {
    var card = h('article', 'app-card');
    card.dataset.category = project.category || 'apps';
    var body = h('div', 'card-body');
    body.appendChild(h('p', 'card-kicker', project.domain || ''));
    body.appendChild(h('h2', 'card-title', project.title || ''));
    body.appendChild(h('p', 'card-description', project.description || ''));
    var stack = Array.isArray(project.stack) ? project.stack : [];
    if (stack.length) {
      var list = h('ul', 'tech-stack');
      stack.forEach(function (item) {
        list.appendChild(h('li', 'tech-pill', item));
      });
      body.appendChild(list);
    }
    card.appendChild(body);
    var footer = h('div', 'card-footer');
    var launch = h('a', 'btn-launch');
    launch.href = project.url || '#';
    launch.target = '_blank';
    launch.rel = 'noopener';
    launch.appendChild(h('span', null, project.cta || 'Abrir'));
    footer.appendChild(launch);
    card.appendChild(footer);
    return card;
  }

  function matches(project) {
    var q = state.query;
    if (!q) return true;
    var blob = [project.title, project.description, project.keywords, project.domain].join(' ').toLowerCase();
    return blob.indexOf(q) !== -1;
  }

  function renderGrid() {
    var grid = $('projectsGrid');
    var moreGrid = $('moreGrid');
    var moreWrap = $('moreWrap');
    var moreBtn = $('moreBtn');
    var noResults = $('noResults');
    var queryEl = $('noResultsQuery');
    if (!grid) return;

    var visible = state.projects.filter(matches);
    var featured = visible.filter(isFeatured);
    var rest = visible.filter(function (p) { return !isFeatured(p); });
    var searching = !!state.query;

    clearNode(grid);
    (searching ? visible : featured).forEach(function (p) { grid.appendChild(renderCard(p)); });

    if (moreGrid) clearNode(moreGrid);
    var showRest = !searching && rest.length > 0;
    if (moreWrap) moreWrap.classList.toggle('hidden', !showRest);
    if (moreGrid) moreGrid.classList.toggle('hidden', !showRest || !state.expanded);
    if (showRest && state.expanded && moreGrid) {
      rest.forEach(function (p) { moreGrid.appendChild(renderCard(p)); });
    }
    if (moreBtn) moreBtn.textContent = state.expanded ? 'Mostrar menos' : ('Mostrar más' + (rest.length ? ' (' + rest.length + ')' : ''));

    if (noResults) noResults.classList.toggle('hidden', visible.length > 0);
    if (queryEl) queryEl.textContent = state.query;
  }

  async function loadProjects() {
    var grid = $('projectsGrid');
    if (grid) renderSkeletons(grid, 5);
    try {
      var res = await fetch('/api/projects?v=hub8', { headers: { Accept: 'application/json' } });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      var data = await res.json();
      state.projects = (Array.isArray(data.projects) ? data.projects : []).filter(isOwnProject);
    } catch (err) {
      state.projects = [];
    }
    renderGrid();
  }

  function init() {
    try {
      applyTheme(localStorage.getItem('trujillo_theme') || 'dark');
    } catch (e) {
      applyTheme('dark');
    }

    var themeBtn = $('theme-btn');
    if (themeBtn) {
      themeBtn.addEventListener('click', function () {
        applyTheme(document.documentElement.getAttribute('data-theme') === 'light' ? 'dark' : 'light');
      });
    }

    var searchInput = $('projectSearch');
    var clearBtn = $('clearSearch');
    var moreBtn = $('moreBtn');
    var btnReset = $('btnResetFilters');

    window.addEventListener('keydown', function (e) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (searchInput) { searchInput.focus(); searchInput.select(); }
      }
    });

    if (searchInput) {
      searchInput.addEventListener('input', function () {
        state.query = (searchInput.value || '').trim().toLowerCase();
        if (clearBtn) clearBtn.classList.toggle('hidden', !state.query);
        renderGrid();
      });
    }
    if (clearBtn) {
      clearBtn.addEventListener('click', function () {
        if (searchInput) searchInput.value = '';
        state.query = '';
        clearBtn.classList.add('hidden');
        if (searchInput) searchInput.focus();
        renderGrid();
      });
    }
    if (moreBtn) {
      moreBtn.addEventListener('click', function () {
        state.expanded = !state.expanded;
        renderGrid();
      });
    }
    if (btnReset) {
      btnReset.addEventListener('click', function () {
        state.query = '';
        state.expanded = false;
        if (searchInput) searchInput.value = '';
        if (clearBtn) clearBtn.classList.add('hidden');
        renderGrid();
      });
    }

    loadProjects();
    setupAuth();
  }

  // --- AUTH INFRASTRUCTURE ---
  var GOOGLE_CLIENT_ID = '161745150528-5pb84k9upvamvlvnc7lg6nr1ku74vc4a.apps.googleusercontent.com';
  var X_CLIENT_ID = 'NF94WVVIT1dzSXZNaTJuYjRXSEc6MTpjaQ';

  function getSharedCookie(name) {
    var m = document.cookie.match(new RegExp('(?:^|;\\s*)' + name + '=([^;]+)'));
    return m ? decodeURIComponent(m[1]) : '';
  }

  function setSharedToken(tok, user) {
    if (!tok) return;
    try {
      localStorage.setItem('trujillo_ai_token', tok);
      localStorage.setItem('auth_token', tok);
      localStorage.setItem('trujillo_auth_token', tok);
      if (user) {
        localStorage.setItem('trujillo_ai_user', JSON.stringify(user));
        localStorage.setItem('auth_user', JSON.stringify(user));
      }
    } catch(e) {}
    document.cookie = 'ta_session=' + encodeURIComponent(tok) + '; Domain=.trujillomingorance.com; Path=/; Secure; SameSite=Lax; Max-Age=2592000';
    document.cookie = ['auth', 'token'].join('_') + '=' + encodeURIComponent(tok) + '; Domain=.trujillomingorance.com; Path=/; Secure; SameSite=Lax; Max-Age=2592000';
  }

  function renderAuthState(user) {
    var area = $('account-area');
    if (!area) return;
    if (user) {
      var initial = (user.name || user.email || 'A').charAt(0).toUpperCase();
      var name = user.name || user.email || 'Usuario';
      area.innerHTML = '<div style="display:inline-flex;align-items:center;gap:6px;padding:3px 10px 3px 4px;border-radius:9999px;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.14);font-size:12px;font-weight:600;color:var(--text);">' +
        '<div style="width:22px;height:22px;border-radius:50%;background:#38bdf8;color:#000;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;">' + initial + '</div>' +
        '<span>' + name.split(' ')[0] + '</span>' +
        '<button type="button" id="btn-hub-logout" title="Cerrar sesión" style="background:none;border:none;color:var(--text-muted,#94a3b8);cursor:pointer;padding:0 2px;margin-left:2px;font-size:13px;">✕</button>' +
        '</div>';
      var logoutBtn = $('btn-hub-logout');
      if (logoutBtn) {
        logoutBtn.onclick = function(e) {
          e.stopPropagation();
          localStorage.removeItem('trujillo_ai_token');
          localStorage.removeItem('auth_token');
          localStorage.removeItem('trujillo_auth_token');
          localStorage.removeItem('trujillo_ai_user');
          localStorage.removeItem('auth_user');
          document.cookie = 'ta_session=; Domain=.trujillomingorance.com; Path=/; Secure; SameSite=Lax; Max-Age=0';
          document.cookie = ['auth', 'token'].join('_') + '=; Domain=.trujillomingorance.com; Path=/; Secure; SameSite=Lax; Max-Age=0';
          fetch('/api/auth/logout', { method: 'POST' }).catch(function() {});
          location.reload();
        };
      }
    } else {
      area.innerHTML = '<button type="button" class="hub-link" id="btn-open-auth" style="display:inline-flex;align-items:center;gap:6px;cursor:pointer;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.12);padding:4px 10px;border-radius:9999px;">' +
        '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>' +
        '<span id="auth-btn-label">Acceder</span>' +
        '</button>';
      var openBtn = $('btn-open-auth');
      if (openBtn) openBtn.onclick = openHubAuth;
    }
  }

  function openHubAuth() {
    var modal = $('hub-auth-modal');
    if (!modal) return;
    modal.style.display = 'flex';
    modal.hidden = false;
    mountGoogleInHub();
  }

  function closeHubAuth() {
    var modal = $('hub-auth-modal');
    if (!modal) return;
    modal.style.display = 'none';
    modal.hidden = true;
  }

  function mountGoogleInHub() {
    var slot = $('google-hub-btn');
    if (!slot || slot.getAttribute('data-ready')) return;
    function renderBtn() {
      if (!window.google?.accounts?.id || !$('google-hub-btn')) return;
      try {
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: async function(res) {
            try {
              var r = await fetch('/api/auth/google', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ credential: res.credential })
              });
              var d = await r.json();
              if (r.ok && (d.ok || d.token)) {
                setSharedToken(d.token, d.user);
                closeHubAuth();
                location.reload();
              } else {
                showHubAuthError(d.error || 'No se pudo iniciar sesión con Google.');
              }
            } catch(e) {
              showHubAuthError('Error de conexión con Google.');
            }
          },
          auto_select: false,
          ux_mode: 'popup'
        });
        window.google.accounts.id.renderButton(slot, {
          type: 'standard',
          theme: (document.documentElement.getAttribute('data-theme') === 'light' ? 'outline' : 'filled_black'),
          size: 'large',
          text: 'continue_with',
          shape: 'pill',
          width: 280
        });
        slot.setAttribute('data-ready', 'true');
      } catch(e) {}
    }

    if (window.google?.accounts?.id) {
      setTimeout(renderBtn, 50);
    } else {
      var interval = setInterval(function () {
        if (window.google?.accounts?.id) {
          clearInterval(interval);
          renderBtn();
        }
      }, 150);
      setTimeout(function () { clearInterval(interval); }, 5000);
    }
  }

  function showHubAuthError(msg) {
    var el = $('hub-auth-error');
    if (!el) return;
    el.textContent = msg;
    el.style.display = 'block';
  }

  function setupAuth() {
    var openBtn = $('btn-open-auth');
    if (openBtn) openBtn.onclick = openHubAuth;
    var closeBtn = $('hub-close-auth');
    if (closeBtn) closeBtn.onclick = closeHubAuth;
    var modal = $('hub-auth-modal');
    if (modal) {
      modal.onclick = function(e) {
        if (e.target === modal) closeHubAuth();
      };
    }

    var xBtn = $('btn-hub-x');
    if (xBtn) {
      xBtn.onclick = function() {
        var state = 'x_oauth_' + Math.random().toString(36).slice(2, 10);
        try { localStorage.setItem('trujillo_x_oauth_state', state); } catch(e) {}
        var redirectUri = encodeURIComponent(window.location.origin + '/?auth=x_callback');
        window.location.href = 'https://twitter.com/i/oauth2/authorize?response_type=code&client_id=' + X_CLIENT_ID +
          '&redirect_uri=' + redirectUri + '&scope=users.read%20tweet.read&state=' + state +
          '&code_challenge=challenge&code_challenge_method=plain';
      };
    }

    // Check X callback
    try {
      var params = new URLSearchParams(window.location.search);
      var stateParam = params.get('state') || '';
      var isX = params.get('auth') === 'x_callback' || stateParam.indexOf('x_oauth_') === 0;
      if (isX) {
        var code = params.get('code');
        window.history.replaceState({}, document.title, window.location.pathname);
        if (code) {
          fetch('/api/auth/x', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code: code, redirectUri: window.location.origin + '/?auth=x_callback' })
          })
            .then(function(r) { return r.json().then(function(d) { return { ok: r.ok, d: d }; }); })
            .then(function(res) {
              if (res.ok && res.d.token) {
                setSharedToken(res.d.token, res.d.user);
                location.reload();
              } else {
                alert(res.d.error || 'No se pudo iniciar sesión con X.');
              }
            })
            .catch(function() { alert('Error al contactar con X'); });
        }
      }
    } catch(e) {}

    // Check existing session
    var tok = localStorage.getItem('trujillo_ai_token') ||
      localStorage.getItem('auth_token') ||
      getSharedCookie('ta_session') ||
      getSharedCookie('auth_token');
    if (tok) {
      fetch('/api/auth/me', {
        headers: { 'Authorization': 'Bearer ' + tok }
      })
        .then(function(r) { return r.json().then(function(d) { return { ok: r.ok, d: d }; }); })
        .then(function(res) {
          if (res.ok && res.d.user) {
            renderAuthState(res.d.user);
          } else {
            renderAuthState(null);
          }
        })
        .catch(function() {
          renderAuthState(null);
        });
    } else {
      renderAuthState(null);
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
