/* ═══════════════════════════════════════════════════════════════
   NectarOS i18n System — Internationalization Function
   Applies translations to all elements with data-i18n attribute
═══════════════════════════════════════════════════════════════ */

// Global translation function that doesn't interfere with existing logic
window.__i18n = function() {
  try {
    const lang = localStorage.getItem('nectaros_lang') || 'ar';
    if (typeof NECTAR_LANGS === 'undefined') return;
    const langObj = NECTAR_LANGS[lang];
    if (!langObj) return;

    const elements = document.querySelectorAll('[data-i18n]');
    elements.forEach(el => {
      const key = el.getAttribute('data-i18n');
      const translation = langObj[key];
      if (translation) {
        // Only update if it's a simple text element or has no children
        if (el.children.length === 0) {
          el.textContent = translation;
        } else {
          // Update only the first text node to preserve icons/spans
          for (let node of el.childNodes) {
            if (node.nodeType === 3 && node.textContent.trim()) {
              node.textContent = translation;
              break;
            }
          }
        }
        // Attributes
        if (el.hasAttribute('placeholder')) el.setAttribute('placeholder', translation);
        if (el.hasAttribute('title')) el.setAttribute('title', translation);
      }
    });
    
    // Set document direction
    if (langObj._dir) document.documentElement.setAttribute('dir', langObj._dir);
    document.documentElement.setAttribute('lang', lang);
  } catch (e) {
    console.warn('i18n error:', e);
  }
};

// Run on load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', window.__i18n);
} else {
  window.__i18n();
}
