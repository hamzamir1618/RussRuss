import { useRef, useState } from 'react';
import { useGSAP } from '@gsap/react';
import { FINE, gsap, RM, vars } from '../lib/motion';
import { useIntro } from '../lib/intro';
import { burstFrom } from '../lib/burst';
import { useBag } from '../lib/bag';
import { linkTo, useRouter } from '../lib/router';
import { juiceById, MENU, money } from '../data/menu';
import { Chars } from '../components/Chars';
import { RingText, Sticker } from '../components/Sprite';

/**
 * One juice. The cup stands on its sun (the pour transition lands it there), the name rolls on a wavy baseline,
 * the recipe reads like the card at the stand, nutrition sits on four stickers. Pick a size and a count, add it,
 * and the next juice waits at the bottom.
 */
export function JuicePage({ id }: { id?: string }) {
  const juice = juiceById(id);
  const root = useRef<HTMLDivElement>(null);
  const { go } = useRouter();
  const { add, count } = useBag();
  const [ml, setMl] = useState(350);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const timer = useRef<number>();

  useIntro(root, () => {
    const tl = gsap.timeline();
    if (!juice) return tl.fromTo('.jp-missing > *', { y: 40, autoAlpha: 0 }, { y: 0, autoAlpha: 1, stagger: 0.08, duration: 0.7, ease: 'expo.out' });
    return tl
      .fromTo('.jp-sun', { scale: 0.6, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: 1.1, ease: 'expo.out' }, 0)
      .fromTo('.jp-name .ch', { yPercent: 120, rotation: 14 }, { yPercent: 0, rotation: 0, duration: 0.9, ease: 'expo.out', stagger: 0.035 }, 0.1)
      .fromTo('.jp-copy > :not(.jp-name)', { y: 40, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.8, ease: 'expo.out', stagger: 0.06 }, 0.25)
      .fromTo('.jp-garn', { scale: 0, rotation: -160 }, { scale: 1, rotation: 0, duration: 1, ease: 'back.out(2)' }, 0.35)
      .fromTo('.jp-stk', { scale: 0, rotation: -40 }, { scale: 1, rotation: 0, duration: 0.8, ease: 'back.out(2.4)', stagger: 0.07 }, 0.5);
  });

  useGSAP(() => {
    if (RM || !juice) return;
    // nutrition stickers and the recipe card land as they scroll in; the cup drifts up as you leave
    gsap.fromTo('.nut', { y: 70, rotation: i => (i % 2 ? 20 : -20), scale: 0.6, autoAlpha: 0 },
      { y: 0, rotation: i => (i % 2 ? 4 : -4), scale: 1, autoAlpha: 1, duration: 0.9, ease: 'back.out(2)', stagger: 0.08, scrollTrigger: { trigger: '.nuts', start: 'top 85%' } });
    gsap.fromTo('.recipe', { rotation: -6, y: 60, autoAlpha: 0 }, { rotation: -1.5, y: 0, autoAlpha: 1, duration: 1, ease: 'back.out(1.6)', scrollTrigger: { trigger: '.recipe', start: 'top 85%' } });
    gsap.fromTo('.jp-art', { yPercent: 0 }, { yPercent: -14, ease: 'none', scrollTrigger: { trigger: '.jp-hero', start: 'top top', end: 'bottom top', scrub: true } });
    gsap.fromTo('.next-cup', { rotation: -14 }, { rotation: 10, ease: 'none', scrollTrigger: { trigger: '.next', start: 'top bottom', end: 'bottom top', scrub: true } });

    // the cup leans toward the pointer
    if (FINE) {
      const lean = gsap.quickTo('.jp-tilt', 'rotation', { duration: 0.8, ease: 'power3' });
      const move = (e: PointerEvent) => lean((e.clientX / innerWidth - 0.5) * 10);
      addEventListener('pointermove', move);
      return () => removeEventListener('pointermove', move);
    }
  }, { scope: root });

  if (!juice) {
    return (
      <div className="juice-page" ref={root}>
        <div className="jp-missing">
          <p className="kick pink">Not on the board</p>
          <h1 className="ph-title stripe">Sold out?</h1>
          <p>We couldn’t find that juice. It may have come off the menu.</p>
          <a className="btn mag" {...linkTo(go, 'menu')}>See the menu</a>
        </div>
      </div>
    );
  }

  const i = MENU.indexOf(juice), next = MENU[(i + 1) % MENU.length];
  const size = juice.sizes.find(s => s.ml === ml) ?? juice.sizes[0];

  return (
    <div className="juice-page" ref={root} style={vars({ '--fc': juice.tint })}>
      <section className="jp-hero">
        <div className="jp-art">
          <div className="jp-sun" aria-hidden="true"><div className="rays turn-40" /><RingText className="jp-ring turn-26" text={`NO. ${String(i + 1).padStart(2, '0')} • ${juice.name.toUpperCase()} • COLD-PRESSED • `} /></div>
          <div className="jp-cup"><div className="jp-tilt"><img className="pour-dest" src={juice.cup} alt={juice.name} /></div></div>
          {juice.garnish ? <img className="jp-garn" src={juice.garnish} alt="" /> : <Sticker id="leaf" className="jp-garn jp-leaf" />}
          <Sticker id="sparkle" className="jp-stk twinkle" color="#FFFFFF" style={{ left: '14%', top: '20%', width: 30 }} />
          <Sticker id="sparkle" className="jp-stk twinkle d1" color="#FFC300" style={{ right: '16%', top: '58%', width: 22 }} />
          <Sticker id="daisy" className="jp-stk turn" color="#FF2E7E" style={{ left: '10%', bottom: '18%', width: 42 }} />
        </div>

        <div className="jp-copy">
          <a className="kick back" {...linkTo(go, 'menu')}>← The menu</a>
          <h1 className="jp-name pop wavy" aria-label={juice.name}><Chars text={juice.name} /></h1>
          <p className="jp-blurb">{juice.blurb}</p>
          <p className="jp-note">{juice.note}</p>

          <fieldset className="sizes">
            <legend className="kick">Size</legend>
            {juice.sizes.map(s => (
              <label key={s.ml} className={`size-opt ${s.ml === ml ? 'on' : ''}`}>
                <input type="radio" name="size" value={s.ml} checked={s.ml === ml} onChange={() => setMl(s.ml)} />
                <span>{s.label}</span><b>{money(s.price)}</b>
              </label>
            ))}
          </fieldset>

          <div className="buy">
            <div className="qty" role="group" aria-label="How many">
              <button type="button" onClick={() => setQty(q => Math.max(1, q - 1))} aria-label="One less">−</button>
              <output aria-live="polite">{qty}</output>
              <button type="button" onClick={() => setQty(q => Math.min(20, q + 1))} aria-label="One more">+</button>
            </div>
            <button
              className="btn mag" type="button"
              onClick={e => {
                for (let k = 0; k < qty; k++) add(juice.id, ml);
                burstFrom(e.currentTarget, 0.5, 0, juice.juice, 34, 1.1);
                setAdded(true);
                clearTimeout(timer.current);
                timer.current = window.setTimeout(() => setAdded(false), 1400);
              }}
            >
              {added ? 'Added to the bag' : `Add · ${money(size.price * qty)}`}
            </button>
          </div>
          {count > 0 && <a className="more" {...linkTo(go, 'order')}>Bag has {count}. Order for pickup →</a>}
        </div>
      </section>

      <section className="jp-facts">
        <div className="recipe">
          <p className="kick">What goes in a 350 ml cup</p>
          <ul>
            {juice.ingredients.map(g => <li key={g.name}><span>{g.name}</span><i aria-hidden="true" /><b>{g.amount}</b></li>)}
          </ul>
          <p className="recipe-foot">Pressed cold, never heated. Nothing added.</p>
        </div>
        <div className="nuts-wrap">
          <p className="kick">Per 350 ml</p>
          <ul className="nuts">
            {juice.nutrition.map(n => <li key={n.label} className="nut"><b>{n.value}</b><span>{n.label}</span></li>)}
          </ul>
          <p className="fine">Sample values until the stand confirms its recipes.</p>
        </div>
      </section>

      <a className="next" data-juice style={vars({ '--nc': next.tint })} {...linkTo(go, 'juice', next.id)}>
        <span className="kick">Next on the board</span>
        <span className="next-name stripe">{next.name}</span>
        <img className="next-cup pour-src" src={next.cup} alt="" />
      </a>
    </div>
  );
}
