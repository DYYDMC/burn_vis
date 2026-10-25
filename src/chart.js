// Cumulative-burn line chart with red dashed goal date + goal kcal, planned pace and projection.

import { addDays, diffDays } from './model.js';

const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
export const fmtDate = iso => { const d = new Date(iso + 'T00:00:00Z'); return `${d.getUTCDate()} ${MON[d.getUTCMonth()]}`; };
const fmt = n => Math.round(n).toLocaleString('en-US');
const compact = v => v >= 1000 ? (v / 1000).toFixed(v % 1000 ? 1 : 0) + 'K' : String(v);

function niceStep(max, n = 5) {
  const raw = max / n, p = 10 ** Math.floor(Math.log10(raw)), m = raw / p;
  return (m <= 1 ? 1 : m <= 2 ? 2 : m <= 2.5 ? 2.5 : m <= 5 ? 5 : 10) * p;
}

export function renderChart(wrap, state, D, today) {
  const W = wrap.clientWidth, H = Math.max(240, Math.min(380, W * 0.55));
  const P = { l: 40, r: 12, t: 28, b: 28 }, w = W - P.l - P.r, h = H - P.t - P.b;
  const span = D.totalDays + 1;
  const x = d => P.l + diffDays(state.startDate, d) / span * w;
  const yMax = Math.max(state.goalKcal, D.projected) * 1.08, step = niceStep(yMax);
  const y = v => P.t + h - v / yMax * h;

  const lastDay = today < state.goalDate ? addDays(today, D.todayBurned ? 0 : -1) : state.goalDate;
  const pts = []; let cum = 0;
  for (let d = state.startDate; d <= lastDay; d = addDays(d, 1)) { cum += D.byDay[d] || 0; pts.push({ d, cum, day: D.byDay[d] || 0 }); }
  const line = pts.map((p, i) => `${i ? 'L' : 'M'}${x(p.d).toFixed(1)},${y(p.cum).toFixed(1)}`).join('');
  const area = pts.length ? `${line}L${x(pts.at(-1).d)},${y(0)}L${x(pts[0].d)},${y(0)}Z` : '';
  const last = pts.at(-1);

  let grid = '';
  for (let v = 0; v <= yMax; v += step) grid += `<line x1="${P.l}" x2="${W - P.r}" y1="${y(v)}" y2="${y(v)}" class="grid"/><text x="${P.l - 6}" y="${y(v) + 4}" text-anchor="end">${compact(v)}</text>`;
  const tickEvery = Math.max(7, Math.ceil(span / Math.max(2, Math.floor(w / 70)) / 7) * 7);
  let xt = '';
  for (let i = 0; i <= span; i += tickEvery) { const d = addDays(state.startDate, i); xt += `<text x="${x(d)}" y="${H - 8}" text-anchor="middle">${fmtDate(d)}</text>`; }

  const gx = x(state.goalDate), gy = y(state.goalKcal);
  const showToday = today >= state.startDate && today <= state.goalDate;
  wrap.innerHTML = `
  <svg width="${W}" height="${H}" role="img" aria-label="Cumulative kcal burned versus goal">
    ${grid}${xt}
    <line x1="${x(state.startDate)}" y1="${y(D.pace)}" x2="${gx}" y2="${gy}" class="pace"/>
    ${last && today < state.goalDate ? `<line x1="${x(last.d)}" y1="${y(last.cum)}" x2="${gx}" y2="${y(D.projected)}" class="projection"/>` : ''}
    <line x1="${P.l}" x2="${W - P.r}" y1="${gy}" y2="${gy}" class="goal"/>
    <line x1="${gx}" x2="${gx}" y1="${P.t - 8}" y2="${P.t + h}" class="goal"/>
    <text x="${gx - 6}" y="${gy - 8}" text-anchor="end" class="strong">Goal · ${fmt(state.goalKcal)} kcal · ${fmtDate(state.goalDate)}</text>
    ${showToday ? `<line x1="${x(today)}" x2="${x(today)}" y1="${P.t}" y2="${P.t + h}" class="today"/>
      <text x="${x(today)}" y="${P.t - 10}" text-anchor="middle">Today</text>` : ''}
    <path d="${area}" class="area"/>
    <path d="${line}" class="burned"/>
    ${last ? `<circle cx="${x(last.d)}" cy="${y(last.cum)}" r="5" class="dot"/>
      <text x="${x(last.d) + 9}" y="${y(last.cum) + 4}" class="strong">${fmt(last.cum)}</text>` : ''}
    <line class="crosshair" y1="${P.t}" y2="${P.t + h}" visibility="hidden"/>
    <circle class="dot hover-dot" r="5" visibility="hidden"/>
    <rect class="hit" x="${P.l}" y="${P.t}" width="${w}" height="${h}" fill="transparent"/>
  </svg><div class="tip" hidden></div>`;

  const hit = wrap.querySelector('.hit'), xl = wrap.querySelector('.crosshair'), dot = wrap.querySelector('.hover-dot'), tip = wrap.querySelector('.tip');
  const show = ev => {
    const mx = ev.clientX - wrap.getBoundingClientRect().left;
    const i = Math.max(0, Math.min(D.totalDays - 1, Math.round((mx - P.l) / w * span)));
    const d = addDays(state.startDate, i), p = pts.find(p => p.d === d), px = x(d);
    xl.setAttribute('x1', px); xl.setAttribute('x2', px); xl.setAttribute('visibility', 'visible');
    dot.setAttribute('visibility', p ? 'visible' : 'hidden');
    if (p) { dot.setAttribute('cx', px); dot.setAttribute('cy', y(p.cum)); }
    tip.innerHTML = `<b>${fmtDate(d)}</b><br>` +
      (p ? `That day: <b>${fmt(p.day)}</b> kcal<br>Total: <b>${fmt(p.cum)}</b> kcal<br>` : `<span class="muted">Not yet</span><br>`) +
      `<span class="muted">Plan: ${fmt(D.pace * (i + 1))} kcal</span>`;
    tip.hidden = false;
    tip.style.left = Math.max(0, Math.min(px + 12, W - tip.offsetWidth - 4)) + 'px';
    tip.style.top = (P.t + 8) + 'px';
  };
  const hide = () => { xl.setAttribute('visibility', 'hidden'); dot.setAttribute('visibility', 'hidden'); tip.hidden = true; };
  hit.addEventListener('pointermove', show);
  hit.addEventListener('pointerdown', show);
  hit.addEventListener('pointerleave', hide);
}
