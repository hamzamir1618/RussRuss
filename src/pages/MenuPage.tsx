import { useRef, useState } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap, RM, vars } from '../lib/motion';
import { useIntro } from '../lib/intro';
import { burstFrom } from '../lib/burst';
import { useBag } from '../lib/bag';
import { linkTo, useRouter } from '../lib/router';
import { ADDONS, MENU, money, type Juice } from '../data/menu';
import { MENU_PAGE } from '../data/pages';
import { headIntro, PageHead } from '../components/PageHead';
import { RingText, Sticker } from '../components/Sprite';

/** One juice on the board: cup on a turning sun, number, recipe, both sizes with their own Add buttons. */
function Board({ juice, i }: { juice: Juice; i: number }) {
  const { add } = useBag();
  const { go } = useRouter();
  const [added, setAdded] = useState<number | null>(null);
  const timer = useRef<number>();
  return (
    <article className={`board-row ${i % 2 ? 'flip' : ''}`} data-juice style={vars({ '--fc': juice.tint })}>
      <a className="br-art" {...linkTo(go, 'juice', juice.id)} aria-label={`${juice.name}: ingredients and nutrition`}>
        <div className="br-sun"><div className="rays turn-40" /></div>
        <RingText className="br-ring turn-26" text={`${juice.name.toUpperCase()} • PRESSED AT 6 AM • 350 ML OR 1 LITRE • `} />
        <div className="br-cup"><img className="pour-src" src={juice.cup} alt="" /></div>
        {juice.garnish ? <img className="br-garn" src={juice.garnish} alt="" /> : <Sticker id="leaf" className="br-garn br-leaf" />}
      </a>
      <div className="br-copy">
        <span className="br-n" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
        <h2 className="br-name"><a {...linkTo(go, 'juice', juice.id)}>{juice.name}</a></h2>
        <p className="br-blurb">{juice.blurb}</p>
        <ul className="br-ing" aria-label="What goes in">
          {juice.ingredients.map(g => <li key={g.name}><b>{g.amount}</b> {g.name}</li>)}
        </ul>
        <div className="stats">{juice.stats.map(s => <span key={s}>{s}</span>)}</div>
        <div className="br-sizes">
          {juice.sizes.map(s => (
            <button
              key={s.ml} className="size-btn" type="button"
              onClick={e => {
                add(juice.id, s.ml);
                burstFrom(e.currentTarget, 0.5, 0, juice.juice, 24, 0.9);
                setAdded(s.ml);
                clearTimeout(timer.current);
                timer.current = window.setTimeout(() => setAdded(null), 1200);
              }}
            >
              <span>{s.label}</span>
              <b>{money(s.price)}</b>
              <i>{added === s.ml ? 'Added' : 'Add'}</i>
            </button>
          ))}
        </div>
        <a className="more" {...linkTo(go, 'juice', juice.id)}>Ingredients and nutrition →</a>
      </div>
    </article>
  );
}

/**
 * The full menu as a stand board: four big rows, alternating sides. Each row swings in as it reaches the screen;
 * the cups turn with scroll. Extras sit on a price-tag strip at the end, then the order button.
 */
export function MenuPage() {
  const root = useRef<HTMLDivElement>(null);
  const { go } = useRouter();
  const { count } = useBag();

  useIntro(root, () => headIntro(gsap.timeline()));

  useGSAP(() => {
    if (RM) return;
    gsap.utils.toArray<HTMLElement>('.board-row').forEach((row, i) => {
      const dir = i % 2 ? 1 : -1;
      gsap.fromTo(row.querySelector('.br-art'), { xPercent: dir * 40, rotation: dir * 18, autoAlpha: 0 },
        { xPercent: 0, rotation: 0, autoAlpha: 1, duration: 1.1, ease: 'back.out(1.4)', scrollTrigger: { trigger: row, start: 'top 80%' } });
      gsap.fromTo(row.querySelectorAll('.br-copy > *'), { y: 50, autoAlpha: 0 },
        { y: 0, autoAlpha: 1, duration: 0.8, ease: 'expo.out', stagger: 0.06, scrollTrigger: { trigger: row, start: 'top 75%' } });
      gsap.fromTo(row.querySelector('.br-cup'), { rotation: dir * -10, yPercent: 8 },
        { rotation: dir * 8, yPercent: -8, ease: 'none', scrollTrigger: { trigger: row, start: 'top bottom', end: 'bottom top', scrub: true } });
      gsap.fromTo(row.querySelector('.br-garn'), { rotation: -90, y: 40 },
        { rotation: 140, y: -60, ease: 'none', scrollTrigger: { trigger: row, start: 'top bottom', end: 'bottom top', scrub: true } });
    });
    gsap.fromTo('.tag', { y: 80, rotation: i => (i % 2 ? 14 : -14), autoAlpha: 0 },
      { y: 0, rotation: i => (i % 2 ? 3 : -3), autoAlpha: 1, duration: 0.9, ease: 'back.out(2)', stagger: 0.08, scrollTrigger: { trigger: '.tags', start: 'top 85%' } });
  }, { scope: root });

  return (
    <div className="menu-page" ref={root}>
      <PageHead
        kicker={MENU_PAGE.kicker} title={MENU_PAGE.title} lede={MENU_PAGE.lede}
        aside={<Sticker id="badge6" className="ph-badge bob" />}
      />
      <div className="boards">
        {MENU.map((j, i) => <Board key={j.id} juice={j} i={i} />)}
      </div>
      <section className="extras" aria-labelledby="extras-h">
        <h2 id="extras-h" className="kick">{MENU_PAGE.addonsTitle}</h2>
        <ul className="tags">
          {ADDONS.map(a => <li key={a.name} className="tag"><span>{a.name}</span><b>{a.price ? `+${money(a.price)}` : 'Free'}</b></li>)}
        </ul>
        <p className="extras-note">Ask at the window when you pick up. We don’t take extras online yet.</p>
        <a className="btn big mag" {...linkTo(go, 'order')}>{count ? `Order ${count} for pickup` : 'Order for pickup'}</a>
      </section>
    </div>
  );
}
