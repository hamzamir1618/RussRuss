import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { clamp, cover, gsap, NARROW, RM } from '../lib/motion';
import { burstFrom, JUICE } from '../lib/burst';
import { STEPS, type Step } from '../data/steps';
import { STEPS_HEAD } from '../data/copy';
import { Chars } from '../components/Chars';
import { Sticker } from '../components/Sprite';
import { MascotSlot } from '../components/MascotSlot';
import { mascot, type Move } from '../lib/mascot';

/** What the rabbit does at each step: pick (excited), cut (curious), press (squashes down), pour (a little dance). */
const STEP_MOVES: Move[] = ['cheers', 'tilt', 'stomp', 'dance'];

/** The photo inside each circular frame. The press photo is cropped to its spout so its own cut-off edges disappear. */
function Photo({ id }: { id: Step['id'] }) {
  if (id === 'pick') return (
    <div className="trio">
      <img src="/img/melon.webp" alt="" style={{ left: '6%', top: '14%', width: '44%', rotate: '-14deg' }} />
      <img src="/img/pineapple.webp" alt="" style={{ right: '12%', top: '10%', width: '26%', rotate: '18deg' }} />
      <img src="/img/orange-half.webp" alt="" style={{ left: '28%', top: '40%', width: '40%' }} />
      <img src="/img/strawberry.webp" alt="" style={{ right: '10%', bottom: '12%', width: '28%', rotate: '-12deg' }} />
    </div>
  );
  if (id === 'cut') return <img className="ph-cut turn-26" src="/img/orange-half.webp" alt="A halved orange" />;
  if (id === 'press') return <img className="ph-press" src="/img/press.webp" alt="A hydraulic juice press pouring orange juice" />;
  return <img className="ph-pour" src="/img/cup-orange.webp" alt="A cup of Sun Up" />;
}

/** Circular frame: a turning text ring, two rings, and a round window over rays. */
function Frame({ step }: { step: Step }) {
  return (
    <div className="frame">
      <div className="frame-clip">
        {step.id !== 'press' && <div className="rays turn-60" />}
        <Photo id={step.id} />
      </div>
      <svg className="frame-ring turn-40" viewBox="0 0 200 200" aria-hidden="true">
        <circle cx="100" cy="100" r="79.5" fill="none" stroke={step.ringColor} strokeWidth="5" />
        <circle cx="100" cy="100" r="97" fill="none" stroke="#3B1E08" strokeWidth="1.2" strokeDasharray="1.5 5" strokeLinecap="round" />
        <text className="ring-txt"><textPath href="#ringP" textLength="556">{step.ring.repeat(3)}</textPath></text>
      </svg>
    </div>
  );
}

const fmt = (s: Step, v: number) => v.toFixed(s.decimals ?? 0) + (s.suffix ?? '');

/**
 * Pinned walkthrough. The orange rolls in from the corner and fills the screen, the steps open through its pith,
 * then four steps swap one at a time: frame wipes, number counts and fills, title rises and swells 300 → 800.
 */
export function Steps() {
  const root = useRef<HTMLElement>(null);

  useGSAP(() => {
    if (RM) return;
    const q = gsap.utils.selector(root);
    const mcs = q<HTMLElement>('.mc'), figs = q<HTMLElement>('.fig'), tabs = q<HTMLElement>('.step-tabs li'), cap = q('.fig-cap')[0], orange = q('.spin-orange')[0] as HTMLElement;
    const irisAt = () => (NARROW() ? '50% 20%' : '28% 50%');
    let step = 0;
    const setStep = (i: number) => {
      if (i === step) return;
      step = i;
      tabs.forEach((t, k) => t.classList.toggle('on', k === i));
      cap.textContent = STEPS[i].caption;
      mascot.react('steps', STEP_MOVES[i] ?? 'tilt');
    };

    // follow the timeline itself, not scroll events: with scrub the timeline keeps catching up after scrolling stops
    const tl = gsap.timeline({
      scrollTrigger: { trigger: root.current, start: 'top top', end: '+=420%', pin: true, scrub: 1, invalidateOnRefresh: true },
      onUpdate: () => setStep(clamp(Math.floor((tl.time() - 1) / 1.5), 0, STEPS.length - 1)),
    });
    tl.fromTo(orange, { x: () => innerWidth * 0.62, y: () => innerHeight * 0.5, scale: 0.3, rotation: -220 },
      { x: 0, y: 0, scale: () => cover(orange.offsetWidth), rotation: 360, ease: 'power2.in', duration: 0.75 }, 0)
      .to(orange, { autoAlpha: 0, duration: 0.15 }, 1.05)
      .fromTo('.mani', { clipPath: () => `circle(0% at ${irisAt()})` }, { clipPath: () => `circle(150% at ${irisAt()})`, ease: 'power2.inOut', duration: 0.6 }, 0.55)
      .fromTo('.figs', { scale: 0.2, rotation: -140 }, { scale: 1, rotation: 0, ease: 'power3.out', duration: 0.6 }, 0.65);

    mcs.forEach((m, i) => {
      const s = 1 + i * 1.5, st = STEPS[i], n = m.querySelector('.n') as HTMLElement, o = { v: 0 };
      if (i > 0) {
        tl.fromTo(mcs[i - 1], { autoAlpha: 1, y: 0 }, { autoAlpha: 0, y: -50, duration: 0.35, ease: 'power2.in', immediateRender: false }, s - 0.05)
          .fromTo(figs[i - 1], { clipPath: 'inset(0% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 100% 0%)', duration: 0.4, ease: 'power2.inOut', immediateRender: false }, s - 0.05)
          .fromTo(figs[i], { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.5, ease: 'power2.inOut' }, s + 0.1)
          .fromTo(figs[i].firstElementChild, { rotation: -30, scale: 0.8, y: 40 }, { rotation: 0, scale: 1, y: 0, duration: 0.9, ease: 'back.out(1.6)' }, s + 0.1);
      }
      tl.fromTo(m, { autoAlpha: 0, y: 40 }, { autoAlpha: 1, y: 0, duration: 0.3, ease: 'power2.out' }, s)
        .fromTo(m.querySelectorAll('.ch'), { yPercent: 110 }, { yPercent: 0, duration: 0.6, ease: 'expo.out', stagger: 0.012 }, s + 0.05)
        .fromTo(m.querySelector('.mc-title'), { '--w': 300 }, { '--w': 800, duration: 0.9, ease: 'power2.out' }, s + 0.1)
        .fromTo(o, { v: 0 }, { v: st.number, duration: 0.8, ease: 'power2.out', onUpdate: () => { n.textContent = fmt(st, o.v); } }, s + 0.1)
        .fromTo(n, { '--fill': '0%' }, { '--fill': '100%', duration: 0.8, ease: 'power2.inOut' }, s + 0.2);
      if (st.id === 'press') tl.call(() => burstFrom(figs[i], 0.5, 0.6, JUICE.citrus, 18, 0.7), undefined, s + 0.6);
    });
    tl.to({}, { duration: 0.5 });
  }, { scope: root });

  return (
    <section id="steps" className="mani-wrap" ref={root} aria-label={STEPS_HEAD}>
      {!RM && <img className="spin-orange" src="/img/orange-half.webp" alt="" aria-hidden="true" />}
      <div className="mani">
        <div className="mani-left">
          <div className="mani-decor" aria-hidden="true">
            <Sticker id="rainbow" className="deco" style={{ left: '6%', bottom: '6%', width: '44%' }} />
            <div className="deco halftone" style={{ right: '-10%', top: '-8%', width: '50%', aspectRatio: '1', color: '#FF2E7E' }} />
            <Sticker id="daisy" className="deco turn" color="#FF6A13" style={{ left: '8%', top: '10%', width: 44 }} />
            <Sticker id="daisy" className="deco turn" color="#FF2E7E" style={{ right: '10%', bottom: '16%', width: 52 }} />
            <Sticker id="sparkle" className="deco twinkle" color="#FFC300" style={{ left: '16%', top: '30%', width: 22 }} />
            <Sticker id="sparkle" className="deco twinkle d1" color="#FF2E7E" style={{ right: '16%', top: '22%', width: 30 }} />
            <Sticker id="sparkle" className="deco twinkle d2" color="#FF6A13" style={{ right: '6%', top: '50%', width: 18 }} />
            <Sticker id="squiggle" className="deco" color="#7ED321" style={{ left: '4%', top: '56%', width: 80, rotate: '-70deg' }} />
            <Sticker id="sunicon" className="deco turn" color="#FFC300" style={{ right: '22%', top: '6%', width: 48 }} />
          </div>
          <div className="figs">
            {STEPS.map(s => <div key={s.id} className={`fig fig-${s.id}`}><Frame step={s} /></div>)}
            <MascotSlot id="steps" />
          </div>
          <p className="fig-cap">{STEPS[0].caption}</p>
        </div>
        <div className="mani-right">
          <p className="kick pink mani-head">{STEPS_HEAD}</p>
          <ol className="step-tabs" aria-hidden="true">
            {STEPS.map((s, i) => <li key={s.id} className={i === 0 ? 'on' : ''}>{s.label}</li>)}
          </ol>
          <div className="mc-stack">
            {STEPS.map((s, i) => (
              <div key={s.id} className="mc">
                <p className="kick">Step {String(i + 1).padStart(2, '0')} · {s.label}</p>
                <div className="mc-num"><span className="n">{fmt(s, s.number)}</span><span className="unit">{s.unit}</span></div>
                <p className="mc-title" aria-label={s.title}><Chars text={s.title} /></p>
                <p className="mc-body">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
