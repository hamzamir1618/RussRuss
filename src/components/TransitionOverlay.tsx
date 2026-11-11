import { forwardRef, useImperativeHandle, useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { cover as coverScale, gsap } from '../lib/motion';
import { burst, JUICE } from '../lib/burst';
import { wavePath } from '../lib/wave';
import { juiceById } from '../data/menu';
import { labelOf, type Point, type Route, type Transition } from '../lib/router';

export interface OverlayHandle {
  /** Covers the screen. Resolves once nothing of the old page shows. */
  cover: (kind: Transition, to: Route, from?: Point) => Promise<void>;
  uncover: (kind: Transition) => Promise<void>;
}

const WAVE_TOP = wavePath(2600, 120, 40, 22, 260);
const BANDS = ['#FF2E7E', '#FF6A13', '#FFC300'];

/**
 * Full-screen scene changes between pages, built from the approved landing-page moves:
 * awning  the striped awning drops with a bounce, then rolls back up
 * orange  an orange half spins out of the click and grows through the camera; sunflower fills behind it
 * pour    the chosen cup lifts off its card while its juice colour floods out, then lands on the juice page
 * sun     a sun with turning rays rises from the bottom and leaves through the top
 * wave    the pink, tangerine and sunflower waves roll up the screen and keep going
 * splash  pink floods out of the button with a juice burst, and a stamp lands
 * Never put a CSS transform on these elements (GSAP owns them); start states are set here.
 */
export const TransitionOverlay = forwardRef<OverlayHandle>(function TransitionOverlay(_, ref) {
  const root = useRef<HTMLDivElement>(null);
  const flyer = useRef<HTMLImageElement | null>(null);

  // The overlay owns its animations, so a transition started from a page doesn't die when that page unmounts.
  const { contextSafe } = useGSAP(() => {
    gsap.set('.tx-awn', { yPercent: -105 });
    gsap.set('.tx-orange', { xPercent: -50, yPercent: -50, scale: 0, autoAlpha: 0 });
    gsap.set('.tx-fill, .tx-pour, .tx-sun, .tx-splash', { clipPath: 'circle(0% at 50% 50%)' });
    gsap.set('.tx-band', { yPercent: 110 });
    gsap.set('.tx-label, .tx-stamp', { autoAlpha: 0 });
  }, { scope: root });

  const q = (s: string) => root.current!.querySelector<HTMLElement>(s)!;
  const at = (from?: Point) => [from?.clientX ?? innerWidth / 2, from?.clientY ?? innerHeight / 2];

  const labelIn = (to: Route) => {
    const l = q('.tx-label'), [kick, word] = labelOf(to.view, to.param);
    l.querySelector('.kick')!.textContent = kick;
    l.querySelector('.tx-word')!.textContent = word;
    return gsap.timeline()
      .set(l, { autoAlpha: 1, scale: 1 })
      .fromTo(l.querySelector('.tx-word'), { scale: 0.4, rotation: -14, autoAlpha: 0 }, { scale: 1, rotation: -4, autoAlpha: 1, duration: 0.55, ease: 'back.out(2.2)' })
      .fromTo(l.querySelector('.kick'), { y: 20, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.3, ease: 'power3.out' }, '-=.4');
  };
  const labelOut = () => gsap.to(q('.tx-label'), { autoAlpha: 0, scale: 1.25, duration: 0.25, ease: 'power2.in' });

  useImperativeHandle(ref, () => {
    const api: OverlayHandle = {
      async cover(kind, to, from) {
        root.current!.classList.add('on');
        const tl = gsap.timeline();
        const [x, y] = at(from);

        if (kind === 'awning') {
          tl.fromTo('.tx-awn', { yPercent: -105 }, { yPercent: 0, duration: 0.75, ease: 'back.out(1.2)' })
            .add(labelIn(to), '-=.35');
        } else if (kind === 'orange') {
          const o = q('.tx-orange');
          gsap.set(o, { left: x, top: y });
          tl.fromTo(o, { scale: 0.2, rotation: -200, autoAlpha: 1 }, { scale: () => coverScale(o.offsetWidth), rotation: 160, duration: 0.85, ease: 'power3.in' })
            .fromTo('.tx-fill', { clipPath: `circle(0% at ${x}px ${y}px)` }, { clipPath: `circle(150% at ${x}px ${y}px)`, duration: 0.5, ease: 'power2.in' }, 0.4)
            .add(labelIn(to), '-=.15');
        } else if (kind === 'pour') {
          const juice = juiceById(to.param);
          const sheet = q('.tx-pour');
          sheet.style.background = juice?.tint ?? 'var(--sun)';
          // fly the cup that was clicked, or a fresh one from the click point
          const src = (from?.target as Element | null | undefined)?.closest?.('[data-juice]')?.querySelector<HTMLImageElement>('.pour-src');
          const f = document.createElement('img');
          f.className = 'tx-flyer';
          f.alt = '';
          f.src = src?.currentSrc || juice?.cup || '/img/cup-orange.webp';
          const r = src?.getBoundingClientRect() ?? new DOMRect(x - 40, y - 60, 80, 120);
          gsap.set(f, { left: r.left, top: r.top, width: r.width, height: r.height });
          root.current!.appendChild(f);
          flyer.current = f;
          if (src) gsap.set(src, { autoAlpha: 0 });
          const h = Math.min(innerHeight * 0.62, innerWidth * 0.9), w = h * (2 / 3);
          tl.fromTo(sheet, { clipPath: `circle(0% at ${x}px ${y}px)` }, { clipPath: `circle(150% at ${x}px ${y}px)`, duration: 0.65, ease: 'power3.in' }, 0)
            .to(f, { left: innerWidth / 2 - w / 2, top: innerHeight / 2 - h / 2, width: w, height: h, rotation: -10, duration: 0.7, ease: 'power3.inOut' }, 0)
            .to(f, { rotation: 0, duration: 0.35, ease: 'back.out(3)' })
            .add(() => { if (juice) burst(innerWidth / 2, innerHeight / 2 - h * 0.3, juice.juice, 26, 1); }, '-=.3');
        } else if (kind === 'sun') {
          tl.fromTo('.tx-sun', { clipPath: 'circle(0% at 50% 115%)' }, { clipPath: 'circle(150% at 50% 115%)', duration: 0.8, ease: 'power3.in' })
            .fromTo('.tx-sun .rays', { rotation: -60 }, { rotation: 0, duration: 1.4, ease: 'power2.out' }, 0)
            .add(labelIn(to), '-=.2');
        } else if (kind === 'wave') {
          tl.fromTo('.tx-band', { yPercent: 110 }, { yPercent: 0, duration: 0.75, ease: 'power2.inOut', stagger: 0.12 })
            .add(labelIn(to), '-=.25');
        } else if (kind === 'splash') {
          const st = q('.tx-stamp');
          tl.add(() => burst(x, y, JUICE.party, 44, 1.3))
            .fromTo('.tx-splash', { clipPath: `circle(0% at ${x}px ${y}px)` }, { clipPath: `circle(150% at ${x}px ${y}px)`, duration: 0.6, ease: 'power3.in' }, 0)
            .fromTo(st, { scale: 3.2, rotation: -30, autoAlpha: 0 }, { scale: 1, rotation: -8, autoAlpha: 1, duration: 0.32, ease: 'power4.in' })
            .add(() => burst(innerWidth / 2, innerHeight / 2, JUICE.citrus, 30, 1.1))
            .fromTo(st, { x: -12 }, { x: 0, duration: 0.6, ease: 'elastic.out(1,.25)' })
            .to({}, { duration: 0.1 });
        }
        tl.to({}, { duration: 0.15 });
        await tl.then(() => undefined);
      },

      async uncover(kind) {
        const tl = gsap.timeline({ onComplete: () => root.current?.classList.remove('on') });
        if (kind === 'pour') {
          const f = flyer.current, dest = document.querySelector<HTMLElement>('.pour-dest');
          flyer.current = null;
          if (f && dest) {
            gsap.set(dest, { autoAlpha: 0 });
            const t = dest.getBoundingClientRect(), cx = t.left + t.width / 2, cy = t.top + t.height / 2;
            tl.to(f, { left: t.left, top: t.top, width: t.width, height: t.height, duration: 0.75, ease: 'power3.inOut' }, 0)
              .to('.tx-pour', { clipPath: `circle(0% at ${cx}px ${cy}px)`, duration: 0.75, ease: 'power3.inOut' }, 0.1)
              .add(() => { gsap.set(dest, { autoAlpha: 1 }); f.remove(); });
          } else {
            f?.remove();
            tl.to('.tx-pour', { clipPath: 'circle(0% at 50% 50%)', duration: 0.6, ease: 'power3.inOut' });
          }
          await tl.then(() => undefined);
          return;
        }
        if (kind === 'splash') {
          tl.to('.tx-stamp', { scale: 0.6, autoAlpha: 0, duration: 0.25, ease: 'power2.in' })
            .to('.tx-splash', { clipPath: 'circle(0% at 50% 120%)', duration: 0.7, ease: 'power3.inOut' }, '-=.1');
          await tl.then(() => undefined);
          return;
        }
        tl.add(labelOut());
        if (kind === 'awning') {
          tl.to('.tx-awn', { yPercent: -105, duration: 0.7, ease: 'power3.inOut' }, '-=.1');
        } else if (kind === 'orange') {
          tl.to('.tx-orange', { scale: () => coverScale(q('.tx-orange').offsetWidth) * 2, rotation: 400, autoAlpha: 0, duration: 0.6, ease: 'power2.in' }, '-=.15')
            .to('.tx-fill', { clipPath: 'circle(0% at 50% 50%)', duration: 0.7, ease: 'power3.inOut' }, '<.1');
        } else if (kind === 'sun') {
          tl.to('.tx-sun', { clipPath: 'circle(0% at 50% -15%)', duration: 0.8, ease: 'power3.inOut' }, '-=.1')
            .to('.tx-sun .rays', { rotation: 60, duration: 0.8, ease: 'power2.in' }, '<');
        } else if (kind === 'wave') {
          tl.to([...root.current!.querySelectorAll('.tx-band')].reverse(), { yPercent: -125, duration: 0.75, ease: 'power2.in', stagger: 0.1 }, '-=.1')
            .set('.tx-band', { yPercent: 110 });
        }
        await tl.then(() => undefined);
      },
    };
    return { cover: contextSafe(api.cover), uncover: contextSafe(api.uncover) };
  });

  return (
    <div className="tx" ref={root} aria-hidden="true">
      <div className="tx-awn" />
      <div className="tx-fill" />
      <img className="tx-orange" src="/img/orange-half.webp" alt="" />
      <div className="tx-pour" />
      <div className="tx-sun"><div className="rays" /></div>
      {BANDS.map(c => (
        <div key={c} className="tx-band" style={{ background: c }}>
          <svg viewBox="0 0 2000 120" preserveAspectRatio="none"><path d={WAVE_TOP} fill={c} /></svg>
        </div>
      ))}
      <div className="tx-splash" />
      <div className="tx-stamp"><span>Pressed!</span></div>
      <div className="tx-label"><p className="kick" /><p className="tx-word stripe" /></div>
    </div>
  );
});
