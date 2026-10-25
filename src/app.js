// Wires the page: state load/save, Apple Health import from the URL hash, rendering, input.

import { derive, localToday, parseHealthPayload, mergeHealth, KCAL_PER_KG_FAT } from './model.js';
import { load, save } from './store.js';
import { createMelter } from './fat.js';
import { renderChart, fmtDate } from './chart.js';

const QUICK = [
  { label: '🚶 Walk 30 min', activity: 'Walk', kcal: 120 },
  { label: '🏃 Run 30 min', activity: 'Run', kcal: 300 },
  { label: '🚴 Ride 45 min', activity: 'Cycling', kcal: 350 },
  { label: '🏋️ Gym 60 min', activity: 'Gym', kcal: 250 },
  { label: '🏊 Swim 30 min', activity: 'Swim', kcal: 260 },
];

const $ = id => document.getElementById(id);
const fmt = n => Math.round(n).toLocaleString('en-US');
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

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
  if (!n) { toast('Apple Health link had no readable days'); return; }
  state = mergeHealth(state, days, new Date().toISOString());
  if (isNew) state = { ...state, startDate: Object.keys(days).sort()[0] };   // first run: goal starts at the earliest synced day
  save(state);
  toast(`Synced ${n} day${n === 1 ? '' : 's'} from Apple Health`);
}

function addEntry(activity, kcal) {
  const entry = { id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, date: localToday(), activity, kcal };
  commit({ ...state, entries: [...state.entries, entry] });
  toast(`−${fmt(kcal)} kcal 🔥`);
}

function renderHistory(D, today) {
  const days = [];
  for (const d of Object.keys(D.byDay).sort().reverse()) {
    if (d > today) continue;
    const manual = state.entries.filter(e => e.date === d);
    const health = state.health[d];
    days.push(`<li><div class="day"><b>${fmtDate(d)}</b><span class="num">${fmt(D.byDay[d])} kcal</span></div>
      ${health != null ? `<div class="row muted"><span>Apple Health · Active Energy</span><span class="num">${fmt(health)}</span></div>` : ''}
      ${manual.map(e => `<div class="row"><span>${esc(e.activity)}</span>
        <span class="num">${fmt(e.kcal)} <button class="link" data-del="${e.id}" aria-label="Delete ${esc(e.activity)} entry">✕</button></span></div>`).join('')}</li>`);
  }
  $('history').innerHTML = days.join('') || '<li class="muted">Nothing logged yet</li>';
}

function render() {
  const today = localToday(), D = derive(state, today);
  $('range').textContent = `${fmtDate(state.startDate)} → ${fmtDate(state.goalDate)}`;
  melt(D.left);
  $('left-sub').textContent = `kcal of fat left to melt · ≈ ${(D.left / KCAL_PER_KG_FAT).toFixed(2)} kg`;
  const ahead = D.delta >= 0;
  $('status').className = `status ${ahead ? 'good' : 'warn'}`;
  $('status').innerHTML = `<span aria-hidden="true">${ahead ? '▲' : '▼'}</span> <span>${fmt(Math.abs(D.delta))} kcal ${ahead ? 'ahead of' : 'behind'} pace</span>`;
  $('days-left').textContent = D.daysLeft;
  $('per-day').textContent = fmt(D.neededPerDay);
  $('today-kcal').textContent = fmt(D.todayBurned);
  $('sync-info').innerHTML = state.healthSyncedAt
    ? `Apple Health last synced ${new Date(state.healthSyncedAt).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })} · <a href="sync-setup.html">Sync setup</a>`
    : 'Apple Health not synced yet · <a href="sync-setup.html">Set up sync</a>';
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
  if (f.goalDate.value <= f.startDate.value) { toast('Goal date must be after the start date'); return; }
  commit({ ...state, startDate: f.startDate.value, goalDate: f.goalDate.value, goalKcal: Number(f.goalKcal.value) });
});
$('open-settings').onclick = openSettings;

$('chips').innerHTML = QUICK.map((q, i) => `<button type="button" data-quick="${i}">${q.label} · ${q.kcal}</button>`).join('');
$('chips').onclick = ev => { const b = ev.target.closest('[data-quick]'); if (b) { const q = QUICK[b.dataset.quick]; addEntry(q.activity, q.kcal); } };
$('custom-form').onsubmit = ev => {
  ev.preventDefault();
  const kcal = Number(ev.target.kcal.value);
  if (kcal > 0) { addEntry('Other', kcal); ev.target.reset(); }
};
$('history').onclick = ev => {
  const b = ev.target.closest('[data-del]');
  if (b) commit({ ...state, entries: state.entries.filter(e => e.id !== b.dataset.del) });
};

let resizeTimer;
addEventListener('resize', () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(render, 120); });
addEventListener('hashchange', () => { importFromHash(); render(); });
document.addEventListener('visibilitychange', () => { if (!document.hidden) render(); });   // day may have rolled over

importFromHash();
render();
if (isNew) openSettings();
