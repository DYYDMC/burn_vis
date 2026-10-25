// localStorage persistence. Data lives only in the browser that opened the app.

import { defaultState } from './model.js';

const KEY = 'burn-vis/state/v1';

export function load(today) {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return { state: { ...defaultState(today), ...JSON.parse(raw) }, isNew: false };
  } catch { /* storage blocked or corrupt: start fresh */ }
  return { state: defaultState(today), isNew: true };
}

export function save(state) {
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* private mode: keep in memory */ }
}
