// The melting fat block: an SVG whose block height is the share of the goal still left to burn.

const fmt = n => Math.round(n).toLocaleString('en-US');

export function fatSVG(left, goalKcal) {
  const frac = goalKcal > 0 ? Math.max(0, Math.min(1, left / goalKcal)) : 0;
  const G = 330, W = 210, x0 = 180 - W / 2, x1 = 180 + W / 2, maxH = 240;
  const h = maxH * frac, top = G - h, r = Math.min(26, h / 2);
  const melt = 1 - frac;
  const puddleRx = 70 + 120 * melt, puddleRy = 8 + 10 * melt;
  const flare = 6 + 22 * melt;   // the base spreads out as it melts
  const shoulder = Math.max(top + r, G - 18);
  const body = h > 1 ? `M${x0 - flare},${G} C${x0},${G - 4} ${x0},${G - 18} ${x0},${shoulder}
    L${x0},${top + r} Q${x0},${top} ${x0 + r},${top} L${x1 - r},${top} Q${x1},${top} ${x1},${top + r}
    L${x1},${shoulder} C${x1},${G - 18} ${x1},${G - 4} ${x1 + flare},${G} Z` : '';

  const face = h > 70 ? (() => {
    const fy = top + Math.min(70, h * 0.35);
    const mouth = melt > 0.5
      ? `M164,${fy + 26} q16,-12 32,0`   // worried
      : `M164,${fy + 18} q16,12 32,0`;   // smug
    return `<circle cx="150" cy="${fy}" r="6" fill="#3a2f12"/><circle cx="210" cy="${fy}" r="6" fill="#3a2f12"/>
      <path d="${mouth}" stroke="#3a2f12" stroke-width="3" fill="none" stroke-linecap="round"/>
      <path class="drop" style="--fall:${h * 0.5}px" d="M${x1 - 18},${fy - 14} q5,9 0,13 q-5,-4 0,-13Z" fill="#7cc0f0"/>`;
  })() : '';
  const drips = h > 40 ? [0.22, 0.55, 0.8].map((p, i) => {
    const dx = x0 + W * p, len = 18 + 26 * melt + i * 6;
    return `<path class="drip" style="animation-delay:${i * 0.7}s" d="M${dx - 7},${top + 2} L${dx + 7},${top + 2} L${dx + 5},${top + len} a5,5 0 0 1 -10,0 Z" fill="var(--fat-shade)"/>`;
  }).join('') : '';
  const falling = h > 10 ? [x0 - flare + 4, x1 + flare - 4].map((dx, i) =>
    `<circle class="drop" style="--fall:24px; animation-delay:${i * 1.1}s" cx="${dx + (i ? 6 : -6)}" cy="${G - 26}" r="4" fill="var(--fat-shade)"/>`).join('') : '';

  return `
  <svg viewBox="0 0 360 350" role="img" aria-label="${fmt(left)} kcal of fat left">
    <defs><clipPath id="fatclip"><path d="${body}"/></clipPath></defs>
    <rect x="${x0}" y="${G - maxH}" width="${W}" height="${maxH}" rx="26" fill="none" stroke="var(--fat-edge)" stroke-width="1.5" stroke-dasharray="4 6" opacity=".6"/>
    <text x="${x1 + 8}" y="${G - maxH + 12}" class="fat-goal">${fmt(goalKcal)}</text>
    <ellipse cx="180" cy="${G + 2}" rx="${puddleRx}" ry="${puddleRy}" fill="var(--fat)" opacity=".85"/>
    <ellipse cx="180" cy="${G}" rx="${puddleRx * 0.6}" ry="${puddleRy * 0.45}" fill="var(--fat-marble)" opacity=".7"/>
    ${body ? `<path d="${body}" fill="var(--fat)" stroke="var(--fat-edge)" stroke-width="2"/>
    <g clip-path="url(#fatclip)" fill="none" stroke="var(--fat-marble)" stroke-width="7" stroke-linecap="round" opacity=".9">
      <path d="M${x0 - 10},${G - 60} q50,-30 100,-6 t130,-20"/>
      <path d="M${x0 - 10},${G - 150} q60,20 110,-10 t120,8"/>
      <rect x="${x1 - 26}" y="${top}" width="26" height="${h}" fill="var(--fat-shade)" stroke="none" opacity=".55"/>
    </g>${drips}${falling}${face}` : `<text x="180" y="${G - 40}" text-anchor="middle" class="fat-done">All melted! 🎉</text>`}
  </svg>`;
}

// Animates the block and the headline number from their current value to `to`.
export function createMelter(fatEl, numEl, getGoal) {
  let shown = null, frame = 0;
  const draw = v => { fatEl.innerHTML = fatSVG(v, getGoal()); numEl.textContent = fmt(v); };
  return to => {
    cancelAnimationFrame(frame);
    if (shown === null || matchMedia('(prefers-reduced-motion: reduce)').matches) { shown = to; draw(to); return; }
    const from = shown, t0 = performance.now(), dur = 1100;
    const tick = now => {
      const k = Math.min(1, (now - t0) / dur);
      shown = from + (to - from) * (1 - (1 - k) ** 3);
      draw(shown);
      if (k < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
  };
}
