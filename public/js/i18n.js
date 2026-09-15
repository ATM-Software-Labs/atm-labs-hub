(function () {
  'use strict';

  var SUPPORTED_LANGUAGES = [
    { id: 'es', code: 'es', name: 'Español', flag: '🇪🇸' },
    { id: 'en', code: 'en', name: 'English', flag: '🇬🇧' },
    { id: 'ca', code: 'ca', name: 'Català', flag: '🇦🇩' },
    { id: 'fr', code: 'fr', name: 'Français', flag: '🇫🇷' },
    { id: 'de', code: 'de', name: 'Deutsch', flag: '🇩🇪' },
    { id: 'it', code: 'it', name: 'Italiano', flag: '🇮🇹' },
    { id: 'pt', code: 'pt', name: 'Português', flag: '🇵🇹' },
    { id: 'nl', code: 'nl', name: 'Nederlands', flag: '🇳🇱' },
    { id: 'pl', code: 'pl', name: 'Polski', flag: '🇵🇱' },
    { id: 'sv', code: 'sv', name: 'Svenska', flag: '🇸🇪' },
    { id: 'ru', code: 'ru', name: 'Русский', flag: '🇷🇺' },
    { id: 'zh', code: 'zh', name: '中文', flag: '🇨🇳' },
    { id: 'ja', code: 'ja', name: '日本語', flag: '🇯🇵' },
    { id: 'ko', code: 'ko', name: '한국어', flag: '🇰🇷' },
    { id: 'ar', code: 'ar', name: 'العربية', flag: '🇸🇦' },
    { id: 'hi', code: 'hi', name: 'हिन्दी', flag: '🇮🇳' }
  ];

  window.ATM_LANGS = SUPPORTED_LANGUAGES;

  var SEARCH_PLACEHOLDERS = {
    es: 'Buscar un servicio…',
    en: 'Search services…',
    ca: 'Cercar un servei…',
    fr: 'Rechercher un service…',
    de: 'Dienste suchen…',
    it: 'Cerca servizi…',
    pt: 'Pesquisar serviços…',
    nl: 'Zoek een dienst…',
    pl: 'Szukaj usług…',
    sv: 'Sök tjänster…',
    ru: 'Поиск сервисов…',
    zh: '搜索服务…',
    ja: 'サービスを検索…',
    ko: '서비스 검색…',
    ar: 'البحث عن خدمات…',
    hi: 'सेवाएं खोजें…'
  };

  function known(id) {
    id = String(id || '').toLowerCase().slice(0, 2);
    return SUPPORTED_LANGUAGES.some(function (l) { return l.id === id || l.code === id; }) ? id : '';
  }

  window.atmLang = function () {
    try {
      var saved = known(localStorage.getItem('atm_lang'));
      if (saved) return saved;
    } catch (e) {}
    return 'es';
  };

  window.atmApplyUi = function (lang) {
    lang = known(lang) || window.atmLang();
    try { localStorage.setItem('atm_lang', lang); } catch (e) {}
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';

    var btn = document.getElementById('lang-flag-btn');
    var meta = SUPPORTED_LANGUAGES.filter(function (l) { return l.id === lang || l.code === lang; })[0];
    if (btn && meta) {
      var flagEl = btn.querySelector('.flag');
      var codeEl = btn.querySelector('.lang-code');
      if (flagEl) flagEl.textContent = meta.flag;
      if (codeEl) codeEl.textContent = (meta.code || meta.id).toUpperCase();
      btn.setAttribute('title', meta.name);
      btn.setAttribute('aria-label', meta.name);
    }

    var searchInput = document.getElementById('projectSearch');
    if (searchInput && SEARCH_PLACEHOLDERS[lang]) {
      searchInput.setAttribute('placeholder', SEARCH_PLACEHOLDERS[lang]);
    }

    document.querySelectorAll('.lang-option').forEach(function (b) {
      b.classList.toggle('active', b.getAttribute('data-lang') === lang);
    });

    document.dispatchEvent(new CustomEvent('atm:lang', { detail: { lang: lang } }));
  };

  function initLangPicker() {
    var menu = document.getElementById('lang-menu');
    var current = window.atmLang();

    if (menu && !menu.hasChildNodes()) {
      menu.innerHTML = SUPPORTED_LANGUAGES.map(function (l) {
        var code = l.code || l.id;
        return '<button type="button" class="lang-option' + (code === current ? ' active' : '') +
          '" data-lang="' + code + '" role="option"><span class="flag">' + l.flag +
          '</span><span>' + l.name + '</span></button>';
      }).join('');
    }

    window.atmApplyUi(current);

    document.addEventListener('click', function (e) {
      var flagBtn = e.target.closest('#lang-flag-btn');
      if (flagBtn) {
        var m = document.getElementById('lang-menu');
        if (m) {
          var isHidden = m.hidden;
          m.hidden = !isHidden;
          flagBtn.setAttribute('aria-expanded', isHidden ? 'true' : 'false');
        }
        return;
      }

      var langBtn = e.target.closest('.lang-option[data-lang]');
      if (langBtn) {
        var code = langBtn.getAttribute('data-lang');
        var m = document.getElementById('lang-menu');
        if (m) {
          m.hidden = true;
          var fBtn = document.getElementById('lang-flag-btn');
          if (fBtn) fBtn.setAttribute('aria-expanded', 'false');
        }
        window.atmApplyUi(code);
        return;
      }

      var m = document.getElementById('lang-menu');
      if (m && !m.hidden && !e.target.closest('.lang-picker')) {
        m.hidden = true;
        var fBtn = document.getElementById('lang-flag-btn');
        if (fBtn) fBtn.setAttribute('aria-expanded', 'false');
      }
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        var m = document.getElementById('lang-menu');
        if (m && !m.hidden) {
          m.hidden = true;
          var fBtn = document.getElementById('lang-flag-btn');
          if (fBtn) fBtn.setAttribute('aria-expanded', 'false');
        }
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLangPicker);
  } else {
    initLangPicker();
  }
})();
