/* RUSSRUSS design doc: wire demos, labs, embedded prototypes, asset kits and controls. */
(() => {
  const { $, $$, A, reduce, fine, DEMOS, LABS, burst, JUICE } = RRD;

  /* asset kits */
  const KIT_A = [
    ['cup-orange', 'Sun Up cup', 'Hero cup, product card, manifesto fig. 4'], ['cup-green', 'Garden Party cup', 'Product card'], ['cup-pink', 'Berry Beet cup', 'Product card'], ['cup-mango', 'Gold Rush cup', 'Product card'],
    ['orange-half', 'Orange half', 'Hero garnish, manifesto fig. 1 (spins)', 'spin'], ['splash', 'Sunburst splash', 'Behind the cup when it lands'], ['press', 'Juice press', 'Manifesto fig. 2'],
    ['melon', 'Watermelon wedge', 'Hero back layer'], ['strawberry', 'Strawberry', 'Hero front layer'], ['pineapple', 'Pineapple ring', 'Hero back layer, card'],
    ['sunset', 'Sunset', 'Fills the sun disc'], ['stand', 'Juice stand', 'Outro postcard, awning transition']
  ];
  const KIT_C = [
    ['blob-orange', 'Orange blob', 'Hero backdrop, orange world'], ['blob-green', 'Lime blob', 'Lime world, wipe'], ['blob-pink', 'Melon blob', 'Melon world, manifesto'], ['blob-yellow', 'Mango blob', 'Mango world, wipe'],
    ['gloss-1', 'Glossy strawberry', 'Hero front layer, card'], ['gloss-2', 'Glossy lime', 'Hero front layer, card'], ['gloss-3', 'Glossy cherries', 'Hero back layer, card'], ['gloss-4', 'Glossy orange segment', 'Hero front layer, card'],
    ['bubbles', 'Juice bubbles', 'Manifesto fig. 3, split into 10 singles for pops'], ['drip', 'Juice drip', 'Outro top edge, goo transition'], ['ribbon', 'Juice ribbon', 'Behind the product title, ribbon wipe'],
    ['squeeze', 'Squeeze moment', 'Manifesto fig. 2, squeeze zoom'], ['lime-wheel', 'Lime wheel', 'Manifesto fig. 1 (spins)', 'spin'], ['cup-pink', 'Cups (shared)', 'Same four cup photos as Sunburst']
  ];
  const kit = (el, list) => { el.innerHTML = list.map(([f, n, u, c]) => `<figure><div class="ph"><img class="${c || ''}" src="${A(f)}" alt="${n}" loading="lazy" style="${f === 'sunset' || f === 'stand' ? 'width:100%; height:100%; object-fit:cover; border-radius:12px' : ''}"></div><figcaption><b>${n}</b>${u}</figcaption></figure>`).join(''); };
  kit($('#kitA'), KIT_A); kit($('#kitC'), KIT_C);

  /* nav highlight */
  const tabs = $$('.tabs a');
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) tabs.forEach(t => t.classList.toggle('on', t.getAttribute('href') === '#' + e.target.id)); }), { rootMargin: '-40% 0px -55% 0px' });
  ['overview', 'sunburst', 'candy', 'build'].forEach(id => io.observe($('#' + id)));

  /* embedded prototypes */
  $$('[data-frame]').forEach(f => {
    const ifr = f.querySelector('iframe');
    const fit = () => f.style.setProperty('--k', f.clientWidth / 1440);
    fit(); new ResizeObserver(fit).observe(f);
    f.querySelector('.veil').addEventListener('click', () => { f.classList.add('live'); ifr.focus(); });
    f.querySelector('.release').addEventListener('click', () => f.classList.remove('live'));
  });

  /* type sliders */
  const bind = (id, target, prop) => { const i = $('#' + id), o = $('#' + id + 'o'); const set = () => { target.style.setProperty(prop, i.value); o.textContent = i.value; }; i.addEventListener('input', set); set(); };
  bind('aW', $('#aWeight'), '--wg'); bind('cWd', $('#cSpec'), '--wd'); bind('cWg', $('#cSpec'), '--wg');
  $('#cSpec').addEventListener('pointerenter', () => { if (!reduce) gsap.fromTo($('#cSpec'), { '--wd': 75 }, { '--wd': 100, duration: .35, yoyo: true, repeat: 1, ease: 'power2.out', onComplete: () => $('#cSpec').style.setProperty('--wd', $('#cWd').value) }); });

  /* motion tiles: play once in view, replay on demand */
  const seen = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { seen.unobserve(e.target); if (!reduce) e.target._run?.(); } }), { threshold: .45 });
  $$('[data-demo]').forEach(st => {
    const make = DEMOS[st.dataset.demo]; if (!make) return;
    st._run = make(st);
    st.closest('.mo').querySelector('.replay').addEventListener('click', () => st._run?.());
    seen.observe(st);
  });

  /* transition labs: scrub or play */
  $$('[data-lab]').forEach(st => {
    const make = LABS[st.dataset.lab]; if (!make) return;
    const tl = make(st).timeScale(.42);
    const lab = st.closest('.lab'), range = lab.querySelector('input'), out = lab.querySelector('output'), btn = lab.querySelector('.play');
    const sync = () => { const p = tl.progress(); range.value = Math.round(p * 1000); out.textContent = Math.round(p * 100) + '%'; };
    tl.eventCallback('onUpdate', sync);
    tl.eventCallback('onComplete', () => { btn.textContent = '▶'; btn.setAttribute('aria-label', 'Replay'); });
    range.addEventListener('input', () => { tl.pause(); btn.textContent = '▶'; tl.progress(range.value / 1000); });
    btn.addEventListener('click', () => {
      if (tl.isActive()) { tl.pause(); btn.textContent = '▶'; btn.setAttribute('aria-label', 'Play'); return; }
      if (tl.progress() >= 1) tl.restart(); else tl.play();
      btn.textContent = '❚❚'; btn.setAttribute('aria-label', 'Pause');
    });
    st._run = () => { tl.restart(); btn.textContent = '❚❚'; };
    seen.observe(st);
  });

  /* components */
  $$('[data-burst]').forEach(b => b.addEventListener('click', () => {
    const r = b.getBoundingClientRect(); burst(r.left + r.width / 2, r.top + 4, b.dataset.burst === 'a' ? JUICE.citrus : JUICE.candy, 30, .9);
    if (b.hasAttribute('data-squish') && !reduce) gsap.timeline().to(b, { scaleX: 1.12, scaleY: .82, duration: .1 }).to(b, { scaleX: 1, scaleY: 1, duration: .9, ease: 'elastic.out(1.2, .3)' });
  }));
  $$('[data-tilt]').forEach(c => {
    gsap.set(c, { transformPerspective: 900 });
    const rx = gsap.quickTo(c, 'rotationX', { duration: .5, ease: 'power3' }), ry = gsap.quickTo(c, 'rotationY', { duration: .5, ease: 'power3' });
    c.addEventListener('pointermove', e => {
      if (e.pointerType !== 'mouse') return;
      const r = c.getBoundingClientRect(), px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
      ry((px - .5) * 16); rx(-(py - .5) * 16);
      if (c.hasAttribute('data-glare')) { c.style.setProperty('--gx', px * 100 + '%'); c.style.setProperty('--gy', py * 100 + '%'); }
    });
    c.addEventListener('pointerleave', () => { rx(0); ry(0); });
  });
})();
