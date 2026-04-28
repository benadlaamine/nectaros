/* ═══════════════════════════════════════════════════════════════
   NectarOS i18n Bridge v2.0
   يعمل كجسر بين نظام I18N (lang.js) ونظام T (index.html)
   الأولوية: I18N من lang.js ← T من index.html ← النص الأصلي
═══════════════════════════════════════════════════════════════ */

/* الحصول على الترجمة مع fallback ذكي */
function getTranslation(key, lang) {
  lang = lang || (window.I18N && window.I18N.current) || 
         localStorage.getItem('_nec_lang') || 'ar';
  // 1. I18N system (lang.js)
  if(window.I18N) {
    const v = window.I18N.t(key);
    if(v && v !== key) return v;
  }
  // 2. T system (index.html)
  if(window.T && window.T[lang] && window.T[lang][key]) return window.T[lang][key];
  if(window.T && window.T['ar'] && window.T['ar'][key]) return window.T['ar'][key];
  return null;
}

/* تطبيق الترجمات على كل العناصر */
function applyTranslations(root) {
  root = root || document;
  const lang = (window.I18N && window.I18N.current) ||
               localStorage.getItem('_nec_lang') || 'ar';
  root.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    const val = getTranslation(key, lang);
    if(!val || val === key) return;
    const tag = el.tagName;
    if(tag==='INPUT'||tag==='TEXTAREA'){
      if(el.placeholder) el.placeholder = val;
    } else if(tag==='OPTION'){
      el.text = val;
    } else if(el.children.length===0){
      el.textContent = val;
    } else {
      for(const node of el.childNodes){
        if(node.nodeType===3 && node.textContent.trim()){
          node.textContent = val; break;
        }
      }
    }
  });
}

/* ضبط اتجاه الصفحة */
function setLanguageAttributes(lang) {
  const isRTL = ['ar'].includes(lang);
  const dir = isRTL ? 'rtl' : 'ltr';
  document.documentElement.setAttribute('lang', lang);
  document.documentElement.setAttribute('dir', dir);
  document.body && (document.body.dir = dir);
}

/* تغيير اللغة */
function changeLanguage(lang) {
  if(window.I18N) {
    window.I18N.apply(lang, true);
  }
  if(typeof window.setLang === 'function') {
    window.setLang(lang);
  } else {
    localStorage.setItem('_nec_lang', lang);
    setLanguageAttributes(lang);
    applyTranslations();
  }
}

/* الحصول على اللغة الحالية */
function getCurrentLanguage() {
  return (window.I18N && window.I18N.current) ||
         localStorage.getItem('_nec_lang') || 'ar';
}

/* الحصول على اللغات المتاحة */
function getAvailableLanguages() {
  if(window.NECTAR_LANGS) return Object.keys(window.NECTAR_LANGS);
  if(window.T) return Object.keys(window.T);
  return ['ar'];
}

/* تهيئة النظام */
function initI18n() {
  const lang = getCurrentLanguage();
  setLanguageAttributes(lang);
  // انتظر I18N من lang.js
  if(window.I18N) {
    window.I18N.apply(lang, false);
  } else {
    applyTranslations();
  }
}

/* تصدير للاستخدام العالمي */
window.i18nBridge = { getTranslation, applyTranslations, changeLanguage, 
                      getCurrentLanguage, getAvailableLanguages, initI18n };

/* تشغيل تلقائي */
if(document.readyState === 'loading'){
  document.addEventListener('DOMContentLoaded', initI18n);
} else {
  // تأخير بسيط لضمان تحميل lang.js أولاً
  setTimeout(initI18n, 0);
}

/* الاستماع لتغييرات اللغة */
window.addEventListener('langchange', e => {
  const lang = e.detail && e.detail.lang;
  if(lang) {
    if(typeof window.currentLang !== 'undefined') window.currentLang = lang;
    setLanguageAttributes(lang);
    applyTranslations();
  }
});
