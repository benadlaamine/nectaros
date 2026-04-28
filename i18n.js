/* ═══════════════════════════════════════════════════════════════
   NectarOS i18n System — Internationalization Function
   Applies translations to all elements with data-i18n attribute
═══════════════════════════════════════════════════════════════ */

// Current language (default: Arabic)
let CURRENT_LANG = localStorage.getItem('nectaros_lang') || 'ar';

// Initialize i18n system
function initI18n() {
  try {
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
    
    console.log('i18n system initialized');
  } catch (e) {
    console.error('Failed to initialize i18n:', e);
  }
}

// Apply translations to all elements with data-i18n attribute
function applyTranslations() {
  try {
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
            if (node.nodeType === 3 && node.textContent.trim()) { // Node.TEXT_NODE = 3
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
  } catch (e) {
    console.error('Error applying translations:', e);
  }
}

// Get translation from NECTAR_LANGS object
function getTranslation(key, lang) {
  if (typeof NECTAR_LANGS === 'undefined') {
    return null;
  }
  
  const langObj = NECTAR_LANGS[lang];
  if (!langObj) {
    return null;
  }
  
  return langObj[key] || null;
}

// Set language attributes on HTML element
function setLanguageAttributes(lang) {
  try {
    const htmlElement = document.documentElement;
    htmlElement.setAttribute('lang', lang);
    
    if (typeof NECTAR_LANGS !== 'undefined' && NECTAR_LANGS[lang] && NECTAR_LANGS[lang]._dir) {
      htmlElement.setAttribute('dir', NECTAR_LANGS[lang]._dir);
    }
  } catch (e) {}
}

// Change language globally
function changeLanguage(lang) {
  if (typeof NECTAR_LANGS !== 'undefined' && NECTAR_LANGS[lang]) {
    CURRENT_LANG = lang;
    localStorage.setItem('nectaros_lang', lang);
    applyTranslations();
    setLanguageAttributes(lang);
    
    // Dispatch custom event for other components to listen to
    window.dispatchEvent(new CustomEvent('languageChanged', { detail: { lang } }));
  }
}

// Initialize i18n when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initI18n);
} else {
  initI18n();
}
