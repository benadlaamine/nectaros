/* ═══════════════════════════════════════════════════════════════
   NectarOS i18n System — Internationalization Function
   Applies translations to all elements with data-i18n attribute
═══════════════════════════════════════════════════════════════ */

// Current language (default: Arabic)
// CURRENT_LANG handled by lang.js

// Initialize i18n system
function initI18n() {
  // Apply translations on page load
  applyTranslations();
  
  // Set document language and direction
  setLanguageAttributes(CURRENT_LANG);
  
  // Listen for language changes
  window.addEventListener('languageChanged', (e) => {
    CURRENT_LANG = e.detail.lang;
    applyTranslations();
    setLanguageAttributes(CURRENT_LANG);
  });
}

// Apply translations to all elements with data-i18n attribute
function applyTranslations() {
  const elements = document.querySelectorAll('[data-i18n]');
  
  elements.forEach(element => {
    const key = element.getAttribute('data-i18n');
    const translation = getTranslation(key, CURRENT_LANG);
    
    if (translation) {
      // Check if element has child nodes or is a simple text element
      if (element.children.length === 0) {
        // Simple text element
        element.textContent = translation;
      } else {
        // Element with child nodes - update only the first text node
        let firstTextNode = null;
        for (let node of element.childNodes) {
          if (node.nodeType === Node.TEXT_NODE && node.textContent.trim()) {
            firstTextNode = node;
            break;
          }
        }
        
        if (firstTextNode) {
          firstTextNode.textContent = translation;
        } else {
          // If no text node found, prepend the translation
          element.insertBefore(document.createTextNode(translation), element.firstChild);
        }
      }
      
      // Also update common attributes
      if (element.hasAttribute('placeholder')) {
        element.setAttribute('placeholder', translation);
      }
      if (element.hasAttribute('title')) {
        element.setAttribute('title', translation);
      }
      if (element.hasAttribute('alt')) {
        element.setAttribute('alt', translation);
      }
    }
  });
}

// Get translation from NECTAR_LANGS object
function getTranslation(key, lang) {
  if (typeof NECTAR_LANGS === 'undefined') {
    console.warn('NECTAR_LANGS not loaded');
    return null;
  }
  
  const langObj = NECTAR_LANGS[lang];
  if (!langObj) {
    console.warn(`Language '${lang}' not found in NECTAR_LANGS`);
    return null;
  }
  
  return langObj[key] || null;
}

// Set language attributes on HTML element
function setLanguageAttributes(lang) {
  const htmlElement = document.documentElement;
  htmlElement.setAttribute('lang', lang);
  
  const langObj = NECTAR_LANGS[lang];
  if (langObj && langObj._dir) {
    htmlElement.setAttribute('dir', langObj._dir);
  }
}

// Change language globally
function changeLanguage(lang) {
  if (NECTAR_LANGS[lang]) {
    CURRENT_LANG = lang;
    localStorage.setItem('nectaros_lang', lang);
    applyTranslations();
    setLanguageAttributes(lang);
    
    // Dispatch custom event for other components to listen to
    window.dispatchEvent(new CustomEvent('languageChanged', { detail: { lang } }));
  } else {
    console.error(`Language '${lang}' not supported`);
  }
}

// Get current language
function getCurrentLanguage() {
  return CURRENT_LANG;
}

// Get all available languages
function getAvailableLanguages() {
  if (typeof NECTAR_LANGS === 'undefined') return [];
  return Object.keys(NECTAR_LANGS);
}

// Initialize i18n when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initI18n);
} else {
  initI18n();
}
