// Wires the page: state load/save, Apple Health import from the URL hash, rendering, input.

import { derive, localToday, parseHealthPayload, mergeHealth, KCAL_PER_KG_FAT } from './model.js';
import { load, save } from './store.js';
import { createMelter } from './fat.js';
import { renderChart } from './chart.js';
import { LANGS, lang, setLang, t, has, fmtDate, translatePage } from './i18n.js';

const QUICK = [
  { emoji: '🚶', activity: 'Walk', min: 30, kcal: 120 },
  { emoji: '🏃', activity: 'Run', min: 30, kcal: 300 },
  { emoji: '🚴', activity: 'Cycling', min: 45, kcal: 350 },
  { emoji: '🏋️', activity: 'Gym', min: 60, kcal: 250 },
  { emoji: '🏊', activity: 'Swim', min: 30, kcal: 260 },
];

const SANE_MANUAL_KCAL = 2000;

const $ = id => document.getElementById(id);
const fmt = n => Math.round(n).toLocaleString('en-US');
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
// Entries store the English activity name; show it translated
const activityName = a => has(`act.${a}`) ? t(`act.${a}`) : a;

let { state, isNew } = load(localToday());
const melt = createMelter($('fat'), $('left-num'), () => state.goalKcal);

function commit(next) { state = next; save(state); render(); }

function toast(msg) {
  const t = $('toast');
  t.textContent = msg; t.classList.add('show');
  clearTimeout(toast.timer); toast.timer = setTimeout(() => t.classList.remove('show'), 1800);
}

// The iOS Shortcut opens  .../#health=2026-10-01:412;2026-10-02:388
function importFromHash() {
  const m = location.hash.match(/^#health=(.*)$/s);
  if (!m) return;
  const days = parseHealthPayload(decodeURIComponent(m[1]));
  history.replaceState(null, '', location.pathname + location.search);
  const n = Object.keys(days).length;
  if (!n) { toast(t('syncEmpty')); return; }
  state = mergeHealth(state, days, new Date().toISOString());
  if (isNew) state = { ...state, startDate: Object.keys(days).sort()[0] };   // first run: goal starts at the earliest synced day
  save(state);
  toast(t('synced', n));
}

function addEntry(activity, kcal) {
  const entry = { id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, date: localToday(), activity, kcal };
  commit({ ...state, entries: [...state.entries, entry] });
  toast(t('added', fmt(kcal)));
}

function renderHistory(D, today) {
  const days = [];
  for (const d of Object.keys(D.byDay).sort().reverse()) {
    if (d > today) continue;
    const manual = state.entries.filter(e => e.date === d);
    const health = state.health[d];
    days.push(`<li><div class="day"><b>${fmtDate(d)}</b><span class="num">${t('kcal', fmt(D.byDay[d]))}</span></div>
      ${health != null ? `<div class="row muted"><span>${t('healthRow')}</span><span class="num">${fmt(health)}</span></div>` : ''}
      ${manual.map(e => `<div class="row"><span>${esc(activityName(e.activity))} <span class="muted">· ${t('byHand')}</span></span>
        <span class="num">${fmt(e.kcal)} <button class="link" data-del="${e.id}" aria-label="${esc(t('deleteEntry', activityName(e.activity)))}">✕</button></span></div>`).join('')}</li>`);
  }
  $('history').innerHTML = days.join('') || `<li class="muted">${t('nothingLogged')}</li>`;
}

function render() {
  const today = localToday(), D = derive(state, today);
  $('range').textContent = `${fmtDate(state.startDate)} → ${fmtDate(state.goalDate)}`;
  melt(D.left);
  $('left-sub').textContent = t('leftSub', (D.left / KCAL_PER_KG_FAT).toFixed(2));
  const ahead = D.delta >= 0;
  $('status').className = `status ${ahead ? 'good' : 'warn'}`;
  $('status').innerHTML = `<span aria-hidden="true">${ahead ? '▲' : '▼'}</span> <span>${t(ahead ? 'ahead' : 'behind', fmt(Math.abs(D.delta)))}</span>`;
  $('days-left').textContent = D.daysLeft;
  $('per-day').textContent = fmt(D.neededPerDay);
  $('today-kcal').textContent = fmt(D.todayBurned);
  $('sync-info').innerHTML = state.healthSyncedAt
    ? `${t('lastSynced', new Date(state.healthSyncedAt).toLocaleString(lang().locale, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }))} · <a href="sync-setup.html">${t('syncSetup')}</a>`
    : `${t('notSynced')} · <a href="sync-setup.html">${t('setUpSync')}</a>`;
  renderChart($('chart'), state, D, today);
  renderHistory(D, today);
}

function openSettings() {
  const f = $('settings-form');
  f.startDate.value = state.startDate; f.goalDate.value = state.goalDate; f.goalKcal.value = state.goalKcal;
  $('settings').returnValue = '';
  $('settings').showModal();
}

$('settings').addEventListener('close', () => {
  if ($('settings').returnValue !== 'save') return;
  const f = $('settings-form');
  if (f.goalDate.value <= f.startDate.value) { toast(t('goalAfterStart')); return; }
  commit({ ...state, startDate: f.startDate.value, goalDate: f.goalDate.value, goalKcal: Number(f.goalKcal.value) });
});
$('open-settings').onclick = openSettings;

// Text that only changes with the language: static HTML, quick-add chips, the flag picker
function renderLanguage() {
  translatePage();
  $('chips').innerHTML = QUICK.map((q, i) => `<button type="button" data-quick="${i}">${q.emoji} ${t(`chip.${q.activity}`)} ${t('minutes', q.min)} · ${q.kcal}</button>`).join('');
  $('lang-flag').textContent = lang().flag;
  $('lang').value = lang().code;
}

$('lang').innerHTML = LANGS.map(l => `<option value="${l.code}">${l.flag} ${l.name}</option>`).join('');
$('lang').onchange = ev => { setLang(ev.target.value); renderLanguage(); render(); };
$('chips').onclick = ev => { const b = ev.target.closest('[data-quick]'); if (b) { const q = QUICK[b.dataset.quick]; addEntry(q.activity, q.kcal); } };
$('custom-form').onsubmit = ev => {
  ev.preventDefault();
  const kcal = Number(ev.target.kcal.value);
  if (!(kcal > 0)) return;
  // A goal-sized number typed here would melt the block in one go
  if (kcal > SANE_MANUAL_KCAL && !confirm(t('confirmBig', fmt(kcal)))) return;
  addEntry('Other', kcal); ev.target.reset();
};
$('history').onclick = ev => {
  const b = ev.target.closest('[data-del]');
  if (b) commit({ ...state, entries: state.entries.filter(e => e.id !== b.dataset.del) });
};

let resizeTimer;
addEventListener('resize', () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(render, 120); });
addEventListener('hashchange', () => { importFromHash(); render(); });
document.addEventListener('visibilitychange', () => { if (!document.hidden) render(); });   // day may have rolled over

renderLanguage();
importFromHash();
render();
if (isNew) openSettings();
