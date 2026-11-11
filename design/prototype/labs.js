/* Sunburst Stand: motion demos and transition labs. */
(() => {
  const { DEMOS, LABS, mount, img, wave, burstAt, split, loop, JUICE, fine } = RRD;
  const SUN = 'radial-gradient(circle at 40% 35%, #FFE27A, #FFC300 62%)';
  const WAVES = `<path d="${wave(2600, 220, 50, 14, 250)}" fill="#FF2E7E"/><path d="${wave(2600, 220, 110, 14, 250)}" fill="#FF6A13"/><path d="${wave(2600, 220, 170, 14, 250)}" fill="#FFC300"/>`;

  /* ---------- mini scenes ---------- */
  const hero = (cls = '') => `<div class="layer ${cls}" style="background:#fff">
    <div class="abs rays hr" style="width:150%; aspect-ratio:1; left:-25%; top:-58%"></div>
    <div class="abs sunsetdisc hd" style="width:38%; aspect-ratio:1; left:31%; top:16%"></div>
    ${img('splash', 'width:44%; left:28%; top:10%; opacity:.85', 'abs hs')}
    ${img('cup-orange', 'height:80%; left:37%; top:10%', 'abs hc')}
    ${img('melon', 'width:13%; left:9%; top:46%; transform:rotate(-18deg)', 'abs hg')}
    ${img('orange-half', 'width:14%; right:7%; top:10%', 'abs hg')}
    <span class="mini-title h1 stripe-s" style="left:5%; top:6%">Squeezed</span>
    <span class="mini-title h2 pop" style="right:5%; bottom:14%">this morning.</span>
    <svg class="abs hw" viewBox="0 0 2000 220" preserveAspectRatio="none" style="left:0; bottom:0; width:100%; height:15%">${WAVES}</svg>
  </div>`;
  const card = (left, bg, cup) => `<div class="cardmini nc" style="left:${left}%; top:34%; width:20%; height:58%"><div class="abs" style="inset:7% 7% 30% 7%; border-radius:12px; background:${bg}"></div><div class="abs" style="inset:4% 0 30% 0; display:flex; justify-content:center"><img src="assets/${cup}.webp" alt="" style="height:100%"></div><div class="abs" style="left:10%; right:10%; bottom:9%; height:7%; border-radius:99px; background:#FFE0B0"></div></div>`;
  const next = (cls = '') => `<div class="layer ${cls}" style="background:#fff">
    <div class="abs rays" style="width:150%; aspect-ratio:1; left:-25%; top:-62%"></div>
    <span class="mini-title nt stripe-s" style="left:0; right:0; top:9%; text-align:center">Today's press</span>
    ${card(14, '#FFC300', 'cup-orange')}${card(40, '#7ED321', 'cup-green')}${card(66, '#FF2E7E', 'cup-pink')}
  </div>`;
  const mani = (cls = '') => `<div class="layer ${cls}" style="background:#fff">
    <div class="abs" style="width:30%; aspect-ratio:1; left:8%; top:18%; border-radius:50%; background:${SUN}"></div>
    ${img('orange-half', 'width:24%; left:11%; top:25%', 'abs mo-o')}<svg class="abs" viewBox="0 0 200 200" style="width:38%; left:4%; top:11%; overflow:visible"><circle cx="100" cy="100" r="79.5" fill="none" stroke="#FF2E7E" stroke-width="5"/><circle cx="100" cy="100" r="97" fill="none" stroke="#3B1E08" stroke-width="1.2" stroke-dasharray="1.5 5"/><text class="ringtxt"><textPath href="#ringP" textLength="556">STEP 01 • PICK • STEP 01 • PICK • STEP 01 • PICK •</textPath></text></svg>
    <div class="abs" style="left:46%; top:24%; right:6%"><p style="font:400 .7rem/1 Righteous,sans-serif; letter-spacing:.14em; text-transform:uppercase; color:#3B1E08; margin-bottom:6px">Step 01 · Pick</p><span style="font:400 clamp(2.2rem,6.4vw,4.4rem)/.95 Monoton,serif; color:#FF2E7E">5:00</span><p style="font:700 clamp(.9rem,2.1vw,1.3rem)/1.1 Rubik,sans-serif; color:#3B1E08; margin-top:8px">We buy what's ripe that morning.</p></div>
  </div>`;
  const stand = (cls = '') => `<div class="layer ${cls}">${img('stand', 'left:0; top:0; width:100%; height:100%; object-fit:cover', 'abs st')}<span class="abs pill" style="left:4%; bottom:7%">Find the stand</span></div>`;

  /* ---------- transition labs ---------- */
  LABS['a-iris'] = s => {
    const q = mount(s, hero() + next('wipe'));
    const tl = gsap.timeline({ paused: true });
    tl.to(q('.hr'), { rotation: 120, duration: 1, ease: 'none' }, 0)
      .to(q('.h1'), { xPercent: -150, duration: .5, ease: 'power2.in' }, 0)
      .to(q('.h2'), { xPercent: 150, duration: .5, ease: 'power2.in' }, 0)
      .to(q('.hc'), { scale: 1.6, rotate: 10, duration: .6, ease: 'power2.in' }, 0)
      .to(s.querySelectorAll('.layer:first-child .hg'), { scale: 2.4, x: i => (i ? 160 : -160), duration: .5, ease: 'power2.in' }, 0)
      .fromTo(q('.wipe'), { clipPath: 'circle(0% at 50% 40%)' }, { clipPath: 'circle(150% at 50% 40%)', duration: .55, ease: 'power2.inOut' }, .35)
      .from(q('.wipe .nt'), { yPercent: 80, opacity: 0, duration: .3, ease: 'expo.out' }, .62)
      .from(s.querySelectorAll('.wipe .nc'), { y: 50, opacity: 0, stagger: .06, duration: .3, ease: 'back.out(1.7)' }, .7);
    return tl;
  };

  LABS['a-dive'] = s => {
    const q = mount(s, hero() + next('nx') + '<div class="layer fl" style="background:#fff"></div>');
    gsap.set(q('.nx'), { opacity: 0 }); gsap.set(q('.fl'), { opacity: 0 });
    const tl = gsap.timeline({ paused: true });
    tl.to(q('.hd'), { scale: 9, duration: .6, ease: 'power2.in' }, 0)
      .to([q('.hc'), q('.hs')], { scale: 2.2, opacity: 0, duration: .42, ease: 'power2.in' }, 0)
      .to([q('.h1'), q('.h2')], { y: -60, opacity: 0, duration: .3 }, 0)
      .to(s.querySelectorAll('.hg'), { scale: 3, opacity: 0, duration: .35 }, 0)
      .to(q('.hw'), { yPercent: 100, duration: .3 }, 0)
      .to(q('.fl'), { opacity: 1, duration: .16, ease: 'power1.in' }, .44)
      .set(q('.nx'), { opacity: 1 }, .6)
      .to(q('.fl'), { opacity: 0, duration: .28, ease: 'power1.out' }, .62)
      .from(s.querySelectorAll('.nx .nc'), { y: 40, scale: .9, stagger: .05, duration: .3, ease: 'back.out(1.6)' }, .64)
      .from(q('.nx .nt'), { scale: 1.3, duration: .35, ease: 'expo.out' }, .62);
    return tl;
  };

  LABS['a-awning'] = s => {
    const q = mount(s, mani('mm') + stand('sd') + '<div class="layer" style="overflow:visible"><div class="abs awning aw" style="left:0; right:0; top:0; height:112%"></div></div>');
    gsap.set(q('.sd'), { opacity: 0 });
    const tl = gsap.timeline({ paused: true });
    tl.fromTo(q('.aw'), { yPercent: -112 }, { yPercent: 0, duration: .42, ease: 'bounce.out' }, 0)
      .set(q('.mm'), { opacity: 0 }, .46).set(q('.sd'), { opacity: 1 }, .46)
      .to(q('.aw'), { yPercent: -112, duration: .38, ease: 'power3.inOut' }, .56)
      .fromTo(q('.sd .st'), { scale: 1.18 }, { scale: 1, duration: .5, ease: 'expo.out' }, .56)
      .from(q('.sd .pill'), { y: 30, opacity: 0, duration: .2 }, .82);
    return tl;
  };

  LABS['a-orange'] = s => {
    const q = mount(s, next('nx') + img('orange-half', 'width:26%; left:70%; top:62%', 'abs or') + mani('ir'));
    const tl = gsap.timeline({ paused: true });
    tl.fromTo(q('.or'), { x: 0, y: 0, scale: .3, rotate: 0 }, { x: () => -s.offsetWidth * .33, y: () => -s.offsetHeight * .45, scale: 6, rotate: 540, duration: .6, ease: 'power2.in' }, 0)
      .to(s.querySelectorAll('.nx .nc'), { y: -30, opacity: 0, stagger: .04, duration: .3 }, .1)
      .fromTo(q('.ir'), { clipPath: 'circle(0% at 50% 50%)' }, { clipPath: 'circle(150% at 50% 50%)', duration: .4, ease: 'power2.inOut' }, .52)
      .from(q('.ir .mo-o'), { rotate: -200, scale: .4, duration: .4, ease: 'expo.out' }, .6);
    return tl;
  };

  LABS['a-waverise'] = s => {
    const band = (c, cls, inner = '') => `<div class="layer band ${cls}" style="background:${c}; overflow:visible"><svg viewBox="0 0 2000 120" preserveAspectRatio="none" style="position:absolute; left:0; bottom:calc(100% - 2px); width:200%; height:20%"><path class="crest" d="${wave(2600, 120, 40, 24, 250)}" fill="${c}"/></svg>${inner}</div>`;
    const q = mount(s, hero() + band('#FF2E7E', 'b1') + band('#FF6A13', 'b2') + band('#FFC300', 'b3') + band('#FFFFFF', 'b4', next().replace('class="layer ', 'class="layer inner ')));
    const bands = [q('.b1'), q('.b2'), q('.b3'), q('.b4')];
    const tl = gsap.timeline({ paused: true });
    tl.fromTo(bands, { yPercent: 125 }, { yPercent: 0, duration: .5, ease: 'power2.inOut', stagger: .13 }, 0)
      .fromTo(s.querySelectorAll('.crest'), { x: 0 }, { x: -500, duration: 1, ease: 'none' }, 0)
      .to(q('.hc'), { y: -60, scale: 1.2, duration: .5, ease: 'power2.in' }, 0)
      .from(s.querySelectorAll('.b4 .nc'), { y: 50, opacity: 0, stagger: .05, duration: .25, ease: 'back.out(1.6)' }, .78);
    return tl;
  };

  LABS['a-splash'] = s => {
    const q = mount(s, hero() + next('nx') + img('splash', 'width:30%; left:35%; top:20%', 'abs sp'));
    gsap.set(q('.nx'), { opacity: 0 });
    const tl = gsap.timeline({ paused: true });
    tl.fromTo(q('.sp'), { scale: 0, rotate: -40 }, { scale: 1.1, rotate: 0, duration: .2, ease: 'expo.out' }, 0)
      .to(q('.sp'), { scale: 10, rotate: 100, duration: .55, ease: 'power2.in' }, .2)
      .to(q('.sp'), { opacity: 0, duration: .18 }, .62)
      .to(q('.hc'), { scale: 1.3, y: 20, duration: .4, ease: 'power2.in' }, 0)
      .to(q('.nx'), { opacity: 1, duration: .15 }, .5)
      .from(s.querySelectorAll('.nx .nc'), { y: 40, scale: .85, stagger: .05, duration: .3, ease: 'back.out(1.7)' }, .62);
    return tl;
  };

  /* ---------- motion demos (each returns a run function) ---------- */
  DEMOS['a-loader'] = s => {
    const q = mount(s, `<svg class="abs" viewBox="0 0 1000 300" style="left:5%; top:16%; width:90%; overflow:visible">
      <defs><clipPath id="dclA"><text x="500" y="210" text-anchor="middle" style="font:400 170px Shrikhand, serif">RussRuss</text></clipPath></defs>
      <text x="500" y="210" text-anchor="middle" style="font:400 170px Shrikhand, serif" fill="#FFE6BF">RussRuss</text>
      <g clip-path="url(#dclA)"><g class="wv"><g class="wx"><path d="${wave(2600, 640, 14, 14, 250)}" fill="#FF2E7E"/></g></g></g></svg>
      <div class="abs" style="left:7%; right:7%; bottom:14%; display:flex; justify-content:space-between; font:700 .82rem/1 Righteous, sans-serif; letter-spacing:.1em; text-transform:uppercase; color:#3B1E08"><span>Pressing <span class="ct">000</span>%</span><span>Open 7 to 7</span></div>`);
    loop(s, () => gsap.to(q('.wx'), { x: -500, duration: 1.2, ease: 'none', repeat: -1 }));
    return () => { const o = { v: 0 }; gsap.timeline().fromTo(q('.wv'), { y: 320 }, { y: -40, duration: 1.7, ease: 'power2.inOut' }).fromTo(o, { v: 0 }, { v: 100, duration: 1.7, ease: 'power2.inOut', onUpdate: () => { q('.ct').textContent = String(Math.round(o.v)).padStart(3, '0'); } }, 0); };
  };

  DEMOS['a-drop'] = s => {
    const q = mount(s, `<div class="abs rays ry" style="width:170%; aspect-ratio:1; left:-35%; top:-50%"></div><div class="abs sunsetdisc" style="width:54%; aspect-ratio:1; left:23%; top:16%"></div>${img('splash', 'width:66%; left:17%; top:4%', 'abs sp')}${img('cup-orange', 'height:80%; left:33%; top:12%', 'abs cp')}`);
    loop(s, () => gsap.to(q('.ry'), { rotate: 360, duration: 60, ease: 'none', repeat: -1 }));
    return () => gsap.timeline()
      .fromTo(q('.cp'), { y: -s.offsetHeight * 1.2, rotate: -34, scaleX: 1, scaleY: 1 }, { y: 0, rotate: 0, duration: .62, ease: 'power3.in' })
      .add(() => burstAt(s, .5, .32, JUICE.citrus, 30, 1), .62)
      .to(q('.cp'), { scaleY: .9, scaleX: 1.06, transformOrigin: '50% 100%', duration: .1, ease: 'power2.out' }, .62)
      .to(q('.cp'), { scaleY: 1, scaleX: 1, duration: .9, ease: 'elastic.out(1, .3)' }, .72)
      .fromTo(q('.sp'), { scale: 0, rotate: -50, opacity: 0 }, { scale: 1, rotate: 0, opacity: .9, duration: 1, ease: 'expo.out' }, .62);
  };

  DEMOS['a-retro'] = s => {
    const q = mount(s, `<p class="abs rt" style="left:0; right:0; top:28%; text-align:center; font:400 clamp(2.6rem,7vw,4.4rem)/1 Shrikhand, serif; color:#FF2E7E; --d:1; text-shadow:calc(var(--d) * 3px) calc(var(--d) * 3px) 0 #FF6A13, calc(var(--d) * 6px) calc(var(--d) * 6px) 0 #FFC300">Squeezed</p><p class="abs" style="left:0; right:0; top:64%; text-align:center; font:600 .82rem/1.3 Rubik, sans-serif; color:#6A4B2F">Letters rise, then the shadow layers peel out</p>`);
    const chars = split(q('.rt')); s.querySelectorAll('.w').forEach(w => { w.style.overflow = 'visible'; });
    return () => gsap.timeline()
      .set(q('.rt'), { '--d': 0 })
      .fromTo(chars, { yPercent: 120, rotate: 14, opacity: 0 }, { yPercent: 0, rotate: 0, opacity: 1, duration: 1, ease: 'expo.out', stagger: .045 })
      .to(q('.rt'), { '--d': 1, duration: .7, ease: 'back.out(2)' }, .7);
  };

  DEMOS['a-sun'] = s => {
    const q = mount(s, `<div class="abs rays ry" style="width:170%; aspect-ratio:1; left:-35%; top:-40%"></div><div class="abs sunsetdisc sd" style="width:58%; aspect-ratio:1; left:21%; top:13%"></div><span class="hint">Hover to speed up the rays</span>`);
    const spin = loop(s, () => gsap.to(q('.ry'), { rotate: 360, duration: 30, ease: 'none', repeat: -1 }));
    s.addEventListener('pointerenter', () => gsap.to(spin, { timeScale: 6, duration: .6 }));
    s.addEventListener('pointerleave', () => gsap.to(spin, { timeScale: 1, duration: 1.2 }));
    return () => gsap.timeline().fromTo(q('.sd'), { scale: 0 }, { scale: 1, duration: 1.3, ease: 'elastic.out(1, .4)' }).fromTo(q('.ry'), { opacity: 0 }, { opacity: 1, duration: .8 }, 0);
  };

  DEMOS['a-waves'] = s => {
    const q = mount(s, `<span class="mini-title" style="left:0; right:0; top:14%; text-align:center">RussRuss</span><svg class="abs" viewBox="0 0 1000 300" preserveAspectRatio="none" style="left:0; bottom:0; width:100%; height:62%">
      <g class="bd"><g class="wx"><path d="${wave(1600, 300, 40, 18, 250)}" fill="#FF2E7E"/></g></g>
      <g class="bd"><g class="wx"><path d="${wave(1600, 300, 120, 18, 250)}" fill="#FF6A13"/></g></g>
      <g class="bd"><g class="wx"><path d="${wave(1600, 300, 200, 18, 250)}" fill="#FFC300"/></g></g></svg>`);
    loop(s, () => s.querySelectorAll('.wx').forEach((w, i) => gsap.to(w, { x: -500, duration: 1.4 + i * .4, ease: 'none', repeat: -1 })));
    return () => gsap.fromTo(s.querySelectorAll('.bd'), { y: 320 }, { y: 0, duration: 1, ease: 'expo.out', stagger: .14 });
  };

  DEMOS['a-depth'] = s => {
    const items = [['melon', 'width:24%; left:5%; top:14%', .5, -16], ['strawberry', 'width:14%; left:16%; top:60%', 1.4, -10], ['pineapple', 'width:12%; right:12%; top:58%', 1.8, 18], ['orange-half', 'width:22%; right:4%; top:8%', 1, 0]];
    const q = mount(s, `<div class="abs sunsetdisc" style="width:44%; aspect-ratio:1; left:28%; top:20%"></div>${img('cup-orange', 'height:72%; left:37%; top:14%', 'abs')}` +
      items.map(([n, st, d, r]) => `<div class="abs dp" data-d="${d}" style="${st}"><img src="assets/${n}.webp" alt="" style="width:100%; transform:rotate(${r}deg)" draggable="false"></div>`).join('') + `<span class="hint">${fine ? 'Move your pointer over the stage' : 'Tap and drag across the stage'}</span>`);
    const dps = [...s.querySelectorAll('.dp')];
    const tos = dps.map(el => ({ d: +el.dataset.d, x: gsap.quickTo(el, 'x', { duration: .8, ease: 'power3' }), y: gsap.quickTo(el, 'y', { duration: .8, ease: 'power3' }) }));
    s.addEventListener('pointermove', e => { const r = s.getBoundingClientRect(), nx = (e.clientX - r.left) / r.width - .5, ny = (e.clientY - r.top) / r.height - .5; tos.forEach(o => { o.x(-nx * 60 * o.d); o.y(-ny * 50 * o.d); }); });
    s.addEventListener('pointerleave', () => tos.forEach(o => { o.x(0); o.y(0); }));
    loop(s, () => dps.forEach((el, i) => gsap.to(el.firstElementChild, { y: i % 2 ? -10 : 10, duration: 2 + i * .3, yoyo: true, repeat: -1, ease: 'sine.inOut' })));
    return () => gsap.fromTo(dps.map(d => d.firstElementChild), { scale: .2, opacity: 0, rotate: i => (i % 2 ? 160 : -160) }, { scale: 1, opacity: 1, rotate: (i, el) => el.style.transform.match(/-?\d+/) ? +el.style.transform.match(/-?\d+/)[0] : 0, duration: 1.2, ease: 'expo.out', stagger: .08 });
  };

  DEMOS['a-card'] = s => {
    const q = mount(s, `<div class="abs cd" style="left:31%; top:6%; width:38%; height:76%; border-radius:22px; background:#FFF8EC; box-shadow:0 20px 30px -18px rgba(59,30,8,.45)">
      <div class="abs" style="inset:5% 6% 30% 6%; border-radius:14px; background:#FFC300; overflow:hidden"><div class="abs rays" style="width:200%; aspect-ratio:1; left:-50%; top:40%; background:repeating-conic-gradient(from 0deg, rgba(255,244,214,.45) 0deg 9deg, transparent 9deg 18deg)"></div><div class="abs" style="inset:4% 0 0 0; display:flex; justify-content:center"><img class="cx" src="assets/cup-orange.webp" alt="" style="height:100%" draggable="false"></div></div>
      <p class="abs" style="left:8%; bottom:12%; font:400 clamp(1rem,2.4vw,1.5rem)/1 Shrikhand, serif; color:#3B1E08">Sun Up</p><p class="abs" style="right:8%; bottom:12%; font:800 .9rem/1 Rubik, sans-serif; color:#3B1E08">$9.50</p></div>
      <input class="abs scr" type="range" min="0" max="100" value="0" aria-label="Simulated scroll position" style="left:12%; width:76%; bottom:5%; accent-color:#FF2E7E">`);
    const cd = q('.cd'), cx = q('.cx'), scr = q('.scr');
    gsap.set(cd, { transformPerspective: 800 });
    const skew = gsap.quickTo(cd, 'skewX', { duration: .5, ease: 'power3' });
    let last = 0;
    const apply = v => { const p = v / 100; gsap.set(cx, { rotate: -24 + 36 * p, scale: .88 + .16 * p }); gsap.set(cd, { x: (p - .5) * s.offsetWidth * .5 }); skew(gsap.utils.clamp(-12, 12, (last - v) * .9)); last = v; clearTimeout(apply.t); apply.t = setTimeout(() => skew(0), 120); };
    scr.addEventListener('input', () => apply(+scr.value));
    const rx = gsap.quickTo(cd, 'rotationX', { duration: .5, ease: 'power3' }), ry = gsap.quickTo(cd, 'rotationY', { duration: .5, ease: 'power3' });
    cd.addEventListener('pointermove', e => { const r = cd.getBoundingClientRect(); ry(((e.clientX - r.left) / r.width - .5) * 18); rx(-((e.clientY - r.top) / r.height - .5) * 18); });
    cd.addEventListener('pointerleave', () => { rx(0); ry(0); });
    return () => { const o = { v: 0 }; gsap.timeline().to(o, { v: 100, duration: 1.6, ease: 'power2.inOut', onUpdate: () => { scr.value = o.v; apply(o.v); } }).to(o, { v: 50, duration: 1, ease: 'power2.inOut', onUpdate: () => { scr.value = o.v; apply(o.v); } }); };
  };

  DEMOS['a-counter'] = s => {
    const q = mount(s, `<div class="abs" style="left:8%; top:16%; right:8%"><div style="display:flex; align-items:baseline; gap:12px; flex-wrap:wrap"><span class="cn" style="font:400 clamp(4rem,11vw,7rem)/.85 Shrikhand, serif; --f:0%; background:linear-gradient(to top, #FF2E7E var(--f), #FFEBC8 var(--f)); -webkit-background-clip:text; background-clip:text; color:transparent; padding-right:.08em">0.0</span><span style="font:800 .95rem/1.25 Rubik, sans-serif; color:#3B1E08; max-width:12ch">lbs of fruit in every cup</span></div><p class="cw" style="font:400 clamp(1.3rem,3.2vw,1.9rem)/1.02 Rubik, sans-serif; text-transform:uppercase; color:#3B1E08; font-variation-settings:'wght' var(--w, 300); margin-top:16px">A whole fruit bowl, drinkable.</p></div>`);
    return () => { const o = { v: 0 }; gsap.timeline().fromTo(o, { v: 0 }, { v: 3.2, duration: 1, ease: 'power2.out', onUpdate: () => { q('.cn').textContent = o.v.toFixed(1); } }).fromTo(q('.cn'), { '--f': '0%' }, { '--f': '100%', duration: 1, ease: 'power2.inOut' }, .1).fromTo(q('.cw'), { '--w': 300 }, { '--w': 900, duration: 1.1, ease: 'power2.out' }, .15); };
  };

  DEMOS['a-press'] = s => {
    const q = mount(s, `<div class="abs" style="width:44%; aspect-ratio:1; left:28%; top:22%; border-radius:50%; background:${SUN}"></div>${img('press', 'width:72%; left:14%; top:2%', 'abs pr')}`);
    return () => gsap.timeline({ repeat: 1, repeatDelay: .25 })
      .fromTo(q('.pr'), { y: -16, rotate: -2 }, { y: 0, rotate: 0, duration: .35, ease: 'power2.in' })
      .add(() => burstAt(s, .42, .6, JUICE.citrus, 24, .8), .35)
      .to(q('.pr'), { scaleY: .97, transformOrigin: '50% 100%', duration: .08, yoyo: true, repeat: 1 }, .35);
  };

  DEMOS['a-postcard'] = s => {
    const q = mount(s, `<div class="abs pc" style="inset:10% 7%; border-radius:22px; overflow:hidden; box-shadow:0 24px 40px -24px rgba(59,30,8,.5)">${img('stand', 'left:0; top:0; width:100%; height:100%; object-fit:cover', 'abs si')}<span class="abs pill pl" style="left:4%; bottom:7%">Find the stand</span></div>`);
    return () => gsap.timeline()
      .fromTo(q('.pc'), { clipPath: 'inset(30% 30% 30% 30% round 120px)' }, { clipPath: 'inset(0% 0% 0% 0% round 22px)', duration: 1.2, ease: 'expo.inOut' })
      .fromTo(q('.si'), { scale: 1.3 }, { scale: 1, duration: 1.8, ease: 'expo.out' }, 0)
      .fromTo(q('.pl'), { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: .5, ease: 'back.out(2)' }, .9);
  };
})();

/* ---------- typography, decoration and step-frame demos ---------- */
(() => {
  const { DEMOS, mount, img, split, loop, burstAt, JUICE, reduce } = RRD;
  const RING = (label, color) => `<svg class="disc-ring" viewBox="0 0 200 200" aria-hidden="true"><circle cx="100" cy="100" r="79.5" fill="none" stroke="${color}" stroke-width="5"/><circle cx="100" cy="100" r="97" fill="none" stroke="#3B1E08" stroke-width="1.2" stroke-dasharray="1.5 5" stroke-linecap="round"/><text class="ringtxt"><textPath href="#ringP" textLength="556">${label}</textPath></text></svg>`;
  const ctl = (cls, label, min, max, step, val) => `<label class="abs" style="left:8%; right:8%; bottom:5%; display:flex; gap:10px; align-items:center; font:400 .7rem/1 Righteous, sans-serif; letter-spacing:.1em; text-transform:uppercase; color:#8A6A52">${label}<input class="${cls}" type="range" min="${min}" max="${max}" step="${step}" value="${val}" style="flex:1; accent-color:#FF2E7E"></label>`;

  DEMOS['t-stripe'] = s => {
    const q = mount(s, `<p class="abs ts stripe-s" style="left:0; right:0; top:24%; text-align:center; font:400 clamp(2.2rem,5.4vw,3.8rem)/1 Shrikhand, serif; --x:1.1px">Squeezed</p>${ctl('dp', 'Depth', 0, 2, .05, 1.1)}`);
    q('.dp').addEventListener('input', e => q('.ts').style.setProperty('--x', e.target.value + 'px'));
    return () => gsap.fromTo(q('.ts'), { '--x': '0px', scale: .9 }, { '--x': '1.1px', scale: 1, duration: 1.2, ease: 'back.out(2)', onComplete: () => { q('.dp').value = 1.1; } });
  };

  DEMOS['t-wavy'] = s => {
    const q = mount(s, `<p class="abs wv pop wavy" style="left:0; right:0; top:28%; text-align:center; font:400 clamp(2.6rem,7vw,4.4rem)/1 Shrikhand, serif; --amp:.085em">this morning.</p>${ctl('am', 'Wave', 0, .2, .005, .085)}`);
    const chars = split(q('.wv')); chars.forEach((c, i) => c.style.setProperty('--i', i)); s.querySelectorAll('.w').forEach(w => { w.style.overflow = 'visible'; });
    q('.am').addEventListener('input', e => q('.wv').style.setProperty('--amp', e.target.value + 'em'));
    return () => gsap.fromTo(chars, { yPercent: 120, opacity: 0 }, { yPercent: 0, opacity: 1, duration: .9, ease: 'expo.out', stagger: .04 });
  };

  DEMOS['t-arch'] = s => {
    const layers = [['#FFC300', 12], ['#FF6A13', 8], ['#FF2E7E', 4]].map(([c, o]) => `<text class="archT" style="font-size:120px" fill="${c}" transform="translate(${o} ${o})"><textPath href="#archDemo" startOffset="50%" text-anchor="middle">Today's press</textPath></text>`).join('');
    const q = mount(s, `<svg class="abs" viewBox="0 0 1000 420" style="left:4%; top:6%; width:92%; overflow:visible"><path id="archDemo" class="ap" d="M60,330 Q500,40 940,330" fill="none"/>${layers}<text class="archT" style="font-size:120px" fill="#FFF6E2" stroke="#3B1E08" stroke-width="5" paint-order="stroke"><textPath href="#archDemo" startOffset="50%" text-anchor="middle">Today's press</textPath></text></svg>${ctl('bd', 'Bend', 0, 320, 1, 290)}`);
    const set = b => q('.ap').setAttribute('d', `M60,330 Q500,${330 - b} 940,330`);
    q('.bd').addEventListener('input', e => set(+e.target.value));
    return () => { const o = { b: 0 }; gsap.to(o, { b: 290, duration: 1.4, ease: 'elastic.out(1, .45)', onUpdate: () => { set(o.b); q('.bd').value = o.b; } }); };
  };

  DEMOS['t-ring'] = s => {
    const q = mount(s, `<div class="abs sunsetdisc" style="width:42%; aspect-ratio:1; left:8%; top:16%"></div><svg class="abs rg" viewBox="0 0 200 200" style="width:54%; left:2%; top:4%; overflow:visible"><text class="ringtxt"><textPath href="#ringP" textLength="556">FRESH-SQUEEZED EVERY MORNING • RUSSRUSS JUICE STAND • OPEN 7 TO 7 •</textPath></text></svg><svg class="abs bg6 bob" viewBox="0 0 200 200" style="width:34%; right:8%; top:22%"><use href="#badge6"/></svg><span class="hint">Hover to spin faster</span>`);
    const spin = loop(s, () => gsap.to(q('.rg'), { rotation: 360, duration: 40, ease: 'none', repeat: -1 }));
    s.addEventListener('pointerenter', () => gsap.to(spin, { timeScale: 8, duration: .5 }));
    s.addEventListener('pointerleave', () => gsap.to(spin, { timeScale: 1, duration: 1 }));
    return () => gsap.timeline().fromTo(q('.bg6'), { scale: 0, rotation: -120 }, { scale: 1, rotation: 0, duration: 1.2, ease: 'elastic.out(1, .4)' }).fromTo(q('.rg'), { opacity: 0, scale: .8 }, { opacity: 1, scale: 1, duration: .8, ease: 'expo.out' }, 0);
  };

  DEMOS['t-count'] = s => {
    const q = mount(s, `<div class="abs" style="left:8%; right:8%; top:18%"><p style="font:400 .78rem/1 Righteous, sans-serif; letter-spacing:.16em; text-transform:uppercase; color:#3B1E08; margin-bottom:10px">Step 04 · Pour</p><div style="display:flex; align-items:baseline; gap:14px; flex-wrap:wrap"><span class="cn" style="font:400 clamp(4rem,11vw,7rem)/.95 Monoton, serif; --f:0%; background:linear-gradient(to top, #FF2E7E var(--f), #FFDDB0 var(--f)); -webkit-background-clip:text; background-clip:text; color:transparent">0</span><span style="font:400 .95rem/1.25 Righteous, sans-serif; letter-spacing:.08em; text-transform:uppercase; color:#3B1E08; max-width:12ch">hours before it fades</span></div></div>`);
    return () => { const o = { v: 0 }; gsap.timeline().fromTo(o, { v: 0 }, { v: 72, duration: 1.2, ease: 'power2.out', onUpdate: () => { q('.cn').textContent = Math.round(o.v); } }).fromTo(q('.cn'), { '--f': '0%' }, { '--f': '100%', duration: 1.2, ease: 'power2.inOut' }, .1); };
  };

  DEMOS['t-stack'] = s => {
    const q = mount(s, `<div class="abs st" style="left:8%; right:8%; top:10%; display:grid; gap:8px">
      <p class="a1" style="font:400 .76rem/1 Righteous, sans-serif; letter-spacing:.16em; text-transform:uppercase; color:#FF2E7E">Step 03 · Press</p>
      <div class="a2" style="display:flex; align-items:baseline; gap:12px"><span class="cn" style="font:400 clamp(3.4rem,9vw,5.4rem)/.95 Monoton, serif; color:#FF2E7E">4</span><span style="font:400 .86rem/1.2 Righteous, sans-serif; letter-spacing:.08em; text-transform:uppercase; color:#3B1E08">tons of slow pressure</span></div>
      <p class="a3" style="font:400 clamp(1.4rem,3.4vw,2rem)/1.05 Rubik, sans-serif; color:#3B1E08; letter-spacing:-.02em; font-variation-settings:'wght' var(--w, 800)">Squeezed, not spun.</p>
      <p class="a4" style="font:500 .9rem/1.5 Rubik, sans-serif; color:#6B4A2F; max-width:36ch">A hydraulic press pushes the juice out of the pulp, so nothing heats up on the way.</p></div>`);
    return () => gsap.timeline().fromTo([q('.a1'), q('.a2'), q('.a3'), q('.a4')], { y: 26, opacity: 0 }, { y: 0, opacity: 1, duration: .7, ease: 'expo.out', stagger: .12 }).fromTo(q('.a3'), { '--w': 300 }, { '--w': 800, duration: 1, ease: 'power2.out' }, .3);
  };

  /* ---------- sticker kit ---------- */
  RRD.decoKit = el => {
    const items = [
      ['Sparkle', 'Twinkles every 2.6s, offset per sticker', `<svg class="twinkle" viewBox="-50 -50 100 100" style="color:#FFC300"><use href="#sparkle"/></svg>`],
      ['Daisy', 'Turns every 24s. Pink, tangerine or sunflower petals.', `<svg class="turn" viewBox="-50 -50 100 100" style="color:#FF2E7E"><use href="#daisy"/></svg>`],
      ['Rainbow arc', 'Anchors corners and sits under the step frames', `<svg class="bob" viewBox="-52 -52 104 54" style="width:80%"><use href="#rainbow"/></svg>`],
      ['Squiggle', 'A line accent in lime or pink, tilted ±25°', `<svg viewBox="0 0 100 20" style="color:#7ED321; width:80%"><use href="#squiggle"/></svg>`],
      ['Sun icon', 'Turns every 24s. Small, at most 2 per view.', `<svg class="turn" viewBox="-50 -50 100 100" style="color:#FF6A13"><use href="#sunicon"/></svg>`],
      ['Starburst sticker', 'Carries one fact, like "6am" or "See you at 7"', `<svg class="turn-slow" viewBox="0 0 200 200" style="width:80%"><use href="#badge6"/></svg>`],
      ['Halftone dots', 'Soft-edged patches behind photos, 35% opacity', `<div class="halftone" style="position:absolute; inset:0; color:#FF2E7E; opacity:.6"></div>`],
      ['Wave bands', 'Pink, tangerine and sunflower. They roll along the base of the hero.', `<svg viewBox="0 0 400 120" preserveAspectRatio="none" style="width:100%; height:60%; position:absolute; bottom:0"><g class="wl"><path d="${RRD.wave(900, 120, 20, 8, 100)}" fill="#FF2E7E"/></g><g class="wl"><path d="${RRD.wave(900, 120, 55, 8, 100)}" fill="#FF6A13"/></g><g class="wl"><path d="${RRD.wave(900, 120, 90, 8, 100)}" fill="#FFC300"/></g></svg>`]
    ];
    el.innerHTML = items.map(([n, u, art]) => `<figure><div class="ph">${art}</div><figcaption><b>${n}</b>${u}</figcaption></figure>`).join('');
    if (!reduce) el.querySelectorAll('.wl').forEach((g, i) => gsap.to(g, { x: -200, duration: 1.6 + i * .4, ease: 'none', repeat: -1 }));
  };

  /* ---------- clutter composer ---------- */
  RRD.composer = s => {
    const d = (l, style, art) => `<div class="abs lvl" data-l="${l}" style="${style}">${art}</div>`;
    const sp = c => `<svg class="twinkle" viewBox="-50 -50 100 100" style="color:${c}; width:100%"><use href="#sparkle"/></svg>`;
    const dz = c => `<svg class="turn" viewBox="-50 -50 100 100" style="color:${c}; width:100%"><use href="#daisy"/></svg>`;
    const html = `<div class="abs rays" style="width:150%; aspect-ratio:1; left:-25%; top:-60%"></div>
      <div class="abs sunsetdisc" style="width:30%; aspect-ratio:1; left:35%; top:14%"></div>
      ${img('cup-orange', 'height:78%; left:40%; top:10%', 'abs')}
      <span class="mini-title stripe-s" style="left:4%; top:8%; font-size:clamp(1.6rem,4vw,2.8rem)">Squeezed</span>
      ${d(1, 'width:4%; left:30%; top:20%', sp('#FFC300'))}${d(1, 'width:3%; right:28%; top:60%', sp('#FF2E7E'))}${d(1, 'width:13%; left:3%; bottom:6%', `<svg viewBox="-52 -52 104 54" style="width:100%"><use href="#rainbow"/></svg>`)}
      ${d(2, 'width:6%; left:20%; top:60%', dz('#FF2E7E'))}${d(2, 'width:11%; right:4%; top:10%', `<svg class="turn-slow" viewBox="0 0 200 200" style="width:100%"><use href="#badge6"/></svg>`)}${d(2, 'width:9%; right:14%; bottom:14%', `<svg viewBox="0 0 100 20" style="color:#7ED321; width:100%; transform:rotate(12deg)"><use href="#squiggle"/></svg>`)}${d(2, 'width:3%; left:12%; top:38%', sp('#FF6A13'))}
      ${d(3, 'width:7%; right:26%; top:8%', dz('#FF6A13'))}${d(3, 'width:6%; left:24%; bottom:8%', `<svg class="turn" viewBox="-50 -50 100 100" style="color:#FFC300; width:100%"><use href="#sunicon"/></svg>`)}${d(3, 'width:22%; aspect-ratio:1; left:12%; top:-6%; color:#FF2E7E', '<div class="halftone" style="position:absolute; inset:0"></div>')}${d(3, 'width:3%; right:6%; top:52%', sp('#FFC300'))}${d(3, 'width:8%; left:14%; top:22%', `<svg viewBox="0 0 100 20" style="color:#FF2E7E; width:100%; transform:rotate(-24deg)"><use href="#squiggle"/></svg>`)}
      <div class="zone"></div>`;
    mount(s, html);
    const names = ['Bare', 'Products', 'Hero', 'Outro'];
    const apply = (v, animate) => s.querySelectorAll('.lvl').forEach(el => {
      const on = +el.dataset.l <= v, was = el.dataset.on === '1'; el.dataset.on = on ? '1' : '0';
      if (on && !was && animate && !reduce) gsap.fromTo(el, { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: .8, ease: 'elastic.out(1, .45)' });
      else gsap.set(el, { opacity: on ? 1 : 0, scale: 1 });
    });
    const r = document.getElementById('dens'), o = document.getElementById('densO');
    r.addEventListener('input', () => { apply(+r.value, true); o.textContent = names[r.value]; });
    apply(+r.value, false); o.textContent = names[r.value];
    const zb = document.getElementById('zoneBtn');
    zb.addEventListener('click', () => { const z = s.querySelector('.zone'), off = z.classList.toggle('off'); zb.textContent = off ? 'Show clear zone' : 'Hide clear zone'; zb.setAttribute('aria-pressed', String(!off)); });
  };

  /* ---------- step frames ---------- */
  RRD.steps = s => {
    const STEPS = [
      { k: 'Step 01 · Pick', n: 5, suf: ':00', unit: 'a.m., when the fruit shows up', t: "We buy what's ripe that morning.", ring: '#FF2E7E',
        inner: `<div class="rays"></div>${img('melon', 'left:6%; top:14%; width:44%; transform:rotate(-14deg)', '')}${img('pineapple', 'right:12%; top:10%; width:26%; transform:rotate(18deg)', '')}${img('orange-half', 'left:28%; top:40%; width:40%', '')}${img('strawberry', 'right:10%; bottom:12%; width:28%; transform:rotate(-12deg)', '')}` },
      { k: 'Step 02 · Cut', n: 3.2, dec: 1, unit: 'pounds of fruit in every cup', t: 'Everything is washed and cut by hand.', ring: '#FF6A13',
        inner: `<div class="rays"></div><img class="turn" src="assets/orange-half.webp" alt="" style="width:84%; left:8%; top:8%">` },
      { k: 'Step 03 · Press', n: 4, unit: 'tons of slow pressure', t: 'Squeezed, not spun.', ring: '#FF2E7E',
        inner: `<img src="assets/press.webp" alt="" style="width:128%; height:128%; left:-10%; top:-4%; object-fit:cover; object-position:60% 40%">` },
      { k: 'Step 04 · Pour', n: 72, unit: 'hours before it fades', t: 'Into cups within the hour.', ring: '#FF6A13',
        inner: `<div class="rays"></div><img src="assets/cup-orange.webp" alt="" style="height:94%; left:50%; top:4%; transform:translateX(-50%)">` }
    ];
    const label = st => `${st.k.toUpperCase()} • `.repeat(3);
    const deco = `<div class="abs" style="left:4%; bottom:4%; width:36%"><svg viewBox="-52 -52 104 54" style="width:100%"><use href="#rainbow"/></svg></div>
      <div class="abs halftone" style="left:22%; top:-14%; width:30%; aspect-ratio:1; color:#FF2E7E"></div>
      <div class="abs" style="left:4%; top:8%; width:6%"><svg class="turn" viewBox="-50 -50 100 100" style="color:#FF6A13; width:100%"><use href="#daisy"/></svg></div>
      <div class="abs" style="left:40%; top:70%; width:6%"><svg class="turn" viewBox="-50 -50 100 100" style="color:#FF2E7E; width:100%"><use href="#daisy"/></svg></div>
      <div class="abs" style="left:10%; top:40%; width:3%"><svg class="twinkle" viewBox="-50 -50 100 100" style="color:#FFC300; width:100%"><use href="#sparkle"/></svg></div>
      <div class="abs" style="left:42%; top:16%; width:4%"><svg class="twinkle d1" viewBox="-50 -50 100 100" style="color:#FF2E7E; width:100%"><use href="#sparkle"/></svg></div>
      <div class="abs" style="left:38%; top:4%; width:6%"><svg class="turn" viewBox="-50 -50 100 100" style="color:#FFC300; width:100%"><use href="#sunicon"/></svg></div>`;
    const discs = STEPS.map((st, i) => `<div class="abs fr" data-i="${i}" style="left:6%; top:8%; width:40%; aspect-ratio:1"><div class="disc-clip">${st.inner}</div>${RING(label(st), st.ring)}</div>`).join('');
    const texts = STEPS.map((st, i) => `<div class="abs tx" data-i="${i}" style="left:54%; right:5%; top:22%; display:grid; gap:8px">
      <p style="font:400 .74rem/1 Righteous, sans-serif; letter-spacing:.16em; text-transform:uppercase; color:#FF2E7E">${st.k}</p>
      <div style="display:flex; align-items:baseline; gap:10px; flex-wrap:wrap"><span class="cn" data-n="${st.n}" data-dec="${st.dec || 0}" data-suf="${st.suf || ''}" style="font:400 clamp(2.6rem,6vw,4.6rem)/.95 Monoton, serif; color:#FF2E7E">${st.n}${st.suf || ''}</span><span style="font:400 .78rem/1.25 Righteous, sans-serif; letter-spacing:.08em; text-transform:uppercase; color:#3B1E08; max-width:14ch">${st.unit}</span></div>
      <p class="tt" style="font:400 clamp(1.1rem,2.4vw,1.7rem)/1.1 Rubik, sans-serif; color:#3B1E08; letter-spacing:-.02em; font-variation-settings:'wght' var(--w, 800)">${st.t}</p></div>`).join('');
    mount(s, deco + discs + texts);
    const frs = [...s.querySelectorAll('.fr')], txs = [...s.querySelectorAll('.tx')], tabs = [...document.querySelectorAll('#stepTabs button')];
    frs.forEach(f => f.querySelector('.disc-ring').classList.add('turn-slow'));
    let cur = 0;
    gsap.set(frs.slice(1), { clipPath: 'inset(100% 0% 0% 0%)' }); gsap.set(txs.slice(1), { opacity: 0, y: 30 });
    const go = i => {
      if (i === cur) return; const a = cur; cur = i;
      tabs.forEach((t, k) => t.classList.toggle('on', k === i));
      const tl = gsap.timeline();
      tl.fromTo(frs[a], { clipPath: 'inset(0% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 100% 0%)', duration: .5, ease: 'power2.inOut' })
        .fromTo(frs[i], { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: .6, ease: 'power2.inOut' }, .15)
        .fromTo(frs[i], { rotation: -30, scale: .85 }, { rotation: 0, scale: 1, duration: .9, ease: 'back.out(1.6)' }, .15)
        .to(txs[a], { opacity: 0, y: -30, duration: .3 }, 0)
        .fromTo(txs[i], { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: .5, ease: 'expo.out' }, .3)
        .fromTo(txs[i].querySelector('.tt'), { '--w': 300 }, { '--w': 800, duration: .9, ease: 'power2.out' }, .35);
      const cn = txs[i].querySelector('.cn'), o = { v: 0 }, n = +cn.dataset.n, dec = +cn.dataset.dec, suf = cn.dataset.suf;
      tl.fromTo(o, { v: 0 }, { v: n, duration: .9, ease: 'power2.out', onUpdate: () => { cn.textContent = o.v.toFixed(dec) + suf; } }, .3);
      if (i === 2) tl.add(() => burstAt(frs[i], .5, .6, JUICE.citrus, 18, .7), .7);
    };
    tabs.forEach((t, k) => t.addEventListener('click', () => { stop(); go(k); }));
    let timer = null; const btn = document.getElementById('stepPlay');
    const stop = () => { clearInterval(timer); timer = null; btn.textContent = '▶'; btn.setAttribute('aria-label', 'Play'); };
    const play = () => { go((cur + 1) % 4); timer = setInterval(() => go((cur + 1) % 4), 2600); btn.textContent = '❚❚'; btn.setAttribute('aria-label', 'Pause'); };
    btn.addEventListener('click', () => (timer ? stop() : play()));
    return () => { if (!timer && !reduce) play(); };
  };
})();

/* ---------- finale lab + sign demo ---------- */
(() => {
  const { DEMOS, LABS, mount, img, wave, burstAt, JUICE } = RRD;
  const board = (id) => `<div class="abs sg" style="left:31%; top:25%; width:37%; transform-origin:50% -30%">
      <div class="abs" style="left:16%; top:-26%; width:2px; height:28%; background:#3B1E08"></div><div class="abs" style="right:16%; top:-26%; width:2px; height:28%; background:#3B1E08"></div>
      <div style="background:#FFF6E2; border:3px solid #FF2E7E; border-radius:12px; padding:4% 6% 3%; box-shadow:0 0 0 2px #FFF6E2, 0 0 0 4px #3B1E08, 0 14px 20px -10px rgba(59,30,8,.5); text-align:center">
        <p style="font:400 clamp(.4rem,.8vw,.62rem)/1 Righteous, sans-serif; letter-spacing:.14em; text-transform:uppercase; color:#3B1E08; margin-bottom:2%">Juice stand · Open 7 to 7</p>
        <svg viewBox="0 0 1000 220" style="width:100%; height:auto; display:block; overflow:visible"><defs><clipPath id="${id}"><text x="500" y="168" text-anchor="middle" style="font:400 150px Shrikhand, serif">RussRuss</text></clipPath></defs>
          <text x="500" y="168" text-anchor="middle" style="font:400 150px Shrikhand, serif" fill="#FFE6BF" stroke="#3B1E08" stroke-width="6" paint-order="stroke">RussRuss</text>
          <g clip-path="url(#${id})"><g class="sf"><path d="${wave(2600, 560, 14, 14, 250)}" fill="#FF2E7E"/></g></g></svg>
      </div></div>`;
  const cups = ['cup-orange', 'cup-green', 'cup-pink', 'cup-mango'].map((c, i) => img(c, `left:${33 + i * 11}%; bottom:30.5%; height:31%`, 'abs cu')).join('');

  LABS['a-finale'] = s => {
    const steps = `<div class="layer mm" style="background:#fff"><div class="abs" style="width:30%; aspect-ratio:1; left:8%; top:18%; border-radius:50%; background:radial-gradient(circle at 40% 35%, #FFE27A, #FFC300 62%)"></div>${img('cup-orange', 'height:46%; left:14%; top:24%', 'abs')}
      <div class="abs" style="left:46%; top:28%; right:6%"><p style="font:400 .66rem/1 Righteous, sans-serif; letter-spacing:.14em; text-transform:uppercase; color:#3B1E08; margin-bottom:6px">Step 04 · Pour</p><span style="font:400 clamp(2rem,6vw,4rem)/.95 Monoton, serif; color:#FF2E7E">72</span><p style="font:700 clamp(.85rem,2vw,1.2rem)/1.1 Rubik, sans-serif; color:#3B1E08; margin-top:6px">Into cups within the hour.</p></div></div>`;
    const standL = `<div class="layer st" style="background:#FFF6E2"><div class="abs sz" style="inset:0">${img('stand', 'left:0; top:0; width:100%; height:100%; object-fit:cover', 'abs')}${board('dclFin')}${cups}</div></div>`;
    const curtain = `<div class="layer" style="overflow:visible; pointer-events:none"><div class="abs awning aw" style="left:0; right:0; top:-30%; height:142%"></div><div class="abs cc" style="left:0; right:0; top:38%; text-align:center"><span class="mini-title stripe-s" style="position:relative; background:#FFF6E2; padding:.2em .6em; border-radius:999px; box-shadow:0 0 0 3px #3B1E08">Come by the stand.</span></div></div>`;
    const ui = `<div class="layer" style="pointer-events:none"><span class="abs b-main fc" style="left:50%; bottom:16%; transform:translateX(-50%); padding:10px 18px; font-size:.72rem">Order for pickup</span>
      <svg class="abs fw" viewBox="0 0 2000 220" preserveAspectRatio="none" style="left:0; bottom:0; width:100%; height:12%"><path d="${wave(2600, 220, 40, 14, 250)}" fill="#FF2E7E"/><path d="${wave(2600, 220, 100, 14, 250)}" fill="#FF6A13"/><path d="${wave(2600, 220, 160, 14, 250)}" fill="#FFC300"/></svg></div>`;
    const q = mount(s, steps + standL + curtain + ui);
    gsap.set(q('.st'), { opacity: 0 });
    const cu = s.querySelectorAll('.cu');
    const tl = gsap.timeline({ paused: true });
    tl.fromTo(q('.aw'), { yPercent: -112 }, { yPercent: 0, duration: .16, ease: 'back.out(1.25)' }, 0)
      .fromTo(q('.cc'), { scale: .6, opacity: 0 }, { scale: 1, opacity: 1, duration: .1, ease: 'back.out(2)' }, .08)
      .set(q('.mm'), { opacity: 0 }, .2).set(q('.st'), { opacity: 1 }, .2)
      .to(q('.cc'), { opacity: 0, duration: .05 }, .23)
      .to(q('.aw'), { yPercent: -112, duration: .17, ease: 'power3.inOut' }, .25)
      .fromTo(q('.sz'), { scale: 1.3 }, { scale: 1, duration: .42, ease: 'power2.out' }, .22)
      .fromTo(q('.sg'), { yPercent: -190, rotation: -18 }, { yPercent: 0, rotation: 0, duration: .14, ease: 'back.out(1.9)' }, .4)
      .fromTo(q('.sf'), { y: 600 }, { y: -40, duration: .14, ease: 'none' }, .5)
      .fromTo(cu, { y: 60, scale: .4, opacity: 0, rotation: i => (i % 2 ? 34 : -34) }, { y: 0, scale: 1, opacity: 1, rotation: 0, duration: .1, ease: 'back.out(2.4)', stagger: .045 }, .56)
      .fromTo(q('.fc'), { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: .1, ease: 'back.out(2)' }, .76)
      .fromTo(q('.fw'), { yPercent: 100 }, { yPercent: 0, duration: .1 }, .86)
      .to({}, { duration: .08 });
    return tl;
  };

  DEMOS['a-sign'] = s => {
    const q = mount(s, `<div class="abs rays" style="width:170%; aspect-ratio:1; left:-35%; top:-40%"></div><div class="abs" style="left:0; right:0; top:0; height:9%; background:repeating-linear-gradient(90deg, #FF2E7E 0 8%, #FFF6E2 8% 16%)"></div>${board('dclSign').replace('left:31%; top:25%; width:37%', 'left:14%; top:30%; width:72%')}`);
    const sg = q('.sg'), sf = q('.sf');
    return () => gsap.timeline()
      .fromTo(sg, { yPercent: -200, rotation: -20 }, { yPercent: 0, rotation: 0, duration: 1.1, ease: 'elastic.out(1, .4)' })
      .fromTo(sf, { y: 600 }, { y: -40, duration: 1.4, ease: 'power2.inOut' }, .5)
      .add(() => burstAt(s, .5, .5, ['#FF2E7E', '#FFC300', '#FFF6E2'], 20, .8), 1.8);
  };
})();
