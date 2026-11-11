import { useEffect, useMemo, useRef } from 'react';
import { gsap } from '../lib/motion';
import { useIntro } from '../lib/intro';
import { icsFor, prettyDay, prettyTime, useBag } from '../lib/bag';
import { linkTo, useRouter } from '../lib/router';
import { money } from '../data/menu';
import { ADDRESS } from '../data/copy';
import { DONE } from '../data/pages';
import { Sticker } from '../components/Sprite';
import { Waves } from '../components/Waves';

/**
 * The pickup ticket: a cup sleeve with the pickup code in Monoton, the time, what's in it and the total,
 * stamped PRESSED. Adds the pickup to a calendar. Says plainly that nothing was sent anywhere.
 */
export function ConfirmPage() {
  const root = useRef<HTMLDivElement>(null);
  const { go } = useRouter();
  const { placed } = useBag();

  // calendar file, built in the browser
  const ics = useMemo(() => (placed ? URL.createObjectURL(new Blob([icsFor(placed)], { type: 'text/calendar' })) : ''), [placed]);
  useEffect(() => () => { if (ics) URL.revokeObjectURL(ics); }, [ics]);

  useIntro(root, () => {
    const tl = gsap.timeline();
    if (!placed) return tl.fromTo('.cf-missing > *', { y: 40, autoAlpha: 0 }, { y: 0, autoAlpha: 1, stagger: 0.08, duration: 0.7, ease: 'expo.out' });
    return tl
      .fromTo('.ticket', { yPercent: 60, rotation: 10, autoAlpha: 0 }, { yPercent: 0, rotation: -2, autoAlpha: 1, duration: 1, ease: 'back.out(1.5)' }, 0)
      .fromTo('.tk-code .ch', { yPercent: 120 }, { yPercent: 0, duration: 0.7, ease: 'expo.out', stagger: 0.05 }, 0.35)
      .fromTo('.tk-stamp', { scale: 3, rotation: -40, autoAlpha: 0 }, { scale: 1, rotation: -14, autoAlpha: 1, duration: 0.35, ease: 'power4.in' }, 0.8)
      .fromTo('.ticket', { x: -10 }, { x: 0, duration: 0.6, ease: 'elastic.out(1,.25)' }, 1.15)
      .fromTo('.cf-side > *', { y: 40, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.7, ease: 'expo.out', stagger: 0.07 }, 0.6)
      .fromTo('.cf-deco', { scale: 0, rotation: -90 }, { scale: 1, rotation: 0, duration: 0.8, ease: 'back.out(2.2)', stagger: 0.06 }, 0.9);
  }, 0.5);

  if (!placed) {
    return (
      <div className="confirm-page" ref={root}>
        <div className="cf-missing">
          <p className="kick pink">No order yet</p>
          <h1 className="ph-title stripe">Nothing pressed</h1>
          <p>There’s no order in this tab. Orders live in the page until it’s refreshed, since nothing is sent to the stand yet.</p>
          <a className="btn mag" {...linkTo(go, 'order')}>Start an order</a>
        </div>
      </div>
    );
  }

  const code = placed.code.replace('RR-', '');

  return (
    <div className="confirm-page" ref={root}>
      <div className="cf-bg" aria-hidden="true">
        <div className="rays turn-60" />
        <Sticker id="sparkle" className="deco cf-deco" color="#FFC300" style={{ left: '10%', top: '22%', width: 34 }} />
        <Sticker id="daisy" className="deco cf-deco" color="#FF2E7E" style={{ right: '12%', top: '18%', width: 46 }} />
        <Sticker id="rainbow" className="deco cf-deco" style={{ left: '6%', bottom: '14%', width: 140 }} />
        <Sticker id="squiggle" className="deco cf-deco" color="#7ED321" style={{ right: '8%', bottom: '22%', width: 90 }} />
      </div>

      <div className="cf">
        <article className="ticket" aria-label={`Pickup ticket ${placed.code}`}>
          <p className="kick">{DONE.kicker} · {placed.name}</p>
          <p className="tk-label">Your pickup code</p>
          <p className="tk-code" aria-label={placed.code}>
            <span className="tk-rr">RR</span>
            <span className="word" aria-hidden="true">{[...code].map((c, i) => <span key={i} className="ch">{c}</span>)}</span>
          </p>
          <p className="tk-when"><b>{prettyTime(placed.time)}</b> {prettyDay(placed.time)}</p>
          <p className="tk-where">{ADDRESS}</p>
          <ul className="tk-lines">
            {placed.lines.map(l => <li key={l.key}><span>{l.qty} × {l.juice.name} <em>{l.ml === 350 ? '350 ml' : '1 L'}</em></span><b>{money(l.price * l.qty)}</b></li>)}
          </ul>
          <p className="tk-total"><span>Pay at the stand</span><b>{money(placed.total)}</b></p>
          <div className="tk-stamp" aria-hidden="true">{DONE.stamp}</div>
          <Waves className="tk-waves" />
        </article>

        <div className="cf-side">
          <h1 className="cf-title stripe">See you at {prettyTime(placed.time)}.</h1>
          <p>Say the code or your name at the window. We start pressing about 15 minutes before your time{placed.phone ? ' and text you when it’s on the counter' : ''}.</p>
          <div className="cf-actions">
            <a className="btn mag" href={ics} download={`russruss-${placed.code}.ics`}>Add to calendar</a>
            <a className="btn ghost" {...linkTo(go, 'visit')}>How to find us</a>
          </div>
          <a className="more" {...linkTo(go, 'menu')}>Start another order →</a>
          <p className="proto">{DONE.proto}</p>
        </div>
      </div>
    </div>
  );
}
