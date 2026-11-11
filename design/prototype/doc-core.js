/* RUSSRUSS design doc: shared helpers, particle canvas, and the demo / lab registries. */
window.RRD = (() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const A = n => `assets/${n}.webp`;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(pointer: fine)').matches;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  /* particles on one fixed canvas */
  const fx = $('#fx'), ctx = fx.getContext('2d');
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  let parts = [], running = false;
  const size = () => { fx.width = innerWidth * dpr; fx.height = innerHeight * dpr; fx.style.width = innerWidth + 'px'; fx.style.height = innerHeight + 'px'; };
  size(); addEventListener('resize', size);
  function burst(x, y, colors, n = 30, power = 1, opts = {}) {
    if (reduce) return;
    n = fine ? n : Math.round(n / 2);
    for (let i = 0; i < n; i++) {
      const spread = opts.round ? Math.PI * 2 : Math.PI * 1.25;
      const a = (opts.round ? 0 : -Math.PI / 2) + (Math.random() - .5) * spread;
      const s = (4 + Math.random() * 9) * power;
      parts.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, r: 2.5 + Math.random() * 7, c: colors[i % colors.length], life: 1, g: opts.gravity ?? .35 });
    }
    if (!running) { running = true; requestAnimationFrame(tick); }
  }
  function tick() {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, innerWidth, innerHeight);
    parts = parts.filter(p => p.life > 0 && p.y < innerHeight + 60);
    for (const p of parts) {
      p.vy += p.g; p.vx *= .99; p.x += p.vx; p.y += p.vy; p.life -= .013;
      const sp = Math.hypot(p.vx, p.vy), r = p.r * Math.min(1, p.life * 2.2), ang = Math.atan2(p.vy, p.vx); if (r <= 0) continue;
      ctx.beginPath(); ctx.ellipse(p.x, p.y, r * (1 + sp * .04), r, ang, 0, Math.PI * 2); ctx.fillStyle = p.c; ctx.fill();
      ctx.beginPath(); ctx.ellipse(p.x - r * .3, p.y - r * .3, r * .28, r * .18, ang, 0, Math.PI * 2); ctx.fillStyle = 'rgba(255,255,255,.75)'; ctx.fill();
    }
    if (parts.length) requestAnimationFrame(tick); else { running = false; ctx.clearRect(0, 0, innerWidth, innerHeight); }
  }
  /* burst at a point given in % of an element's box */
  const burstAt = (el, px, py, colors, n, power, opts) => { const r = el.getBoundingClientRect(); burst(r.left + r.width * px, r.top + r.height * py, colors, n, power, opts); };

  function split(el) {
    const text = el.textContent.trim(); el.textContent = ''; el.setAttribute('aria-label', text);
    const chars = [];
    text.split(' ').forEach((word, i, arr) => {
      const w = document.createElement('span'); w.className = 'w'; w.setAttribute('aria-hidden', 'true');
      [...word].forEach(c => { const s = document.createElement('span'); s.className = 'ch'; s.textContent = c; w.appendChild(s); chars.push(s); });
      el.appendChild(w); if (i < arr.length - 1) el.appendChild(document.createTextNode(' '));
    });
    return chars;
  }
  function wave(w, h, base, amp, period) {
    let d = `M0 ${base}`;
    for (let x = 0; x <= w; x += 10) d += ` L${x} ${(base + amp * Math.sin(x / period * Math.PI * 2)).toFixed(1)}`;
    return d + ` V${h} H0 Z`;
  }
  /* put html in a stage, return a query helper */
  const mount = (stage, html) => { stage.innerHTML = html; return s => stage.querySelector(s); };
  const img = (n, style = '', cls = 'abs') => `<img class="${cls}" src="${A(n)}" alt="" style="${style}" draggable="false">`;
  /* make a simple looping tween that survives replays */
  const loops = new WeakMap();
  const loop = (key, make) => { if (!loops.has(key)) loops.set(key, make()); return loops.get(key); };

  return { $, $$, A, reduce, fine, clamp, burst, burstAt, split, wave, mount, img, loop, DEMOS: {}, LABS: {},
    JUICE: { citrus: ['#FF6A13', '#FFC300', '#FFFFFF'], pink: ['#FF2E7E', '#FFB3CF', '#FFFFFF'], green: ['#7ED321', '#E6F9C8', '#FFFFFF'], candy: ['#FF3D6E', '#FF7A00', '#B6F500', '#FFD60A', '#FFFFFF'] } };
})();
