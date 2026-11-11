/* RUSSRUSS motion engine: shared choreography for every art direction.
   Each page sets window.RR = { flavors, juice, wipe, iris, ... } before loading this file. */
(() => {
  const root = document.documentElement;
  const cfg = Object.assign({
    flavors: [], juice: ['#FF6A13', '#FFC300', '#FFFFFF'], dropOutline: null,
    wipe: 'rise', irisAt: '28% 50%', cupDrop: true, bounce: 'elastic.out(1, .35)', onActive: null
  }, window.RR || {});
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(pointer: fine)').matches;
  const narrow = () => matchMedia('(max-width: 760px)').matches;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  /* wave paths: data-wave="width,height,base,amplitude,period" */
  $$('[data-wave]').forEach(p => {
    const [w, h, base, amp, period] = p.dataset.wave.split(',').map(Number);
    let d = `M0 ${base}`;
    for (let x = 0; x <= w; x += 10) d += ` L${x} ${(base + amp * Math.sin(x / period * Math.PI * 2)).toFixed(1)}`;
    p.setAttribute('d', d + ` V${h} H0 Z`);
  });
  const anim = !!(window.gsap && window.ScrollTrigger) && !reduce;
  if (!anim) { root.classList.remove('anim'); return; }
  gsap.registerPlugin(ScrollTrigger);

  /* ---------- particles ---------- */
  const fx = $('#fx'), ctx = fx && fx.getContext('2d');
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  let parts = [], running = false;
  function sizeFx() { if (!fx) return; fx.width = innerWidth * dpr; fx.height = innerHeight * dpr; fx.style.width = innerWidth + 'px'; fx.style.height = innerHeight + 'px'; }
  sizeFx(); addEventListener('resize', sizeFx);
  function burst(x, y, colors, n, power) {
    if (!ctx) return;
    n = fine ? n : Math.round(n / 2);
    for (let i = 0; i < n; i++) {
      const a = -Math.PI / 2 + (Math.random() - .5) * Math.PI * 1.25, s = (5 + Math.random() * 10) * (power || 1);
      parts.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, r: 3 + Math.random() * 9, c: colors[i % colors.length], life: 1 });
    }
    if (!running) { running = true; requestAnimationFrame(tick); }
  }
  window.RRburst = burst;
  function tick() {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, innerWidth, innerHeight);
    parts = parts.filter(p => p.life > 0 && p.y < innerHeight + 60);
    for (const p of parts) {
      p.vy += .35; p.vx *= .99; p.x += p.vx; p.y += p.vy; p.life -= .011;
      const sp = Math.hypot(p.vx, p.vy), r = p.r * Math.min(1, p.life * 2.2), ang = Math.atan2(p.vy, p.vx); if (r <= 0) continue;
      ctx.beginPath(); ctx.ellipse(p.x, p.y, r * (1 + sp * .04), r, ang, 0, Math.PI * 2);
      ctx.fillStyle = p.c; ctx.fill();
      if (cfg.dropOutline) { ctx.lineWidth = 1.5; ctx.strokeStyle = cfg.dropOutline; ctx.stroke(); }
      ctx.beginPath(); ctx.ellipse(p.x - r * .3, p.y - r * .3, r * .28, r * .18, ang, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,255,255,.75)'; ctx.fill();
    }
    if (parts.length) requestAnimationFrame(tick); else { running = false; ctx.clearRect(0, 0, innerWidth, innerHeight); }
  }
  $$('[data-add]').forEach((b, i) => b.addEventListener('click', () => {
    const r = b.getBoundingClientRect(), f = cfg.flavors[+b.dataset.add] || {};
    burst(r.left + r.width / 2, r.top + 4, f.juice || cfg.juice, 28, .9);
    const t = b.textContent; b.textContent = 'Added'; setTimeout(() => { b.textContent = t; }, 1200);
  }));

  /* ---------- smooth scroll ---------- */
  let lenis = null;
  if (window.Lenis) {
    lenis = new Lenis({ lerp: .1 });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(t => lenis.raf(t * 1000)); gsap.ticker.lagSmoothing(0);
  }
  const lock = on => { if (lenis) { on ? lenis.stop() : lenis.start(); } root.style.overflow = on ? 'hidden' : ''; };
  const scrollToY = (y, immediate) => lenis ? lenis.scrollTo(y, { immediate: !!immediate, duration: 1.8, force: true }) : scrollTo({ top: y, behavior: immediate ? 'auto' : 'smooth' });
  document.addEventListener('click', e => {
    const a = e.target.closest('a[href^="#"]'); if (!a) return;
    const t = document.querySelector(a.getAttribute('href')); if (!t) return;
    e.preventDefault(); lenis ? lenis.scrollTo(t, { duration: 1.8 }) : t.scrollIntoView({ behavior: 'smooth' });
  });

  /* ---------- split text ---------- */
  function split(el) {
    if (!el) return [];
    const text = el.textContent.trim(); el.textContent = '';
    const chars = [];
    text.split(' ').forEach((word, i, arr) => {
      const w = document.createElement('span'); w.className = 'w'; w.setAttribute('aria-hidden', 'true');
      [...word].forEach(c => { const s = document.createElement('span'); s.className = 'ch'; s.textContent = c; w.appendChild(s); chars.push(s); });
      el.appendChild(w); if (i < arr.length - 1) el.appendChild(document.createTextNode(' '));
    });
    chars.forEach((c, i) => c.style.setProperty('--i', i));
    const sr = document.createElement('span'); sr.textContent = text; sr.className = 'sr'; el.appendChild(sr);
    return chars;
  }

  /* ---------- cursor + magnets ---------- */
  if (fine && $('#cursor')) {
    root.classList.add('has-cursor');
    const cur = $('#cursor'), lab = $('#cursor span');
    const cx = gsap.quickTo(cur, 'x', { duration: .35, ease: 'power3' }), cy = gsap.quickTo(cur, 'y', { duration: .35, ease: 'power3' });
    addEventListener('pointermove', e => { cur.classList.add('live'); cx(e.clientX); cy(e.clientY); }, { passive: true });
    document.addEventListener('pointerover', e => {
      const t = e.target.closest('[data-cursor]');
      if (t) { lab.textContent = t.dataset.cursor; cur.classList.add('big'); } else cur.classList.remove('big');
    });
    $$('[data-magnet]').forEach(m => {
      const xTo = gsap.quickTo(m, 'x', { duration: .5, ease: 'power3' }), yTo = gsap.quickTo(m, 'y', { duration: .5, ease: 'power3' });
      m.addEventListener('pointermove', e => { const r = m.getBoundingClientRect(); xTo((e.clientX - r.left - r.width / 2) * .35); yTo((e.clientY - r.top - r.height / 2) * .35); });
      m.addEventListener('pointerleave', () => { xTo(0); yTo(0); });
    });
  }

  /* ---------- marquees ---------- */
  const mqTweens = $$('.mq .mq-track').map((t, i) => i % 2
    ? gsap.fromTo(t, { xPercent: -50 }, { xPercent: 0, duration: 48, ease: 'none', repeat: -1 })
    : gsap.fromTo(t, { xPercent: 0 }, { xPercent: -50, duration: 38, ease: 'none', repeat: -1 }));
  const mqSkew = $$('.mq').length ? gsap.quickTo('.mq', 'skewX', { duration: .4, ease: 'power3' }) : () => {};

  /* ---------- scene 00–01: loader + hero intro ---------- */
  const loader = $('#loader'), lc = $('#loaderCount');
  const cupIn = $('#cupIn');
  const gIn = $$('.hero .g > *');
  const heroChars = $$('.hero [data-split]').flatMap(split);
  let introDone = false, depth = null;
  $$('[data-loop-x]').forEach(el => gsap.to(el, { x: -500, duration: 1.2, ease: 'none', repeat: -1 }));

  function introTl() {
    const tl = gsap.timeline();
    if ($$('.mq').length) tl.fromTo('.mq', { clipPath: 'inset(0% 100% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.1, ease: 'expo.inOut', stagger: .12 }, 0);
    if ($('.hero-bg')) tl.fromTo('.hero-bg', { scale: 1.25, opacity: 0 }, { scale: 1, opacity: 1, duration: 1.4, ease: 'expo.out' }, 0);
    tl.from('.nav', { yPercent: -120, duration: .8, ease: 'expo.out' }, .1)
      .from(heroChars, { yPercent: 115, rotate: 10, duration: 1, ease: 'expo.out', stagger: .03 }, .15);
    if (cupIn) {
      tl.fromTo(cupIn, { y: () => -innerHeight * 1.2, rotate: -34 }, { y: 0, rotate: 0, duration: .62, ease: 'power3.in' }, .1)
        .add(() => { const r = cupIn.getBoundingClientRect(); burst(r.left + r.width / 2, r.top + r.height * .2, cfg.juice, 40, 1.2); }, .72)
        .to(cupIn, { scaleY: .9, scaleX: 1.06, transformOrigin: '50% 100%', duration: .1, ease: 'power2.out' }, .72)
        .to(cupIn, { scaleY: 1, scaleX: 1, duration: .9, ease: cfg.bounce }, .82);
    }
    if (gIn.length) tl.from(gIn, {
      x: (i, el) => (el.getBoundingClientRect().left < innerWidth / 2 ? -1 : 1) * innerWidth * .5,
      y: i => (i % 2 ? 1 : -1) * innerHeight * .4, rotate: i => (i % 2 ? 1 : -1) * 200, scale: .3,
      duration: 1.3, ease: 'expo.out', stagger: .05
    }, .35);
    if ($('#splash')) tl.fromTo('#splash', { scale: 0, rotate: -50, opacity: 0 }, { scale: 1, rotate: 0, opacity: 1, duration: 1, ease: 'expo.out' }, .72);
    tl.from('.hero-ui > *', { y: 40, opacity: 0, duration: .7, ease: 'expo.out', stagger: .06 }, .9);
    return tl;
  }
  function playIntro() {
    introDone = false; depth = null; lock(true);
    if (cupIn) gsap.killTweensOf([cupIn, ...gIn]);
    gsap.set(gIn, { x: 0, y: 0 });
    const m = gsap.timeline({ onComplete: () => { introDone = true; lock(false); ScrollTrigger.refresh(); } });
    if (loader) {
      const c = { v: 0 };
      gsap.set(loader, { display: 'grid', clipPath: 'inset(0% 0% 0% 0%)', opacity: 1 });
      m.fromTo('#loaderFill', { y: 250 }, { y: -40, duration: 1.5, ease: 'power2.inOut' }, 0)
        .fromTo('#loaderSpin', { rotate: -180, scale: .4 }, { rotate: 180, scale: 1, duration: 1.6, ease: 'power3.out' }, 0)
        .fromTo(c, { v: 0 }, { v: 100, duration: 1.5, ease: 'power2.inOut', onUpdate: () => { if (lc) lc.textContent = String(Math.round(c.v)).padStart(3, '0'); } }, 0)
        .to(loader, { clipPath: cfg.loaderOut || 'inset(0% 0% 100% 0%)', duration: .9, ease: 'expo.inOut' }, '+=.15')
        .set(loader, { display: 'none' });
      m.add(introTl(), '-=.75');
    } else m.add(introTl());
  }
  playIntro();
  const replay = $('#replayBtn');
  if (replay) replay.addEventListener('click', () => { scrollToY(0, true); requestAnimationFrame(playIntro); });

  const cupRot = cupIn ? gsap.quickTo(cupIn, 'rotation', { duration: .8, ease: 'power3' }) : () => {};
  addEventListener('pointermove', e => {
    if (!introDone || !fine) return;
    if (!depth) depth = $$('.hero [data-depth]').map(el => {
      const inner = el.firstElementChild;
      return { d: +el.dataset.depth, xTo: gsap.quickTo(inner, 'x', { duration: .9, ease: 'power3' }), yTo: gsap.quickTo(inner, 'y', { duration: .9, ease: 'power3' }) };
    });
    const nx = e.clientX / innerWidth - .5, ny = e.clientY / innerHeight - .5;
    depth.forEach(o => { o.xTo(clamp(-nx * 34 * o.d, -40, 40)); o.yTo(clamp(-ny * 34 * o.d, -40, 40)); });
    cupRot(nx * 7);
  }, { passive: true });

  /* ---------- scene 02–03: press + wipe ---------- */
  const hero = $('.hero');
  const side = el => { const r = el.getBoundingClientRect(); return r.left + r.width / 2 < innerWidth / 2 ? -1 : 1; };
  const vside = el => (el.offsetTop + el.offsetHeight / 2 < hero.offsetHeight / 2 ? -1 : 1);
  const ht = gsap.timeline({ scrollTrigger: { id: 'hero', trigger: hero, start: 'top top', end: '+=160%', pin: true, scrub: 1, invalidateOnRefresh: true } });
  ht.fromTo('.hl-1', { xPercent: 0 }, { xPercent: -130, ease: 'power2.in', duration: .6 }, 0)
    .fromTo('.hl-2', { xPercent: 0 }, { xPercent: 130, ease: 'power2.in', duration: .6 }, 0)
    .fromTo('#cup', { scale: 1, rotate: 0, yPercent: 0 }, { scale: 2.6, rotate: 10, yPercent: 16, ease: 'power2.in', duration: .7 }, 0)
    .fromTo('.hero .g-front', { x: 0, y: 0, scale: 1, rotate: 0 }, { x: (i, el) => side(el) * innerWidth * .6, y: (i, el) => vside(el) * innerHeight * .5, scale: 3, rotate: i => (i % 2 ? -1 : 1) * 150, ease: 'power2.in', duration: .6 }, 0)
    .fromTo('.hero .g-back', { y: 0, scale: 1 }, { y: () => -innerHeight * .25, scale: .75, ease: 'none', duration: .7 }, 0)
    .fromTo('.hero-ui', { opacity: 1, y: 0 }, { opacity: 0, y: 40, duration: .2 }, 0);
  if ($('.hero-bg')) ht.fromTo('.hero-bg', { scale: 1 }, { scale: 1.2, ease: 'none', duration: 1 }, 0);
  if ($('.splash-pos')) ht.fromTo('.splash-pos', { scale: 1, opacity: 1 }, { scale: 2.4, opacity: 0, ease: 'power2.in', duration: .5 }, 0);
  if ($('.mq1')) ht.fromTo('.mq1', { y: 0 }, { y: () => -innerHeight * .25, ease: 'none', duration: .7 }, 0);
  if ($('.mq2')) ht.fromTo('.mq2', { y: 0 }, { y: () => innerHeight * .25, ease: 'none', duration: .7 }, 0);
  const wipe = $('#wipe');
  if (wipe) {
    if (cfg.wipe === 'iris') ht.fromTo(wipe, { clipPath: 'circle(0% at 50% 55%)' }, { clipPath: 'circle(150% at 50% 55%)', ease: 'power2.inOut', duration: .5 }, .5);
    else if (cfg.wipe === 'pass') {
      ht.fromTo('#wipe > *', { xPercent: i => (i % 2 ? 170 : -170), rotate: i => (i % 2 ? 35 : -35) }, { xPercent: i => (i % 2 ? -170 : 170), rotate: i => (i % 2 ? -35 : 35), ease: 'none', duration: .55, stagger: .025 }, .42)
        .to(['#cup', '.hero .g-back', '.hero-bg', '.mq'], { opacity: 0, duration: .15 }, .68);
    }
    else if (cfg.wipe === 'curtain') ht.fromTo('#wipe > *', { xPercent: i => (i % 2 ? 140 : -140), rotate: i => (i % 2 ? 25 : -25) }, { xPercent: 0, rotate: 0, ease: 'power2.out', duration: .5, stagger: .03 }, .45).fromTo(wipe, { opacity: 0 }, { opacity: 1, duration: .05 }, .45);
    else ht.fromTo(wipe, { y: () => innerHeight * 1.25 }, { y: 0, ease: 'power2.inOut', duration: .5 }, .5);
    if ($('#wipeSpin')) ht.fromTo('#wipeSpin', { rotate: 0 }, { rotate: 120, ease: 'none', duration: .5 }, .5);
  }

  /* ---------- scene 04: reel ---------- */
  const reel = $('.reel'), track = $('#track'), slots = $$('.slot'), mani = $('.mani-wrap');
  const word = $('#reelWord'), count = $('#reelCount'), bar = $('#reelBar');
  const F = cfg.flavors;
  const dist = () => Math.max(0, track.scrollWidth - innerWidth);
  let active = 0;
  const tintOf = f => f.tint || f.bg;
  if (F.length) {
    gsap.set([reel, mani], { '--tint': tintOf(F[0]) });
    gsap.set(reel, { backgroundColor: F[0].bg });
    gsap.set(mani, { backgroundColor: tintOf(F[0]) });
  }
  function setActive(i) {
    if (i === active || !F[i]) return; active = i;
    const t = { duration: .7, ease: 'power2.out', overwrite: 'auto' };
    gsap.to([reel, mani], { ...t, '--tint': tintOf(F[i]) });
    gsap.to(reel, { ...t, backgroundColor: F[i].bg });
    gsap.to(mani, { ...t, backgroundColor: tintOf(F[i]) });
    if (word) {
      gsap.killTweensOf(word);
      gsap.timeline().to(word, { yPercent: -110, duration: .2, ease: 'power2.in' }).add(() => { word.textContent = F[i].word; }).fromTo(word, { yPercent: 110 }, { yPercent: 0, duration: .6, ease: 'expo.out' });
    }
    if (count) count.textContent = String(i + 1).padStart(2, '0') + ' / ' + String(F.length).padStart(2, '0');
    if (cfg.onActive) cfg.onActive(i, F[i]);
  }
  const skewTo = gsap.quickTo(slots, 'skewX', { duration: .5, ease: 'power3' }), tiltTo = gsap.quickTo(slots, 'rotation', { duration: .5, ease: 'power3' });
  const reelTween = gsap.to(track, {
    x: () => -dist(), ease: 'none',
    scrollTrigger: {
      id: 'reel', trigger: reel, start: 'top top', end: () => '+=' + Math.max(innerHeight, dist() * 1.1), pin: true, scrub: 1, invalidateOnRefresh: true,
      onUpdate: self => {
        setActive(Math.min(F.length - 1, Math.floor(self.progress * F.length)));
        if (bar) gsap.set(bar, { scaleX: self.progress });
        const v = self.getVelocity(); skewTo(clamp(v / -260, -12, 12)); tiltTo(clamp(v / -500, -6, 6));
      }
    }
  });
  slots.forEach(s => {
    const st = { trigger: s, containerAnimation: reelTween, start: 'left right', end: 'right left', scrub: true };
    const prod = s.querySelector('.prod'), garn = s.querySelector('.garn');
    if (prod) gsap.fromTo(prod, { rotate: -24, scale: .88 }, { rotate: 12, scale: 1.04, ease: 'none', scrollTrigger: st });
    if (garn) gsap.fromTo(garn, { rotate: -120, x: -40, y: 30 }, { rotate: 200, x: 30, y: -20, ease: 'none', scrollTrigger: { ...st } });
  });
  $$('.card').forEach(c => {
    gsap.set(c, { transformPerspective: 900 });
    const rx = gsap.quickTo(c, 'rotationX', { duration: .5, ease: 'power3' }), ry = gsap.quickTo(c, 'rotationY', { duration: .5, ease: 'power3' });
    c.addEventListener('pointermove', e => { if (e.pointerType !== 'mouse') return; const r = c.getBoundingClientRect(); ry(((e.clientX - r.left) / r.width - .5) * 16); rx(-((e.clientY - r.top) / r.height - .5) * 16); });
    c.addEventListener('pointerleave', () => { rx(0); ry(0); });
  });
  let td = null;
  track.addEventListener('pointerdown', e => { if (e.pointerType !== 'mouse' || e.button !== 0 || e.target.closest('button')) return; td = { x: e.clientX, y0: lenis ? lenis.scroll : scrollY }; });
  addEventListener('pointermove', e => { if (td) scrollToY(td.y0 - (e.clientX - td.x) * 1.1, true); });
  addEventListener('pointerup', () => { td = null; });

  ScrollTrigger.create({ start: 0, end: 'max', onUpdate: self => {
    const v = self.getVelocity(), ts = 1 + Math.min(5, Math.abs(v) / 400);
    mqTweens.forEach(t => gsap.to(t, { timeScale: ts, duration: .2, overwrite: true }));
    mqSkew(clamp(v / -300, -10, 10));
  } });
  ScrollTrigger.addEventListener('scrollEnd', () => { mqTweens.forEach(t => gsap.to(t, { timeScale: 1, duration: .8, overwrite: true })); mqSkew(0); skewTo(0); tiltTo(0); });

  /* ---------- scene 05–06: reveal + telemetry ---------- */
  const mcs = $$('.mc'), figs = $$('.fig'), steps = $$('.steps li'), cap = $('#figCap');
  const caps = figs.map(f => f.dataset.cap || '');
  const mcChars = mcs.map(m => split(m.querySelector('.mc-text')));
  const irisAt = () => (narrow() ? '50% 20%' : cfg.irisAt);
  let step = 0;
  const setStep = i => { if (i === step) return; step = i; steps.forEach((s, k) => s.classList.toggle('on', k === i)); if (cap) cap.textContent = caps[i]; };
  const mt = gsap.timeline({ scrollTrigger: { id: 'mani', trigger: mani, start: 'top top', end: '+=380%', pin: true, scrub: 1, invalidateOnRefresh: true, onUpdate: () => setStep(clamp(Math.floor((mt.time() - 1) / 1.5), 0, mcs.length - 1)) } });
  /* optional orange spin-through: the orange rolls in from the corner, fills the screen, and the iris opens through its pith */
  const mo = $('#maniOrange'), irisStart = mo ? .55 : 0;
  if (mo) {
    mt.fromTo(mo, { x: () => innerWidth * .62, y: () => innerHeight * .5, scale: .3, rotation: -220 }, { x: 0, y: 0, scale: () => { const r = mo.offsetWidth / 2 || 1; return Math.hypot(innerWidth, innerHeight) / r * 1.05; }, rotation: 360, ease: 'power2.in', duration: .75 }, 0)
      .to(mo, { opacity: 0, duration: .15 }, 1.05);
  }
  mt.fromTo('.mani', { clipPath: () => `circle(0% at ${irisAt()})` }, { clipPath: () => `circle(150% at ${irisAt()})`, ease: 'power2.inOut', duration: mo ? .6 : 1 }, irisStart)
    .fromTo('.figs', { scale: .2, rotate: -140 }, { scale: 1, rotate: 0, ease: 'power3.out', duration: mo ? .6 : 1 }, irisStart + .1);
  if ($('.fig-0 .spin')) mt.fromTo('.fig-0 .spin', { rotate: 0 }, { rotate: 320, ease: 'none', duration: 1.8 }, .3);
  mcs.forEach((m, i) => {
    const s = 1 + i * 1.5;
    if (i > 0) {
      mt.fromTo(mcs[i - 1], { opacity: 1, y: 0 }, { opacity: 0, y: -50, duration: .35, ease: 'power2.in', immediateRender: false }, s - .05);
      if (figs[i]) mt.fromTo(figs[i - 1], { clipPath: 'inset(0% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 100% 0%)', duration: .4, ease: 'power2.inOut', immediateRender: false }, s - .05)
        .fromTo(figs[i], { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: .5, ease: 'power2.inOut' }, s + .1)
        .fromTo(figs[i].firstElementChild, { rotate: -30, scale: .8, y: 40 }, { rotate: 0, scale: 1, y: 0, duration: .9, ease: 'back.out(1.6)' }, s + .1);
    }
    const n = m.querySelector('.n'), to = +n.dataset.to, dec = +n.dataset.dec || 0, o = { v: 0 };
    mt.fromTo(m, { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: .3, ease: 'power2.out' }, s)
      .fromTo(mcChars[i], { yPercent: 110 }, { yPercent: 0, duration: .6, ease: 'expo.out', stagger: .012 }, s + .05)
      .fromTo(m.querySelector('.mc-text'), { '--w': cfg.wMin || 400 }, { '--w': cfg.wMax || 800, duration: .9, ease: 'power2.out' }, s + .1)
      .fromTo(o, { v: 0 }, { v: to, duration: .8, ease: 'power2.out', onUpdate: () => { n.textContent = (n.dataset.pre || '') + o.v.toFixed(dec) + (n.dataset.suf || ''); } }, s + .1)
      .fromTo(n, { '--fill': '0%' }, { '--fill': '100%', duration: .8, ease: 'power2.inOut' }, s + .2);
  });
  mt.to({}, { duration: .5 });

  /* ---------- scene 07: outro ---------- */
  if ($('#outroFill')) gsap.fromTo('#outroFill', { y: 250 }, { y: -40, ease: 'none', scrollTrigger: { trigger: '.outro', start: 'top 80%', end: 'top 5%', scrub: 1 } });
  const oc = split($('.outro [data-split]'));
  if (oc.length) gsap.from(oc, { yPercent: 110, duration: .8, ease: 'expo.out', stagger: .015, scrollTrigger: { trigger: '.outro-row', start: 'top 90%' } });
  $$('.outro [data-float]').forEach((el, i) => gsap.to(el, { y: i % 2 ? -18 : 18, rotate: i % 2 ? 8 : -8, duration: 2.4 + i * .3, ease: 'sine.inOut', yoyo: true, repeat: -1 }));
  $$('.outro [data-par]').forEach(el => gsap.fromTo(el, { y: 120 * +el.dataset.par }, { y: -120 * +el.dataset.par, ease: 'none', scrollTrigger: { trigger: '.outro', start: 'top bottom', end: 'bottom top', scrub: true } }));

  /* ---------- extras: ribbon draw, image reveal, drip ---------- */
  $$('[data-reveal-x]').forEach(el => gsap.fromTo(el, { clipPath: 'inset(0% 100% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', ease: 'none', scrollTrigger: { trigger: el.closest('section'), start: 'top 85%', end: 'top top', scrub: 1 } }));
  $$('[data-reveal]').forEach(el => gsap.fromTo(el, { clipPath: 'inset(16% 22% 16% 22% round 120px)' }, { clipPath: 'inset(0% 0% 0% 0% round 28px)', ease: 'none', scrollTrigger: { trigger: el, start: 'top 95%', end: 'top 35%', scrub: 1 } }));
  $$('[data-drip]').forEach(el => gsap.fromTo(el, { scaleY: .15 }, { scaleY: 1, ease: 'none', transformOrigin: '50% 0%', scrollTrigger: { trigger: el.closest('section'), start: 'top 90%', end: 'top 10%', scrub: 1 } }));

  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => ScrollTrigger.refresh());
  addEventListener('load', () => ScrollTrigger.refresh());
})();
