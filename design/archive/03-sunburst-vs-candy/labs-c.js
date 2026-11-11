/* Candy Gloss: motion demos and transition labs. */
(() => {
  const { DEMOS, LABS, mount, img, burstAt, loop, JUICE, fine } = RRD;
  const DISPLAY = `"Bricolage Grotesque", sans-serif`;
  const BODY = `Manrope, sans-serif`;
  const WORLDS = [
    { name: 'Orange', blob: 'blob-orange', cup: 'cup-orange', tint: '#FFF1E3', word: '#FF7A00', juice: ['#FF7A00', '#FFB25A', '#FFFFFF'] },
    { name: 'Lime', blob: 'blob-green', cup: 'cup-green', tint: '#F3FFD9', word: '#7CC400', juice: ['#8ED100', '#E4FF7A', '#FFFFFF'] },
    { name: 'Melon', blob: 'blob-pink', cup: 'cup-pink', tint: '#FFEFF4', word: '#FF3D6E', juice: ['#FF3D6E', '#FF9AB8', '#FFFFFF'] },
    { name: 'Mango', blob: 'blob-yellow', cup: 'cup-mango', tint: '#FFF9DB', word: '#FFB800', juice: ['#FFC400', '#FFF0A0', '#FFFFFF'] }
  ];

  /* ---------- mini scenes ---------- */
  const hero = (cls = '') => `<div class="layer ${cls}" style="background:#fff">
    ${img('blob-orange', 'width:50%; left:25%; top:6%', 'abs hb')}
    ${img('cup-orange', 'height:80%; left:37%; top:10%', 'abs hc')}
    ${img('gloss-2', 'width:10%; left:17%; top:24%', 'abs hg')}${img('gloss-1', 'width:8%; left:9%; top:58%', 'abs hg')}
    ${img('gloss-3', 'width:8%; right:15%; top:34%', 'abs hg')}${img('gloss-4', 'width:13%; right:5%; top:8%', 'abs hg')}
    <span class="mini-title h1" style="left:5%; top:6%">Juicy</span>
    <span class="mini-title ink h2" style="right:5%; bottom:12%">&amp; glossy.</span>
  </div>`;
  const card = (left, blob, cup) => `<div class="cardmini nc" style="left:${left}%; top:32%; width:20%; height:60%">${img(blob, 'width:80%; left:10%; top:6%', 'abs')}<div class="abs" style="inset:2% 0 26% 0; display:flex; justify-content:center"><img src="assets/${cup}.webp" alt="" style="height:100%"></div><div class="abs" style="left:12%; right:12%; bottom:9%; height:8%; border-radius:99px; background:linear-gradient(180deg,#FF6A92,#FF3D6E)"></div></div>`;
  const next = (cls = '') => `<div class="layer ${cls}" style="background:#fff">
    <span class="mini-title nt" style="left:0; right:0; top:8%; text-align:center">Pick a color</span>
    ${card(14, 'blob-orange', 'cup-orange')}${card(40, 'blob-green', 'cup-green')}${card(66, 'blob-pink', 'cup-pink')}
  </div>`;
  const mani = (cls = '') => `<div class="layer ${cls}" style="background:#fff">
    ${img('blob-pink', 'width:34%; left:5%; top:12%', 'abs')}${img('lime-wheel', 'width:22%; left:11%; top:24%', 'abs mw')}
    <div class="abs" style="left:46%; top:24%; right:6%"><span style="font:800 clamp(2.4rem,7vw,4.6rem)/.85 ${DISPLAY}; letter-spacing:-.05em; font-variation-settings:'wdth' 75; color:#FF3D6E">100</span><p style="font:800 clamp(.95rem,2.2vw,1.5rem)/1.05 ${DISPLAY}; letter-spacing:-.03em; color:#2A0A1C; margin-top:8px">Pressed, never cooked.</p></div>
  </div>`;
  const outro = (cls = '') => `<div class="layer ${cls}" style="background:#fff">
    ${img('drip', 'left:0; top:0; width:100%', 'abs')}
    <span class="abs" style="left:0; right:0; top:42%; text-align:center; font:800 clamp(2.4rem,8vw,5rem)/1 ${DISPLAY}; letter-spacing:-.06em; font-variation-settings:'wdth' 75; color:#FF3D6E">RussRuss</span>
    <span class="abs b-main" style="left:50%; top:74%; transform:translateX(-50%); padding:10px 18px; font-size:.8rem">Order for pickup →</span>
  </div>`;

  /* ---------- transition labs ---------- */
  LABS['c-pass'] = s => {
    const blobs = ['blob-pink', 'blob-green', 'blob-yellow', 'blob-orange'].map((b, i) => img(b, `width:78%; left:11%; top:${-30 + i * 22}%`, 'abs wb')).join('');
    const q = mount(s, hero('hx') + next('nx') + `<div class="layer">${blobs}</div>`);
    gsap.set(q('.nx'), { opacity: 0 });
    const tl = gsap.timeline({ paused: true });
    tl.fromTo(s.querySelectorAll('.wb'), { xPercent: i => (i % 2 ? 170 : -170), rotate: i => (i % 2 ? 40 : -40) }, { xPercent: i => (i % 2 ? -170 : 170), rotate: i => (i % 2 ? -40 : 40), duration: .7, ease: 'none', stagger: .06 }, 0)
      .to(q('.hx'), { opacity: 0, duration: .12 }, .38)
      .to(q('.nx'), { opacity: 1, duration: .12 }, .42)
      .from(s.querySelectorAll('.nx .nc'), { y: 50, scale: .85, stagger: .05, duration: .3, ease: 'back.out(1.8)' }, .55)
      .from(q('.nx .nt'), { yPercent: 80, opacity: 0, duration: .3, ease: 'expo.out' }, .5);
    return tl;
  };

  LABS['c-goo'] = s => {
    const q = mount(s, hero() + next('nx') + `<div class="layer" style="overflow:visible; pointer-events:none"><div class="abs goo" style="left:0; right:0; top:0; height:100%; background:#F0577A">${img('drip', 'left:0; top:99%; width:100%', 'abs')}</div></div>`);
    gsap.set(q('.nx'), { opacity: 0 });
    const tl = gsap.timeline({ paused: true });
    tl.fromTo(q('.goo'), { yPercent: -112 }, { yPercent: 0, duration: .45, ease: 'power2.in' }, 0)
      .to(q('.hc'), { y: 40, scale: .9, duration: .4 }, 0)
      .set(q('.nx'), { opacity: 1 }, .5)
      .to(q('.goo'), { yPercent: 160, duration: .45, ease: 'power2.in' }, .55)
      .from(s.querySelectorAll('.nx .nc'), { y: -40, stagger: .05, duration: .3, ease: 'back.out(1.8)' }, .7);
    return tl;
  };

  LABS['c-pop'] = s => {
    const spots = [[-6, -10, 46], [30, -18, 44], [64, -8, 44], [-10, 30, 44], [24, 26, 48], [60, 30, 46], [84, 22, 36], [-4, 66, 44], [32, 64, 44], [66, 66, 46]];
    const bubbles = spots.map(([l, t, w], i) => img(`bubble-${(i % 10) + 1}`, `left:${l}%; top:${t}%; width:${w}%`, 'abs bb')).join('');
    const q = mount(s, hero() + next('nx') + `<div class="layer">${bubbles}</div>`);
    gsap.set(q('.nx'), { opacity: 0 });
    const bbs = s.querySelectorAll('.bb');
    const tl = gsap.timeline({ paused: true });
    tl.fromTo(bbs, { scale: 0, rotate: () => gsap.utils.random(-60, 60) }, { scale: 1.25, rotate: 0, duration: .3, ease: 'back.out(1.6)', stagger: .018 }, 0)
      .set(q('.nx'), { opacity: 1 }, .48)
      .to(bbs, { keyframes: [{ scale: 1.5, duration: .04 }, { scale: 0, opacity: 0, duration: .06 }], stagger: { each: .035, from: 'random' } }, .52)
      .from(s.querySelectorAll('.nx .nc'), { scale: .8, opacity: 0, stagger: .05, duration: .25, ease: 'back.out(2)' }, .72);
    return tl;
  };

  LABS['c-morph'] = s => {
    const q = mount(s, `<div class="layer tint" style="background:#FFF1E3">
      <span class="abs wa" style="left:0; right:0; top:4%; text-align:center; font:800 clamp(3.4rem,11vw,7.5rem)/1 ${DISPLAY}; letter-spacing:-.06em; font-variation-settings:'wdth' 75; color:#FF7A00; opacity:.22">Orange</span>
      <span class="abs wbd" style="left:0; right:0; top:4%; text-align:center; font:800 clamp(3.4rem,11vw,7.5rem)/1 ${DISPLAY}; letter-spacing:-.06em; font-variation-settings:'wdth' 75; color:#7CC400; opacity:.22">Lime</span>
      ${img('blob-orange', 'width:44%; left:28%; top:14%', 'abs ba')}${img('blob-green', 'width:44%; left:28%; top:14%', 'abs bg2')}
      ${img('cup-orange', 'height:78%; left:38%; top:12%', 'abs ca')}${img('cup-green', 'height:78%; left:38%; top:12%', 'abs cb')}
    </div>`);
    const tl = gsap.timeline({ paused: true });
    tl.fromTo(q('.tint'), { backgroundColor: '#FFF1E3' }, { backgroundColor: '#F3FFD9', duration: .45, ease: 'power2.inOut' }, .2)
      .fromTo(q('.wa'), { yPercent: 0 }, { yPercent: -120, duration: .3, ease: 'power2.in' }, .1)
      .fromTo(q('.wbd'), { yPercent: 120 }, { yPercent: 0, duration: .4, ease: 'expo.out' }, .4)
      .fromTo(q('.ba'), { scaleX: 1, scaleY: 1, opacity: 1 }, { scaleX: 1.35, scaleY: .55, opacity: 0, duration: .3, ease: 'power2.in' }, .1)
      .fromTo(q('.bg2'), { scale: .3, opacity: 0 }, { scale: 1, opacity: 1, duration: .5, ease: 'elastic.out(1, .4)' }, .35)
      .fromTo(q('.ca'), { y: 0, rotate: 0, opacity: 1 }, { y: -80, rotate: -25, opacity: 0, duration: .28, ease: 'power2.in' }, .08)
      .fromTo(q('.cb'), { y: 90, scale: .6, opacity: 0 }, { y: 0, scale: 1, opacity: 1, duration: .45, ease: 'back.out(2.2)' }, .42);
    return tl;
  };

  LABS['c-zoom'] = s => {
    const q = mount(s, next('nx') + img('squeeze', 'width:46%; left:27%; top:8%', 'abs sq') + mani('mm'));
    gsap.set(q('.mm'), { opacity: 0 });
    const tl = gsap.timeline({ paused: true });
    tl.to(s.querySelectorAll('.nx .nc'), { y: 40, opacity: 0, stagger: .04, duration: .2 }, 0)
      .fromTo(q('.sq'), { scale: 0, rotate: -30 }, { scale: 1, rotate: 0, duration: .25, ease: 'back.out(1.8)' }, .05)
      .to(q('.sq'), { scale: 16, duration: .45, ease: 'power2.in', transformOrigin: '50% 34%' }, .32)
      .to(q('.mm'), { opacity: 1, duration: .14 }, .66)
      .from(q('.mm .mw'), { rotate: -180, scale: .5, duration: .3, ease: 'expo.out' }, .7);
    return tl;
  };

  LABS['c-ribbonwipe'] = s => {
    const q = mount(s, mani() + outro('ot') + img('ribbon', 'width:130%; left:-15%; top:18%', 'abs rb'));
    const tl = gsap.timeline({ paused: true });
    tl.fromTo(q('.ot'), { clipPath: 'polygon(0% 0%, -40% 0%, -70% 100%, 0% 100%)' }, { clipPath: 'polygon(0% 0%, 170% 0%, 140% 100%, 0% 100%)', duration: .8, ease: 'power1.inOut' }, .1)
      .fromTo(q('.rb'), { xPercent: -95, yPercent: 30, rotate: -12, scale: 1.6 }, { xPercent: 95, yPercent: -30, rotate: 8, scale: 1.6, duration: .9, ease: 'power1.inOut' }, 0)
      .to(q('.rb'), { opacity: 0, duration: .1 }, .9);
    return tl;
  };

  /* ---------- motion demos ---------- */
  DEMOS['c-wobble'] = s => {
    const q = mount(s, `<div class="abs wr" style="width:62%; left:19%; top:8%; cursor:pointer">${img('blob-orange', 'position:relative; width:100%', 'bl')}</div><span class="hint">Click the blob to poke it</span>`);
    loop(s, () => gsap.to(q('.bl'), { scaleX: 1.06, scaleY: .94, rotate: 3, duration: 1.4, yoyo: true, repeat: -1, ease: 'sine.inOut' }));
    q('.wr').addEventListener('click', () => {
      gsap.timeline().to(q('.wr'), { scaleX: 1.28, scaleY: .72, duration: .12, ease: 'power2.out' }).to(q('.wr'), { scaleX: 1, scaleY: 1, duration: 1, ease: 'elastic.out(1.1, .25)' });
      burstAt(s, .5, .45, ['#FF7A00', '#FFB25A', '#FFFFFF'], 24, .9, { round: true, gravity: .2 });
    });
    return () => gsap.fromTo(q('.wr'), { scale: 0 }, { scale: 1, duration: 1.2, ease: 'elastic.out(1, .35)' });
  };

  DEMOS['c-jelly'] = s => {
    const q = mount(s, `${img('blob-yellow', 'width:56%; left:22%; top:16%', 'abs')}${img('cup-orange', 'height:78%; left:36%; top:14%', 'abs cp')}${img('bubble-9', 'width:10%; left:30%; top:30%', 'abs b1')}${img('bubble-7', 'width:12%; left:58%; top:24%', 'abs b2')}${img('bubble-10', 'width:8%; left:66%; top:44%', 'abs b3')}`);
    const bubs = [q('.b1'), q('.b2'), q('.b3')];
    return () => gsap.timeline()
      .set(bubs, { scale: 0, y: 0, opacity: 1 })
      .fromTo(q('.cp'), { y: -s.offsetHeight * 1.2, rotate: -30, scaleX: 1, scaleY: 1 }, { y: 0, rotate: 0, duration: .55, ease: 'power3.in' })
      .add(() => burstAt(s, .5, .32, JUICE.candy, 26, 1), .55)
      .to(q('.cp'), { scaleY: .78, scaleX: 1.18, transformOrigin: '50% 100%', duration: .1, ease: 'power2.out' }, .55)
      .to(q('.cp'), { scaleY: 1, scaleX: 1, duration: 1.2, ease: 'elastic.out(1.1, .28)' }, .65)
      .to(bubs, { scale: 1, y: -40, duration: .6, ease: 'back.out(2)', stagger: .08 }, .62)
      .to(bubs, { opacity: 0, y: -90, duration: .5, stagger: .08 }, 1.3);
  };

  DEMOS['c-button'] = s => {
    const q = mount(s, `<div class="abs" style="inset:0; display:grid; place-items:center"><span class="mg" style="display:inline-block"><button class="b-main bt" type="button">Order for pickup →</button></span></div>${img('bubble-8', 'width:9%; left:22%; top:24%', 'abs ob')}${img('bubble-6', 'width:12%; right:20%; top:56%', 'abs ob')}<span class="hint">${fine ? 'Hover near it, then click' : 'Tap it'}</span>`);
    const mg = q('.mg'), xTo = gsap.quickTo(mg, 'x', { duration: .5, ease: 'power3' }), yTo = gsap.quickTo(mg, 'y', { duration: .5, ease: 'power3' });
    s.addEventListener('pointermove', e => { const r = mg.getBoundingClientRect(); xTo((e.clientX - r.left - r.width / 2) * .35); yTo((e.clientY - r.top - r.height / 2) * .35); });
    s.addEventListener('pointerleave', () => { xTo(0); yTo(0); });
    q('.bt').addEventListener('click', e => {
      gsap.timeline().to(q('.bt'), { scaleX: 1.12, scaleY: .82, duration: .1 }).to(q('.bt'), { scaleX: 1, scaleY: 1, duration: .9, ease: 'elastic.out(1.2, .3)' });
      const r = q('.bt').getBoundingClientRect(); RRD.burst(r.left + r.width / 2, r.top + 4, JUICE.candy, 30, .9);
    });
    loop(s, () => s.querySelectorAll('.ob').forEach((b, i) => gsap.to(b, { y: i ? 12 : -12, duration: 1.8 + i * .4, yoyo: true, repeat: -1, ease: 'sine.inOut' })));
    return () => gsap.fromTo(q('.bt'), { scale: 0 }, { scale: 1, duration: 1, ease: 'elastic.out(1.1, .35)' });
  };

  DEMOS['c-glare'] = s => {
    const q = mount(s, `<article class="pcard abs gc" style="left:50%; top:50%; width:48%; transform:translate(-50%,-50%)"><div class="st" style="height:auto; aspect-ratio:1/1; --fc:#FFF9DB">${img('blob-yellow', '', 'bl')}<img class="cupi" src="assets/cup-mango.webp" alt=""></div><div class="bd" style="padding-bottom:14px"><h5 style="font-size:1.3rem">Gold Rush</h5></div><div class="glare"></div></article><span class="hint">${fine ? 'Move over the card' : 'Drag across the card'}</span>`);
    const c = q('.gc');
    gsap.set(c, { xPercent: -50, yPercent: -50, x: 0, y: 0, transformPerspective: 800, left: '50%', top: '50%' }); c.style.transform = '';
    gsap.set(c, { xPercent: -50, yPercent: -50 });
    const rx = gsap.quickTo(c, 'rotationX', { duration: .5, ease: 'power3' }), ry = gsap.quickTo(c, 'rotationY', { duration: .5, ease: 'power3' });
    s.addEventListener('pointermove', e => { const r = c.getBoundingClientRect(), px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height; ry((px - .5) * 22); rx(-(py - .5) * 22); c.style.setProperty('--gx', px * 100 + '%'); c.style.setProperty('--gy', py * 100 + '%'); });
    s.addEventListener('pointerleave', () => { rx(0); ry(0); });
    return () => gsap.timeline().fromTo(c, { '--gx': '0%', '--gy': '10%', rotationY: -14 }, { '--gx': '100%', '--gy': '60%', rotationY: 14, duration: 1.2, ease: 'power2.inOut' }).to(c, { rotationY: 0, '--gx': '30%', '--gy': '20%', duration: .8, ease: 'elastic.out(1, .5)' });
  };

  DEMOS['c-bubbles'] = s => {
    const spots = [[8, 20, 16, '#FF3D6E'], [30, 52, 12, '#8ED100'], [46, 14, 18, '#FF7A00'], [66, 46, 14, '#FFC400'], [80, 12, 10, '#FF3D6E'], [14, 62, 10, '#FFC400'], [56, 66, 9, '#8ED100'], [86, 62, 12, '#FF7A00']];
    const q = mount(s, spots.map(([l, t, w], i) => `<div class="abs bw" style="left:${l}%; top:${t}%; width:${w}%; cursor:pointer">${img(`bubble-${i + 1}`, 'position:relative; width:100%', 'bi')}</div>`).join('') + `<span class="hint">Click a bubble to pop it</span>`);
    const ws = [...s.querySelectorAll('.bw')];
    loop(s, () => ws.forEach((w, i) => gsap.to(w.firstElementChild, { y: i % 2 ? -14 : 14, x: i % 3 ? 6 : -6, duration: 1.8 + (i % 4) * .4, yoyo: true, repeat: -1, ease: 'sine.inOut' })));
    ws.forEach((w, i) => w.addEventListener('click', () => {
      if (w.dataset.popping) return; w.dataset.popping = '1';
      const r = w.getBoundingClientRect(); RRD.burst(r.left + r.width / 2, r.top + r.height / 2, [spots[i][3], '#FFFFFF'], 18, .8, { round: true, gravity: .25 });
      gsap.timeline({ onComplete: () => { delete w.dataset.popping; } }).to(w, { scale: 1.3, duration: .07 }).to(w, { scale: 0, opacity: 0, duration: .1 }).set(w, { opacity: 1 }, '+=.7').to(w, { scale: 1, duration: .8, ease: 'elastic.out(1, .4)' });
    }));
    return () => gsap.fromTo(ws, { y: () => s.offsetHeight, scale: .4 }, { y: 0, scale: 1, opacity: 1, duration: 1.2, ease: 'expo.out', stagger: .07 });
  };

  DEMOS['c-world'] = s => {
    const q = mount(s, `<div class="layer tint" style="background:#FFF1E3"><span class="abs wd" style="left:0; right:0; top:2%; text-align:center; font:800 clamp(3rem,10vw,6.4rem)/1 ${DISPLAY}; letter-spacing:-.06em; font-variation-settings:'wdth' 75; color:#FF7A00; opacity:.25">Orange</span>${img('blob-orange', 'width:52%; left:24%; top:12%', 'abs bl')}${img('cup-orange', 'height:70%; left:38%; top:12%', 'abs cp')}
      <div class="abs" style="left:0; right:0; bottom:5%; display:flex; justify-content:center; gap:6px; flex-wrap:wrap">${WORLDS.map((w, i) => `<button type="button" class="pill ck" data-i="${i}" style="border:0; cursor:pointer; background:#fff; box-shadow:inset 0 0 0 2px ${w.word}">${w.name}</button>`).join('')}</div></div>`);
    let cur = 0;
    const go = i => {
      if (i === cur) return; cur = i; const w = WORLDS[i];
      gsap.timeline()
        .to(q('.bl'), { scaleX: 1.3, scaleY: .6, opacity: 0, duration: .2, ease: 'power2.in' })
        .to(q('.cp'), { y: -50, rotate: -20, opacity: 0, duration: .2, ease: 'power2.in' }, 0)
        .to(q('.wd'), { yPercent: -100, opacity: 0, duration: .2 }, 0)
        .add(() => { q('.bl').src = `assets/${w.blob}.webp`; q('.cp').src = `assets/${w.cup}.webp`; q('.wd').textContent = w.name; q('.wd').style.color = w.word; })
        .to(q('.tint'), { backgroundColor: w.tint, duration: .5 }, .15)
        .fromTo(q('.bl'), { scale: .3, opacity: 0 }, { scaleX: 1, scaleY: 1, scale: 1, opacity: 1, duration: .9, ease: 'elastic.out(1, .4)' }, .22)
        .fromTo(q('.cp'), { y: 80, scale: .6, rotate: 0, opacity: 0 }, { y: 0, scale: 1, opacity: 1, duration: .6, ease: 'back.out(2.2)' }, .28)
        .fromTo(q('.wd'), { yPercent: 100, opacity: 0 }, { yPercent: 0, opacity: .25, duration: .5, ease: 'expo.out' }, .3)
        .add(() => burstAt(s, .5, .4, w.juice, 20, .8), .3);
    };
    s.querySelectorAll('.ck').forEach(b => b.addEventListener('click', () => go(+b.dataset.i)));
    return () => gsap.timeline().call(() => go(1)).call(() => go(2), null, 1.1).call(() => go(3), null, 2.2).call(() => go(0), null, 3.3);
  };

  DEMOS['c-drip'] = s => {
    const q = mount(s, `${img('drip', 'left:0; top:0; width:100%', 'abs dr')}<span class="abs" style="left:0; right:0; bottom:12%; text-align:center; font:800 clamp(2.2rem,7vw,4rem)/1 ${DISPLAY}; letter-spacing:-.06em; font-variation-settings:'wdth' 75; color:#FF3D6E">RussRuss</span>`);
    return () => gsap.timeline().fromTo(q('.dr'), { scaleY: .1, transformOrigin: '50% 0%' }, { scaleY: 1, duration: 1.8, ease: 'power2.inOut' }).to(q('.dr'), { scaleY: .94, duration: .5, yoyo: true, repeat: 3, ease: 'sine.inOut' });
  };

  DEMOS['c-ribbon'] = s => {
    const q = mount(s, `${img('ribbon', 'width:94%; left:3%; top:18%', 'abs rb')}`);
    loop(s, () => gsap.to(q('.rb'), { y: -10, rotate: 2, duration: 2.2, yoyo: true, repeat: -1, ease: 'sine.inOut' }));
    return () => gsap.fromTo(q('.rb'), { clipPath: 'inset(0% 100% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.4, ease: 'power2.inOut' });
  };

  DEMOS['c-squeeze'] = s => {
    const q = mount(s, `<div class="abs gl" style="width:60%; aspect-ratio:1; left:20%; top:6%; border-radius:50%; background:radial-gradient(circle, rgba(255,160,0,.45), rgba(255,160,0,0) 65%)"></div>${img('squeeze', 'width:62%; left:19%; top:8%', 'abs sq')}`);
    loop(s, () => gsap.to(q('.gl'), { scale: 1.12, opacity: .7, duration: 1.4, yoyo: true, repeat: -1, ease: 'sine.inOut' }));
    return () => gsap.fromTo(q('.sq'), { scale: .3, rotate: -24 }, { scale: 1, rotate: 0, duration: 1.5, ease: 'elastic.out(1, .4)' });
  };

  DEMOS['c-lime'] = s => {
    const q = mount(s, `${img('lime-wheel', 'width:40%; left:6%; top:18%', 'abs lw')}<div class="abs" style="left:52%; top:24%; right:6%"><span class="cn" style="font:800 clamp(3.6rem,10vw,6.4rem)/.85 ${DISPLAY}; letter-spacing:-.06em; --f:0%; font-variation-settings:'wdth' var(--wd, 75); background:linear-gradient(to top, #8ED100 var(--f), #EEFBD2 var(--f)); -webkit-background-clip:text; background-clip:text; color:transparent">0</span><p style="font:700 .95rem/1.3 ${BODY}; color:#2A0A1C; margin-top:10px">hours, then it's gone</p></div>`);
    return () => { const o = { v: 0 }; gsap.timeline().fromTo(q('.lw'), { rotate: 0 }, { rotate: 360, duration: 1.4, ease: 'power3.out' }).fromTo(o, { v: 0 }, { v: 72, duration: 1.2, ease: 'power2.out', onUpdate: () => { q('.cn').textContent = Math.round(o.v); } }, 0).fromTo(q('.cn'), { '--f': '0%', '--wd': 75 }, { '--f': '100%', '--wd': 100, duration: 1.2, ease: 'power2.inOut' }, .1); };
  };
})();
