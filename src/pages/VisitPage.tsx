import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap, RM } from '../lib/motion';
import { useIntro } from '../lib/intro';
import { openNow } from '../lib/bag';
import { linkTo, useRouter } from '../lib/router';
import { VISIT } from '../data/pages';
import { headIntro, PageHead } from '../components/PageHead';
import { Sticker } from '../components/Sprite';

/** Monday-first index of today (the hours list starts on Monday). */
const today = (new Date().getDay() + 6) % 7;

/** Street map of the corner, drawn as stickers: two streets, the stand as a sun pin, and a few landmarks. */
function CornerMap() {
  return (
    <svg className="map" viewBox="0 0 600 420" role="img" aria-label={`Map: the stand is on the ${VISIT.address.toLowerCase()}`}>
      <rect width="600" height="420" rx="34" fill="#FFF6E2" />
      <g fill="#FFE7A8">
        <rect x="30" y="30" width="200" height="130" rx="18" /><rect x="370" y="30" width="200" height="130" rx="18" />
        <rect x="30" y="260" width="200" height="130" rx="18" /><rect x="370" y="260" width="200" height="130" rx="18" />
      </g>
      <g className="map-park"><circle cx="470" cy="325" r="40" fill="#7ED321" opacity=".55" /><circle cx="520" cy="350" r="26" fill="#7ED321" opacity=".55" /></g>
      <path className="map-st" d="M0 210 H600" stroke="#FFFFFF" strokeWidth="76" />
      <path className="map-st" d="M300 0 V420" stroke="#FFFFFF" strokeWidth="76" />
      <path d="M0 210 H600 M300 0 V420" stroke="#FFC300" strokeWidth="3" strokeDasharray="14 12" fill="none" />
      <text x="70" y="204" className="map-label">SAMPLE ST</text>
      <text x="316" y="80" className="map-label" transform="rotate(90 316 80)">2ND AVE</text>
      <g className="map-bus"><rect x="390" y="174" width="44" height="22" rx="7" fill="#FF6A13" /><text x="412" y="190" textAnchor="middle" className="map-tiny">BUS</text></g>
      <g className="map-bike"><circle cx="210" cy="250" r="14" fill="#FF2E7E" /><text x="210" y="255" textAnchor="middle" className="map-tiny">P</text></g>
      <g className="map-pin">
        <circle cx="236" cy="146" r="40" fill="#FF2E7E" opacity=".18" className="map-pulse" />
        <path d="M236 176 C214 150 206 138 206 122 a30 30 0 0 1 60 0 C266 138 258 150 236 176 Z" fill="#FF2E7E" stroke="#3B1E08" strokeWidth="4" />
        <circle cx="236" cy="122" r="14" fill="#FFC300" />
      </g>
      <text x="236" y="80" textAnchor="middle" className="map-stand">RussRuss</text>
    </svg>
  );
}

/** Find the stand: the photo, address, opening hours with today lit up, the corner map and how to get there. */
export function VisitPage() {
  const root = useRef<HTMLDivElement>(null);
  const { go } = useRouter();
  const open = openNow();

  useIntro(root, () => headIntro(gsap.timeline()));

  useGSAP(() => {
    if (RM) return;
    gsap.fromTo('.hours li', { x: -40, autoAlpha: 0 }, { x: 0, autoAlpha: 1, duration: 0.6, ease: 'expo.out', stagger: 0.05, scrollTrigger: { trigger: '.hours', start: 'top 85%' } });
    gsap.fromTo('.map', { rotation: 6, scale: 0.85, autoAlpha: 0 }, { rotation: -1.5, scale: 1, autoAlpha: 1, duration: 1.1, ease: 'back.out(1.5)', scrollTrigger: { trigger: '.map', start: 'top 85%' } });
    gsap.fromTo('.map-pin', { y: -260 }, { y: 0, duration: 0.9, ease: 'bounce.out', delay: 0.4, scrollTrigger: { trigger: '.map', start: 'top 85%' } });
    gsap.fromTo('.way', { y: 50, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.8, ease: 'back.out(1.8)', stagger: 0.1, scrollTrigger: { trigger: '.ways', start: 'top 88%' } });
    gsap.fromTo('.vp-photo img', { scale: 1.2 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: '.vp-photo', start: 'top bottom', end: 'bottom top', scrub: true } });
  }, { scope: root });

  return (
    <div className="visit-page" ref={root}>
      <PageHead
        kicker={VISIT.kicker} title={VISIT.title} lede={VISIT.lede}
        aside={(
          <div className="vp-photo">
            <img src="/img/stand.webp" alt="The RussRuss stand: striped awning, crates of fruit and the counter" />
            <span className={`pill vp-open ${open ? 'hot' : ''}`}>{open ? 'Open now' : 'Closed now · opens at 7'}</span>
          </div>
        )}
      />

      <section className="vp-grid">
        <div className="vp-card">
          <p className="kick">Address</p>
          <p className="vp-addr">{VISIT.address}</p>
          <p className="vp-city">{VISIT.city} · sample address</p>
          <p className="kick vp-h">Hours</p>
          <ul className="hours">
            {VISIT.hours.map((h, i) => (
              <li key={h.day} className={i === today ? 'today' : ''}>
                <span>{h.day}{i === today && <em> · today</em>}</span>
                <b>{h.open} – {h.close}</b>
              </li>
            ))}
          </ul>
        </div>
        <div className="vp-map">
          <CornerMap />
          <Sticker id="sunicon" className="deco turn" color="#FFC300" style={{ right: -18, top: -22, width: 64 }} />
        </div>
      </section>

      <section className="ways" aria-label="Getting here">
        {VISIT.ways.map(w => (
          <div key={w.how} className="way">
            <span className="way-how">{w.how}</span>
            <p>{w.text}</p>
          </div>
        ))}
      </section>

      <section className="vp-cta">
        <p className="kick pink">Skip the line</p>
        <a className="btn big mag" {...linkTo(go, 'order')}>Order for pickup</a>
      </section>
    </div>
  );
}
