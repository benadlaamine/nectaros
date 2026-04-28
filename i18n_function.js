/* ═══════════════════════════════════════════════════════════════
   NectarOS i18n_function.js — Safe Bridge (v2.0)
   ⚠️ هذا الملف لا يُعرِّف CURRENT_LANG منفصلاً
   النظام الموحَّد الكامل في: lang.js → window.I18N
   هذا الملف يُوجِّه كل الطلبات لـ I18N لتجنب أي تعارض
═══════════════════════════════════════════════════════════════ */

/* ── لا يوجد CURRENT_LANG هنا — يُستخدم I18N.current فقط ── */

/**
 * تطبيق الترجمات على كل عناصر [data-i18n]
 * يُفوَّض لـ I18N.translateAll() في lang.js
 */
function applyTranslations() {
  if (window.I18N) {
    window.I18N.translateAll();
  }
}

/**
 * تغيير اللغة العالمية
 * يُفوَّض لـ I18N.apply() في lang.js
 * @param {string} lang - رمز اللغة (ar | en | fr | ...)
 */
function changeLanguage(lang) {
  if (window.I18N) {
    window.I18N.apply(lang);
  }
}

/**
 * الحصول على اللغة الحالية
 * @returns {string}
 */
function getCurrentLanguage() {
  if (window.I18N) return window.I18N.current;
  return localStorage.getItem('_nec_lang') || 'ar';
}

/**
 * قائمة اللغات المتاحة
 * @returns {string[]}
 */
function getAvailableLanguages() {
  if (window.NECTAR_LANGS) return Object.keys(window.NECTAR_LANGS);
  return ['ar'];
}

/**
 * تهيئة — no-op لأن lang.js يعالجها تلقائياً
 */
function initI18n() {
  // lang.js → _i18nReady() يعالج التهيئة تلقائياً
  // لا حاجة لأي شيء هنا
}

/**
 * ضبط سمات الاتجاه على العنصر الجذر
 * يُفوَّض لـ I18N._applyLayout()
 * @param {string} lang
 */
function setLanguageAttributes(lang) {
  if (window.I18N && window.NECTAR_LANGS && NECTAR_LANGS[lang]) {
    const dir = NECTAR_LANGS[lang]._dir || 'rtl';
    document.documentElement.setAttribute('lang', lang);
    document.documentElement.setAttribute('dir', dir);
  }
}

/**
 * الحصول على ترجمة مفتاح معين
 * @param {string} key
 * @param {string} [lang]
 * @returns {string|null}
 */
function getTranslation(key, lang) {
  if (window.I18N) return window.I18N.t(key);
  if (window.NECTAR_LANGS) {
    const l = lang || getCurrentLanguage();
    return (NECTAR_LANGS[l] || NECTAR_LANGS['ar'] || {})[key] || null;
  }
  return null;
}
