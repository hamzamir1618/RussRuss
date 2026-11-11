/* Sunburst Stand final doc: wire everything up. */
(() => {
  const { $, $$, A, reduce, DEMOS, LABS, burst, JUICE } = RRD;

  /* starburst polygons */
  $$('[data-star]').forEach(p => {
    const [n, r1, r2] = p.dataset.star.split(',').map(Number), pts = [];
    for (let i = 0; i < n * 2; i++) { const r = i % 2 ? r2 : r1, a = Math.PI * i / n - Math.PI / 2; pts.push((r * Math.cos(a)).toFixed(1) + ',' + (r * Math.sin(a)).toFixed(1)); }
    p.setAttribute('points', pts.join(' '));
  });

  /* asset kit */
  const KIT = [
    ['cup-orange', 'Sun Up cup', 'Hero cup, step 4, card'], ['cup-green', 'Garden Party cup', 'Card'], ['cup-pink', 'Berry Beet cup', 'Card'], ['cup-mango', 'Gold Rush cup', 'Card'],
    ['orange-half', 'Orange half', 'Hero garnish, step 2 (spins)', 'spin'], ['splash', 'Sunburst splash', 'Behind the cup when it lands'], ['press', 'Juice press', 'Step 3, cropped to the spout'],
    ['melon', 'Watermelon wedge', 'Hero, step 1'], ['strawberry', 'Strawberry', 'Hero, step 1, card'], ['pineapple', 'Pineapple ring', 'Hero, step 1, card'],
    ['sunset', 'Sunset', 'Inside the hero sun disc'], ['stand', 'Juice stand', 'Finale backdrop: cups land on its counter']
  ];
  $('#kitA').innerHTML = KIT.map(([f, n, u, c]) => `<figure><div class="ph"><img class="${c || ''}" src="${A(f)}" alt="${n}" loading="lazy" style="${f === 'sunset' || f === 'stand' ? 'object-fit:cover; border-radius:12px' : ''}"></div><figcaption><b>${n}</b>${u}</figcaption></figure>`).join('');
  RRD.decoKit($('#decoKit'));

  /* nav highlight */
  const tabs = $$('.tabs a');
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) tabs.forEach(t => t.classList.toggle('on', t.getAttribute('href') === '#' + e.target.id)); }), { rootMargin: '-40% 0px -55% 0px' });
  ['overview', 'type', 'voice', 'deco', 'made', 'motion', 'transitions', 'build'].forEach(id => io.observe($('#' + id)));

  /* embedded prototype */
  $$('[data-frame]').forEach(f => {
    const ifr = f.querySelector('iframe');
    const fit = () => f.style.setProperty('--k', f.clientWidth / 1440);
    fit(); new ResizeObserver(fit).observe(f);
    f.querySelector('.veil').addEventListener('click', () => { f.classList.add('live'); ifr.focus(); });
    f.querySelector('.release').addEventListener('click', () => f.classList.remove('live'));
  });

  /* play once in view */
  const seen = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { seen.unobserve(e.target); if (!reduce) e.target._run?.(); } }), { threshold: .45 });
  $$('[data-demo]').forEach(st => {
    const make = DEMOS[st.dataset.demo]; if (!make) return;
    st._run = make(st);
    st.closest('.mo').querySelector('.replay').addEventListener('click', () => st._run?.());
    seen.observe(st);
  });
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
  const comp = $('[data-composer]'); RRD.composer(comp);
  const steps = $('[data-steps]'); steps._run = RRD.steps(steps); seen.observe(steps);

  /* components */
  $$('[data-burst]').forEach(b => b.addEventListener('click', () => { const r = b.getBoundingClientRect(); burst(r.left + r.width / 2, r.top + 4, JUICE.citrus, 30, .9); }));
  $$('[data-tilt]').forEach(c => {
    gsap.set(c, { transformPerspective: 900 });
    const rx = gsap.quickTo(c, 'rotationX', { duration: .5, ease: 'power3' }), ry = gsap.quickTo(c, 'rotationY', { duration: .5, ease: 'power3' });
    c.addEventListener('pointermove', e => { if (e.pointerType !== 'mouse') return; const r = c.getBoundingClientRect(); ry(((e.clientX - r.left) / r.width - .5) * 16); rx(-((e.clientY - r.top) / r.height - .5) * 16); });
    c.addEventListener('pointerleave', () => { rx(0); ry(0); });
  });

  /* section titles: stripe peels in when reached */
  if (!reduce) $$('.sec-h.big h2').forEach(h => {
    const o = new IntersectionObserver(es => es.forEach(e => { if (!e.isIntersecting) return; o.disconnect(); gsap.fromTo(h, { y: 30, opacity: 0, rotation: -2 }, { y: 0, opacity: 1, rotation: 0, duration: 1, ease: 'back.out(1.8)' }); }), { threshold: .6 });
    o.observe(h);
  });
})();
