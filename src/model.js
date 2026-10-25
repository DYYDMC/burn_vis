// Pure data model: dates, derived numbers, Apple Health import parsing. No DOM access.

export const DAY_MS = 864e5;
export const KCAL_PER_KG_FAT = 7700;

const pad = n => String(n).padStart(2, '0');
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

export const toUTC = iso => { const [y, m, d] = iso.split('-').map(Number); return Date.UTC(y, m - 1, d); };
export const fromUTC = ms => new Date(ms).toISOString().slice(0, 10);
export const addDays = (iso, n) => fromUTC(toUTC(iso) + n * DAY_MS);
export const diffDays = (a, b) => Math.round((toUTC(b) - toUTC(a)) / DAY_MS);
export const localToday = (now = new Date()) => `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;

export function defaultState(today) {
  return { version: 1, startDate: today, goalDate: addDays(today, 60), goalKcal: 9240, health: {}, healthSyncedAt: null, entries: [] };
}

// kcal per day: Apple Health Active Energy plus manual entries, limited to the goal window.
export function dailyTotals(state) {
  const byDay = {};
  const inWindow = d => d >= state.startDate && d <= state.goalDate;
  for (const [d, kcal] of Object.entries(state.health)) if (inWindow(d)) byDay[d] = (byDay[d] || 0) + kcal;
  for (const e of state.entries) if (inWindow(e.date)) byDay[e.date] = (byDay[e.date] || 0) + e.kcal;
  return byDay;
}

export function derive(state, today) {
  const byDay = dailyTotals(state);
  const burned = Object.values(byDay).reduce((a, k) => a + k, 0);
  const left = Math.max(0, state.goalKcal - burned);
  const totalDays = diffDays(state.startDate, state.goalDate) + 1;
  const daysDone = Math.max(0, Math.min(totalDays, diffDays(state.startDate, today)));   // full days before today
  const daysLeft = Math.max(0, Math.min(totalDays, diffDays(today, state.goalDate) + 1)); // incl. today
  const pace = state.goalKcal / totalDays;
  const neededPerDay = daysLeft ? left / daysLeft : left;
  const delta = burned - pace * daysDone;                                                 // + ahead, - behind
  const avg = daysDone ? burned / daysDone : 0;
  const projected = burned + avg * daysLeft;
  return { byDay, burned, left, totalDays, daysDone, daysLeft, pace, neededPerDay, delta, avg, projected, todayBurned: byDay[today] || 0 };
}

// Accepts German and English number formats, with or without a unit ("412,6 kcal", "1.234,5", "1,234.5").
// With both separators the last one is the decimal point; with one kind, exactly-3-digit groups are thousands.
function parseKcal(raw) {
  const s = raw.replace(/[^\d.,-]/g, '');
  if (!/\d/.test(s)) return NaN;
  const lastDot = s.lastIndexOf('.'), lastComma = s.lastIndexOf(',');
  if (lastDot >= 0 && lastComma >= 0) {
    const dec = lastDot > lastComma ? '.' : ',';
    return Number(s.replace(dec === '.' ? /,/g : /\./g, '').replace(',', '.'));
  }
  if (/^-?\d{1,3}([.,]\d{3})+$/.test(s)) return Number(s.replace(/[.,]/g, ''));
  return Number(s.replace(',', '.'));
}

// Parses the Shortcut payload "2026-10-01:412;2026-10-02:388" into { '2026-10-01': 412, ... }.
// Bad pairs are skipped; values for a repeated date are summed.
export function parseHealthPayload(payload) {
  const days = {};
  for (const pair of payload.split(/[;\n]+/)) {
    const i = pair.indexOf(':');
    if (i < 0) continue;
    const date = pair.slice(0, i).trim(), kcal = parseKcal(pair.slice(i + 1));
    if (!ISO_DATE.test(date) || !Number.isFinite(kcal) || kcal < 0) continue;
    days[date] = Math.round((days[date] || 0) + kcal);
  }
  return days;
}

// Apple Health is the source of truth for the days it reports: those days are replaced, others kept.
export function mergeHealth(state, days, syncedAt) {
  return { ...state, health: { ...state.health, ...days }, healthSyncedAt: syncedAt };
}
