(function () {
  try {
    var theme = localStorage.getItem('trujillo_theme') || localStorage.getItem('atm_theme') || 'dark';
    if (theme !== 'light' && theme !== 'dark') theme = 'dark';
    document.documentElement.setAttribute('data-theme', theme);
  } catch (e) {
    document.documentElement.setAttribute('data-theme', 'dark');
  }
  try {
    var lang = localStorage.getItem('atm_lang');
    if (lang) {
      document.documentElement.lang = lang;
      if (lang === 'ar') document.documentElement.dir = 'rtl';
    }
  } catch (e) {}
})();
