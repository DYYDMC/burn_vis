// Language modules: picks the language, looks up strings, translates the static HTML.
// To add a language, create src/locales/<code>.js with the same keys as en.js and list it in LANGS.

import en from './locales/en.js';
import zh from './locales/zh.js';

export const LANGS = [en, zh];

const KEY = 'burn-vis/lang';

function initial() {
  try { const saved = localStorage.getItem(KEY); if (LANGS.some(l => l.code === saved)) return saved; } catch { /* storage blocked */ }
  for (const tag of navigator.languages || []) {
    const hit = LANGS.find(l => l.code === tag.split('-')[0].toLowerCase());
    if (hit) return hit.code;
  }
  return en.code;
}

let current = LANGS.find(l => l.code === initial());

export const lang = () => current;

export function setLang(code) {
  current = LANGS.find(l => l.code === code) || en;
  try { localStorage.setItem(KEY, current.code); } catch { /* private mode: keep for this visit */ }
}

// Missing keys fall back to English, then to the key itself. Function values take arguments.
export function t(key, ...args) {
  const v = current.strings[key] ?? en.strings[key] ?? key;
  return typeof v === 'function' ? v(...args) : v;
}

export const has = key => key in current.strings || key in en.strings;

export const fmtDate = iso => { const d = new Date(iso + 'T00:00:00Z'); return t('date', d.getUTCDate(), d.getUTCMonth()); };

// Elements carry data-i18n (text), data-i18n-placeholder or data-i18n-aria-label with a string key.
export function translatePage(root = document) {
  document.documentElement.lang = current.locale;
  document.title = t('title');
  for (const el of root.querySelectorAll('[data-i18n]')) el.textContent = t(el.dataset.i18n);
  for (const el of root.querySelectorAll('[data-i18n-placeholder]')) el.placeholder = t(el.dataset.i18nPlaceholder);
  for (const el of root.querySelectorAll('[data-i18n-aria-label]')) el.setAttribute('aria-label', t(el.dataset.i18nAriaLabel));
}
