/* Language memory shared with the apex hub (localStorage key atm_lang_choice). */
(function () {
  'use strict';

  var CHOICE = 'atm_lang_choice';

  function swapPath(path, lang) {
    var bare = String(path || '/').replace(/^\/(en|ca)(?=\/|$)/, '');
    if (!bare || bare.charAt(0) !== '/') bare = '/' + (bare || '');
    if (bare.length > 1 && bare.charAt(bare.length - 1) === '/') bare = bare.slice(0, -1);
    if (lang === 'es') return bare || '/';
    if (bare === '/') return '/' + lang + '/';
    return '/' + lang + bare;
  }

  if (typeof document !== 'undefined') {
    document.addEventListener('click', function (event) {
      var node = event.target;
      while (node && node !== document) {
        if (node.getAttribute && node.getAttribute('data-lang-switch')) {
          var lang = node.getAttribute('data-lang-switch');
          try { localStorage.setItem(CHOICE, lang); } catch (e) {}
          if (document.body && document.body.getAttribute('data-page') === '404') {
            event.preventDefault();
            var next = swapPath(location.pathname, lang);
            if (location.search) next += location.search;
            location.assign(next);
          }
          return;
        }
        node = node.parentNode;
      }
    });
  }

  var target = typeof globalThis !== 'undefined' ? globalThis : window;
  target.ATMLang = { choiceKey: CHOICE, swapPath: swapPath };
})();
