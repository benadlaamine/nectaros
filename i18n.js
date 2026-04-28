/* ═══════════════════════════════════════════════════════════════
   NectarOS i18n Bridge — يعمل مع نظام I18N في lang.js
   هذا الملف محجوز للتوافقية — النظام الأساسي في lang.js
═══════════════════════════════════════════════════════════════ */

// Bridge: يعيد توجيه طلبات i18n.js إلى I18N في lang.js
// لا يعرّف CURRENT_LANG منفصلاً لتجنب التعارض

function applyTranslations() {
  if(window.I18N) {
    window.I18N.translateAll();
  }
}

function changeLanguage(lang) {
  if(window.I18N) {
    window.I18N.apply(lang);
  }
}

function getCurrentLanguage() {
  return window.I18N ? window.I18N.current : (localStorage.getItem('_nec_lang') || 'ar');
}

function getAvailableLanguages() {
  if(window.NECTAR_LANGS) return Object.keys(window.NECTAR_LANGS);
  return ['ar'];
}

// initI18n: no-op — lang.js handles initialization via _i18nReady()
function initI18n() {
  // handled by lang.js
}
