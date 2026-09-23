const fs = require('fs');
let c = fs.readFileSync('public/js/i18n.js', 'utf8');

const replacement = `  var SUPPORTED_LANGUAGES = [
    { id: 'es', code: 'es', name: 'Español', flag: '<img src="https://flagcdn.com/w20/es.png" width="16" alt="">' },
    { id: 'en', code: 'en', name: 'English', flag: '<img src="https://flagcdn.com/w20/gb.png" width="16" alt="">' },
    { id: 'ca', code: 'ca', name: 'Català', flag: '<img src="https://flagcdn.com/w20/es-ct.png" width="16" alt="">' },
    { id: 'fr', code: 'fr', name: 'Français', flag: '<img src="https://flagcdn.com/w20/fr.png" width="16" alt="">' },
    { id: 'de', code: 'de', name: 'Deutsch', flag: '<img src="https://flagcdn.com/w20/de.png" width="16" alt="">' },
    { id: 'it', code: 'it', name: 'Italiano', flag: '<img src="https://flagcdn.com/w20/it.png" width="16" alt="">' },
    { id: 'pt', code: 'pt', name: 'Português', flag: '<img src="https://flagcdn.com/w20/pt.png" width="16" alt="">' },
    { id: 'nl', code: 'nl', name: 'Nederlands', flag: '<img src="https://flagcdn.com/w20/nl.png" width="16" alt="">' },
    { id: 'pl', code: 'pl', name: 'Polski', flag: '<img src="https://flagcdn.com/w20/pl.png" width="16" alt="">' },
    { id: 'sv', code: 'sv', name: 'Svenska', flag: '<img src="https://flagcdn.com/w20/se.png" width="16" alt="">' },
    { id: 'ru', code: 'ru', name: 'Русский', flag: '<img src="https://flagcdn.com/w20/ru.png" width="16" alt="">' },
    { id: 'zh', code: 'zh', name: '中文', flag: '<img src="https://flagcdn.com/w20/cn.png" width="16" alt="">' },
    { id: 'ja', code: 'ja', name: '日本語', flag: '<img src="https://flagcdn.com/w20/jp.png" width="16" alt="">' },
    { id: 'ko', code: 'ko', name: '한국어', flag: '<img src="https://flagcdn.com/w20/kr.png" width="16" alt="">' },
    { id: 'ar', code: 'ar', name: 'العربية', flag: '<img src="https://flagcdn.com/w20/sa.png" width="16" alt="">' },
    { id: 'hi', code: 'hi', name: 'हिन्दी', flag: '<img src="https://flagcdn.com/w20/in.png" width="16" alt="">' }
  ];`;

c = c.replace(/var SUPPORTED_LANGUAGES = \[[\s\S]*?\];/, replacement);
fs.writeFileSync('public/js/i18n.js', c);
