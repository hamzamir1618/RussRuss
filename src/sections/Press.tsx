import { useRef, useState } from 'react';
import { useGSAP } from '@gsap/react';
import { clamp, FINE, gsap, RM, ScrollTrigger, vars } from '../lib/motion';
import { scrollToY, scrollY } from '../lib/scroll';
import { burstFrom } from '../lib/burst';
import { useBag } from '../lib/bag';
import { linkTo, useRouter } from '../lib/router';
import { MENU, money, type Juice } from '../data/menu';
import { PRESS } from '../data/copy';
import { Sticker } from '../components/Sprite';
import { MascotSlot } from '../components/MascotSlot';
import { mascot } from '../lib/mascot';

function Card({ juice, i }: { juice: Juice; i: number }) {
  const { add } = useBag();
  const { go } = useRouter();
  const [added, setAdded] = useState(false);
  const timer = useRef<number>();
  return (
    <div className="slot">
      <article className="card" data-juice style={vars({ '--fc': juice.tint })}>
        <div className="stage">
          <div className="rays turn-60" />
          <div className="stage-disc" />
          <Sticker id="sparkle" className={`stk twinkle ${['', 'd1', 'd2', ''][i]}`} color="#FFFFFF" />
          <div className="prod-pos"><img className="prod pour-src" src={juice.cup} alt={juice.name} /></div>
          {juice.garnish
            ? <img className="garn" src={juice.garnish} alt="" />
            : <Sticker id="leaf" className="garn garn-leaf" />}
        </div>
        <div className="card-body">
          <h3><a className="card-link" {...linkTo(go, 'juice', juice.id)}>{juice.name}</a></h3>
          <p>{juice.blurb}</p>
          <div className="stats">{juice.stats.map(s => <span key={s}>{s}</span>)}</div>
        </div>
        <div className="card-foot">
          <span className="price">{money(juice.sizes[0].price)}</span>
          <button
            className="btn sm" type="button"
            onClick={e => {
              add(juice.id);
              burstFrom(e.currentTarget, 0.5, 0, juice.juice, 28, 0.9);
              setAdded(true);
              clearTimeout(timer.current);
              timer.current = window.setTimeout(() => setAdded(false), 1200);
            }}
          >
            {added ? 'Added' : 'Add'}
          </button>
        </div>
      </article>
    </div>
  );
}

/**
 * Pinned horizontal row. Vertical scroll drives the track sideways; the giant Monoton word, the accent tint and
 * the counter follow the card in view; scroll speed skews the cards; each cup turns as it crosses the screen.
 */
export function Press() {
  const root = useRef<HTMLElement>(null);

  useGSAP(() => {
    if (RM) return;
    const q = gsap.utils.selector(root);
    const track = q('.track')[0] as HTMLElement, slots = q<HTMLElement>('.slot'), word = q('.reel-word span')[0], count = q('.reel-count')[0], bar = q('.progress span')[0], rider = q('.press-rider')[0] as HTMLElement;
    const dist = () => Math.max(0, track.scrollWidth - innerWidth);
    let active = 0;

    const setActive = (i: number) => {
      if (i === active) return;
      active = i;
      const j = MENU[i];
      gsap.to(root.current, { '--tint': j.tint, duration: 0.7, ease: 'power2.out', overwrite: 'auto' });
      gsap.killTweensOf(word);
      gsap.timeline()
        .to(word, { yPercent: -110, duration: 0.2, ease: 'power2.in' })
        .add(() => { word.textContent = j.word; })
        .fromTo(word, { yPercent: 110 }, { yPercent: 0, duration: 0.6, ease: 'expo.out' });
      count.textContent = `${String(i + 1).padStart(2, '0')} / ${String(MENU.length).padStart(2, '0')}`;
      mascot.react('press', i % 2 ? 'bounce' : 'hop');
    };

    const skew = gsap.quickTo(slots, 'skewX', { duration: 0.5, ease: 'power3' });
    const tilt = gsap.quickTo(slots, 'rotation', { duration: 0.5, ease: 'power3' });
    const row = gsap.to(track, {
      x: () => -dist(), ease: 'none',
      scrollTrigger: {
        trigger: root.current, start: 'top top', end: () => '+=' + Math.max(innerHeight * 1.5, dist() * 1.6), pin: true, scrub: 1, invalidateOnRefresh: true,
        onUpdate: self => {
          setActive(Math.min(MENU.length - 1, Math.floor(self.progress * MENU.length)));
          gsap.set(bar, { scaleX: self.progress });
          rider.style.setProperty('--rp', String(self.progress));
          const v = self.getVelocity();
          mascot.steer(v);
          skew(clamp(v / -260, -12, 12)); tilt(clamp(v / -500, -6, 6));
        },
      },
    });
    const settle = () => { skew(0); tilt(0); };
    ScrollTrigger.addEventListener('scrollEnd', settle);

    slots.forEach(s => {
      const st = { trigger: s, containerAnimation: row, start: 'left right', end: 'right left', scrub: true };
      gsap.fromTo(s.querySelector('.prod'), { rotation: -24, scale: 0.88 }, { rotation: 12, scale: 1.04, ease: 'none', scrollTrigger: st });
      gsap.fromTo(s.querySelector('.garn'), { rotation: -120, x: -40, y: 30 }, { rotation: 200, x: 30, y: -20, ease: 'none', scrollTrigger: { ...st } });
    });

    // cards lean toward the pointer
    if (FINE) q<HTMLElement>('.card').forEach(c => {
      gsap.set(c, { transformPerspective: 900 });
      const rx = gsap.quickTo(c, 'rotationX', { duration: 0.5, ease: 'power3' }), ry = gsap.quickTo(c, 'rotationY', { duration: 0.5, ease: 'power3' });
      c.addEventListener('pointermove', e => { const r = c.getBoundingClientRect(); ry(((e.clientX - r.left) / r.width - 0.5) * 16); rx(-((e.clientY - r.top) / r.height - 0.5) * 16); });
      c.addEventListener('pointerleave', () => { rx(0); ry(0); });
    });

    // drag the row with a mouse: moving sideways scrolls the page
    let drag: { x: number; y0: number } | null = null;
    const down = (e: PointerEvent) => { if (e.pointerType !== 'mouse' || e.button !== 0 || (e.target as Element).closest('button, a')) return; drag = { x: e.clientX, y0: scrollY() }; track.classList.add('dragging'); };
    const move = (e: PointerEvent) => { if (drag) scrollToY(drag.y0 - (e.clientX - drag.x) * 1.1, true); };
    const up = () => { drag = null; track.classList.remove('dragging'); };
    track.addEventListener('pointerdown', down);
    addEventListener('pointermove', move);
    addEventListener('pointerup', up);
    return () => { ScrollTrigger.removeEventListener('scrollEnd', settle); removeEventListener('pointermove', move); removeEventListener('pointerup', up); };
  }, { scope: root });

  return (
    <section id="press" className="reel" ref={root} style={vars({ '--tint': MENU[0].tint })}>
      <div className="reel-word" aria-hidden="true"><span>{MENU[0].word}</span></div>
      <div className="reel-decor" aria-hidden="true">
        <Sticker id="rainbow" className="deco" style={{ top: '6%', right: '4%', width: 'clamp(120px, 16vw, 240px)' }} />
        <Sticker id="sparkle" className="deco twinkle" color="#FFC300" style={{ top: '30%', right: '22%', width: 26 }} />
        <Sticker id="daisy" className="deco turn" color="#FF2E7E" style={{ top: '14%', left: '46%', width: 40 }} />
        <div className="deco halftone" style={{ left: '-4%', bottom: '-6%', width: '30vw', aspectRatio: '1', color: '#FF6A13' }} />
        <Sticker id="squiggle" className="deco" color="#7ED321" style={{ bottom: '14%', left: '38%', width: 90 }} />
      </div>
      <div className="reel-head">
        <h2 aria-label={PRESS.title}>
          <svg viewBox="0 0 1000 360" aria-hidden="true">
            {[['#FFC300', 12], ['#FF6A13', 8], ['#FF2E7E', 4]].map(([c, o]) => (
              <text key={o} className="arch" fill={c as string} transform={`translate(${o} ${o})`}><textPath href="#archP" startOffset="50%" textAnchor="middle">{PRESS.title}</textPath></text>
            ))}
            <text className="arch" fill="#FFF6E2" stroke="#3B1E08" strokeWidth="5" paintOrder="stroke"><textPath href="#archP" startOffset="50%" textAnchor="middle">{PRESS.title}</textPath></text>
          </svg>
        </h2>
        <span className="pill">{PRESS.sub}</span>
      </div>
      <span className="pill reel-count">01 / {String(MENU.length).padStart(2, '0')}</span>
      <div className="track" data-drag>
        {MENU.map((j, i) => <Card key={j.id} juice={j} i={i} />)}
      </div>
      <div className="progress" aria-hidden="true"><span /></div>
      <div className="press-rider"><MascotSlot id="press" /></div>
    </section>
  );
}
