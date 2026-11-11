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
    <span class="mini-title h1" style="left:5%; top:6%">Squeezed</span>
    <span class="mini-title h2" style="right:5%; bottom:14%; color:var(--acc2); text-shadow:2px 2px 0 var(--acc), 4px 4px 0 var(--acc3)">sunshine.</span>
    <svg class="abs hw" viewBox="0 0 2000 220" preserveAspectRatio="none" style="left:0; bottom:0; width:100%; height:15%">${WAVES}</svg>
  </div>`;
  const card = (left, bg, cup) => `<div class="cardmini nc" style="left:${left}%; top:34%; width:20%; height:58%"><div class="abs" style="inset:7% 7% 30% 7%; border-radius:12px; background:${bg}"></div><div class="abs" style="inset:4% 0 30% 0; display:flex; justify-content:center"><img src="assets/${cup}.webp" alt="" style="height:100%"></div><div class="abs" style="left:10%; right:10%; bottom:9%; height:7%; border-radius:99px; background:#FFE0B0"></div></div>`;
  const next = (cls = '') => `<div class="layer ${cls}" style="background:#fff">
    <div class="abs rays" style="width:150%; aspect-ratio:1; left:-25%; top:-62%"></div>
    <span class="mini-title nt" style="left:0; right:0; top:9%; text-align:center">Pick your sunshine</span>
    ${card(14, '#FFC300', 'cup-orange')}${card(40, '#7ED321', 'cup-green')}${card(66, '#FF2E7E', 'cup-pink')}
  </div>`;
  const mani = (cls = '') => `<div class="layer ${cls}" style="background:#fff">
    <div class="abs" style="width:30%; aspect-ratio:1; left:8%; top:18%; border-radius:50%; background:${SUN}"></div>
    ${img('orange-half', 'width:24%; left:11%; top:25%', 'abs mo-o')}
    <div class="abs" style="left:46%; top:24%; right:6%"><span style="font:400 clamp(2.2rem,6.4vw,4.4rem)/.85 Shrikhand,serif; color:#FF2E7E">100</span><p style="font:900 clamp(.9rem,2.1vw,1.4rem)/1.05 Rubik,sans-serif; text-transform:uppercase; color:#3B1E08; margin-top:8px">Pressed, never cooked.</p></div>
  </div>`;
  const stand = (cls = '') => `<div class="layer ${cls}">${img('stand', 'left:0; top:0; width:100%; height:100%; object-fit:cover', 'abs st')}<span class="abs pill" style="left:4%; bottom:7%">Find the stand</span></div>`;

  /* ---------- transition labs ---------- */
  LABS['a-iris'] = s => {
    const q = mount(s, hero() + next('wipe'));
    const tl = gsap.timeline({ paused: true });
    tl.to(q('.hr'), { rotate: 120, duration: 1, ease: 'none' }, 0)
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
      <div class="abs" style="left:7%; right:7%; bottom:14%; display:flex; justify-content:space-between; font:700 .82rem/1 Rubik, sans-serif; color:#3B1E08"><span>Squeezing <span class="ct">000</span>%</span><span>Fresh at sunrise</span></div>`);
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
