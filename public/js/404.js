(function () {
  'use strict';

  function applyTheme(theme) {
    var next = theme === 'light' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    try { localStorage.setItem('trujillo_theme', next); } catch (e) {}
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', next === 'light' ? '#ffffff' : '#080c14');
    var btn = document.getElementById('theme-btn');
    if (btn) {
      btn.setAttribute('aria-label', next === 'light' ? 'Cambiar a modo oscuro' : 'Cambiar a modo claro');
      btn.title = next === 'light' ? 'Modo oscuro' : 'Modo claro';
    }
  }

  try {
    applyTheme(localStorage.getItem('trujillo_theme') || 'dark');
  } catch (e) {
    applyTheme('dark');
  }

  var themeBtn = document.getElementById('theme-btn');
  if (themeBtn) {
    themeBtn.addEventListener('click', function () {
      applyTheme(document.documentElement.getAttribute('data-theme') === 'light' ? 'dark' : 'light');
    });
  }

  try {
    var host = window.location.hostname || 'trujillomingorance.com';
    var path = window.location.pathname || '/';
    var teleHost = document.getElementById('teleHost');
    var hostDisplay = document.getElementById('hostDisplay');
    var telePath = document.getElementById('telePath');
    var teleTime = document.getElementById('teleTime');
    if (teleHost) teleHost.textContent = host;
    if (hostDisplay) hostDisplay.textContent = host;
    if (telePath) telePath.textContent = path;
    if (teleTime) teleTime.textContent = new Date().toISOString();
  } catch (e) {}

  var copyBtn = document.getElementById('copyBtnText');
  var copyWrap = document.getElementById('btnCopyDiag');
  function copyDiagnostics() {
    var hostNow = (document.getElementById('teleHost') && document.getElementById('teleHost').textContent) || window.location.hostname;
    var pathNow = (document.getElementById('telePath') && document.getElementById('telePath').textContent) || window.location.pathname;
    var text = 'Diagnóstico perimetral ATM Labs:\nHost: ' + hostNow + '\nRuta: ' + pathNow + '\nEstado: HTTP 404\nEdge: Cloudflare Anycast\nFecha: ' + new Date().toISOString();
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () {
        if (copyBtn) {
          copyBtn.textContent = 'Copiado';
          setTimeout(function () { copyBtn.textContent = 'Copiar diagnóstico'; }, 2500);
        }
      }).catch(function () {});
    }
  }
  if (copyWrap) copyWrap.addEventListener('click', copyDiagnostics);

  var backBtn = document.getElementById('btnBack');
  if (backBtn) {
    backBtn.addEventListener('click', function () {
      if (window.history.length > 1) window.history.back();
      else window.location.href = 'https://labs.trujillomingorance.com';
    });
  }
})();
