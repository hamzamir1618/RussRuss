import { useEffect, useRef, type CSSProperties, type ReactNode } from 'react';
import { useGSAP } from '@gsap/react';
import { clamp, FINE, gsap, NARROW, RM } from '../lib/motion';
import { linkTo, useRouter } from '../lib/router';
import { burstFrom, JUICE } from '../lib/burst';
import { HERO, WIPE } from '../data/copy';
import { Chars } from '../components/Chars';
import { RingText, Sticker } from '../components/Sprite';
import { Waves } from '../components/Waves';
import { MascotSlot } from '../components/MascotSlot';
import { mascot } from '../lib/mascot';

/**
 * A floating layer. Three wrappers so tweens never fight: .par (pointer depth) > .gs (scroll) > .gi (intro).
 * `back` layers sit behind the cup and drift away on scroll; front layers fly past the camera.
 */
function Layer({ d, back, style, children }: { d: number; back?: boolean; style: CSSProperties; children: ReactNode }) {
  return (
    <div className={`par ${back ? 'g-back' : 'g-front'}`} data-d={d} style={style}>
      <div className="gs"><div className="gi">{children}</div></div>
    </div>
  );
}

export function Hero({ revealed }: { revealed: boolean }) {
  const root = useRef<HTMLElement>(null);
  const intro = useRef<gsap.core.Timeline | null>(null);
  const { go } = useRouter();

  useGSAP(() => {
    const q = gsap.utils.selector(root);
    const cupIn = q('.cup-in')[0];

    // entrance, built paused (its start states hide everything) and played when the loader lifts
    if (!RM) {
      intro.current = gsap.timeline({ paused: true })
        .fromTo('.hero-bg-in', { scale: 1.2, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: 1.4, ease: 'expo.out' }, 0)
        .fromTo('.hl .ch', { yPercent: 115, rotation: 10 }, { yPercent: 0, rotation: 0, duration: 1, ease: 'expo.out', stagger: 0.03 }, 0.15)
        .fromTo(cupIn, { y: () => -innerHeight * 1.2, rotation: -34 }, { y: 0, rotation: 0, duration: 0.62, ease: 'power3.in' }, 0.1)
        .add(() => burstFrom(cupIn, 0.5, 0.2, JUICE.citrus, 40, 1.2), 0.72)
        .fromTo(cupIn, { scaleX: 1, scaleY: 1 }, { scaleY: 0.9, scaleX: 1.06, transformOrigin: '50% 100%', duration: 0.1, ease: 'power2.out' }, 0.72)
        .to(cupIn, { scaleY: 1, scaleX: 1, duration: 0.9, ease: 'elastic.out(1,.3)' }, 0.82)
        .add(() => mascot.enter('hero'), 1.15)
        .fromTo('.splash', { scale: 0, rotation: -50, autoAlpha: 0 }, { scale: 1, rotation: 0, autoAlpha: 0.9, duration: 1, ease: 'expo.out' }, 0.72)
        .fromTo('.gi', {
          x: (_, el: Element) => (el.getBoundingClientRect().left < innerWidth / 2 ? -1 : 1) * innerWidth * 0.5,
          y: i => (i % 2 ? 1 : -1) * innerHeight * 0.4, rotation: i => (i % 2 ? 1 : -1) * 200, scale: 0.3,
        }, { x: 0, y: 0, rotation: 0, scale: 1, duration: 1.3, ease: 'expo.out', stagger: 0.05 }, 0.35)
        .fromTo('.hero-kick, .hero-ui > *', { y: 40, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.7, ease: 'expo.out', stagger: 0.06 }, 0.9);
    }

    // pointer depth, and the cup leans toward the pointer
    if (FINE && !RM) {
      const layers = q<HTMLElement>('.par[data-d]').map(el => ({
        x: gsap.quickTo(el, 'x', { duration: 0.9, ease: 'power3' }), y: gsap.quickTo(el, 'y', { duration: 0.9, ease: 'power3' }), d: +el.dataset.d!,
      }));
      const lean = gsap.quickTo(q('.cup-tilt')[0], 'rotation', { duration: 0.8, ease: 'power3' });
      const move = (e: PointerEvent) => {
        const nx = e.clientX / innerWidth - 0.5, ny = e.clientY / innerHeight - 0.5;
        layers.forEach(l => { l.x(clamp(-nx * 34 * l.d, -40, 40)); l.y(clamp(-ny * 34 * l.d, -40, 40)); });
        lean(nx * 7);
      };
      root.current!.addEventListener('pointermove', move);
    }

    if (RM) return;

    // scroll: the headline splits, the cup grows, front fruit flies past the camera, then a white circle opens out of the sun
    const side = (el: Element) => { const r = el.getBoundingClientRect(); return r.left + r.width / 2 < innerWidth / 2 ? -1 : 1; };
    const vside = (el: HTMLElement) => (el.offsetTop + el.offsetHeight / 2 < root.current!.offsetHeight / 2 ? -1 : 1);
    gsap.timeline({ scrollTrigger: { trigger: root.current, start: 'top top', end: '+=160%', pin: true, scrub: 1, invalidateOnRefresh: true } })
      .fromTo('.hl-1', { xPercent: 0 }, { xPercent: -130, ease: 'power2.in', duration: 0.6 }, 0)
      .fromTo('.hl-2', { xPercent: 0 }, { xPercent: 130, ease: 'power2.in', duration: 0.6 }, 0)
      .fromTo('.cup', { scale: 1, rotation: 0, yPercent: 0 }, { scale: 2.6, rotation: 10, yPercent: 16, ease: 'power2.in', duration: 0.7 }, 0)
      .fromTo('.g-front .gs', { x: 0, y: 0, scale: 1, rotation: 0 }, {
        x: (_, el: Element) => side(el) * innerWidth * 0.6, y: (_, el: Element) => vside(el.closest('.par') as HTMLElement) * innerHeight * 0.5,
        scale: 3, rotation: i => (i % 2 ? -1 : 1) * 150, ease: 'power2.in', duration: 0.6,
      }, 0)
      .fromTo('.rb-scroll', { x: 0, y: 0, scale: 1, rotation: 0 }, { x: () => (NARROW() ? 1 : -1) * innerWidth * 0.45, y: () => innerHeight * 0.25, scale: 2.2, rotation: () => (NARROW() ? 18 : -18), ease: 'power2.in', duration: 0.6 }, 0)
      .fromTo('.g-back .gs', { y: 0, scale: 1 }, { y: () => -innerHeight * 0.25, scale: 0.75, ease: 'none', duration: 0.7 }, 0)
      .fromTo('.hero-bg', { scale: 1 }, { scale: 1.2, ease: 'none', duration: 1 }, 0)
      .fromTo('.splash-pos', { scale: 1, autoAlpha: 1 }, { scale: 2.4, autoAlpha: 0, ease: 'power2.in', duration: 0.5 }, 0)
      .fromTo('.hero-ui, .hero-kick-wrap', { autoAlpha: 1, y: 0 }, { autoAlpha: 0, y: 40, duration: 0.2 }, 0)
      .fromTo('.wipe', { clipPath: 'circle(0% at 50% 55%)' }, { clipPath: 'circle(150% at 50% 55%)', ease: 'power2.inOut', duration: 0.5 }, 0.5)
      .fromTo('.wipe .rays', { rotation: 0 }, { rotation: 120, ease: 'none', duration: 0.5 }, 0.5);
  }, { scope: root });

  useEffect(() => { if (revealed) intro.current?.play(); }, [revealed]);

  return (
    <section id="hero" className="hero" ref={root}>
      <div className="hero-bg" aria-hidden="true">
        <div className="hero-bg-in">
          <div className="rays turn-60" />
          <div className="hero-dot halftone" />
          <div className="sun" />
          <RingText className="sunring" text={HERO.ring} />
        </div>
      </div>

      <Layer back d={0.2} style={{ bottom: '21%', left: '3%', width: 'clamp(110px, 14vw, 230px)' }}><Sticker id="rainbow" /></Layer>
      <Layer back d={0.3} style={{ top: '28%', left: '11%', width: 'clamp(80px, 10vw, 170px)' }}><img src="/img/melon.webp" alt="" style={{ rotate: '-18deg' }} /></Layer>
      <Layer back d={0.25} style={{ top: '30%', right: '15%', width: 'clamp(46px, 5.5vw, 92px)' }}><img src="/img/pineapple.webp" alt="" style={{ rotate: '14deg' }} /></Layer>
      <Layer back d={0.35} style={{ top: '11%', left: '40%', width: 'clamp(30px, 3.4vw, 54px)' }}><Sticker id="daisy" className="turn" color="#FF2E7E" /></Layer>
      <Layer back d={0.4} style={{ top: '27%', left: '20%', width: 'clamp(60px, 7vw, 110px)' }}><Sticker id="squiggle" color="#FF2E7E" style={{ rotate: '-24deg' }} /></Layer>

      <div className="splash-pos" aria-hidden="true"><img className="splash" src="/img/splash.webp" alt="" /></div>
      <div className="cup-pos">
        <div className="cup"><div className="cup-tilt"><div className="cup-in"><img src="/img/cup-orange.webp" alt="A cup of fresh orange juice with a striped straw" /></div></div></div>
      </div>

      {/* the rabbit: in front of the cup's lower edge (own wrappers: .par pointer depth > .rb-scroll scroll) */}
      <div className="par hero-rabbit" data-d="0.7"><div className="rb-scroll"><MascotSlot id="hero" /></div></div>

      <div className="hero-kick-wrap"><p className="kick hero-kick">{HERO.kicker}</p></div>
      <h1 className="hl-wrap" aria-label={`${HERO.line1} ${HERO.line2}`}>
        <span className="hl hl-1 stripe"><Chars text={HERO.line1} /></span>
        <span className="hl hl-2 pop wavy"><Chars text={HERO.line2} /></span>
      </h1>

      <Layer d={1.2} style={{ top: '12%', right: '6%', width: 'clamp(90px, 12vw, 200px)' }}><img src="/img/orange-half.webp" alt="" style={{ rotate: '16deg' }} /></Layer>
      <Layer d={1.5} style={{ top: '46%', left: '21%', width: 'clamp(44px, 5vw, 84px)' }}><img src="/img/strawberry.webp" alt="" style={{ rotate: '-20deg' }} /></Layer>
      <Layer d={1.3} style={{ bottom: '22%', left: '5%', width: 'clamp(90px, 10vw, 150px)' }}><Sticker id="badge6" className="bob" /></Layer>
      <Layer d={1.8} style={{ top: '60%', right: '31%', width: 'clamp(30px, 3.6vw, 60px)' }}><Sticker id="leaf" style={{ rotate: '40deg' }} /></Layer>
      <Layer d={2.1} style={{ top: '24%', left: '57%', width: 'clamp(18px, 2vw, 32px)' }}><Sticker id="sparkle" className="twinkle" color="#FFC300" /></Layer>
      <Layer d={2.3} style={{ top: '40%', left: '33%', width: 'clamp(14px, 1.5vw, 24px)' }}><Sticker id="sparkle" className="twinkle d1" color="#FF2E7E" /></Layer>
      <Layer d={1.9} style={{ top: '20%', right: '24%', width: 'clamp(16px, 1.8vw, 28px)' }}><Sticker id="sparkle" className="twinkle d2" color="#FF6A13" /></Layer>
      <Layer d={1.6} style={{ bottom: '34%', right: '5%', width: 'clamp(40px, 4.4vw, 70px)' }}><Sticker id="daisy" className="turn" color="#FF6A13" /></Layer>
      <Layer d={1.4} style={{ bottom: '30%', right: '13%', width: 'clamp(50px, 6vw, 96px)' }}><Sticker id="squiggle" color="#7ED321" style={{ rotate: '12deg' }} /></Layer>

      <Waves className="hero-waves" />

      <div className="hero-ui">
        <div className="meta">
          {HERO.facts.map(f => <span key={f} className="pill">{f}</span>)}
          <span className="pill hot">{HERO.hot}</span>
        </div>
        <span className="cue">{HERO.cue} ↓</span>
        <a className="btn mag" {...linkTo(go, 'order')}>{HERO.cta}</a>
      </div>

      {!RM && (
        <div className="wipe" aria-hidden="true">
          <div className="rays" />
          <p className="kick pink">{WIPE.kicker}</p>
          <p className="wipe-title stripe">{WIPE.title}</p>
        </div>
      )}
    </section>
  );
}
